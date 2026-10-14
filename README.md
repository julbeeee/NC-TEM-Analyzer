# NC-TEM Analyzer

Current release: **v1.0.1**

**처음 사용하시나요? [한국어 설치 및 시작 가이드](GETTING_STARTED_KO.md)**

## First-time setup on Windows (Release ZIP)

1. Open the [v1.0.1 release page](https://github.com/julbeeee/NC-TEM-Analyzer/releases/tag/v1.0.1)
   and download **Assets → Source code (zip)**.
2. Right-click the downloaded ZIP and choose **Extract All**. Open the extracted
   `NC-TEM-Analyzer-1.0.1` folder containing `requirements.txt`, `backend`, and
   `frontend`.
3. Install **Python 3.10 or later** if needed. Select **Add python.exe to PATH**
   if the installer offers it.
4. In File Explorer, click the project folder's address bar, type `powershell`,
   and press Enter. This opens a terminal in the correct folder.
5. Enter the following commands **one line at a time**, pressing Enter after
   each line. Wait for each command to finish before entering the next one.
   Installing the packages requires an internet connection. If a command
   reports an error, see [Troubleshooting](#troubleshooting) before continuing.

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe backend/web_app.py
```

When the terminal displays `Running on http://127.0.0.1:8000`, open
**http://127.0.0.1:8000** in your web browser. Keep the terminal open while using
the app. To try your first analysis, upload `sample_data/spherical_ag2se.jpg`,
choose **Spherical dot**, set the scale bar to **50 nm / black**, and click
**Run Auto-Detect**.

For later sessions, open PowerShell in the same folder and run only:

```powershell
.\.venv\Scripts\python.exe backend/web_app.py
```

Export the results you need, then press **Ctrl+C** in the terminal to stop the
app. For macOS/Linux setup, see [Quick Start](#quick-start-run-locally-in-a-browser).

NC-TEM Analyzer is a localhost-based web application for measuring
nanoparticles, nanocrystals, quantum dots, nanoplatelets, rods, and lattice
spacing from transmission electron microscopy (TEM) images. It combines a
Python/Flask image-analysis backend with a browser workspace for batch upload,
threshold tuning, overlay review, intuitive histogram generation with a
mean/SD-based normal-distribution guide, CSV export, FFT ROI analysis, and
inverse FFT inspection.

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
  bin-size control, zoomable axes, visible mean/std summaries, a
  normal-distribution overlay calculated from the visible measurements as a
  visual guide rather than a fit to binned counts, transparent PNG export, and
  CSV export.
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
    rectangle_geometry.py   Canonical rotated-rectangle side measurement
    scale_bar.py            Scale-bar candidate detection helpers
    io_utils.py             CSV helper
    session.py              Session measurement state
  frontend/
    tem.html                Browser UI
    styles.css              UI styling
    app.js                  Browser-side workflow, canvas, storage, and export logic
    histogram_math.js       Histogram statistics, binning, and normal-distribution guides
    scale_bar_detection.js  Browser-side scale-bar selection helpers
    rectangle_measurement.js Browser-side NPL measurement/export helpers
  local_tests/
    analyzer_smoke.py       Spherical measurement smoke test
    fft_analyzer_smoke.py   FFT/IFFT smoke test
    rectangle_seed_*.py     Rectangle seed demos and local utilities
  tests/
    *.test.mjs              Browser-side unit tests
    test_npl_measurement.py  Python NPL geometry/integration tests
  sample_data/
    spherical_ag2se.jpg     Minimal spherical-particle example
    README.md               Example settings, workflow, and image attribution
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

### 1. Download and open the project folder

If you already downloaded the project, extract the ZIP first. Open the extracted
folder containing `requirements.txt`, `backend`, and `frontend`.
On Windows, open that folder in File Explorer, type `powershell` in the address
bar, and press Enter. On macOS/Linux, open a terminal in that folder.

To download without Git, choose **Code → Download ZIP** on GitHub and extract
the archive. Git is optional. Alternatively, clone the repository:

```bash
git clone https://github.com/julbeeee/NC-TEM-Analyzer.git
cd NC-TEM-Analyzer
```

### 2. Install dependencies (first run only)

Install Python 3.10 or later if it is not already installed. On Windows, enable
the installer's **Add python.exe to PATH** option if offered, then reopen your
terminal. Check the version with `python --version` (Windows) or
`python3 --version` (macOS/Linux).

Run the following commands one at a time from the project folder.
Using the environment's Python directly avoids PowerShell activation-policy
errors; you do not need to activate the environment.

On Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

On macOS or Linux:

```bash
python3 -m venv .venv
./.venv/bin/python -m pip install --upgrade pip
./.venv/bin/python -m pip install -r requirements.txt
```

An internet connection is needed to download the Python packages.

### 3. Start the app

Run the local web app. By default, the Flask server starts on
`127.0.0.1:8000`, which means the app is available only from the local machine:

Windows PowerShell:

```powershell
.\.venv\Scripts\python.exe backend/web_app.py
```

macOS/Linux:

```bash
./.venv/bin/python backend/web_app.py
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

This is a local application: opening GitHub or double-clicking
`frontend/tem.html` does not start the analysis server.

### 4. Try the included sample

Upload `sample_data/spherical_ag2se.jpg`, select `Spherical dot`, set the
scale-bar length to `50` nm and color to `black`, then click `Run Auto-Detect`.
Review the particle overlay and histogram before exporting CSV results.

### Starting again later

Open a terminal in the same project folder and repeat **step 3**. You do not
need to reinstall dependencies each time. Open the same browser address and
keep the terminal open during use. Export any results you need before stopping
the server.

### Troubleshooting

| Problem | What to do |
| --- | --- |
| `python` is not recognized | Reopen the terminal after installing Python. On Windows, try `py --version` and use `py -m venv .venv` if the launcher is available. |
| `requirements.txt` or `backend/web_app.py` cannot be found | Open the folder containing those files, rather than its parent folder or the ZIP archive. |
| `ModuleNotFoundError` | Repeat the dependency installation in step 2 and start the app using the `.venv` Python shown in step 3. |
| Browser says the site cannot be reached | Check that the terminal is still running without an error, then open `http://127.0.0.1:8000`. |
| Port 8000 is already in use | Stop a previous analyzer server with `Ctrl+C` in its terminal before starting again. |
| Linux reports that `venv` or `ensurepip` is unavailable | Install your distribution's Python venv package, then repeat step 2. |

## Basic Workflow

1. Upload one or more TEM images.
2. Enter the scale-bar length in nanometers and choose the scale-bar color.
3. Select either `Spherical dot` for nanoparticle, nanocrystal, and quantum dot
   measurements, or `Nanoplatelet / Rod` for anisotropic particles.
4. Tune detection and shape-filtering settings if needed.
5. Run auto-detection.
6. Inspect the detection overlay. Exclude false or incorrectly detected
   particles, and manually adjust the size or position only for detections that
   require correction.
7. Review the updated histogram with adjustable binning, zoomable axes, summary
   statistics, and a mean/SD-based normal-distribution guide.
8. Export accumulated measurements as CSV or save the histogram as a
   transparent PNG.

For FFT analysis, select an image, draw an FFT ROI, run FFT, verify or adjust
the peak pair, inspect the inverse FFT/profile output, and save/export the FFT
measurement.

## NPL Measurement Definition

For nanoplatelets, rods, and other anisotropic particles, `long_axis_nm` and
`short_axis_nm` are the long and short side lengths of the rotated rectangle
displayed in the overlay, multiplied by `nm_per_pixel`. The aspect ratio is
`long_axis_nm / short_axis_nm`. The same definition is used for general
automatic detection, rectangle-seed detection, manual correction, summary
statistics, histograms, and CSV export.

Equivalent-ellipse major/minor axes may be retained internally as shape
descriptors, but they are not reported as physical NPL length or width. New NPL
analysis results include
`measurement_definition: "rotated_rectangle_side_length"`; results without
this field should be treated as legacy or unknown and are not automatically
converted.

## Sample Dataset

A minimal spherical Ag2Se nanoparticle example is included in `sample_data/`.
Use `spherical_ag2se.jpg` in `Spherical dot` mode with a `50 nm` black scale
bar. See [`sample_data/README.md`](sample_data/README.md) for the complete
workflow, manual-correction guidance, source citation, and permission statement.

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
histogram statistics, normal-distribution guide generation, FFT, and scale-bar
detection utilities.

Run the included smoke tests from the repository root:

```bash
python tests/test_npl_measurement.py
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
| Current code version | v1.0.1 |
| Code versioning system | Git |
| Software languages, tools, and services | Python, JavaScript, HTML, CSS, Flask, NumPy, SciPy, scikit-image, Pillow/PIL, Werkzeug, browser Canvas/Fetch/IndexedDB APIs, Google Fonts / Material Symbols |
| Compilation requirements, operating environments, and dependencies | No compilation or frontend build step required. Runs as a local Python/Flask web application on Windows, macOS, or Linux with Python 3.10 or later. Required Python packages include Flask, NumPy, SciPy, scikit-image, Pillow, and Werkzeug. |
| Developer documentation/manual | This README and the source repository |
| Legal code license | Apache License 2.0 |

## License

This project is released under the Apache License 2.0. See `LICENSE` for the
full license text.
