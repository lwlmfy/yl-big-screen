<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

const props = defineProps({
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  },
  mode: {
    type: String,
    default: "fixed-height"
  },
  renderMode: {
    type: String,
    default: "zoom"
  },
  alignX: {
    type: String,
    default: "center"
  },
  alignY: {
    type: String,
    default: "center"
  },
  containerSelector: {
    type: String,
    default: ""
  },
  disabled: {
    type: Boolean,
    default: false
  },
  minScale: {
    type: Number,
    default: 0
  },
  maxScale: {
    type: Number,
    default: Infinity
  },
  overflowHidden: {
    type: Boolean,
    default: true
  },
  background: {
    type: String,
    default: "transparent"
  },
  useResizeObserver: {
    type: Boolean,
    default: true
  },
  listenWindowResize: {
    type: Boolean,
    default: true
  },
  transitionDuration: {
    type: Number,
    default: 180
  },
  transitionTimingFunction: {
    type: String,
    default: "cubic-bezier(0.22, 1, 0.36, 1)"
  }
});

const emit = defineEmits(["update"]);

const wrapperRef = ref<HTMLElement>();
const resizeObserverRef = ref<ResizeObserver>();
const frameId = ref(0);
const resizeTimer = ref<ReturnType<typeof setTimeout>>();
const isResizing = ref(false);

const state = reactive({
  containerWidth: 0,
  containerHeight: 0,
  contentWidth: 0,
  contentHeight: 0,
  scaleX: 1,
  scaleY: 1,
  offsetX: 0,
  offsetY: 0,
  anchorX: 0,
  anchorY: 0,
  renderMode: "zoom"
});

const supportedModes = ["contain", "cover", "stretch", "width", "height", "fixed-height", "fixed-width"];

function getMode() {
  return supportedModes.includes(props.mode) ? props.mode : "fixed-height";
}

function clamp(value: number) {
  return Math.min(Math.max(value, props.minScale), props.maxScale);
}

function getContainerElement() {
  if (props.containerSelector) {
    const target = document.querySelector(props.containerSelector);
    if (target) {
      return target;
    }
  }

  if (wrapperRef.value?.parentElement) {
    return wrapperRef.value.parentElement;
  }

  if ((window as any).__MICRO_APP_ENVIRONMENT__) {
    return document.querySelector("#q-app") || document.documentElement;
  }

  return document.documentElement;
}

