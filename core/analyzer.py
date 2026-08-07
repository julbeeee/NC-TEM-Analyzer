from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import numpy as np
from scipy import ndimage as ndi
from skimage import color, exposure, feature, filters, io, measure, morphology, segmentation

from core.rectangle_geometry import MEASUREMENT_DEFINITION, rotated_rectangle_side_lengths
from core.scale_bar import detect_scale_bar, scale_bar_exclusion_top


@dataclass
class Thresholds:
    min_nm: float = 3.5
    max_nm: float = 9.0
    ecc_max: float = 0.7
    sol_min: float = 0.5


@dataclass
class PlateletThresholds:
    min_length_nm: float = 3.0
    max_length_nm: float = 15.0
    aspect_min: float = 1.8
    ecc_min: float = 0.65
    extent_min: float = 0.35
    sol_min: float = 0.35
    min_area_px: int = 35
    split_min_distance_px: int = 5
    small_relax_max_length_nm: float = 5.0
    small_relax_ecc_delta: float = 0.12
    small_relax_extent_delta: float = 0.10
    small_relax_sol_delta: float = 0.10


@dataclass
class AnalyzerSettings:
    sb_color: str = "white"  # "white" or "black"
    sb_region_ratio: float = 0.85
    white_thr: int = 245
    black_thr: int = 10
    sb_min_area: int = 200
    crop_bottom_px: int = 150
    gamma: float = 0.08
    gauss_sigma: float = 0.45
    adapthist_clip: float = 0.02
    adapthist_tiles: tuple[int, int] = (4, 4)
    dot_min_area_px: int = 30
    boundary_expand_px: float = 0.0


@dataclass
class ImageResult:
    count: int
    mean_nm: float | None
    std_nm: float | None
    values_nm: list[float]
    circles: list[tuple[float, float, float]]  # (x, y, r) in image pixels
    boxes: list[tuple[float, float, float, float]]  # (x, y, w, h)
    short_mean_nm: float | None = None
    short_std_nm: float | None = None
    short_values_nm: list[float] = field(default_factory=list)
    rotated_boxes: list[list[tuple[float, float]]] = field(default_factory=list)
    scale_bar_box: tuple[float, float, float, float] | None = None  # (x, y, w, h)
    nm_per_pixel: float | None = None
    circle_annotations: list[dict[str, Any]] = field(default_factory=list)
    rectangle_annotations: list[dict[str, Any]] = field(default_factory=list)
    measurement_definition: str | None = None
    mode: str = "spherical"


