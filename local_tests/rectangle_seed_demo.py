from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
from skimage import draw, io, measure, util

import sys

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.rectangle_seed import (  # noqa: E402
    SeedDetectorConfig,
    build_seed_from_points,
    detect_rectangles_with_seed,
)


def rectangle_points(cx: float, cy: float, length: float, width: float, angle_rad: float) -> list[tuple[float, float]]:
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    corners = []
    for x, y in [(-length / 2, -width / 2), (length / 2, -width / 2), (length / 2, width / 2), (-length / 2, width / 2)]:
        corners.append((cx + x * cos_a - y * sin_a, cy + x * sin_a + y * cos_a))
    return corners


def add_rectangle(
    image: np.ndarray,
    cx: float,
    cy: float,
    length: float,
    width: float,
    angle_deg: float,
    value: float = 0.22,
) -> list[tuple[float, float]]:
    points = rectangle_points(cx, cy, length, width, math.radians(angle_deg))
    xs = np.asarray([x for x, _ in points])
    ys = np.asarray([y for _, y in points])
    rr, cc = draw.polygon(ys, xs, image.shape)
    image[rr, cc] = value
    return points


def build_synthetic_image(seed_value: int = 7) -> tuple[np.ndarray, list[list[tuple[float, float]]]]:
    rng = np.random.default_rng(seed_value)
    image = np.full((420, 640), 0.76, dtype=np.float32)
    truth = [
        add_rectangle(image, 135, 95, 62, 13, -18),
        add_rectangle(image, 285, 120, 88, 15, 12),
        add_rectangle(image, 455, 88, 46, 12, 36),
        add_rectangle(image, 175, 245, 72, 14, 24),
        add_rectangle(image, 358, 268, 112, 16, -31),
        add_rectangle(image, 498, 240, 58, 13, 5),
    ]
    # Add a few nuisance blobs and texture so plain thresholding has something to trip on.
    for _ in range(18):
        y = int(rng.integers(20, 330))
        x = int(rng.integers(20, 620))
        radius = int(rng.integers(2, 7))
        rr, cc = draw.disk((y, x), radius, shape=image.shape)
        image[rr, cc] = float(rng.uniform(0.18, 0.45))
    noisy = image + rng.normal(0, 0.035, image.shape).astype(np.float32)
    return np.clip(noisy, 0, 1), truth


def baseline_connected_components(gray: np.ndarray) -> int:
    threshold = float(np.quantile(gray, 0.20))
    mask = gray <= threshold
    mask[:, -1] = False
    labels = measure.label(mask, connectivity=2)
    count = 0
    for prop in measure.regionprops(labels):
        if prop.area < 70:
            continue
        major = max(prop.axis_major_length if hasattr(prop, "axis_major_length") else prop.major_axis_length, 1e-6)
        minor = max(prop.axis_minor_length if hasattr(prop, "axis_minor_length") else prop.minor_axis_length, 1.0)
        aspect = major / minor
        if aspect >= 1.4 and prop.extent >= 0.18:
            count += 1
    return count


def save_overlay(path: Path, gray: np.ndarray, candidates) -> None:
    rgb = np.dstack([gray, gray, gray])
    for candidate in candidates:
        points = candidate.polygon
        for start, end in zip(points, points[1:] + points[:1]):
            rr, cc = draw.line(
                int(round(start[1])),
                int(round(start[0])),
                int(round(end[1])),
                int(round(end[0])),
            )
            valid = (rr >= 0) & (rr < rgb.shape[0]) & (cc >= 0) & (cc < rgb.shape[1])
            rgb[rr[valid], cc[valid], :] = [1.0, 0.05, 0.05]
    io.imsave(path, util.img_as_ubyte(np.clip(rgb, 0, 1)))


def run_demo(output: Path) -> None:
    gray, truth = build_synthetic_image()
    seed_points = truth[0]
    nm_per_pixel = 0.2
    seed = build_seed_from_points(seed_points, gray)
    candidates = detect_rectangles_with_seed(
        gray,
        nm_per_pixel,
        seed,
        SeedDetectorConfig(crop_bottom_px=40),
    )

    output.mkdir(parents=True, exist_ok=True)
    io.imsave(output / "synthetic_input.png", util.img_as_ubyte(gray))
    save_overlay(output / "seed_detector_overlay.png", gray, candidates)

    print("Synthetic rectangle-seed demo")
    print(f"truth_count={len(truth)}")
    print(f"baseline_connected_components_count={baseline_connected_components(gray)}")
    print(f"seed_detector_count={len(candidates)}")
    print(
        "seed="
        f"length_px={seed.length_px:.2f}, width_px={seed.width_px:.2f}, "
        f"aspect={seed.aspect:.2f}, contrast={seed.contrast:.3f}"
    )
    for index, candidate in enumerate(candidates[:12], start=1):
        print(
            f"{index:02d}: score={candidate.score:.3f}, "
            f"L={candidate.length_nm:.2f} nm, W={candidate.width_nm:.2f} nm, "
            f"aspect={candidate.aspect:.2f}, center=({candidate.center[0]:.1f}, {candidate.center[1]:.1f})"
        )
    print(f"wrote={output / 'synthetic_input.png'}")
    print(f"wrote={output / 'seed_detector_overlay.png'}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Local prototype for 4-point rectangle seed detection.")
    parser.add_argument(
        "--output",
        type=Path,
        default=ROOT / "local_tests" / "out" / "rectangle_seed_demo",
        help="Directory for synthetic input and overlay images.",
    )
    args = parser.parse_args()
    run_demo(args.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
