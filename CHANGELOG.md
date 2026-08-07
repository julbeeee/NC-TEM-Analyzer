# Changelog

## v1.0.1 - 2026-08-07

In v1.0.0, automatically detected NPL dimensions were derived from
equivalent-ellipse major/minor axes, whereas manually corrected annotations
used rotated-rectangle side lengths. Version 1.0.1 consistently uses the long
and short sides of the displayed rotated rectangle for automatic detection,
manual correction, statistics, and CSV export.

### Changed

- Unified general and rectangle-seed NPL measurements around the displayed
  rotated rectangle.
- Added `measurement_definition: "rotated_rectangle_side_length"` to new NPL
  analysis results and annotations.
- Preserved existing API response keys and CSV column names.
- Added deterministic Python and JavaScript tests for geometry, automatic
  detection, manual correction, metadata, statistics, and CSV mapping.
