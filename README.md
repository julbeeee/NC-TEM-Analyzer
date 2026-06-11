# NC-TEM Analyzer

NC-TEM Analyzer is a localhost-based web application for measuring
nanoparticles, nanocrystals, quantum dots, nanoplatelets, rods, and lattice
spacing from transmission electron microscopy (TEM) images. It combines a
Python/Flask image-analysis backend with a browser workspace for batch upload,
threshold tuning, overlay review, intuitive histogram generation with Gaussian
fitting, CSV export, FFT ROI analysis, and inverse FFT inspection.

The main way to use the software is to start the Flask server on your own
computer and open the analyzer at `http://127.0.0.1:8000` or
`http://localhost:8000` in a web browser.

## Features

- Batch TEM image upload with support for `png`, `jpg`, `jpeg`, `tif`, and
  `tiff` files.
- Automatic scale calibration from a user-provided scale-bar length and
  detected white or black scale bars.
- Spherical nanoparticle, nanocrystal, and quantum dot detection using adaptive
  contrast enhancement, thresholding, connected-component filtering, and
  equivalent-diameter measurement.
- Nanoplatelet, rod, and anisotropic nanocrystal detection using shape-aware
  filtering, watershed segmentation, and optional four-corner seed-assisted
  rectangle detection.
- Interactive overlay preview for accepted detections, manual dot correction,
  exclusion/restoration, zoom, and session-level review.
- Accumulated long-axis, short-axis, and diameter histograms with intuitive
  bin-size control, zoomable axes, visible mean/std summaries, Gaussian fitting,
  transparent PNG export, and CSV export.
- FFT ROI workflow for lattice analysis, automatic/manual peak-pair selection,
  d-spacing measurement, inverse FFT preview, profile inspection, and FFT CSV
  export.
- Browser-local IndexedDB storage for verified samples and saved FFT sessions.

## Repository Structure

```text
NC-TEM-Analyzer/
  backend/
    web_app.py              Flask app and HTTP API
  core/
    analyzer.py             Scale-bar, spherical, and platelet measurement logic
    fft_analyzer.py         FFT, IFFT, d-spacing, and profile analysis
    rectangle_seed.py       Seed-assisted rectangular particle detection
    scale_bar.py            Scale-bar candidate detection helpers
    io_utils.py             CSV helper
    session.py              Session measurement state
  frontend/
    tem.html                Browser UI
    styles.css              UI styling
    app.js                  Browser-side workflow, canvas, storage, and export logic
    histogram_math.js       Histogram statistics, binning, and Gaussian fitting
    scale_bar_detection.js  Browser-side scale-bar selection helpers
  local_tests/
    analyzer_smoke.py       Spherical measurement smoke test
    fft_analyzer_smoke.py   FFT/IFFT smoke test
    rectangle_seed_*.py     Rectangle seed demos and local utilities
  tests/
    *.test.mjs              Browser-side unit tests
```

## Requirements

- Python 3.10 or later
- A modern web browser
- Python packages:
  - `Flask`
  - `NumPy`
  - `SciPy`
  - `scikit-image`
  - `Pillow`
  - `Werkzeug`

There is no frontend build step. The HTML, CSS, and vanilla JavaScript frontend
is served directly by Flask.

## Quick Start: Run Locally in a Browser

Clone the repository:

```bash
git clone https://github.com/julbeeee/NC-TEM-Analyzer.git
cd NC-TEM-Analyzer
```

Create and activate a virtual environment:

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install Flask numpy scipy scikit-image Pillow Werkzeug
```

Run the local web app. By default, the Flask server starts on
`127.0.0.1:8000`, which means the app is available only from the local machine:

```bash
python backend/web_app.py
```

Open the analyzer in a browser:

```text
http://127.0.0.1:8000
```

You can also use:

```text
http://localhost:8000
```

Keep the terminal running while using the browser interface. Stop the local
server with `Ctrl+C` when finished.

## Basic Workflow

1. Upload one or more TEM images.
2. Enter the scale-bar length in nanometers and choose the scale-bar color.
3. Select either `Spherical dot` for nanoparticle, nanocrystal, and quantum dot
   measurements, or `Nanoplatelet / Rod` for anisotropic particles.
4. Tune detection and shape-filtering settings if needed.
5. Run auto-detection.
6. Inspect overlays, correct or exclude detections, and review the generated
   histogram with adjustable binning, zoomable axes, summary statistics, and
   Gaussian fitting.
7. Export accumulated measurements as CSV or save the histogram as a
   transparent PNG.

For FFT analysis, select an image, draw an FFT ROI, run FFT, verify or adjust
the peak pair, inspect the inverse FFT/profile output, and save/export the FFT
measurement.

## API Endpoints

The Flask backend exposes the following local endpoints:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Serves the browser UI |
| `GET` | `/health` | Returns a simple health check |
| `POST` | `/api/analyze` | Runs spherical or platelet image analysis |
| `POST` | `/api/fft` | Runs FFT ROI analysis |
| `POST` | `/api/fft/ifft` | Applies IFFT settings to a selected peak pair |
| `POST` | `/api/fft/profile-peaks` | Measures spacing from manually selected profile peaks |
| `GET` | `/api/download/<result_id>.csv` | Downloads backend-stored size results |

## Local Tests

The repository includes lightweight smoke tests and unit tests for core
histogram, Gaussian fitting, FFT, and scale-bar detection utilities.

Run the included smoke tests from the repository root:

```bash
python local_tests/analyzer_smoke.py
python local_tests/fft_analyzer_smoke.py
node --test tests/*.test.mjs
```

The rectangle seed utilities can be used for local image experiments. Example:

```bash
python local_tests/rectangle_seed_image.py path/to/image.png --point 10,20 --point 80,22 --point 78,45 --point 12,44 --nm-per-pixel 0.2
```

## Publication Metadata

| Field | Value |
| --- | --- |
| Code versioning system | Git |
| Software languages, tools, and services | Python, JavaScript, HTML, CSS, Flask, NumPy, SciPy, scikit-image, Pillow/PIL, Werkzeug, browser Canvas/Fetch/IndexedDB APIs, Google Fonts / Material Symbols |
| Compilation requirements, operating environments, and dependencies | No compilation or frontend build step required. Runs as a local Python/Flask web application on Windows, macOS, or Linux with Python 3.10 or later. Required Python packages include Flask, NumPy, SciPy, scikit-image, Pillow, and Werkzeug. |
| Developer documentation/manual | This README and the source repository |
| Legal code license | Apache License 2.0 |

## License

This project is released under the Apache License 2.0. See `LICENSE` for the
full license text.
