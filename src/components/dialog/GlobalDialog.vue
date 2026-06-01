<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from "vue";
import {
  SCREEN_SCALE_CONTEXT_KEY,
  buildViewportCanvasStyle
} from "../../composables/screenScaleContext";

const props = defineProps({
  title: String,
  modelValue: Boolean,
  size: { type: String, default: "full" },
  width: String,
  height: String,
  closeOnClickMask: { type: Boolean, default: true },
  close: Function,
  onOpen: Function,
  onClose: Function,
  onTitleClick: Function
});

defineEmits(["update:modelValue"]);
const visible = ref(props.modelValue);

const screenScaleContext = inject(SCREEN_SCALE_CONTEXT_KEY, null);
const viewportOverlay = computed(() => !!screenScaleContext?.value);
const basedOnViewport = computed(() => !!screenScaleContext?.value?.basedOnViewport);
const isScreenFull = computed(() => basedOnViewport.value && props.size === "full");

const viewportScaleWrapStyle = computed(() => {
  const snapshot = screenScaleContext?.value;
  if (!snapshot || snapshot.basedOnViewport === false) {
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

/** 全屏：与主屏同尺寸画布 + 屏幕缩放，弹窗内容 100% 铺满画布 */
const viewportCanvasStyle = computed(() => {
  const snapshot = screenScaleContext?.value;
  if (!snapshot?.basedOnViewport) {
    return null;
  }
  return buildViewportCanvasStyle(snapshot, "absolute");
});

watch(() => props.modelValue, val => {
  visible.value = val;
});

function handleClose() {
  visible.value = false;
  props.onClose?.();
}

function maskClick() {
  if (props.closeOnClickMask) {
    handleClose();
  }
}

function handleTitleClick() {
  props.onTitleClick?.();
}

nextTick(() => {
  if (visible.value) {
    props.onOpen?.();
  }
});
</script>

<template>
  <!-- Teleport + 顶层屏幕视口：全屏铺满整屏，其它尺寸按屏幕比例缩放 -->
  <div
    v-if="viewportOverlay"
    v-show="visible"
    class="global-dialog global-dialog--viewport"
  >
    <div class="dialog-mask dialog-mask--viewport" @click="maskClick"/>

    <div v-if="isScreenFull" class="dialog-viewport-stage dialog-viewport-stage--full">
      <div
        v-if="viewportCanvasStyle"
        class="dialog-viewport-canvas"
        :style="viewportCanvasStyle"
      >
        <div
          class="dialog-box full"
          :style="{ width: width || '', height: height || '' }"
          @click.stop
        >
          <header v-if="title" class="dialog-header">
            <div></div>
            <div class="dialog-title cursor-pointer" @click="handleTitleClick">{{ title }}</div>
            <button
              type="button"
              class="dialog-close"
              aria-label="关闭"
              @click.stop="handleClose"
            >
              <img class="dialog-close__icon" src="../../assets/close_icon.svg" alt="" />
            </button>
          </header>

          <div class="dialog-content">
            <div class="fit dialog-content-scroll">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="dialog-viewport-stage">
      <div
        v-if="viewportScaleWrapStyle"
        class="dialog-viewport-scale"
        :style="viewportScaleWrapStyle"
      >
        <div
          class="dialog-box"
          :class="size"
          :style="{ width: width || '', height: height || '' }"
          @click.stop
        >
          <header v-if="title" class="dialog-header">
            <div></div>
            <div class="dialog-title cursor-pointer" @click="handleTitleClick">{{ title }}</div>
            <button
              type="button"
              class="dialog-close"
              aria-label="关闭"
              @click.stop="handleClose"
            >
              <img class="dialog-close__icon" src="../../assets/close_icon.svg" alt="" />
            </button>
          </header>

          <div class="dialog-content">
            <div class="fit dialog-content-scroll">
              <slot />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 默认：弹窗在大屏缩放树内 -->
  <div v-else class="dialog-mask fit" v-show="visible" @click="maskClick">
    <div
      class="dialog-box"
      :class="size"
      :style="{ width: width || '', height: height || '' }"
      @click.stop
    >
      <header v-if="title" class="dialog-header">
        <div></div>
        <div class="dialog-title cursor-pointer" @click="handleTitleClick">{{ title }}</div>
        <button
          type="button"
          class="dialog-close"
          aria-label="关闭"
          @click.stop="handleClose"
        >
          <img class="dialog-close__icon" src="../../assets/close_icon.svg" alt="" />
        </button>
      </header>

      <div class="dialog-content">
        <div class="fit dialog-content-scroll">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.global-dialog--viewport {
  position: absolute;
  inset: 0;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.dialog-mask--viewport {
  position: absolute;
  inset: 0;
  display: block;
  z-index: 1;
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
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
}

.dialog-viewport-scale,
.dialog-viewport-canvas {
  pointer-events: none;
}

.dialog-viewport-canvas .dialog-box {
  pointer-events: auto;
}

.dialog-box {
  width: 1330px;
  height: 830px;
  overflow: hidden;
  display: grid;
  grid-template-rows: 50px minmax(0, 1fr);
  background: url("../../assets/bigBounceFrameBG.svg") no-repeat center / cover;
  pointer-events: auto;
}

.large {
  width: 1570px;
  height: 910px;
}

.full {
  width: 100%;
  height: 100%;
}

.dialog-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  background: url("../../assets/largePopUpBoxTitleBG.svg") no-repeat center / cover;
  padding: 0 20px;

  .dialog-title {
    text-align: center;
    line-height: normal;
    white-space: nowrap;
    background: linear-gradient(180deg, #ffffff 47.22%, #3ee0ff 91.67%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
    font-family: YouSheBiaoTiHei, "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 36px;
    letter-spacing: 0.15em;
  }

  .dialog-close {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    margin: -4px -6px -4px 0;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 10px;
    background: rgba(8, 36, 68, 0.35);
    cursor: pointer;
    transition:
      background 0.25s ease,
      border-color 0.25s ease,
      box-shadow 0.25s ease,
      transform 0.2s ease;

    &:hover {
      background: rgba(62, 224, 255, 0.18);
      border-color: rgba(62, 224, 255, 0.45);
      box-shadow: 0 0 16px rgba(62, 224, 255, 0.32);
      transform: scale(1.06);

      .dialog-close__icon {
        transform: rotate(90deg);
        filter: drop-shadow(0 0 10px rgba(62, 224, 255, 0.75));
      }
    }

    &:active {
      background: rgba(62, 224, 255, 0.32);
      transform: scale(0.94);

      .dialog-close__icon {
        transform: rotate(90deg) scale(0.92);
      }
    }
  }

  .dialog-close__icon {
    width: 20px;
    height: 20px;
    display: block;
    pointer-events: none;
    filter: drop-shadow(0 0 6px rgba(225, 234, 241, 0.45));
    transition:
      transform 0.28s cubic-bezier(0.34, 1.1, 0.64, 1),
      filter 0.25s ease;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dialog-header .dialog-close:hover .dialog-close__icon,
  .dialog-header .dialog-close:active .dialog-close__icon {
    transform: none;
  }

  .dialog-header .dialog-close:hover,
  .dialog-header .dialog-close:active {
    transform: none;
  }
}

.dialog-content {
  padding: 24px 32px 32px;
  overflow: hidden;

  .dialog-content-scroll {
    overflow: auto;

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
      background-color: transparent;
      border-radius: 3px;
      transition: all 0.3s;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 3px;
      background-color: #6091f8;
      transition: all 0.3s;
    }
  }
}
</style>
