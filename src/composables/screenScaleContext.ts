import type { ComputedRef, InjectionKey } from "vue";

export interface ScreenScaleSnapshot {
  contentWidth: number
  contentHeight: number
  scaleX: number
  scaleY: number
  offsetX: number
  offsetY: number
  anchorX: number
  anchorY: number
  renderMode: string
}

export const SCREEN_SCALE_CONTEXT_KEY: InjectionKey<ComputedRef<ScreenScaleSnapshot | null>> =
  Symbol("screenScaleContext");

/** 与 ProjectScreenScale 内容层一致，供 Teleport 弹窗同步缩放 */
export function buildScreenScaleLayerStyle(
  snapshot: ScreenScaleSnapshot,
  position: "fixed" | "absolute" = "fixed"
) {
  const base: Record<string, string | number> = {
    position,
    left: `${snapshot.anchorX}px`,
    top: `${snapshot.anchorY}px`,
    width: `${snapshot.contentWidth}px`,
    height: `${snapshot.contentHeight}px`,
    transformOrigin: "left top",
    boxSizing: "border-box"
  };

  if (snapshot.renderMode === "zoom") {
    return {
      ...base,
      zoom: snapshot.scaleX,
      transform: "translate3d(0, 0, 0)"
    };
  }

  return {
    ...base,
    zoom: 1,
    transform: `translate3d(0, 0, 0) scale(${snapshot.scaleX}, ${snapshot.scaleY})`
  };
}
