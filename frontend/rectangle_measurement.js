(function attachRectangleMeasurement(global) {
  const MEASUREMENT_DEFINITION = "rotated_rectangle_side_length";
  const LEGACY_MEASUREMENT_DEFINITION = "legacy_or_unknown";

  function canonicalRectangleMeasurement(geometry, nmPerPixel) {
    const sideA = Number(geometry?.length);
    const sideB = Number(geometry?.width);
    const scale = Number(nmPerPixel);
    if (![sideA, sideB, scale].every(Number.isFinite) || sideA <= 0 || sideB <= 0 || scale <= 0) {
      throw new Error("Rectangle sides and nm_per_pixel must be finite and positive.");
    }
    const longPx = Math.max(sideA, sideB);
    const shortPx = Math.min(sideA, sideB);
    const longAxisNm = longPx * scale;
    const shortAxisNm = shortPx * scale;
    return {
      measurement_definition: MEASUREMENT_DEFINITION,
      long_px: longPx,
      short_px: shortPx,
      long_axis_nm: longAxisNm,
      short_axis_nm: shortAxisNm,
      aspect_ratio: longAxisNm / shortAxisNm,
    };
  }

  function rectangleMeasurementUpdate(existingAnnotation, geometry, nmPerPixel) {
    const measurement = canonicalRectangleMeasurement(geometry, nmPerPixel);
    return {
      ...(existingAnnotation || {}),
      measurement_definition: measurement.measurement_definition,
      length_nm: measurement.long_axis_nm,
      width_nm: measurement.short_axis_nm,
      long_axis_nm: measurement.long_axis_nm,
      short_axis_nm: measurement.short_axis_nm,
      aspect: measurement.aspect_ratio,
      aspect_ratio: measurement.aspect_ratio,
    };
  }

  function measurementDefinitionForRow(row) {
    const definition = row?.measurement_definition;
    return typeof definition === "string" && definition.trim()
      ? definition
      : LEGACY_MEASUREMENT_DEFINITION;
  }

  function acceptedMeasurementExportRows(historyRows) {
    const rows = [];
    (Array.isArray(historyRows) ? historyRows : []).forEach((row) => {
      if (!row || row.error || !Array.isArray(row.values_nm)) {
        return;
      }
      const mode = row.mode || "";
      row.values_nm.forEach((value, index) => {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          return;
        }
        const shortValue = Number(row.short_values_nm?.[index]);
        rows.push({
          sourceName: row.name || "",
          mode,
          index: index + 1,
          diameterNm: mode === "platelet" ? "" : numericValue,
          longAxisNm: mode === "platelet" ? numericValue : "",
          shortAxisNm: mode === "platelet" && Number.isFinite(shortValue) ? shortValue : "",
        });
      });
    });
    return rows;
  }

  const api = {
    acceptedMeasurementExportRows,
    canonicalRectangleMeasurement,
    LEGACY_MEASUREMENT_DEFINITION,
    MEASUREMENT_DEFINITION,
    measurementDefinitionForRow,
    rectangleMeasurementUpdate,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.RectangleMeasurement = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
