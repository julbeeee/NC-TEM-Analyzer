# NPL Measurement Definition Fix Report

## Scope and version protection

This report covers the NPL measurement-definition correction released in
v1.0.1. The public `v1.0.0` tag, commit, history, and release remain unchanged.

## 1. Root cause

In v1.0.0, the general Python NPL detector and the rectangle-seed detector
reported `regionprops` equivalent-ellipse major/minor axes as physical length
and width. The overlay polygon was generated separately by projecting the
segmented coordinates onto their principal directions. Manual correction then
replaced the automatic values with the edited rotated rectangle's actual side
lengths. Consequently, untouched and manually corrected NPLs could use
different measurement definitions in one result.

## 2. Data flow before the fix

### General Python detector

`segmented region -> equivalent-ellipse major/minor axes -> length/aspect
filters -> values_nm/short_values_nm -> statistics -> frontend history ->
histogram and CSV`

The rotated rectangle was generated later and was used only as overlay
geometry.

### Rectangle-seed detector

`segmented candidate -> equivalent-ellipse major/minor axes -> seed filters and
score -> candidate length_nm/width_nm -> API -> statistics and CSV`

The displayed polygon was calculated independently from those values.

### Manual correction and exports

After a resize, move, or rotation, the frontend wrote the edited rectangle's
side lengths into `_rawValuesNm` and `_rawShortValuesNm`. Exclusion filtering,
statistics, histograms, and CSV export then consumed those arrays. This made
the manual path geometrically different from the automatic paths. There is no
current persistent NPL IndexedDB save path; the existing verified-sample store
is restricted to spherical-dot annotations.

## 3. Canonical measurement definition after the fix

- `long_axis_nm`: mean length of the longer pair of opposite sides of the exact
  displayed rotated rectangle, multiplied by `nm_per_pixel`.
- `short_axis_nm`: mean length of the shorter pair of opposite sides of that
  rectangle, multiplied by `nm_per_pixel`.
- `aspect_ratio`: `long_axis_nm / short_axis_nm`.
- Invariants: `long_axis_nm >= short_axis_nm > 0`, and all values are finite.

The Python helper orders the four corners cyclically, measures all four edges,
averages opposite edges, and rejects invalid geometry. It does not fall back to
equivalent-ellipse axes. Equivalent-ellipse axes are retained only as named
shape descriptors in annotation/candidate metadata.

## 4. Changed files

- `core/rectangle_geometry.py`
  - Added the shared rectangle ordering, validation, and side-length helper.
  - Added the canonical `rotated_rectangle_side_length` definition constant.
- `core/analyzer.py`
  - General automatic NPL filtering, statistics, results, overlay annotations,
    and aspect ratio now use the displayed rectangle's side lengths.
  - Added explicit ellipse-axis descriptor fields without using them as final
    physical dimensions.
- `core/rectangle_seed.py`
  - Seed candidate filtering, scoring, physical dimensions, and aspect ratio
    now use the displayed candidate polygon's side lengths.
- `backend/web_app.py`
  - General and seed API payloads now carry canonical rectangle annotations and
    `measurement_definition` while preserving existing fields.
- `frontend/rectangle_measurement.js`
  - Added pure helpers for canonical manual measurements, legacy metadata
    handling, annotation updates, and CSV row mapping.
- `frontend/app.js`
  - Manual correction writes one canonical value to annotations, live arrays,
    statistics/histogram sources, and CSV sources.
  - The retained client-side detector implementation was aligned with the same
    definition even though the current UI submits analyses to Flask.
- `frontend/tem.html`
  - Loads the rectangle helper before the application and updates cache keys.
- `tests/test_npl_measurement.py`
  - Added Python geometry, general detector, API-payload, and public seed-path
    integration tests.
- `tests/rectangle_measurement.test.mjs`
  - Added manual correction, ordering, movement, statistics, CSV, invalid
    geometry, and legacy metadata tests.
- `README.md`, `VERSION`, `CHANGELOG.md`
  - Documented v1.0.1, the canonical definition, compatibility behavior, test
    command, and release notes.

## 5. New tests

### Python

- Exact 80 x 20 px corners at 0, 15, 45, and 80 degrees.
- All 24 permutations of the same four corners.
- Duplicate, zero-area, near-zero-width, non-finite, wrong-count, and
  non-rectangular input rejection.
- Rasterized 80 x 20 px NPL measurement through the general detector.
- Verification that the reported result, annotation, statistics, and API
  payload all match the displayed polygon.
- Public rectangle-seed detection on the same synthetic geometry.
- Verification that ellipse axes differ but are not used as physical output.

### JavaScript

