from __future__ import annotations

import base64
import io
import math
from dataclasses import dataclass
from typing import Any

import numpy as np
from scipy import signal
from skimage import feature, io as skio

from .analyzer import Analyzer, AnalyzerSettings


@dataclass(frozen=True)
class FftRoi:
    x: int
    y: int
    width: int
    height: int


@dataclass(frozen=True)
class FftAnalysisSettings:
    min_roi_px: int = 64
    min_fft_size_px: int = 256
    max_fft_size_px: int = 1024
    dc_exclusion_ratio: float = 0.035
    peak_min_distance_px: int = 6
    peak_count: int = 48
    peak_threshold_quantile: float = 0.985
    inverse_peak_mask_radius_px: int = 12
    ifft_mode: str = "pair_plus_dc"
    ifft_dc_radius_px: int = 4


class FftAnalysisError(ValueError):
    pass


def analyze_fft_roi(
    image: np.ndarray,
    roi_payload: dict[str, Any],
    *,
    known_nm: float,
    sb_color: str,
    nm_per_pixel_override: float | None = None,
    manual_peak_pair: list[dict[str, float]] | None = None,
    analyzer_settings: AnalyzerSettings | None = None,
    fft_settings: FftAnalysisSettings | None = None,
) -> dict[str, Any]:
    settings = fft_settings or FftAnalysisSettings()
    analyzer = Analyzer(settings=analyzer_settings or AnalyzerSettings())
    gray = analyzer._to_gray(image)
    roi = validate_roi(roi_payload, gray.shape, settings.min_roi_px)

    if nm_per_pixel_override is not None:
        if nm_per_pixel_override <= 0:
            raise FftAnalysisError("nm_per_pixel must be > 0.")
        nm_per_pixel = float(nm_per_pixel_override)
        scale_bar_box = None
    else:
        if known_nm <= 0:
            raise FftAnalysisError("known_nm must be > 0.")
        scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, known_nm, sb_color)

    roi_image = gray[roi.y : roi.y + roi.height, roi.x : roi.x + roi.width].astype(np.float32)
    spectrum, magnitude, fft_size = _fft_spectrum_and_magnitude(roi_image, settings)
    peaks = _detect_fft_peaks(magnitude, settings)
    auto_peak_pair = _select_peak_pair(peaks, magnitude.shape)
    if auto_peak_pair is None:
        auto_peak_pair = _fallback_peak_pair(peaks, magnitude, settings)
    peak_pair = _validate_manual_peak_pair(manual_peak_pair, fft_size) if manual_peak_pair else auto_peak_pair
    selected_measurement = None
    if peak_pair is not None:
        selected_measurement = measure_peak_pair(
            peak_pair,
            nm_per_pixel=nm_per_pixel,
            fft_width=fft_size[0],
            fft_height=fft_size[1],
        )
    inverse_image, inverse_amplitude_image, inverse_debug = _inverse_fft_from_peak_pair(
        spectrum,
        roi_shape=roi_image.shape,
        peak_pair=peak_pair,
        settings=settings,
    )
    profile = _profile_from_peak_pair(
        inverse_image if inverse_image is not None else roi_image,
        nm_per_pixel=nm_per_pixel,
        peak_pair=peak_pair,
        fft_size=fft_size,
        source="inverse_fft_peak_direction" if inverse_image is not None else "fft_peak_direction",
    )
    fft_line_profile = _fft_line_profile_from_peak_pair(
        magnitude,
        nm_per_pixel=nm_per_pixel,
        peak_pair=peak_pair,
        fft_size=fft_size,
    )

    return {
        "roi_px": {
            "x": roi.x,
            "y": roi.y,
            "width": roi.width,
            "height": roi.height,
        },
        "nm_per_pixel": nm_per_pixel,
        "scale_bar_box": scale_bar_box,
        "fft_size_px": {
            "width": fft_size[0],
            "height": fft_size[1],
        },
        "fft_center_px": {
            "x": fft_size[0] / 2.0,
            "y": fft_size[1] / 2.0,
        },
        "fft_image": _png_data_url(magnitude),
        "inverse_fft_image": None if inverse_image is None else _png_data_url(inverse_image),
        "inverse_fft_image_real": None if inverse_image is None else _png_data_url(inverse_image),
        "inverse_fft_image_amplitude": None if inverse_amplitude_image is None else _png_data_url(inverse_amplitude_image),
        "inverse_fft_peak_mask_radius_px": settings.inverse_peak_mask_radius_px,
        "ifft_mode": settings.ifft_mode,
        "inverse_fft_debug": inverse_debug,
        "candidate_peaks": peaks,
        "selected_peak_pair": peak_pair,
        "auto_peak_pair_px": auto_peak_pair,
        "manual_peak_pair_px": peak_pair if manual_peak_pair else None,
        "d_spacing_nm": None if selected_measurement is None else selected_measurement["d_spacing_nm"],
        "angle_deg": None if selected_measurement is None else selected_measurement["angle_deg"],
        "lattice_angle_deg": None if selected_measurement is None else selected_measurement["angle_deg"],
        "peak_score": None if selected_measurement is None else selected_measurement["peak_score"],
        "measurement_source": "manual_peak_pair" if selected_measurement is not None and manual_peak_pair else ("auto_peak_pair" if selected_measurement is not None else None),
        "fft_line_profile": fft_line_profile,
        "inverse_intensity_profile": profile,
        "intensity_profile": profile,
        "error": None,
    }


