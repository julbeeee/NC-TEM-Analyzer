from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np
from scipy import ndimage as ndi
from skimage import draw, exposure, filters, measure, morphology

from core.rectangle_geometry import rotated_rectangle_side_lengths


Point = tuple[float, float]


@dataclass(frozen=True)
class RectangleSeed:
    points: list[Point]
    center: Point
    length_px: float
    width_px: float
    angle_rad: float
    aspect: float
    area_px: float
    foreground_mean: float | None = None
    background_mean: float | None = None
    contrast: float | None = None
    dark_on_light: bool = True


@dataclass(frozen=True)
class RectCandidate:
    center: Point
    length_px: float
    width_px: float
    length_nm: float
    width_nm: float
    angle_rad: float
    aspect: float
    area_px: float
    extent: float
    solidity: float
    eccentricity: float
    ellipse_major_axis_px: float
    ellipse_minor_axis_px: float
    score: float
    threshold: float
    bbox: tuple[int, int, int, int]
    polygon: list[Point]


@dataclass(frozen=True)
class SeedDetectorConfig:
    crop_bottom_px: int = 150
    exclude_from_y_px: int | None = None
    gamma: float = 0.08
    gauss_sigma: float = 0.45
    adapthist_clip: float = 0.02
    adapthist_tiles: tuple[int, int] = (4, 4)
    threshold_offsets: tuple[float, ...] = (-0.06, -0.03, 0.0, 0.03, 0.06)
    min_area_factor: float = 0.25
    max_area_factor: float = 5.0
    min_width_factor: float = 0.45
    max_width_factor: float = 2.4
    min_length_factor: float = 0.35
    max_length_factor: float = 4.0
    min_aspect: float = 1.15
    min_extent: float = 0.20
    min_solidity: float = 0.25
    dedupe_iou: float = 0.35


def build_seed_from_points(
    points: Iterable[Point],
    gray: np.ndarray | None = None,
    *,
    background_pad_px: int = 8,
) -> RectangleSeed:
    ordered = order_rectangle_points(points)
    center = tuple(np.mean(np.asarray(ordered, dtype=float), axis=0))
    edges = [
        _distance(ordered[0], ordered[1]),
        _distance(ordered[1], ordered[2]),
        _distance(ordered[2], ordered[3]),
        _distance(ordered[3], ordered[0]),
    ]

    edge_pairs = ((edges[0] + edges[2]) / 2.0, (edges[1] + edges[3]) / 2.0)
    length_px = max(edge_pairs)
    width_px = max(1e-6, min(edge_pairs))
    major_edge_index = 0 if edge_pairs[0] >= edge_pairs[1] else 1
    p0 = ordered[major_edge_index]
    p1 = ordered[(major_edge_index + 1) % 4]
    angle_rad = float(np.arctan2(p1[1] - p0[1], p1[0] - p0[0]))

    foreground_mean: float | None = None
    background_mean: float | None = None
    contrast: float | None = None
    dark_on_light = True
    if gray is not None:
        foreground_mean, background_mean = _seed_intensity_stats(gray, ordered, background_pad_px)
        contrast = abs(background_mean - foreground_mean)
        dark_on_light = foreground_mean <= background_mean

    return RectangleSeed(
        points=ordered,
        center=(float(center[0]), float(center[1])),
        length_px=float(length_px),
        width_px=float(width_px),
        angle_rad=angle_rad,
        aspect=float(length_px / width_px),
        area_px=float(_polygon_area(ordered)),
        foreground_mean=foreground_mean,
        background_mean=background_mean,
        contrast=contrast,
        dark_on_light=dark_on_light,
    )


def detect_rectangles_with_seed(
    gray: np.ndarray,
    nm_per_pixel: float,
    seed: RectangleSeed,
    config: SeedDetectorConfig | None = None,
) -> list[RectCandidate]:
    cfg = config or SeedDetectorConfig()
    roi = _enhance_roi(gray, cfg)
    otsu = float(filters.threshold_otsu(roi))

    candidates: list[RectCandidate] = []
    min_area = max(3, int(seed.area_px * cfg.min_area_factor))
    for offset in cfg.threshold_offsets:
        level = float(np.clip(otsu + offset, 0.0, 1.0))
        mask = roi <= level if seed.dark_on_light else roi >= level
        mask = ndi.binary_fill_holes(mask)
        mask = _remove_small_components(mask, min_area)
        labels = measure.label(mask, connectivity=2)
        for prop in measure.regionprops(labels):
            candidate = _candidate_from_prop(prop, nm_per_pixel, seed, cfg, level)
            if candidate is not None:
                candidates.append(candidate)

    return _dedupe_candidates(candidates, cfg.dedupe_iou)


