const form = document.getElementById("analyzeForm");
const imagesInput = document.getElementById("images");
const resultPanel = document.getElementById("resultPanel");
const resultRows = document.getElementById("resultRows");
const totalCount = document.getElementById("totalCount");
const errorMessage = document.getElementById("errorMessage");
const histogramCanvas = document.getElementById("histogramCanvas");
const histogramSummary = document.getElementById("histogramSummary");
const downloadCsv = document.getElementById("downloadCsv");
const downloadHistogramPng = document.getElementById("downloadHistogramPng");
const histAxisResetBtn = document.getElementById("histAxisResetBtn");
const histogramBinSizeInput = document.getElementById("histogramBinSize");
const refreshHistoryBtn = document.getElementById("refreshHistoryBtn");
const histogramMetricTag = document.getElementById("histogramMetricTag");
const histogramAxisButtons = Array.from(document.querySelectorAll("[data-hist-axis]"));
const clearDataBtn = document.getElementById("clearDataBtn");
const submitBtn = document.getElementById("submitBtn");
const analysisSubmitButtons = Array.from(document.querySelectorAll("[data-submit-analysis]"));
const previewCanvas = document.getElementById("previewCanvas");
const previewTitle = document.getElementById("previewTitle");
const previewHint = document.getElementById("previewHint");
const fileList = document.getElementById("fileList");
const targetShape = document.getElementById("targetShape");
const rectangleSeedPointsInput = document.getElementById("rectangleSeedPointsInput");
const sphericalThresholds = document.getElementById("sphericalThresholds");
const plateletThresholds = document.getElementById("plateletThresholds");
const sphericalDetectionSettings = document.getElementById("sphericalDetectionSettings");
const plateletDetectionSettings = document.getElementById("plateletDetectionSettings");
const sphericalAcceptanceSettings = document.getElementById("sphericalAcceptanceSettings");
const plateletAcceptanceSettings = document.getElementById("plateletAcceptanceSettings");
const advancedSettingsToggle = document.getElementById("advancedSettingsToggle");
const advancedSettingsBody = document.getElementById("advancedSettingsBody");
const advancedSettingsIcon = advancedSettingsToggle?.querySelector(".advanced-toggle-icon");
const workspace = document.querySelector(".analysis-layout");
const fileSearchInput = document.getElementById("fileSearch");
const shapeTabs = Array.from(document.querySelectorAll("[data-shape-tab]"));
const previewLayerButtons = Array.from(document.querySelectorAll("[data-preview-layer]"));
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const consoleLog = document.querySelector(".console-log");
const clearConsoleBtn = document.getElementById("clearConsoleBtn");
const acceptedCountBadge = document.getElementById("acceptedCountBadge");
const modeBadge = document.getElementById("modeBadge");
const modeCompact = document.getElementById("modeCompact");
const scaleBadge = document.getElementById("scaleBadge");
const previewStatusLabel = document.getElementById("previewStatusLabel");
const sessionModeValue = document.getElementById("sessionModeValue");
const sessionFileCount = document.getElementById("sessionFileCount");
const resultStateValue = document.getElementById("resultStateValue");
const knownNmInput = document.getElementById("knownNmInput");
const selectedDotLabel = document.getElementById("selectedDotLabel");
const radiusMinusBtn = document.getElementById("radiusMinusBtn");
const radiusPlusBtn = document.getElementById("radiusPlusBtn");
const centerLeftBtn = document.getElementById("centerLeftBtn");
const centerRightBtn = document.getElementById("centerRightBtn");
const centerUpBtn = document.getElementById("centerUpBtn");
const centerDownBtn = document.getElementById("centerDownBtn");
const toggleSelectedDotBtn = document.getElementById("toggleSelectedDotBtn");
const saveVerifiedSampleBtn = document.getElementById("saveVerifiedSampleBtn");
const verifiedSampleCount = document.getElementById("verifiedSampleCount");
const overlayToolTag = document.getElementById("overlayToolTag");
const rectangleSeedPanel = document.getElementById("rectangleSeedPanel");
const startRectangleSeedBtn = document.getElementById("startRectangleSeedBtn");
const resetRectangleSeedBtn = document.getElementById("resetRectangleSeedBtn");
const rectangleSeedStatus = document.getElementById("rectangleSeedStatus");
const startFftRoiBtn = document.getElementById("startFftRoiBtn");
const runFftBtn = document.getElementById("runFftBtn");
const resetFftBtn = document.getElementById("resetFftBtn");
const saveFftResultBtn = document.getElementById("saveFftResultBtn");
const exportFftCsvBtn = document.getElementById("exportFftCsvBtn");
const fftCanvas = document.getElementById("fftCanvas");
const inverseFftCanvas = document.getElementById("inverseFftCanvas");
const fftFrequencyProfileCanvas = document.getElementById("fftFrequencyProfileCanvas");
const fftProfileCanvas = document.getElementById("fftProfileCanvas");
const fftStatus = document.getElementById("fftStatus");
const fftRoiLabel = document.getElementById("fftRoiLabel");
const fftSpacingLabel = document.getElementById("fftSpacingLabel");
const fftAngleLabel = document.getElementById("fftAngleLabel");
const fftPeakLabel = document.getElementById("fftPeakLabel");
const fftSavedCount = document.getElementById("fftSavedCount");
const fftDisplayMin = document.getElementById("fftDisplayMin");
const fftDisplayMax = document.getElementById("fftDisplayMax");
const fftDisplayBrightness = document.getElementById("fftDisplayBrightness");
const fftDisplayContrast = document.getElementById("fftDisplayContrast");
const fftDisplayMinValue = document.getElementById("fftDisplayMinValue");
const fftDisplayMaxValue = document.getElementById("fftDisplayMaxValue");
const fftDisplayBrightnessValue = document.getElementById("fftDisplayBrightnessValue");
const fftDisplayContrastValue = document.getElementById("fftDisplayContrastValue");
const fftDisplayAutoBtn = document.getElementById("fftDisplayAutoBtn");
const fftDisplayResetBtn = document.getElementById("fftDisplayResetBtn");
const fftDisplayApplyBtn = document.getElementById("fftDisplayApplyBtn");
const fftOverlayToggle = document.getElementById("fftOverlayToggle");
const ifftMaskRadius = document.getElementById("ifftMaskRadius");
const ifftMaskRadiusValue = document.getElementById("ifftMaskRadiusValue");
const ifftMode = document.getElementById("ifftMode");
const applyIfftBtn = document.getElementById("applyIfftBtn");
const boundaryFitPreset = document.getElementById("boundaryFitPreset");
const contrastPreset = document.getElementById("contrastPreset");
const noiseCleanupPreset = document.getElementById("noiseCleanupPreset");
const shapeStrictnessPreset = document.getElementById("shapeStrictnessPreset");
const apiBaseUrl = (window.TEM_API_BASE_URL || window.location.origin || "").replace(/\/$/, "");
const workflowSteps = Array.from(document.querySelectorAll("[data-workflow-step]"));
const workflowModeLabel = document.getElementById("workflowModeLabel");
const workflowQueueLabel = document.getElementById("workflowQueueLabel");
const workflowDetectLabel = document.getElementById("workflowDetectLabel");
const workflowCorrectLabel = document.getElementById("workflowCorrectLabel");
const workflowExportLabel = document.getElementById("workflowExportLabel");
const histogramMath = window.HistogramMath;
const scaleBarDetection = window.ScaleBarDetection;
const rectangleMeasurement = window.RectangleMeasurement;

const state = {
  files: [],
  fileFilter: "",
  selectedIndex: -1,
  results: [],
  historyRows: [],
  accumulatedValues: [],
  accumulatedShortValues: [],
  histogramAxis: "long",
  histogramBinSize: null,
  histogramView: {
    xMin: null,
    xMax: null,
    yMax: null,
    dragStartX: null,
    dragCurrentX: null,
    lastPlot: null,
  },
  nextHistoryId: 1,
  logs: [],
  selectedOverlayIndex: -1,
  verifiedSampleCount: 0,
  previewLayer: "overlay",
  previewZoom: 1,
  rectangleSeed: {
    points: [],
    captureActive: false,
  },
  rectangleEdit: {
    active: false,
    mode: null,
    index: -1,
    startPoint: null,
    startGeometry: null,
    moved: false,
    suppressNextClick: false,
  },
  fft: {
    roi: null,
    draftRoi: null,
    captureActive: false,
    dragStart: null,
    result: null,
    manualPeaks: [],
    profilePeaks: [],
    profileDrag: {
      active: false,
      handleIndex: -1,
      pointerId: null,
      moved: false,
    },
    profileAxisDrag: {
      active: false,
      kind: null,
      mode: null,
      pointerId: null,
      startPoint: null,
      startView: null,
      moved: false,
    },
    profileViews: {
      frequency: { xMin: null, xMax: null, yMin: null, yMax: null },
      inverse: { xMin: null, xMax: null, yMin: null, yMax: null },
    },
    display: {
      min: 0,
      max: 255,
      brightness: 0,
      contrast: 100,
    },
    showOverlay: true,
    savedCount: 0,
    suppressNextClick: false,
  },
};

let drawGeneration = 0;

function timestampLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

function logConsole(title, detail = "", tone = "info") {
  state.logs.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    time: timestampLabel(),
    title,
    detail,
    tone,
  });

  if (state.logs.length > 18) {
    state.logs.length = 18;
  }

  renderConsole();
}

function renderConsole() {
  if (!consoleLog) {
    return;
  }

  consoleLog.innerHTML = "";

  if (state.logs.length === 0) {
    const empty = document.createElement("div");
    empty.className = "console-entry info";
    empty.innerHTML = "<time>Session</time><strong>No events yet.</strong><div>Analyzer activity will appear here.</div>";
    consoleLog.appendChild(empty);
    return;
  }

  state.logs.forEach((entry) => {
    const row = document.createElement("div");
    row.className = `console-entry ${entry.tone}`;

    const time = document.createElement("time");
    time.textContent = entry.time;

    const title = document.createElement("strong");
    title.textContent = entry.title;

    const detail = document.createElement("div");
    detail.textContent = entry.detail;

    row.appendChild(time);
    row.appendChild(title);
    if (entry.detail) {
      row.appendChild(detail);
    }
    consoleLog.appendChild(row);
  });
}

function currentModeLabel() {
  return targetShape.value === "platelet" ? "Nanoplatelet / Rod" : "Spherical Dot";
}

function currentModeShortLabel() {
  return targetShape.value === "platelet" ? "Platelet" : "Spherical";
}

function setNamedInputValue(name, value) {
  const input = form.querySelector(`[name="${name}"]`);
  if (input) {
    input.value = String(value);
  }
}

function applyGuidedTuning({ emitLog = true } = {}) {
  const boundary = boundaryFitPreset?.value || "balanced";
  const contrast = contrastPreset?.value || "normal";
  const noise = noiseCleanupPreset?.value || "normal";
  const shape = shapeStrictnessPreset?.value || "normal";

  const boundaryMap = {
    conservative: 0,
    balanced: 1.5,
    expanded: 3,
  };
  const contrastMap = {
    soft: { gamma: 0.9, gauss: 0.18 },
    normal: { gamma: 0.7, gauss: 0.3 },
    strong: { gamma: 0.5, gauss: 0.45 },
  };
  const noiseMap = {
    low: 18,
    normal: 30,
    high: 60,
  };
  const shapeMap = {
    loose: { ecc: 0.98, sol: 0.2 },
    normal: { ecc: 0.95, sol: 0.35 },
    strict: { ecc: 0.78, sol: 0.55 },
  };

  setNamedInputValue("boundary_expand_px", boundaryMap[boundary] ?? 1.5);
  setNamedInputValue("gamma", contrastMap[contrast]?.gamma ?? 0.7);
  setNamedInputValue("gauss_sigma", contrastMap[contrast]?.gauss ?? 0.3);
  setNamedInputValue("dot_min_area_px", noiseMap[noise] ?? 30);
  setNamedInputValue("ecc_max", shapeMap[shape]?.ecc ?? 0.95);
  setNamedInputValue("sol_min", shapeMap[shape]?.sol ?? 0.35);

  if (emitLog) {
    logConsole(
      "Tuning updated",
      `Boundary ${boundary}, contrast ${contrast}, cleanup ${noise}, shape ${shape}.`,
      "info"
    );
  }
}

function setShapeThresholdPanel({ emitLog = true } = {}) {
  const isPlatelet = targetShape.value === "platelet";

  sphericalThresholds.classList.toggle("hidden", isPlatelet);
  plateletThresholds.classList.toggle("hidden", !isPlatelet);

  if (sphericalDetectionSettings) {
    sphericalDetectionSettings.classList.toggle("hidden", isPlatelet);
  }
  if (plateletDetectionSettings) {
    plateletDetectionSettings.classList.toggle("hidden", !isPlatelet);
  }
  if (sphericalAcceptanceSettings) {
    sphericalAcceptanceSettings.classList.toggle("hidden", isPlatelet);
  }
  if (plateletAcceptanceSettings) {
    plateletAcceptanceSettings.classList.toggle("hidden", !isPlatelet);
  }

  shapeTabs.forEach((tab) => {
    const active = tab.dataset.shapeTab === targetShape.value;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });

  if (modeBadge) {
    modeBadge.textContent = currentModeLabel();
  }
  if (modeCompact) {
    modeCompact.textContent = currentModeShortLabel();
  }
  if (sessionModeValue) {
    sessionModeValue.textContent = currentModeLabel();
  }

  updateSessionStats();
  updateRectangleSeedControls();

  if (emitLog) {
    logConsole("Mode updated", `${currentModeLabel()} workspace is active.`, "info");
  }
}

function syncPreviewZoom() {
  const zoom = Math.max(1, Math.min(6, state.previewZoom || 1));
  state.previewZoom = zoom;
  if (previewCanvas) {
    previewCanvas.style.setProperty("--preview-zoom", String(zoom));
    previewCanvas.classList.toggle("zoomed", zoom > 1.01);
  }
  if (zoomResetBtn) {
    zoomResetBtn.textContent = `${Math.round(zoom * 100)}%`;
  }
}

function setPreviewZoom(nextZoom) {
  state.previewZoom = Math.max(1, Math.min(6, nextZoom));
  syncPreviewZoom();
  if (previewStatusLabel && state.previewZoom > 1.01) {
    previewStatusLabel.textContent = `Zoom ${Math.round(state.previewZoom * 100)}%`;
  }
}

function setAnalysisSubmitState(disabled, label) {
  const buttons = analysisSubmitButtons.length
    ? analysisSubmitButtons
    : [submitBtn].filter(Boolean);
  buttons.forEach((button) => {
    button.disabled = disabled;
    const step = button.dataset.step;
    if (!step) {
      button.textContent = label;
      return;
    }

    const dot = document.createElement("span");
    dot.className = "step-dot";
    dot.setAttribute("aria-hidden", "true");
    dot.textContent = step;

    const text = document.createElement("span");
    text.textContent = label;

    button.replaceChildren(dot, text);
  });
}

function syncAdvancedSettingsToggle(expanded) {
  if (!advancedSettingsToggle || !advancedSettingsBody) {
    return;
  }
  advancedSettingsBody.classList.toggle("hidden", !expanded);
  advancedSettingsToggle.setAttribute("aria-expanded", String(expanded));
  if (advancedSettingsIcon) {
    advancedSettingsIcon.textContent = expanded ? "\u25bc" : "\u25b2";
  }
}

function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load selected image"));
    image.src = url;
  });
}

function toFixedOrDash(value) {
  if (value === null || value === undefined) {
    return "-";
  }
  return Number(value).toFixed(4);
}

function stats(values) {
  if (histogramMath) {
    return histogramMath.histogramStats(values);
  }
  if (values.length === 0) {
    return { count: 0, mean: null, std: null };
  }

  const count = values.length;
  const mean = values.reduce((accumulator, value) => accumulator + value, 0) / count;
  const variance = values.reduce((accumulator, value) => accumulator + (value - mean) ** 2, 0) / count;

  return {
    count,
    mean,
    std: Math.sqrt(variance),
  };
}

