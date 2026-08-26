import type { ScreenScaleSnapshot } from "./screenScaleContext";
import { computeScaleResult } from "./scaleMath";

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
  const { width: vw, height: vh } = getTopViewportSize();
  const result = computeScaleResult({
    containerWidth: vw,
    containerHeight: vh,
    designWidth: options.designWidth,
    designHeight: options.designHeight,
    scaleMode: options.scaleMode,
    alignX: options.alignX,
    alignY: options.alignY,
    renderMode: options.renderMode,
    minScale: options.minScale,
    maxScale: options.maxScale,
    disabledScale: options.disabledScale
  });

  return {
    ...result,
    anchorX: 0,
    anchorY: 0,
    basedOnViewport: true
  };
}