def apply_ifft_roi_settings(
    image: np.ndarray,
    roi_payload: dict[str, Any],
    *,
    known_nm: float,
    sb_color: str,
    peak_pair: list[dict[str, float]] | None,
    nm_per_pixel_override: float | None = None,
    analyzer_settings: AnalyzerSettings | None = None,
    fft_settings: FftAnalysisSettings | None = None,
) -> dict[str, Any]:
    settings = fft_settings or FftAnalysisSettings()
    if not peak_pair or len(peak_pair) != 2:
        raise FftAnalysisError("A peak pair is required to apply IFFT settings.")

    analyzer = Analyzer(settings=analyzer_settings or AnalyzerSettings())
    gray = analyzer._to_gray(image)
    roi = validate_roi(roi_payload, gray.shape, settings.min_roi_px)

    if nm_per_pixel_override is not None:
        if nm_per_pixel_override <= 0:
            raise FftAnalysisError("nm_per_pixel must be > 0.")
        nm_per_pixel = float(nm_per_pixel_override)
        scale_bar_box = None
    else:
        if known_nm <= 0:
            raise FftAnalysisError("known_nm must be > 0.")
        scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, known_nm, sb_color)

    roi_image = gray[roi.y : roi.y + roi.height, roi.x : roi.x + roi.width].astype(np.float32)
    spectrum, magnitude, fft_size = _fft_spectrum_and_magnitude(roi_image, settings)
    selected_peak_pair = _validate_manual_peak_pair(peak_pair, fft_size)
    if selected_peak_pair is None:
        raise FftAnalysisError("A peak pair is required to apply IFFT settings.")

    selected_measurement = measure_peak_pair(
        selected_peak_pair,
        nm_per_pixel=nm_per_pixel,
        fft_width=fft_size[0],
        fft_height=fft_size[1],
    )
    inverse_image, inverse_amplitude_image, inverse_debug = _inverse_fft_from_peak_pair(
        spectrum,
        roi_shape=roi_image.shape,
        peak_pair=selected_peak_pair,
        settings=settings,
    )
    profile = _profile_from_peak_pair(
        inverse_image if inverse_image is not None else roi_image,
        nm_per_pixel=nm_per_pixel,
        peak_pair=selected_peak_pair,
        fft_size=fft_size,
        source="inverse_fft_peak_direction" if inverse_image is not None else "fft_peak_direction",
    )
    fft_line_profile = _fft_line_profile_from_peak_pair(
        magnitude,
        nm_per_pixel=nm_per_pixel,
        peak_pair=selected_peak_pair,
        fft_size=fft_size,
    )

    return {
        "roi_px": {
            "x": roi.x,
            "y": roi.y,
            "width": roi.width,
            "height": roi.height,
        },
        "nm_per_pixel": nm_per_pixel,
        "scale_bar_box": scale_bar_box,
        "fft_size_px": {
            "width": fft_size[0],
            "height": fft_size[1],
        },
        "fft_center_px": {
            "x": fft_size[0] / 2.0,
            "y": fft_size[1] / 2.0,
        },
        "inverse_fft_image": None if inverse_image is None else _png_data_url(inverse_image),
        "inverse_fft_image_real": None if inverse_image is None else _png_data_url(inverse_image),
        "inverse_fft_image_amplitude": None if inverse_amplitude_image is None else _png_data_url(inverse_amplitude_image),
        "inverse_fft_peak_mask_radius_px": settings.inverse_peak_mask_radius_px,
        "ifft_mode": settings.ifft_mode,
        "inverse_fft_debug": inverse_debug,
        "selected_peak_pair": selected_peak_pair,
        "manual_peak_pair_px": selected_peak_pair,
        "d_spacing_nm": selected_measurement["d_spacing_nm"],
        "angle_deg": selected_measurement["angle_deg"],
        "lattice_angle_deg": selected_measurement["angle_deg"],
        "peak_score": selected_measurement["peak_score"],
        "fft_line_profile": fft_line_profile,
        "inverse_intensity_profile": profile,
        "intensity_profile": profile,
        "error": None,
    }