function formNumber(formData, name, fallback) {
  const raw = formData.get(name);
  if (raw === null || raw === "") {
    return fallback;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number for ${name}: ${raw}`);
  }
  return value;
}

function buildLocalConfig(formData) {
  const mode = String(formData.get("target_shape") || "spherical");
  const knownNm = formNumber(formData, "known_nm", 100);
  const sbColor = String(formData.get("sb_color") || "white").toLowerCase();

  if (knownNm <= 0) {
    throw new Error("Scale bar length must be greater than 0.");
  }
  if (!["white", "black"].includes(sbColor)) {
    throw new Error("Scale bar color must be white or black.");
  }

  const isPlatelet = mode === "platelet";
  return {
    mode,
    knownNm,
    sbColor,
    settings: {
      sbRegionRatio: formNumber(formData, isPlatelet ? "platelet_sb_region_ratio" : "sb_region_ratio", 0.85),
      whiteThr: formNumber(formData, isPlatelet ? "platelet_white_thr" : "white_thr", 245),
      blackThr: formNumber(formData, isPlatelet ? "platelet_black_thr" : "black_thr", isPlatelet ? 30 : 10),
      sbMinArea: formNumber(formData, isPlatelet ? "platelet_sb_min_area" : "sb_min_area", 200),
      cropBottomPx: formNumber(formData, isPlatelet ? "platelet_crop_bottom_px" : "crop_bottom_px", 150),
      gamma: formNumber(formData, isPlatelet ? "platelet_gamma" : "gamma", isPlatelet ? 0.08 : 0.7),
      gaussSigma: formNumber(formData, isPlatelet ? "platelet_gauss_sigma" : "gauss_sigma", isPlatelet ? 0.45 : 0.3),
      boundaryExpandPx: isPlatelet ? 0 : Math.max(0, formNumber(formData, "boundary_expand_px", 0)),
    },
    spherical: {
      minNm: formNumber(formData, "min_nm", 5),
      maxNm: formNumber(formData, "max_nm", 15),
      eccMax: formNumber(formData, "ecc_max", 0.95),
      solMin: formNumber(formData, "sol_min", 0.35),
      minAreaPx: Math.max(1, formNumber(formData, "dot_min_area_px", 30)),
    },
    platelet: {
      minLengthNm: formNumber(formData, "platelet_min_length_nm", 3),
      maxLengthNm: formNumber(formData, "platelet_max_length_nm", 15),
      aspectMin: formNumber(formData, "platelet_aspect_min", 1.8),
      eccMin: formNumber(formData, "platelet_ecc_min", 0.65),
      extentMin: formNumber(formData, "platelet_extent_min", 0.35),
      solMin: formNumber(formData, "platelet_sol_min", 0.35),
      minAreaPx: formNumber(formData, "platelet_min_area_px", 35),
      seedPoints: isPlatelet && state.rectangleSeed.points.length === 4
        ? cloneFlatArray(state.rectangleSeed.points)
        : [],
    },
  };
}

async function imageFileToGray(file) {
  if (/\.(tif|tiff)$/i.test(file.name)) {
    throw new Error("TIFF files need a browser decoder. Use PNG/JPG for local-only analysis.");
  }

  const url = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImageFromUrl(url);
  } finally {
    URL.revokeObjectURL(url);
  }

  return imageToGrayData(image);
}

function imageToGrayData(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const gray = new Float32Array(canvas.width * canvas.height);

  for (let i = 0, j = 0; i < data.length; i += 4, j += 1) {
    gray[j] = ((data[i] * 0.2126) + (data[i + 1] * 0.7152) + (data[i + 2] * 0.0722)) / 255;
  }

  return { gray, width: canvas.width, height: canvas.height };
}

function connectedComponents(mask, width, height, minArea = 1) {
  const visited = new Uint8Array(mask.length);
  const stack = new Int32Array(mask.length);
  const components = [];

  for (let start = 0; start < mask.length; start += 1) {
    if (!mask[start] || visited[start]) {
      continue;
    }

    let top = 0;
    stack[top] = start;
    visited[start] = 1;

    let area = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumYY = 0;
    let sumXY = 0;

    while (top >= 0) {
      const index = stack[top];
      top -= 1;

      const x = index % width;
      const y = Math.floor(index / width);
      area += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumYY += y * y;
      sumXY += x * y;

      if (x > 0) {
        const next = index - 1;
        if (mask[next] && !visited[next]) {
          visited[next] = 1;
          top += 1;
          stack[top] = next;
        }
      }
      if (x < width - 1) {
        const next = index + 1;
        if (mask[next] && !visited[next]) {
          visited[next] = 1;
          top += 1;
          stack[top] = next;
        }
      }
      if (y > 0) {
        const next = index - width;
        if (mask[next] && !visited[next]) {
          visited[next] = 1;
          top += 1;
          stack[top] = next;
        }
      }
      if (y < height - 1) {
        const next = index + width;
        if (mask[next] && !visited[next]) {
          visited[next] = 1;
          top += 1;
          stack[top] = next;
        }
      }
    }

    if (area < minArea) {
      continue;
    }

    const cx = sumX / area;
    const cy = sumY / area;
    const varX = Math.max(0, (sumXX / area) - (cx * cx));
    const varY = Math.max(0, (sumYY / area) - (cy * cy));
    const covXY = (sumXY / area) - (cx * cy);
    const trace = varX + varY;
    const determinantTerm = Math.sqrt(Math.max(0, ((varX - varY) * (varX - varY)) + (4 * covXY * covXY)));
    const lambdaMajor = Math.max(0, (trace + determinantTerm) / 2);
    const lambdaMinor = Math.max(0, (trace - determinantTerm) / 2);
    const majorAxis = 4 * Math.sqrt(lambdaMajor);
    const minorAxis = 4 * Math.sqrt(lambdaMinor);
    const bboxWidth = maxX - minX + 1;
    const bboxHeight = maxY - minY + 1;
    const extent = area / Math.max(1, bboxWidth * bboxHeight);
    const eccentricity = lambdaMajor <= 1e-9
      ? 0
      : Math.sqrt(Math.max(0, 1 - (lambdaMinor / lambdaMajor)));

    components.push({
      area,
      cx,
      cy,
      minX,
      minY,
      maxX,
      maxY,
      bboxWidth,
      bboxHeight,
      extent,
      solidity: extent,
      eccentricity,
      majorAxis,
      minorAxis,
      orientation: 0.5 * Math.atan2(2 * covXY, varX - varY),
    });
  }

  return components;
}

function detectScaleBar(gray, width, height, config) {
  const { settings, sbColor, knownNm } = config;
  const startY = Math.floor(height * settings.sbRegionRatio);
  const regionHeight = height - startY;
  const mask = new Uint8Array(width * regionHeight);
  const brightMask = new Uint8Array(width * regionHeight);
  const darkMask = new Uint8Array(width * regionHeight);
  const threshold = (sbColor === "white" ? settings.whiteThr : settings.blackThr) / 255;
  const brightThreshold = settings.whiteThr / 255;
  const darkThreshold = settings.blackThr / 255;

  for (let y = 0; y < regionHeight; y += 1) {
    const sourceOffset = (startY + y) * width;
    const targetOffset = y * width;
    for (let x = 0; x < width; x += 1) {
      const value = gray[sourceOffset + x];
      mask[targetOffset + x] = sbColor === "white" ? value >= threshold : value <= threshold;
      brightMask[targetOffset + x] = value >= brightThreshold;
      darkMask[targetOffset + x] = value <= darkThreshold;
    }
  }

  const panels = connectedComponents(brightMask, width, regionHeight, settings.sbMinArea);
  const darkComponents = connectedComponents(darkMask, width, regionHeight, 1);
  const embeddedBar = scaleBarDetection.chooseEmbeddedScaleBarComponent(panels, darkComponents);
  if (embeddedBar) {
    return {
      nmPerPixel: knownNm / embeddedBar.bboxWidth,
      box: [embeddedBar.minX, embeddedBar.minY + startY, embeddedBar.bboxWidth, embeddedBar.bboxHeight],
    };
  }

  const components = connectedComponents(mask, width, regionHeight, settings.sbMinArea);
  if (components.length === 0) {
    throw new Error("Scale bar not found. Adjust scale bar color or threshold settings.");
  }

  const bar = scaleBarDetection.chooseScaleBarComponent(components);
  if (!bar) {
    throw new Error("Scale bar not found. Adjust scale bar color or threshold settings.");
  }
  if (bar.bboxWidth <= 0) {
    throw new Error("Invalid scale bar width.");
  }

  return {
    nmPerPixel: knownNm / bar.bboxWidth,
    box: [bar.minX, bar.minY + startY, bar.bboxWidth, bar.bboxHeight],
  };
}

function gaussianBlur(values, width, height, sigma) {
  if (sigma <= 0.01) {
    return values;
  }

  const radius = Math.max(1, Math.ceil(sigma * 3));
  const kernel = [];
  let kernelSum = 0;
  for (let i = -radius; i <= radius; i += 1) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(value);
    kernelSum += value;
  }
  for (let i = 0; i < kernel.length; i += 1) {
    kernel[i] /= kernelSum;
  }

  const horizontal = new Float32Array(values.length);
  const output = new Float32Array(values.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let acc = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const xx = Math.min(width - 1, Math.max(0, x + k));
        acc += values[(y * width) + xx] * kernel[k + radius];
      }
      horizontal[(y * width) + x] = acc;
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let acc = 0;
      for (let k = -radius; k <= radius; k += 1) {
        const yy = Math.min(height - 1, Math.max(0, y + k));
        acc += horizontal[(yy * width) + x] * kernel[k + radius];
      }
      output[(y * width) + x] = acc;
    }
  }
  return output;
}

function otsuThreshold(values) {
  const histogram = new Uint32Array(256);
  for (const value of values) {
    histogram[Math.max(0, Math.min(255, Math.round(value * 255)))] += 1;
  }

  const total = values.length;
  let sum = 0;
  for (let i = 0; i < 256; i += 1) {
    sum += i * histogram[i];
  }

  let sumBackground = 0;
  let weightBackground = 0;
  let bestVariance = -1;
  let threshold = 127;

  for (let i = 0; i < 256; i += 1) {
    weightBackground += histogram[i];
    if (weightBackground === 0) {
      continue;
    }
    const weightForeground = total - weightBackground;
    if (weightForeground === 0) {
      break;
    }

    sumBackground += i * histogram[i];
    const meanBackground = sumBackground / weightBackground;
    const meanForeground = (sum - sumBackground) / weightForeground;
    const variance = weightBackground * weightForeground * ((meanBackground - meanForeground) ** 2);
    if (variance > bestVariance) {
      bestVariance = variance;
      threshold = i;
    }
  }

  return threshold / 255;
}

function enhancedRoi(gray, width, height, config, scaleBarBox = null) {
  const roiHeight = scaleBarDetection.scaleBarExclusionTop(
    height,
    scaleBarBox,
    config.settings.cropBottomPx
  );
  if (roiHeight <= 1) {
    throw new Error("Crop bottom is too large for this image.");
  }

  const roi = new Float32Array(width * roiHeight);
  let minValue = 1;
  let maxValue = 0;
  for (let y = 0; y < roiHeight; y += 1) {
    const sourceOffset = y * width;
    const targetOffset = y * width;
    for (let x = 0; x < width; x += 1) {
      const value = gray[sourceOffset + x];
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
      roi[targetOffset + x] = value;
    }
  }

  const range = Math.max(1e-6, maxValue - minValue);
  for (let i = 0; i < roi.length; i += 1) {
    const normalized = (roi[i] - minValue) / range;
    roi[i] = Math.pow(normalized, config.settings.gamma);
  }

  return {
    data: gaussianBlur(roi, width, roiHeight, config.settings.gaussSigma),
    width,
    height: roiHeight,
  };
}

function rotatedBox(component) {
  const halfMajor = Math.max(component.bboxWidth / 2, component.majorAxis / 2);
  const halfMinor = Math.max(component.bboxHeight / 2, component.minorAxis / 2);
  const cos = Math.cos(component.orientation);
  const sin = Math.sin(component.orientation);
  const corners = [
    [-halfMajor, -halfMinor],
    [halfMajor, -halfMinor],
    [halfMajor, halfMinor],
    [-halfMajor, halfMinor],
  ];

  return corners.map(([x, y]) => [
    component.cx + (x * cos) - (y * sin),
    component.cy + (x * sin) + (y * cos),
  ]);
}

function distanceBetweenPoints(left, right) {
  return Math.hypot(left[0] - right[0], left[1] - right[1]);
}

function polygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const next = points[(index + 1) % points.length];
    area += (points[index][0] * next[1]) - (points[index][1] * next[0]);
  }
  return Math.abs(area) / 2;
}

function orderRectangleSeedPoints(points) {
  const center = points.reduce(
    (accumulator, point) => [accumulator[0] + point[0], accumulator[1] + point[1]],
    [0, 0]
  ).map((value) => value / points.length);
  const ordered = [...points].sort(
    (left, right) => Math.atan2(left[1] - center[1], left[0] - center[0])
      - Math.atan2(right[1] - center[1], right[0] - center[0])
  );
  let startIndex = 0;
  let bestValue = Infinity;
  ordered.forEach((point, index) => {
    const value = point[0] + point[1];
    if (value < bestValue) {
      bestValue = value;
      startIndex = index;
    }
  });
  return [...ordered.slice(startIndex), ...ordered.slice(0, startIndex)];
}

function rectangleSeedStats(points, gray, width, height) {
  const ordered = orderRectangleSeedPoints(points);
  const edges = [
    distanceBetweenPoints(ordered[0], ordered[1]),
    distanceBetweenPoints(ordered[1], ordered[2]),
    distanceBetweenPoints(ordered[2], ordered[3]),
    distanceBetweenPoints(ordered[3], ordered[0]),
  ];
  const pairA = (edges[0] + edges[2]) / 2;
  const pairB = (edges[1] + edges[3]) / 2;
  const lengthPx = Math.max(pairA, pairB);
  const widthPx = Math.max(1e-6, Math.min(pairA, pairB));
  const minX = Math.max(0, Math.floor(Math.min(...ordered.map((point) => point[0]))));
  const maxX = Math.min(width - 1, Math.ceil(Math.max(...ordered.map((point) => point[0]))));
  const minY = Math.max(0, Math.floor(Math.min(...ordered.map((point) => point[1]))));
  const maxY = Math.min(height - 1, Math.ceil(Math.max(...ordered.map((point) => point[1]))));
  const pad = 8;
  const bgMinX = Math.max(0, minX - pad);
  const bgMaxX = Math.min(width - 1, maxX + pad);
  const bgMinY = Math.max(0, minY - pad);
  const bgMaxY = Math.min(height - 1, maxY + pad);
  let foregroundSum = 0;
  let foregroundCount = 0;
  let backgroundSum = 0;
  let backgroundCount = 0;

  for (let y = bgMinY; y <= bgMaxY; y += 1) {
    for (let x = bgMinX; x <= bgMaxX; x += 1) {
      const inside = pointInPolygon(x + 0.5, y + 0.5, ordered);
      const value = gray[(y * width) + x];
      if (inside) {
        foregroundSum += value;
        foregroundCount += 1;
      } else {
        backgroundSum += value;
        backgroundCount += 1;
      }
    }
  }

  const foregroundMean = foregroundCount > 0 ? foregroundSum / foregroundCount : 0;
  const backgroundMean = backgroundCount > 0 ? backgroundSum / backgroundCount : foregroundMean;
  return {
    points: ordered,
    lengthPx,
    widthPx,
    aspect: lengthPx / widthPx,
    areaPx: polygonArea(ordered),
    foregroundMean,
    backgroundMean,
    contrast: Math.abs(backgroundMean - foregroundMean),
    darkOnLight: foregroundMean <= backgroundMean,
  };
}

function logSimilarity(value, reference) {
  const ratio = (value + 1e-6) / (reference + 1e-6);
  return Math.exp(-Math.abs(Math.log(ratio)));
}

function rectangleSeedScore(seed, majorPx, minorPx, aspect, area, extent, solidity) {
  const widthTerm = logSimilarity(minorPx, seed.widthPx) * 3.0;
  const areaTerm = logSimilarity(area, seed.areaPx) * 1.2;
  const aspectTerm = logSimilarity(aspect, Math.max(seed.aspect, 1.0)) * 1.1;
  const lengthFlex = Math.max(0, 1 - Math.abs(Math.log((majorPx + 1e-6) / (seed.lengthPx + 1e-6))) / Math.log(4));
  return widthTerm + areaTerm + aspectTerm + (lengthFlex * 0.8) + (extent * 1.4) + (solidity * 0.8);
}

function bboxIou(left, right) {
  const lx1 = left[0];
  const ly1 = left[1];
  const lx2 = left[0] + left[2];
  const ly2 = left[1] + left[3];
  const rx1 = right[0];
  const ry1 = right[1];
  const rx2 = right[0] + right[2];
  const ry2 = right[1] + right[3];
  const ix1 = Math.max(lx1, rx1);
  const iy1 = Math.max(ly1, ry1);
  const ix2 = Math.min(lx2, rx2);
  const iy2 = Math.min(ly2, ry2);
  const intersection = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  const leftArea = Math.max(0, left[2]) * Math.max(0, left[3]);
  const rightArea = Math.max(0, right[2]) * Math.max(0, right[3]);
  return intersection / Math.max(1, leftArea + rightArea - intersection);
}

function dedupeSeedCandidates(candidates) {
  const kept = [];
  [...candidates].sort((left, right) => right.score - left.score).forEach((candidate) => {
    if (kept.every((existing) => bboxIou(candidate.box, existing.box) < 0.35)) {
      kept.push(candidate);
    }
  });
  return kept;
}

function analyzeSpherical(gray, width, height, config, scaleBar) {
  const roi = enhancedRoi(gray, width, height, config, scaleBar.box);
  const threshold = otsuThreshold(roi.data);
  const mask = new Uint8Array(roi.data.length);
  for (let i = 0; i < roi.data.length; i += 1) {
    mask[i] = roi.data[i] <= threshold;
  }

  const components = connectedComponents(mask, roi.width, roi.height, config.spherical.minAreaPx);
  const values = [];
  const circles = [];
  const circleAnnotations = [];
  const boundaryExpandPx = config.settings.boundaryExpandPx || 0;

  components.forEach((component) => {
    const baseDiameterPx = Math.sqrt((4 * component.area) / Math.PI);
    const baseRadiusPx = baseDiameterPx / 2;
    const radiusPx = baseRadiusPx + boundaryExpandPx;
    const diameterPx = radiusPx * 2;
    const diameterNm = diameterPx * scaleBar.nmPerPixel;
    const valid = diameterNm >= config.spherical.minNm
      && diameterNm <= config.spherical.maxNm
      && component.eccentricity <= config.spherical.eccMax
      && component.solidity >= config.spherical.solMin;

    if (valid) {
      const index = values.length;
      values.push(diameterNm);
      circles.push([component.cx, component.cy, radiusPx]);
      circleAnnotations.push({
        id: `dot-${index + 1}`,
        index,
        geometry_type: "circle",
        source: "auto",
        accepted: true,
        cx_px: component.cx,
        cy_px: component.cy,
        auto_cx_px: component.cx,
        auto_cy_px: component.cy,
        radius_px: radiusPx,
        diameter_nm: diameterNm,
        auto_radius_px: baseRadiusPx,
        auto_diameter_nm: baseDiameterPx * scaleBar.nmPerPixel,
        boundary_expand_px: boundaryExpandPx,
        manual_delta_px: 0,
        manual_center_delta_px: [0, 0],
        component_area_px: component.area,
        eccentricity: component.eccentricity,
        solidity: component.solidity,
        bbox_px: [component.minX, component.minY, component.bboxWidth, component.bboxHeight],
      });
    }
  });

  const summary = stats(values);
  return {
    mode: "spherical",
    count: summary.count,
    mean_nm: summary.mean,
    std_nm: summary.std,
    values_nm: values,
    short_mean_nm: null,
    short_std_nm: null,
    short_values_nm: [],
    circles,
    circle_annotations: circleAnnotations,
    boxes: [],
    rotated_boxes: [],
    scale_bar_box: scaleBar.box,
    nm_per_pixel: scaleBar.nmPerPixel,
    error: null,
  };
}

function analyzePlatelet(gray, width, height, config, scaleBar) {
  if (Array.isArray(config.platelet.seedPoints) && config.platelet.seedPoints.length === 4) {
    return analyzePlateletWithRectangleSeed(gray, width, height, config, scaleBar);
  }

  const roi = enhancedRoi(gray, width, height, config, scaleBar.box);
  const threshold = otsuThreshold(roi.data);
  const mask = new Uint8Array(roi.data.length);
  for (let i = 0; i < roi.data.length; i += 1) {
    mask[i] = roi.data[i] <= threshold;
  }

  const components = connectedComponents(mask, roi.width, roi.height, config.platelet.minAreaPx);
  const longValues = [];
  const shortValues = [];
  const boxes = [];
  const rotatedBoxes = [];
  const rectangleAnnotations = [];

  components.forEach((component) => {
    const polygon = rotatedBox(component);
    const geometry = rectangleGeometryFromPolygon(polygon);
    if (!geometry) {
      return;
    }
    const measurement = rectangleMeasurement.canonicalRectangleMeasurement(geometry, scaleBar.nmPerPixel);
    const longNm = measurement.long_axis_nm;
    const shortNm = measurement.short_axis_nm;
    const aspect = measurement.aspect_ratio;
    const valid = longNm >= config.platelet.minLengthNm
      && longNm <= config.platelet.maxLengthNm
      && aspect >= config.platelet.aspectMin
      && component.eccentricity >= config.platelet.eccMin
      && component.extent >= config.platelet.extentMin
      && component.solidity >= config.platelet.solMin;

    if (valid) {
      longValues.push(longNm);
      shortValues.push(shortNm);
      const bbox = [component.minX, component.minY, component.bboxWidth, component.bboxHeight];
      const annotationIndex = rotatedBoxes.length;
      boxes.push(bbox);
      rotatedBoxes.push(polygon);
      rectangleAnnotations.push({
        id: `rect-${annotationIndex + 1}`,
        index: annotationIndex,
        geometry_type: "rotated_rectangle",
        measurement_definition: rectangleMeasurement.MEASUREMENT_DEFINITION,
        source: "auto",
        accepted: true,
        length_nm: longNm,
        width_nm: shortNm,
        long_axis_nm: longNm,
        short_axis_nm: shortNm,
        aspect,
        aspect_ratio: aspect,
        center_px: [component.cx, component.cy],
        polygon_px: polygon,
        bbox_px: bbox,
        ellipse_major_axis_px: component.majorAxis,
        ellipse_minor_axis_px: component.minorAxis,
        component_area_px: component.area,
        extent: component.extent,
        solidity: component.solidity,
        eccentricity: component.eccentricity,
      });
    }
  });

  const longSummary = stats(longValues);
  const shortSummary = stats(shortValues);
  return {
    mode: "platelet",
    count: longSummary.count,
    mean_nm: longSummary.mean,
    std_nm: longSummary.std,
    values_nm: longValues,
    short_mean_nm: shortSummary.mean,
    short_std_nm: shortSummary.std,
    short_values_nm: shortValues,
    circles: [],
    circle_annotations: [],
    boxes,
    rotated_boxes: rotatedBoxes,
    rectangle_annotations: rectangleAnnotations,
    rectangle_seed_points: [],
    detector_method: "connected_components",
    measurement_definition: rectangleMeasurement.MEASUREMENT_DEFINITION,
    scale_bar_box: scaleBar.box,
    nm_per_pixel: scaleBar.nmPerPixel,
    error: null,
  };
}

function analyzePlateletWithRectangleSeed(gray, width, height, config, scaleBar) {
  const roi = enhancedRoi(gray, width, height, config, scaleBar.box);
  const seed = rectangleSeedStats(config.platelet.seedPoints, gray, width, height);
  const threshold = otsuThreshold(roi.data);
  const candidates = [];
  const thresholdOffsets = [-0.06, -0.03, 0, 0.03, 0.06];
  const minArea = Math.max(3, Math.round(seed.areaPx * 0.25));

  thresholdOffsets.forEach((offset) => {
    const level = Math.max(0, Math.min(1, threshold + offset));
    const mask = new Uint8Array(roi.data.length);
    for (let i = 0; i < roi.data.length; i += 1) {
      mask[i] = seed.darkOnLight ? roi.data[i] <= level : roi.data[i] >= level;
    }

    const components = connectedComponents(mask, roi.width, roi.height, minArea);
    components.forEach((component) => {
      const polygon = rotatedBox(component);
      const geometry = rectangleGeometryFromPolygon(polygon);
      if (!geometry) {
        return;
      }
      const majorPx = geometry.length;
      const minorPx = geometry.width;
      const aspect = majorPx / Math.max(minorPx, 1e-6);
      const valid = component.area >= seed.areaPx * 0.25
        && component.area <= seed.areaPx * 5
        && minorPx >= seed.widthPx * 0.45
        && minorPx <= seed.widthPx * 2.4
        && majorPx >= seed.lengthPx * 0.35
        && majorPx <= seed.lengthPx * 4
        && aspect >= Math.max(1.15, seed.aspect * 0.35)
        && component.extent >= Math.max(0.2, config.platelet.extentMin - 0.12)
        && component.solidity >= Math.max(0.25, config.platelet.solMin - 0.1);

      if (!valid) {
        return;
      }

      const score = rectangleSeedScore(
        seed,
        majorPx,
        minorPx,
        aspect,
        component.area,
        component.extent,
        component.solidity
      );
      candidates.push({
        component,
        score,
        majorPx,
        minorPx,
        aspect,
        threshold: level,
        box: [component.minX, component.minY, component.bboxWidth, component.bboxHeight],
        polygon,
      });
    });
  });

  const accepted = dedupeSeedCandidates(candidates);
  const longValues = [];
  const shortValues = [];
  const boxes = [];
  const rotatedBoxes = [];
  const rectangleAnnotations = [];

  accepted.forEach((candidate, index) => {
    const measurement = rectangleMeasurement.canonicalRectangleMeasurement(
      { length: candidate.majorPx, width: candidate.minorPx },
      scaleBar.nmPerPixel
    );
    const longNm = measurement.long_axis_nm;
    const shortNm = measurement.short_axis_nm;
    longValues.push(longNm);
    shortValues.push(shortNm);
    boxes.push(candidate.box);
    const polygon = candidate.polygon;
    rotatedBoxes.push(polygon);
    rectangleAnnotations.push({
      id: `rect-${index + 1}`,
      index,
      geometry_type: "rotated_rectangle",
      measurement_definition: rectangleMeasurement.MEASUREMENT_DEFINITION,
      source: "rectangle_seed_auto",
      accepted: true,
      score: candidate.score,
      threshold: candidate.threshold,
      length_nm: longNm,
      width_nm: shortNm,
      long_axis_nm: longNm,
      short_axis_nm: shortNm,
      aspect: candidate.aspect,
      aspect_ratio: longNm / shortNm,
      center_px: [candidate.component.cx, candidate.component.cy],
      polygon_px: polygon,
      bbox_px: candidate.box,
      component_area_px: candidate.component.area,
      extent: candidate.component.extent,
      solidity: candidate.component.solidity,
      eccentricity: candidate.component.eccentricity,
    });
  });

  const longSummary = stats(longValues);
  const shortSummary = stats(shortValues);
  return {
    mode: "platelet",
    count: longSummary.count,
    mean_nm: longSummary.mean,
    std_nm: longSummary.std,
    values_nm: longValues,
    short_mean_nm: shortSummary.mean,
    short_std_nm: shortSummary.std,
    short_values_nm: shortValues,
    circles: [],
    circle_annotations: [],
    rectangle_annotations: rectangleAnnotations,
    boxes,
    rotated_boxes: rotatedBoxes,
    rectangle_seed_points: seed.points,
    rectangle_seed_summary: {
      length_px: seed.lengthPx,
      width_px: seed.widthPx,
      aspect: seed.aspect,
      contrast: seed.contrast,
      dark_on_light: seed.darkOnLight,
    },
    detector_method: "rectangle_seed",
    measurement_definition: rectangleMeasurement.MEASUREMENT_DEFINITION,
    scale_bar_box: scaleBar.box,
    nm_per_pixel: scaleBar.nmPerPixel,
    error: null,
  };
}

async function analyzeFilesWithPython(files, formData) {
  const startedAt = performance.now();
  const payload = new FormData(form);
  payload.delete("images");
  files.forEach((file) => {
    payload.append("images", file);
  });

  const response = await fetch(apiPath("/api/analyze"), {
    method: "POST",
    body: payload,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Python analysis failed (${response.status})`);
  }

  const results = (body.results || []).map((row, index) => ({
    ...row,
    duration_ms: null,
    image_metadata: {
      name: files[index]?.name || row.name || null,
      type: files[index]?.type || "application/octet-stream",
      size_bytes: files[index]?.size || null,
      last_modified: files[index]?.lastModified || null,
      width_px: null,
      height_px: null,
    },
    analysis_config: buildLocalConfig(formData),
  }));

  return {
    ...body,
    result_id: body.result_id || `python-${Date.now()}`,
    duration_ms: performance.now() - startedAt,
    results,
  };
}

function openVerifiedDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tem_verified_samples", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("samples")) {
        const store = db.createObjectStore("samples", { keyPath: "sample_id" });
        store.createIndex("created_at", "created_at");
        store.createIndex("image_sha256", "image.sha256");
        store.createIndex("mode", "analysis.mode");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putVerifiedSample(sample) {
  const db = await openVerifiedDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("samples", "readwrite");
    transaction.objectStore("samples").put(sample);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function countVerifiedSamples() {
  const db = await openVerifiedDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("samples", "readonly");
    const request = transaction.objectStore("samples").count();
    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function fileSha256(file) {
  if (!window.crypto?.subtle) {
    return null;
  }
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function verifiedAnnotationsForRow(row) {
  const excluded = rowExcludedSet(row);
  return (row.circle_annotations || []).map((annotation, index) => ({
    annotation_id: annotation.id || `dot-${index + 1}`,
    annotation_kind: "circle_fit",
    target_class: "dot",
    accepted: !excluded.has(index),
    source: annotation.source || "auto",
    geometry_px: {
      cx: annotation.cx_px,
      cy: annotation.cy_px,
      radius: annotation.radius_px,
      diameter: annotation.radius_px * 2,
    },
    measurement_nm: {
      diameter: annotation.diameter_nm,
      radius: annotation.diameter_nm / 2,
    },
    auto_geometry_px: {
      cx: annotation.auto_cx_px ?? annotation.cx_px,
      cy: annotation.auto_cy_px ?? annotation.cy_px,
      radius: annotation.auto_radius_px,
      diameter: annotation.auto_radius_px * 2,
    },
    correction: {
      boundary_expand_px: annotation.boundary_expand_px || 0,
      manual_radius_delta_px: annotation.manual_delta_px || 0,
      manual_center_delta_px: annotation.manual_center_delta_px || [0, 0],
    },
    component_features: {
      area_px: annotation.component_area_px,
      eccentricity: annotation.eccentricity,
      solidity: annotation.solidity,
      bbox_px: annotation.bbox_px,
    },
  }));
}

async function buildVerifiedSample(row, file) {
  const createdAt = new Date().toISOString();
  const sha256 = await fileSha256(file);
  const sampleId = `tem-dot-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

  return {
    schema_version: "tem_verified_sample.v1",
    sample_id: sampleId,
    created_at: createdAt,
    app: {
      name: "NC-TEM analyzer",
      version: "local-web-v1",
      storage: "indexeddb",
    },
    image: {
      name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      last_modified: file.lastModified || null,
      width_px: row.image_metadata?.width_px || null,
      height_px: row.image_metadata?.height_px || null,
      sha256,
      blob: file,
    },
    calibration: {
      known_scale_nm: row.analysis_config?.knownNm || null,
      nm_per_pixel: row.nm_per_pixel || null,
      scale_bar_box_px: row.scale_bar_box || null,
      scale_bar_color: row.analysis_config?.sbColor || null,
    },
    analysis: {
      mode: row.mode,
      target_shape: "spherical_dot",
      parameters: row.analysis_config || null,
      duration_ms: row.duration_ms || null,
    },
    labels: {
      label_type: "circle_annotations",
      coordinate_space: "image_pixels",
      measurement_unit: "nm",
      annotations: verifiedAnnotationsForRow(row),
    },
    summary: {
      accepted_count: row.count,
      excluded_count: getExcludedCount(row),
      mean_nm: row.mean_nm,
      std_nm: row.std_nm,
    },
    training_notes: {
      verification_state: "verified_by_user",
      intended_use: "future_dot_segmentation_or_radius_regression",
      split: null,
      comments: "",
    },
  };
}

async function refreshVerifiedSampleCount() {
  try {
    state.verifiedSampleCount = await countVerifiedSamples();
  } catch {
    state.verifiedSampleCount = 0;
  }
  updateDotControls();
}

function apiPath(path) {
  if (!apiBaseUrl || apiBaseUrl === "null") {
    return path;
  }
  return `${apiBaseUrl}${path}`;
}

function openFftDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("tem_fft_sessions", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("fft_results")) {
        const store = db.createObjectStore("fft_results", { keyPath: "fft_result_id" });
        store.createIndex("created_at", "created_at");
        store.createIndex("image_sha256", "image.image_sha256");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function putFftSample(sample) {
  const db = await openFftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("fft_results", "readwrite");
    transaction.objectStore("fft_results").put(sample);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

async function getFftSamples() {
  const db = await openFftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("fft_results", "readonly");
    const request = transaction.objectStore("fft_results").getAll();
    request.onsuccess = () => {
      db.close();
      resolve(Array.isArray(request.result) ? request.result : []);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function countFftSamples() {
  const db = await openFftDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("fft_results", "readonly");
    const request = transaction.objectStore("fft_results").count();
    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function refreshFftSavedCount() {
  try {
    state.fft.savedCount = await countFftSamples();
  } catch {
    state.fft.savedCount = 0;
  }
  updateFftControls();
}

function resetFftWorkspace({ keepSavedCount = true } = {}) {
  state.fft.roi = null;
  state.fft.draftRoi = null;
  state.fft.captureActive = false;
  state.fft.dragStart = null;
  state.fft.result = null;
  state.fft.manualPeaks = [];
  state.fft.profilePeaks = [];
  resetFftProfileViews();
  state.fft.suppressNextClick = false;
  if (!keepSavedCount) {
    state.fft.savedCount = 0;
  }
  drawFftCanvas();
  drawInverseFftCanvas();
  drawFftFrequencyProfileCanvas();
  drawFftProfileCanvas();
  updateFftControls();
}

function currentFftRoi() {
  return state.fft.draftRoi || state.fft.roi;
}

function normalizedRoiFromPoints(start, end) {
  const left = Math.max(0, Math.min(start.x, end.x));
  const top = Math.max(0, Math.min(start.y, end.y));
  const right = Math.min(previewCanvas.width, Math.max(start.x, end.x));
  const bottom = Math.min(previewCanvas.height, Math.max(start.y, end.y));
  return {
    x: Math.round(left),
    y: Math.round(top),
    width: Math.round(Math.max(0, right - left)),
    height: Math.round(Math.max(0, bottom - top)),
  };
}

function drawFftRoiOverlay(context, imageWidth) {
  const roi = currentFftRoi();
  if (!roi || roi.width <= 0 || roi.height <= 0) {
    return;
  }

  const lineWidth = Math.max(2, Math.round(imageWidth / 460));
  context.save();
  context.lineWidth = lineWidth;
  context.setLineDash(state.fft.captureActive ? [lineWidth * 4, lineWidth * 2] : []);
  context.strokeStyle = "rgba(43, 142, 255, 0.98)";
  context.fillStyle = "rgba(43, 142, 255, 0.12)";
  context.fillRect(roi.x, roi.y, roi.width, roi.height);
  context.strokeRect(roi.x, roi.y, roi.width, roi.height);
  context.setLineDash([]);
  context.fillStyle = "rgba(8, 16, 32, 0.88)";
  context.fillRect(roi.x, Math.max(0, roi.y - 24), 72, 22);
  context.fillStyle = "rgba(222, 239, 255, 0.98)";
  context.font = `${Math.max(11, lineWidth * 4)}px Manrope, sans-serif`;
  context.fillText("FFT ROI", roi.x + 8, Math.max(16, roi.y - 8));
  context.restore();
}

function fftCanvasCoordinates(event) {
  if (!fftCanvas) {
    return null;
  }
  const rect = fftCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }
  return {
    x: (event.clientX - rect.left) * (fftCanvas.width / rect.width),
    y: (event.clientY - rect.top) * (fftCanvas.height / rect.height),
  };
}

function nearestFftPeak(point, maxDistance = 12) {
  const peaks = state.fft.result?.candidate_peaks || [];
  let best = null;
  peaks.forEach((peak) => {
    const distance = Math.hypot(point.x - peak.x, point.y - peak.y);
    if (!best || distance < best.distance) {
      best = { peak, distance };
    }
  });
  return best && best.distance <= maxDistance ? best.peak : null;
}

function nearestFftPeakIntensity(point) {
  return nearestFftPeak(point)?.intensity || 1;
}

function syncFftDisplayControls() {
  const display = state.fft.display;
  display.min = Math.max(0, Math.min(254, Number(display.min) || 0));
  display.max = Math.max(1, Math.min(255, Number(display.max) || 255));
  if (display.max <= display.min) {
    display.max = Math.min(255, display.min + 1);
  }
  display.brightness = Math.max(-100, Math.min(100, Number(display.brightness) || 0));
  display.contrast = Math.max(20, Math.min(300, Number(display.contrast) || 100));

  if (fftDisplayMin) fftDisplayMin.value = String(display.min);
  if (fftDisplayMax) fftDisplayMax.value = String(display.max);
  if (fftDisplayBrightness) fftDisplayBrightness.value = String(display.brightness);
  if (fftDisplayContrast) fftDisplayContrast.value = String(display.contrast);
  if (fftDisplayMinValue) fftDisplayMinValue.textContent = String(display.min);
  if (fftDisplayMaxValue) fftDisplayMaxValue.textContent = String(display.max);
  if (fftDisplayBrightnessValue) fftDisplayBrightnessValue.textContent = String(display.brightness);
  if (fftDisplayContrastValue) fftDisplayContrastValue.textContent = `${display.contrast}%`;
  if (fftOverlayToggle) fftOverlayToggle.checked = Boolean(state.fft.showOverlay);
  syncIfftControls();
}

function currentIfftSettings() {
  const radius = Math.max(3, Math.min(30, Math.round(Number(ifftMaskRadius?.value || 12))));
  const mode = ["pair_plus_dc", "pair_only"].includes(ifftMode?.value)
    ? ifftMode.value
    : "pair_plus_dc";
  return { radius, mode };
}

function syncIfftControls() {
  const { radius, mode } = currentIfftSettings();
  if (ifftMaskRadius) {
    ifftMaskRadius.value = String(radius);
  }
  if (ifftMaskRadiusValue) {
    ifftMaskRadiusValue.textContent = `${radius} px`;
  }
  if (ifftMode && ifftMode.value !== mode) {
    ifftMode.value = mode;
  }
  return { radius, mode };
}

function selectedPeakPairForIfft() {
  const result = state.fft.result;
  const pair = state.fft.manualPeaks.length === 2
    ? state.fft.manualPeaks
    : result?.manual_peak_pair_px || result?.selected_peak_pair || result?.auto_peak_pair_px;
  if (!Array.isArray(pair) || pair.length !== 2) {
    return null;
  }
  return cloneFlatArray(pair);
}

function ifftPairSource() {
  const manualResultPair = state.fft.result?.manual_peak_pair_px;
  if (state.fft.manualPeaks.length === 2 || (Array.isArray(manualResultPair) && manualResultPair.length === 2)) {
    return "manual_peak_pair";
  }
  return "auto_peak_pair";
}

function setFftDisplayFromControls() {
  state.fft.display.min = Number(fftDisplayMin?.value || 0);
  state.fft.display.max = Number(fftDisplayMax?.value || 255);
  state.fft.display.brightness = Number(fftDisplayBrightness?.value || 0);
  state.fft.display.contrast = Number(fftDisplayContrast?.value || 100);
  syncFftDisplayControls();
}

function resetFftDisplay() {
  state.fft.display = {
    min: 0,
    max: 255,
    brightness: 0,
    contrast: 100,
  };
  syncFftDisplayControls();
}

function applyFftDisplayWindow(context, width, height) {
  const display = state.fft.display;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const range = Math.max(1, display.max - display.min);
  const contrast = display.contrast / 100;
  const brightness = display.brightness;

  for (let i = 0; i < data.length; i += 4) {
    let value = ((data[i] - display.min) / range) * 255;
    value = ((value - 128) * contrast) + 128 + brightness;
    const pixel = Math.max(0, Math.min(255, Math.round(value)));
    data[i] = pixel;
    data[i + 1] = pixel;
    data[i + 2] = pixel;
  }
  context.putImageData(imageData, 0, 0);
}

async function autoFftDisplayRange() {
  const result = state.fft.result;
  if (!result?.fft_image || !fftCanvas) {
    resetFftDisplay();
    return;
  }
  const image = await loadImageFromUrl(result.fft_image);
  const scratch = document.createElement("canvas");
  scratch.width = image.naturalWidth;
  scratch.height = image.naturalHeight;
  const context = scratch.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, scratch.width, scratch.height).data;
  const values = [];
  for (let i = 0; i < data.length; i += 4) {
    values.push(data[i]);
  }
  values.sort((left, right) => left - right);
  const at = (ratio) => values[Math.max(0, Math.min(values.length - 1, Math.floor(values.length * ratio)))] || 0;
  state.fft.display.min = Math.max(0, Math.min(250, at(0.02)));
  state.fft.display.max = Math.max(state.fft.display.min + 1, Math.min(255, at(0.995)));
  state.fft.display.brightness = 0;
  state.fft.display.contrast = 140;
  syncFftDisplayControls();
  await drawFftCanvas();
}

async function drawFftCanvas() {
  if (!fftCanvas) {
    return;
  }

  const context = fftCanvas.getContext("2d");
  const result = state.fft.result;
  if (!result?.fft_image) {
    fftCanvas.width = 320;
    fftCanvas.height = 220;
    context.fillStyle = "#071225";
    context.fillRect(0, 0, fftCanvas.width, fftCanvas.height);
    context.fillStyle = "rgba(225, 236, 255, 0.78)";
    context.font = "600 13px Manrope, sans-serif";
    context.textAlign = "center";
    context.fillText("FFT result preview", fftCanvas.width / 2, fftCanvas.height / 2);
    return;
  }

  const image = await loadImageFromUrl(result.fft_image);
  fftCanvas.width = image.naturalWidth;
  fftCanvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);
  applyFftDisplayWindow(context, fftCanvas.width, fftCanvas.height);
  if (!state.fft.showOverlay) {
    return;
  }

  const center = result.fft_center_px || {
    x: fftCanvas.width / 2,
    y: fftCanvas.height / 2,
  };
  context.save();
  context.strokeStyle = "rgba(255, 255, 255, 0.42)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(center.x - 10, center.y);
  context.lineTo(center.x + 10, center.y);
  context.moveTo(center.x, center.y - 10);
  context.lineTo(center.x, center.y + 10);
  context.stroke();

  (result.candidate_peaks || []).slice(0, 16).forEach((peak) => {
    context.strokeStyle = "rgba(255, 255, 255, 0.92)";
    context.fillStyle = "rgba(255, 255, 255, 0.26)";
    context.lineWidth = 1.4;
    context.beginPath();
    context.arc(peak.x, peak.y, 4, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });

  const pair = state.fft.manualPeaks.length === 2
    ? state.fft.manualPeaks
    : (result.selected_peak_pair || result.auto_peak_pair_px || []);
  if (Array.isArray(pair) && pair.length === 2) {
    context.strokeStyle = state.fft.manualPeaks.length === 2
      ? "rgba(77, 225, 166, 0.98)"
      : "rgba(64, 151, 255, 0.98)";
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 2.4;
    context.beginPath();
    context.moveTo(pair[0].x, pair[0].y);
    context.lineTo(pair[1].x, pair[1].y);
    context.stroke();
    const maskRadius = currentIfftSettings().radius;
    pair.forEach((peak) => {
      context.beginPath();
      context.arc(peak.x, peak.y, 6, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "rgba(255, 255, 255, 0.95)";
      context.stroke();
      if (Number.isFinite(maskRadius) && maskRadius > 0) {
        context.strokeStyle = "rgba(255, 210, 80, 0.78)";
        context.setLineDash([4, 3]);
        context.beginPath();
        context.arc(peak.x, peak.y, maskRadius, 0, Math.PI * 2);
        context.stroke();
        context.setLineDash([]);
      }
    });
  }
  context.restore();
}

async function drawInverseFftCanvas() {
  if (!inverseFftCanvas) {
    return;
  }

  const context = inverseFftCanvas.getContext("2d");
  const result = state.fft.result;
  if (!result?.inverse_fft_image) {
    inverseFftCanvas.width = 320;
    inverseFftCanvas.height = 220;
    context.fillStyle = "#05080d";
    context.fillRect(0, 0, inverseFftCanvas.width, inverseFftCanvas.height);
    context.fillStyle = "rgba(240, 244, 250, 0.78)";
    context.font = "600 13px Manrope, sans-serif";
    context.textAlign = "center";
    context.fillText("Inverse FFT preview", inverseFftCanvas.width / 2, inverseFftCanvas.height / 2);
    return;
  }

  let image;
  try {
    image = await loadImageFromUrl(result.inverse_fft_image);
  } catch {
    inverseFftCanvas.width = 320;
    inverseFftCanvas.height = 220;
    context.fillStyle = "#05080d";
    context.fillRect(0, 0, inverseFftCanvas.width, inverseFftCanvas.height);
    context.fillStyle = "rgba(240, 244, 250, 0.78)";
    context.font = "600 13px Manrope, sans-serif";
    context.textAlign = "center";
    context.fillText("Inverse FFT image could not be rendered", inverseFftCanvas.width / 2, inverseFftCanvas.height / 2);
    return;
  }
  inverseFftCanvas.width = image.naturalWidth;
  inverseFftCanvas.height = image.naturalHeight;
  context.drawImage(image, 0, 0);

  const axis = (result.inverse_intensity_profile || result.intensity_profile)?.axis_unit_vector_px;
  const ux = Number(axis?.x);
  const uy = Number(axis?.y);
  if (Number.isFinite(ux) && Number.isFinite(uy)) {
    const length = Math.min(inverseFftCanvas.width, inverseFftCanvas.height) * 0.62;
    const cx = inverseFftCanvas.width / 2;
    const cy = inverseFftCanvas.height / 2;
    context.save();
    context.lineWidth = Math.max(2, Math.round(Math.min(inverseFftCanvas.width, inverseFftCanvas.height) / 150));
    context.strokeStyle = "rgba(255, 255, 255, 0.96)";
    context.beginPath();
    context.moveTo(cx - ux * length / 2, cy - uy * length / 2);
    context.lineTo(cx + ux * length / 2, cy + uy * length / 2);
    context.stroke();
    context.strokeStyle = "rgba(245, 210, 64, 0.96)";
    context.lineWidth = Math.max(1, context.lineWidth - 1);
    context.beginPath();
    context.moveTo(cx, cy);
    context.lineTo(cx + ux * length / 2, cy + uy * length / 2);
    context.stroke();
    context.restore();
  }
}

function profileCanvasCoordinates(canvas, event) {
  if (!canvas) {
    return null;
  }
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function fftProfileCanvasCoordinates(event) {
  return profileCanvasCoordinates(fftProfileCanvas, event);
}

function profilePlotGeometry(canvas) {
  return {
    left: 58,
    right: canvas.width - 18,
    top: 18,
    bottom: canvas.height - 34,
  };
}

function defaultProfileView() {
  return { xMin: null, xMax: null, yMin: null, yMax: null };
}

function resetFftProfileViews() {
  state.fft.profileViews = {
    frequency: defaultProfileView(),
    inverse: defaultProfileView(),
  };
  state.fft.profileAxisDrag = {
    active: false,
    kind: null,
    mode: null,
    pointerId: null,
    startPoint: null,
    startView: null,
    moved: false,
  };
}

function profileForViewKind(kind) {
  if (kind === "frequency") {
    return state.fft.result?.fft_line_profile || null;
  }
  return state.fft.result?.inverse_intensity_profile || state.fft.result?.intensity_profile || null;
}

function profileCanvasForKind(kind) {
  return kind === "frequency" ? fftFrequencyProfileCanvas : fftProfileCanvas;
}

function profileValuesForKind(kind, profile) {
  return {
    xValues: kind === "frequency"
      ? (profile?.signed_frequency_1_per_nm || [])
      : (profile?.distance_nm || []),
    yValues: profile?.intensity || [],
  };
}

function finiteProfileValues(values) {
  return (values || []).map(Number).filter(Number.isFinite);
}

function profileDataBounds(xValues, yValues) {
  const finiteX = finiteProfileValues(xValues);
  const finiteY = finiteProfileValues(yValues);
  if (finiteX.length < 2 || finiteY.length < 2) {
    return null;
  }
  let minX = Math.min(...finiteX);
  let maxX = Math.max(...finiteX);
  let minY = Math.min(0, Math.min(...finiteY));
  const peakMaxY = Math.max(...finiteY);
  let maxY = peakMaxY > 0 ? peakMaxY * 1.5 : 1;
  if (maxX <= minX) {
    const delta = Math.max(1e-6, Math.abs(minX) * 0.01);
    minX -= delta;
    maxX += delta;
  }
  if (maxY <= minY) {
    maxY = minY + 1;
  }
  return { minX, maxX, minY, maxY };
}

function clampProfileRange(minValue, maxValue, fullMin, fullMax) {
  const fullSpan = Math.max(1e-9, fullMax - fullMin);
  let span = Math.max(1e-9, Number(maxValue) - Number(minValue));
  span = Math.max(fullSpan / 500, Math.min(fullSpan, span));
  let min = Number(minValue);
  let max = Number(maxValue);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    min = fullMin;
    max = fullMax;
    span = fullSpan;
  } else {
    const center = (min + max) / 2;
    min = center - span / 2;
    max = center + span / 2;
  }
  if (min < fullMin) {
    min = fullMin;
    max = fullMin + span;
  }
  if (max > fullMax) {
    max = fullMax;
    min = fullMax - span;
  }
  return { min, max };
}

function resolveProfileView(kind, bounds) {
  const view = state.fft.profileViews?.[kind] || defaultProfileView();
  const requestedX = Number.isFinite(Number(view.xMin)) && Number.isFinite(Number(view.xMax)) && Number(view.xMax) > Number(view.xMin)
    ? { min: Number(view.xMin), max: Number(view.xMax) }
    : { min: bounds.minX, max: bounds.maxX };
  const requestedY = Number.isFinite(Number(view.yMin)) && Number.isFinite(Number(view.yMax)) && Number(view.yMax) > Number(view.yMin)
    ? { min: Number(view.yMin), max: Number(view.yMax) }
    : { min: bounds.minY, max: bounds.maxY };
  const xRange = clampProfileRange(requestedX.min, requestedX.max, bounds.minX, bounds.maxX);
  const yRange = clampProfileRange(requestedY.min, requestedY.max, bounds.minY, bounds.maxY);
  return {
    xMin: xRange.min,
    xMax: xRange.max,
    yMin: yRange.min,
    yMax: yRange.max,
  };
}

function setProfileView(kind, range, bounds) {
  if (!state.fft.profileViews) {
    state.fft.profileViews = {
      frequency: defaultProfileView(),
      inverse: defaultProfileView(),
    };
  }
  const xRange = clampProfileRange(range.xMin, range.xMax, bounds.minX, bounds.maxX);
  const yRange = clampProfileRange(range.yMin, range.yMax, bounds.minY, bounds.maxY);
  state.fft.profileViews[kind] = {
    xMin: xRange.min,
    xMax: xRange.max,
    yMin: yRange.min,
    yMax: yRange.max,
  };
}

function profilePlotScale(canvas, profile, { viewKind = "inverse", xValues = null, yValues = null } = {}) {
  const distance = (xValues || profile?.distance_nm || []).map(Number);
  const intensity = (yValues || profile?.intensity || []).map(Number);
  if (!canvas || distance.length < 2 || intensity.length < 2) {
    return null;
  }
  const geom = profilePlotGeometry(canvas);
  const bounds = profileDataBounds(distance, intensity);
  if (!bounds) {
    return null;
  }
  const view = resolveProfileView(viewKind, bounds);
  const xFor = (value) => geom.left + ((value - view.xMin) / Math.max(1e-9, view.xMax - view.xMin)) * (geom.right - geom.left);
  const yFor = (value) => geom.bottom - ((value - view.yMin) / Math.max(1e-9, view.yMax - view.yMin)) * (geom.bottom - geom.top);
  return {
    distance,
    intensity,
    geom,
    minDistance: view.xMin,
    maxDistance: view.xMax,
    minIntensity: view.yMin,
    maxIntensity: view.yMax,
    bounds,
    xFor,
    yFor,
  };
}

function profilePointZone(point, scale) {
  if (!point || !scale) {
    return null;
  }
  const { geom } = scale;
  const inX = point.x >= geom.left && point.x <= geom.right;
  const inY = point.y >= geom.top && point.y <= geom.bottom;
  if (inX && inY) {
    return "xy";
  }
  if (inX && point.y > geom.bottom && point.y <= geom.bottom + 30) {
    return "x";
  }
  if (point.x >= 0 && point.x < geom.left && inY) {
    return "y";
  }
  return null;
}

function drawProfilePlotClip(context, geom, draw) {
  context.save();
  context.beginPath();
  context.rect(geom.left, geom.top, geom.right - geom.left, geom.bottom - geom.top);
  context.clip();
  draw();
  context.restore();
}

function formatProfileTick(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "-";
  }
  const absolute = Math.abs(numeric);
  if (absolute > 0 && absolute < 0.01) {
    return numeric.toExponential(1);
  }
  if (absolute < 10) {
    return numeric.toFixed(2);
  }
  return numeric.toFixed(1);
}

function drawProfileAxisTicks(context, canvas, scale) {
  const { geom, minDistance, maxDistance, minIntensity, maxIntensity, xFor, yFor } = scale;
  context.save();
  context.fillStyle = "rgba(84, 98, 124, 0.86)";
  context.font = "700 10px Manrope, sans-serif";
  context.textBaseline = "middle";
  context.textAlign = "right";
  [minIntensity, (minIntensity + maxIntensity) / 2, maxIntensity].forEach((value) => {
    const y = yFor(value);
    context.fillText(formatProfileTick(value), geom.left - 6, y);
  });
  context.textBaseline = "top";
  context.textAlign = "center";
  [minDistance, (minDistance + maxDistance) / 2, maxDistance].forEach((value) => {
    const x = xFor(value);
    context.fillText(formatProfileTick(value), x, geom.bottom + 6);
  });
  context.restore();
}

function drawProfileAxes(context, canvas, scale) {
  const { geom } = scale;
  context.strokeStyle = "rgba(112, 126, 152, 0.22)";
  context.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = geom.top + ((geom.bottom - geom.top) * i / 4);
    context.beginPath();
    context.moveTo(geom.left, y);
    context.lineTo(geom.right, y);
    context.stroke();
  }
  context.strokeStyle = "rgba(112, 126, 152, 0.14)";
  for (let i = 0; i <= 4; i += 1) {
    const x = geom.left + ((geom.right - geom.left) * i / 4);
    context.beginPath();
    context.moveTo(x, geom.top);
    context.lineTo(x, geom.bottom);
    context.stroke();
  }
  context.strokeStyle = "rgba(84, 98, 124, 0.72)";
  context.beginPath();
  context.moveTo(geom.left, geom.top);
  context.lineTo(geom.left, geom.bottom);
  context.lineTo(geom.right, geom.bottom);
  context.stroke();
  drawProfileAxisTicks(context, canvas, scale);
}

function normalizedProfilePeak(peak) {
  if (!peak) {
    return null;
  }
  const distance = Number(peak.distance_nm);
  const intensity = Number(peak.intensity);
  if (!Number.isFinite(distance)) {
    return null;
  }
  return {
    ...peak,
    distance_nm: distance,
    intensity: Number.isFinite(intensity) ? intensity : 0,
  };
}

function sortedProfilePeakPair(peaks) {
  if (!Array.isArray(peaks) || peaks.length !== 2) {
    return null;
  }
  const pair = peaks.map(normalizedProfilePeak);
  if (!pair.every(Boolean)) {
    return null;
  }
  return pair.sort((a, b) => Number(a.distance_nm) - Number(b.distance_nm));
}

function profileManualPeakPair() {
  return sortedProfilePeakPair(state.fft.profilePeaks)
    || sortedProfilePeakPair(state.fft.result?.manual_profile_peak_pair);
}

function profileAutoSpanPeakPair(profile) {
  const span = profile?.span_measurement;
  if (!span?.start_peak || !span?.end_peak) {
    return null;
  }
  return sortedProfilePeakPair([span.start_peak, span.end_peak]);
}

function profileDisplayPeakPair(profile) {
  return profileManualPeakPair() || profileAutoSpanPeakPair(profile);
}

function profilePeakCanvasPoint(peak, scale) {
  const normalized = normalizedProfilePeak(peak);
  if (!normalized || !scale) {
    return null;
  }
  return {
    peak: normalized,
    x: scale.xFor(Number(normalized.distance_nm)),
    y: scale.yFor(Number(normalized.intensity)),
  };
}

function nearestProfileDetectedPeak(point, profile, scale, maxDistance = 18) {
  let best = null;
  (profile?.peaks || []).forEach((peak) => {
    const canvasPoint = profilePeakCanvasPoint(peak, scale);
    if (!canvasPoint) {
      return;
    }
    const distance = Math.hypot(point.x - canvasPoint.x, point.y - canvasPoint.y);
    if (!best || distance < best.distance) {
      best = { peak: canvasPoint.peak, distance };
    }
  });
  return best && best.distance <= maxDistance ? best.peak : null;
}

function profilePointFromCanvas(point, profile, { snapToPeak = false } = {}) {
  const scale = profilePlotScale(fftProfileCanvas, profile);
  if (!scale) {
    return null;
  }
  if (snapToPeak) {
    const peak = nearestProfileDetectedPeak(point, profile, scale);
    if (peak) {
      return peak;
    }
  }
  const { distance, intensity, geom, minDistance, maxDistance } = scale;
  const ratio = Math.max(0, Math.min(1, (point.x - geom.left) / Math.max(1, geom.right - geom.left)));
  const targetDistance = minDistance + ratio * (maxDistance - minDistance);
  let bestIndex = 0;
  let bestDelta = Infinity;
  distance.forEach((value, index) => {
    const delta = Math.abs(Number(value) - targetDistance);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = index;
    }
  });
  return {
    index: bestIndex,
    distance_nm: Number(distance[bestIndex]),
    intensity: Number(intensity[bestIndex] || 0),
  };
}

function profileSpanHandleAtPoint(point, profile, maxDistance = 14) {
  const scale = profilePlotScale(fftProfileCanvas, profile);
  const pair = profileDisplayPeakPair(profile);
  if (!scale || !pair) {
    return -1;
  }
  let bestIndex = -1;
  let bestDistance = Infinity;
  pair.forEach((peak, index) => {
    const canvasPoint = profilePeakCanvasPoint(peak, scale);
    if (!canvasPoint) {
      return;
    }
    const distance = Math.hypot(point.x - canvasPoint.x, point.y - canvasPoint.y);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestDistance <= maxDistance ? bestIndex : -1;
}

function setProfileSpanHandle(handleIndex, peak) {
  const profile = state.fft.result?.inverse_intensity_profile || state.fft.result?.intensity_profile;
  const currentPair = profileDisplayPeakPair(profile);
  const nextPeak = normalizedProfilePeak(peak);
  if (!currentPair || !nextPeak || handleIndex < 0) {
    return false;
  }
  const nextPair = currentPair.map((item) => ({ ...item }));
  nextPair[Math.min(handleIndex, 1)] = nextPeak;
  state.fft.profilePeaks = sortedProfilePeakPair(nextPair) || nextPair;
  return true;
}

async function applyManualProfilePeaks() {
  const peaks = state.fft.profilePeaks;
  if (!state.fft.result || peaks.length !== 2) {
    return;
  }
  const response = await fetch(apiPath("/api/fft/profile-peaks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      peaks,
      expected_spacing_nm: state.fft.result?.fft_line_profile?.selected_d_spacing_nm || state.fft.result?.d_spacing_nm || null,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Profile peak request failed (${response.status})`);
  }
  state.fft.result = {
    ...state.fft.result,
    manual_profile_peak_pair: payload.manual_profile_peak_pair,
    profile_span_nm: payload.profile_span_nm,
    profile_interval_count: payload.profile_interval_count,
    d_spacing_nm: payload.d_spacing_nm,
    measurement_source: payload.measurement_source,
  };
  state.fft.profilePeaks = sortedProfilePeakPair(payload.manual_profile_peak_pair) || [];
}

function drawFftFrequencyProfileCanvas() {
  if (!fftFrequencyProfileCanvas) {
    return;
  }
  const context = fftFrequencyProfileCanvas.getContext("2d");
  const profile = state.fft.result?.fft_line_profile;
  fftFrequencyProfileCanvas.width = 560;
  fftFrequencyProfileCanvas.height = 260;

  context.fillStyle = "#fbfcff";
  context.fillRect(0, 0, fftFrequencyProfileCanvas.width, fftFrequencyProfileCanvas.height);

  if (!profile?.signed_frequency_1_per_nm?.length || !profile?.intensity?.length) {
    context.fillStyle = "rgba(38, 49, 72, 0.84)";
    context.font = "700 13px Manrope, sans-serif";
    context.textAlign = "center";
    context.fillText("Run FFT to generate the FFT frequency profile", fftFrequencyProfileCanvas.width / 2, fftFrequencyProfileCanvas.height / 2);
    return;
  }

  const xValues = profile.signed_frequency_1_per_nm.map(Number);
  const intensity = profile.intensity.map(Number);

  const scale = profilePlotScale(fftFrequencyProfileCanvas, profile, {
    viewKind: "frequency",
    xValues,
    yValues: intensity,
  });
  if (!scale) {
    return;
  }
  const { xFor, yFor, geom } = scale;
  drawProfileAxes(context, fftFrequencyProfileCanvas, scale);

  drawProfilePlotClip(context, geom, () => {
    const zeroX = xFor(0);
    context.strokeStyle = "rgba(120, 132, 156, 0.36)";
    context.setLineDash([4, 4]);
    context.beginPath();
    context.moveTo(zeroX, geom.top);
    context.lineTo(zeroX, geom.bottom);
    context.stroke();
    context.setLineDash([]);

    context.strokeStyle = "rgba(78, 91, 112, 0.95)";
    context.lineWidth = 2;
    context.beginPath();
    intensity.forEach((value, index) => {
      const x = xFor(xValues[index]);
      const y = yFor(value);
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();

    (profile.peaks || []).forEach((peak) => {
      const x = xFor(Number(peak.signed_frequency_1_per_nm));
      const y = yFor(Number(peak.intensity));
      context.strokeStyle = "rgba(54, 112, 255, 0.72)";
      context.fillStyle = "rgba(54, 112, 255, 0.20)";
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });

    const selectedFrequency = Number(profile.selected_frequency_1_per_nm);
    if (Number.isFinite(selectedFrequency) && selectedFrequency > 0) {
      [-selectedFrequency, selectedFrequency].forEach((frequency) => {
        const x = xFor(frequency);
        context.strokeStyle = "rgba(20, 170, 111, 0.95)";
        context.setLineDash([5, 4]);
        context.beginPath();
        context.moveTo(x, geom.top);
        context.lineTo(x, geom.bottom);
        context.stroke();
        context.setLineDash([]);
      });
    }
  });

  context.fillStyle = "rgba(84, 98, 124, 0.95)";
  context.font = "700 11px Manrope, sans-serif";
  context.textAlign = "center";
  context.fillText("Spatial frequency (1/nm)", (geom.left + geom.right) / 2, fftFrequencyProfileCanvas.height - 8);
  context.save();
  context.translate(14, (geom.top + geom.bottom) / 2);
  context.rotate(-Math.PI / 2);
  context.fillText("FFT intensity", 0, 0);
  context.restore();

  if (Number.isFinite(Number(profile.selected_d_spacing_nm))) {
    context.fillStyle = "rgba(38, 49, 72, 0.9)";
    context.font = "800 12px Manrope, sans-serif";
    context.textAlign = "right";
    context.fillText(`Selected peak d = ${Number(profile.selected_d_spacing_nm).toFixed(4)} nm`, geom.right, geom.top + 14);
  }
}

function drawFftProfileCanvas() {
  if (!fftProfileCanvas) {
    return;
  }
  const context = fftProfileCanvas.getContext("2d");
  const profile = state.fft.result?.inverse_intensity_profile || state.fft.result?.intensity_profile;
  fftProfileCanvas.width = 560;
  fftProfileCanvas.height = 260;

  context.fillStyle = "#fbfcff";
  context.fillRect(0, 0, fftProfileCanvas.width, fftProfileCanvas.height);

  if (!profile?.distance_nm?.length || !profile?.intensity?.length) {
    context.fillStyle = "rgba(38, 49, 72, 0.84)";
    context.font = "700 13px Manrope, sans-serif";
    context.textAlign = "center";
    context.fillText("Run FFT to generate the lattice intensity profile", fftProfileCanvas.width / 2, fftProfileCanvas.height / 2);
    return;
  }

  const scale = profilePlotScale(fftProfileCanvas, profile);
  if (!scale) {
    return;
  }
  const { distance, intensity, xFor, yFor, geom } = scale;
  drawProfileAxes(context, fftProfileCanvas, scale);

  const manualPair = profileManualPeakPair();
  const displayPair = manualPair || profileAutoSpanPeakPair(profile);
  const isManualSpan = Boolean(manualPair);

  drawProfilePlotClip(context, geom, () => {
    context.strokeStyle = "rgba(78, 91, 112, 0.95)";
    context.lineWidth = 2;
    context.beginPath();
    intensity.forEach((value, index) => {
      const x = xFor(distance[index]);
      const y = yFor(value);
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.stroke();

    (profile.peaks || []).forEach((peak) => {
      const x = xFor(Number(peak.distance_nm));
      const y = yFor(Number(peak.intensity));
      context.strokeStyle = "rgba(54, 112, 255, 0.72)";
      context.fillStyle = "rgba(54, 112, 255, 0.20)";
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    });

    if (displayPair) {
      const start = displayPair[0];
      const end = displayPair[1];
      const startX = xFor(Number(start.distance_nm));
      const startY = yFor(Number(start.intensity));
      const endX = xFor(Number(end.distance_nm));
      const endY = yFor(Number(end.intensity));
      context.strokeStyle = "rgba(245, 176, 35, 0.95)";
      context.fillStyle = "rgba(245, 176, 35, 0.92)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
      displayPair.forEach((peak) => {
        const x = xFor(Number(peak.distance_nm));
        const y = yFor(Number(peak.intensity));
        context.beginPath();
        context.arc(x, y, state.fft.profileDrag.active ? 7 : 6, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "rgba(255, 255, 255, 0.95)";
        context.stroke();
      });
    }
  });

  if ((profile.peaks || []).length === 0) {
    context.fillStyle = "rgba(38, 49, 72, 0.72)";
    context.font = "700 12px Manrope, sans-serif";
    context.textAlign = "center";
    context.fillText("No profile peaks were detected automatically", (geom.left + geom.right) / 2, geom.top + 22);
  }

  context.fillStyle = "rgba(84, 98, 124, 0.95)";
  context.font = "700 11px Manrope, sans-serif";
  context.textAlign = "center";
  context.fillText("Distance (nm)", (geom.left + geom.right) / 2, fftProfileCanvas.height - 8);
  context.save();
  context.translate(14, (geom.top + geom.bottom) / 2);
  context.rotate(-Math.PI / 2);
  context.fillText("Gray value", 0, 0);
  context.restore();

  const displayedSpacing = isManualSpan ? state.fft.result?.d_spacing_nm : profile.spacing_nm;
  if (Number.isFinite(Number(displayedSpacing))) {
    context.fillStyle = "rgba(38, 49, 72, 0.9)";
    context.font = "800 12px Manrope, sans-serif";
    context.textAlign = "right";
    const intervalCount = isManualSpan ? state.fft.result?.profile_interval_count : profile.span_measurement?.interval_count;
    const intervalText = Number.isFinite(Number(intervalCount))
      ? ` / ${Number(intervalCount)} intervals`
      : "";
    context.fillText(`${isManualSpan ? "Adjusted" : "Auto"} span d: ${Number(displayedSpacing).toFixed(4)} nm${intervalText}`, geom.right, geom.top + 14);
  }
}

function drawProfileCanvasForKind(kind) {
  if (kind === "frequency") {
    drawFftFrequencyProfileCanvas();
  } else {
    drawFftProfileCanvas();
  }
}

function profileScaleForKind(kind) {
  const canvas = profileCanvasForKind(kind);
  const profile = profileForViewKind(kind);
  const { xValues, yValues } = profileValuesForKind(kind, profile);
  return profilePlotScale(canvas, profile, { viewKind: kind, xValues, yValues });
}

function pointInProfileInteractionArea(point, scale) {
  return Boolean(profilePointZone(point, scale));
}

function startProfileAxisDrag(kind, event, point, mode) {
  const canvas = profileCanvasForKind(kind);
  const scale = profileScaleForKind(kind);
  if (!canvas || !scale || !mode) {
    return false;
  }
  event.preventDefault();
  state.fft.profileAxisDrag = {
    active: true,
    kind,
    mode,
    pointerId: event.pointerId,
    startPoint: point,
    startView: {
      xMin: scale.minDistance,
      xMax: scale.maxDistance,
      yMin: scale.minIntensity,
      yMax: scale.maxIntensity,
    },
    moved: false,
  };
  try {
    canvas.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is optional; dragging still works without it.
  }
  canvas.style.cursor = "grabbing";
  return true;
}

function updateProfileAxisDrag(kind, point) {
  const drag = state.fft.profileAxisDrag;
  if (!drag.active || drag.kind !== kind || !drag.startPoint || !drag.startView) {
    return false;
  }
  const canvas = profileCanvasForKind(kind);
  const profile = profileForViewKind(kind);
  const { xValues, yValues } = profileValuesForKind(kind, profile);
  const bounds = profileDataBounds(xValues, yValues);
  if (!canvas || !bounds) {
    return false;
  }
  const geom = profilePlotGeometry(canvas);
  const plotWidth = Math.max(1, geom.right - geom.left);
  const plotHeight = Math.max(1, geom.bottom - geom.top);
  const dx = point.x - drag.startPoint.x;
  const dy = point.y - drag.startPoint.y;
  const spanX = drag.startView.xMax - drag.startView.xMin;
  const spanY = drag.startView.yMax - drag.startView.yMin;
  const next = { ...drag.startView };
  if (drag.mode.includes("x")) {
    const shiftX = -(dx / plotWidth) * spanX;
    next.xMin = drag.startView.xMin + shiftX;
    next.xMax = drag.startView.xMax + shiftX;
  }
  if (drag.mode.includes("y")) {
    const shiftY = (dy / plotHeight) * spanY;
    next.yMin = drag.startView.yMin + shiftY;
    next.yMax = drag.startView.yMax + shiftY;
  }
  setProfileView(kind, next, bounds);
  drag.moved = true;
  drawProfileCanvasForKind(kind);
  return true;
}

function finishProfileAxisDrag(kind, event) {
  const drag = state.fft.profileAxisDrag;
  if (!drag.active || drag.kind !== kind) {
    return false;
  }
  const canvas = profileCanvasForKind(kind);
  event.preventDefault();
  try {
    canvas?.releasePointerCapture(event.pointerId);
  } catch {
    // Ignore pointer capture release failures from cancelled gestures.
  }
  const moved = drag.moved;
  state.fft.profileAxisDrag = {
    active: false,
    kind: null,
    mode: null,
    pointerId: null,
    startPoint: null,
    startView: null,
    moved: false,
  };
  if (canvas) {
    canvas.style.cursor = "grab";
  }
  if (moved && fftStatus) {
    fftStatus.textContent = kind === "frequency"
      ? "FFT frequency profile axes adjusted."
      : "Inverse FFT profile axes adjusted.";
  }
  return true;
}

function profileDataValueFromPoint(point, scale) {
  const { geom, minDistance, maxDistance, minIntensity, maxIntensity } = scale;
  const xRatio = Math.max(0, Math.min(1, (point.x - geom.left) / Math.max(1, geom.right - geom.left)));
  const yRatio = Math.max(0, Math.min(1, (geom.bottom - point.y) / Math.max(1, geom.bottom - geom.top)));
  return {
    x: minDistance + xRatio * (maxDistance - minDistance),
    y: minIntensity + yRatio * (maxIntensity - minIntensity),
  };
}

function zoomProfileRange(minValue, maxValue, anchor, factor) {
  return {
    min: anchor - (anchor - minValue) * factor,
    max: anchor + (maxValue - anchor) * factor,
  };
}

function zoomProfileAxis(kind, event, point) {
  const scale = profileScaleForKind(kind);
  if (!scale || !pointInProfileInteractionArea(point, scale)) {
    return false;
  }
  const zone = profilePointZone(point, scale);
  const dataPoint = profileDataValueFromPoint(point, scale);
  const zoomBoth = event.ctrlKey || event.metaKey;
  const zoomY = zoomBoth || event.shiftKey || zone === "y";
  const zoomX = zoomBoth || (!event.shiftKey && zone !== "y");
  if (!zoomX && !zoomY) {
    return false;
  }
  event.preventDefault();
  const factor = Math.exp(Math.max(-1.8, Math.min(1.8, event.deltaY * 0.002)));
  const next = {
    xMin: scale.minDistance,
    xMax: scale.maxDistance,
    yMin: scale.minIntensity,
    yMax: scale.maxIntensity,
  };
  if (zoomX) {
    const xRange = zoomProfileRange(scale.minDistance, scale.maxDistance, dataPoint.x, factor);
    next.xMin = xRange.min;
    next.xMax = xRange.max;
  }
  if (zoomY) {
    const yRange = zoomProfileRange(scale.minIntensity, scale.maxIntensity, dataPoint.y, factor);
    next.yMin = yRange.min;
    next.yMax = yRange.max;
  }
  setProfileView(kind, next, scale.bounds);
  drawProfileCanvasForKind(kind);
  if (fftStatus) {
    fftStatus.textContent = kind === "frequency"
      ? "FFT frequency profile scale adjusted."
      : "Inverse FFT profile scale adjusted.";
  }
  return true;
}

function resetProfileAxisView(kind) {
  if (!state.fft.profileViews) {
    resetFftProfileViews();
  }
  state.fft.profileViews[kind] = defaultProfileView();
  drawProfileCanvasForKind(kind);
  if (fftStatus) {
    fftStatus.textContent = kind === "frequency"
      ? "FFT frequency profile axes reset."
      : "Inverse FFT profile axes reset.";
  }
}

function updateFftControls() {
  const hasFile = state.selectedIndex >= 0 && state.selectedIndex < state.files.length;
  const hasRoi = Boolean(state.fft.roi);
  const hasResult = Boolean(state.fft.result && !state.fft.result.error);
  const hasManualPeakPair = hasResult && state.fft.result?.measurement_source === "manual_peak_pair";
  const hasManualProfileSpan = hasResult && state.fft.result?.measurement_source === "manual_profile_peaks";
  const hasManualFftMeasurement = hasManualPeakPair || hasManualProfileSpan;
  const hasIfftPeakPair = hasResult && Boolean(selectedPeakPairForIfft());

  if (startFftRoiBtn) {
    startFftRoiBtn.disabled = !hasFile;
    startFftRoiBtn.textContent = state.fft.captureActive ? "Picking ROI..." : "Pick FFT ROI";
  }
  if (runFftBtn) {
    runFftBtn.disabled = !hasFile || !hasRoi;
  }
  if (resetFftBtn) {
    resetFftBtn.disabled = !hasRoi && !state.fft.result && !state.fft.captureActive;
  }
  if (saveFftResultBtn) {
    saveFftResultBtn.disabled = !hasFile || !hasResult || !hasManualFftMeasurement;
    saveFftResultBtn.title = hasResult && !hasManualFftMeasurement
      ? "Click two FFT spots or drag the inverse FFT span before saving."
      : "";
  }
  if (exportFftCsvBtn) {
    const canExportFftCsv = state.fft.savedCount > 0;
    exportFftCsvBtn.disabled = !canExportFftCsv;
    exportFftCsvBtn.classList.toggle("ready", canExportFftCsv);
    exportFftCsvBtn.textContent = canExportFftCsv
      ? `Export FFT CSV (${state.fft.savedCount})`
      : "Export FFT CSV";
    exportFftCsvBtn.title = canExportFftCsv
      ? `${state.fft.savedCount} saved FFT result${state.fft.savedCount === 1 ? "" : "s"} ready to export.`
      : "Save FFT Result first.";
  }
  if (applyIfftBtn) {
    applyIfftBtn.disabled = !hasFile || !hasRoi || !hasIfftPeakPair;
    applyIfftBtn.title = hasResult && !hasIfftPeakPair
      ? "Select a valid FFT peak pair first."
      : "";
  }
  if (fftSavedCount) {
    fftSavedCount.textContent = `${state.fft.savedCount} FFT saved`;
  }
  if (fftRoiLabel) {
    fftRoiLabel.textContent = hasRoi
      ? `${state.fft.roi.width} x ${state.fft.roi.height} px @ (${state.fft.roi.x}, ${state.fft.roi.y})`
      : state.fft.captureActive
        ? "Drag on preview"
        : "No ROI";
  }
  if (fftSpacingLabel) {
    fftSpacingLabel.textContent = hasResult && Number.isFinite(Number(state.fft.result.d_spacing_nm))
      ? `${Number(state.fft.result.d_spacing_nm).toFixed(4)} nm`
      : "-";
  }
  if (fftAngleLabel) {
    fftAngleLabel.textContent = hasResult && Number.isFinite(Number(state.fft.result.lattice_angle_deg))
      ? `${Number(state.fft.result.lattice_angle_deg).toFixed(2)} deg`
      : "-";
  }
  if (fftPeakLabel) {
    const source = state.fft.result?.measurement_source;
    fftPeakLabel.textContent = source === "manual_profile_peaks"
      ? "Profile span"
      : source === "manual_peak_pair"
      ? "Manual peaks"
      : source === "auto_peak_pair"
        ? "Auto suggestion"
        : "-";
  }
  if (fftStatus) {
    if (state.fft.captureActive) {
      fftStatus.textContent = "Drag a rectangular lattice area on the preview image.";
    } else if (hasResult) {
      const profileSource = (state.fft.result?.inverse_intensity_profile || state.fft.result?.intensity_profile)?.source;
      fftStatus.textContent = profileSource === "fallback_horizontal"
        ? "Profile shown with horizontal fallback because no stable FFT peak pair was found."
        : hasManualProfileSpan
          ? "Inverse FFT span adjusted. Drag the yellow endpoints again if the span needs correction."
        : hasManualPeakPair
          ? "Manual FFT peak pair verified. Compare FFT frequency profile with inverse FFT real-space profile below."
          : "Auto FFT pair is only a suggestion. Click two FFT spots or drag the inverse FFT span to verify.";
    } else if (hasRoi) {
      fftStatus.textContent = "ROI ready. Run FFT to calculate d-spacing.";
    } else {
      fftStatus.textContent = "Pick one ROI per selected image to start FFT analysis.";
    }
  }
}

function buildFftRequestFormData({ manualPeakPair = null } = {}) {
  const file = state.files[state.selectedIndex];
  if (!file || !state.fft.roi) {
    return null;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("roi_json", JSON.stringify(state.fft.roi));
  formData.append("known_nm", knownNmInput?.value || "100");
  const sbColorInput = form.querySelector('[name="sb_color"]');
  formData.append("sb_color", sbColorInput?.value || "white");
  const row = state.results[state.selectedIndex];
  if (row && Number.isFinite(Number(row.nm_per_pixel)) && Number(row.nm_per_pixel) > 0) {
    formData.append("nm_per_pixel", String(row.nm_per_pixel));
  } else if (Number.isFinite(Number(state.fft.result?.nm_per_pixel)) && Number(state.fft.result.nm_per_pixel) > 0) {
    formData.append("nm_per_pixel", String(state.fft.result.nm_per_pixel));
  }
  const { radius, mode } = currentIfftSettings();
  formData.append("inverse_peak_mask_radius_px", String(radius));
  formData.append("ifft_mode", mode);
  if (Array.isArray(manualPeakPair) && manualPeakPair.length === 2) {
    formData.append("manual_peak_pair_json", JSON.stringify(manualPeakPair));
  }
  return formData;
}

async function requestFftAnalysis({ manualPeakPair = null } = {}) {
  const formData = buildFftRequestFormData({ manualPeakPair });
  if (!formData) {
    return null;
  }
  const response = await fetch(apiPath("/api/fft"), {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `FFT request failed (${response.status})`);
  }
  return payload;
}

function buildIfftRequestFormData() {
  const peakPair = selectedPeakPairForIfft();
  if (!peakPair) {
    return null;
  }
  const formData = buildFftRequestFormData({ manualPeakPair: peakPair });
  if (!formData) {
    return null;
  }
  formData.append("peak_pair_source", ifftPairSource());
  return formData;
}

async function requestIfftApply() {
  const formData = buildIfftRequestFormData();
  if (!formData) {
    return null;
  }
  const response = await fetch(apiPath("/api/fft/ifft"), {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `IFFT request failed (${response.status})`);
  }
  return payload;
}

async function runFftAnalysis() {
  const file = state.files[state.selectedIndex];
  if (!file || !state.fft.roi) {
    return;
  }

  runFftBtn.disabled = true;
  runFftBtn.textContent = "Running...";
  if (fftStatus) {
    fftStatus.textContent = "Sending selected ROI to the local FFT analyzer.";
  }

  try {
    const payload = await requestFftAnalysis();

    state.fft.result = {
      ...payload,
      image_name: file.name,
      manual_peak_pair_px: null,
    };
    state.fft.manualPeaks = [];
    state.fft.profilePeaks = [];
    resetFftProfileViews();
    await drawFftCanvas();
    await drawInverseFftCanvas();
    drawFftFrequencyProfileCanvas();
    drawFftProfileCanvas();
    updateFftControls();
    logConsole(
      "FFT completed",
      `${file.name}: d-spacing ${toFixedOrDash(payload.d_spacing_nm)} nm from selected ROI.`,
      "success"
    );
  } catch (error) {
    state.fft.result = null;
    resetFftProfileViews();
    await drawFftCanvas();
    await drawInverseFftCanvas();
    drawFftFrequencyProfileCanvas();
    drawFftProfileCanvas();
    if (fftStatus) {
      fftStatus.textContent = error.message || String(error);
    }
    logConsole("FFT failed", error.message || String(error), "error");
  } finally {
    runFftBtn.textContent = "Run FFT";
    updateFftControls();
  }
}

async function applyIfftSettings() {
  const file = state.files[state.selectedIndex];
  const peakPair = selectedPeakPairForIfft();
  if (!file || !state.fft.roi || !state.fft.result || !peakPair) {
    if (fftStatus) {
      fftStatus.textContent = "Run FFT and select a peak pair before applying IFFT settings.";
    }
    return;
  }

  const source = ifftPairSource();
  const originalButtonText = applyIfftBtn?.textContent || "Apply IFFT";
  if (applyIfftBtn) {
    applyIfftBtn.disabled = true;
    applyIfftBtn.textContent = "Applying...";
  }
  if (fftStatus) {
    fftStatus.textContent = "Applying IFFT filter settings to the current peak pair.";
  }

  try {
    const payload = await requestIfftApply();
    if (!payload) {
      return;
    }
    const previous = state.fft.result || {};
    const selectedPair = payload.selected_peak_pair || peakPair;
    const measurementSource = source === "manual_peak_pair" ? "manual_peak_pair" : "auto_peak_pair";

    state.fft.result = {
      ...previous,
      ...payload,
      image_name: previous.image_name || file.name,
      fft_image: previous.fft_image,
      candidate_peaks: previous.candidate_peaks,
      auto_peak_pair_px: measurementSource === "auto_peak_pair"
        ? selectedPair
        : previous.auto_peak_pair_px,
      manual_peak_pair_px: measurementSource === "manual_peak_pair"
        ? selectedPair
        : null,
      selected_peak_pair: selectedPair,
      measurement_source: measurementSource,
      manual_profile_peak_pair: null,
      profile_span_nm: null,
      profile_interval_count: null,
    };
    state.fft.manualPeaks = measurementSource === "manual_peak_pair" ? cloneFlatArray(selectedPair) : [];
    state.fft.profilePeaks = [];
    state.fft.profileViews.inverse = defaultProfileView();

    await drawFftCanvas();
    await drawInverseFftCanvas();
    drawFftProfileCanvas();
    updateFftControls();
    logConsole(
      "IFFT applied",
      `Mask ${payload.inverse_fft_peak_mask_radius_px || currentIfftSettings().radius}px, ${payload.ifft_mode || currentIfftSettings().mode}.`,
      "success"
    );
  } catch (error) {
    if (fftStatus) {
      fftStatus.textContent = error.message || String(error);
    }
    logConsole("IFFT apply failed", error.message || String(error), "error");
  } finally {
    if (applyIfftBtn) {
      applyIfftBtn.textContent = originalButtonText;
    }
    updateFftControls();
  }
}

async function rerunFftWithManualPeakPair() {
  const file = state.files[state.selectedIndex];
  if (!file || !state.fft.roi || state.fft.manualPeaks.length !== 2) {
    return;
  }
  const manualPeakPair = cloneFlatArray(state.fft.manualPeaks);
  if (fftStatus) {
    fftStatus.textContent = "Sending manual FFT peak pair to the Python analyzer.";
  }
  const payload = await requestFftAnalysis({ manualPeakPair });
  state.fft.result = {
    ...payload,
    image_name: file.name,
    manual_peak_pair_px: payload.manual_peak_pair_px || manualPeakPair,
  };
  state.fft.manualPeaks = cloneFlatArray(state.fft.result.manual_peak_pair_px || manualPeakPair);
  state.fft.profilePeaks = [];
  await drawFftCanvas();
  await drawInverseFftCanvas();
  drawFftFrequencyProfileCanvas();
  drawFftProfileCanvas();
  updateFftControls();
}

async function buildFftSample() {
  const file = state.files[state.selectedIndex];
  const result = state.fft.result;
  if (!file || !result) {
    throw new Error("No FFT result to save.");
  }
  if (!["manual_peak_pair", "manual_profile_peaks"].includes(result.measurement_source)) {
    throw new Error("Select two FFT spots or drag the inverse FFT span before saving the FFT result.");
  }
  const createdAt = new Date().toISOString();
  const sha256 = await fileSha256(file);
  return {
    schema_version: "tem_fft_roi_sample.v1",
    fft_result_id: `tem-fft-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
    created_at: createdAt,
    image_name: file.name,
    image_sha256: sha256,
    image: {
      name: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
      last_modified: file.lastModified || null,
      image_sha256: sha256,
    },
    roi_px: result.roi_px,
    nm_per_pixel: result.nm_per_pixel,
    fft_size_px: result.fft_size_px,
    fft_center_px: result.fft_center_px,
    fft_line_profile: result.fft_line_profile || null,
    inverse_intensity_profile: result.inverse_intensity_profile || result.intensity_profile || null,
    intensity_profile: result.intensity_profile || null,
    profile_span_nm: result.profile_span_nm || result.intensity_profile?.span_measurement?.span_nm || null,
    profile_interval_count: result.profile_interval_count || result.intensity_profile?.span_measurement?.interval_count || null,
    auto_peak_pair_px: result.auto_peak_pair_px || result.selected_peak_pair || null,
    manual_peak_pair_px: result.manual_peak_pair_px || null,
    manual_profile_peak_pair: result.manual_profile_peak_pair || null,
    d_spacing_nm: result.d_spacing_nm,
    lattice_angle_deg: result.lattice_angle_deg ?? result.angle_deg,
    peak_score: result.peak_score,
    measurement_source: result.measurement_source || "auto_peak_pair",
  };
}

function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function exportFftCsv() {
  const samples = await getFftSamples();
  if (samples.length === 0) {
    return;
  }
  const headers = [
    "image_name",
    "roi_x",
    "roi_y",
    "roi_width",
    "roi_height",
    "nm_per_pixel",
    "d_spacing_nm",
    "lattice_angle_deg",
    "measurement_source",
    "peak_score",
    "profile_spacing_nm",
    "profile_span_nm",
    "profile_interval_count",
  ];
  const rows = samples.map((sample) => [
    sample.image_name,
    sample.roi_px?.x,
    sample.roi_px?.y,
    sample.roi_px?.width,
    sample.roi_px?.height,
    sample.nm_per_pixel,
    sample.d_spacing_nm,
    sample.lattice_angle_deg,
    sample.measurement_source,
    sample.peak_score,
    sample.intensity_profile?.spacing_nm || "",
    sample.profile_span_nm || sample.intensity_profile?.span_measurement?.span_nm || "",
    sample.profile_interval_count || sample.intensity_profile?.span_measurement?.interval_count || "",
  ].map(csvEscape).join(","));
  const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "NC_TEM_analyzer_fft_roi_results.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  logConsole("FFT CSV exported", `Saved ${samples.length} FFT ROI measurement(s).`, "success");
}

function cloneFlatArray(items) {
  return Array.isArray(items) ? items.map((item) => (Array.isArray(item) ? [...item] : item)) : [];
}

function clonePolygonArray(polygons) {
  return Array.isArray(polygons)
    ? polygons.map((polygon) => (
      Array.isArray(polygon)
        ? polygon.map((point) => (Array.isArray(point) ? [...point] : point))
        : polygon
    ))
    : [];
}

function cloneObjectArray(items) {
  return Array.isArray(items) ? items.map((item) => ({ ...item })) : [];
}

function rowExcludedSet(row) {
  return new Set(Array.isArray(row?._excludedIndices) ? row._excludedIndices : []);
}

function filteredByExcluded(items, excluded) {
  return items.filter((_, index) => !excluded.has(index));
}

function applyRowExclusionState(row) {
  if (!row || row.error) {
    return row;
  }

  const excluded = rowExcludedSet(row);
  row.values_nm = filteredByExcluded(row._rawValuesNm || [], excluded);
  row.short_values_nm = filteredByExcluded(row._rawShortValuesNm || [], excluded);
  row.circles = filteredByExcluded(row._rawCircles || [], excluded);
  row.boxes = filteredByExcluded(row._rawBoxes || [], excluded);
  row.rotated_boxes = filteredByExcluded(row._rawRotatedBoxes || [], excluded);
  row.circle_annotations = (row._circleAnnotations || []).map((annotation, index) => ({
    ...annotation,
    accepted: !excluded.has(index),
  }));
  row.rectangle_annotations = (row._rectangleAnnotations || []).map((annotation, index) => ({
    ...annotation,
    accepted: !excluded.has(index),
  }));

  const longStats = stats(row.values_nm);
  row.count = longStats.count;
  row.mean_nm = longStats.mean;
  row.std_nm = longStats.std;

  if (row.mode === "platelet") {
    const shortStats = stats(row.short_values_nm);
    row.short_mean_nm = shortStats.mean;
    row.short_std_nm = shortStats.std;
  } else {
    row.short_mean_nm = null;
    row.short_std_nm = null;
    row.short_values_nm = [];
  }

  return row;
}

function normalizeAnalysisRow(row) {
  return applyRowExclusionState({
    ...row,
    measurement_definition: row?.mode === "platelet"
      ? rectangleMeasurement.measurementDefinitionForRow(row)
      : (row?.measurement_definition || null),
    _rawValuesNm: Array.isArray(row.values_nm) ? [...row.values_nm] : [],
    _rawShortValuesNm: Array.isArray(row.short_values_nm) ? [...row.short_values_nm] : [],
    _rawCircles: cloneFlatArray(row.circles),
    _rawBoxes: cloneFlatArray(row.boxes),
    _rawRotatedBoxes: clonePolygonArray(row.rotated_boxes),
    _rawSeedPoints: cloneFlatArray(row.rectangle_seed_points),
    _circleAnnotations: cloneObjectArray(row.circle_annotations),
    _rectangleAnnotations: cloneObjectArray(row.rectangle_annotations),
    _excludedIndices: [],
  });
}

function getExcludedCount(row) {
  return Array.isArray(row?._excludedIndices) ? row._excludedIndices.length : 0;
}

function getManualCorrectionCount(row) {
  if (!row || row.error) {
    return 0;
  }

  const circleCount = Array.isArray(row._circleAnnotations)
    ? row._circleAnnotations.filter((annotation) => annotation?.source === "manual_adjusted").length
    : 0;
  const rectangleCount = Array.isArray(row._rectangleAnnotations)
    ? row._rectangleAnnotations.filter((annotation) => annotation?.source === "manual_adjusted").length
    : 0;
  return circleCount + rectangleCount;
}

function toggleRowExclusion(row, index) {
  if (!row || row.error || index < 0) {
    return false;
  }

  const nextExcluded = rowExcludedSet(row);
  if (nextExcluded.has(index)) {
    nextExcluded.delete(index);
  } else {
    nextExcluded.add(index);
  }

  row._excludedIndices = [...nextExcluded].sort((left, right) => left - right);
  applyRowExclusionState(row);
  return nextExcluded.has(index);
}

function currentSelectedRow() {
  return state.results[state.selectedIndex] || null;
}

function overlayMaxIndex(row) {
  if (!row || row.error) {
    return -1;
  }

  return Math.max(
    Array.isArray(row._rawCircles) ? row._rawCircles.length - 1 : -1,
    Array.isArray(row._rawRotatedBoxes) ? row._rawRotatedBoxes.length - 1 : -1,
    Array.isArray(row._rawBoxes) ? row._rawBoxes.length - 1 : -1
  );
}

function setSelectedOverlayIndex(index) {
  const row = currentSelectedRow();
  const maxIndex = overlayMaxIndex(row);
  state.selectedOverlayIndex = index >= 0 && index <= maxIndex ? index : -1;
  updateDotControls();
  renderHistogram();
}

function selectedCircleInfo() {
  const row = currentSelectedRow();
  const index = state.selectedOverlayIndex;
  if (!row || row.error || row.mode !== "spherical" || index < 0 || !Array.isArray(row._rawCircles)) {
    return null;
  }
  const circle = row._rawCircles[index];
  if (!Array.isArray(circle) || circle.length < 3) {
    return null;
  }
  return { row, index, circle, kind: "dot" };
}

function rectangleGeometryFromPolygon(polygon) {
  if (!Array.isArray(polygon) || polygon.length < 4) {
    return null;
  }

  const points = polygon.slice(0, 4).map((point) => [
    Number(point?.[0]),
    Number(point?.[1]),
  ]);
  if (points.some((point) => !Number.isFinite(point[0]) || !Number.isFinite(point[1]))) {
    return null;
  }

  const centerX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const centerY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  const edges = [
    distanceBetweenPoints(points[0], points[1]),
    distanceBetweenPoints(points[1], points[2]),
    distanceBetweenPoints(points[2], points[3]),
    distanceBetweenPoints(points[3], points[0]),
  ];
  const pairA = (edges[0] + edges[2]) / 2;
  const pairB = (edges[1] + edges[3]) / 2;
  const lengthUsesPairA = pairA >= pairB;
  const axisStart = lengthUsesPairA ? points[0] : points[1];
  const axisEnd = lengthUsesPairA ? points[1] : points[2];
  const axisLength = Math.max(1e-6, distanceBetweenPoints(axisStart, axisEnd));
  const ux = (axisEnd[0] - axisStart[0]) / axisLength;
  const uy = (axisEnd[1] - axisStart[1]) / axisLength;

  return {
    centerX,
    centerY,
    length: Math.max(1, lengthUsesPairA ? pairA : pairB),
    width: Math.max(1, lengthUsesPairA ? pairB : pairA),
    angle: Math.atan2(uy, ux),
  };
}

function rectangleAxes(geometry) {
  const cos = Math.cos(geometry.angle);
  const sin = Math.sin(geometry.angle);
  return {
    ux: cos,
    uy: sin,
    vx: -sin,
    vy: cos,
  };
}

function polygonFromRectangleGeometry(geometry) {
  const axes = rectangleAxes(geometry);
  const halfLength = Math.max(1, geometry.length) / 2;
  const halfWidth = Math.max(1, geometry.width) / 2;
  const corners = [
    [-halfLength, -halfWidth],
    [halfLength, -halfWidth],
    [halfLength, halfWidth],
    [-halfLength, halfWidth],
  ];

  return corners.map(([lengthOffset, widthOffset]) => [
    geometry.centerX + (axes.ux * lengthOffset) + (axes.vx * widthOffset),
    geometry.centerY + (axes.uy * lengthOffset) + (axes.vy * widthOffset),
  ]);
}

function boxFromPolygon(polygon) {
  const xs = polygon.map((point) => point[0]);
  const ys = polygon.map((point) => point[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return [minX, minY, maxX - minX, maxY - minY];
}

function clonePolygon(polygon) {
  return Array.isArray(polygon)
    ? polygon.map((point) => (Array.isArray(point) ? [...point] : point))
    : [];
}

function rectangleAngleDeg(geometry) {
  return ((geometry.angle * 180) / Math.PI + 360) % 180;
}

function normalizeAngleDelta(angle) {
  let normalized = angle;
  while (normalized > Math.PI) {
    normalized -= Math.PI * 2;
  }
  while (normalized < -Math.PI) {
    normalized += Math.PI * 2;
  }
  return normalized;
}

function selectedRectangleInfo() {
  const row = currentSelectedRow();
  const index = state.selectedOverlayIndex;
  if (!row || row.error || row.mode !== "platelet" || index < 0 || !Array.isArray(row._rawRotatedBoxes)) {
    return null;
  }
  const polygon = row._rawRotatedBoxes[index];
  const geometry = rectangleGeometryFromPolygon(polygon);
  if (!geometry) {
    return null;
  }
  return { row, index, polygon, geometry, kind: "rectangle" };
}

function selectedOverlayInfo() {
  return selectedCircleInfo() || selectedRectangleInfo();
}

function selectedHistogramMeasurement() {
  const selection = selectedOverlayInfo();
  if (!selection) {
    return null;
  }

  const { row, index } = selection;
  const axis = currentHistogramAxis();
  const isIncludedInAxis = axis !== "short" || selection.kind === "rectangle";
  const rawValue = selection.kind === "rectangle" && axis === "short"
    ? Number(row._rawShortValuesNm?.[index])
    : Array.isArray(row._rawValuesNm)
      ? Number(row._rawValuesNm[index])
      : Number(selection.circle ? (selection.circle[2] * 2) * (row.nm_per_pixel || 0) : NaN);
  if (!Number.isFinite(rawValue)) {
    return null;
  }

  return {
    value: rawValue,
    axis,
    index,
    rowName: row.name || "",
    kind: selection.kind,
    inHistogram: isIncludedInAxis && state.historyRows.includes(row),
    excluded: rowExcludedSet(row).has(index),
  };
}

function updateDotControls() {
  const circleSelection = selectedCircleInfo();
  const rectangleSelection = selectedRectangleInfo();
  const hasCircleSelection = Boolean(circleSelection);
  const hasOverlaySelection = hasCircleSelection || Boolean(rectangleSelection);
  const isPlatelet = targetShape.value === "platelet";

  [
    radiusMinusBtn,
    radiusPlusBtn,
    centerLeftBtn,
    centerRightBtn,
    centerUpBtn,
    centerDownBtn,
    toggleSelectedDotBtn,
    saveVerifiedSampleBtn,
  ].forEach((button) => {
    if (button) {
      button.disabled = button === saveVerifiedSampleBtn
        ? !currentSelectedRow() || currentSelectedRow().error
        : !hasOverlaySelection;
    }
  });

  [radiusMinusBtn, radiusPlusBtn, centerLeftBtn, centerRightBtn, centerUpBtn, centerDownBtn].forEach((button) => {
    if (button) {
      button.disabled = !hasCircleSelection;
    }
  });

  [radiusMinusBtn, radiusPlusBtn, centerLeftBtn, centerRightBtn, centerUpBtn, centerDownBtn].forEach((button) => {
    if (button) {
      button.classList.toggle("hidden", isPlatelet);
    }
  });
  if (toggleSelectedDotBtn) {
    toggleSelectedDotBtn.classList.toggle("hidden", false);
  }
  if (saveVerifiedSampleBtn) {
    saveVerifiedSampleBtn.classList.toggle("hidden", isPlatelet);
  }
  if (overlayToolTag) {
    overlayToolTag.textContent = isPlatelet ? "Rectangle correction" : "Dot correction";
  }

  if (verifiedSampleCount) {
    verifiedSampleCount.textContent = `${state.verifiedSampleCount} verified`;
  }

  updateRectangleSeedControls();
  updateWorkflowStatus();

  if (!selectedDotLabel) {
    return;
  }
  if (isPlatelet) {
    if (rectangleSelection) {
      const { row, index, geometry } = rectangleSelection;
      const excluded = rowExcludedSet(row).has(index);
      const lengthNm = Number(row._rawValuesNm?.[index]) || (geometry.length * (row.nm_per_pixel || 0));
      const widthNm = Number(row._rawShortValuesNm?.[index]) || (geometry.width * (row.nm_per_pixel || 0));
      selectedDotLabel.textContent =
        `Rect ${index + 1}: ${lengthNm.toFixed(3)} x ${widthNm.toFixed(3)} nm${excluded ? " excluded" : ""}`;
      if (toggleSelectedDotBtn) {
        toggleSelectedDotBtn.textContent = excluded ? "Restore" : "Exclude";
      }
      return;
    }
    const count = state.rectangleSeed.points.length;
    selectedDotLabel.textContent = count === 4
      ? "Rectangle seed ready"
      : `Rectangle seed: ${count}/4 corners`;
    if (toggleSelectedDotBtn) {
      toggleSelectedDotBtn.textContent = "Exclude";
    }
    return;
  }
  if (!hasCircleSelection) {
    selectedDotLabel.textContent = "No dot selected";
    if (toggleSelectedDotBtn) {
      toggleSelectedDotBtn.textContent = "Exclude";
    }
    return;
  }

  const { row, index, circle } = circleSelection;
  const excluded = rowExcludedSet(row).has(index);
  const diameterNm = ((circle[2] * 2) * (row.nm_per_pixel || 0));
  selectedDotLabel.textContent = `Dot ${index + 1}: ${diameterNm.toFixed(3)} nm @ (${circle[0].toFixed(1)}, ${circle[1].toFixed(1)})${excluded ? " excluded" : ""}`;
  if (toggleSelectedDotBtn) {
    toggleSelectedDotBtn.textContent = excluded ? "Restore" : "Exclude";
  }
}

function updateRectangleSeedControls() {
  const isPlatelet = targetShape.value === "platelet";
  if (rectangleSeedPointsInput) {
    rectangleSeedPointsInput.value = isPlatelet && state.rectangleSeed.points.length === 4
      ? JSON.stringify(state.rectangleSeed.points)
      : "";
  }
  if (rectangleSeedPanel) {
    rectangleSeedPanel.classList.toggle("hidden", !isPlatelet);
  }
  if (startRectangleSeedBtn) {
    startRectangleSeedBtn.disabled = !isPlatelet || state.files.length === 0;
    startRectangleSeedBtn.textContent = state.rectangleSeed.captureActive ? "Picking..." : "Pick 4 corners";
  }
  if (resetRectangleSeedBtn) {
    resetRectangleSeedBtn.disabled = state.rectangleSeed.points.length === 0;
  }
  if (rectangleSeedStatus) {
    if (!isPlatelet) {
      rectangleSeedStatus.textContent = "Switch to NPL / Rod to seed rectangles";
    } else if (state.rectangleSeed.captureActive) {
      rectangleSeedStatus.textContent = `Click corner ${state.rectangleSeed.points.length + 1} of 4 on the preview`;
    } else if (state.rectangleSeed.points.length === 4) {
      rectangleSeedStatus.textContent = "Seed ready for next analysis";
    } else {
      rectangleSeedStatus.textContent = `Seed corners: ${state.rectangleSeed.points.length}/4`;
    }
  }
}

function adjustSelectedDotRadius(deltaPx) {
  const selection = selectedCircleInfo();
  if (!selection) {
    return;
  }

  const { row, index, circle } = selection;
  const nextRadius = Math.max(1, circle[2] + deltaPx);
  circle[2] = nextRadius;
  const nextDiameterNm = (nextRadius * 2) * (row.nm_per_pixel || 0);
  row._rawValuesNm[index] = nextDiameterNm;

  if (Array.isArray(row._circleAnnotations) && row._circleAnnotations[index]) {
    const annotation = row._circleAnnotations[index];
    annotation.radius_px = nextRadius;
    annotation.diameter_nm = nextDiameterNm;
    annotation.manual_delta_px = nextRadius - (annotation.auto_radius_px + (annotation.boundary_expand_px || 0));
    const centerDelta = annotation.manual_center_delta_px || [0, 0];
    annotation.source = Math.abs(annotation.manual_delta_px) > 1e-6 || Math.hypot(centerDelta[0], centerDelta[1]) > 1e-6
      ? "manual_adjusted"
      : "auto";
  }

  applyRowExclusionState(row);
  updateDerivedViews();
  drawPreview(state.selectedIndex);
  updateDotControls();
}

function adjustSelectedDotCenter(dxPx, dyPx) {
  const selection = selectedCircleInfo();
  if (!selection) {
    return;
  }

  const { row, index, circle } = selection;
  circle[0] += dxPx;
  circle[1] += dyPx;

  if (Array.isArray(row._circleAnnotations) && row._circleAnnotations[index]) {
    const annotation = row._circleAnnotations[index];
    annotation.cx_px = circle[0];
    annotation.cy_px = circle[1];
    const autoCx = annotation.auto_cx_px ?? circle[0];
    const autoCy = annotation.auto_cy_px ?? circle[1];
    annotation.manual_center_delta_px = [circle[0] - autoCx, circle[1] - autoCy];
    const radiusDelta = annotation.manual_delta_px || 0;
    annotation.source = Math.abs(radiusDelta) > 1e-6 || Math.hypot(annotation.manual_center_delta_px[0], annotation.manual_center_delta_px[1]) > 1e-6
      ? "manual_adjusted"
      : "auto";
  }

  applyRowExclusionState(row);
  drawPreview(state.selectedIndex);
  updateDotControls();
}

function rectangleHandleRadius(imageWidth = previewCanvas.width || 640) {
  return Math.max(2.4, Math.min(6.4, imageWidth / 180 * 0.4));
}

function rectangleRotationHandleOffset(geometry) {
  return Math.max(10, Math.min(28, Math.max(geometry.length, geometry.width) * 0.22));
}

function rectangleEditHandles(geometry) {
  const axes = rectangleAxes(geometry);
  const halfLength = geometry.length / 2;
  const halfWidth = geometry.width / 2;
  const rotateOffset = rectangleRotationHandleOffset(geometry);
  const pointAt = (lengthOffset, widthOffset) => ({
    x: geometry.centerX + (axes.ux * lengthOffset) + (axes.vx * widthOffset),
    y: geometry.centerY + (axes.uy * lengthOffset) + (axes.vy * widthOffset),
  });

  return [
    { mode: "resize", lengthSign: -1, widthSign: -1, cursor: "nwse-resize", ...pointAt(-halfLength, -halfWidth) },
    { mode: "resize", lengthSign: 1, widthSign: -1, cursor: "nesw-resize", ...pointAt(halfLength, -halfWidth) },
    { mode: "resize", lengthSign: 1, widthSign: 1, cursor: "nwse-resize", ...pointAt(halfLength, halfWidth) },
    { mode: "resize", lengthSign: -1, widthSign: 1, cursor: "nesw-resize", ...pointAt(-halfLength, halfWidth) },
    { mode: "resize", lengthSign: -1, widthSign: 0, cursor: "ew-resize", ...pointAt(-halfLength, 0) },
    { mode: "resize", lengthSign: 1, widthSign: 0, cursor: "ew-resize", ...pointAt(halfLength, 0) },
    { mode: "resize", lengthSign: 0, widthSign: -1, cursor: "ns-resize", ...pointAt(0, -halfWidth) },
    { mode: "resize", lengthSign: 0, widthSign: 1, cursor: "ns-resize", ...pointAt(0, halfWidth) },
    { mode: "rotate", lengthSign: 0, widthSign: 0, cursor: "grab", ...pointAt(0, -halfWidth - rotateOffset) },
    { mode: "move", lengthSign: 0, widthSign: 0, cursor: "grab", x: geometry.centerX, y: geometry.centerY },
  ];
}

function rectangleHandleAtPoint(polygon, x, y) {
  const geometry = rectangleGeometryFromPolygon(polygon);
  if (!geometry) {
    return null;
  }

  const tolerance = rectangleHandleRadius() * 1.8;
  const handles = rectangleEditHandles(geometry);
  const rotateHandle = handles
    .filter((handle) => handle.mode === "rotate")
    .find((handle) => Math.hypot(handle.x - x, handle.y - y) <= tolerance * 1.35);

  if (rotateHandle) {
    return { ...rotateHandle, geometry };
  }

  const resizeHandle = handles
    .filter((handle) => handle.mode === "resize")
    .find((handle) => Math.hypot(handle.x - x, handle.y - y) <= tolerance);

  if (resizeHandle) {
    return { ...resizeHandle, geometry };
  }

  if (pointInPolygon(x, y, polygon)) {
    return { mode: "move", lengthSign: 0, widthSign: 0, cursor: "grab", x, y, geometry };
  }

  return null;
}

function rectangleDragGeometry(edit, point) {
  const start = edit.startGeometry;
  const axes = rectangleAxes(start);
  const dx = point.x - edit.startPoint.x;
  const dy = point.y - edit.startPoint.y;

  if (edit.mode === "move") {
    return {
      ...start,
      centerX: start.centerX + dx,
      centerY: start.centerY + dy,
    };
  }

  if (edit.mode === "rotate") {
    const startPointerAngle = Math.atan2(edit.startPoint.y - start.centerY, edit.startPoint.x - start.centerX);
    const currentPointerAngle = Math.atan2(point.y - start.centerY, point.x - start.centerX);
    return {
      ...start,
      angle: start.angle + normalizeAngleDelta(currentPointerAngle - startPointerAngle),
    };
  }

  const minSize = 3;
  const along = (dx * axes.ux) + (dy * axes.uy);
  const across = (dx * axes.vx) + (dy * axes.vy);
  let centerX = start.centerX;
  let centerY = start.centerY;
  let length = start.length;
  let width = start.width;

  if (edit.lengthSign) {
    const requestedLength = Math.max(minSize, start.length + (edit.lengthSign * along));
    const appliedDelta = requestedLength - start.length;
    const appliedAlong = edit.lengthSign * appliedDelta;
    length = requestedLength;
    centerX += axes.ux * appliedAlong * 0.5;
    centerY += axes.uy * appliedAlong * 0.5;
  }

  if (edit.widthSign) {
    const requestedWidth = Math.max(minSize, start.width + (edit.widthSign * across));
    const appliedDelta = requestedWidth - start.width;
    const appliedAcross = edit.widthSign * appliedDelta;
    width = requestedWidth;
    centerX += axes.vx * appliedAcross * 0.5;
    centerY += axes.vy * appliedAcross * 0.5;
  }

  return {
    ...start,
    centerX,
    centerY,
    length,
    width,
  };
}

function ensureRectangleAnnotationBaseline(row, index, geometry) {
  if (!Array.isArray(row._rectangleAnnotations)) {
    row._rectangleAnnotations = [];
  }

  const nmPerPixel = Number(row.nm_per_pixel) || 0;
  const polygon = clonePolygon(row._rawRotatedBoxes?.[index] || polygonFromRectangleGeometry(geometry));
  const bbox = Array.isArray(row._rawBoxes?.[index])
    ? [...row._rawBoxes[index]]
    : boxFromPolygon(polygon);
  const lengthNm = Number(row._rawValuesNm?.[index]);
  const widthNm = Number(row._rawShortValuesNm?.[index]);
  const annotation = { ...(row._rectangleAnnotations[index] || {}) };

  annotation.id = annotation.id || `rect-${index + 1}`;
  annotation.index = index;
  annotation.geometry_type = "rotated_rectangle";
  annotation.measurement_definition = annotation.measurement_definition
    || rectangleMeasurement.measurementDefinitionForRow(row);
  annotation.source = annotation.source || "auto";
  annotation.accepted = !rowExcludedSet(row).has(index);
  annotation.length_nm = Number.isFinite(lengthNm) ? lengthNm : geometry.length * nmPerPixel;
  annotation.width_nm = Number.isFinite(widthNm) ? widthNm : geometry.width * nmPerPixel;
  annotation.long_axis_nm = annotation.length_nm;
  annotation.short_axis_nm = annotation.width_nm;
  annotation.aspect = annotation.aspect ?? (annotation.length_nm / Math.max(annotation.width_nm, 1e-6));
  annotation.aspect_ratio = annotation.aspect;
  annotation.center_px = Array.isArray(annotation.center_px)
    ? annotation.center_px
    : [geometry.centerX, geometry.centerY];
  annotation.polygon_px = Array.isArray(annotation.polygon_px)
    ? clonePolygon(annotation.polygon_px)
    : polygon;
  annotation.bbox_px = Array.isArray(annotation.bbox_px)
    ? [...annotation.bbox_px]
    : bbox;
  annotation.auto_length_nm = annotation.auto_length_nm ?? annotation.length_nm;
  annotation.auto_width_nm = annotation.auto_width_nm ?? annotation.width_nm;
  annotation.auto_center_px = Array.isArray(annotation.auto_center_px)
    ? annotation.auto_center_px
    : [...annotation.center_px];
  annotation.auto_polygon_px = Array.isArray(annotation.auto_polygon_px)
    ? clonePolygon(annotation.auto_polygon_px)
    : clonePolygon(annotation.polygon_px);
  annotation.auto_bbox_px = Array.isArray(annotation.auto_bbox_px)
    ? [...annotation.auto_bbox_px]
    : [...annotation.bbox_px];
  annotation.auto_angle_deg = annotation.auto_angle_deg ?? rectangleAngleDeg(geometry);

  row._rectangleAnnotations[index] = annotation;
}

function updateRectangleAnnotation(row, index, geometry, polygon, bbox) {
  if (!Array.isArray(row._rectangleAnnotations)) {
    row._rectangleAnnotations = [];
  }

  const nmPerPixel = Number(row.nm_per_pixel) || 0;
  const measurement = rectangleMeasurement.canonicalRectangleMeasurement(geometry, nmPerPixel);
  const lengthNm = measurement.long_axis_nm;
  const widthNm = measurement.short_axis_nm;
  const existingAnnotation = { ...(row._rectangleAnnotations[index] || {}) };
  const existingLengthNm = existingAnnotation.long_axis_nm ?? existingAnnotation.length_nm;
  const existingWidthNm = existingAnnotation.short_axis_nm ?? existingAnnotation.width_nm;
  const annotation = rectangleMeasurement.rectangleMeasurementUpdate(
    existingAnnotation,
    geometry,
    nmPerPixel
  );

  annotation.id = annotation.id || `rect-${index + 1}`;
  annotation.index = index;
  annotation.geometry_type = "rotated_rectangle";
  annotation.auto_length_nm = annotation.auto_length_nm ?? existingLengthNm ?? lengthNm;
  annotation.auto_width_nm = annotation.auto_width_nm ?? existingWidthNm ?? widthNm;
  annotation.auto_center_px = Array.isArray(annotation.auto_center_px)
    ? annotation.auto_center_px
    : (Array.isArray(annotation.center_px) ? [...annotation.center_px] : [geometry.centerX, geometry.centerY]);
  annotation.auto_polygon_px = Array.isArray(annotation.auto_polygon_px)
    ? clonePolygon(annotation.auto_polygon_px)
    : clonePolygon(annotation.polygon_px || polygon);
  annotation.auto_bbox_px = Array.isArray(annotation.auto_bbox_px)
    ? [...annotation.auto_bbox_px]
    : (Array.isArray(annotation.bbox_px) ? [...annotation.bbox_px] : [...bbox]);
  annotation.auto_angle_deg = annotation.auto_angle_deg ?? rectangleAngleDeg(geometry);
  annotation.center_px = [geometry.centerX, geometry.centerY];
  annotation.polygon_px = clonePolygon(polygon);
  annotation.bbox_px = [...bbox];
  annotation.accepted = !rowExcludedSet(row).has(index);

  const autoLength = Number(annotation.auto_length_nm);
  const autoWidth = Number(annotation.auto_width_nm);
  const autoCenter = annotation.auto_center_px;
  annotation.manual_delta_length_nm = Number.isFinite(autoLength) ? lengthNm - autoLength : 0;
  annotation.manual_delta_width_nm = Number.isFinite(autoWidth) ? widthNm - autoWidth : 0;
  annotation.manual_center_delta_px = Array.isArray(autoCenter)
    ? [geometry.centerX - Number(autoCenter[0] || 0), geometry.centerY - Number(autoCenter[1] || 0)]
    : [0, 0];
  annotation.manual_angle_delta_deg = rectangleAngleDeg(geometry) - Number(annotation.auto_angle_deg || rectangleAngleDeg(geometry));

  const changed = Math.abs(annotation.manual_delta_length_nm) > 1e-6
    || Math.abs(annotation.manual_delta_width_nm) > 1e-6
    || Math.hypot(annotation.manual_center_delta_px[0], annotation.manual_center_delta_px[1]) > 1e-6
    || Math.abs(annotation.manual_angle_delta_deg) > 1e-6;
  annotation.source = changed ? "manual_adjusted" : (annotation.source || "auto");

  row._rectangleAnnotations[index] = annotation;
}

function applyRectangleGeometry(row, index, geometry) {
  if (!row || row.error || index < 0 || row.mode !== "platelet") {
    return false;
  }

  if (!Array.isArray(row._rawRotatedBoxes)) {
    row._rawRotatedBoxes = [];
  }
  if (!Array.isArray(row._rawBoxes)) {
    row._rawBoxes = [];
  }
  if (!Array.isArray(row._rawValuesNm)) {
    row._rawValuesNm = [];
  }
  if (!Array.isArray(row._rawShortValuesNm)) {
    row._rawShortValuesNm = [];
  }

  const polygon = polygonFromRectangleGeometry(geometry);
  const bbox = boxFromPolygon(polygon);
  const nmPerPixel = Number(row.nm_per_pixel) || 0;
  const measurement = rectangleMeasurement.canonicalRectangleMeasurement(geometry, nmPerPixel);

  row._rawRotatedBoxes[index] = polygon;
  row._rawBoxes[index] = bbox;
  row._rawValuesNm[index] = measurement.long_axis_nm;
  row._rawShortValuesNm[index] = measurement.short_axis_nm;
  row.measurement_definition = measurement.measurement_definition;
  updateRectangleAnnotation(row, index, geometry, polygon, bbox);
  applyRowExclusionState(row);
  return true;
}

function refreshRectangleCorrectionViews() {
  rebuildAccumulatedValues();
  renderHistoryTable();
  renderSummary();
  updateSessionStats();
  setActionButtonsState();
  updateDotControls();
}

function resetRectangleEditState({ suppressNextClick = false } = {}) {
  state.rectangleEdit.active = false;
  state.rectangleEdit.mode = null;
  state.rectangleEdit.index = -1;
  state.rectangleEdit.startPoint = null;
  state.rectangleEdit.startGeometry = null;
  state.rectangleEdit.lengthSign = 0;
  state.rectangleEdit.widthSign = 0;
  state.rectangleEdit.moved = false;
  state.rectangleEdit.suppressNextClick = suppressNextClick;
  if (previewCanvas) {
    previewCanvas.style.cursor = "";
  }
}

function beginRectangleEdit(event) {
  if (event.button !== 0 || event.shiftKey || event.altKey || event.metaKey || event.ctrlKey) {
    return false;
  }
  if (state.fft.captureActive || state.rectangleSeed.captureActive || targetShape.value !== "platelet") {
    return false;
  }

  const row = currentSelectedRow();
  if (!row || row.error || row.mode !== "platelet" || !Array.isArray(row._rawRotatedBoxes)) {
    return false;
  }

  const point = getCanvasCoordinates(event);
  if (!point) {
    return false;
  }

  let targetIndex = state.selectedOverlayIndex;
  let handle = targetIndex >= 0
    ? rectangleHandleAtPoint(row._rawRotatedBoxes[targetIndex], point.x, point.y)
    : null;

  if (!handle) {
    targetIndex = findOverlayIndexAtPoint(row, point.x, point.y);
    if (targetIndex < 0 || !row._rawRotatedBoxes[targetIndex]) {
      return false;
    }
    setSelectedOverlayIndex(targetIndex);
    handle = rectangleHandleAtPoint(row._rawRotatedBoxes[targetIndex], point.x, point.y);
  }

  if (!handle) {
    return false;
  }

  ensureRectangleAnnotationBaseline(row, targetIndex, handle.geometry);
  state.rectangleEdit.active = true;
  state.rectangleEdit.mode = handle.mode;
  state.rectangleEdit.index = targetIndex;
  state.rectangleEdit.startPoint = point;
  state.rectangleEdit.startGeometry = handle.geometry;
  state.rectangleEdit.lengthSign = handle.lengthSign || 0;
  state.rectangleEdit.widthSign = handle.widthSign || 0;
  state.rectangleEdit.moved = false;
  state.rectangleEdit.suppressNextClick = false;
  previewCanvas.style.cursor = handle.mode === "move" || handle.mode === "rotate" ? "grabbing" : handle.cursor;
  drawPreview(state.selectedIndex);
  return true;
}

function updateRectangleEdit(event) {
  if (!state.rectangleEdit.active) {
    return false;
  }

  const point = getCanvasCoordinates(event);
  const row = currentSelectedRow();
  if (!point || !row || row.error) {
    return false;
  }

  const distance = Math.hypot(
    point.x - state.rectangleEdit.startPoint.x,
    point.y - state.rectangleEdit.startPoint.y
  );
  if (distance < 0.5) {
    return true;
  }

  const geometry = rectangleDragGeometry(state.rectangleEdit, point);
  if (!applyRectangleGeometry(row, state.rectangleEdit.index, geometry)) {
    return false;
  }

  state.rectangleEdit.moved = true;
  refreshRectangleCorrectionViews();
  drawPreview(state.selectedIndex);
  return true;
}

function finishRectangleEdit(event) {
  if (!state.rectangleEdit.active) {
    return false;
  }

  const moved = state.rectangleEdit.moved;
  const index = state.rectangleEdit.index;
  const row = currentSelectedRow();
  resetRectangleEditState({ suppressNextClick: moved });

  if (moved && row && !row.error) {
    refreshRectangleCorrectionViews();
    drawPreview(state.selectedIndex);
    const lengthNm = Number(row._rawValuesNm?.[index]);
    const widthNm = Number(row._rawShortValuesNm?.[index]);
    logConsole(
      "Rectangle corrected",
      `${row.name}: rect ${index + 1} adjusted to ${toFixedOrDash(lengthNm)} x ${toFixedOrDash(widthNm)} nm.`,
      "info"
    );
  }

  if (event) {
    event.preventDefault();
  }
  return true;
}

function updateRectangleEditCursor(event) {
  if (!previewCanvas || state.rectangleEdit.active || state.fft.captureActive || state.rectangleSeed.captureActive) {
    return;
  }

  const row = currentSelectedRow();
  if (!row || row.error || row.mode !== "platelet" || targetShape.value !== "platelet") {
    previewCanvas.style.cursor = "";
    return;
  }

  const point = getCanvasCoordinates(event);
  if (!point) {
    previewCanvas.style.cursor = "";
    return;
  }

  const selected = selectedRectangleInfo();
  const handle = selected
    ? rectangleHandleAtPoint(selected.polygon, point.x, point.y)
    : null;
  if (handle) {
    previewCanvas.style.cursor = handle.cursor;
    return;
  }

  previewCanvas.style.cursor = findOverlayIndexAtPoint(row, point.x, point.y) >= 0 ? "grab" : "";
}

function getCanvasCoordinates(event) {
  const rect = previewCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }

  return {
    x: (event.clientX - rect.left) * (previewCanvas.width / rect.width),
    y: (event.clientY - rect.top) * (previewCanvas.height / rect.height),
  };
}

function pointInPolygon(x, y, polygon) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-6) + xi);

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function findOverlayIndexAtPoint(row, x, y) {
  if (!row || row.error) {
    return -1;
  }

  const tolerance = Math.max(6, previewCanvas.width / 180);

  if (Array.isArray(row._rawRotatedBoxes) && row._rawRotatedBoxes.length > 0) {
    for (let index = row._rawRotatedBoxes.length - 1; index >= 0; index -= 1) {
      const polygon = row._rawRotatedBoxes[index];
      if (Array.isArray(polygon) && polygon.length >= 4 && pointInPolygon(x, y, polygon)) {
        return index;
      }
    }
    return -1;
  }

  if (Array.isArray(row._rawBoxes) && row._rawBoxes.length > 0) {
    for (let index = row._rawBoxes.length - 1; index >= 0; index -= 1) {
      const box = row._rawBoxes[index];
      if (!Array.isArray(box) || box.length < 4) {
        continue;
      }

      const [left, top, width, height] = box;
      if (
        x >= left - tolerance
        && x <= left + width + tolerance
        && y >= top - tolerance
        && y <= top + height + tolerance
      ) {
        return index;
      }
    }
    return -1;
  }

  if (Array.isArray(row._rawCircles) && row._rawCircles.length > 0) {
    for (let index = row._rawCircles.length - 1; index >= 0; index -= 1) {
      const circle = row._rawCircles[index];
      if (!Array.isArray(circle) || circle.length < 3) {
        continue;
      }

      const [cx, cy, radius] = circle;
      const dx = x - cx;
      const dy = y - cy;
      if ((dx * dx) + (dy * dy) <= (radius + tolerance) ** 2) {
        return index;
      }
    }
  }

  return -1;
}

function drawPolygonPath(context, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 4) {
    return;
  }

  context.beginPath();
  context.moveTo(polygon[0][0], polygon[0][1]);
  for (let i = 1; i < polygon.length; i += 1) {
    context.lineTo(polygon[i][0], polygon[i][1]);
  }
  context.closePath();
}

function setOverlayStroke(context, lineWidth, excluded) {
  context.lineWidth = lineWidth;
  if (excluded) {
    context.strokeStyle = "rgba(182, 192, 209, 0.82)";
    context.setLineDash([Math.max(6, lineWidth * 2.2), Math.max(4, lineWidth * 1.4)]);
  } else {
    context.strokeStyle = "rgba(255, 77, 77, 0.96)";
    context.setLineDash([]);
  }
}

function drawRectangleEditHandles(context, polygon, imageWidth) {
  const geometry = rectangleGeometryFromPolygon(polygon);
  if (!geometry) {
    return;
  }

  const axes = rectangleAxes(geometry);
  const halfWidth = geometry.width / 2;
  const rotateOffset = rectangleRotationHandleOffset(geometry);
  const handleRadius = rectangleHandleRadius(imageWidth);
  const handles = rectangleEditHandles(geometry);
  const rotateHandle = handles.find((handle) => handle.mode === "rotate");
  context.save();
  context.setLineDash([]);
  context.lineWidth = Math.max(1, (imageWidth / 520) * 0.7);

  if (rotateHandle) {
    const anchorX = geometry.centerX + (axes.vx * -halfWidth);
    const anchorY = geometry.centerY + (axes.vy * -halfWidth);
    context.strokeStyle = "rgba(255, 214, 92, 0.58)";
    context.beginPath();
    context.moveTo(anchorX, anchorY);
    context.lineTo(rotateHandle.x, rotateHandle.y);
    context.stroke();
    context.beginPath();
    context.arc(rotateHandle.x, rotateHandle.y, rotateOffset * 0.28, geometry.angle - 1.1, geometry.angle + 1.1);
    context.stroke();
  }

  handles.forEach((handle) => {
    context.strokeStyle = "rgba(42, 35, 12, 0.88)";
    context.fillStyle = handle.mode === "move"
      ? "rgba(255, 244, 180, 0.95)"
      : handle.mode === "rotate"
        ? "rgba(82, 219, 255, 0.95)"
      : "rgba(255, 214, 92, 0.98)";

    if (handle.mode === "move") {
      context.beginPath();
      context.arc(handle.x, handle.y, handleRadius * 0.72, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      return;
    }

    if (handle.mode === "rotate") {
      context.beginPath();
      context.arc(handle.x, handle.y, handleRadius * 0.95, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      return;
    }

    if (handle.lengthSign && handle.widthSign) {
      const side = handleRadius * 1.45;
      context.fillRect(handle.x - side / 2, handle.y - side / 2, side, side);
      context.strokeRect(handle.x - side / 2, handle.y - side / 2, side, side);
      return;
    }

    context.beginPath();
    context.arc(handle.x, handle.y, handleRadius * 0.7, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });

  context.restore();
}

function updateDerivedViews() {
  rebuildAccumulatedValues();
  renderHistoryTable();
  renderSummary();
  updateSessionStats();
  setActionButtonsState();
  renderFileList();
  updateDotControls();
}

function resetHistogramView() {
  state.histogramView = {
    xMin: null,
    xMax: null,
    yMax: null,
    dragStartX: null,
    dragCurrentX: null,
    lastPlot: null,
  };
}

function hasShortAxisMeasurements() {
  return state.accumulatedShortValues.some((value) => Number.isFinite(Number(value)));
}

function currentHistogramAxis() {
  if (state.histogramAxis === "short" && hasShortAxisMeasurements()) {
    return "short";
  }
  return "long";
}

function histogramValuesForAxis(axis = currentHistogramAxis()) {
  const source = axis === "short" ? state.accumulatedShortValues : state.accumulatedValues;
  return source.filter((value) => Number.isFinite(Number(value))).map(Number);
}

function histogramAxisLabel(axis = currentHistogramAxis()) {
  if (axis === "short") {
    return "Short axis (nm)";
  }
  return hasShortAxisMeasurements() ? "Long axis / diameter (nm)" : "Diameter (nm)";
}

function updateHistogramAxisControls() {
  const hasShort = hasShortAxisMeasurements();
  if (state.histogramAxis === "short" && !hasShort) {
    state.histogramAxis = "long";
  }
  const axis = currentHistogramAxis();
  histogramAxisButtons.forEach((button) => {
    const buttonAxis = button.dataset.histAxis;
    const isActive = buttonAxis === axis;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = buttonAxis === "short" && !hasShort;
  });
  if (histogramMetricTag) {
    histogramMetricTag.textContent = `${histogramAxisLabel(axis)} / Count`;
  }
  if (histogramCanvas) {
    histogramCanvas.setAttribute("aria-label", `Histogram of accumulated ${histogramAxisLabel(axis)}`);
  }
}

function histogramVisibleValues() {
  const values = histogramValuesForAxis();
  const xMin = state.histogramView.xMin;
  const xMax = state.histogramView.xMax;
  return values.filter((value) => (
    (xMin === null || value >= xMin) &&
    (xMax === null || value <= xMax)
  ));
}

function histogramCanvasPoint(event) {
  if (!histogramCanvas) {
    return null;
  }
  const rect = histogramCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return null;
  }
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function histogramPointInPlot(point, plot) {
  return Boolean(
    point &&
    plot &&
    point.x >= plot.padding.left &&
    point.x <= plot.padding.left + plot.plotWidth &&
    point.y >= plot.padding.top &&
    point.y <= plot.padding.top + plot.plotHeight
  );
}

function histogramPointOnXAxis(point, plot) {
  return Boolean(
    point &&
    plot &&
    point.x >= plot.padding.left &&
    point.x <= plot.padding.left + plot.plotWidth &&
    point.y > plot.padding.top + plot.plotHeight &&
    point.y <= plot.cssHeight
  );
}

function histogramPointOnYAxis(point, plot) {
  return Boolean(
    point &&
    plot &&
    point.x >= 0 &&
    point.x < plot.padding.left &&
    point.y >= plot.padding.top &&
    point.y <= plot.padding.top + plot.plotHeight
  );
}

function histogramValueFromX(x, plot = state.histogramView.lastPlot) {
  if (!plot || !Number.isFinite(x)) {
    return null;
  }
  const clampedX = Math.max(plot.padding.left, Math.min(plot.padding.left + plot.plotWidth, x));
  const ratio = (clampedX - plot.padding.left) / plot.plotWidth;
  return plot.minValue + ratio * (plot.maxValue - plot.minValue);
}

function setHistogramXRange(xMin, xMax) {
  const plot = state.histogramView.lastPlot;
  if (!plot || !Number.isFinite(xMin) || !Number.isFinite(xMax)) {
    return;
  }
  let minValue = Math.min(xMin, xMax);
  let maxValue = Math.max(xMin, xMax);
  const fullMin = plot.dataMin;
  const fullMax = plot.dataMax;
  const fullRange = Math.max(0, fullMax - fullMin);
  const minRange = Math.max(fullRange * 0.01, 0.01);

  if (maxValue - minValue < minRange) {
    const center = (minValue + maxValue) / 2;
    minValue = center - minRange / 2;
    maxValue = center + minRange / 2;
  }

  if (fullRange > 0) {
    if (maxValue - minValue >= fullRange) {
      state.histogramView.xMin = null;
      state.histogramView.xMax = null;
      return;
    }
    if (minValue < fullMin) {
      maxValue += fullMin - minValue;
      minValue = fullMin;
    }
    if (maxValue > fullMax) {
      minValue -= maxValue - fullMax;
      maxValue = fullMax;
    }
    minValue = Math.max(fullMin, minValue);
    maxValue = Math.min(fullMax, maxValue);
  }

  state.histogramView.xMin = Number(minValue.toFixed(4));
  state.histogramView.xMax = Number(maxValue.toFixed(4));
}

function formatHistogramBinSizeInput(value) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }
  if (value >= 1) {
    return Number(value.toFixed(4)).toString();
  }
  return Number(value.toPrecision(4)).toString();
}

function renderHistogram(options = {}) {
  const targetCanvas = options.canvas || histogramCanvas;
  const updateUi = options.updateUi !== false;
  const transparentBackground = options.transparentBackground === true;
  if (!targetCanvas || (updateUi && !histogramSummary)) {
    return;
  }

  const context = targetCanvas.getContext("2d");
  if (!context) {
    return;
  }

  const rect = targetCanvas.getBoundingClientRect?.() || { width: 0, height: 0 };
  const cssWidth = Math.max(
    280,
    Math.round(options.cssWidth || rect.width || targetCanvas.clientWidth || 320)
  );
  const cssHeight = Math.max(180, Math.round(options.cssHeight || 240));
  const dpr = options.dpr || window.devicePixelRatio || 1;

  targetCanvas.width = Math.round(cssWidth * dpr);
  targetCanvas.height = Math.round(cssHeight * dpr);
  if (updateUi && targetCanvas.style) {
    targetCanvas.style.height = `${cssHeight}px`;
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, cssWidth, cssHeight);

  const padding = { top: 20, right: 18, bottom: 58, left: 48 };
  const plotWidth = cssWidth - padding.left - padding.right;
  const plotHeight = cssHeight - padding.top - padding.bottom;
  const plotStyle = transparentBackground
    ? {
        axisStroke: "#111827",
        gridStroke: "#d1d5db",
        labelFill: "#111827",
        emptyFill: "#111827",
        barTop: "rgba(108, 79, 246, 1)",
        barBottom: "rgba(108, 79, 246, 1)",
        selectedBarTop: "rgba(245, 176, 35, 1)",
        selectedBarBottom: "rgba(245, 176, 35, 1)",
        selectedStroke: "rgba(131, 83, 0, 1)",
        selectedDot: "rgba(131, 83, 0, 1)",
        overflowDot: "rgba(220, 72, 72, 1)",
        gaussianStroke: "rgba(0, 128, 128, 1)",
        gaussianMeanStroke: "rgba(0, 98, 98, 1)",
        badgeFill: "rgba(18, 30, 52, 1)",
        badgeStroke: "rgba(18, 30, 52, 1)",
      }
    : {
        axisStroke: "#dde2ea",
        gridStroke: "#e9edf3",
        labelFill: "#7a8598",
        emptyFill: "#8a95a8",
        barTop: "rgba(108, 79, 246, 0.82)",
        barBottom: "rgba(108, 79, 246, 0.28)",
        selectedBarTop: "rgba(245, 176, 35, 0.95)",
        selectedBarBottom: "rgba(245, 176, 35, 0.42)",
        selectedStroke: "rgba(131, 83, 0, 0.72)",
        selectedDot: "rgba(131, 83, 0, 0.9)",
        overflowDot: "rgba(220, 72, 72, 0.88)",
        gaussianStroke: "rgba(0, 128, 128, 0.92)",
        gaussianMeanStroke: "rgba(0, 98, 98, 0.32)",
        badgeFill: "rgba(18, 30, 52, 0.88)",
        badgeStroke: "rgba(255, 255, 255, 0.72)",
      };
  const xAxisText = histogramMath.histogramXAxisTextLayout({
    padding,
    plotWidth,
    plotHeight,
    cssHeight,
  });

  const drawRoundedBar = (x, y, width, height) => {
    const radius = Math.min(12, Math.max(4, width * 0.22), height * 0.22);
    context.beginPath();
    context.moveTo(x, y + height);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height);
    context.closePath();
    context.fill();
  };
  const drawStatsBadge = (text) => {
    if (!text) {
      return;
    }
    context.save();
    context.font = '700 12px "Manrope", sans-serif';
    context.textAlign = "left";
    context.textBaseline = "middle";
    const textWidth = context.measureText(text).width;
    const badgeX = padding.left + 10;
    const badgeY = padding.top + 10;
    const badgeWidth = Math.min(plotWidth - 20, textWidth + 24);
    const badgeHeight = 26;
    const radius = 7;
    context.beginPath();
    context.moveTo(badgeX + radius, badgeY);
    context.lineTo(badgeX + badgeWidth - radius, badgeY);
    context.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + radius);
    context.lineTo(badgeX + badgeWidth, badgeY + badgeHeight - radius);
    context.quadraticCurveTo(
      badgeX + badgeWidth,
      badgeY + badgeHeight,
      badgeX + badgeWidth - radius,
      badgeY + badgeHeight
    );
    context.lineTo(badgeX + radius, badgeY + badgeHeight);
    context.quadraticCurveTo(badgeX, badgeY + badgeHeight, badgeX, badgeY + badgeHeight - radius);
    context.lineTo(badgeX, badgeY + radius);
    context.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
    context.closePath();
    context.fillStyle = plotStyle.badgeFill;
    context.fill();
    context.strokeStyle = plotStyle.badgeStroke;
    context.lineWidth = 1;
    context.stroke();
    context.fillStyle = "#ffffff";
    context.fillText(text, badgeX + 12, badgeY + badgeHeight / 2 + 0.5);
    context.restore();
  };
  const drawPlotFrame = () => {
    context.save();
    context.strokeStyle = plotStyle.axisStroke;
    context.lineWidth = transparentBackground ? 1.4 : 1;
    context.beginPath();
    context.moveTo(padding.left, padding.top);
    context.lineTo(padding.left, padding.top + plotHeight);
    context.lineTo(padding.left + plotWidth, padding.top + plotHeight);
    if (transparentBackground) {
      context.lineTo(padding.left + plotWidth, padding.top);
      context.closePath();
    }
    context.stroke();
    context.restore();
  };

  if (updateUi) {
    updateHistogramAxisControls();
  }
  const axis = currentHistogramAxis();
  const axisLabel = histogramAxisLabel(axis);
  const axisValues = histogramValuesForAxis(axis);
  if (updateUi && downloadHistogramPng) {
    downloadHistogramPng.disabled = axisValues.length === 0;
  }

  if (!transparentBackground) {
    context.fillStyle = "#fafbfc";
    context.fillRect(0, 0, cssWidth, cssHeight);
  }

  drawPlotFrame();

  context.font = '11px "Manrope", sans-serif';
  context.fillStyle = plotStyle.labelFill;

  if (axisValues.length === 0) {
    if (updateUi) {
      state.histogramView.lastPlot = null;
    }
    context.textAlign = "center";
    context.fillText(axisLabel, padding.left + plotWidth / 2, xAxisText.axisLabelY);

    context.save();
    context.translate(14, padding.top + plotHeight / 2);
    context.rotate(-Math.PI / 2);
    context.fillText("Count", 0, 0);
    context.restore();

    context.fillStyle = plotStyle.emptyFill;
    context.font = '13px "Manrope", sans-serif';
    context.fillText(
      "No accepted measurements yet",
      padding.left + plotWidth / 2,
      padding.top + plotHeight / 2 - 8
    );
    context.font = '11px "Manrope", sans-serif';
    histogramMath.histogramEmptyMessageLines().forEach((line, index) => {
      context.fillText(
        line,
        padding.left + plotWidth / 2,
        padding.top + plotHeight / 2 + 14 + (index * 15)
      );
    });

    if (updateUi) {
      histogramSummary.textContent = "Accepted measurements: 0 | Histogram updates after each analysis run.";
    }
    return;
  }

  const allValues = [...axisValues].sort((left, right) => left - right);
  const visibleValues = histogramVisibleValues().sort((left, right) => left - right);
  const axisXMin = state.histogramView.xMin;
  const axisXMax = state.histogramView.xMax;
  let minValue = axisXMin ?? allValues[0];
  let maxValue = axisXMax ?? allValues[allValues.length - 1];

  if (minValue === maxValue) {
    minValue -= 0.5;
    maxValue += 0.5;
  }

  if (maxValue < minValue) {
    [minValue, maxValue] = [maxValue, minValue];
  }

  const requestedBinWidth = histogramMath.sanitizeHistogramBinSize(state.histogramBinSize, {
    minValue,
    maxValue,
    visibleCount: visibleValues.length,
  });
  const histogram = histogramMath.resolveHistogramBins(visibleValues, {
    minValue,
    maxValue,
    binSize: requestedBinWidth,
  });
  const bins = histogram.bins;
  const binCount = histogram.binCount;
  const binWidth = histogram.binWidth;
  const visibleStats = histogramMath.histogramStats(visibleValues);
  const gaussianFit = histogramMath.fitGaussianToHistogram(visibleValues, {
    minValue,
    maxValue,
    binWidth,
  });
  const selectedMeasurement = selectedHistogramMeasurement();
  let selectedBinIndex = -1;
  let selectedBinRange = null;

  if (
    selectedMeasurement &&
    selectedMeasurement.inHistogram &&
    !selectedMeasurement.excluded &&
    selectedMeasurement.value >= minValue &&
    selectedMeasurement.value <= maxValue
  ) {
    const rawIndex = Math.floor((selectedMeasurement.value - minValue) / binWidth);
    selectedBinIndex = Math.max(0, Math.min(binCount - 1, rawIndex));
    selectedBinRange = {
      min: minValue + (selectedBinIndex * binWidth),
      max: selectedBinIndex === binCount - 1
        ? maxValue
        : Math.min(maxValue, minValue + ((selectedBinIndex + 1) * binWidth)),
    };
  }

  const actualMaxCount = Math.max(...bins, gaussianFit ? Math.ceil(gaussianFit.peakCount) : 1, 1);
  const maxCount = state.histogramView.yMax === null
    ? actualMaxCount
    : Math.max(1, state.histogramView.yMax);
  const yTicks = histogramMath.histogramYTickCount(maxCount);
  if (updateUi) {
    state.histogramView.lastPlot = {
      padding,
      plotWidth,
      plotHeight,
      cssWidth,
      cssHeight,
      minValue,
      maxValue,
      dataMin: allValues[0],
      dataMax: allValues[allValues.length - 1],
      actualMaxCount,
      binCount,
      binWidth,
      gaussianFit,
      maxCount,
    };
  }

  for (let tick = 0; tick <= yTicks; tick += 1) {
    const value = (maxCount / yTicks) * tick;
    const y = padding.top + plotHeight - (plotHeight * tick) / yTicks;

    context.strokeStyle = plotStyle.gridStroke;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(padding.left + plotWidth, y);
    context.stroke();

    context.fillStyle = plotStyle.labelFill;
    context.textAlign = "right";
    context.fillText(String(Math.round(value)), padding.left - 10, y + 4);
  }

  const slotWidth = plotWidth / binCount;
  const barWidth = Math.max(12, slotWidth - 8);
  const gradient = context.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
  gradient.addColorStop(0, plotStyle.barTop);
  gradient.addColorStop(1, plotStyle.barBottom);
  const selectedGradient = context.createLinearGradient(0, padding.top, 0, padding.top + plotHeight);
  selectedGradient.addColorStop(0, plotStyle.selectedBarTop);
  selectedGradient.addColorStop(1, plotStyle.selectedBarBottom);

  bins.forEach((count, index) => {
    const height = (Math.min(count, maxCount) / maxCount) * (plotHeight - 8);
    const x = padding.left + index * slotWidth + (slotWidth - barWidth) / 2;
    const y = padding.top + plotHeight - height;
    const isSelectedBin = index === selectedBinIndex;
    context.fillStyle = isSelectedBin ? selectedGradient : gradient;
    drawRoundedBar(x, y, barWidth, Math.max(0, height));
    if (isSelectedBin) {
      context.strokeStyle = plotStyle.selectedStroke;
      context.lineWidth = 2;
      context.strokeRect(x - 2, Math.max(padding.top, y - 2), barWidth + 4, Math.max(6, height + 4));
      context.fillStyle = plotStyle.selectedDot;
      context.beginPath();
      context.arc(x + barWidth / 2, Math.max(padding.top + 7, y - 8), 4, 0, Math.PI * 2);
      context.fill();
    }
    if (count > maxCount) {
      context.fillStyle = plotStyle.overflowDot;
      context.beginPath();
      context.arc(x + barWidth / 2, padding.top + 6, 3, 0, Math.PI * 2);
      context.fill();
    }
  });

  if (gaussianFit) {
    context.save();
    context.beginPath();
    gaussianFit.points.forEach((point, index) => {
      const x = padding.left + ((point.x - minValue) / (maxValue - minValue)) * plotWidth;
      const y = padding.top + plotHeight - (Math.min(point.y, maxCount) / maxCount) * (plotHeight - 8);
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.strokeStyle = plotStyle.gaussianStroke;
    context.lineWidth = 2.25;
    context.stroke();
    context.setLineDash([5, 4]);
    context.strokeStyle = plotStyle.gaussianMeanStroke;
    const meanX = padding.left + ((gaussianFit.mean - minValue) / (maxValue - minValue)) * plotWidth;
    context.beginPath();
    context.moveTo(meanX, padding.top);
    context.lineTo(meanX, padding.top + plotHeight);
    context.stroke();
    context.restore();
  }

  if (
    updateUi &&
    state.histogramView.dragStartX !== null &&
    state.histogramView.dragCurrentX !== null
  ) {
    const startX = Math.max(padding.left, Math.min(padding.left + plotWidth, state.histogramView.dragStartX));
    const endX = Math.max(padding.left, Math.min(padding.left + plotWidth, state.histogramView.dragCurrentX));
    const left = Math.min(startX, endX);
    const width = Math.abs(endX - startX);
    context.fillStyle = "rgba(72, 113, 255, 0.16)";
    context.fillRect(left, padding.top, width, plotHeight);
    context.strokeStyle = "rgba(72, 113, 255, 0.88)";
    context.lineWidth = 1.5;
    context.strokeRect(left, padding.top, width, plotHeight);
  }

  drawStatsBadge(histogramMath.histogramStatsBadgeText(visibleStats));
  drawPlotFrame();

  context.fillStyle = plotStyle.labelFill;
  context.textAlign = "center";
  context.fillText(axisLabel, padding.left + plotWidth / 2, xAxisText.axisLabelY);

  const xTickValues = [minValue, (minValue + maxValue) / 2, maxValue];
  xTickValues.forEach((value, index) => {
    const tick = xAxisText.ticks[index];
    if (!tick) {
      return;
    }
    context.textAlign = tick.align;
    context.fillText(value.toFixed(2), tick.x, xAxisText.tickY);
  });

  context.textAlign = "center";
  context.save();
  context.translate(14, padding.top + plotHeight / 2);
  context.rotate(-Math.PI / 2);
  context.fillText("Count", 0, 0);
  context.restore();

  const selectedSummary = (() => {
    if (!selectedMeasurement) {
      return "";
    }
    const axisName = selectedMeasurement.kind === "rectangle"
      ? selectedMeasurement.axis === "short" ? "short axis" : "long axis"
      : "diameter";
    const subject = selectedMeasurement.kind === "rectangle"
      ? `Selected rectangle ${axisName}`
      : `Selected dot ${axisName}`;
    const valueLabel = selectedMeasurement.value.toFixed(3);
    if (!selectedMeasurement.inHistogram) {
      return ` | ${subject}: ${valueLabel} nm (not in histogram)`;
    }
    if (selectedMeasurement.excluded) {
      return ` | ${subject}: ${valueLabel} nm (excluded from histogram)`;
    }
    if (!selectedBinRange) {
      return ` | ${subject}: ${valueLabel} nm (outside X view)`;
    }
    return ` | ${subject}: ${valueLabel} nm -> ${selectedBinRange.min.toFixed(2)}-${selectedBinRange.max.toFixed(2)} nm bin`;
  })();

  const meanLabel = visibleStats.mean === null ? "-" : `${visibleStats.mean.toFixed(4)} nm`;
  const stdLabel = visibleStats.std === null ? "-" : `${visibleStats.std.toFixed(4)} nm`;
  const fitLabel = gaussianFit
    ? `Gaussian fit: μ ${gaussianFit.mean.toFixed(4)} nm, σ ${gaussianFit.std.toFixed(4)} nm`
    : "Gaussian fit: unavailable";

  if (updateUi) {
    histogramSummary.textContent =
      `Visible histogram measurements: ${visibleValues.length} / ${allValues.length}` +
      ` | Axis: ${axisLabel}` +
      ` | X view: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)} nm` +
      ` | Mean: ${meanLabel}` +
      ` | Std: ${stdLabel}` +
      ` | Y max: ${maxCount}` +
      ` | Bin size: ${binWidth.toFixed(4)} nm (${binCount} bins)` +
      ` | ${fitLabel}` +
      selectedSummary +
      " | Drag plot for X range; wheel axes for scale; wheel histogram for bin size.";
  }
}

function acceptedMeasurementExportRows() {
  return rectangleMeasurement.acceptedMeasurementExportRows(state.historyRows);
}

function csvCell(value) {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadTransparentHistogramPng() {
  if (!histogramCanvas || histogramValuesForAxis().length === 0) {
    return;
  }

  const rect = histogramCanvas.getBoundingClientRect();
  const exportCanvas = document.createElement("canvas");
  renderHistogram({
    canvas: exportCanvas,
    updateUi: false,
    transparentBackground: true,
    cssWidth: Math.max(280, Math.round(rect.width || histogramCanvas.clientWidth || 320)),
    cssHeight: 240,
    dpr: Math.max(2, window.devicePixelRatio || 1),
  });

  exportCanvas.toBlob((blob) => {
    if (!blob) {
      logConsole("Histogram export failed", "The browser could not create the PNG image.", "error");
      return;
    }
    downloadBlob(blob, "NC_histogram_transparent.png");
    logConsole(
      "Histogram PNG exported",
      "Saved the current histogram as a transparent-background PNG.",
      "success"
    );
  }, "image/png");
}

function setActionButtonsState() {
  downloadCsv.disabled = acceptedMeasurementExportRows().length === 0;
  if (downloadHistogramPng) {
    downloadHistogramPng.disabled = histogramValuesForAxis().length === 0;
  }
  clearDataBtn.disabled = state.historyRows.length === 0 && state.results.length === 0;
  if (refreshHistoryBtn) {
    refreshHistoryBtn.disabled = state.historyRows.length === 0;
  }
  updateHistogramAxisControls();
}

function rebuildAccumulatedValues() {
  state.accumulatedValues = [];
  state.accumulatedShortValues = [];

  state.historyRows.forEach((row) => {
    if (!row.error && Array.isArray(row.values_nm) && row.values_nm.length > 0) {
      state.accumulatedValues.push(...row.values_nm);
    }
    if (!row.error && Array.isArray(row.short_values_nm) && row.short_values_nm.length > 0) {
      state.accumulatedShortValues.push(...row.short_values_nm);
    }
  });
}

function updateWorkflowStatus() {
  const filesReady = state.files.length > 0;
  const analyzedRows = state.historyRows.filter((row) => row && !row.error).length;
  const exportRows = acceptedMeasurementExportRows().length;
  const correctionCount = state.historyRows.reduce(
    (sum, row) => sum + getManualCorrectionCount(row) + getExcludedCount(row),
    0
  );
  const selectedOverlay = state.selectedOverlayIndex >= 0 ? selectedOverlayInfo() : null;

  if (workflowModeLabel) {
    workflowModeLabel.textContent = currentModeLabel();
  }
  if (workflowQueueLabel) {
    workflowQueueLabel.textContent = `${state.files.length} file${state.files.length === 1 ? "" : "s"}`;
  }
  if (workflowDetectLabel) {
    workflowDetectLabel.textContent = analyzedRows > 0 ? `${analyzedRows} run${analyzedRows === 1 ? "" : "s"}` : filesReady ? "Ready to run" : "After setup";
  }
  if (workflowCorrectLabel) {
    workflowCorrectLabel.textContent = selectedOverlay
      ? `${selectedOverlay.kind === "rectangle" ? "Rectangle" : "Dot"} selected`
      : correctionCount > 0
        ? `${correctionCount} edit${correctionCount === 1 ? "" : "s"}`
        : analyzedRows > 0 ? "Inspect overlay" : "After detect";
  }
  if (workflowExportLabel) {
    workflowExportLabel.textContent = exportRows > 0 ? `${exportRows} rows` : "Ready";
  }

  const statusByStep = {
    upload: { active: !filesReady, complete: filesReady },
    setup: { active: filesReady && analyzedRows === 0, complete: analyzedRows > 0 },
    detect: { active: filesReady && analyzedRows === 0, complete: analyzedRows > 0 },
    correct: { active: analyzedRows > 0 && exportRows > 0, complete: correctionCount > 0 },
    export: { active: exportRows > 0, complete: false },
  };

  workflowSteps.forEach((step) => {
    const status = statusByStep[step.dataset.workflowStep] || {};
    step.classList.toggle("active", Boolean(status.active));
    step.classList.toggle("complete", Boolean(status.complete));
  });
}

function updateSessionStats() {
  if (scaleBadge) {
    scaleBadge.textContent = `${knownNmInput.value || "100.0"} nm scale`;
  }
  if (acceptedCountBadge) {
    acceptedCountBadge.textContent = String(state.accumulatedValues.length);
  }
  if (sessionFileCount) {
    sessionFileCount.textContent = `${state.files.length} file${state.files.length === 1 ? "" : "s"}`;
  }
  if (resultStateValue) {
    resultStateValue.textContent = state.historyRows.length === 0
      ? "No runs yet"
      : `${state.historyRows.length} saved run${state.historyRows.length === 1 ? "" : "s"}`;
  }
  updateWorkflowStatus();
}

function deleteHistoryRow(historyId) {
  state.historyRows = state.historyRows.filter((row) => row._historyId !== historyId);
  rebuildAccumulatedValues();
  renderHistoryTable();
  renderSummary();
  updateSessionStats();
  setActionButtonsState();
  updateDotControls();

  if (state.historyRows.length === 0) {
    resultPanel.classList.add("hidden");
  }

  logConsole("Result removed", "One saved analysis row was removed from the session.", "info");
}

function refreshLiveHistory({ emitLog = true } = {}) {
  rebuildAccumulatedValues();
  renderHistoryTable();
  renderSummary();
  updateSessionStats();
  setActionButtonsState();
  renderFileList();
  updateDotControls();

  if (state.historyRows.length > 0) {
    resultPanel.classList.remove("hidden");
  } else {
    resultPanel.classList.add("hidden");
  }

  if (resultPanel) {
    resultPanel.style.transform = "translateZ(0)";
    void resultPanel.offsetHeight;
    requestAnimationFrame(() => {
      resultPanel.style.transform = "";
    });
  }

  if (emitLog) {
    logConsole(
      "Live history refreshed",
      `${state.historyRows.length} row(s) redrawn from the current browser session.`,
      "info"
    );
  }
}

function renderHistoryTable() {
  resultRows.innerHTML = "";

  state.historyRows.forEach((row) => {
    const tr = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = row.name;

    const countCell = document.createElement("td");
    countCell.textContent = String(row.count);

    const meanLongCell = document.createElement("td");
    meanLongCell.textContent = toFixedOrDash(row.mean_nm);

    const stdLongCell = document.createElement("td");
    stdLongCell.textContent = toFixedOrDash(row.std_nm);

    const meanShortCell = document.createElement("td");
    meanShortCell.textContent = row.mode === "platelet" ? toFixedOrDash(row.short_mean_nm) : "-";

    const stdShortCell = document.createElement("td");
    stdShortCell.textContent = row.mode === "platelet" ? toFixedOrDash(row.short_std_nm) : "-";

    const statusCell = document.createElement("td");
    if (row.error) {
      const err = document.createElement("span");
      err.className = "error";
      err.textContent = row.error;
      statusCell.appendChild(err);
    } else if (getExcludedCount(row) > 0 || getManualCorrectionCount(row) > 0) {
      const excludedCount = getExcludedCount(row);
      const correctionCount = getManualCorrectionCount(row);
      const edited = document.createElement("span");
      edited.className = "status-ok";
      edited.textContent = `Edited (${correctionCount} corrected, ${excludedCount} excluded)`;
      statusCell.appendChild(edited);
    } else {
      const ok = document.createElement("span");
      ok.className = "status-ok";
      ok.textContent = "OK";
      statusCell.appendChild(ok);
    }

    const actionCell = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-row-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteHistoryRow(row._historyId));
    actionCell.appendChild(deleteBtn);

    tr.appendChild(nameCell);
    tr.appendChild(countCell);
    tr.appendChild(meanLongCell);
    tr.appendChild(stdLongCell);
    tr.appendChild(meanShortCell);
    tr.appendChild(stdShortCell);
    tr.appendChild(statusCell);
    tr.appendChild(actionCell);

    resultRows.appendChild(tr);
  });
}

function renderSummary() {
  const longSummary = stats(state.accumulatedValues);
  renderHistogram();

  if (longSummary.count === 0) {
    totalCount.textContent = "No accepted measurements yet.";
    return;
  }

  if (state.accumulatedShortValues.length > 0) {
    const shortSummary = stats(state.accumulatedShortValues);
    totalCount.textContent =
      `Accepted measurements: ${longSummary.count}` +
      ` | Long mean/std: ${longSummary.mean.toFixed(4)} / ${longSummary.std.toFixed(4)} nm` +
      ` | Short mean/std: ${shortSummary.mean.toFixed(4)} / ${shortSummary.std.toFixed(4)} nm`;
    return;
  }

  totalCount.textContent =
    `Accepted measurements: ${longSummary.count}` +
    ` | Mean: ${longSummary.mean.toFixed(4)} nm` +
    ` | Std: ${longSummary.std.toFixed(4)} nm`;
}

function appendAnalyzePayload(payload) {
  state.selectedOverlayIndex = -1;
  resetRectangleEditState();
  state.results = (payload.results || []).map((row) => {
    const normalized = normalizeAnalysisRow(row);
    normalized._historyId = state.nextHistoryId++;
    state.historyRows.push(normalized);
    return normalized;
  });

  updateDerivedViews();
  resultPanel.classList.remove("hidden");
  drawPreview(state.selectedIndex);

  logConsole(
    "Analysis completed",
    `${state.results.length} file(s) processed by Python in ${Math.round(payload.duration_ms || 0)} ms, ${payload.total_count || 0} accepted measurement(s).`,
    "success"
  );

  const slowest = state.results
    .filter((row) => Number.isFinite(row.duration_ms))
    .sort((left, right) => right.duration_ms - left.duration_ms)[0];
  if (slowest) {
    logConsole(
      "Slowest file",
      `${slowest.name}: ${Math.round(slowest.duration_ms)} ms in Python processing.`,
      slowest.error ? "error" : "info"
    );
  }
}

function clearCanvas() {
  const context = previewCanvas.getContext("2d");
  previewCanvas.width = 640;
  previewCanvas.height = 360;
  context.fillStyle = "rgba(8, 12, 22, 0.94)";
  context.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function drawGrayLayer(context, values, width, height) {
  previewCanvas.width = width;
  previewCanvas.height = height;
  const imageData = context.createImageData(width, height);
  for (let i = 0, j = 0; i < values.length; i += 1, j += 4) {
    const pixel = Math.max(0, Math.min(255, Math.round(values[i] * 255)));
    imageData.data[j] = pixel;
    imageData.data[j + 1] = pixel;
    imageData.data[j + 2] = pixel;
    imageData.data[j + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
}

function drawMaskLayer(context, values, width, height) {
  const level = otsuThreshold(values);
  previewCanvas.width = width;
  previewCanvas.height = height;
  const imageData = context.createImageData(width, height);
  for (let i = 0, j = 0; i < values.length; i += 1, j += 4) {
    const isCandidate = values[i] <= level;
    imageData.data[j] = isCandidate ? 255 : 16;
    imageData.data[j + 1] = isCandidate ? 255 : 24;
    imageData.data[j + 2] = isCandidate ? 255 : 40;
    imageData.data[j + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
  return level;
}

function drawScaleBarOverlay(context, box, imageWidth) {
  if (!Array.isArray(box) || box.length < 4) {
    return false;
  }

  const [x, y, width, height] = box;
  const lineWidth = Math.max(2, Math.round(imageWidth / 420));
  const label = "Scale bar";
  const labelFontSize = Math.max(12, Math.round(imageWidth / 42));

  context.save();
  context.lineWidth = lineWidth;
  context.strokeStyle = "rgba(38, 208, 124, 0.98)";
  context.fillStyle = "rgba(38, 208, 124, 0.14)";
  context.strokeRect(x, y, width, height);
  context.fillRect(x, y, width, height);

  context.font = `600 ${labelFontSize}px "Manrope", sans-serif`;
  const textWidth = context.measureText(label).width;
  const pillHeight = labelFontSize + 8;
  const pillWidth = textWidth + 16;
  const pillX = Math.max(6, Math.min(x, imageWidth - pillWidth - 6));
  const pillY = y >= pillHeight + 8 ? y - pillHeight - 4 : y + height + 4;

  context.fillStyle = "rgba(12, 19, 17, 0.88)";
  context.fillRect(pillX, pillY, pillWidth, pillHeight);
  context.fillStyle = "rgba(193, 255, 224, 0.98)";
  context.fillText(label, pillX + 8, pillY + pillHeight - 7);
  context.restore();
  return true;
}

function drawRectangleSeedPoints(context, points, imageWidth) {
  if (!Array.isArray(points) || points.length === 0) {
    return;
  }

  const lineWidth = Math.max(2, Math.round(imageWidth / 420));
  context.save();
  context.lineWidth = lineWidth;
  context.strokeStyle = "rgba(30, 218, 106, 0.98)";
  context.fillStyle = "rgba(30, 218, 106, 0.95)";
  context.setLineDash([]);

  points.forEach((point, index) => {
    const radius = Math.max(4, lineWidth * 1.8);
    context.beginPath();
    context.arc(point[0], point[1], radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(255, 255, 255, 0.98)";
    context.font = `${Math.max(11, lineWidth * 4)}px Manrope, sans-serif`;
    context.fillText(String(index + 1), point[0] + radius + 2, point[1] - radius - 2);
    context.fillStyle = "rgba(30, 218, 106, 0.95)";
  });

  if (points.length >= 2) {
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (let index = 1; index < points.length; index += 1) {
      context.lineTo(points[index][0], points[index][1]);
    }
    if (points.length === 4) {
      context.closePath();
      context.fillStyle = "rgba(30, 218, 106, 0.12)";
      context.fill();
    }
    context.stroke();
  }
  context.restore();
}

function listMeta(index) {
  const row = state.results[index];
  if (!row) {
    return "Not analyzed yet";
  }
  if (row.error) {
    return `Error: ${row.error}`;
  }

  const modeLabel = row.mode === "platelet" ? "platelets/rods" : "dots";
  const excludedCount = getExcludedCount(row);
  if (excludedCount > 0) {
    return `Accepted ${modeLabel}: ${row.count} (${excludedCount} excluded)`;
  }
  return `Accepted ${modeLabel}: ${row.count}`;
}

function filteredFiles() {
  const query = state.fileFilter.trim().toLowerCase();
  return state.files
    .map((file, index) => ({ file, index }))
    .filter(({ file, index }) => {
      if (!query) {
        return true;
      }
      return file.name.toLowerCase().includes(query) || listMeta(index).toLowerCase().includes(query);
    });
}

function renderFileList() {
  fileList.innerHTML = "";

  if (state.files.length === 0) {
    const empty = document.createElement("div");
    empty.className = "file-item empty";
    empty.textContent = "No files queued yet.";
    fileList.appendChild(empty);
    return;
  }

  const visibleFiles = filteredFiles();
  if (visibleFiles.length === 0) {
    const empty = document.createElement("div");
    empty.className = "file-item empty";
    empty.textContent = "No files match the current search.";
    fileList.appendChild(empty);
    return;
  }

  visibleFiles.forEach(({ file, index }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "file-item";
    if (index === state.selectedIndex) {
      button.classList.add("active");
    }

    button.textContent = file.name;

    const meta = document.createElement("span");
    meta.className = "file-meta";
    meta.textContent = listMeta(index);
    button.appendChild(meta);

    button.addEventListener("click", () => {
      state.selectedIndex = index;
      state.selectedOverlayIndex = -1;
      resetRectangleEditState();
      resetFftWorkspace();
      renderFileList();
      renderHistogram();
      drawPreview(index);
      logConsole("Preview selected", `${file.name} moved into the live preview panel.`, "info");
    });

    fileList.appendChild(button);
  });
}

async function drawPreview(index) {
  const generation = ++drawGeneration;

  if (index < 0 || index >= state.files.length) {
    previewTitle.textContent = "No image selected";
    previewHint.textContent = "Select image files to preview. After analysis, detected objects are drawn in red.";
    if (previewStatusLabel) {
      previewStatusLabel.textContent = "Idle";
    }
    clearCanvas();
    syncPreviewZoom();
    updateDotControls();
    return;
  }

  const file = state.files[index];
  previewTitle.textContent = file.name;

  const url = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImageFromUrl(url);
  } catch (error) {
    URL.revokeObjectURL(url);
    previewHint.textContent = error.message;
    if (previewStatusLabel) {
      previewStatusLabel.textContent = "Preview error";
    }
    clearCanvas();
    syncPreviewZoom();
    updateDotControls();
    return;
  }
  URL.revokeObjectURL(url);

  if (generation !== drawGeneration) {
    return;
  }

  const context = previewCanvas.getContext("2d");
  previewCanvas.width = image.naturalWidth;
  previewCanvas.height = image.naturalHeight;
  syncPreviewZoom();
  context.drawImage(image, 0, 0);

  if (state.previewLayer !== "overlay" && state.previewLayer !== "original") {
    state.previewLayer = "overlay";
  }

  if (state.previewLayer === "original") {
    drawFftRoiOverlay(context, image.naturalWidth);
    previewHint.textContent = "Original view: raw selected image without detection overlay.";
    if (previewStatusLabel) {
      previewStatusLabel.textContent = "Original";
    }
    updateDotControls();
    return;
  }

  const row = state.results[index];
  if (!row) {
    drawRectangleSeedPoints(context, state.rectangleSeed.points, image.naturalWidth);
    drawFftRoiOverlay(context, image.naturalWidth);
    previewHint.textContent = "Preview loaded. Run analysis to draw detected objects.";
    if (previewStatusLabel) {
      previewStatusLabel.textContent = state.rectangleSeed.captureActive
        ? `Seed ${state.rectangleSeed.points.length}/4`
        : "Queued";
    }
    updateDotControls();
    return;
  }

  if (row.error) {
    drawFftRoiOverlay(context, image.naturalWidth);
    previewHint.textContent = `Analysis error: ${row.error}`;
    if (previewStatusLabel) {
      previewStatusLabel.textContent = "Error";
    }
    updateDotControls();
    return;
  }

  const lineWidth = Math.max(2, Math.round(image.naturalWidth / 320));
  const rectangleLineWidth = Math.max(1, lineWidth * 0.7);
  const selectedRectangleLineWidth = Math.max(1.2, (lineWidth + 2) * 0.7);
  const hasScaleBarOverlay = drawScaleBarOverlay(context, row.scale_bar_box, image.naturalWidth);
  const excludedCount = getExcludedCount(row);
  const excluded = rowExcludedSet(row);
  drawRectangleSeedPoints(
    context,
    Array.isArray(row._rawSeedPoints) && row._rawSeedPoints.length > 0 ? row._rawSeedPoints : state.rectangleSeed.points,
    image.naturalWidth
  );

  if (Array.isArray(row._rawRotatedBoxes) && row._rawRotatedBoxes.length > 0) {
    row._rawRotatedBoxes.forEach((polygon, polygonIndex) => {
      if (!Array.isArray(polygon) || polygon.length < 4) {
        return;
      }
      setOverlayStroke(context, rectangleLineWidth, excluded.has(polygonIndex));
      drawPolygonPath(context, polygon);
      context.stroke();
      if (polygonIndex === state.selectedOverlayIndex) {
        context.setLineDash([]);
        context.lineWidth = selectedRectangleLineWidth;
        context.strokeStyle = "rgba(255, 214, 92, 0.98)";
        drawPolygonPath(context, polygon);
        context.stroke();
        drawRectangleEditHandles(context, polygon, image.naturalWidth);
      }
    });
    drawRectangleSeedPoints(
      context,
      Array.isArray(row._rawSeedPoints) && row._rawSeedPoints.length > 0 ? row._rawSeedPoints : state.rectangleSeed.points,
      image.naturalWidth
    );
    context.setLineDash([]);
    drawFftRoiOverlay(context, image.naturalWidth);
    previewHint.textContent = hasScaleBarOverlay
      ? "Green box marks the detected scale bar. Red outlines are counted objects, gray dashed outlines are excluded. Selected rectangles can be moved, resized, or rotated."
      : "Red outlines are counted objects, gray dashed outlines are excluded. Selected rectangles can be moved, resized, or rotated.";
    if (previewStatusLabel) {
      previewStatusLabel.textContent = excludedCount > 0
        ? `${row.count} accepted / ${excludedCount} excluded`
        : `${row.count} accepted`;
    }
    updateDotControls();
    return;
  }

  if (Array.isArray(row._rawBoxes) && row._rawBoxes.length > 0) {
    row._rawBoxes.forEach((box, boxIndex) => {
      setOverlayStroke(context, rectangleLineWidth, excluded.has(boxIndex));
      context.strokeRect(box[0], box[1], box[2], box[3]);
    });
    drawRectangleSeedPoints(
      context,
      Array.isArray(row._rawSeedPoints) && row._rawSeedPoints.length > 0 ? row._rawSeedPoints : state.rectangleSeed.points,
      image.naturalWidth
    );
    context.setLineDash([]);
    drawFftRoiOverlay(context, image.naturalWidth);
    previewHint.textContent = hasScaleBarOverlay
      ? "Green box marks the detected scale bar. Red boxes are counted objects, gray dashed boxes are excluded. Click a box to toggle inclusion."
      : "Red boxes are counted objects, gray dashed boxes are excluded. Click a box to toggle inclusion.";
    if (previewStatusLabel) {
      previewStatusLabel.textContent = excludedCount > 0
        ? `${row.count} accepted / ${excludedCount} excluded`
        : `${row.count} accepted`;
    }
    return;
  }

  if (Array.isArray(row._rawCircles) && row._rawCircles.length > 0) {
    row._rawCircles.forEach((circle, circleIndex) => {
      setOverlayStroke(context, lineWidth, excluded.has(circleIndex));
      context.beginPath();
      context.arc(circle[0], circle[1], circle[2], 0, Math.PI * 2);
      context.stroke();
      if (circleIndex === state.selectedOverlayIndex) {
        context.setLineDash([]);
        context.lineWidth = lineWidth + 2;
        context.strokeStyle = "rgba(255, 214, 92, 0.98)";
        context.beginPath();
        context.arc(circle[0], circle[1], circle[2] + Math.max(3, lineWidth * 1.4), 0, Math.PI * 2);
        context.stroke();
      }
    });
    context.setLineDash([]);
    drawFftRoiOverlay(context, image.naturalWidth);
    previewHint.textContent = hasScaleBarOverlay
      ? "Green box marks the detected scale bar. Red circles are counted objects, gray dashed circles are excluded. Click a circle to select it; use the controls to resize or exclude."
      : "Red circles are counted objects, gray dashed circles are excluded. Click a circle to select it; use the controls to resize or exclude.";
    if (previewStatusLabel) {
      previewStatusLabel.textContent = excludedCount > 0
        ? `${row.count} accepted / ${excludedCount} excluded`
        : `${row.count} accepted`;
    }
    updateDotControls();
    return;
  }

  drawFftRoiOverlay(context, image.naturalWidth);
  previewHint.textContent = hasScaleBarOverlay
    ? "Green box marks the detected scale bar. No objects passed the current thresholds."
    : "No objects passed the current thresholds.";
  if (previewStatusLabel) {
    previewStatusLabel.textContent = "Accepted 0";
  }
  updateDotControls();
}

function syncDashboardMeta() {
  updateSessionStats();
  if (modeBadge) {
    modeBadge.textContent = currentModeLabel();
  }
  if (modeCompact) {
    modeCompact.textContent = currentModeShortLabel();
  }
}

imagesInput.addEventListener("change", () => {
  state.files = Array.from(imagesInput.files || []);
  state.results = [];
  state.fileFilter = "";
  state.selectedOverlayIndex = -1;
  resetRectangleEditState();
  state.rectangleSeed.points = [];
  state.rectangleSeed.captureActive = false;
  if (fileSearchInput) {
    fileSearchInput.value = "";
  }
  state.selectedIndex = state.files.length > 0 ? 0 : -1;
  errorMessage.textContent = "";
  resetFftWorkspace();
  updateSessionStats();
  renderFileList();
  drawPreview(state.selectedIndex);
  setActionButtonsState();
  updateDotControls();
  renderHistogram();

  logConsole(
    "Files queued",
    state.files.length === 0
      ? "No files are currently selected."
      : `${state.files.length} file(s) added to the queue.`,
    "info"
  );
});

targetShape.addEventListener("change", () => {
  state.rectangleSeed.captureActive = false;
  state.selectedOverlayIndex = -1;
  resetRectangleEditState();
  setShapeThresholdPanel();
  drawPreview(state.selectedIndex);
});

shapeTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const nextShape = tab.dataset.shapeTab;
    if (nextShape === targetShape.value) {
      return;
    }
    targetShape.value = nextShape;
    state.rectangleSeed.captureActive = false;
    state.selectedOverlayIndex = -1;
    resetRectangleEditState();
    setShapeThresholdPanel();
    drawPreview(state.selectedIndex);
  });
});

if (advancedSettingsToggle) {
  advancedSettingsToggle.addEventListener("click", () => {
    const expanded = advancedSettingsToggle.getAttribute("aria-expanded") !== "true";
    syncAdvancedSettingsToggle(expanded);
  });
}

previewLayerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.previewLayer = button.dataset.previewLayer || "overlay";
  previewLayerButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
    drawPreview(state.selectedIndex);
  });
});

if (zoomOutBtn) {
  zoomOutBtn.addEventListener("click", () => {
    setPreviewZoom((state.previewZoom || 1) / 1.35);
  });
}

if (zoomInBtn) {
  zoomInBtn.addEventListener("click", () => {
    setPreviewZoom((state.previewZoom || 1) * 1.35);
  });
}

if (zoomResetBtn) {
  zoomResetBtn.addEventListener("click", () => {
    setPreviewZoom(1);
  });
}

previewCanvas.addEventListener("wheel", (event) => {
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }
  event.preventDefault();
  setPreviewZoom((state.previewZoom || 1) * (event.deltaY < 0 ? 1.18 : 1 / 1.18));
}, { passive: false });

previewCanvas.addEventListener("mousedown", (event) => {
  if (state.fft.captureActive) {
    const point = getCanvasCoordinates(event);
    if (!point) {
      return;
    }
    event.preventDefault();
    state.fft.dragStart = point;
    state.fft.draftRoi = { x: point.x, y: point.y, width: 0, height: 0 };
    drawPreview(state.selectedIndex);
    return;
  }

  if (beginRectangleEdit(event)) {
    event.preventDefault();
  }
});

previewCanvas.addEventListener("mousemove", (event) => {
  if (state.fft.captureActive && state.fft.dragStart) {
    const point = getCanvasCoordinates(event);
    if (!point) {
      return;
    }
    state.fft.draftRoi = normalizedRoiFromPoints(state.fft.dragStart, point);
    drawPreview(state.selectedIndex);
    return;
  }

  if (updateRectangleEdit(event)) {
    event.preventDefault();
    return;
  }

  updateRectangleEditCursor(event);
});

previewCanvas.addEventListener("mouseup", (event) => {
  if (finishRectangleEdit(event)) {
    return;
  }

  if (!state.fft.captureActive || !state.fft.dragStart) {
    return;
  }
  const point = getCanvasCoordinates(event);
  if (!point) {
    return;
  }
  event.preventDefault();
  const roi = normalizedRoiFromPoints(state.fft.dragStart, point);
  state.fft.dragStart = null;
  state.fft.draftRoi = null;
  state.fft.suppressNextClick = true;

  if (roi.width < 64 || roi.height < 64) {
    if (fftStatus) {
      fftStatus.textContent = "FFT ROI must be at least 64 x 64 px.";
    }
    logConsole("FFT ROI too small", "Drag a region at least 64 x 64 px.", "error");
    updateFftControls();
    drawPreview(state.selectedIndex);
    return;
  }

  state.fft.roi = roi;
  state.fft.result = null;
  state.fft.manualPeaks = [];
  state.fft.captureActive = false;
  drawFftCanvas();
  updateFftControls();
  drawPreview(state.selectedIndex);
  logConsole("FFT ROI selected", `${roi.width} x ${roi.height} px region ready for FFT.`, "info");
});

previewCanvas.addEventListener("mouseleave", () => {
  if (!state.rectangleEdit.active && previewCanvas) {
    previewCanvas.style.cursor = "";
  }
});

window.addEventListener("mouseup", (event) => {
  finishRectangleEdit(event);
});

[boundaryFitPreset, contrastPreset, noiseCleanupPreset, shapeStrictnessPreset].forEach((select) => {
  if (!select) {
    return;
  }
  select.addEventListener("change", () => {
    applyGuidedTuning();
    drawPreview(state.selectedIndex);
  });
});

form.querySelectorAll("input, select").forEach((control) => {
  control.addEventListener("input", () => {
    if (state.previewLayer === "preprocessed" || state.previewLayer === "mask") {
      drawPreview(state.selectedIndex);
    }
  });
});

if (fileSearchInput) {
  fileSearchInput.addEventListener("input", () => {
    state.fileFilter = fileSearchInput.value;
    renderFileList();
  });
}

if (knownNmInput) {
  knownNmInput.addEventListener("input", () => {
    syncDashboardMeta();
  });
}

previewCanvas.addEventListener("click", (event) => {
  if (state.fft.suppressNextClick) {
    state.fft.suppressNextClick = false;
    return;
  }
  if (state.rectangleEdit.suppressNextClick) {
    state.rectangleEdit.suppressNextClick = false;
    return;
  }
  if (state.fft.captureActive) {
    return;
  }

  if (state.rectangleSeed.captureActive && targetShape.value === "platelet") {
    const point = getCanvasCoordinates(event);
    if (!point) {
      return;
    }
    state.rectangleSeed.points.push([point.x, point.y]);
    if (state.rectangleSeed.points.length >= 4) {
      state.rectangleSeed.points = orderRectangleSeedPoints(state.rectangleSeed.points.slice(0, 4));
      state.rectangleSeed.captureActive = false;
      logConsole("Rectangle seed ready", "Four seed corners were captured. Run Auto-Detect to use the seed detector.", "success");
    } else {
      logConsole("Rectangle seed point", `Captured corner ${state.rectangleSeed.points.length}/4.`, "info");
    }
    updateRectangleSeedControls();
    drawPreview(state.selectedIndex);
    return;
  }

  const row = state.results[state.selectedIndex];
  if (!row || row.error) {
    return;
  }

  const point = getCanvasCoordinates(event);
  if (!point) {
    return;
  }

  const overlayIndex = findOverlayIndexAtPoint(row, point.x, point.y);
  if (overlayIndex < 0) {
    setSelectedOverlayIndex(-1);
    drawPreview(state.selectedIndex);
    return;
  }

  if (row.mode === "spherical" && Array.isArray(row._rawCircles) && row._rawCircles.length > 0 && !event.shiftKey && !event.altKey) {
    setSelectedOverlayIndex(overlayIndex);
    drawPreview(state.selectedIndex);
    logConsole("Dot selected", `${row.name}: dot ${overlayIndex + 1} ready for radius adjustment.`, "info");
    return;
  }

  if (row.mode === "platelet" && Array.isArray(row._rawRotatedBoxes) && row._rawRotatedBoxes.length > 0 && !event.shiftKey && !event.altKey) {
    setSelectedOverlayIndex(overlayIndex);
    drawPreview(state.selectedIndex);
    logConsole("Rectangle selected", `${row.name}: rect ${overlayIndex + 1} ready for drag correction.`, "info");
    return;
  }

  const excludedNow = toggleRowExclusion(row, overlayIndex);
  updateDerivedViews();
  drawPreview(state.selectedIndex);

  logConsole(
    excludedNow ? "Detection excluded" : "Detection restored",
    `${row.name}: item ${overlayIndex + 1} ${excludedNow ? "removed from" : "restored to"} accepted measurements.`,
    "info"
  );
});

if (startRectangleSeedBtn) {
  startRectangleSeedBtn.addEventListener("click", () => {
    if (targetShape.value !== "platelet") {
      return;
    }
    state.rectangleSeed.points = [];
    state.rectangleSeed.captureActive = true;
    state.results = [];
    state.selectedOverlayIndex = -1;
    resetRectangleEditState();
    updateRectangleSeedControls();
    renderHistogram();
    drawPreview(state.selectedIndex);
    logConsole("Rectangle seed started", "Click four corners of one representative rod/NPL in the preview.", "info");
  });
}

if (resetRectangleSeedBtn) {
  resetRectangleSeedBtn.addEventListener("click", () => {
    state.rectangleSeed.points = [];
    state.rectangleSeed.captureActive = false;
    updateRectangleSeedControls();
    drawPreview(state.selectedIndex);
    logConsole("Rectangle seed reset", "Seed points were cleared.", "info");
  });
}

if (startFftRoiBtn) {
  startFftRoiBtn.addEventListener("click", () => {
    if (state.selectedIndex < 0 || state.selectedIndex >= state.files.length) {
      return;
    }
    state.rectangleSeed.captureActive = false;
    state.fft.captureActive = true;
    state.fft.dragStart = null;
    state.fft.draftRoi = null;
    state.fft.result = null;
    state.fft.manualPeaks = [];
    drawFftCanvas();
    drawInverseFftCanvas();
    updateRectangleSeedControls();
    updateFftControls();
    drawPreview(state.selectedIndex);
    logConsole("FFT ROI picking", "Drag one rectangular lattice area on the preview.", "info");
  });
}

if (resetFftBtn) {
  resetFftBtn.addEventListener("click", () => {
    resetFftWorkspace();
    drawPreview(state.selectedIndex);
    logConsole("FFT ROI reset", "The current FFT ROI and result were cleared.", "info");
  });
}

if (runFftBtn) {
  runFftBtn.addEventListener("click", () => {
    runFftAnalysis();
  });
}

if (saveFftResultBtn) {
  saveFftResultBtn.addEventListener("click", async () => {
    saveFftResultBtn.disabled = true;
    saveFftResultBtn.textContent = "Saving...";
    try {
      const sample = await buildFftSample();
      await putFftSample(sample);
      await refreshFftSavedCount();
      logConsole(
        "FFT result saved",
        `${sample.image_name}: d-spacing ${toFixedOrDash(sample.d_spacing_nm)} nm stored in FFT session DB.`,
        "success"
      );
    } catch (error) {
      logConsole("FFT save failed", error.message || String(error), "error");
    } finally {
      saveFftResultBtn.textContent = "Save FFT Result";
      updateFftControls();
    }
  });
}

if (exportFftCsvBtn) {
  exportFftCsvBtn.addEventListener("click", async () => {
    exportFftCsvBtn.disabled = true;
    try {
      await exportFftCsv();
    } catch (error) {
      logConsole("FFT CSV failed", error.message || String(error), "error");
    } finally {
      updateFftControls();
    }
  });
}

[
  fftDisplayMin,
  fftDisplayMax,
  fftDisplayBrightness,
  fftDisplayContrast,
].forEach((control) => {
  if (!control) {
    return;
  }
  control.addEventListener("input", () => {
    setFftDisplayFromControls();
  });
});

if (fftOverlayToggle) {
  fftOverlayToggle.addEventListener("change", async () => {
    state.fft.showOverlay = fftOverlayToggle.checked;
    await drawFftCanvas();
    logConsole(
      state.fft.showOverlay ? "FFT overlay shown" : "FFT overlay hidden",
      state.fft.showOverlay
        ? "FFT candidate peaks and selected pair are visible."
        : "Showing only the FFT magnitude image.",
      "info"
    );
  });
}

if (fftDisplayApplyBtn) {
  fftDisplayApplyBtn.addEventListener("click", async () => {
    setFftDisplayFromControls();
    await drawFftCanvas();
    logConsole("FFT display applied", "Brightness and contrast display settings were applied to the FFT magnitude preview.", "info");
  });
}

if (fftDisplayResetBtn) {
  fftDisplayResetBtn.addEventListener("click", async () => {
    resetFftDisplay();
    await drawFftCanvas();
    logConsole("FFT display reset", "FFT preview display range returned to default.", "info");
  });
}

if (fftDisplayAutoBtn) {
  fftDisplayAutoBtn.addEventListener("click", async () => {
    await autoFftDisplayRange();
    logConsole("FFT display auto", "FFT preview display range was adjusted from the current FFT image.", "info");
  });
}

if (ifftMaskRadius) {
  ifftMaskRadius.addEventListener("input", () => {
    syncIfftControls();
    drawFftCanvas();
    updateFftControls();
  });
}

if (ifftMode) {
  ifftMode.addEventListener("change", () => {
    syncIfftControls();
    drawFftCanvas();
    updateFftControls();
    if (state.fft.result) {
      logConsole("IFFT mode changed", "Apply IFFT to refresh the inverse FFT preview with the current peak pair.", "info");
    }
  });
}

if (applyIfftBtn) {
  applyIfftBtn.addEventListener("click", () => {
    applyIfftSettings();
  });
}

if (fftCanvas) {
  fftCanvas.addEventListener("click", async (event) => {
    if (!state.fft.result) {
      return;
    }
    const point = fftCanvasCoordinates(event);
    if (!point) {
      return;
    }
    const snappedPeak = nearestFftPeak(point, 14);
    const peak = snappedPeak
      ? {
        x: snappedPeak.x,
        y: snappedPeak.y,
        intensity: snappedPeak.intensity,
        snapped: true,
      }
      : {
        x: point.x,
        y: point.y,
        intensity: nearestFftPeakIntensity(point),
        snapped: false,
      };
    state.fft.manualPeaks.push(peak);
    if (state.fft.manualPeaks.length > 2) {
      state.fft.manualPeaks = [peak];
    }
    if (state.fft.manualPeaks.length === 2) {
      try {
        await rerunFftWithManualPeakPair();
        logConsole(
          "FFT peaks adjusted",
          `Manual pair gives d-spacing ${toFixedOrDash(state.fft.result?.d_spacing_nm)} nm.`,
          "info"
        );
      } catch (error) {
        logConsole("FFT peak update failed", error.message || String(error), "error");
      }
    } else if (fftStatus) {
      fftStatus.textContent = "Manual peak 1/2 selected. Click the opposite peak.";
    }
    await drawFftCanvas();
    await drawInverseFftCanvas();
    updateFftControls();
  });
}

if (fftFrequencyProfileCanvas) {
  const profileKind = "frequency";

  fftFrequencyProfileCanvas.addEventListener("pointerdown", (event) => {
    const point = profileCanvasCoordinates(fftFrequencyProfileCanvas, event);
    const scale = profileScaleForKind(profileKind);
    const mode = profilePointZone(point, scale);
    if (!point || !scale || !mode) {
      return;
    }
    startProfileAxisDrag(profileKind, event, point, mode);
  });

  fftFrequencyProfileCanvas.addEventListener("pointermove", (event) => {
    const point = profileCanvasCoordinates(fftFrequencyProfileCanvas, event);
    if (!point) {
      return;
    }
    if (state.fft.profileAxisDrag.active && state.fft.profileAxisDrag.kind === profileKind) {
      event.preventDefault();
      updateProfileAxisDrag(profileKind, point);
      return;
    }
    const scale = profileScaleForKind(profileKind);
    fftFrequencyProfileCanvas.style.cursor = profilePointZone(point, scale) ? "grab" : "default";
  });

  const finishFrequencyProfileDrag = (event) => {
    finishProfileAxisDrag(profileKind, event);
  };

  fftFrequencyProfileCanvas.addEventListener("pointerup", finishFrequencyProfileDrag);
  fftFrequencyProfileCanvas.addEventListener("pointercancel", finishFrequencyProfileDrag);
  fftFrequencyProfileCanvas.addEventListener("wheel", (event) => {
    const point = profileCanvasCoordinates(fftFrequencyProfileCanvas, event);
    if (point) {
      zoomProfileAxis(profileKind, event, point);
    }
  }, { passive: false });
  fftFrequencyProfileCanvas.addEventListener("dblclick", () => {
    resetProfileAxisView(profileKind);
  });
}

if (fftProfileCanvas) {
  fftProfileCanvas.addEventListener("pointerdown", (event) => {
    const profile = state.fft.result?.inverse_intensity_profile || state.fft.result?.intensity_profile;
    if (!profile) {
      return;
    }
    const point = fftProfileCanvasCoordinates(event);
    if (!point) {
      return;
    }
    const scale = profileScaleForKind("inverse");
    const handleIndex = profileSpanHandleAtPoint(point, profile);
    if (handleIndex < 0) {
      const mode = profilePointZone(point, scale);
      if (mode) {
        startProfileAxisDrag("inverse", event, point, mode);
      }
      return;
    }
    event.preventDefault();
    state.fft.profileDrag = {
      active: true,
      handleIndex,
      pointerId: event.pointerId,
      moved: false,
    };
    try {
      fftProfileCanvas.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is optional; dragging still works without it.
    }
    fftProfileCanvas.style.cursor = "grabbing";
  });

  fftProfileCanvas.addEventListener("pointermove", (event) => {
    const profile = state.fft.result?.inverse_intensity_profile || state.fft.result?.intensity_profile;
    const point = fftProfileCanvasCoordinates(event);
    if (!profile || !point) {
      return;
    }
    if (!state.fft.profileDrag.active) {
      if (state.fft.profileAxisDrag.active && state.fft.profileAxisDrag.kind === "inverse") {
        event.preventDefault();
        updateProfileAxisDrag("inverse", point);
        return;
      }
      const scale = profileScaleForKind("inverse");
      const handleIndex = profileSpanHandleAtPoint(point, profile);
      fftProfileCanvas.style.cursor = handleIndex >= 0 || profilePointZone(point, scale) ? "grab" : "default";
      return;
    }
    event.preventDefault();
    const profilePoint = profilePointFromCanvas(point, profile, { snapToPeak: true });
    if (!profilePoint) {
      return;
    }
    if (setProfileSpanHandle(state.fft.profileDrag.handleIndex, profilePoint)) {
      state.fft.profileDrag.moved = true;
      if (fftStatus) {
        fftStatus.textContent = "Dragging inverse FFT span endpoint. Release to apply the adjusted spacing.";
      }
      drawFftProfileCanvas();
    }
  });

  const finishProfileSpanDrag = async (event) => {
    if (!state.fft.profileDrag.active) {
      return;
    }
    event.preventDefault();
    const moved = state.fft.profileDrag.moved;
    state.fft.profileDrag = {
      active: false,
      handleIndex: -1,
      pointerId: null,
      moved: false,
    };
    try {
      fftProfileCanvas.releasePointerCapture(event.pointerId);
    } catch {
      // Ignore pointer capture release failures from cancelled gestures.
    }
    fftProfileCanvas.style.cursor = "grab";

    if (moved && sortedProfilePeakPair(state.fft.profilePeaks)) {
      try {
        await applyManualProfilePeaks();
        logConsole(
          "Profile span adjusted",
          `Adjusted inverse FFT span gives d-spacing ${toFixedOrDash(state.fft.result?.d_spacing_nm)} nm.`,
          "info"
        );
      } catch (error) {
        logConsole("Profile span update failed", error.message || String(error), "error");
      }
    }
    drawFftFrequencyProfileCanvas();
    drawFftProfileCanvas();
    updateFftControls();
  };

  const finishInverseProfileInteraction = async (event) => {
    if (state.fft.profileDrag.active) {
      await finishProfileSpanDrag(event);
      return;
    }
    finishProfileAxisDrag("inverse", event);
  };

  fftProfileCanvas.addEventListener("pointerup", finishInverseProfileInteraction);
  fftProfileCanvas.addEventListener("pointercancel", finishInverseProfileInteraction);
  fftProfileCanvas.addEventListener("wheel", (event) => {
    const point = fftProfileCanvasCoordinates(event);
    if (point) {
      zoomProfileAxis("inverse", event, point);
    }
  }, { passive: false });
  fftProfileCanvas.addEventListener("dblclick", () => {
    resetProfileAxisView("inverse");
  });
}

if (radiusMinusBtn) {
  radiusMinusBtn.addEventListener("click", () => {
    adjustSelectedDotRadius(-1);
  });
}

if (radiusPlusBtn) {
  radiusPlusBtn.addEventListener("click", () => {
    adjustSelectedDotRadius(1);
  });
}

if (centerLeftBtn) {
  centerLeftBtn.addEventListener("click", () => {
    adjustSelectedDotCenter(-1, 0);
  });
}

if (centerRightBtn) {
  centerRightBtn.addEventListener("click", () => {
    adjustSelectedDotCenter(1, 0);
  });
}

if (centerUpBtn) {
  centerUpBtn.addEventListener("click", () => {
    adjustSelectedDotCenter(0, -1);
  });
}

if (centerDownBtn) {
  centerDownBtn.addEventListener("click", () => {
    adjustSelectedDotCenter(0, 1);
  });
}

if (toggleSelectedDotBtn) {
  toggleSelectedDotBtn.addEventListener("click", () => {
    const selection = selectedOverlayInfo();
    if (!selection) {
      return;
    }
    const excludedNow = toggleRowExclusion(selection.row, selection.index);
    updateDerivedViews();
    drawPreview(state.selectedIndex);
    const itemLabel = selection.kind === "rectangle" ? "rect" : "dot";
    logConsole(
      excludedNow ? "Detection excluded" : "Detection restored",
      `${selection.row.name}: ${itemLabel} ${selection.index + 1} ${excludedNow ? "removed from" : "restored to"} verified candidates.`,
      "info"
    );
  });
}

if (saveVerifiedSampleBtn) {
  saveVerifiedSampleBtn.addEventListener("click", async () => {
    const row = currentSelectedRow();
    const file = state.files[state.selectedIndex];
    if (!row || row.error || !file) {
      return;
    }
    if (row.mode !== "spherical") {
      logConsole("Verified save skipped", "Verified training samples are currently defined for spherical dot mode.", "error");
      return;
    }

    saveVerifiedSampleBtn.disabled = true;
    saveVerifiedSampleBtn.textContent = "Saving...";
    try {
      const sample = await buildVerifiedSample(row, file);
      await putVerifiedSample(sample);
      await refreshVerifiedSampleCount();
      logConsole(
        "Verified sample saved",
        `${file.name}: ${sample.summary.accepted_count} accepted dot(s), ${sample.summary.excluded_count} excluded dot(s) stored in local IndexedDB.`,
        "success"
      );
    } catch (error) {
      logConsole("Verified save failed", error.message || String(error), "error");
    } finally {
      saveVerifiedSampleBtn.textContent = "Save Verified Sample";
      updateDotControls();
    }
  });
}

if (histogramCanvas) {
  histogramCanvas.addEventListener("pointerdown", (event) => {
    const plot = state.histogramView.lastPlot;
    const point = histogramCanvasPoint(event);
    if (!histogramPointInPlot(point, plot)) {
      return;
    }
    state.histogramView.dragStartX = point.x;
    state.histogramView.dragCurrentX = point.x;
    histogramCanvas.setPointerCapture(event.pointerId);
    renderHistogram();
  });

  histogramCanvas.addEventListener("pointermove", (event) => {
    if (state.histogramView.dragStartX === null) {
      return;
    }
    const point = histogramCanvasPoint(event);
    if (!point) {
      return;
    }
    const plot = state.histogramView.lastPlot;
    state.histogramView.dragCurrentX = Math.max(
      plot.padding.left,
      Math.min(plot.padding.left + plot.plotWidth, point.x)
    );
    renderHistogram();
  });

  const finishHistogramDrag = (event) => {
    if (state.histogramView.dragStartX === null) {
      return;
    }
    const startX = state.histogramView.dragStartX;
    const endX = state.histogramView.dragCurrentX ?? startX;
    const startValue = histogramValueFromX(startX);
    const endValue = histogramValueFromX(endX);
    const pixelSpan = Math.abs(endX - startX);
    state.histogramView.dragStartX = null;
    state.histogramView.dragCurrentX = null;
    if (pixelSpan >= 6 && startValue !== null && endValue !== null) {
      setHistogramXRange(startValue, endValue);
      logConsole(
        "Histogram view range set",
        `${state.histogramView.xMin?.toFixed?.(2) ?? state.histogramView.xMin} to ${state.histogramView.xMax?.toFixed?.(2) ?? state.histogramView.xMax} nm is shown on the current histogram axis.`,
        "info"
      );
    }
    if (event.pointerId !== undefined && histogramCanvas.hasPointerCapture(event.pointerId)) {
      histogramCanvas.releasePointerCapture(event.pointerId);
    }
    renderHistogram();
    setActionButtonsState();
  };

  histogramCanvas.addEventListener("pointerup", finishHistogramDrag);
  histogramCanvas.addEventListener("pointercancel", finishHistogramDrag);

  histogramCanvas.addEventListener("wheel", (event) => {
    const plot = state.histogramView.lastPlot;
    const point = histogramCanvasPoint(event);
    if (!plot || !point) {
      return;
    }
    const overXAxis = histogramPointOnXAxis(point, plot);
    const overYAxis = histogramPointOnYAxis(point, plot);
    const overPlot = histogramPointInPlot(point, plot);
    if (!overXAxis && !overYAxis && !overPlot) {
      return;
    }
    event.preventDefault();

    if (overYAxis) {
      const currentMax = Math.max(1, state.histogramView.yMax ?? plot.actualMaxCount ?? 1);
      state.histogramView.yMax = histogramMath.nextHistogramYMax(currentMax, event.deltaY);
      renderHistogram();
      return;
    }

    if (overPlot) {
      const nextBinSize = histogramMath.nextHistogramBinSize(plot.binWidth ?? state.histogramBinSize, event.deltaY, {
        minValue: plot.minValue,
        maxValue: plot.maxValue,
        visibleCount: histogramVisibleValues().length,
      });
      state.histogramBinSize = nextBinSize;
      if (histogramBinSizeInput) {
        histogramBinSizeInput.value = formatHistogramBinSizeInput(nextBinSize);
      }
      renderHistogram();
      setActionButtonsState();
      return;
    }

    const fullRange = plot.dataMax - plot.dataMin;
    const currentRange = plot.maxValue - plot.minValue;
    if (!Number.isFinite(fullRange) || fullRange <= 0 || !Number.isFinite(currentRange) || currentRange <= 0) {
      return;
    }

    const ratio = Math.max(0, Math.min(1, (point.x - plot.padding.left) / plot.plotWidth));
    const anchorValue = plot.minValue + ratio * currentRange;
    const zoomFactor = event.deltaY < 0 ? 0.8 : 1.25;
    const nextRange = currentRange * zoomFactor;
    if (nextRange >= fullRange) {
      state.histogramView.xMin = null;
      state.histogramView.xMax = null;
    } else {
      const nextMin = anchorValue - ratio * nextRange;
      const nextMax = anchorValue + (1 - ratio) * nextRange;
      setHistogramXRange(nextMin, nextMax);
    }
    renderHistogram();
    setActionButtonsState();
  }, { passive: false });
}

if (histAxisResetBtn) {
  histAxisResetBtn.addEventListener("click", () => {
    resetHistogramView();
    renderHistogram();
    setActionButtonsState();
    logConsole("Histogram view reset", "Histogram returned to the full accumulated measurement range.", "info");
  });
}

if (histogramBinSizeInput) {
  histogramBinSizeInput.addEventListener("input", () => {
    const value = Number(histogramBinSizeInput.value);
    state.histogramBinSize = Number.isFinite(value) && value > 0 ? value : null;
    renderHistogram();
    setActionButtonsState();
  });
}

histogramAxisButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextAxis = button.dataset.histAxis === "short" ? "short" : "long";
    if (nextAxis === "short" && !hasShortAxisMeasurements()) {
      return;
    }
    state.histogramAxis = nextAxis;
    resetHistogramView();
    renderHistogram();
    setActionButtonsState();
    logConsole("Histogram axis changed", `${histogramAxisLabel(nextAxis)} is now displayed. CSV export still includes both NPL axes.`, "info");
  });
});

if (refreshHistoryBtn) {
  refreshHistoryBtn.addEventListener("click", () => {
    refreshLiveHistory();
  });
}

if (downloadHistogramPng) {
  downloadHistogramPng.addEventListener("click", () => {
    downloadTransparentHistogramPng();
  });
}

downloadCsv.addEventListener("click", () => {
  const exportRows = acceptedMeasurementExportRows();
  if (exportRows.length === 0) {
    return;
  }

  const header = ["source_name", "mode", "measurement_index", "diameter_nm", "long_axis_nm", "short_axis_nm"];
  const rows = [
    header,
    ...exportRows.map((row) => [
      row.sourceName,
      row.mode,
      row.index,
      row.diameterNm,
      row.longAxisNm,
      row.shortAxisNm,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, "NC_measurements_accumulated.csv");

  logConsole(
    "CSV exported",
    `Saved ${exportRows.length} accepted measurement row(s). NPL exports include both long_axis_nm and short_axis_nm regardless of the histogram toggle.`,
    "success"
  );
});

clearDataBtn.addEventListener("click", () => {
  state.historyRows = [];
  state.accumulatedValues = [];
  state.accumulatedShortValues = [];
  state.histogramAxis = "long";
  state.histogramBinSize = null;
  if (histogramBinSizeInput) {
    histogramBinSizeInput.value = "";
  }
  resetHistogramView();
  state.results = [];
  state.nextHistoryId = 1;
  state.selectedOverlayIndex = -1;
  resetRectangleEditState();
  resultRows.innerHTML = "";
  errorMessage.textContent = "";
  renderSummary();
  updateSessionStats();
  setActionButtonsState();
  renderHistogram();
  resultPanel.classList.add("hidden");
  renderFileList();
  drawPreview(state.selectedIndex);

  logConsole("Session cleared", "Saved analysis results were cleared from the current workspace.", "info");
});

if (clearConsoleBtn) {
  clearConsoleBtn.addEventListener("click", () => {
    state.logs = [];
    renderConsole();
  });
}

clearCanvas();
renderSummary();
renderConsole();
setActionButtonsState();
applyGuidedTuning({ emitLog: false });
setShapeThresholdPanel({ emitLog: false });
syncAdvancedSettingsToggle(false);
syncDashboardMeta();
syncPreviewZoom();
renderFileList();
updateDotControls();
drawFftCanvas();
drawInverseFftCanvas();
drawFftFrequencyProfileCanvas();
drawFftProfileCanvas();
syncFftDisplayControls();
updateFftControls();
refreshVerifiedSampleCount();
refreshFftSavedCount();

logConsole("Workspace ready", "NC-TEM analyzer UI loaded. Upload files to begin a batch.", "success");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  setAnalysisSubmitState(true, "Analyzing...");

  logConsole("Analysis started", `${state.files.length} queued file(s) processing with the Python analyzer.`, "info");

  try {
    const formData = new FormData(form);
    const payload = await analyzeFilesWithPython(state.files, formData);
    appendAnalyzePayload(payload);
  } catch (error) {
    errorMessage.textContent = error.message;
    resultPanel.classList.remove("hidden");
    logConsole("Analysis failed", error.message, "error");
  } finally {
    setAnalysisSubmitState(false, "Run Auto-Detect");
  }
});
