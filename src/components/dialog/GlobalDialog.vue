<script setup lang="ts">
import { computed, inject, ref, watch } from "vue";
import {
  SCREEN_SCALE_CONTEXT_KEY,
  buildViewportCanvasStyle
} from "../../composables/screenScaleContext";
import DialogFrame from "./DialogFrame.vue";

const props = defineProps({
  title: String,
  modelValue: Boolean,
  size: { type: String, default: "full" },
  width: String,
  height: String,
  closeOnClickMask: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true },
  onOpen: Function,
  /** 关闭动画结束后回调（真正从列表移除） */
  onClosed: Function,
  onTitleClick: Function,
  depth: { type: Number, default: 0 }
});

const emit = defineEmits(["update:modelValue"]);

const maskZIndex = computed(() => 9 + props.depth * 2);
const viewportMaskZIndex = computed(() => 1 + props.depth * 2);
const viewportStageZIndex = computed(() => 2 + props.depth * 2);

const visible = ref(!!props.modelValue);
const openedOnce = ref(false);

const screenScaleContext = inject(SCREEN_SCALE_CONTEXT_KEY, null);
const viewportOverlay = computed(() => !!screenScaleContext?.value);
const isScreenFull = computed(
  () => !!screenScaleContext?.value && props.size === "full"
);

const viewportScaleWrapStyle = computed(() => {
  const snapshot = screenScaleContext?.value;
  if (!snapshot) {
    return null;
  }

  if (snapshot.renderMode === "zoom") {
    return {
      zoom: snapshot.scaleX,
      transform: "translate3d(0, 0, 0)"
    };
  }

  return {
    transform: `scale(${snapshot.scaleX}, ${snapshot.scaleY})`,
    transformOrigin: "center center"
  };
});

const viewportCanvasStyle = computed(() => {
  const snapshot = screenScaleContext?.value;
  if (!snapshot) {
    return null;
  }
  return buildViewportCanvasStyle(snapshot, "absolute");
});

const panelAnimClass = computed(() =>
  props.size === "full" ? "dialog-panel-anim dialog-panel-anim--full" : "dialog-panel-anim"
);

watch(
  () => props.modelValue,
  val => {
    visible.value = !!val;
  }
);

function requestClose() {
  if (!visible.value) {
    return;
  }
  visible.value = false;
  emit("update:modelValue", false);
}

function handleClose() {
  requestClose();
}

function maskClick() {
  if (props.closeOnClickMask) {
    handleClose();
  }
}

function handleTitleClick() {
  props.onTitleClick?.();
}

function onAfterEnter() {
  if (!openedOnce.value) {
    openedOnce.value = true;
    props.onOpen?.();
  }
}

function onAfterLeave() {
  props.onClosed?.();
}
</script>

<template>
  <Transition
    name="bs-dialog"
    appear
    @after-enter="onAfterEnter"
    @after-leave="onAfterLeave"
  >
    <div
      v-if="visible"
      class="global-dialog"
      :class="{ 'global-dialog--viewport': viewportOverlay }"
      :style="viewportOverlay ? undefined : { zIndex: maskZIndex }"
    >
      <!-- Teleport / 视口模式 -->
      <template v-if="viewportOverlay">
        <div
          class="dialog-mask dialog-mask--viewport dialog-mask-anim"
          :style="{ zIndex: viewportMaskZIndex }"
          @click="maskClick"
        />

        <div
          v-if="isScreenFull"
          class="dialog-viewport-stage dialog-viewport-stage--full"
          :style="{ zIndex: viewportStageZIndex }"
        >
          <div
            v-if="viewportCanvasStyle"
            class="dialog-viewport-canvas"
            :style="viewportCanvasStyle"
          >
            <div :class="panelAnimClass">
              <DialogFrame
                :title="title"
                :size="size"
                :width="width"
                :height="height"
                :show-header="showHeader"
                @close="handleClose"
                @title-click="handleTitleClick"
              >
                <slot />
              </DialogFrame>
            </div>
          </div>
        </div>

        <div
          v-else
          class="dialog-viewport-stage"
          :style="{ zIndex: viewportStageZIndex }"
        >
          <div
            v-if="viewportScaleWrapStyle"
            class="dialog-viewport-scale"
            :style="viewportScaleWrapStyle"
          >
            <div :class="panelAnimClass">
              <DialogFrame
                :title="title"
                :size="size"
                :width="width"
                :height="height"
                :show-header="showHeader"
                @close="handleClose"
                @title-click="handleTitleClick"
              >
                <slot />
              </DialogFrame>
            </div>
          </div>
        </div>
      </template>

      <!-- 缩放树内模式 -->
      <template v-else>
        <div class="dialog-mask fit dialog-mask-anim" @click="maskClick" />
        <div class="dialog-inline-stage" @click.stop>
          <div :class="panelAnimClass">
            <DialogFrame
              :title="title"
              :size="size"
              :width="width"
              :height="height"
              :show-header="showHeader"
              @close="handleClose"
              @title-click="handleTitleClick"
            >
              <slot />
            </DialogFrame>
          </div>
        </div>
      </template>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.global-dialog {
  position: absolute;
  inset: 0;
  pointer-events: auto;
}

.global-dialog--viewport {
  position: absolute;
  inset: 0;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dialog-mask.fit {
  position: absolute;
  display: block;
  z-index: 0;
}

.dialog-mask--viewport {
  position: absolute;
  inset: 0;
  display: block;
  z-index: 1;
}

.dialog-inline-stage {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.dialog-viewport-stage {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.dialog-viewport-stage--full {
  display: block;
}

.dialog-viewport-scale,
.dialog-viewport-canvas {
  pointer-events: none;
}

.dialog-viewport-canvas :deep(.dialog-box),
.dialog-panel-anim :deep(.dialog-box) {
  pointer-events: auto;
}

.dialog-panel-anim {
  pointer-events: auto;
  transform-origin: center center;
  will-change: opacity, transform;
}

.dialog-panel-anim--full {
  width: 100%;
  height: 100%;
}

.bs-dialog-enter-active,
.bs-dialog-leave-active {
  .dialog-mask-anim {
    transition: opacity 0.28s ease;
  }

  .dialog-panel-anim {
    transition:
      opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  }
}

.bs-dialog-enter-from,
.bs-dialog-leave-to {
  .dialog-mask-anim {
    opacity: 0;
  }

  .dialog-panel-anim {
    opacity: 0;
    transform: translateY(16px) scale(0.96);
  }

  .dialog-panel-anim--full {
    transform: translateY(10px) scale(0.985);
  }
}

.bs-dialog-enter-to,
.bs-dialog-leave-from {
  .dialog-mask-anim {
    opacity: 1;
  }

  .dialog-panel-anim {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bs-dialog-enter-active,
  .bs-dialog-leave-active {
    .dialog-mask-anim,
    .dialog-panel-anim {
      transition: opacity 0.15s ease;
    }
  }

  .bs-dialog-enter-from,
  .bs-dialog-leave-to {
    .dialog-panel-anim,
    .dialog-panel-anim--full {
      transform: none;
    }
  }
}
</style>
