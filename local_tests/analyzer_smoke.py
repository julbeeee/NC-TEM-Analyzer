from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.web_app import _image_result_payload
from core.analyzer import Analyzer, AnalyzerSettings, Thresholds


def assert_close(actual: float, expected: float, label: str) -> None:
    if abs(actual - expected) > 1e-9:
        raise AssertionError(f"{label}: expected {expected:.6f}, got {actual:.6f}")


def test_spherical_metadata_and_annotations() -> None:
    prop = SimpleNamespace(
        equivalent_diameter=10.0,
        eccentricity=0.1,
        solidity=0.95,
        centroid=(20.0, 30.0),
        bbox=(15, 25, 25, 35),
        area=80,
    )
    analyzer = Analyzer(AnalyzerSettings(boundary_expand_px=2.0, dot_min_area_px=5))
    result = analyzer._analyze_spherical(
        [prop],
        nm_per_pix=0.5,
        thresholds=Thresholds(min_nm=1.0, max_nm=20.0, ecc_max=0.7, sol_min=0.5),
        scale_bar_box=(1.0, 2.0, 40.0, 4.0),
    )

    if result.count != 1:
        raise AssertionError(f"Expected one accepted particle, got {result.count}.")
    assert_close(result.nm_per_pixel or 0.0, 0.5, "nm_per_pixel")
    assert_close(result.values_nm[0], 7.0, "expanded diameter")
    assert_close(result.circles[0][2], 7.0, "expanded radius")

    annotation = result.circle_annotations[0]
    assert_close(annotation["diameter_nm"], 7.0, "annotation diameter")
    assert_close(annotation["auto_diameter_nm"], 5.0, "annotation auto diameter")
    assert_close(annotation["boundary_expand_px"], 2.0, "annotation boundary expansion")

    payload = _image_result_payload(
        name="synthetic.png",
        mode="spherical",
        result=result,
        detector_method="current_python",
    )
    assert_close(payload["nm_per_pixel"], 0.5, "payload nm_per_pixel")
    if len(payload["circle_annotations"]) != 1:
        raise AssertionError("Payload did not include circle annotations.")


def test_boxed_scale_bar_prefers_inner_horizontal_bar() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    gray[112:115, 32:164] = 1.0
    gray[164:167, 32:164] = 1.0
    gray[112:167, 32:35] = 1.0
    gray[112:167, 161:164] = 1.0
    gray[126:132, 60:140] = 1.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            white_thr=245,
            sb_min_area=20,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, 50.0, "white")

    assert_close(scale_bar_box[0], 60.0, "scale bar x")
    assert_close(scale_bar_box[2], 80.0, "scale bar width")
    assert_close(nm_per_pixel, 0.625, "boxed scale bar nm_per_pixel")


def test_boxed_scale_bar_platelet_detector_matches_spherical_detector() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    gray[112:115, 32:164] = 1.0
    gray[164:167, 32:164] = 1.0
    gray[112:167, 32:35] = 1.0
    gray[112:167, 161:164] = 1.0
    gray[126:132, 60:140] = 1.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            white_thr=245,
            sb_min_area=20,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar_platelet(gray, 50.0, "white")

    assert_close(scale_bar_box[0], 60.0, "platelet scale bar x")
    assert_close(scale_bar_box[2], 80.0, "platelet scale bar width")
    assert_close(nm_per_pixel, 0.625, "platelet boxed scale bar nm_per_pixel")


def test_black_boxed_scale_bar_prefers_inner_horizontal_bar() -> None:
    gray = np.full((180, 220), 0.65, dtype=np.float32)
    gray[112:115, 32:164] = 0.0
    gray[164:167, 32:164] = 0.0
    gray[112:167, 32:35] = 0.0
    gray[112:167, 161:164] = 0.0
    gray[126:132, 60:140] = 0.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            black_thr=10,
            sb_min_area=20,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, 50.0, "black")

    assert_close(scale_bar_box[0], 60.0, "black scale bar x")
    assert_close(scale_bar_box[2], 80.0, "black scale bar width")
    assert_close(nm_per_pixel, 0.625, "black boxed scale bar nm_per_pixel")


