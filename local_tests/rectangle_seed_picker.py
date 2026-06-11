from __future__ import annotations

import argparse
import sys
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from PIL import Image, ImageTk

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.rectangle_seed import (  # noqa: E402
    SeedDetectorConfig,
    build_seed_from_points,
    detect_rectangles_with_seed,
)
from rectangle_seed_image import load_gray, save_overlay, write_csv  # noqa: E402


class RectangleSeedPicker(tk.Tk):
    def __init__(self, image_path: Path | None = None) -> None:
        super().__init__()
        self.title("Rectangle Seed Local Picker")
        self.geometry("1180x860")

        self.image_path: Path | None = None
        self.original_image: Image.Image | None = None
        self.display_image: Image.Image | None = None
        self.tk_image: ImageTk.PhotoImage | None = None
        self.scale = 1.0
        self.points: list[tuple[float, float]] = []
        self.overlay_items: list[int] = []

        self.nm_per_pixel_var = tk.StringVar(value="0.2")
        self.crop_bottom_var = tk.StringVar(value="150")
        self.status_var = tk.StringVar(value="Open an image, click four rectangle corners, then run detection.")

        self._build_ui()
        if image_path is not None:
            self.load_image(image_path)

    def _build_ui(self) -> None:
        toolbar = ttk.Frame(self, padding=8)
        toolbar.pack(fill=tk.X)

        ttk.Button(toolbar, text="Open Image", command=self.open_image).pack(side=tk.LEFT)
        ttk.Button(toolbar, text="Reset Points", command=self.reset_points).pack(side=tk.LEFT, padx=(8, 0))
        ttk.Button(toolbar, text="Run Detection", command=self.run_detection).pack(side=tk.LEFT, padx=(8, 0))

        ttk.Label(toolbar, text="nm/px").pack(side=tk.LEFT, padx=(24, 4))
        ttk.Entry(toolbar, width=8, textvariable=self.nm_per_pixel_var).pack(side=tk.LEFT)
        ttk.Label(toolbar, text="crop bottom px").pack(side=tk.LEFT, padx=(12, 4))
        ttk.Entry(toolbar, width=8, textvariable=self.crop_bottom_var).pack(side=tk.LEFT)

        self.point_label = ttk.Label(toolbar, text="points: 0/4")
        self.point_label.pack(side=tk.LEFT, padx=(24, 0))

        frame = ttk.Frame(self, padding=(8, 0, 8, 8))
        frame.pack(fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(frame, bg="#171a22", highlightthickness=0)
        self.canvas.pack(fill=tk.BOTH, expand=True)
        self.canvas.bind("<Button-1>", self.on_canvas_click)

        status = ttk.Label(self, textvariable=self.status_var, padding=(8, 6), anchor=tk.W)
        status.pack(fill=tk.X)

    def open_image(self) -> None:
        path = filedialog.askopenfilename(
            title="Open TEM image",
            filetypes=[
                ("Image files", "*.png *.jpg *.jpeg *.tif *.tiff *.bmp"),
                ("All files", "*.*"),
            ],
        )
        if path:
            self.load_image(Path(path))

    def load_image(self, path: Path) -> None:
        try:
            image = Image.open(path).convert("RGB")
        except Exception as exc:  # noqa: BLE001
            messagebox.showerror("Open failed", str(exc))
            return

        self.image_path = path
        self.original_image = image
        self.points = []
        self._show_image(image)
        self._redraw_points()
        self.status_var.set(f"Loaded {path}. Click four rectangle corners.")

    def _show_image(self, image: Image.Image) -> None:
        max_width = max(760, self.winfo_width() - 40)
        max_height = max(540, self.winfo_height() - 130)
        width_scale = max_width / image.width
        height_scale = max_height / image.height
        self.scale = min(1.0, width_scale, height_scale)
        display_size = (max(1, round(image.width * self.scale)), max(1, round(image.height * self.scale)))
        self.display_image = image.resize(display_size, Image.Resampling.LANCZOS)
        self.tk_image = ImageTk.PhotoImage(self.display_image)
        self.canvas.delete("all")
        self.canvas.config(scrollregion=(0, 0, display_size[0], display_size[1]))
        self.canvas.create_image(0, 0, image=self.tk_image, anchor=tk.NW)

    def on_canvas_click(self, event: tk.Event) -> None:
        if self.original_image is None:
            return
        if len(self.points) >= 4:
            self.status_var.set("Four points are already set. Use Reset Points to start again.")
            return

        x = event.x / max(self.scale, 1e-6)
        y = event.y / max(self.scale, 1e-6)
        x = min(max(x, 0), self.original_image.width - 1)
        y = min(max(y, 0), self.original_image.height - 1)
        self.points.append((x, y))
        self._redraw_points()
        self.status_var.set(f"Point {len(self.points)}/4: ({x:.1f}, {y:.1f})")

    def reset_points(self) -> None:
        self.points = []
        if self.original_image is not None:
            self._show_image(self.original_image)
        self._redraw_points()
        self.status_var.set("Points reset. Click four rectangle corners.")

    def _redraw_points(self) -> None:
        for item in self.overlay_items:
            self.canvas.delete(item)
        self.overlay_items = []
        for index, (x, y) in enumerate(self.points, start=1):
            dx = x * self.scale
            dy = y * self.scale
            radius = 5
            self.overlay_items.append(self.canvas.create_oval(dx - radius, dy - radius, dx + radius, dy + radius, fill="#17d45b", outline="#ffffff", width=2))
            self.overlay_items.append(self.canvas.create_text(dx + 10, dy - 10, text=str(index), fill="#ffffff", anchor=tk.W))
        if len(self.points) >= 2:
            scaled = [(x * self.scale, y * self.scale) for x, y in self.points]
            for start, end in zip(scaled, scaled[1:]):
                self.overlay_items.append(self.canvas.create_line(start[0], start[1], end[0], end[1], fill="#17d45b", width=2))
            if len(scaled) == 4:
                self.overlay_items.append(self.canvas.create_line(scaled[-1][0], scaled[-1][1], scaled[0][0], scaled[0][1], fill="#17d45b", width=2))
        self.point_label.config(text=f"points: {len(self.points)}/4")

    def run_detection(self) -> None:
        if self.image_path is None:
            messagebox.showwarning("No image", "Open an image first.")
            return
        if len(self.points) != 4:
            messagebox.showwarning("Need four points", "Click exactly four rectangle corners first.")
            return

        try:
            nm_per_pixel = float(self.nm_per_pixel_var.get())
            crop_bottom_px = int(float(self.crop_bottom_var.get()))
        except ValueError:
            messagebox.showerror("Invalid input", "nm/px and crop bottom px must be numbers.")
            return
        if nm_per_pixel <= 0:
            messagebox.showerror("Invalid input", "nm/px must be greater than 0.")
            return

        try:
            gray = load_gray(self.image_path)
            seed = build_seed_from_points(self.points, gray)
            candidates = detect_rectangles_with_seed(
                gray,
                nm_per_pixel,
                seed,
                SeedDetectorConfig(crop_bottom_px=crop_bottom_px),
            )
            output_dir = ROOT / "local_tests" / "out" / "rectangle_seed_picker"
            output_dir.mkdir(parents=True, exist_ok=True)
            overlay_path = output_dir / f"{self.image_path.stem}_picker_overlay.png"
            csv_path = output_dir / f"{self.image_path.stem}_picker_measurements.csv"
            save_overlay(overlay_path, gray, seed.points, candidates)
            write_csv(csv_path, candidates)
        except Exception as exc:  # noqa: BLE001
            messagebox.showerror("Detection failed", str(exc))
            return

        try:
            self._show_image(Image.open(overlay_path).convert("RGB"))
        except Exception:
            pass
        self.status_var.set(
            f"Detected {len(candidates)} candidates. Overlay: {overlay_path} | CSV: {csv_path}"
        )


def main() -> int:
    parser = argparse.ArgumentParser(description="Click four local seed points and run rectangle detection.")
    parser.add_argument("image", nargs="?", type=Path, help="Optional image path to open immediately.")
    args = parser.parse_args()

    app = RectangleSeedPicker(args.image)
    app.mainloop()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
