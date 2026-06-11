from __future__ import annotations

import argparse
import csv
import statistics
import sys
import time
from pathlib import Path

import numpy as np
from skimage import draw, io, util

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.analyzer import Analyzer, AnalyzerSettings, ImageResult, PlateletThresholds  # noqa: E402
from core.rectangle_seed import (  # noqa: E402
    RectCandidate,
    SeedDetectorConfig,
    build_seed_from_points,
    detect_rectangles_with_seed,
)
from rectangle_seed_image import load_gray, parse_point  # noqa: E402


def stats(values: list[float]) -> tuple[int, float | None, float | None]:
    if not values:
        return 0, None, None
    if len(values) == 1:
        return 1, float(values[0]), 0.0
    return len(values), float(statistics.fmean(values)), float(statistics.pstdev(values))


def build_settings(args: argparse.Namespace) -> AnalyzerSettings:
    return AnalyzerSettings(
        sb_color=args.sb_color,
        sb_region_ratio=args.sb_region_ratio,
        white_thr=args.white_thr,
        black_thr=args.black_thr,
        sb_min_area=args.sb_min_area,
        crop_bottom_px=args.crop_bottom_px,
        gamma=args.gamma,
        gauss_sigma=args.gauss_sigma,
        adapthist_clip=args.adapthist_clip,
        adapthist_tiles=(args.adapthist_tile_y, args.adapthist_tile_x),
    )


def build_thresholds(args: argparse.Namespace) -> PlateletThresholds:
    return PlateletThresholds(
        min_length_nm=args.min_length_nm,
        max_length_nm=args.max_length_nm,
        aspect_min=args.aspect_min,
        ecc_min=args.ecc_min,
        extent_min=args.extent_min,
        sol_min=args.sol_min,
        min_area_px=args.min_area_px,
        split_min_distance_px=args.split_min_distance_px,
    )


def run_current_analyzer(
    image_path: Path,
    gray: np.ndarray,
    analyzer: Analyzer,
    thresholds: PlateletThresholds,
    args: argparse.Namespace,
) -> tuple[ImageResult, float, tuple[float, float, float, float] | None]:
    started = time.perf_counter()
    if args.nm_per_pixel is not None:
        result = analyzer._analyze_platelet_image(gray, args.nm_per_pixel, thresholds, None)
        return result, (time.perf_counter() - started) * 1000, None

    result = analyzer.analyze_image(
        str(image_path),
        args.known_nm,
        thresholds,
        sb_color=args.sb_color,
    )
    return result, (time.perf_counter() - started) * 1000, result.scale_bar_box


def measure_nm_per_pixel(
    gray: np.ndarray,
    analyzer: Analyzer,
    args: argparse.Namespace,
) -> tuple[float, tuple[float, float, float, float] | None]:
    if args.nm_per_pixel is not None:
        return args.nm_per_pixel, None
    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar_platelet(gray, args.known_nm, args.sb_color)
    return nm_per_pixel, scale_bar_box


def run_seed_detector(
    gray: np.ndarray,
    nm_per_pixel: float,
    args: argparse.Namespace,
) -> tuple[list[RectCandidate], float]:
    seed = build_seed_from_points(args.point, gray)
    cfg = SeedDetectorConfig(
        crop_bottom_px=args.crop_bottom_px,
        gamma=args.gamma,
        gauss_sigma=args.gauss_sigma,
        adapthist_clip=args.adapthist_clip,
        adapthist_tiles=(args.adapthist_tile_y, args.adapthist_tile_x),
        min_area_factor=args.seed_min_area_factor,
        max_area_factor=args.seed_max_area_factor,
        min_width_factor=args.seed_min_width_factor,
        max_width_factor=args.seed_max_width_factor,
        min_length_factor=args.seed_min_length_factor,
        max_length_factor=args.seed_max_length_factor,
    )
    started = time.perf_counter()
    candidates = detect_rectangles_with_seed(gray, nm_per_pixel, seed, cfg)
    return candidates, (time.perf_counter() - started) * 1000