def order_rectangle_points(points: Iterable[Point]) -> list[Point]:
    pts = np.asarray(list(points), dtype=float)
    if pts.shape != (4, 2):
        raise ValueError("Rectangle seed needs exactly four points: [(x, y), ...].")

    center = pts.mean(axis=0)
    angles = np.arctan2(pts[:, 1] - center[1], pts[:, 0] - center[0])
    ordered = pts[np.argsort(angles)]

    # Rotate so the top-left-ish point is first for stable display/storage.
    start = int(np.argmin(ordered[:, 0] + ordered[:, 1]))
    ordered = np.roll(ordered, -start, axis=0)
    return [(float(x), float(y)) for x, y in ordered]


def _enhance_roi(gray: np.ndarray, cfg: SeedDetectorConfig) -> np.ndarray:
    gray = np.asarray(gray, dtype=np.float32)
    if gray.max(initial=0) > 1.0:
        gray = gray / 255.0

    if cfg.exclude_from_y_px is None:
        crop = max(0, min(int(cfg.crop_bottom_px), max(0, gray.shape[0] - 2)))
        roi_height = gray.shape[0] - crop
    else:
        roi_height = max(2, min(int(cfg.exclude_from_y_px), gray.shape[0]))
    roi = gray[:roi_height, :]
    tile_y, tile_x = cfg.adapthist_tiles
    kernel_size = (
        max(2, roi.shape[0] // max(1, tile_y)),
        max(2, roi.shape[1] // max(1, tile_x)),
    )
    roi = exposure.equalize_adapthist(
        roi,
        clip_limit=cfg.adapthist_clip,
        kernel_size=kernel_size,
        nbins=256,
    )
    roi = exposure.adjust_gamma(roi, cfg.gamma)
    return filters.gaussian(roi, sigma=cfg.gauss_sigma)


def _candidate_from_prop(
    prop: measure._regionprops.RegionProperties,
    nm_per_pixel: float,
    seed: RectangleSeed,
    cfg: SeedDetectorConfig,
    threshold: float,
) -> RectCandidate | None:
    polygon = _rotated_box_points(prop)
    try:
        length_px, width_px = rotated_rectangle_side_lengths(polygon)
    except ValueError:
        return None

    ellipse_major_axis_px = _major_axis_length(prop)
    ellipse_minor_axis_px = _minor_axis_length(prop)

    aspect = length_px / max(width_px, 1e-6)
    area = float(prop.area)
    if not (
        seed.area_px * cfg.min_area_factor <= area <= seed.area_px * cfg.max_area_factor
        and seed.width_px * cfg.min_width_factor <= width_px <= seed.width_px * cfg.max_width_factor
        and seed.length_px * cfg.min_length_factor <= length_px <= seed.length_px * cfg.max_length_factor
        and aspect >= max(cfg.min_aspect, seed.aspect * 0.35)
        and prop.extent >= cfg.min_extent
        and prop.solidity >= cfg.min_solidity
    ):
        return None

    score = _shape_score(seed, length_px, width_px, aspect, area, prop.extent, prop.solidity)
    minr, minc, maxr, maxc = prop.bbox
    cy, cx = prop.centroid
    return RectCandidate(
        center=(float(cx), float(cy)),
        length_px=length_px,
        width_px=width_px,
        length_nm=float(length_px * nm_per_pixel),
        width_nm=float(width_px * nm_per_pixel),
        angle_rad=float(-prop.orientation),
        aspect=float(aspect),
        area_px=area,
        extent=float(prop.extent),
        solidity=float(prop.solidity),
        eccentricity=float(prop.eccentricity),
        ellipse_major_axis_px=float(ellipse_major_axis_px),
        ellipse_minor_axis_px=float(ellipse_minor_axis_px),
        score=float(score),
        threshold=threshold,
        bbox=(int(minc), int(minr), int(maxc), int(maxr)),
        polygon=polygon,
    )


def _shape_score(
    seed: RectangleSeed,
    length_px: float,
    width_px: float,
    aspect: float,
    area_px: float,
    extent: float,
    solidity: float,
) -> float:
    width_term = _log_similarity(width_px, seed.width_px) * 3.0
    area_term = _log_similarity(area_px, seed.area_px) * 1.2
    aspect_term = _log_similarity(aspect, max(seed.aspect, 1.0)) * 1.1
    length_flex = max(0.0, 1.0 - abs(np.log((length_px + 1e-6) / (seed.length_px + 1e-6))) / np.log(4.0))
    return (
        width_term
        + area_term
        + aspect_term
        + length_flex * 0.8
        + float(extent) * 1.4
        + float(solidity) * 0.8
    )


def _log_similarity(value: float, reference: float) -> float:
    ratio = (value + 1e-6) / (reference + 1e-6)
    return float(np.exp(-abs(np.log(ratio))))


def _dedupe_candidates(candidates: list[RectCandidate], iou_threshold: float) -> list[RectCandidate]:
    kept: list[RectCandidate] = []
    for candidate in sorted(candidates, key=lambda item: item.score, reverse=True):
        if all(_bbox_iou(candidate.bbox, existing.bbox) < iou_threshold for existing in kept):
            kept.append(candidate)
    return kept


def _bbox_iou(
    left: tuple[int, int, int, int],
    right: tuple[int, int, int, int],
) -> float:
    lx1, ly1, lx2, ly2 = left
    rx1, ry1, rx2, ry2 = right
    ix1 = max(lx1, rx1)
    iy1 = max(ly1, ry1)
    ix2 = min(lx2, rx2)
    iy2 = min(ly2, ry2)
    iw = max(0, ix2 - ix1)
    ih = max(0, iy2 - iy1)
    inter = iw * ih
    left_area = max(0, lx2 - lx1) * max(0, ly2 - ly1)
    right_area = max(0, rx2 - rx1) * max(0, ry2 - ry1)
    union = max(1, left_area + right_area - inter)
    return inter / union


def _rotated_box_points(prop: measure._regionprops.RegionProperties) -> list[Point]:
    coords = np.column_stack((prop.coords[:, 1].astype(float), prop.coords[:, 0].astype(float)))
    center = np.array([prop.centroid[1], prop.centroid[0]], dtype=float)
    centered = coords - center
    if centered.shape[0] < 3:
        minr, minc, maxr, maxc = prop.bbox
        return [(float(minc), float(minr)), (float(maxc), float(minr)), (float(maxc), float(maxr)), (float(minc), float(maxr))]

    cov = np.cov(centered, rowvar=False)
    eigvals, eigvecs = np.linalg.eigh(cov)
    major_vec = eigvecs[:, np.argmax(eigvals)]
    minor_vec = eigvecs[:, np.argmin(eigvals)]
    proj_major = centered @ major_vec
    proj_minor = centered @ minor_vec

    corners = [
        center + major_vec * proj_major.min() + minor_vec * proj_minor.min(),
        center + major_vec * proj_major.max() + minor_vec * proj_minor.min(),
        center + major_vec * proj_major.max() + minor_vec * proj_minor.max(),
        center + major_vec * proj_major.min() + minor_vec * proj_minor.max(),
    ]
    return [(float(point[0]), float(point[1])) for point in corners]


def _major_axis_length(prop: measure._regionprops.RegionProperties) -> float:
    if hasattr(prop, "axis_major_length"):
        return float(prop.axis_major_length)
    return float(prop.major_axis_length)


def _minor_axis_length(prop: measure._regionprops.RegionProperties) -> float:
    if hasattr(prop, "axis_minor_length"):
        return float(prop.axis_minor_length)
    return float(prop.minor_axis_length)


def _remove_small_components(mask: np.ndarray, min_area: int) -> np.ndarray:
    labels = measure.label(mask, connectivity=2)
    if labels.max(initial=0) == 0:
        return mask
    counts = np.bincount(labels.ravel())
    keep = counts >= max(1, min_area)
    keep[0] = False
    return keep[labels]


def _seed_intensity_stats(
    gray: np.ndarray,
    points: list[Point],
    background_pad_px: int,
) -> tuple[float, float]:
    polygon_mask = _polygon_mask(gray.shape, points)
    min_x = max(0, int(np.floor(min(x for x, _ in points))) - background_pad_px)
    max_x = min(gray.shape[1], int(np.ceil(max(x for x, _ in points))) + background_pad_px + 1)
    min_y = max(0, int(np.floor(min(y for _, y in points))) - background_pad_px)
    max_y = min(gray.shape[0], int(np.ceil(max(y for _, y in points))) + background_pad_px + 1)
    outer = np.zeros(gray.shape, dtype=bool)
    outer[min_y:max_y, min_x:max_x] = True
    ring = outer & ~polygon_mask
    foreground = gray[polygon_mask]
    background = gray[ring]
    if foreground.size == 0 or background.size == 0:
        raise ValueError("Seed rectangle does not cover enough image pixels.")
    return float(np.mean(foreground)), float(np.mean(background))


def _polygon_mask(shape: tuple[int, int], points: list[Point]) -> np.ndarray:
    xs = np.asarray([x for x, _ in points], dtype=float)
    ys = np.asarray([y for _, y in points], dtype=float)
    rr, cc = draw.polygon(ys, xs, shape=shape)
    mask = np.zeros(shape, dtype=bool)
    mask[rr, cc] = True
    return mask


def _polygon_area(points: list[Point]) -> float:
    xs = np.asarray([x for x, _ in points], dtype=float)
    ys = np.asarray([y for _, y in points], dtype=float)
    return float(0.5 * abs(np.dot(xs, np.roll(ys, -1)) - np.dot(ys, np.roll(xs, -1))))


def _distance(left: Point, right: Point) -> float:
    return float(np.hypot(left[0] - right[0], left[1] - right[1]))
