import type { ScreenScaleSnapshot } from "./screenScaleContext";

const SUPPORTED_MODES = [
  "contain",
  "cover",
  "stretch",
  "width",
  "height",
  "fixed-height",
  "fixed-width"
];

export function isMicroAppEnvironment() {
  return !!(window as any).__MICRO_APP_ENVIRONMENT__;
}

/** micro-app 子应用内获取真实顶层 window */
export function getRawWindow(): Window {
  const w = window as any;
  if (w.rawWindow) {
    return w.rawWindow as Window;
  }
  if (window.parent && window.parent !== window) {
    return window.parent;
  }
  return window;
}

export function getTopViewportSize() {
  const win = getRawWindow();
  const visualViewport = win.visualViewport;
  if (visualViewport?.width && visualViewport?.height) {
    return {
      width: visualViewport.width,
      height: visualViewport.height
    };
  }

  return {
    width: win.innerWidth,
    height: win.innerHeight
  };
}

/**
 * Teleport 目标：micro-app 下优先挂到真实 document.body，否则子应用 body
 */
export function resolveTeleportTarget(customSelector?: string): string | HTMLElement {
  const rawWindow = getRawWindow();

  const pickFrom = (doc: Document): HTMLElement => {
    if (customSelector) {
      const target = doc.querySelector(customSelector);
      if (target instanceof HTMLElement) {
        return target;
      }
    }
    return doc.body;
  };

  try {
    if (rawWindow.document) {
      return pickFrom(rawWindow.document);
    }
  } catch {
    // 跨域时无法访问 parent document
  }

  if (customSelector) {
    const local = document.querySelector(customSelector);
    if (local instanceof HTMLElement) {
      return local;
    }
  }

  return document.body;
}

function clamp(value: number, minScale: number, maxScale: number) {
  return Math.min(Math.max(value, minScale), maxScale);
}

function getAlignedOffset(remainSize: number, align: string) {
  if (align === "start") {
    return 0;
  }
  if (align === "end") {
    return remainSize;
  }
  return remainSize / 2;
}

function resolveRenderMode(
  scaleX: number,
  scaleY: number,
  renderMode: string | undefined
) {
  if (renderMode === "transform" || renderMode === "zoom") {
    return renderMode;
  }

  const supportsZoom = typeof CSS !== "undefined" && CSS.supports?.("zoom", "1");
  const isUniformScale = Math.abs(scaleX - scaleY) < 0.001;
  const isUpscaling = scaleX > 1.001 || scaleY > 1.001;

  if (supportsZoom && isUniformScale && isUpscaling) {
    return "zoom";
  }

  return "transform";
}

/** teleportDialog 时按顶层屏幕视口计算缩放（与子应用容器无关） */
export function buildViewportScaleSnapshot(options: {
  designWidth: number
  designHeight: number
  scaleMode?: string
  alignX?: string
  alignY?: string
  renderMode?: string
  minScale?: number
  maxScale?: number
  disabledScale?: boolean
}): ScreenScaleSnapshot {
  const {
    designWidth,
    designHeight,
    scaleMode = "fixed-height",
    alignX = "center",
    alignY = "center",
    renderMode,
    minScale = 0,
    maxScale = Infinity,
    disabledScale = false
  } = options;

  const { width: vw, height: vh } = getTopViewportSize();
  const safeWidth = vw > 0 ? vw : designWidth;
  const safeHeight = vh > 0 ? vh : designHeight;

  let scaleX = 1;
  let scaleY = 1;
  let contentWidth = designWidth;
  let contentHeight = designHeight;

  const mode = SUPPORTED_MODES.includes(scaleMode) ? scaleMode : "fixed-height";

  if (!disabledScale) {
    const widthRatio = safeWidth / designWidth;
    const heightRatio = safeHeight / designHeight;

    if (mode === "stretch") {
      scaleX = clamp(widthRatio, minScale, maxScale);
      scaleY = clamp(heightRatio, minScale, maxScale);
    } else if (mode === "cover") {
      const scale = clamp(Math.max(widthRatio, heightRatio), minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "width") {
      const scale = clamp(widthRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "height") {
      const scale = clamp(heightRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "fixed-height") {
      const scale = clamp(heightRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
      contentWidth = safeWidth / scale;
    } else if (mode === "fixed-width") {
      const scale = clamp(widthRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
      contentHeight = safeHeight / scale;
    } else {
      const scale = clamp(Math.min(widthRatio, heightRatio), minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    }
  }

  const scaledWidth = contentWidth * scaleX;
  const scaledHeight = contentHeight * scaleY;
  const offsetX = getAlignedOffset(safeWidth - scaledWidth, alignX);
  const offsetY = getAlignedOffset(safeHeight - scaledHeight, alignY);

  return {
    contentWidth,
    contentHeight,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    anchorX: 0,
    anchorY: 0,
    renderMode: resolveRenderMode(scaleX, scaleY, renderMode),
    basedOnViewport: true
  };
}