def draw_polygon(rgb: np.ndarray, polygon, color: list[float], width: int = 1) -> None:
    if not polygon or len(polygon) < 4:
        return
    for start, end in zip(polygon, polygon[1:] + polygon[:1]):
        rr, cc = draw.line(
            int(round(start[1])),
            int(round(start[0])),
            int(round(end[1])),
            int(round(end[0])),
        )
        for offset in range(-(width // 2), (width // 2) + 1):
            for rrs, ccs in ((rr + offset, cc), (rr, cc + offset)):
                valid = (rrs >= 0) & (rrs < rgb.shape[0]) & (ccs >= 0) & (ccs < rgb.shape[1])
                rgb[rrs[valid], ccs[valid], :] = color


def draw_box(rgb: np.ndarray, box, color: list[float]) -> None:
    if not box or len(box) < 4:
        return
    x, y, w, h = box
    polygon = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
    draw_polygon(rgb, polygon, color)


def draw_scale_bar(rgb: np.ndarray, box, color: list[float] = [0.0, 0.85, 0.15]) -> None:
    if box is None:
        return
    draw_box(rgb, box, color)


def save_current_overlay(path: Path, gray: np.ndarray, result: ImageResult) -> None:
    rgb = np.dstack([gray, gray, gray])
    draw_scale_bar(rgb, result.scale_bar_box)
    if result.rotated_boxes:
        for polygon in result.rotated_boxes:
            draw_polygon(rgb, polygon, [0.1, 0.35, 1.0], width=2)
    else:
        for box in result.boxes:
            draw_box(rgb, box, [0.1, 0.35, 1.0])
    io.imsave(path, util.img_as_ubyte(np.clip(rgb, 0, 1)))


def save_seed_overlay(
    path: Path,
    gray: np.ndarray,
    seed_points,
    candidates: list[RectCandidate],
    scale_bar_box,
) -> None:
    rgb = np.dstack([gray, gray, gray])
    draw_scale_bar(rgb, scale_bar_box)
    draw_polygon(rgb, seed_points, [0.0, 0.9, 0.2], width=2)
    for candidate in candidates:
        draw_polygon(rgb, candidate.polygon, [1.0, 0.05, 0.05], width=2)
    io.imsave(path, util.img_as_ubyte(np.clip(rgb, 0, 1)))


def save_combined_overlay(
    path: Path,
    gray: np.ndarray,
    current: ImageResult,
    seed_points,
    candidates: list[RectCandidate],
    scale_bar_box,
) -> None:
    rgb = np.dstack([gray, gray, gray])
    draw_scale_bar(rgb, scale_bar_box)
    if current.rotated_boxes:
        for polygon in current.rotated_boxes:
            draw_polygon(rgb, polygon, [0.1, 0.35, 1.0], width=1)
    else:
        for box in current.boxes:
            draw_box(rgb, box, [0.1, 0.35, 1.0])
    for candidate in candidates:
        draw_polygon(rgb, candidate.polygon, [1.0, 0.05, 0.05], width=1)
    draw_polygon(rgb, seed_points, [0.0, 0.9, 0.2], width=2)
    io.imsave(path, util.img_as_ubyte(np.clip(rgb, 0, 1)))


def write_current_measurements(path: Path, result: ImageResult) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["index", "length_nm", "width_nm", "polygon_px", "box_px"])
        for index, length_nm in enumerate(result.values_nm, start=1):
            width_nm = result.short_values_nm[index - 1] if index - 1 < len(result.short_values_nm) else ""
            polygon = result.rotated_boxes[index - 1] if index - 1 < len(result.rotated_boxes) else []
            box = result.boxes[index - 1] if index - 1 < len(result.boxes) else []
            writer.writerow([
                index,
                f"{length_nm:.6f}",
                f"{width_nm:.6f}" if width_nm != "" else "",
                ";".join(f"{x:.2f},{y:.2f}" for x, y in polygon),
                ",".join(f"{value:.2f}" for value in box),
            ])


def write_seed_measurements(path: Path, candidates: list[RectCandidate]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow([
            "index",
            "score",
            "length_nm",
            "width_nm",
            "aspect",
            "center_x_px",
            "center_y_px",
            "extent",
            "solidity",
            "threshold",
            "polygon_px",
        ])
        for index, candidate in enumerate(candidates, start=1):
            writer.writerow([
                index,
                f"{candidate.score:.6f}",
                f"{candidate.length_nm:.6f}",
                f"{candidate.width_nm:.6f}",
                f"{candidate.aspect:.6f}",
                f"{candidate.center[0]:.3f}",
                f"{candidate.center[1]:.3f}",
                f"{candidate.extent:.6f}",
                f"{candidate.solidity:.6f}",
                f"{candidate.threshold:.6f}",
                ";".join(f"{x:.2f},{y:.2f}" for x, y in candidate.polygon),
            ])


def write_summary(
    path: Path,
    current: ImageResult,
    current_ms: float,
    candidates: list[RectCandidate],
    seed_ms: float,
    nm_per_pixel: float,
) -> None:
    seed_lengths = [candidate.length_nm for candidate in candidates]
    seed_widths = [candidate.width_nm for candidate in candidates]
    current_count, current_mean, current_std = stats(current.values_nm)
    current_short_count, current_short_mean, current_short_std = stats(current.short_values_nm)
    seed_count, seed_mean, seed_std = stats(seed_lengths)
    seed_short_count, seed_short_mean, seed_short_std = stats(seed_widths)

    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow([
            "detector",
            "count",
            "long_mean_nm",
            "long_std_nm",
            "short_count",
            "short_mean_nm",
            "short_std_nm",
            "nm_per_pixel",
            "duration_ms",
        ])
        writer.writerow([
            "current_python_platelet",
            current_count,
            _fmt(current_mean),
            _fmt(current_std),
            current_short_count,
            _fmt(current_short_mean),
            _fmt(current_short_std),
            f"{nm_per_pixel:.8f}",
            f"{current_ms:.3f}",
        ])
        writer.writerow([
            "rectangle_seed",
            seed_count,
            _fmt(seed_mean),
            _fmt(seed_std),
            seed_short_count,
            _fmt(seed_short_mean),
            _fmt(seed_short_std),
            f"{nm_per_pixel:.8f}",
            f"{seed_ms:.3f}",
        ])


def _fmt(value: float | None) -> str:
    return "" if value is None else f"{value:.6f}"


def positive_float(raw: str) -> float:
    value = float(raw)
    if value <= 0:
        raise argparse.ArgumentTypeError("value must be greater than 0")
    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare current Python platelet analyzer with the 4-point rectangle seed detector.",
    )
    parser.add_argument("image", type=Path)
    parser.add_argument("--point", action="append", type=parse_point, required=True, help="Seed corner as x,y. Provide exactly four.")
    parser.add_argument("--known-nm", type=positive_float, help="Known scale bar length in nm. Used for automatic calibration.")
    parser.add_argument("--nm-per-pixel", type=positive_float, help="Bypass scale bar detection for local/synthetic tests.")
    parser.add_argument("--sb-color", choices=["white", "black"], default="white")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "local_tests" / "out" / "rectangle_seed_compare")

    parser.add_argument("--min-length-nm", type=float, default=3.0)
    parser.add_argument("--max-length-nm", type=float, default=15.0)
    parser.add_argument("--aspect-min", type=float, default=1.8)
    parser.add_argument("--ecc-min", type=float, default=0.65)
    parser.add_argument("--extent-min", type=float, default=0.35)
    parser.add_argument("--sol-min", type=float, default=0.35)
    parser.add_argument("--min-area-px", type=int, default=35)
    parser.add_argument("--split-min-distance-px", type=int, default=5)

    parser.add_argument("--crop-bottom-px", type=int, default=150)
    parser.add_argument("--gamma", type=float, default=0.08)
    parser.add_argument("--gauss-sigma", type=float, default=0.45)
    parser.add_argument("--adapthist-clip", type=float, default=0.02)
    parser.add_argument("--adapthist-tile-y", type=int, default=4)
    parser.add_argument("--adapthist-tile-x", type=int, default=4)
    parser.add_argument("--sb-region-ratio", type=float, default=0.85)
    parser.add_argument("--white-thr", type=int, default=245)
    parser.add_argument("--black-thr", type=int, default=10)
    parser.add_argument("--sb-min-area", type=int, default=200)

    parser.add_argument("--seed-min-area-factor", type=float, default=0.25)
    parser.add_argument("--seed-max-area-factor", type=float, default=5.0)
    parser.add_argument("--seed-min-width-factor", type=float, default=0.45)
    parser.add_argument("--seed-max-width-factor", type=float, default=2.4)
    parser.add_argument("--seed-min-length-factor", type=float, default=0.35)
    parser.add_argument("--seed-max-length-factor", type=float, default=4.0)

    args = parser.parse_args()
    if len(args.point) != 4:
        parser.error("Provide exactly four --point x,y values.")
    if args.known_nm is None and args.nm_per_pixel is None:
        parser.error("Provide either --known-nm for scale bar calibration or --nm-per-pixel for local testing.")
    return args