def validate_roi(payload: dict[str, Any], image_shape: tuple[int, int], min_roi_px: int = 64) -> FftRoi:
    try:
        x = int(round(float(payload["x"])))
        y = int(round(float(payload["y"])))
        width = int(round(float(payload["width"])))
        height = int(round(float(payload["height"])))
    except (KeyError, TypeError, ValueError) as exc:
        raise FftAnalysisError("roi_json must include numeric x, y, width, and height.") from exc

    if width < min_roi_px or height < min_roi_px:
        raise FftAnalysisError(f"FFT ROI must be at least {min_roi_px} x {min_roi_px} px.")
    if x < 0 or y < 0:
        raise FftAnalysisError("FFT ROI must stay inside the image.")

    image_height, image_width = image_shape[:2]
    if x + width > image_width or y + height > image_height:
        raise FftAnalysisError("FFT ROI must stay inside the image.")

    return FftRoi(x=x, y=y, width=width, height=height)


def measure_peak_pair(
    peak_pair: list[dict[str, float]],
    *,
    nm_per_pixel: float,
    fft_width: int,
    fft_height: int,
) -> dict[str, float]:
    if len(peak_pair) != 2:
        raise FftAnalysisError("A peak pair must contain exactly two peaks.")
    if nm_per_pixel <= 0:
        raise FftAnalysisError("nm_per_pixel must be > 0.")

    center_x = fft_width / 2.0
    center_y = fft_height / 2.0
    vectors = [
        (float(peak["x"]) - center_x, float(peak["y"]) - center_y)
        for peak in peak_pair
    ]

    primary = (
        (vectors[0][0] - vectors[1][0]) / 2.0,
        (vectors[0][1] - vectors[1][1]) / 2.0,
    )
    if primary[0] < 0 or (abs(primary[0]) < 1e-9 and primary[1] > 0):
        primary = (-primary[0], -primary[1])

    fx = primary[0] / fft_width / nm_per_pixel
    fy = primary[1] / fft_height / nm_per_pixel
    frequency = math.hypot(fx, fy)
    if frequency <= 0:
        raise FftAnalysisError("Selected FFT peak is at the DC center.")

    score_values = [
        float(peak.get("intensity", 0.0))
        for peak in peak_pair
    ]
    angle_deg = (math.degrees(math.atan2(-primary[1], primary[0])) + 180.0) % 180.0
    return {
        "d_spacing_nm": 1.0 / frequency,
        "angle_deg": angle_deg,
        "lattice_angle_deg": angle_deg,
        "peak_score": sum(score_values) / max(1, len(score_values)),
    }


def measure_profile_peak_pair(
    peak_pair: list[dict[str, float]],
    *,
    expected_spacing_nm: float | None = None,
) -> dict[str, Any]:
    if len(peak_pair) != 2:
        raise FftAnalysisError("A profile peak pair must contain exactly two peaks.")
    try:
        left = float(peak_pair[0]["distance_nm"])
        right = float(peak_pair[1]["distance_nm"])
    except (KeyError, TypeError, ValueError) as exc:
        raise FftAnalysisError("Profile peaks must include distance_nm.") from exc

    spacing = abs(right - left)
    if spacing <= 0:
        raise FftAnalysisError("Profile peak spacing must be > 0.")
    interval_count = 1
    if expected_spacing_nm is not None and expected_spacing_nm > 0:
        interval_count = max(1, int(round(spacing / expected_spacing_nm)))
    return {
        "d_spacing_nm": spacing / interval_count,
        "profile_span_nm": spacing,
        "profile_interval_count": interval_count,
        "measurement_source": "manual_profile_peaks",
        "manual_profile_peak_pair": sorted(
            peak_pair,
            key=lambda peak: float(peak["distance_nm"]),
        ),
    }


def _validate_manual_peak_pair(
    peak_pair: list[dict[str, float]] | None,
    fft_size: tuple[int, int],
) -> list[dict[str, float]] | None:
    if peak_pair is None:
        return None
    if not isinstance(peak_pair, list) or len(peak_pair) != 2:
        raise FftAnalysisError("manual_peak_pair must contain exactly two peaks.")

    fft_width, fft_height = fft_size
    normalized: list[dict[str, float]] = []
    for item in peak_pair:
        try:
            x = float(item["x"])
            y = float(item["y"])
        except (KeyError, TypeError, ValueError) as exc:
            raise FftAnalysisError("manual_peak_pair peaks must include numeric x and y.") from exc
        if not (0 <= x < fft_width and 0 <= y < fft_height):
            raise FftAnalysisError("manual_peak_pair peaks must stay inside the FFT image.")
        normalized.append(
            {
                "x": x,
                "y": y,
                "intensity": float(item.get("intensity", 1.0) or 1.0),
                "distance_px": math.hypot(x - (fft_width / 2.0), y - (fft_height / 2.0)),
            }
        )
    return normalized


