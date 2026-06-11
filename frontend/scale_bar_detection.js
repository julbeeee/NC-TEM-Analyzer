(function attachScaleBarDetection(global) {
  function scaleBarCandidateLimit(width) {
    return Math.max(8, Math.min(24, width * 0.2));
  }

  function componentFillRatio(component, width, height) {
    const area = Number(component?.area);
    if (!Number.isFinite(area) || area <= 0) {
      return 0;
    }
    return area / (width * height);
  }

  function scaleBarCandidateScore(component) {
    const width = Number(component?.bboxWidth);
    const height = Number(component?.bboxHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return null;
    }
    const aspect = width / height;
    const fillRatio = componentFillRatio(component, width, height);
    if (aspect < 3 || aspect > 30) {
      return null;
    }
    if (height < 4 || height > scaleBarCandidateLimit(width)) {
      return null;
    }
    if (fillRatio < 0.25) {
      return null;
    }
    return width + (height * 4) + (fillRatio * 20) - (Math.abs(aspect - 12) * 2);
  }

  function componentBounds(component) {
    return {
      minX: Number(component?.minX),
      maxX: Number(component?.maxX),
      minY: Number(component?.minY),
      maxY: Number(component?.maxY),
      width: Number(component?.bboxWidth),
      height: Number(component?.bboxHeight),
    };
  }

  function looksLikeBoxEdge(component, candidates) {
    const bounds = componentBounds(component);
    if (
      !Number.isFinite(bounds.minX) ||
      !Number.isFinite(bounds.maxX) ||
      !Number.isFinite(bounds.minY) ||
      !Number.isFinite(bounds.maxY)
    ) {
      return false;
    }
    const centerY = (bounds.minY + bounds.maxY) / 2;
    return candidates.some((other) => {
      if (other === component) {
        return false;
      }
      const otherBounds = componentBounds(other);
      const otherCenterY = (otherBounds.minY + otherBounds.maxY) / 2;
      const containsOtherX = bounds.minX <= otherBounds.minX && bounds.maxX >= otherBounds.maxX;
      const hasSideMargin = (otherBounds.minX - bounds.minX) >= 5 && (bounds.maxX - otherBounds.maxX) >= 5;
      const nearOtherRow = Math.abs(centerY - otherCenterY) > 0 && Math.abs(centerY - otherCenterY) <= 80;
      return (
        containsOtherX &&
        hasSideMargin &&
        nearOtherRow &&
        bounds.width >= otherBounds.width * 1.2 &&
        bounds.height <= otherBounds.height
      );
    });
  }

  function brightPanelCandidateScore(component) {
    const width = Number(component?.bboxWidth);
    const height = Number(component?.bboxHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 16 || height < 10) {
      return null;
    }
    const fillRatio = componentFillRatio(component, width, height);
    if (fillRatio < 0.35) {
      return null;
    }
    return (width * height * fillRatio) + width;
  }

  function embeddedDarkBarScore(bar, panel) {
    const barBounds = componentBounds(bar);
    const panelBounds = componentBounds(panel);
    if (
      !Number.isFinite(barBounds.width) ||
      !Number.isFinite(barBounds.height) ||
      !Number.isFinite(panelBounds.width) ||
      !Number.isFinite(panelBounds.height) ||
      barBounds.width <= 0 ||
      barBounds.height <= 0
    ) {
      return null;
    }
    const insidePanel = (
      panelBounds.minX <= barBounds.minX &&
      panelBounds.maxX >= barBounds.maxX &&
      panelBounds.minY <= barBounds.minY &&
      panelBounds.maxY >= barBounds.maxY
    );
    if (!insidePanel) {
      return null;
    }
    const aspect = barBounds.width / barBounds.height;
    const fillRatio = componentFillRatio(bar, barBounds.width, barBounds.height);
    if (barBounds.width < Math.max(12, panelBounds.width * 0.35)) {
      return null;
    }
    if (barBounds.width > panelBounds.width * 0.95) {
      return null;
    }
    if (barBounds.height > Math.max(6, panelBounds.height * 0.2)) {
      return null;
    }
    if (aspect < 8 || fillRatio < 0.4) {
      return null;
    }
    return (barBounds.width * 3) + (fillRatio * 20) - (barBounds.height * 4);
  }

  function chooseEmbeddedScaleBarComponent(panelComponents, darkComponents) {
    if (!Array.isArray(panelComponents) || !Array.isArray(darkComponents)) {
      return null;
    }
    const panels = panelComponents.filter((component) => brightPanelCandidateScore(component) !== null);
    let best = null;
    let bestScore = -Infinity;
    panels.forEach((panel) => {
      darkComponents.forEach((bar) => {
        const score = embeddedDarkBarScore(bar, panel);
        if (score !== null && score > bestScore) {
          best = bar;
          bestScore = score;
        }
      });
    });
    return best;
  }

  function scaleBarExclusionMargin(width, height) {
    return Math.max(4, Math.min(24, Math.max(height * 2, width * 0.75)));
  }

  function scaleBarExclusionTop(imageHeight, scaleBarBox, cropBottomPx) {
    const height = Math.round(Number(imageHeight));
    if (Array.isArray(scaleBarBox) && scaleBarBox.length >= 4) {
      const y = Number(scaleBarBox[1]);
      const width = Number(scaleBarBox[2]);
      const barHeight = Number(scaleBarBox[3]);
      if (
        Number.isFinite(y) &&
        Number.isFinite(width) &&
        Number.isFinite(barHeight) &&
        y > 0 &&
        width > 0 &&
        barHeight > 0
      ) {
        return Math.max(2, Math.min(height, Math.floor(y - scaleBarExclusionMargin(width, barHeight))));
      }
    }
    return height - Math.round(Number(cropBottomPx) || 0);
  }

  function chooseScaleBarComponent(components) {
    if (!Array.isArray(components) || components.length === 0) {
      return null;
    }
    let best = null;
    let bestScore = -Infinity;
    const candidates = components.filter((component) => scaleBarCandidateScore(component) !== null);
    const eligible = candidates.filter((component) => !looksLikeBoxEdge(component, candidates));
    const scoredComponents = eligible.length > 0 ? eligible : components;
    scoredComponents.forEach((component) => {
      const score = scaleBarCandidateScore(component);
      if (score !== null && score > bestScore) {
        best = component;
        bestScore = score;
      }
    });
    if (best) {
      return best;
    }
    return [...components].sort((left, right) => Number(right.area || 0) - Number(left.area || 0))[0] || null;
  }

  const api = {
    chooseEmbeddedScaleBarComponent,
    chooseScaleBarComponent,
    scaleBarExclusionTop,
    scaleBarCandidateScore,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.ScaleBarDetection = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
