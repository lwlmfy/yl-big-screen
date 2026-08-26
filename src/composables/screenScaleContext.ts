import type { ComputedRef, InjectionKey } from "vue";
import type { DialogHost } from "./dialogService";

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
  /** true 表示按顶层屏幕视口缩放，而非子应用 / 大屏容器 */
  basedOnViewport?: boolean
}

export const SCREEN_SCALE_CONTEXT_KEY: InjectionKey<ComputedRef<ScreenScaleSnapshot | null>> =
  Symbol("screenScaleContext");

export const DIALOG_HOST_KEY: InjectionKey<DialogHost> = Symbol("dialogHost");

function buildScaleLayerBase(
  snapshot: ScreenScaleSnapshot,
  position: "fixed" | "absolute",
  left: number,
  top: number
) {
  const base: Record<string, string | number> = {
    position,
    left: `${left}px`,
    top: `${top}px`,
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

/** 全屏弹窗画布：与主屏相同 offset + zoom/transform，内容 100% 铺满画布 */
export function buildViewportCanvasStyle(
  snapshot: ScreenScaleSnapshot,
  position: "fixed" | "absolute" = "fixed"
) {
  return buildScaleLayerBase(
    snapshot,
    position,
    snapshot.anchorX + snapshot.offsetX,
    snapshot.anchorY + snapshot.offsetY
  );
}
