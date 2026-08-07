from __future__ import annotations

from collections.abc import Iterable

import numpy as np


Point = tuple[float, float]
MEASUREMENT_DEFINITION = "rotated_rectangle_side_length"

_MIN_SIDE_PX = 1e-9
_RECTANGLE_TOLERANCE = 1e-6


def order_rotated_rectangle_points(box_points: Iterable[Point]) -> list[Point]:
    """Validate and cyclically order the four corners of a rotated rectangle."""
    points = np.asarray(list(box_points), dtype=float)
    if points.shape != (4, 2):
        raise ValueError("A rotated rectangle must contain exactly four [x, y] points.")
    if not np.all(np.isfinite(points)):
        raise ValueError("Rotated rectangle points must be finite.")

    pairwise = points[:, None, :] - points[None, :, :]
    distances = np.linalg.norm(pairwise, axis=2)
    distances += np.eye(4)
    if float(np.min(distances)) <= _MIN_SIDE_PX:
        raise ValueError("Rotated rectangle points must be distinct.")

    center = points.mean(axis=0)
    angles = np.arctan2(points[:, 1] - center[1], points[:, 0] - center[0])
    ordered = points[np.argsort(angles)]
    edges = np.roll(ordered, -1, axis=0) - ordered
    edge_lengths = np.linalg.norm(edges, axis=1)
    if np.any(edge_lengths <= _MIN_SIDE_PX):
        raise ValueError("Rotated rectangle sides must have positive length.")

    area = 0.5 * abs(
        float(
            np.dot(ordered[:, 0], np.roll(ordered[:, 1], -1))
            - np.dot(ordered[:, 1], np.roll(ordered[:, 0], -1))
        )
    )
    if not np.isfinite(area) or area <= _MIN_SIDE_PX:
        raise ValueError("Rotated rectangle must have positive area.")

    unit_edges = edges / edge_lengths[:, None]
    adjacent_dots = [abs(float(np.dot(unit_edges[i], unit_edges[(i + 1) % 4]))) for i in range(4)]
    opposite_crosses = [
        abs(float(unit_edges[0, 0] * unit_edges[2, 1] - unit_edges[0, 1] * unit_edges[2, 0])),
        abs(float(unit_edges[1, 0] * unit_edges[3, 1] - unit_edges[1, 1] * unit_edges[3, 0])),
    ]
    if max(adjacent_dots) > _RECTANGLE_TOLERANCE or max(opposite_crosses) > _RECTANGLE_TOLERANCE:
        raise ValueError("The supplied points do not form a rectangle.")

    return [(float(x), float(y)) for x, y in ordered]


def rotated_rectangle_side_lengths(box_points: Iterable[Point]) -> tuple[float, float]:
    """Return (long_px, short_px) from the exact displayed rectangle."""
    ordered = np.asarray(order_rotated_rectangle_points(box_points), dtype=float)
    edges = np.roll(ordered, -1, axis=0) - ordered
    edge_lengths = np.linalg.norm(edges, axis=1)
    side_a = float((edge_lengths[0] + edge_lengths[2]) / 2.0)
    side_b = float((edge_lengths[1] + edge_lengths[3]) / 2.0)
    long_px = max(side_a, side_b)
    short_px = min(side_a, side_b)
    if not np.isfinite(long_px) or not np.isfinite(short_px) or short_px <= _MIN_SIDE_PX:
        raise ValueError("Rotated rectangle side lengths must be finite and positive.")
    return long_px, short_px
