from __future__ import annotations

import csv
import io
import json
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any

from flask import Flask, Response, jsonify, request, send_from_directory
from skimage import io as skio
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.analyzer import Analyzer, AnalyzerSettings, PlateletThresholds, Thresholds
from core.fft_analyzer import (
    FftAnalysisError,
    FftAnalysisSettings,
    analyze_fft_roi,
    apply_ifft_roi_settings,
    measure_profile_peak_pair,
)
from core.rectangle_seed import SeedDetectorConfig, build_seed_from_points, detect_rectangles_with_seed
from core.scale_bar import scale_bar_exclusion_top

FRONTEND_DIR = PROJECT_ROOT / "frontend"

app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff"}
RESULT_STORE: dict[str, list[float]] = {}


def _allowed(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS


def _form_float(name: str, default: float) -> float:
    raw = request.form.get(name, str(default)).strip()
    try:
        return float(raw)
    except ValueError as exc:
        raise ValueError(f"Invalid number for '{name}': {raw}") from exc


def _form_int(name: str, default: int) -> int:
    raw = request.form.get(name, str(default)).strip()
    try:
        return int(raw)
    except ValueError as exc:
        raise ValueError(f"Invalid integer for '{name}': {raw}") from exc


def _form_float_any(names: tuple[str, ...], default: float) -> float:
    for name in names:
        raw = request.form.get(name)
        if raw is None:
            continue
        raw = raw.strip()
        if not raw:
            continue
        try:
            return float(raw)
        except ValueError as exc:
            raise ValueError(f"Invalid number for '{name}': {raw}") from exc
    return default


def _form_int_any(names: tuple[str, ...], default: int) -> int:
    for name in names:
        raw = request.form.get(name)
        if raw is None:
            continue
        raw = raw.strip()
        if not raw:
            continue
        try:
            return int(raw)
        except ValueError as exc:
            raise ValueError(f"Invalid integer for '{name}': {raw}") from exc
    return default


def _read_config() -> tuple[float, str, str, Thresholds | PlateletThresholds, AnalyzerSettings]:
    known_nm = _form_float("known_nm", 100.0)
    if known_nm <= 0:
        raise ValueError("known_nm must be > 0.")

    sb_color = request.form.get("sb_color", "white").strip().lower()
    if sb_color not in {"white", "black"}:
        raise ValueError("sb_color must be 'white' or 'black'.")

    target_shape = request.form.get("target_shape", "spherical").strip().lower()
    if target_shape == "spherical":
        thresholds: Thresholds | PlateletThresholds = Thresholds(
            min_nm=_form_float("min_nm", 3.5),
            max_nm=_form_float("max_nm", 9.0),
            ecc_max=_form_float("ecc_max", 0.7),
            sol_min=_form_float("sol_min", 0.5),
        )
        if thresholds.min_nm <= 0 or thresholds.max_nm <= thresholds.min_nm:
            raise ValueError("Check min_nm/max_nm range.")
    elif target_shape == "platelet":
        thresholds = PlateletThresholds(
            min_length_nm=_form_float("platelet_min_length_nm", 3.0),
            max_length_nm=_form_float("platelet_max_length_nm", 15.0),
            aspect_min=_form_float("platelet_aspect_min", 1.8),
            ecc_min=_form_float("platelet_ecc_min", 0.65),
            extent_min=_form_float("platelet_extent_min", 0.35),
            sol_min=_form_float("platelet_sol_min", 0.35),
            min_area_px=_form_int("platelet_min_area_px", 35),
            split_min_distance_px=_form_int("platelet_split_min_distance_px", 5),
        )
        if thresholds.min_length_nm <= 0 or thresholds.max_length_nm <= thresholds.min_length_nm:
            raise ValueError("Check platelet_min_length_nm/platelet_max_length_nm range.")
    else:
        raise ValueError("target_shape must be 'spherical' or 'platelet'.")

    if target_shape == "spherical":
        settings = AnalyzerSettings(
            sb_color=sb_color,
            sb_region_ratio=_form_float("sb_region_ratio", 0.85),
            white_thr=_form_int("white_thr", 245),
            black_thr=_form_int("black_thr", 10),
            sb_min_area=_form_int("sb_min_area", 200),
            crop_bottom_px=_form_int("crop_bottom_px", 150),
            gamma=_form_float("gamma", 0.7),
            gauss_sigma=_form_float("gauss_sigma", 1.0),
            adapthist_clip=_form_float("adapthist_clip", 0.02),
            adapthist_tiles=(
                _form_int("adapthist_tile_y", 4),
                _form_int("adapthist_tile_x", 4),
            ),
            dot_min_area_px=_form_int("dot_min_area_px", 30),
            boundary_expand_px=_form_float("boundary_expand_px", 0.0),
        )
        if settings.dot_min_area_px <= 0:
            raise ValueError("dot_min_area_px must be > 0.")
        if settings.boundary_expand_px < 0:
            raise ValueError("boundary_expand_px must be >= 0.")
    else:
        settings = AnalyzerSettings(
            sb_color=sb_color,
            sb_region_ratio=_form_float_any(("platelet_sb_region_ratio", "sb_region_ratio"), 0.85),
            white_thr=_form_int_any(("platelet_white_thr", "white_thr"), 245),
            black_thr=_form_int_any(("platelet_black_thr", "black_thr"), 30),
            sb_min_area=_form_int_any(("platelet_sb_min_area", "sb_min_area"), 200),
            crop_bottom_px=_form_int_any(("platelet_crop_bottom_px", "crop_bottom_px"), 150),
            gamma=_form_float_any(("platelet_gamma", "gamma"), 0.08),
            gauss_sigma=_form_float_any(("platelet_gauss_sigma", "gauss_sigma"), 0.45),
            adapthist_clip=_form_float_any(("platelet_adapthist_clip", "adapthist_clip"), 0.02),
            adapthist_tiles=(
                _form_int_any(("platelet_adapthist_tile_y", "adapthist_tile_y"), 4),
                _form_int_any(("platelet_adapthist_tile_x", "adapthist_tile_x"), 4),
            ),
        )
    return known_nm, sb_color, target_shape, thresholds, settings


def _read_rectangle_seed_points() -> list[tuple[float, float]]:
    raw = (
        request.form.get("rectangle_seed_points")
        or request.form.get("platelet_seed_points")
        or ""
    ).strip()
    if not raw:
        return []
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("rectangle_seed_points must be valid JSON.") from exc

    if not isinstance(payload, list) or len(payload) != 4:
        raise ValueError("rectangle_seed_points must contain exactly four [x, y] points.")

    points: list[tuple[float, float]] = []
    for point in payload:
        if not isinstance(point, (list, tuple)) or len(point) != 2:
            raise ValueError("Each rectangle seed point must be [x, y].")
        x, y = float(point[0]), float(point[1])
        points.append((x, y))
    return points


def _read_fft_roi() -> dict[str, Any]:
    raw = request.form.get("roi_json", "").strip()
    if not raw:
        raise ValueError("roi_json is required.")
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("roi_json must be valid JSON.") from exc
    if not isinstance(payload, dict):
        raise ValueError("roi_json must be an object.")
    return payload


def _read_optional_nm_per_pixel() -> float | None:
    raw = request.form.get("nm_per_pixel")
    if raw is None or not raw.strip():
        return None
    try:
        value = float(raw)
    except ValueError as exc:
        raise ValueError(f"Invalid number for 'nm_per_pixel': {raw}") from exc
    if value <= 0:
        raise ValueError("nm_per_pixel must be > 0.")
    return value


def _read_optional_fft_peak_pair() -> list[dict[str, Any]] | None:
    raw = request.form.get("manual_peak_pair_json") or request.form.get("peak_pair_json")
    if raw is None or not raw.strip():
        return None
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError("manual_peak_pair_json must be valid JSON.") from exc
    if not isinstance(payload, list):
        raise ValueError("manual_peak_pair_json must be a list.")
    return payload


def _read_fft_analysis_settings() -> FftAnalysisSettings:
    radius = _form_int("inverse_peak_mask_radius_px", 12)
    radius = max(3, min(30, radius))
    mode = request.form.get("ifft_mode", "pair_plus_dc").strip().lower()
    if mode not in {"pair_only", "pair_plus_dc"}:
        raise ValueError("ifft_mode must be 'pair_only' or 'pair_plus_dc'.")
    dc_radius = _form_int("ifft_dc_radius_px", 4)
    dc_radius = max(1, min(20, dc_radius))
    return FftAnalysisSettings(
        inverse_peak_mask_radius_px=radius,
        ifft_mode=mode,
        ifft_dc_radius_px=dc_radius,
    )


def _read_json_request_body() -> dict[str, Any]:
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        raise ValueError("Request body must be a JSON object.")
    return payload


def _mean_std(values: list[float]) -> tuple[float | None, float | None]:
    if not values:
        return None, None
    mean = sum(values) / len(values)
    variance = sum((value - mean) ** 2 for value in values) / len(values)
    return mean, variance ** 0.5


def _image_result_payload(
    *,
    name: str,
    mode: str,
    result: Any,
    detector_method: str,
) -> dict[str, Any]:
    return {
        "name": name,
        "mode": mode,
        "count": result.count,
        "mean_nm": result.mean_nm,
        "std_nm": result.std_nm,
        "values_nm": result.values_nm,
        "short_mean_nm": result.short_mean_nm,
        "short_std_nm": result.short_std_nm,
        "short_values_nm": result.short_values_nm or [],
        "circles": result.circles,
        "circle_annotations": result.circle_annotations,
        "boxes": result.boxes,
        "rotated_boxes": result.rotated_boxes,
        "rectangle_seed_points": [],
        "rectangle_seed_summary": None,
        "rectangle_annotations": [],
        "detector_method": detector_method,
        "scale_bar_box": result.scale_bar_box,
        "nm_per_pixel": result.nm_per_pixel,
        "error": None,
    }


def _rectangle_seed_payload(
    *,
    name: str,
    image_path: Path,
    known_nm: float,
    sb_color: str,
    settings: AnalyzerSettings,
    seed_points: list[tuple[float, float]],
) -> dict[str, Any]:
    analyzer = Analyzer(settings=settings)
    image = skio.imread(image_path)
    gray = analyzer._to_gray(image)
    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar_platelet(gray, known_nm, sb_color)
    seed = build_seed_from_points(seed_points, gray)
    candidates = detect_rectangles_with_seed(
        gray,
        nm_per_pixel,
        seed,
        SeedDetectorConfig(
            crop_bottom_px=settings.crop_bottom_px,
            exclude_from_y_px=scale_bar_exclusion_top(
                gray.shape[0],
                scale_bar_box,
                settings.crop_bottom_px,
            ),
            gamma=settings.gamma,
            gauss_sigma=settings.gauss_sigma,
            adapthist_clip=settings.adapthist_clip,
            adapthist_tiles=settings.adapthist_tiles,
        ),
    )

    values_nm = [candidate.length_nm for candidate in candidates]
    short_values_nm = [candidate.width_nm for candidate in candidates]
    mean_nm, std_nm = _mean_std(values_nm)
    short_mean_nm, short_std_nm = _mean_std(short_values_nm)
    boxes = [
        [
            candidate.bbox[0],
            candidate.bbox[1],
            candidate.bbox[2] - candidate.bbox[0],
            candidate.bbox[3] - candidate.bbox[1],
        ]
        for candidate in candidates
    ]
    rotated_boxes = [candidate.polygon for candidate in candidates]
    annotations = [
        {
            "id": f"rect-{index + 1}",
            "index": index,
            "geometry_type": "rotated_rectangle",
            "source": "rectangle_seed_auto",
            "accepted": True,
            "score": candidate.score,
            "threshold": candidate.threshold,
            "length_nm": candidate.length_nm,
            "width_nm": candidate.width_nm,
            "aspect": candidate.aspect,
            "center_px": candidate.center,
            "polygon_px": candidate.polygon,
            "bbox_px": boxes[index],
            "component_area_px": candidate.area_px,
            "extent": candidate.extent,
            "solidity": candidate.solidity,
            "eccentricity": candidate.eccentricity,
        }
        for index, candidate in enumerate(candidates)
    ]

    return {
        "name": name,
        "mode": "platelet",
        "count": len(values_nm),
        "mean_nm": mean_nm,
        "std_nm": std_nm,
        "values_nm": values_nm,
        "short_mean_nm": short_mean_nm,
        "short_std_nm": short_std_nm,
        "short_values_nm": short_values_nm,
        "circles": [],
        "circle_annotations": [],
        "boxes": boxes,
        "rotated_boxes": rotated_boxes,
        "rectangle_seed_points": seed.points,
        "rectangle_seed_summary": {
            "length_px": seed.length_px,
            "width_px": seed.width_px,
            "aspect": seed.aspect,
            "contrast": seed.contrast,
            "dark_on_light": seed.dark_on_light,
        },
        "rectangle_annotations": annotations,
        "detector_method": "rectangle_seed",
        "scale_bar_box": scale_bar_box,
        "nm_per_pixel": nm_per_pixel,
        "error": None,
    }


@app.get("/")
def index() -> Response:
    return send_from_directory(FRONTEND_DIR, "tem.html")


@app.get("/health")
def health() -> Response:
    return jsonify({"status": "ok"})


@app.post("/api/analyze")
def analyze() -> Response:
    files = request.files.getlist("images")
    image_files: list[FileStorage] = [f for f in files if f and f.filename]
    if not image_files:
        return jsonify({"error": "No uploaded images found."}), 400

    for file in image_files:
        if not _allowed(file.filename):
            return jsonify({"error": f"Unsupported file type: {file.filename}"}), 400

    try:
        known_nm, sb_color, target_shape, thresholds, settings = _read_config()
        rectangle_seed_points = _read_rectangle_seed_points()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    analyzer = Analyzer(settings=settings)
    per_image_results: list[dict[str, Any]] = []
    total_values: list[float] = []

    with tempfile.TemporaryDirectory(prefix="tem_web_") as tmpdir:
        temp_dir = Path(tmpdir)
        for file in image_files:
            safe_name = secure_filename(file.filename or "image")
            unique_name = f"{uuid.uuid4().hex}_{safe_name}"
            save_path = temp_dir / unique_name
            file.save(save_path)

            try:
                if target_shape == "platelet" and rectangle_seed_points:
                    payload = _rectangle_seed_payload(
                        name=file.filename or safe_name,
                        image_path=save_path,
                        known_nm=known_nm,
                        sb_color=sb_color,
                        settings=settings,
                        seed_points=rectangle_seed_points,
                    )
                else:
                    result = analyzer.analyze_image(
                        str(save_path),
                        known_nm=known_nm,
                        thresholds=thresholds,
                        sb_color=sb_color,
                    )
                    payload = _image_result_payload(
                        name=file.filename or safe_name,
                        mode=target_shape,
                        result=result,
                        detector_method="current_python",
                    )
                total_values.extend(payload["values_nm"])
                per_image_results.append(payload)
            except Exception as exc:  # noqa: BLE001
                per_image_results.append(
                    {
                        "name": file.filename,
                        "mode": target_shape,
                        "count": 0,
                        "mean_nm": None,
                        "std_nm": None,
                        "values_nm": [],
                        "short_mean_nm": None,
                        "short_std_nm": None,
                        "short_values_nm": [],
                        "circles": [],
                        "circle_annotations": [],
                        "boxes": [],
                        "rotated_boxes": [],
                        "rectangle_seed_points": [],
                        "rectangle_seed_summary": None,
                        "rectangle_annotations": [],
                        "detector_method": None,
                        "scale_bar_box": None,
                        "nm_per_pixel": None,
                        "error": str(exc),
                    }
                )

    result_id = uuid.uuid4().hex
    RESULT_STORE[result_id] = total_values

    return jsonify(
        {
            "result_id": result_id,
            "total_count": len(total_values),
            "results": per_image_results,
        }
    )


@app.post("/api/fft")
def analyze_fft() -> Response:
    file = request.files.get("image")
    if not file or not file.filename:
        return jsonify({"error": "No uploaded image found."}), 400
    if not _allowed(file.filename):
        return jsonify({"error": f"Unsupported file type: {file.filename}"}), 400

    try:
        roi_payload = _read_fft_roi()
        known_nm = _form_float("known_nm", 100.0)
        sb_color = request.form.get("sb_color", "white").strip().lower()
        if sb_color not in {"white", "black"}:
            raise ValueError("sb_color must be 'white' or 'black'.")
        nm_per_pixel = _read_optional_nm_per_pixel()
        manual_peak_pair = _read_optional_fft_peak_pair()
        fft_settings = _read_fft_analysis_settings()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    with tempfile.TemporaryDirectory(prefix="tem_fft_") as tmpdir:
        safe_name = secure_filename(file.filename or "image")
        save_path = Path(tmpdir) / f"{uuid.uuid4().hex}_{safe_name}"
        file.save(save_path)
        try:
            image = skio.imread(save_path)
            payload = analyze_fft_roi(
                image,
                roi_payload,
                known_nm=known_nm,
                sb_color=sb_color,
                nm_per_pixel_override=nm_per_pixel,
                manual_peak_pair=manual_peak_pair,
                fft_settings=fft_settings,
            )
        except (FftAnalysisError, ValueError) as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:  # noqa: BLE001
            return jsonify({"error": str(exc)}), 500

    payload["name"] = file.filename
    return jsonify(payload)


@app.post("/api/fft/ifft")
def apply_ifft() -> Response:
    file = request.files.get("image")
    if not file or not file.filename:
        return jsonify({"error": "No uploaded image found."}), 400
    if not _allowed(file.filename):
        return jsonify({"error": f"Unsupported file type: {file.filename}"}), 400

    try:
        roi_payload = _read_fft_roi()
        known_nm = _form_float("known_nm", 100.0)
        sb_color = request.form.get("sb_color", "white").strip().lower()
        if sb_color not in {"white", "black"}:
            raise ValueError("sb_color must be 'white' or 'black'.")
        nm_per_pixel = _read_optional_nm_per_pixel()
        peak_pair = _read_optional_fft_peak_pair()
        if not peak_pair:
            raise ValueError("manual_peak_pair_json is required.")
        fft_settings = _read_fft_analysis_settings()
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    with tempfile.TemporaryDirectory(prefix="tem_ifft_") as tmpdir:
        safe_name = secure_filename(file.filename or "image")
        save_path = Path(tmpdir) / f"{uuid.uuid4().hex}_{safe_name}"
        file.save(save_path)
        try:
            image = skio.imread(save_path)
            payload = apply_ifft_roi_settings(
                image,
                roi_payload,
                known_nm=known_nm,
                sb_color=sb_color,
                nm_per_pixel_override=nm_per_pixel,
                peak_pair=peak_pair,
                fft_settings=fft_settings,
            )
        except (FftAnalysisError, ValueError) as exc:
            return jsonify({"error": str(exc)}), 400
        except Exception as exc:  # noqa: BLE001
            return jsonify({"error": str(exc)}), 500

    payload["name"] = file.filename
    return jsonify(payload)


@app.post("/api/fft/profile-peaks")
def analyze_fft_profile_peaks() -> Response:
    try:
        payload = _read_json_request_body()
        peaks = payload.get("peaks")
        if not isinstance(peaks, list):
            raise ValueError("peaks must be a list.")
        expected_spacing = payload.get("expected_spacing_nm")
        expected_spacing_nm = None if expected_spacing in {None, ""} else float(expected_spacing)
        result = measure_profile_peak_pair(peaks, expected_spacing_nm=expected_spacing_nm)
    except (ValueError, FftAnalysisError) as exc:
        return jsonify({"error": str(exc)}), 400
    return jsonify(result)


@app.get("/api/download/<result_id>.csv")
def download_csv(result_id: str) -> Response:
    values = RESULT_STORE.get(result_id)
    if values is None:
        return jsonify({"error": "Unknown result_id"}), 404

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["size_nm"])
    for value in values:
        writer.writerow([f"{value:.8f}"])

    return Response(
        buffer.getvalue(),
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=NC_size_results_{result_id}.csv"
        },
    )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