def _fft_spectrum_and_magnitude(
    roi_image: np.ndarray,
    settings: FftAnalysisSettings,
) -> tuple[np.ndarray, np.ndarray, tuple[int, int]]:
    roi = np.asarray(roi_image, dtype=np.float32)
    roi = roi - float(np.mean(roi))
    window_y = np.hanning(roi.shape[0]).astype(np.float32)
    window_x = np.hanning(roi.shape[1]).astype(np.float32)
    roi = roi * np.outer(window_y, window_x)

    fft_height = _bounded_power_of_two(roi.shape[0], settings.min_fft_size_px, settings.max_fft_size_px)
    fft_width = _bounded_power_of_two(roi.shape[1], settings.min_fft_size_px, settings.max_fft_size_px)
    spectrum = np.fft.fftshift(np.fft.fft2(roi, s=(fft_height, fft_width)))
    magnitude = np.log1p(np.abs(spectrum)).astype(np.float32)
    return spectrum, _display_normalize(magnitude, high_percentile=100.0), (fft_width, fft_height)


def _fft_log_magnitude(
    roi_image: np.ndarray,
    settings: FftAnalysisSettings,
) -> tuple[np.ndarray, tuple[int, int]]:
    _, magnitude, fft_size = _fft_spectrum_and_magnitude(roi_image, settings)
    return magnitude, fft_size


def _display_normalize(values: np.ndarray, low_percentile: float = 1.0, high_percentile: float = 99.8) -> np.ndarray:
    values = np.asarray(values, dtype=np.float32)
    low = float(np.percentile(values, low_percentile))
    high = float(np.percentile(values, high_percentile))
    if high <= low:
        high = float(np.max(values))
    if high <= low:
        return np.zeros_like(values, dtype=np.float32)
    return np.clip((values - low) / (high - low), 0.0, 1.0).astype(np.float32)


def _normalize_ifft_display(values: np.ndarray, low_percentile: float = 1.0, high_percentile: float = 99.0) -> np.ndarray:
    values = np.asarray(values, dtype=np.float32)
    values = np.nan_to_num(values, nan=0.0, posinf=0.0, neginf=0.0)
    low = float(np.percentile(values, low_percentile))
    high = float(np.percentile(values, high_percentile))
    if not np.isfinite(low) or not np.isfinite(high) or high <= low:
        low = float(np.min(values))
        high = float(np.max(values))
    if high <= low:
        return np.zeros_like(values, dtype=np.float32)
    return np.clip((values - low) / (high - low), 0.0, 1.0).astype(np.float32)