- Resize updates and long/short ordering.
- Near-90-degree rotation preserves `long >= short`.
- Move-only edits preserve dimensions.
- Annotation, histogram statistics, and CSV receive the same edited values.
- Aspect ratio is recomputed from canonical long/short values.
- Missing legacy metadata remains `legacy_or_unknown` without changing values.
- Non-finite and non-positive manual geometry is rejected.

## 6. Test commands and results

The following commands passed during the first complete regression run:

```text
python tests/test_npl_measurement.py       PASS (5 tests)
python local_tests/analyzer_smoke.py       PASS
python local_tests/fft_analyzer_smoke.py   PASS
node --test tests/*.test.mjs               PASS (23 tests, 3 suites)
```

Additional checks:

- Python and JavaScript syntax/compile checks: PASS.
- Flask `/api/analyze` with `sample_data/spherical_ag2se.jpg`: PASS (HTTP 200,
  one result, no per-image error, spherical mode, 375 accepted detections).
- Existing scale-bar, histogram, spherical analyzer, FFT/IFFT, and d-spacing
  tests: PASS.

The final complete run after documentation changes is recorded in the final
verification section below.

## 7. Synthetic 80 x 20 px before/after comparison

Test conditions: a 30-degree rasterized rectangle, `0.2 nm/px`, with permissive
shape-quality filters. Rasterization produced a displayed PCA-aligned rectangle
of approximately `79.9561 x 19.9899 px`. The equivalent ellipse was
approximately `92.4560 x 23.1360 px`.

| Result | v1.0.0 | v1.0.1 fix |
| --- | ---: | ---: |
| General long axis | 18.4912 nm | 15.9912 nm |
| General short axis | 4.6272 nm | 3.9980 nm |
| Seed long axis | 18.4912 nm | 15.9912 nm |
| Seed short axis | 4.6272 nm | 3.9980 nm |
| Definition | Equivalent ellipse | Displayed rectangle sides |

With a `max_length_nm` threshold of 17 nm, v1.0.0 would reject this candidate
because its reported ellipse-derived length was about 18.49 nm. The fixed code
accepts it because both the filter and final reported rectangle length are about
15.99 nm. No correction factor or default-parameter tuning was introduced.

## 8. Repository sample-data comparison

The repository contains a spherical Ag2Se particle example, not an anisotropic
NPL dataset. Therefore NPL accepted-N, NPL mean/SD, and long/short histogram
before/after comparisons are not applicable to the current sample. The
spherical sample was analyzed through the Flask route successfully, and the
spherical measurement implementation was not changed.

No paper figure, table, research source data, or prior timing record was
overwritten. A real NPL reanalysis, when data are supplied, should be written to
`revision_outputs/v1.0.1/`.

## 9. Backward compatibility and schema handling

- Existing Flask routes, request parameters, response keys, and CSV columns
  remain unchanged.
- New NPL results and annotations add
  `measurement_definition: "rotated_rectangle_side_length"`.
- Frontend rows without that field are marked `legacy_or_unknown`; their
  numeric values are not converted, reinterpreted, or overwritten.
- Existing `values_nm`, `short_values_nm`, `length_nm`, `width_nm`, `aspect`,
  `long_axis_nm`, and `short_axis_nm` consumers remain supported.
- The existing IndexedDB schema constants describe spherical verified samples
  and FFT ROI samples. Because no NPL record schema currently exists, those
  unrelated schemas were not bumped and no migration framework was added.

## 10. Remaining risks and follow-up

- Real NPL accepted counts and distributions can change because length and
  aspect filters now use the same rectangle definition as reported outputs.
  This is expected and must not be hidden by threshold tuning.
- The displayed polygon is the existing PCA-aligned projected rectangle, not a
  separately introduced minimum-area rectangle. This fix intentionally uses
  the exact geometry already displayed rather than changing segmentation or
  overlay construction.
- A representative real NPL dataset should be reanalyzed separately before
  updating manuscript figures or tables.
- Browser interaction was covered through deterministic JavaScript helpers,
  not a newly introduced full browser E2E framework, as allowed by the work
  instruction.

## Final verification

The final all-tests run completed successfully after code and documentation
changes:

```text
Python compile checks                         PASS
JavaScript syntax checks                      PASS
python tests/test_npl_measurement.py          PASS (5 tests)
python local_tests/analyzer_smoke.py          PASS
python local_tests/fft_analyzer_smoke.py      PASS
node --test tests/*.test.mjs                  PASS (23 tests, 3 suites)
git diff --check                              PASS
```

The `v1.0.0` tag remains at commit
`c54a8c3aa5723261c6af40ca5da40f82b0c8c293`.
