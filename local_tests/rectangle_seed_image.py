from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

import numpy as np
from skimage import color, draw, io, util

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.rectangle_seed import (  # noqa: E402
    SeedDetectorConfig,
    build_seed_from_points,
    detect_rectangles_with_seed,
)


def parse_point(raw: str) -> tuple[float, float]:
    try:
        x_raw, y_raw = raw.split(",", 1)
        return float(x_raw), float(y_raw)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"Point must be formatted as x,y. Got: {raw}") from exc


def load_gray(path: Path) -> np.ndarray:
    image = io.imread(path)
    if image.ndim == 2:
        gray = image.astype(np.float32)
        if gray.max(initial=0) > 1:
            gray /= 255.0
        return gray
    if image.ndim == 3 and image.shape[2] >= 3:
        return color.rgb2gray(image[..., :3]).astype(np.float32)
    raise ValueError(f"Unsupported image shape: {image.shape}")


def save_overlay(path: Path, gray: np.ndarray, seed_points, candidates) -> None:
    rgb = np.dstack([gray, gray, gray])

    def draw_poly(points, color_value):
        for start, end in zip(points, points[1:] + points[:1]):
            rr, cc = draw.line(
                int(round(start[1])),
                int(round(start[0])),
                int(round(end[1])),
                int(round(end[0])),
            )
            valid = (rr >= 0) & (rr < rgb.shape[0]) & (cc >= 0) & (cc < rgb.shape[1])
            rgb[rr[valid], cc[valid], :] = color_value

    draw_poly(seed_points, [0.05, 0.9, 0.15])
    for candidate in candidates:
        draw_poly(candidate.polygon, [1.0, 0.05, 0.05])
    io.imsave(path, util.img_as_ubyte(np.clip(rgb, 0, 1)))


def write_csv(path: Path, candidates) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow([
            "index",
            "score",
            "center_x_px",
            "center_y_px",
            "length_nm",
            "width_nm",
            "aspect",
            "area_px",
            "extent",
            "solidity",
            "threshold",
            "polygon_px",
        ])
        for index, candidate in enumerate(candidates, start=1):
            writer.writerow([
                index,
                f"{candidate.score:.6f}",
                f"{candidate.center[0]:.3f}",
                f"{candidate.center[1]:.3f}",
                f"{candidate.length_nm:.6f}",
                f"{candidate.width_nm:.6f}",
                f"{candidate.aspect:.6f}",
                f"{candidate.area_px:.1f}",
                f"{candidate.extent:.6f}",
                f"{candidate.solidity:.6f}",
                f"{candidate.threshold:.6f}",
                ";".join(f"{x:.2f},{y:.2f}" for x, y in candidate.polygon),
            ])


def main() -> int:
    parser = argparse.ArgumentParser(description="Run seed-assisted rectangle detection on one local image.")
    parser.add_argument("image", type=Path, help="Path to the TEM image.")
    parser.add_argument(
        "--point",
        action="append",
        type=parse_point,
        required=True,
        help="One seed corner as x,y. Provide exactly four --point values.",
    )
    parser.add_argument("--nm-per-pixel", type=float, required=True, help="Known calibration for local testing.")
    parser.add_argument("--crop-bottom-px", type=int, default=150)
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=ROOT / "local_tests" / "out" / "rectangle_seed_image",
    )
    args = parser.parse_args()

    if len(args.point) != 4:
        parser.error("Provide exactly four --point x,y values.")
    if args.nm_per_pixel <= 0:
        parser.error("--nm-per-pixel must be greater than 0.")

    gray = load_gray(args.image)
    seed = build_seed_from_points(args.point, gray)
    candidates = detect_rectangles_with_seed(
        gray,
        args.nm_per_pixel,
        seed,
        SeedDetectorConfig(crop_bottom_px=args.crop_bottom_px),
    )

    args.output_dir.mkdir(parents=True, exist_ok=True)
    stem = args.image.stem
    overlay_path = args.output_dir / f"{stem}_seed_overlay.png"
    csv_path = args.output_dir / f"{stem}_seed_measurements.csv"
    save_overlay(overlay_path, gray, seed.points, candidates)
    write_csv(csv_path, candidates)

    print(f"image={args.image}")
    print(
        "seed="
        f"length_px={seed.length_px:.2f}, width_px={seed.width_px:.2f}, "
        f"aspect={seed.aspect:.2f}, dark_on_light={seed.dark_on_light}, contrast={seed.contrast:.3f}"
    )
    print(f"candidate_count={len(candidates)}")
    print(f"overlay={overlay_path}")
    print(f"csv={csv_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