def _inverse_fft_from_peak_pair(
    spectrum: np.ndarray,
    *,
    roi_shape: tuple[int, int],
    peak_pair: list[dict[str, float]] | None,
    settings: FftAnalysisSettings,
) -> tuple[np.ndarray | None, np.ndarray | None, dict[str, Any]]:
    debug: dict[str, Any] = {
        "has_peak_pair": bool(peak_pair and len(peak_pair) == 2),
        "ifft_mode": settings.ifft_mode,
        "mask_radius_px": settings.inverse_peak_mask_radius_px,
        "dc_radius_px": settings.ifft_dc_radius_px,
        "mask_max": None,
        "mask_sum": None,
        "filtered_abs_max": None,
        "filtered_abs_sum": None,
        "inverse_real_min": None,
        "inverse_real_max": None,
        "inverse_real_std": None,
        "inverse_amp_min": None,
        "inverse_amp_max": None,
        "inverse_amp_std": None,
        "display_real_min": None,
        "display_real_max": None,
        "display_real_std": None,
        "display_amp_min": None,
        "display_amp_max": None,
        "display_amp_std": None,
    }
    if not peak_pair or len(peak_pair) != 2:
        return None, None, debug

    height, width = spectrum.shape
    yy, xx = np.indices((height, width), dtype=np.float32)
    mask = np.zeros((height, width), dtype=np.float32)
    radius = max(2.0, float(settings.inverse_peak_mask_radius_px))
    sigma = max(1.0, radius / 2.0)

    for peak in peak_pair:
        px = float(peak["x"])
        py = float(peak["y"])
        distance = np.hypot(xx - px, yy - py)
        spot = np.exp(-0.5 * (distance / sigma) ** 2)
        spot[distance > radius] = 0.0
        mask = np.maximum(mask, spot.astype(np.float32))

    if settings.ifft_mode == "pair_plus_dc":
        center_x = width / 2.0
        center_y = height / 2.0
        dc_radius = max(1.0, float(settings.ifft_dc_radius_px))
        dc_distance = np.hypot(xx - center_x, yy - center_y)
        mask = np.maximum(mask, (dc_distance <= dc_radius).astype(np.float32))

    debug["mask_max"] = float(np.max(mask))
    debug["mask_sum"] = float(np.sum(mask))
    if float(np.max(mask)) <= 0:
        return None, None, debug

    filtered = spectrum * mask
    debug["filtered_abs_max"] = float(np.max(np.abs(filtered)))
    debug["filtered_abs_sum"] = float(np.sum(np.abs(filtered)))
    inverse = np.fft.ifft2(np.fft.ifftshift(filtered))
    real_reconstructed = np.real(inverse).astype(np.float32)
    amp_reconstructed = np.abs(inverse).astype(np.float32)
    roi_height, roi_width = roi_shape
    real_reconstructed = real_reconstructed[:roi_height, :roi_width]
    amp_reconstructed = amp_reconstructed[:roi_height, :roi_width]

    debug["inverse_real_min"] = float(np.min(real_reconstructed))
    debug["inverse_real_max"] = float(np.max(real_reconstructed))
    debug["inverse_real_std"] = float(np.std(real_reconstructed))
    debug["inverse_amp_min"] = float(np.min(amp_reconstructed))
    debug["inverse_amp_max"] = float(np.max(amp_reconstructed))
    debug["inverse_amp_std"] = float(np.std(amp_reconstructed))

    real_display = _normalize_ifft_display(real_reconstructed)
    amp_display = _normalize_ifft_display(amp_reconstructed)

    debug["display_real_min"] = float(np.min(real_display))
    debug["display_real_max"] = float(np.max(real_display))
    debug["display_real_std"] = float(np.std(real_display))
    debug["display_amp_min"] = float(np.min(amp_display))
    debug["display_amp_max"] = float(np.max(amp_display))
    debug["display_amp_std"] = float(np.std(amp_display))

    return real_display, amp_display, debug


def _detect_fft_peaks(
    magnitude: np.ndarray,
    settings: FftAnalysisSettings,
) -> list[dict[str, float]]:
    masked = magnitude.copy()
    height, width = masked.shape
    center_x = width / 2.0
    center_y = height / 2.0
    yy, xx = np.indices(masked.shape)
    dc_radius = max(4.0, min(width, height) * settings.dc_exclusion_ratio)
    masked[np.hypot(xx - center_x, yy - center_y) <= dc_radius] = 0.0

    threshold = float(np.quantile(masked, settings.peak_threshold_quantile))
    coords = feature.peak_local_max(
        masked,
        min_distance=max(1, settings.peak_min_distance_px),
        threshold_abs=threshold,
        num_peaks=settings.peak_count,
        exclude_border=False,
    )

    peaks: list[dict[str, float]] = []
    for row, col in coords:
        dx = float(col - center_x)
        dy = float(row - center_y)
        distance = math.hypot(dx, dy)
        if distance <= dc_radius:
            continue
        peaks.append(
            {
                "x": float(col),
                "y": float(row),
                "intensity": float(masked[row, col]),
                "distance_px": distance,
            }
        )
    peaks.sort(key=lambda item: item["intensity"], reverse=True)
    return peaks


def _select_peak_pair(
    peaks: list[dict[str, float]],
    shape: tuple[int, int],
) -> list[dict[str, float]] | None:
    if len(peaks) < 2:
        return None

    height, width = shape
    center_x = width / 2.0
    center_y = height / 2.0
    best_pair: tuple[float, dict[str, float], dict[str, float]] | None = None

    for i, left in enumerate(peaks[:40]):
        lv = (left["x"] - center_x, left["y"] - center_y)
        ld = math.hypot(lv[0], lv[1])
        if ld <= 1e-9:
            continue
        for right in peaks[i + 1 : 40]:
            rv = (right["x"] - center_x, right["y"] - center_y)
            rd = math.hypot(rv[0], rv[1])
            if rd <= 1e-9:
                continue
            dot = (lv[0] * rv[0]) + (lv[1] * rv[1])
            if dot >= 0:
                continue
            max_distance = max(ld, rd)
            symmetry = math.hypot(lv[0] + rv[0], lv[1] + rv[1]) / max_distance
            radial_delta = abs(ld - rd) / max_distance
            intensity = (left["intensity"] + right["intensity"]) / 2.0
            distance_penalty = math.log1p(max_distance / max(1.0, min(width, height)))
            score = intensity - (0.70 * symmetry) - (0.30 * radial_delta) - (0.35 * distance_penalty)
            if best_pair is None or score > best_pair[0]:
                best_pair = (score, left, right)

    if best_pair is None:
        return None

    left = dict(best_pair[1])
    right = dict(best_pair[2])
    left["pair_score"] = float(best_pair[0])
    right["pair_score"] = float(best_pair[0])
    return [left, right]


