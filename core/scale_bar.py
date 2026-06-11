from __future__ import annotations

from typing import Protocol

import numpy as np
from skimage import measure, morphology


class ScaleBarSettings(Protocol):
    sb_region_ratio: float
    white_thr: int
    black_thr: int
    sb_min_area: int


class ScaleBarRegion(Protocol):
    bbox: tuple[int, int, int, int]
    area: float


ScaleBarBox = tuple[float, float, float, float]


def scale_bar_exclusion_top(
    image_height: int,
    scale_bar_box: ScaleBarBox | None,
    crop_bottom_px: int,
) -> int:
    if scale_bar_box is not None:
        _, y_px, width_px, height_px = scale_bar_box
        margin_px = _scale_bar_exclusion_margin(width_px, height_px)
        return max(2, min(image_height, int(np.floor(y_px - margin_px))))

    return image_height - int(crop_bottom_px)


def detect_scale_bar(
    gray: np.ndarray,
    known_nm: float,
    sb_color: str,
    settings: ScaleBarSettings,
) -> tuple[ScaleBarBox, float]:
    h_img = gray.shape[0]
    sb_start = int(h_img * settings.sb_region_ratio)
    sb_region = gray[sb_start:, :]

    embedded_box = _detect_dark_bar_in_bright_panel(sb_region, sb_start, settings)
    if embedded_box is not None:
        return embedded_box, known_nm / embedded_box[2]

    if sb_color == "white":
        thr = settings.white_thr / 255.0
        sb_bw = sb_region >= thr
    elif sb_color == "black":
        thr = settings.black_thr / 255.0
        sb_bw = sb_region <= thr
    else:
        raise ValueError("Scale bar color must be 'white' or 'black'.")

    sb_bw = morphology.remove_small_objects(sb_bw, max_size=max(0, settings.sb_min_area - 1))
    sb_labels = measure.label(sb_bw)
    sb_props = measure.regionprops(sb_labels)
    if not sb_props:
        raise ValueError("Scale bar not found. Adjust threshold or region.")

    scale_bar_prop = _select_scale_bar_prop(sb_props)
    minr, minc, maxr, maxc = scale_bar_prop.bbox
    bar_width_px = maxc - minc
    if bar_width_px <= 0:
        raise ValueError("Invalid scale bar width.")

    scale_bar_box = (
        float(minc),
        float(minr + sb_start),
        float(maxc - minc),
        float(maxr - minr),
    )
    return scale_bar_box, known_nm / bar_width_px


def _detect_dark_bar_in_bright_panel(
    sb_region: np.ndarray,
    sb_start: int,
    settings: ScaleBarSettings,
) -> ScaleBarBox | None:
    bright_mask = sb_region >= (settings.white_thr / 255.0)
    bright_mask = morphology.remove_small_objects(
        bright_mask,
        max_size=max(0, settings.sb_min_area - 1),
    )
    panels = [
        panel
        for panel in measure.regionprops(measure.label(bright_mask))
        if _panel_candidate_score(panel) is not None
    ]
    if not panels:
        return None

    best: tuple[float, ScaleBarBox] | None = None
    dark_thr = settings.black_thr / 255.0
    for panel in panels:
        minr, minc, maxr, maxc = panel.bbox
        panel_region = sb_region[minr:maxr, minc:maxc]
        dark_props = measure.regionprops(measure.label(panel_region <= dark_thr))
        for dark_prop in dark_props:
            score = _embedded_dark_bar_score(dark_prop, panel)
            if score is None:
                continue
            d_minr, d_minc, d_maxr, d_maxc = dark_prop.bbox
            box = (
                float(minc + d_minc),
                float(sb_start + minr + d_minr),
                float(d_maxc - d_minc),
                float(d_maxr - d_minr),
            )
            if best is None or score > best[0]:
                best = (score, box)
    return None if best is None else best[1]


def _scale_bar_exclusion_margin(width_px: float, height_px: float) -> float:
    return max(4.0, min(24.0, max(height_px * 2.0, width_px * 0.75)))


def _panel_candidate_score(prop: ScaleBarRegion) -> float | None:
    minr, minc, maxr, maxc = prop.bbox
    width = float(maxc - minc)
    height = float(maxr - minr)
    if width < 16.0 or height < 10.0:
        return None
    fill_ratio = float(prop.area) / (width * height)
    if fill_ratio < 0.35:
        return None
    return (width * height * fill_ratio) + width


def _embedded_dark_bar_score(
    prop: ScaleBarRegion,
    panel: ScaleBarRegion,
) -> float | None:
    panel_minr, panel_minc, panel_maxr, panel_maxc = panel.bbox
    minr, minc, maxr, maxc = prop.bbox
    panel_width = float(panel_maxc - panel_minc)
    panel_height = float(panel_maxr - panel_minr)
    width = float(maxc - minc)
    height = float(maxr - minr)
    if width <= 0 or height <= 0:
        return None
    aspect = width / height
    fill_ratio = float(prop.area) / (width * height)
    if width < max(12.0, panel_width * 0.35):
        return None
    if width > panel_width * 0.95:
        return None
    if height > max(6.0, panel_height * 0.2):
        return None
    if aspect < 8.0 or fill_ratio < 0.4:
        return None
    return (width * 3.0) + (fill_ratio * 20.0) - (height * 4.0)


def _scale_bar_candidate_score(prop: ScaleBarRegion) -> float | None:
    minr, minc, maxr, maxc = prop.bbox
    width = float(maxc - minc)
    height = float(maxr - minr)
    if width <= 0 or height <= 0:
        return None
    aspect = width / height
    fill_ratio = float(prop.area) / (width * height)
    height_limit = max(8.0, min(24.0, width * 0.2))
    if aspect < 3.0 or aspect > 30.0:
        return None
    if height < 4.0 or height > height_limit:
        return None
    if fill_ratio < 0.25:
        return None
    return width + (height * 4.0) + (fill_ratio * 20.0) - (abs(aspect - 12.0) * 2.0)


def _looks_like_box_edge(prop: ScaleBarRegion, candidates: list[ScaleBarRegion]) -> bool:
    minr, minc, maxr, maxc = prop.bbox
    width = float(maxc - minc)
    height = float(maxr - minr)
    center_y = (minr + maxr) / 2.0
    for other in candidates:
        if other is prop:
            continue
        other_minr, other_minc, other_maxr, other_maxc = other.bbox
        other_width = float(other_maxc - other_minc)
        other_height = float(other_maxr - other_minr)
        other_center_y = (other_minr + other_maxr) / 2.0
        contains_other_x = minc <= other_minc and maxc >= other_maxc
        has_side_margin = (other_minc - minc) >= 5 and (maxc - other_maxc) >= 5
        near_other_row = 0 < abs(center_y - other_center_y) <= 80
        if (
            contains_other_x
            and has_side_margin
            and near_other_row
            and width >= other_width * 1.2
            and height <= other_height
        ):
            return True
    return False


def _select_scale_bar_prop(props: list[ScaleBarRegion]) -> ScaleBarRegion:
    candidates: list[tuple[float, ScaleBarRegion]] = []
    candidate_props: list[ScaleBarRegion] = []
    for prop in props:
        score = _scale_bar_candidate_score(prop)
        if score is None:
            continue
        candidate_props.append(prop)
        candidates.append((score, prop))
    if len(candidate_props) > 1:
        candidates = [
            (score, prop)
            for score, prop in candidates
            if not _looks_like_box_edge(prop, candidate_props)
        ]
    if candidates:
        candidates.sort(key=lambda item: item[0], reverse=True)
        return candidates[0][1]
    return max(props, key=lambda prop: prop.area)
