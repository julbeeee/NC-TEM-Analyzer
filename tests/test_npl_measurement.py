from __future__ import annotations

import itertools
import math
import sys
import unittest
from pathlib import Path

import numpy as np
from skimage import draw, measure

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.web_app import _image_result_payload
from core.analyzer import Analyzer, PlateletThresholds
from core.rectangle_geometry import MEASUREMENT_DEFINITION, rotated_rectangle_side_lengths
from core.rectangle_seed import SeedDetectorConfig, build_seed_from_points, detect_rectangles_with_seed


def rectangle_corners(
    length: float = 80.0,
    width: float = 20.0,
    angle_deg: float = 0.0,
    center: tuple[float, float] = (128.0, 128.0),
) -> list[tuple[float, float]]:
    angle = math.radians(angle_deg)
    long_axis = np.array([math.cos(angle), math.sin(angle)])
    short_axis = np.array([-math.sin(angle), math.cos(angle)])
    center_point = np.asarray(center, dtype=float)
    return [
        tuple(center_point - long_axis * length / 2.0 - short_axis * width / 2.0),
        tuple(center_point + long_axis * length / 2.0 - short_axis * width / 2.0),
        tuple(center_point + long_axis * length / 2.0 + short_axis * width / 2.0),
        tuple(center_point - long_axis * length / 2.0 + short_axis * width / 2.0),
    ]


def region_property_for_rectangle(angle_deg: float = 30.0):
    corners = np.asarray(rectangle_corners(angle_deg=angle_deg))
    mask = np.zeros((256, 256), dtype=np.uint8)
    rr, cc = draw.polygon(corners[:, 1], corners[:, 0], shape=mask.shape)
    mask[rr, cc] = 1
    return measure.regionprops(measure.label(mask))[0]


class RotatedRectangleGeometryTests(unittest.TestCase):
    def test_side_lengths_are_rotation_independent(self) -> None:
        for angle in (0.0, 15.0, 45.0, 80.0):
            with self.subTest(angle=angle):
                long_px, short_px = rotated_rectangle_side_lengths(rectangle_corners(angle_deg=angle))
                self.assertAlmostEqual(long_px, 80.0, places=10)
                self.assertAlmostEqual(short_px, 20.0, places=10)
                self.assertAlmostEqual(long_px / short_px, 4.0, places=10)

    def test_side_lengths_are_corner_order_independent(self) -> None:
        corners = rectangle_corners(angle_deg=37.0)
        for permutation in itertools.permutations(corners):
            long_px, short_px = rotated_rectangle_side_lengths(permutation)
            self.assertAlmostEqual(long_px, 80.0, places=10)
            self.assertAlmostEqual(short_px, 20.0, places=10)

    def test_invalid_geometry_is_rejected_without_fallback(self) -> None:
        invalid_cases = {
            "duplicate": [(0, 0), (80, 0), (80, 20), (80, 20)],
            "zero_height": [(0, 0), (80, 0), (80, 0), (0, 0)],
            "nan": [(0, 0), (80, 0), (80, float("nan")), (0, 20)],
            "inf": [(0, 0), (80, 0), (80, float("inf")), (0, 20)],
            "three_points": [(0, 0), (80, 0), (80, 20)],
            "near_zero_short_side": rectangle_corners(width=1e-12),
            "not_a_rectangle": [(0, 0), (80, 0), (70, 20), (0, 20)],
        }
        for name, points in invalid_cases.items():
            with self.subTest(name=name):
                with self.assertRaises(ValueError):
                    rotated_rectangle_side_lengths(points)


class NplMeasurementIntegrationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.nm_per_pixel = 0.2
        self.prop = region_property_for_rectangle()
        self.thresholds = PlateletThresholds(
            min_length_nm=1.0,
            # The displayed rectangle is about 16 nm long while the legacy
            # equivalent-ellipse major axis is about 18.5 nm. This threshold
            # proves that acceptance uses the reported rectangle definition.
            max_length_nm=17.0,
            aspect_min=1.0,
            ecc_min=0.0,
            extent_min=0.0,
            sol_min=0.0,
            min_area_px=1,
        )

    def test_general_detector_uses_displayed_rectangle_for_all_outputs(self) -> None:
        result = Analyzer()._analyze_platelets(
            [self.prop], self.nm_per_pixel, self.thresholds
        )
        self.assertEqual(result.count, 1)
        rectangle_long_px, rectangle_short_px = rotated_rectangle_side_lengths(result.rotated_boxes[0])
        expected_long_nm = rectangle_long_px * self.nm_per_pixel
        expected_short_nm = rectangle_short_px * self.nm_per_pixel

        self.assertAlmostEqual(result.values_nm[0], expected_long_nm, places=10)
        self.assertAlmostEqual(result.short_values_nm[0], expected_short_nm, places=10)
        # Rasterization shifts the projected rectangle by less than one pixel,
        # so the integration tolerance is wider than the exact helper tests.
        self.assertAlmostEqual(result.values_nm[0], 16.0, delta=0.05)
        self.assertAlmostEqual(result.short_values_nm[0], 4.0, delta=0.05)
        self.assertGreater(float(self.prop.axis_major_length) * self.nm_per_pixel, 17.0)
        self.assertNotAlmostEqual(
            result.values_nm[0], float(self.prop.axis_major_length) * self.nm_per_pixel, places=3
        )

        annotation = result.rectangle_annotations[0]
        self.assertEqual(result.measurement_definition, MEASUREMENT_DEFINITION)
        self.assertEqual(annotation["measurement_definition"], MEASUREMENT_DEFINITION)
        self.assertAlmostEqual(annotation["long_axis_nm"], expected_long_nm, places=10)
        self.assertAlmostEqual(annotation["short_axis_nm"], expected_short_nm, places=10)
        self.assertAlmostEqual(annotation["aspect_ratio"], expected_long_nm / expected_short_nm, places=10)
        self.assertAlmostEqual(result.mean_nm, expected_long_nm, places=10)
        self.assertAlmostEqual(result.short_mean_nm, expected_short_nm, places=10)

        payload = _image_result_payload(
            name="synthetic_npl.png",
            mode="platelet",
            result=result,
            detector_method="current_python",
        )
        self.assertEqual(payload["measurement_definition"], MEASUREMENT_DEFINITION)
        self.assertEqual(payload["values_nm"], result.values_nm)
        self.assertEqual(payload["short_values_nm"], result.short_values_nm)
        self.assertEqual(payload["rectangle_annotations"], result.rectangle_annotations)

    def test_seed_candidate_uses_same_displayed_rectangle_definition(self) -> None:
        corners = np.asarray(rectangle_corners(angle_deg=30.0))
        gray = np.full((256, 256), 0.85, dtype=np.float32)
        rr, cc = draw.polygon(corners[:, 1], corners[:, 0], shape=gray.shape)
        gray[rr, cc] = 0.15
        seed = build_seed_from_points(corners, gray)
        candidates = detect_rectangles_with_seed(
            gray,
            self.nm_per_pixel,
            seed,
            SeedDetectorConfig(
                crop_bottom_px=0,
                gamma=1.0,
                gauss_sigma=0.0,
                adapthist_clip=0.01,
                adapthist_tiles=(4, 4),
                threshold_offsets=(0.0,),
                min_aspect=1.0,
                min_extent=0.0,
                min_solidity=0.0,
            ),
        )
        self.assertEqual(len(candidates), 1)
        candidate = candidates[0]
        rectangle_long_px, rectangle_short_px = rotated_rectangle_side_lengths(candidate.polygon)
        self.assertAlmostEqual(candidate.length_nm, rectangle_long_px * self.nm_per_pixel, places=10)
        self.assertAlmostEqual(candidate.width_nm, rectangle_short_px * self.nm_per_pixel, places=10)
        self.assertAlmostEqual(candidate.aspect, candidate.length_nm / candidate.width_nm, places=10)
        self.assertNotAlmostEqual(candidate.length_px, candidate.ellipse_major_axis_px, places=3)
        self.assertNotAlmostEqual(candidate.width_px, candidate.ellipse_minor_axis_px, places=3)


if __name__ == "__main__":
    unittest.main()