def _fallback_peak_pair(
    peaks: list[dict[str, float]],
    magnitude: np.ndarray,
    settings: FftAnalysisSettings,
) -> list[dict[str, float]] | None:
    height, width = magnitude.shape
    center_x = width / 2.0
    center_y = height / 2.0
    dc_radius = max(4.0, min(width, height) * settings.dc_exclusion_ratio)

    seed = peaks[0] if peaks else None
    if seed is None:
        yy, xx = np.indices(magnitude.shape)
        masked = magnitude.copy()
        masked[np.hypot(xx - center_x, yy - center_y) <= dc_radius] = 0.0
        row, col = np.unravel_index(int(np.argmax(masked)), masked.shape)
        if float(masked[row, col]) <= 0:
            return None
        seed = {
            "x": float(col),
            "y": float(row),
            "intensity": float(masked[row, col]),
            "distance_px": float(math.hypot(float(col) - center_x, float(row) - center_y)),
        }

    mirror_x = (2.0 * center_x) - float(seed["x"])
    mirror_y = (2.0 * center_y) - float(seed["y"])
    if not (0 <= mirror_x < width and 0 <= mirror_y < height):
        return None

    mirror_intensity = float(_bilinear_sample(
        magnitude,
        np.asarray([mirror_x], dtype=np.float32),
        np.asarray([mirror_y], dtype=np.float32),
    )[0])
    score = float(seed.get("intensity", 0.0)) + mirror_intensity
    left = dict(seed)
    right = {
        "x": float(mirror_x),
        "y": float(mirror_y),
        "intensity": mirror_intensity,
        "distance_px": float(math.hypot(mirror_x - center_x, mirror_y - center_y)),
    }
    left["pair_score"] = score
    right["pair_score"] = score
    left["fallback_pair"] = True
    right["fallback_pair"] = True
    return [left, right]


def _profile_from_peak_pair(
    roi_image: np.ndarray,
    *,
    nm_per_pixel: float,
    peak_pair: list[dict[str, float]] | None,
    fft_size: tuple[int, int],
    source: str = "fft_peak_direction",
) -> dict[str, Any] | None:
    if not peak_pair or len(peak_pair) != 2:
        return _profile_from_axis(
            roi_image,
            nm_per_pixel=nm_per_pixel,
            ux=1.0,
            uy=0.0,
            source="fallback_horizontal",
        )

    fft_width, fft_height = fft_size
    center_x = fft_width / 2.0
    center_y = fft_height / 2.0
    left = peak_pair[0]
    right = peak_pair[1]
    vx = ((float(left["x"]) - center_x) - (float(right["x"]) - center_x)) / 2.0
    vy = ((float(left["y"]) - center_y) - (float(right["y"]) - center_y)) / 2.0
    norm = math.hypot(vx, vy)
    if norm <= 1e-9:
        return None

    ux = vx / norm
    uy = vy / norm
    frequency = math.hypot(
        vx / fft_width / nm_per_pixel,
        vy / fft_height / nm_per_pixel,
    )
    expected_spacing_nm = None if frequency <= 1e-12 else 1.0 / frequency
    return _profile_from_axis(
        roi_image,
        nm_per_pixel=nm_per_pixel,
        ux=ux,
        uy=uy,
        source=source,
        expected_spacing_nm=expected_spacing_nm,
    )