class Analyzer:
    def __init__(self, settings: AnalyzerSettings | None = None) -> None:
        self.settings = settings or AnalyzerSettings()

    def analyze_image(
        self,
        image_path: str,
        known_nm: float,
        thresholds: Thresholds | PlateletThresholds,
        sb_color: str | None = None,
    ) -> ImageResult:
        settings = self.settings
        sb_color = (sb_color or settings.sb_color).lower()

        image = io.imread(image_path)
        gray = self._to_gray(image)

        if isinstance(thresholds, PlateletThresholds):
            scale_bar_box, nm_per_pix = self._detect_scale_bar_platelet(gray, known_nm, sb_color)
            return self._analyze_platelet_image(gray, nm_per_pix, thresholds, scale_bar_box)
        scale_bar_box, nm_per_pix = self._detect_scale_bar(gray, known_nm, sb_color)
        return self._analyze_spherical_image(gray, nm_per_pix, thresholds, scale_bar_box)

    def _to_gray(self, image: np.ndarray) -> np.ndarray:
        if image.ndim == 2:
            gray = image.astype(np.float32)
            if gray.max() > 1.0:
                gray /= 255.0
            return gray

        if image.ndim == 3:
            if image.shape[2] == 4:
                return color.rgb2gray(color.rgba2rgb(image))
            if image.shape[2] >= 3:
                return color.rgb2gray(image[..., :3])
            gray = image[..., 0].astype(np.float32)
            if gray.max() > 1.0:
                gray /= 255.0
            return gray

        raise ValueError("Unsupported image shape.")

    def _detect_scale_bar(
        self,
        gray: np.ndarray,
        known_nm: float,
        sb_color: str,
    ) -> tuple[tuple[float, float, float, float], float]:
        return detect_scale_bar(gray, known_nm, sb_color, self.settings)

    def _measure_nm_per_pix(
        self,
        gray: np.ndarray,
        known_nm: float,
        sb_color: str,
    ) -> float:
        _, nm_per_pix = self._detect_scale_bar(gray, known_nm, sb_color)
        return nm_per_pix

    def _detect_scale_bar_platelet(
        self,
        gray: np.ndarray,
        known_nm: float,
        sb_color: str,
    ) -> tuple[tuple[float, float, float, float], float]:
        return detect_scale_bar(gray, known_nm, sb_color, self.settings)

    def _extract_roi(
        self,
        gray: np.ndarray,
        scale_bar_box: tuple[float, float, float, float] | None = None,
    ) -> np.ndarray:
        h_img = gray.shape[0]
        roi_height = scale_bar_exclusion_top(h_img, scale_bar_box, self.settings.crop_bottom_px)
        if roi_height <= 1:
            raise ValueError("Crop bottom too large for this image.")
        return gray[:roi_height, :]

    def _enhance_roi(self, roi: np.ndarray) -> np.ndarray:
        settings = self.settings
        tile_y, tile_x = settings.adapthist_tiles
        if tile_y <= 0 or tile_x <= 0:
            raise ValueError("adapthist_tiles values must be positive integers.")

        kernel_size = (
            max(2, roi.shape[0] // tile_y),
            max(2, roi.shape[1] // tile_x),
        )
        roi_eq = exposure.equalize_adapthist(
            roi,
            clip_limit=settings.adapthist_clip,
            kernel_size=kernel_size,
            nbins=256,
        )
        roi_gamma = exposure.adjust_gamma(roi_eq, settings.gamma)
        return filters.gaussian(roi_gamma, sigma=settings.gauss_sigma)

    def _analyze_spherical_image(
        self,
        gray: np.ndarray,
        nm_per_pix: float,
        thresholds: Thresholds,
        scale_bar_box: tuple[float, float, float, float] | None = None,
    ) -> ImageResult:
        roi = self._extract_roi(gray, scale_bar_box)
        roi_f = self._enhance_roi(roi)

        level = filters.threshold_otsu(roi_f)
        bw = np.logical_not(roi_f > level)
        bw = morphology.remove_small_objects(bw, max(1, int(self.settings.dot_min_area_px)))
        bw = ndi.binary_fill_holes(bw)

        props = measure.regionprops(measure.label(bw))
        if not props:
            return self._empty_result("spherical", scale_bar_box, nm_per_pix)
        return self._analyze_spherical(props, nm_per_pix, thresholds, scale_bar_box)

    def _analyze_platelet_image(
        self,
        gray: np.ndarray,
        nm_per_pix: float,
        thresholds: PlateletThresholds,
        scale_bar_box: tuple[float, float, float, float] | None = None,
    ) -> ImageResult:
        roi = self._extract_roi(gray, scale_bar_box)
        roi_f = self._enhance_roi(roi)

        level = filters.threshold_otsu(roi_f)
        bw = np.logical_not(roi_f > level)
        bw = ndi.binary_fill_holes(bw)

        labels = self._segment_platelets(bw, thresholds)
        props = measure.regionprops(labels)
        if not props:
            return self._empty_result("platelet", scale_bar_box, nm_per_pix)
        return self._analyze_platelets(props, nm_per_pix, thresholds, scale_bar_box)

    def _empty_result(
        self,
        mode: str,
        scale_bar_box: tuple[float, float, float, float] | None = None,
        nm_per_pix: float | None = None,
    ) -> ImageResult:
        return ImageResult(
            count=0,
            mean_nm=None,
            std_nm=None,
            values_nm=[],
            circles=[],
            boxes=[],
            short_values_nm=[],
            scale_bar_box=scale_bar_box,
            nm_per_pixel=nm_per_pix,
            measurement_definition=MEASUREMENT_DEFINITION if mode == "platelet" else None,
            mode=mode,
        )

    def _segment_platelets(self, bw: np.ndarray, thresholds: PlateletThresholds) -> np.ndarray:
        cleaned = morphology.remove_small_objects(bw, thresholds.min_area_px)
        if not np.any(cleaned):
            return measure.label(cleaned)

        distance = ndi.distance_transform_edt(cleaned)
        peak_coords = feature.peak_local_max(
            distance,
            labels=cleaned,
            min_distance=max(1, thresholds.split_min_distance_px),
            exclude_border=False,
        )

        if peak_coords.size == 0:
            labels = measure.label(cleaned)
        else:
            markers = np.zeros_like(cleaned, dtype=np.int32)
            for i, (r, c) in enumerate(peak_coords, start=1):
                markers[r, c] = i
            labels = segmentation.watershed(-distance, markers, mask=cleaned)

        props = measure.regionprops(labels)
        filtered = np.zeros_like(labels, dtype=np.int32)
        new_id = 1
        for prop in props:
            if prop.area < thresholds.min_area_px:
                continue
            filtered[labels == prop.label] = new_id
            new_id += 1
        return filtered

    def _analyze_spherical(
        self,
        props: list[Any],
        nm_per_pix: float,
        thresholds: Thresholds,
        scale_bar_box: tuple[float, float, float, float] | None = None,
    ) -> ImageResult:
        equiv_diam = np.array([self._equivalent_diameter(prop) for prop in props], dtype=float)
        ecc = np.array([p.eccentricity for p in props], dtype=float)
        sol = np.array([p.solidity for p in props], dtype=float)

        boundary_expand_px = max(0.0, float(self.settings.boundary_expand_px))
        expanded_diam = equiv_diam + (boundary_expand_px * 2.0)
        d_nm = expanded_diam * nm_per_pix
        valid = (
            (d_nm >= thresholds.min_nm)
            & (d_nm <= thresholds.max_nm)
            & (ecc <= thresholds.ecc_max)
            & (sol >= thresholds.sol_min)
        )

        values = d_nm[valid]
        if values.size == 0:
            return ImageResult(
                count=0,
                mean_nm=None,
                std_nm=None,
                values_nm=[],
                circles=[],
                boxes=[],
                short_values_nm=[],
                scale_bar_box=scale_bar_box,
                nm_per_pixel=nm_per_pix,
                mode="spherical",
            )

        circles: list[tuple[float, float, float]] = []
        circle_annotations: list[dict[str, Any]] = []
        for prop, keep in zip(props, valid):
            if not keep:
                continue
            cy, cx = prop.centroid
            base_radius = self._equivalent_diameter(prop) / 2.0
            radius = base_radius + boundary_expand_px
            diameter_nm = (radius * 2.0) * nm_per_pix
            minr, minc, maxr, maxc = prop.bbox
            annotation_index = len(circles)
            circles.append((float(cx), float(cy), float(radius)))
            circle_annotations.append(
                {
                    "id": f"dot-{annotation_index + 1}",
                    "index": annotation_index,
                    "geometry_type": "circle",
                    "source": "auto",
                    "accepted": True,
                    "cx_px": float(cx),
                    "cy_px": float(cy),
                    "auto_cx_px": float(cx),
                    "auto_cy_px": float(cy),
                    "radius_px": float(radius),
                    "diameter_nm": float(diameter_nm),
                    "auto_radius_px": float(base_radius),
                    "auto_diameter_nm": float((base_radius * 2.0) * nm_per_pix),
                    "boundary_expand_px": float(boundary_expand_px),
                    "manual_delta_px": 0.0,
                    "manual_center_delta_px": [0.0, 0.0],
                    "component_area_px": float(prop.area),
                    "eccentricity": float(prop.eccentricity),
                    "solidity": float(prop.solidity),
                    "bbox_px": [
                        float(minc),
                        float(minr),
                        float(maxc - minc),
                        float(maxr - minr),
                    ],
                }
            )

        return ImageResult(
            count=int(values.size),
            mean_nm=float(np.mean(values)),
            std_nm=float(np.std(values)),
            values_nm=values.tolist(),
            circles=circles,
            boxes=[],
            short_values_nm=[],
            circle_annotations=circle_annotations,
            scale_bar_box=scale_bar_box,
            nm_per_pixel=nm_per_pix,
            mode="spherical",
        )

    def _analyze_platelets(
        self,
        props: list[Any],
        nm_per_pix: float,
        thresholds: PlateletThresholds,
        scale_bar_box: tuple[float, float, float, float] | None = None,
    ) -> ImageResult:
        ellipse_major_axis = np.array([self._ellipse_major_axis(prop) for prop in props], dtype=float)
        ellipse_minor_axis = np.array([self._ellipse_minor_axis(prop) for prop in props], dtype=float)
        ecc = np.array([p.eccentricity for p in props], dtype=float)
        extent = np.array([p.extent for p in props], dtype=float)
        sol = np.array([p.solidity for p in props], dtype=float)

        candidate_polygons: list[list[tuple[float, float]]] = []
        long_px_values: list[float] = []
        short_px_values: list[float] = []
        geometry_valid: list[bool] = []
        for prop in props:
            polygon = self._rotated_box_points(prop)
            try:
                long_px, short_px = rotated_rectangle_side_lengths(polygon)
            except ValueError:
                candidate_polygons.append([])
                long_px_values.append(float("nan"))
                short_px_values.append(float("nan"))
                geometry_valid.append(False)
                continue
            candidate_polygons.append(polygon)
            long_px_values.append(long_px)
            short_px_values.append(short_px)
            geometry_valid.append(True)

        long_px_array = np.asarray(long_px_values, dtype=float)
        short_px_array = np.asarray(short_px_values, dtype=float)
        valid_geometry = np.asarray(geometry_valid, dtype=bool)
        long_nm = long_px_array * nm_per_pix
        short_nm = short_px_array * nm_per_pix
        with np.errstate(divide="ignore", invalid="ignore"):
            aspect = long_nm / short_nm
        strict_shape = (
            valid_geometry
            & (long_nm >= thresholds.min_length_nm)
            & (long_nm <= thresholds.max_length_nm)
            & (aspect >= thresholds.aspect_min)
            & (ecc >= thresholds.ecc_min)
            & (extent >= thresholds.extent_min)
            & (sol >= thresholds.sol_min)
        )
        relaxed_shape = (
            valid_geometry
            & (long_nm >= thresholds.min_length_nm)
            & (long_nm <= thresholds.max_length_nm)
            & (aspect >= max(1.2, thresholds.aspect_min - 0.3))
            & (ecc >= max(0.3, thresholds.ecc_min - thresholds.small_relax_ecc_delta))
            & (extent >= max(0.1, thresholds.extent_min - thresholds.small_relax_extent_delta))
            & (sol >= max(0.1, thresholds.sol_min - thresholds.small_relax_sol_delta))
        )
        small_mask = long_nm <= thresholds.small_relax_max_length_nm
        valid = strict_shape | (small_mask & relaxed_shape)

        long_values = long_nm[valid]
        short_values = short_nm[valid]
        if long_values.size == 0:
            return self._empty_result("platelet", scale_bar_box, nm_per_pix)

        boxes: list[tuple[float, float, float, float]] = []
        rotated_boxes: list[list[tuple[float, float]]] = []
        rectangle_annotations: list[dict[str, Any]] = []
        for prop_index, (prop, keep, polygon) in enumerate(zip(props, valid, candidate_polygons)):
            if not keep:
                continue
            minr, minc, maxr, maxc = prop.bbox
            bbox = (float(minc), float(minr), float(maxc - minc), float(maxr - minr))
            annotation_index = len(rotated_boxes)
            long_axis_nm = float(long_nm[prop_index])
            short_axis_nm = float(short_nm[prop_index])
            aspect_ratio = long_axis_nm / short_axis_nm
            cy, cx = prop.centroid
            boxes.append(bbox)
            rotated_boxes.append(polygon)
            rectangle_annotations.append(
                {
                    "id": f"rect-{annotation_index + 1}",
                    "index": annotation_index,
                    "geometry_type": "rotated_rectangle",
                    "measurement_definition": MEASUREMENT_DEFINITION,
                    "source": "auto",
                    "accepted": True,
                    "length_nm": long_axis_nm,
                    "width_nm": short_axis_nm,
                    "long_axis_nm": long_axis_nm,
                    "short_axis_nm": short_axis_nm,
                    "aspect": aspect_ratio,
                    "aspect_ratio": aspect_ratio,
                    "center_px": [float(cx), float(cy)],
                    "polygon_px": polygon,
                    "bbox_px": list(bbox),
                    "ellipse_major_axis_px": float(ellipse_major_axis[prop_index]),
                    "ellipse_minor_axis_px": float(ellipse_minor_axis[prop_index]),
                    "component_area_px": float(prop.area),
                    "extent": float(prop.extent),
                    "solidity": float(prop.solidity),
                    "eccentricity": float(prop.eccentricity),
                }
            )

        return ImageResult(
            count=int(long_values.size),
            mean_nm=float(np.mean(long_values)),
            std_nm=float(np.std(long_values)),
            values_nm=long_values.tolist(),
            circles=[],
            boxes=boxes,
            short_mean_nm=float(np.mean(short_values)),
            short_std_nm=float(np.std(short_values)),
            short_values_nm=short_values.tolist(),
            rotated_boxes=rotated_boxes,
            rectangle_annotations=rectangle_annotations,
            scale_bar_box=scale_bar_box,
            nm_per_pixel=nm_per_pix,
            measurement_definition=MEASUREMENT_DEFINITION,
            mode="platelet",
        )

    def _equivalent_diameter(self, prop: Any) -> float:
        if hasattr(prop, "equivalent_diameter"):
            return float(prop.equivalent_diameter)
        return float(prop.equivalent_diameter_area)

    def _ellipse_major_axis(self, prop: Any) -> float:
        if hasattr(prop, "axis_major_length"):
            return float(prop.axis_major_length)
        return float(prop.major_axis_length)

    def _ellipse_minor_axis(self, prop: Any) -> float:
        if hasattr(prop, "axis_minor_length"):
            return float(prop.axis_minor_length)
        return float(prop.minor_axis_length)

    def _rotated_box_points(self, prop: Any) -> list[tuple[float, float]]:
        # Build an oriented rectangle from principal axes of region coordinates.
        coords = np.column_stack((prop.coords[:, 1].astype(float), prop.coords[:, 0].astype(float)))
        center = np.array([prop.centroid[1], prop.centroid[0]], dtype=float)
        centered = coords - center

        if centered.shape[0] < 3:
            minr, minc, maxr, maxc = prop.bbox
            return [
                (float(minc), float(minr)),
                (float(maxc), float(minr)),
                (float(maxc), float(maxr)),
                (float(minc), float(maxr)),
            ]

        cov = np.cov(centered, rowvar=False)
        eigvals, eigvecs = np.linalg.eigh(cov)
        major_vec = eigvecs[:, np.argmax(eigvals)]
        minor_vec = eigvecs[:, np.argmin(eigvals)]

        proj_major = centered @ major_vec
        proj_minor = centered @ minor_vec
        min_a, max_a = float(proj_major.min()), float(proj_major.max())
        min_b, max_b = float(proj_minor.min()), float(proj_minor.max())

        p1 = center + major_vec * min_a + minor_vec * min_b
        p2 = center + major_vec * max_a + minor_vec * min_b
        p3 = center + major_vec * max_a + minor_vec * max_b
        p4 = center + major_vec * min_a + minor_vec * max_b
        return [
            (float(p1[0]), float(p1[1])),
            (float(p2[0]), float(p2[1])),
            (float(p3[0]), float(p3[1])),
            (float(p4[0]), float(p4[1])),
        ]
