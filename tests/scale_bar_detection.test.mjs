import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

const require = createRequire(import.meta.url);
const {
  chooseScaleBarComponent,
  chooseEmbeddedScaleBarComponent,
  scaleBarExclusionTop,
} = require("../frontend/scale_bar_detection.js");

describe("scale bar component selection", () => {
  it("prefers the inner horizontal bar over a surrounding label box", () => {
    // Given
    const components = [
      { area: 1080, minX: 32, minY: 112, maxX: 163, maxY: 166, bboxWidth: 132, bboxHeight: 55 },
      { area: 480, minX: 60, minY: 126, maxX: 139, maxY: 131, bboxWidth: 80, bboxHeight: 6 },
      { area: 620, minX: 50, minY: 140, maxX: 126, maxY: 164, bboxWidth: 77, bboxHeight: 25 },
    ];

    // When
    const selected = chooseScaleBarComponent(components);

    // Then
    assert.equal(selected.minX, 60);
    assert.equal(selected.bboxWidth, 80);
  });

  it("prefers the inner bar over disconnected box edges and text strokes", () => {
    // Given
    const components = [
      { area: 396, minX: 32, minY: 112, maxX: 163, maxY: 114, bboxWidth: 132, bboxHeight: 3 },
      { area: 396, minX: 32, minY: 164, maxX: 163, maxY: 166, bboxWidth: 132, bboxHeight: 3 },
      { area: 165, minX: 32, minY: 112, maxX: 34, maxY: 166, bboxWidth: 3, bboxHeight: 55 },
      { area: 480, minX: 60, minY: 126, maxX: 139, maxY: 131, bboxWidth: 80, bboxHeight: 6 },
      { area: 150, minX: 50, minY: 145, maxX: 144, maxY: 158, bboxWidth: 95, bboxHeight: 14 },
    ];

    // When
    const selected = chooseScaleBarComponent(components);

    // Then
    assert.equal(selected.minX, 60);
    assert.equal(selected.bboxWidth, 80);
  });

  it("prefers the inner bar over thicker disconnected box edges", () => {
    // Given
    const components = [
      { area: 528, minX: 32, minY: 112, maxX: 163, maxY: 115, bboxWidth: 132, bboxHeight: 4 },
      { area: 660, minX: 32, minY: 164, maxX: 163, maxY: 168, bboxWidth: 132, bboxHeight: 5 },
      { area: 480, minX: 60, minY: 126, maxX: 139, maxY: 131, bboxWidth: 80, bboxHeight: 6 },
      { area: 150, minX: 50, minY: 145, maxX: 144, maxY: 158, bboxWidth: 95, bboxHeight: 14 },
    ];

    // When
    const selected = chooseScaleBarComponent(components);

    // Then
    assert.equal(selected.minX, 60);
    assert.equal(selected.bboxWidth, 80);
  });

  it("selects a thin dark bar nested inside a bright label panel", () => {
    // Given
    const panelComponents = [
      { area: 1490, minX: 150, minY: 128, maxX: 189, maxY: 165, bboxWidth: 40, bboxHeight: 38 },
    ];
    const darkComponents = [
      { area: 26, minX: 158, minY: 146, maxX: 183, maxY: 146, bboxWidth: 26, bboxHeight: 1 },
      { area: 5, minX: 162, minY: 153, maxX: 162, maxY: 157, bboxWidth: 1, bboxHeight: 5 },
      { area: 5, minX: 166, minY: 153, maxX: 166, maxY: 157, bboxWidth: 1, bboxHeight: 5 },
    ];

    // When
    const selected = chooseEmbeddedScaleBarComponent(panelComponents, darkComponents);

    // Then
    assert.equal(selected.minX, 158);
    assert.equal(selected.bboxWidth, 26);
  });

  it("computes particle ROI top exclusion from a detected scale bar", () => {
    // Given
    const imageHeight = 180;
    const scaleBarBox = [158, 146, 26, 1];

    // When
    const exclusionTop = scaleBarExclusionTop(imageHeight, scaleBarBox, 150);

    // Then
    assert.equal(exclusionTop, 126);
  });

  it("falls back to bottom crop when no scale bar is available", () => {
    // Given
    const imageHeight = 180;

    // When
    const exclusionTop = scaleBarExclusionTop(imageHeight, null, 40);

    // Then
    assert.equal(exclusionTop, 140);
  });
});