def _fft_line_profile_from_peak_pair(
    magnitude: np.ndarray,
    *,
    nm_per_pixel: float,
    peak_pair: list[dict[str, float]] | None,
    fft_size: tuple[int, int],
) -> dict[str, Any] | None:
    if not peak_pair or len(peak_pair) != 2 or nm_per_pixel <= 0:
        return None

    fft_width, fft_height = fft_size
    center_x = fft_width / 2.0
    center_y = fft_height / 2.0
    left = peak_pair[0]
    right = peak_pair[1]
    vx = ((float(left["x"]) - center_x) - (float(right["x"]) - center_x)) / 2.0
    vy = ((float(left["y"]) - center_y) - (float(right["y"]) - center_y)) / 2.0
    norm = math.hypot(vx, vy)
    if norm <= 1e-9:
        return None

    ux = vx / norm
    uy = vy / norm
    distances_to_edges = []
    if abs(ux) > 1e-9:
        distances_to_edges.extend([(0.0 - center_x) / ux, ((fft_width - 1.0) - center_x) / ux])
    if abs(uy) > 1e-9:
        distances_to_edges.extend([(0.0 - center_y) / uy, ((fft_height - 1.0) - center_y) / uy])
    negative_limit = max([distance for distance in distances_to_edges if distance < 0], default=-min(fft_width, fft_height) / 2.0)
    positive_limit = min([distance for distance in distances_to_edges if distance > 0], default=min(fft_width, fft_height) / 2.0)
    radius = int(max(8, math.floor(min(abs(negative_limit), abs(positive_limit)))))
    offsets = np.arange(-radius, radius + 1, dtype=np.float32)
    xs = center_x + offsets * ux
    ys = center_y + offsets * uy
    profile = _bilinear_sample(magnitude, xs, ys)

    if profile.size >= 9:
        profile = signal.savgol_filter(profile, 9, 2, mode="interp")
    profile = np.asarray(profile, dtype=np.float32)
    profile = profile - float(np.min(profile))
    peak_value = float(np.max(profile))
    if peak_value > 0:
        profile = profile / peak_value

    signed_frequency = np.sign(offsets) * np.hypot(
        (offsets * ux) / fft_width / nm_per_pixel,
        (offsets * uy) / fft_height / nm_per_pixel,
    )
    positive_frequency = np.abs(signed_frequency)
    spacing = np.full_like(positive_frequency, np.nan, dtype=np.float32)
    valid_frequency = positive_frequency > 1e-12
    spacing[valid_frequency] = 1.0 / positive_frequency[valid_frequency]

    dc_radius = max(4, int(round(min(fft_width, fft_height) * 0.035)))
    masked_profile = profile.copy()
    masked_profile[np.abs(offsets) <= dc_radius] = 0.0
    peak_indices, properties = signal.find_peaks(
        masked_profile,
        distance=4,
        prominence=max(0.04, float(np.std(masked_profile)) * 0.35),
    )
    peaks = []
    for i, index in enumerate(peak_indices):
        frequency = float(signed_frequency[index])
        peaks.append(
            {
                "index": int(index),
                "offset_px": float(offsets[index]),
                "signed_frequency_1_per_nm": frequency,
                "frequency_1_per_nm": abs(frequency),
                "d_spacing_nm": None if abs(frequency) <= 1e-12 else 1.0 / abs(frequency),
                "intensity": float(profile[index]),
                "prominence": float(properties.get("prominences", np.zeros_like(peak_indices))[i]),
            }
        )

    selected_frequency = math.hypot(
        vx / fft_width / nm_per_pixel,
        vy / fft_height / nm_per_pixel,
    )
    return {
        "offset_px": [float(value) for value in offsets.tolist()],
        "signed_frequency_1_per_nm": [float(value) for value in signed_frequency.tolist()],
        "frequency_1_per_nm": [float(value) for value in positive_frequency.tolist()],
        "d_spacing_nm": [None if not np.isfinite(value) else float(value) for value in spacing.tolist()],
        "intensity": [float(value) for value in profile.tolist()],
        "peaks": peaks,
        "selected_frequency_1_per_nm": float(selected_frequency),
        "selected_d_spacing_nm": None if selected_frequency <= 1e-12 else float(1.0 / selected_frequency),
        "axis_unit_vector_px": {"x": float(ux), "y": float(uy)},
        "source": "fft_frequency_line",
        "x_axis": "signed_frequency_1_per_nm",
    }


def _bilinear_sample(image: np.ndarray, xs: np.ndarray, ys: np.ndarray) -> np.ndarray:
    height, width = image.shape
    x0 = np.floor(xs).astype(np.int32)
    y0 = np.floor(ys).astype(np.int32)
    x1 = np.clip(x0 + 1, 0, width - 1)
    y1 = np.clip(y0 + 1, 0, height - 1)
    x0 = np.clip(x0, 0, width - 1)
    y0 = np.clip(y0, 0, height - 1)
    wx = xs - x0
    wy = ys - y0
    top = image[y0, x0] * (1.0 - wx) + image[y0, x1] * wx
    bottom = image[y1, x0] * (1.0 - wx) + image[y1, x1] * wx
    return (top * (1.0 - wy) + bottom * wy).astype(np.float32)


