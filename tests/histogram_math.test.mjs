import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { describe, it } from "node:test";

const require = createRequire(import.meta.url);
const {
  fitGaussianToHistogram,
  histogramEmptyMessageLines,
  histogramYTickCount,
  histogramXAxisTextLayout,
  histogramStatsForRange,
  histogramStatsBadgeText,
  nextHistogramBinSize,
  nextHistogramYMax,
  resolveHistogramBins,
  sanitizeHistogramBinSize,
} = require("../frontend/histogram_math.js");

describe("histogram math", () => {
  it("computes mean and std from only values visible in the x range", () => {
    // Given
    const values = [1, 2, 3, 4, 5, 40];

    // When
    const stats = histogramStatsForRange(values, { xMin: 2.5, xMax: 5 });

    // Then
    assert.equal(stats.count, 3);
    assert.equal(stats.mean, 4);
    assert.equal(Number(stats.std.toFixed(6)), 0.816497);
  });

  it("builds fixed-width bins from the selected bin size", () => {
    // Given
    const values = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

    // When
    const result = resolveHistogramBins(values, { minValue: 0, maxValue: 6, binSize: 2 });

    // Then
    assert.equal(result.binCount, 3);
    assert.equal(result.binWidth, 2);
    assert.deepEqual(result.bins, [2, 2, 2]);
  });

  it("falls back to automatic positive bin size when input is malformed", () => {
    // Given
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // When
    const binSize = sanitizeHistogramBinSize("bad-input", {
      minValue: 1,
      maxValue: 9,
      visibleCount: values.length,
    });

    // Then
    assert.equal(binSize, 2);
  });

  it("caps extremely small selected bin sizes to a bounded bin count", () => {
    // Given
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // When
    const result = resolveHistogramBins(values, { minValue: 1, maxValue: 9, binSize: 0.0001 });

    // Then
    assert.equal(result.binCount, 120);
    assert.equal(Number(result.binWidth.toFixed(6)), 0.066667);
  });

  it("steps bin size from histogram wheel direction while staying bounded", () => {
    // Given
    const context = { minValue: 1, maxValue: 9, visibleCount: 9 };

    // When
    const finer = nextHistogramBinSize(2, -100, context);
    const coarser = nextHistogramBinSize(2, 100, context);
    const capped = nextHistogramBinSize(0.0001, -100, context);

    // Then
    assert.equal(finer, 1.6);
    assert.equal(coarser, 2.5);
    assert.equal(Number(capped.toFixed(6)), 0.066667);
  });

  it("steps y-axis scale by at least one count when wheel direction changes scale", () => {
    // Given
    const currentMax = 3;

    // When
    const tighter = nextHistogramYMax(currentMax, -100);
    const looser = nextHistogramYMax(currentMax, 100);

    // Then
    assert.equal(tighter, 2);
    assert.equal(looser, 4);
  });

  it("keeps x-axis tick labels inside the plot bounds with separated caption", () => {
    // Given
    const layout = histogramXAxisTextLayout({
      padding: { top: 20, right: 18, bottom: 58, left: 48 },
      plotWidth: 214,
      plotHeight: 162,
      cssHeight: 240,
    });

    // When
    const [leftTick, middleTick, rightTick] = layout.ticks;

    // Then
    assert.equal(leftTick.align, "left");
    assert.equal(middleTick.align, "center");
    assert.equal(rightTick.align, "right");
    assert.ok(layout.axisLabelY - layout.tickY >= 16);
    assert.ok(layout.axisLabelY <= 230);
  });

  it("uses whole-count y ticks for small histogram counts", () => {
    // Given / When / Then
    assert.equal(histogramYTickCount(3), 3);
    assert.equal(histogramYTickCount(8), 4);
  });

  it("formats the visible mean and std badge for the histogram plot", () => {
    // Given
    const stats = { mean: 10, std: 1.1952286093343936 };

    // When
    const label = histogramStatsBadgeText(stats);

    // Then
    assert.equal(label, "Mean 10.0000 ± 1.1952 nm");
  });

  it("wraps the empty histogram guidance into two short lines", () => {
    // Given / When
    const lines = histogramEmptyMessageLines();

    // Then
    assert.deepEqual(lines, [
      "Analyze images to start building",
      "the live measurement distribution.",
    ]);
  });

  it("fits a Gaussian curve from the visible histogram distribution", () => {
    // Given
    const values = [8, 9, 10, 10, 10, 11, 12];
    const histogram = resolveHistogramBins(values, { minValue: 8, maxValue: 12, binSize: 1 });

    // When
    const fit = fitGaussianToHistogram(values, histogram);

    // Then
    assert.ok(fit);
    assert.equal(fit.mean, 10);
    assert.equal(Number(fit.std.toFixed(6)), 1.195229);
    assert.equal(fit.points.length, 97);
    assert.ok(fit.peakCount > 2.3 && fit.peakCount < 2.4);
  });
});
