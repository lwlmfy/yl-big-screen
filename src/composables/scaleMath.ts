export const SUPPORTED_SCALE_MODES = [
  "contain",
  "cover",
  "stretch",
  "width",
  "height",
  "fixed-height",
  "fixed-width"
] as const;

export type ScaleMode = (typeof SUPPORTED_SCALE_MODES)[number];

export interface ScaleComputeInput {
  containerWidth: number
  containerHeight: number
  designWidth: number
  designHeight: number
  scaleMode?: string
  alignX?: string
  alignY?: string
  renderMode?: string
  minScale?: number
  maxScale?: number
  disabledScale?: boolean
}

export interface ScaleComputeResult {
  contentWidth: number
  contentHeight: number
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
  renderMode: string
}

/** 防止 fixed-height / fixed-width 出现除零 */
export const MIN_SAFE_SCALE = 1e-6;

export function clampScale(value: number, minScale = 0, maxScale = Infinity) {
  const lower = minScale > 0 ? minScale : MIN_SAFE_SCALE;
  return Math.min(Math.max(value, lower), maxScale);
}

export function getAlignedOffset(remainSize: number, align = "center") {
  if (align === "start") {
    return 0;
  }
  if (align === "end") {
    return remainSize;
  }
  return remainSize / 2;
}

export function resolveRenderMode(
  scaleX: number,
  scaleY: number,
  renderMode?: string
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

export function normalizeScaleMode(scaleMode?: string): ScaleMode {
  return SUPPORTED_SCALE_MODES.includes(scaleMode as ScaleMode)
    ? (scaleMode as ScaleMode)
    : "fixed-height";
}

/** 主屏与弹窗视口快照共用的缩放计算 */
export function computeScaleResult(input: ScaleComputeInput): ScaleComputeResult {
  const {
    designWidth,
    designHeight,
    alignX = "center",
    alignY = "center",
    renderMode,
    minScale = 0,
    maxScale = Infinity,
    disabledScale = false
  } = input;

  const safeWidth = input.containerWidth > 0 ? input.containerWidth : designWidth;
  const safeHeight = input.containerHeight > 0 ? input.containerHeight : designHeight;

  let scaleX = 1;
  let scaleY = 1;
  let contentWidth = designWidth;
  let contentHeight = designHeight;

  const mode = normalizeScaleMode(input.scaleMode);

  if (!disabledScale) {
    const widthRatio = safeWidth / designWidth;
    const heightRatio = safeHeight / designHeight;

    if (mode === "stretch") {
      scaleX = clampScale(widthRatio, minScale, maxScale);
      scaleY = clampScale(heightRatio, minScale, maxScale);
    } else if (mode === "cover") {
      const scale = clampScale(Math.max(widthRatio, heightRatio), minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "width") {
      const scale = clampScale(widthRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "height") {
      const scale = clampScale(heightRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "fixed-height") {
      const scale = clampScale(heightRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
      contentWidth = safeWidth / scale;
    } else if (mode === "fixed-width") {
      const scale = clampScale(widthRatio, minScale, maxScale);
      scaleX = scale;
      scaleY = scale;
      contentHeight = safeHeight / scale;
    } else {
      const scale = clampScale(Math.min(widthRatio, heightRatio), minScale, maxScale);
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
    offsetX: Number.isFinite(offsetX) ? offsetX : 0,
    offsetY: Number.isFinite(offsetY) ? offsetY : 0,
    renderMode: resolveRenderMode(scaleX, scaleY, renderMode)
  };
}