def _profile_from_axis(
    roi_image: np.ndarray,
    *,
    nm_per_pixel: float,
    ux: float,
    uy: float,
    source: str,
    expected_spacing_nm: float | None = None,
) -> dict[str, Any] | None:
    norm = math.hypot(ux, uy)
    if norm <= 1e-9:
        return None
    ux /= norm
    uy /= norm

    roi = np.asarray(roi_image, dtype=np.float32)
    roi = roi - float(np.min(roi))
    max_value = float(np.max(roi))
    if max_value > 0:
        roi = roi / max_value

    height, width = roi.shape
    yy, xx = np.indices((height, width), dtype=np.float32)
    projections = (xx - (width - 1) / 2.0) * ux + (yy - (height - 1) / 2.0) * uy
    min_projection = float(np.floor(np.min(projections)))
    max_projection = float(np.ceil(np.max(projections)))
    bin_count = max(2, int(max_projection - min_projection + 1))
    bins = np.floor(projections - min_projection).astype(np.int32)
    valid = (bins >= 0) & (bins < bin_count)
    sums = np.bincount(bins[valid].ravel(), weights=roi[valid].ravel(), minlength=bin_count)
    counts = np.bincount(bins[valid].ravel(), minlength=bin_count)
    profile = sums / np.clip(counts, 1, None)

    if profile.size >= 9:
        profile = signal.savgol_filter(profile, 9, 2, mode="interp")
    profile = np.asarray(profile, dtype=np.float32)
    profile = profile - float(np.min(profile))
    peak_value = float(np.max(profile))
    if peak_value > 0:
        profile = profile / peak_value

    distance_nm = (np.arange(bin_count, dtype=np.float32) + min_projection) * nm_per_pixel
    positive_distance_nm = distance_nm - float(np.min(distance_nm))
    prominence = max(0.06, float(np.std(profile)) * 0.45)
    if expected_spacing_nm is not None and expected_spacing_nm > 0:
        min_peak_distance_px = max(2, int(round((expected_spacing_nm / max(nm_per_pixel, 1e-9)) * 0.45)))
        prominence = max(0.025, float(np.std(profile)) * 0.28)
    else:
        min_peak_distance_px = max(2, int(round(1.5 / max(nm_per_pixel, 1e-9))))
    peak_indices, properties = signal.find_peaks(
        profile,
        distance=min_peak_distance_px,
        prominence=prominence,
    )
    peaks = [
        {
            "index": int(index),
            "distance_nm": float(positive_distance_nm[index]),
            "intensity": float(profile[index]),
            "prominence": float(properties.get("prominences", np.zeros_like(peak_indices))[i]),
        }
        for i, index in enumerate(peak_indices)
    ]

    adjacent_spacing_nm = None
    if len(peaks) >= 2:
        adjacent_spacing_nm = float(np.median(np.diff([peak["distance_nm"] for peak in peaks])))
    span_measurement = _profile_span_spacing(
        peaks,
        distance_values=positive_distance_nm,
        expected_spacing_nm=expected_spacing_nm,
    )
    spacing_nm = None if span_measurement is None else span_measurement["spacing_nm"]

    return {
        "distance_nm": [float(value) for value in positive_distance_nm.tolist()],
        "intensity": [float(value) for value in profile.tolist()],
        "peaks": peaks,
        "spacing_nm": spacing_nm,
        "adjacent_median_spacing_nm": adjacent_spacing_nm,
        "expected_spacing_nm": expected_spacing_nm,
        "span_measurement": span_measurement,
        "axis_unit_vector_px": {"x": float(ux), "y": float(uy)},
        "source": source,
    }


def _profile_span_spacing(
    peaks: list[dict[str, float]],
    *,
    distance_values: np.ndarray,
    expected_spacing_nm: float | None,
) -> dict[str, Any] | None:
    if len(peaks) < 2:
        return None

    min_distance = float(distance_values[0])
    max_distance = float(distance_values[-1])
    span_range = max_distance - min_distance
    edge_margin = span_range * 0.04
    candidates = [
        peak for peak in peaks
        if min_distance + edge_margin <= float(peak["distance_nm"]) <= max_distance - edge_margin
    ]
    if len(candidates) < 2:
        candidates = peaks

    start = candidates[0]
    end = candidates[-1]
    span_nm = float(end["distance_nm"] - start["distance_nm"])
    if span_nm <= 0:
        return None

    if expected_spacing_nm is not None and expected_spacing_nm > 0:
        interval_count = max(1, int(round(span_nm / expected_spacing_nm)))
        method = "span_division_expected_fft_spacing"
    else:
        interval_count = max(1, len(candidates) - 1)
        method = "span_division_detected_peak_count"

    return {
        "start_peak": start,
        "end_peak": end,
        "peak_count": len(candidates),
        "interval_count": interval_count,
        "span_nm": span_nm,
        "spacing_nm": span_nm / interval_count,
        "method": method,
    }


def _png_data_url(values: np.ndarray) -> str:
    image = np.clip(values * 255.0, 0, 255).astype(np.uint8)
    buffer = io.BytesIO()
    try:
        from PIL import Image

        Image.fromarray(image, mode="L").save(buffer, format="PNG")
    except Exception:
        skio.imsave(buffer, image, format="png")
    encoded = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def _bounded_power_of_two(value: int, minimum: int, maximum: int) -> int:
    target = max(minimum, int(value))
    power = 1 << (target - 1).bit_length()
    return min(maximum, power)
