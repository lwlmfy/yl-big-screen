<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { computeScaleResult } from "../composables/scaleMath";

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
    default: "transform"
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

function updateScale() {
  const { width, height } = getContainerRect();
  const result = computeScaleResult({
    containerWidth: width,
    containerHeight: height,
    designWidth: props.width,
    designHeight: props.height,
    scaleMode: props.mode,
    alignX: props.alignX,
    alignY: props.alignY,
    renderMode: props.renderMode,
    minScale: props.minScale,
    maxScale: props.maxScale,
    disabledScale: props.disabled
  });

  const safeWidth = width > 0 ? width : props.width;
  const safeHeight = height > 0 ? height : props.height;

  state.containerWidth = safeWidth;
  state.containerHeight = safeHeight;
  state.contentWidth = result.contentWidth;
  state.contentHeight = result.contentHeight;
  state.scaleX = result.scaleX;
  state.scaleY = result.scaleY;
  state.offsetX = result.offsetX;
  state.offsetY = result.offsetY;
  state.renderMode = result.renderMode;

  const wrapperRect = wrapperRef.value?.getBoundingClientRect();
  state.anchorX = (wrapperRect?.left ?? 0) + state.offsetX;
  state.anchorY = (wrapperRect?.top ?? 0) + state.offsetY;

  emit("update", {
    width: safeWidth,
    height: safeHeight,
    scaleX: result.scaleX,
    scaleY: result.scaleY,
    scale: Math.min(result.scaleX, result.scaleY),
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
  isResizing.value = true;
  clearTimeout(resizeTimer.value);
  frameId.value = requestAnimationFrame(updateScale);
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