function getViewportSize() {
  const visualViewport = window.visualViewport;
  if (visualViewport?.width && visualViewport?.height) {
    return {
      width: visualViewport.width,
      height: visualViewport.height
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

function getContainerRect() {
  const container = getContainerElement();
  const rect = (container as Element)?.getBoundingClientRect?.();
  const viewportSize = getViewportSize();

  return {
    width: rect?.width || viewportSize.width || props.width,
    height: rect?.height || viewportSize.height || props.height,
    container
  };
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

function getRenderMode(scaleX: number, scaleY: number) {
  if (props.renderMode === "transform" || props.renderMode === "zoom") {
    return props.renderMode;
  }

  const supportsZoom = typeof CSS !== "undefined" && CSS.supports?.("zoom", "1");
  const isUniformScale = Math.abs(scaleX - scaleY) < 0.001;
  const isUpscaling = scaleX > 1.001 || scaleY > 1.001;

  if (supportsZoom && isUniformScale && isUpscaling) {
    return "zoom";
  }

  return "transform";
}

function updateScale() {
  const { width, height } = getContainerRect();
  const safeWidth = width > 0 ? width : props.width;
  const safeHeight = height > 0 ? height : props.height;

  let scaleX = 1;
  let scaleY = 1;
  let contentWidth = props.width;
  let contentHeight = props.height;

  if (!props.disabled) {
    const widthRatio = safeWidth / props.width;
    const heightRatio = safeHeight / props.height;
    const mode = getMode();

    if (mode === "stretch") {
      scaleX = clamp(widthRatio);
      scaleY = clamp(heightRatio);
    } else if (mode === "cover") {
      const scale = clamp(Math.max(widthRatio, heightRatio));
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "width") {
      const scale = clamp(widthRatio);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "height") {
      const scale = clamp(heightRatio);
      scaleX = scale;
      scaleY = scale;
    } else if (mode === "fixed-height") {
      const scale = clamp(heightRatio);
      scaleX = scale;
      scaleY = scale;
      contentWidth = safeWidth / scale;
    } else if (mode === "fixed-width") {
      const scale = clamp(widthRatio);
      scaleX = scale;
      scaleY = scale;
      contentHeight = safeHeight / scale;
    } else {
      const scale = clamp(Math.min(widthRatio, heightRatio));
      scaleX = scale;
      scaleY = scale;
    }
  }

  const scaledWidth = contentWidth * scaleX;
  const scaledHeight = contentHeight * scaleY;
  const offsetX = getAlignedOffset(safeWidth - scaledWidth, props.alignX);
  const offsetY = getAlignedOffset(safeHeight - scaledHeight, props.alignY);

  state.containerWidth = safeWidth;
  state.containerHeight = safeHeight;
  state.contentWidth = contentWidth;
  state.contentHeight = contentHeight;
  state.scaleX = scaleX;
  state.scaleY = scaleY;
  state.offsetX = Number.isFinite(offsetX) ? offsetX : 0;
  state.offsetY = Number.isFinite(offsetY) ? offsetY : 0;
  state.renderMode = getRenderMode(scaleX, scaleY);

  const wrapperRect = wrapperRef.value?.getBoundingClientRect();
  state.anchorX = (wrapperRect?.left ?? 0) + state.offsetX;
  state.anchorY = (wrapperRect?.top ?? 0) + state.offsetY;

  emit("update", {
    width: safeWidth,
    height: safeHeight,
    scaleX,
    scaleY,
    scale: Math.min(scaleX, scaleY),
    offsetX: state.offsetX,
    offsetY: state.offsetY,
    contentWidth: state.contentWidth,
    contentHeight: state.contentHeight,
    anchorX: state.anchorX,
    anchorY: state.anchorY,
    renderMode: state.renderMode
  });
}

function refresh() {
  cancelAnimationFrame(frameId.value);
  // 拖动窗口时禁用过渡动画，避免卡顿
  isResizing.value = true;
  clearTimeout(resizeTimer.value);
  frameId.value = requestAnimationFrame(updateScale);
  // 停止拖动 200ms 后恢复过渡动画
  resizeTimer.value = setTimeout(() => {
    isResizing.value = false;
  }, 200);
}

function bindResizeObserver() {
  if (!props.useResizeObserver || typeof ResizeObserver === "undefined") {
    return;
  }

  resizeObserverRef.value?.disconnect?.();
  resizeObserverRef.value = new ResizeObserver(() => refresh());

  const { container } = getContainerRect();
  if (container) {
    resizeObserverRef.value.observe(container as Element);
  }
}

function removeListeners() {
  if (props.listenWindowResize) {
    window.removeEventListener("resize", refresh);
    window.removeEventListener("orientationchange", refresh);
    window.removeEventListener("fullscreenchange", refresh);
    window.removeEventListener("scroll", refresh, true);
    window.visualViewport?.removeEventListener("resize", refresh);
  }

  resizeObserverRef.value?.disconnect?.();
  cancelAnimationFrame(frameId.value);
  clearTimeout(resizeTimer.value);
}

onMounted(() => {
  nextTick(() => {
    refresh();
    bindResizeObserver();
    // 初始加载后延迟恢复过渡
    requestAnimationFrame(() => {
      resizeTimer.value = setTimeout(() => {
        isResizing.value = false;
      }, 300);
    });
  });

  if (props.listenWindowResize) {
    window.addEventListener("resize", refresh);
    window.addEventListener("orientationchange", refresh);
    window.addEventListener("fullscreenchange", refresh);
    window.addEventListener("scroll", refresh, true);
    window.visualViewport?.addEventListener("resize", refresh);
  }
});

watch(
  () => [props.width, props.height, props.mode, props.renderMode, props.alignX, props.alignY, props.disabled, props.minScale, props.maxScale, props.containerSelector],
  () => {
    nextTick(() => {
      refresh();
      bindResizeObserver();
    });
  }
);

onBeforeUnmount(() => {
  removeListeners();
});

const wrapperStyle = computed(() => ({
  overflow: props.overflowHidden ? "hidden" : "visible",
  background: props.background
}));

const contentStyle = computed(() => {
  const transition = isResizing.value
    ? "none"
    : `transform ${props.transitionDuration}ms ${props.transitionTimingFunction}, left ${props.transitionDuration}ms ${props.transitionTimingFunction}, top ${props.transitionDuration}ms ${props.transitionTimingFunction}`;

  if (state.renderMode === "zoom") {
    return {
      width: `${state.contentWidth || props.width}px`,
      height: `${state.contentHeight || props.height}px`,
      left: `${state.offsetX}px`,
      top: `${state.offsetY}px`,
      zoom: `${state.scaleX}`,
      transform: "translate3d(0, 0, 0)",
      transition
    };
  }

  return {
    width: `${state.contentWidth || props.width}px`,
    height: `${state.contentHeight || props.height}px`,
    left: "0px",
    top: "0px",
    zoom: "1",
    transform: `translate3d(${state.offsetX}px, ${state.offsetY}px, 0) scale(${state.scaleX}, ${state.scaleY})`,
    transition
  };
});

defineExpose({
  refresh
});
</script>

<template>
  <div ref="wrapperRef" class="project-screen-scale" :style="wrapperStyle">
    <div class="project-screen-scale__inner" :style="contentStyle">
      <slot
        :container-width="state.containerWidth"
        :container-height="state.containerHeight"
        :content-width="state.contentWidth"
        :content-height="state.contentHeight"
        :scale="Math.min(state.scaleX, state.scaleY)"
        :scale-x="state.scaleX"
        :scale-y="state.scaleY"
        :offset-x="state.offsetX"
        :offset-y="state.offsetY"
        :anchor-x="state.anchorX"
        :anchor-y="state.anchorY"
        :render-mode="state.renderMode"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-screen-scale {
  position: relative;
  width: 100%;
  height: 100%;
}

.project-screen-scale__inner {
  position: absolute;
  left: 0;
  top: 0;
  transform-origin: left top;
  will-change: transform, left, top;
  backface-visibility: hidden;
}
</style>