def test_black_bar_inside_white_label_panel_is_detected_in_black_mode() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    gray[128:166, 150:190] = 1.0
    gray[146:147, 158:184] = 0.0
    gray[153:158, 162:178:4] = 0.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            white_thr=245,
            black_thr=10,
            sb_min_area=200,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, 50.0, "black")

    assert_close(scale_bar_box[0], 158.0, "black-in-white scale bar x")
    assert_close(scale_bar_box[2], 26.0, "black-in-white scale bar width")
    assert_close(nm_per_pixel, 50.0 / 26.0, "black-in-white nm_per_pixel")


def test_black_bar_inside_white_label_panel_is_preferred_over_panel_in_white_mode() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    gray[128:166, 150:190] = 1.0
    gray[146:147, 158:184] = 0.0
    gray[153:158, 162:178:4] = 0.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            white_thr=245,
            black_thr=10,
            sb_min_area=200,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, 50.0, "white")

    assert_close(scale_bar_box[0], 158.0, "white-mode black-in-white scale bar x")
    assert_close(scale_bar_box[2], 26.0, "white-mode black-in-white scale bar width")
    assert_close(nm_per_pixel, 50.0 / 26.0, "white-mode black-in-white nm_per_pixel")


def test_particle_roi_excludes_from_detected_scale_bar_area() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    analyzer = Analyzer(AnalyzerSettings(crop_bottom_px=150))

    roi = analyzer._extract_roi(gray, (158.0, 146.0, 26.0, 1.0))

    if roi.shape != (126, 220):
        raise AssertionError(f"Expected ROI height 126 from scale bar exclusion, got {roi.shape}.")


def test_particle_roi_falls_back_to_bottom_crop_without_scale_bar() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    analyzer = Analyzer(AnalyzerSettings(crop_bottom_px=40))

    roi = analyzer._extract_roi(gray, None)

    if roi.shape != (140, 220):
        raise AssertionError(f"Expected ROI height 140 from bottom crop fallback, got {roi.shape}.")


def test_disconnected_box_edge_does_not_outrank_inner_scale_bar() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    gray[112:115, 32:164] = 1.0
    gray[164:167, 32:164] = 1.0
    gray[126:132, 60:140] = 1.0
    gray[145:159, 50:145:2] = 1.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            white_thr=245,
            sb_min_area=20,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, 50.0, "white")

    assert_close(scale_bar_box[0], 60.0, "split-edge scale bar x")
    assert_close(scale_bar_box[2], 80.0, "split-edge scale bar width")
    assert_close(nm_per_pixel, 0.625, "split-edge boxed scale bar nm_per_pixel")


def test_thicker_disconnected_box_edge_does_not_outrank_inner_scale_bar() -> None:
    gray = np.full((180, 220), 0.35, dtype=np.float32)
    gray[112:116, 32:164] = 1.0
    gray[164:169, 32:164] = 1.0
    gray[126:132, 60:140] = 1.0
    gray[145:159, 50:145:2] = 1.0

    analyzer = Analyzer(
        AnalyzerSettings(
            sb_region_ratio=0.55,
            white_thr=245,
            sb_min_area=20,
        )
    )

    scale_bar_box, nm_per_pixel = analyzer._detect_scale_bar(gray, 50.0, "white")

    assert_close(scale_bar_box[0], 60.0, "thick split-edge scale bar x")
    assert_close(scale_bar_box[2], 80.0, "thick split-edge scale bar width")
    assert_close(nm_per_pixel, 0.625, "thick split-edge boxed scale bar nm_per_pixel")


def main() -> None:
    test_spherical_metadata_and_annotations()
    test_boxed_scale_bar_prefers_inner_horizontal_bar()
    test_boxed_scale_bar_platelet_detector_matches_spherical_detector()
    test_black_boxed_scale_bar_prefers_inner_horizontal_bar()
    test_black_bar_inside_white_label_panel_is_detected_in_black_mode()
    test_black_bar_inside_white_label_panel_is_preferred_over_panel_in_white_mode()
    test_particle_roi_excludes_from_detected_scale_bar_area()
    test_particle_roi_falls_back_to_bottom_crop_without_scale_bar()
    test_disconnected_box_edge_does_not_outrank_inner_scale_bar()
    test_thicker_disconnected_box_edge_does_not_outrank_inner_scale_bar()
    print("analyzer_smoke: ok")


if __name__ == "__main__":
    main()
