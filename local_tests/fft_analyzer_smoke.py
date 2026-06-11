from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.fft_analyzer import (
    FftAnalysisError,
    FftAnalysisSettings,
    analyze_fft_roi,
    apply_ifft_roi_settings,
    measure_peak_pair,
)


def assert_close(actual: float, expected: float, rel: float, label: str) -> None:
    if abs(actual - expected) > abs(expected) * rel:
        raise AssertionError(f"{label}: expected {expected:.6f}, got {actual:.6f}")


def synthetic_lattice(width: int = 256, height: int = 256, period_px: float = 16.0) -> np.ndarray:
    x = np.arange(width, dtype=np.float32)
    row = 0.5 + 0.35 * np.sin((2.0 * np.pi * x) / period_px)
    return np.tile(row, (height, 1)).astype(np.float32)


def test_synthetic_spacing() -> None:
    nm_per_pixel = 0.2
    period_px = 16.0
    image = synthetic_lattice(period_px=period_px)
    result = analyze_fft_roi(
        image,
        {"x": 0, "y": 0, "width": image.shape[1], "height": image.shape[0]},
        known_nm=100.0,
        sb_color="white",
        nm_per_pixel_override=nm_per_pixel,
    )
    expected_nm = period_px * nm_per_pixel
    assert result["d_spacing_nm"] is not None
    assert_close(result["d_spacing_nm"], expected_nm, 0.05, "synthetic d-spacing")
    if not result.get("inverse_fft_image"):
        raise AssertionError("Synthetic FFT did not return an inverse FFT preview.")
    if result["intensity_profile"]["source"] != "inverse_fft_peak_direction":
        raise AssertionError("Synthetic profile was not measured from inverse FFT output.")
    if result["fft_line_profile"]["source"] != "fft_frequency_line":
        raise AssertionError("Synthetic FFT did not return an FFT frequency profile.")
    assert_close(
        result["fft_line_profile"]["selected_d_spacing_nm"],
        expected_nm,
        0.05,
        "synthetic FFT line profile d-spacing",
    )
    span = result["intensity_profile"].get("span_measurement")
    if not span or span["interval_count"] < 2:
        raise AssertionError("Synthetic inverse FFT profile did not return a span measurement.")
    assert_close(result["intensity_profile"]["spacing_nm"], expected_nm, 0.08, "synthetic inverse span d-spacing")


def test_roi_validation() -> None:
    image = synthetic_lattice()
    try:
        analyze_fft_roi(
            image,
            {"x": 0, "y": 0, "width": 32, "height": 32},
            known_nm=100.0,
            sb_color="white",
            nm_per_pixel_override=0.2,
        )
    except FftAnalysisError as exc:
        if "64 x 64" not in str(exc):
            raise
    else:
        raise AssertionError("Small FFT ROI did not fail validation.")

    try:
        analyze_fft_roi(
            image,
            {"x": 220, "y": 0, "width": 80, "height": 80},
            known_nm=100.0,
            sb_color="white",
            nm_per_pixel_override=0.2,
        )
    except FftAnalysisError as exc:
        if "inside the image" not in str(exc):
            raise
    else:
        raise AssertionError("Out-of-bounds FFT ROI did not fail validation.")


def test_apply_ifft_from_existing_pair() -> None:
    nm_per_pixel = 0.2
    period_px = 16.0
    image = synthetic_lattice(period_px=period_px)
    roi = {"x": 0, "y": 0, "width": image.shape[1], "height": image.shape[0]}
    fft_result = analyze_fft_roi(
        image,
        roi,
        known_nm=100.0,
        sb_color="white",
        nm_per_pixel_override=nm_per_pixel,
    )
    result = apply_ifft_roi_settings(
        image,
        roi,
        known_nm=100.0,
        sb_color="white",
        peak_pair=fft_result["selected_peak_pair"],
        nm_per_pixel_override=nm_per_pixel,
        fft_settings=FftAnalysisSettings(
            inverse_peak_mask_radius_px=8,
            ifft_mode="pair_only",
        ),
    )

    expected_nm = period_px * nm_per_pixel
    if result["ifft_mode"] != "pair_only":
        raise AssertionError("IFFT apply did not preserve the requested mode.")
    if result["inverse_fft_peak_mask_radius_px"] != 8:
        raise AssertionError("IFFT apply did not preserve the requested mask radius.")
    if not result.get("inverse_fft_image"):
        raise AssertionError("IFFT apply did not return an inverse FFT preview.")
    assert_close(result["d_spacing_nm"], expected_nm, 0.05, "applied IFFT d-spacing")


def test_manual_peak_formula() -> None:
    fft_width = 256
    fft_height = 256
    nm_per_pixel = 0.2
    center_x = fft_width / 2.0
    center_y = fft_height / 2.0
    peak_pair = [
        {"x": center_x + 16.0, "y": center_y, "intensity": 1.0},
        {"x": center_x - 16.0, "y": center_y, "intensity": 1.0},
    ]
    result = measure_peak_pair(
        peak_pair,
        nm_per_pixel=nm_per_pixel,
        fft_width=fft_width,
        fft_height=fft_height,
    )
    assert_close(result["d_spacing_nm"], 16.0 * nm_per_pixel, 1e-6, "manual peak d-spacing")
    assert_close(result["lattice_angle_deg"], 0.0, 1e-6, "manual peak angle")


def main() -> None:
    test_synthetic_spacing()
    test_roi_validation()
    test_apply_ifft_from_existing_pair()
    test_manual_peak_formula()
    print("fft_analyzer_smoke: ok")


if __name__ == "__main__":
    main()
