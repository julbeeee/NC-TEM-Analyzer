import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

const require = createRequire(import.meta.url);
const {
  acceptedMeasurementExportRows,
  canonicalRectangleMeasurement,
  LEGACY_MEASUREMENT_DEFINITION,
  MEASUREMENT_DEFINITION,
  measurementDefinitionForRow,
  rectangleMeasurementUpdate,
} = require("../frontend/rectangle_measurement.js");
const { histogramStats } = require("../frontend/histogram_math.js");

describe("NPL rotated-rectangle measurement", () => {
  it("updates long and short values after resize and keeps them ordered", () => {
    const measurement = canonicalRectangleMeasurement({ length: 18, width: 82, angle: 0 }, 0.2);
    assert.ok(Math.abs(measurement.long_axis_nm - 16.4) < 1e-12);
    assert.ok(Math.abs(measurement.short_axis_nm - 3.6) < 1e-12);
    assert.ok(Math.abs(measurement.aspect_ratio - (16.4 / 3.6)) < 1e-12);
    assert.ok(measurement.long_axis_nm >= measurement.short_axis_nm);
  });

  it("keeps dimensions ordered after a near-90-degree rotation", () => {
    const measurement = canonicalRectangleMeasurement(
      { length: 80, width: 20, angle: (89.9 * Math.PI) / 180 },
      0.2
    );
    assert.equal(measurement.long_axis_nm, 16);
    assert.equal(measurement.short_axis_nm, 4);
    assert.equal(measurement.aspect_ratio, 4);
  });

  it("does not change dimensions when only the center moves", () => {
    const before = canonicalRectangleMeasurement(
      { centerX: 20, centerY: 30, length: 80, width: 20, angle: 0.4 },
      0.2
    );
    const after = canonicalRectangleMeasurement(
      { centerX: 120, centerY: 75, length: 80, width: 20, angle: 0.4 },
      0.2
    );
    assert.deepEqual(after, before);
  });

  it("uses one edited value for annotation, histogram statistics, and CSV", () => {
    const annotation = rectangleMeasurementUpdate(
      { id: "rect-1", source: "manual_adjusted" },
      { length: 78, width: 22, angle: 0.7 },
      0.2
    );
    const row = {
      name: "synthetic_npl.png",
      mode: "platelet",
      measurement_definition: MEASUREMENT_DEFINITION,
      values_nm: [annotation.long_axis_nm],
      short_values_nm: [annotation.short_axis_nm],
    };
    const longStats = histogramStats(row.values_nm);
    const shortStats = histogramStats(row.short_values_nm);
    const csvRows = acceptedMeasurementExportRows([row]);

    assert.equal(annotation.length_nm, annotation.long_axis_nm);
    assert.equal(annotation.width_nm, annotation.short_axis_nm);
    assert.equal(annotation.aspect, annotation.long_axis_nm / annotation.short_axis_nm);
    assert.equal(annotation.aspect_ratio, annotation.aspect);
    assert.equal(annotation.measurement_definition, MEASUREMENT_DEFINITION);
    assert.equal(longStats.mean, annotation.long_axis_nm);
    assert.equal(shortStats.mean, annotation.short_axis_nm);
    assert.equal(csvRows[0].longAxisNm, annotation.long_axis_nm);
    assert.equal(csvRows[0].shortAxisNm, annotation.short_axis_nm);
  });

  it("treats missing legacy metadata as unknown without changing values", () => {
    const legacyRow = { values_nm: [18.5], short_values_nm: [4.6] };
    assert.equal(measurementDefinitionForRow(legacyRow), LEGACY_MEASUREMENT_DEFINITION);
    assert.deepEqual(legacyRow.values_nm, [18.5]);
    assert.deepEqual(legacyRow.short_values_nm, [4.6]);
  });

  it("rejects non-finite or non-positive geometry", () => {
    assert.throws(() => canonicalRectangleMeasurement({ length: 80, width: 0 }, 0.2));
    assert.throws(() => canonicalRectangleMeasurement({ length: Number.NaN, width: 20 }, 0.2));
    assert.throws(() => canonicalRectangleMeasurement({ length: 80, width: 20 }, 0));
  });
});
