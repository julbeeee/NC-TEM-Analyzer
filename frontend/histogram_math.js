(function attachHistogramMath(global) {
  const MAX_HISTOGRAM_BINS = 120;

  function finiteNumbers(values) {
    if (!Array.isArray(values)) {
      return [];
    }
    return values.map(Number).filter(Number.isFinite);
  }

  function histogramStats(values) {
    const numbers = finiteNumbers(values);
    if (numbers.length === 0) {
      return { count: 0, mean: null, std: null };
    }

    const count = numbers.length;
    const mean = numbers.reduce((total, value) => total + value, 0) / count;
    const variance = numbers.reduce((total, value) => total + ((value - mean) ** 2), 0) / count;
    return { count, mean, std: Math.sqrt(variance) };
  }

  function histogramStatsForRange(values, range) {
    const xMin = Number.isFinite(Number(range?.xMin)) ? Number(range.xMin) : null;
    const xMax = Number.isFinite(Number(range?.xMax)) ? Number(range.xMax) : null;
    const visible = finiteNumbers(values).filter((value) => (
      (xMin === null || value >= xMin) &&
      (xMax === null || value <= xMax)
    ));
    return histogramStats(visible);
  }

  function histogramXAxisTextLayout({ padding, plotWidth, plotHeight, cssHeight }) {
    const plotBottom = padding.top + plotHeight;
    const tickY = plotBottom + 18;
    return {
      tickY,
      axisLabelY: Math.min(cssHeight - 10, tickY + 17),
      ticks: [
        { x: padding.left, align: "left" },
        { x: padding.left + plotWidth / 2, align: "center" },
        { x: padding.left + plotWidth, align: "right" },
      ],
    };
  }

  function histogramYTickCount(maxCount) {
    const count = Math.max(1, Math.round(Number(maxCount) || 1));
    return Math.max(1, Math.min(4, count));
  }

  function histogramEmptyMessageLines() {
    return [
      "Analyze images to start building",
      "the live measurement distribution.",
    ];
  }

  function histogramStatsBadgeText(stats) {
    const mean = Number(stats?.mean);
    const std = Number(stats?.std);
    if (!Number.isFinite(mean) || !Number.isFinite(std)) {
      return "";
    }
    return `Mean ${mean.toFixed(4)} ± ${std.toFixed(4)} nm`;
  }

  function automaticBinSize({ minValue, maxValue, visibleCount }) {
    const range = Math.max(0, Number(maxValue) - Number(minValue));
    if (!Number.isFinite(range) || range <= 0) {
      return 1;
    }
    const basis = Math.max(1, Number(visibleCount) || 1);
    const binCount = Math.max(6, Math.min(14, Math.round(Math.sqrt(basis))));
    const rawSize = range / binCount;
    const magnitude = 10 ** Math.floor(Math.log10(rawSize));
    const normalized = rawSize / magnitude;
    const niceFactor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return Number((niceFactor * magnitude).toPrecision(12));
  }

  function sanitizeHistogramBinSize(input, context) {
    const value = Number(input);
    if (Number.isFinite(value) && value > 0) {
      return value;
    }
    return automaticBinSize(context);
  }

  function nextHistogramBinSize(currentBinSize, deltaY, context) {
    const range = Math.max(0, Number(context?.maxValue) - Number(context?.minValue));
    const current = sanitizeHistogramBinSize(currentBinSize, context);
    const factor = deltaY < 0 ? 0.8 : 1.25;
    const desired = current * factor;
    const minimum = Number.isFinite(range) && range > 0 ? range / MAX_HISTOGRAM_BINS : current;
    const maximum = Number.isFinite(range) && range > 0 ? range : current;
    return Number(Math.min(maximum, Math.max(minimum, desired)).toPrecision(12));
  }

  function nextHistogramYMax(currentMax, deltaY) {
    const safeCurrent = Math.max(1, Math.round(Number(currentMax) || 1));
    if (deltaY < 0) {
      return Math.max(1, Math.min(safeCurrent - 1, Math.floor(safeCurrent * 0.85)));
    }
    return Math.max(safeCurrent + 1, Math.ceil(safeCurrent * 1.15));
  }

  function resolveHistogramBins(values, options) {
    const minValue = Number(options?.minValue);
    const maxValue = Number(options?.maxValue);
    const safeMin = Number.isFinite(minValue) ? minValue : 0;
    const safeMax = Number.isFinite(maxValue) && maxValue > safeMin ? maxValue : safeMin + 1;
    const numbers = finiteNumbers(values).filter((value) => value >= safeMin && value <= safeMax);
    const requestedBinWidth = sanitizeHistogramBinSize(options?.binSize, {
      minValue: safeMin,
      maxValue: safeMax,
      visibleCount: numbers.length,
    });
    const range = safeMax - safeMin;
    const minimumBinWidth = range / MAX_HISTOGRAM_BINS;
    const binWidth = Math.max(requestedBinWidth, minimumBinWidth);
    const binCount = Math.max(1, Math.min(MAX_HISTOGRAM_BINS, Math.ceil(range / binWidth)));
    const bins = new Array(binCount).fill(0);

    numbers.forEach((value) => {
      const rawIndex = Math.floor((value - safeMin) / binWidth);
      const safeIndex = Math.max(0, Math.min(binCount - 1, rawIndex));
      bins[safeIndex] += 1;
    });

    return {
      bins,
      binCount,
      binWidth,
      requestedBinWidth,
      minValue: safeMin,
      maxValue: safeMin + (binCount * binWidth),
    };
  }

  function fitGaussianToHistogram(values, histogram) {
    const stats = histogramStats(values);
    if (stats.count < 2 || stats.mean === null || stats.std === null || stats.std <= 0) {
      return null;
    }

    const minValue = Number(histogram?.minValue);
    const maxValue = Number(histogram?.maxValue);
    const binWidth = Number(histogram?.binWidth);
    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || !Number.isFinite(binWidth) || binWidth <= 0) {
      return null;
    }

    const curveMin = minValue;
    const curveMax = maxValue;
    const samples = 96;
    const normalizer = stats.count * binWidth / (stats.std * Math.sqrt(2 * Math.PI));
    const points = [];
    for (let index = 0; index <= samples; index += 1) {
      const x = curveMin + ((curveMax - curveMin) * index) / samples;
      const exponent = -0.5 * ((x - stats.mean) / stats.std) ** 2;
      points.push({ x, y: normalizer * Math.exp(exponent) });
    }

    return {
      mean: stats.mean,
      std: stats.std,
      peakCount: normalizer,
      points,
    };
  }

  const api = {
    fitGaussianToHistogram,
    histogramEmptyMessageLines,
    histogramXAxisTextLayout,
    histogramYTickCount,
    histogramStats,
    histogramStatsBadgeText,
    histogramStatsForRange,
    MAX_HISTOGRAM_BINS,
    nextHistogramBinSize,
    nextHistogramYMax,
    resolveHistogramBins,
    sanitizeHistogramBinSize,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.HistogramMath = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