def main() -> int:
    args = parse_args()
    gray = load_gray(args.image)
    analyzer = Analyzer(settings=build_settings(args))
    thresholds = build_thresholds(args)

    current_result, current_ms, current_scale_bar = run_current_analyzer(
        args.image,
        gray,
        analyzer,
        thresholds,
        args,
    )
    nm_per_pixel, scale_bar_box = measure_nm_per_pixel(gray, analyzer, args)
    if current_result.scale_bar_box is None and scale_bar_box is not None:
        current_result.scale_bar_box = scale_bar_box
    if scale_bar_box is None:
        scale_bar_box = current_scale_bar

    seed = build_seed_from_points(args.point, gray)
    seed_candidates, seed_ms = run_seed_detector(gray, nm_per_pixel, args)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    stem = args.image.stem
    current_overlay = args.output_dir / f"{stem}_current_overlay.png"
    seed_overlay = args.output_dir / f"{stem}_seed_overlay.png"
    combined_overlay = args.output_dir / f"{stem}_combined_overlay.png"
    current_csv = args.output_dir / f"{stem}_current_measurements.csv"
    seed_csv = args.output_dir / f"{stem}_seed_measurements.csv"
    summary_csv = args.output_dir / f"{stem}_comparison_summary.csv"

    save_current_overlay(current_overlay, gray, current_result)
    save_seed_overlay(seed_overlay, gray, seed.points, seed_candidates, scale_bar_box)
    save_combined_overlay(combined_overlay, gray, current_result, seed.points, seed_candidates, scale_bar_box)
    write_current_measurements(current_csv, current_result)
    write_seed_measurements(seed_csv, seed_candidates)
    write_summary(summary_csv, current_result, current_ms, seed_candidates, seed_ms, nm_per_pixel)

    print(f"image={args.image}")
    print(f"nm_per_pixel={nm_per_pixel:.8f}")
    print(
        "seed="
        f"length_px={seed.length_px:.2f}, width_px={seed.width_px:.2f}, "
        f"aspect={seed.aspect:.2f}, contrast={seed.contrast:.3f}"
    )
    print(f"current_count={current_result.count}, current_duration_ms={current_ms:.1f}")
    print(f"seed_count={len(seed_candidates)}, seed_duration_ms={seed_ms:.1f}")
    print(f"current_overlay={current_overlay}")
    print(f"seed_overlay={seed_overlay}")
    print(f"combined_overlay={combined_overlay}")
    print(f"summary={summary_csv}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
