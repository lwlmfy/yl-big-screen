<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useSlots, watch } from "vue";
import DialogContainer from "./dialog/DialogContainer.vue";
import ProjectScreenScale from "./ProjectScreenScale.vue";
import {
  SCREEN_SCALE_CONTEXT_KEY,
  type ScreenScaleSnapshot
} from "../composables/screenScaleContext";
import {
  buildViewportScaleSnapshot,
  getRawWindow,
  resolveTeleportTarget
} from "../composables/microAppViewport";
import defaultHeaderBg from "../assets/bigTitle.png";
import defaultPageBg from "../assets/beijingpage.png";

const props = defineProps({
  title: {
    type: String,
    default: "大屏"
  },
  width: {
    type: Number,
    default: 1920
  },
  height: {
    type: Number,
    default: 1080
  },
  scaleMode: {
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
  disabledScale: {
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
  useResizeObserver: {
    type: Boolean,
    default: true
  },
  listenWindowResize: {
    type: Boolean,
    default: true
  },
  headerHeight: {
    type: Number,
    default: 80
  },
  contentPadding: {
    type: String,
    default: "0 10px 10px"
  },
  gap: {
    type: Number,
    default: 18
  },
  background: {
    type: String,
    default: "#07111f"
  },
  pageBackgroundImage: {
    type: String,
    default: ""
  },
  headerBackgroundImage: {
    type: String,
    default: ""
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  showDateTime: {
    type: Boolean,
    default: true
  },
  enableMenuBridge: {
    type: Boolean,
    default: true
  },
  titleClickable: {
    type: Boolean,
    default: true
  },
  teleportDialog: {
    type: Boolean,
    default: true
  },
  /** micro-app 下可指定主应用挂载点选择器，默认挂到真实 window.document.body */
  teleportTo: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["title-click", "scale-update"]);

const slots = useSlots();
const scaleRef = ref<InstanceType<typeof ProjectScreenScale>>();

const currentDate = ref("");
const currentTime = ref("");
let timer: ReturnType<typeof setInterval>;

function updateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const w = ["日", "一", "二", "三", "四", "五", "六"][now.getDay()];
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  currentDate.value = `${y}年${m}月${d}日 星期${w}`;
  currentTime.value = `${h}:${min}:${s}`;
}

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  if (props.teleportDialog) {
    teleportTarget.value = resolveTeleportTarget(props.teleportTo || undefined);
    refreshViewportDialogScale();
    bindViewportListeners();
  }
});

onBeforeUnmount(() => {
  clearInterval(timer);
  unbindViewportListeners();
});

function handleTitleClick(event: Event) {
  if (!props.enableMenuBridge) {
    return;
  }
  emit("title-click", event);
  // if ((window as any).__MICRO_APP_ENVIRONMENT__) {
  //   (window as any).microApp?.dispatch({type: "openShowMenu"});
  //   return;
  // }
  // if (window.self !== window.top) {
  //   window.parent.postMessage({type: "openShowMenu"}, "*");
  // }
}

const screenScaleSnapshot = ref<ScreenScaleSnapshot | null>(null);
const teleportTarget = ref<string | HTMLElement>("body");
let viewportResizeTarget: Window | null = null;

function refreshViewportDialogScale() {
  if (!props.teleportDialog) {
    return;
  }

  screenScaleSnapshot.value = buildViewportScaleSnapshot({
    designWidth: props.width,
    designHeight: props.height,
    scaleMode: props.scaleMode,
    alignX: props.alignX,
    alignY: props.alignY,
    renderMode: props.renderMode,
    minScale: props.minScale,
    maxScale: props.maxScale,
    disabledScale: props.disabledScale
  });
}

function bindViewportListeners() {
  viewportResizeTarget = getRawWindow();
  viewportResizeTarget.addEventListener("resize", refreshViewportDialogScale);
  viewportResizeTarget.addEventListener("scroll", refreshViewportDialogScale, true);
  window.visualViewport?.addEventListener("resize", refreshViewportDialogScale);
}

function unbindViewportListeners() {
  viewportResizeTarget?.removeEventListener("resize", refreshViewportDialogScale);
  viewportResizeTarget?.removeEventListener("scroll", refreshViewportDialogScale, true);
  window.visualViewport?.removeEventListener("resize", refreshViewportDialogScale);
  viewportResizeTarget = null;
}

function handleScaleUpdate(payload: any) {
  refreshViewportDialogScale();
  emit("scale-update", payload);
}

const screenScaleContext = computed(() =>
  props.teleportDialog ? screenScaleSnapshot.value : null
);

provide(SCREEN_SCALE_CONTEXT_KEY, screenScaleContext);

watch(
  () => [
    props.teleportDialog,
    props.width,
    props.height,
    props.scaleMode,
    props.renderMode,
    props.alignX,
    props.alignY,
    props.disabledScale,
    props.minScale,
    props.maxScale,
    props.teleportTo
  ],
  () => {
    if (!props.teleportDialog) {
      return;
    }
    teleportTarget.value = resolveTeleportTarget(props.teleportTo || undefined);
    refreshViewportDialogScale();
  }
);

const pageBgUrl = computed(() =>
  props.pageBackgroundImage ? props.pageBackgroundImage : defaultPageBg
);

const headerBgUrl = computed(() =>
  props.headerBackgroundImage ? props.headerBackgroundImage : defaultHeaderBg
);

const rootStyle = computed(() => ({
  "--project-screen-header-height": `${props.headerHeight}px`,
  "--project-screen-gap": `${props.gap}px`,
  "--project-screen-content-padding": props.contentPadding,
  backgroundColor: props.background,
  backgroundImage: `url(${pageBgUrl.value})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  backgroundSize: "100% 100%"
}));

const headerStyle = computed(() => ({
  backgroundImage: `url(${headerBgUrl.value})`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center top",
  backgroundSize: "100% 100%"
}));

defineExpose({
  refresh: () => scaleRef.value?.refresh?.()
});
</script>

<template>
  <ProjectScreenScale
    ref="scaleRef"
    :width="width"
    :height="height"
    :mode="scaleMode"
    :render-mode="renderMode"
    :align-x="alignX"
    :align-y="alignY"
    :container-selector="containerSelector"
    :disabled="disabledScale"
    :min-scale="minScale"
    :max-scale="maxScale"
    :overflow-hidden="overflowHidden"
    :use-resize-observer="useResizeObserver"
    :listen-window-resize="listenWindowResize"
    @update="handleScaleUpdate"
  >
    <template #default="screenState">
      <div class="project-screen-root" :style="[rootStyle]">
        <header v-if="showHeader" class="project-screen-header" :style="headerStyle">
          <div class="project-screen-header__side">
            <slot name="header-left" v-bind="screenState"/>
          </div>
          <div class="project-screen-header__center">
            <div
              class="project-screen-title"
              :class="{ 'project-screen-title--clickable': titleClickable || enableMenuBridge }"
              @click="handleTitleClick"
            >
              <slot name="title" v-bind="screenState">
                {{ title }}
              </slot>
            </div>
          </div>
          <div class="project-screen-header__side project-screen-header__side--right">
            <slot name="header-right" v-bind="screenState">
              <div v-if="showDateTime" class="project-screen-datetime">
                <span class="project-screen-datetime__date">{{ currentDate }}</span>
                <span class="project-screen-datetime__time">{{ currentTime }}</span>
              </div>
            </slot>
          </div>
        </header>
        <main class="project-screen-content">
          <slot v-bind="screenState"/>
        </main>
        <DialogContainer v-if="!teleportDialog"/>
      </div>

      <!-- micro-app：挂到真实屏幕 body；弹窗按顶层视口缩放，全屏弹窗铺满整屏 -->
      <Teleport v-if="teleportDialog" :to="teleportTarget">
        <div class="project-screen-teleport-dialog">
          <DialogContainer/>
        </div>
      </Teleport>
    </template>
  </ProjectScreenScale>
</template>

<style scoped lang="scss">
.project-screen-root {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: var(--project-screen-gap);
  color: #d7e6ff;
  box-sizing: border-box;
  border: 1px solid rgba(98, 146, 221, 0.12);
  box-shadow: inset 0 0 0 1px rgba(125, 170, 255, 0.04);
  /* background 由 inline style 设置 */}

.project-screen-header {
  position: relative;
  width: 100%;
  min-height: var(--project-screen-header-height);
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 0 24px;
  box-sizing: border-box;
  overflow: hidden;
  /* background 由 inline style 设置 */
}

.project-screen-header__side {
  position: relative;
  z-index: 2;
  min-width: 0;
  min-height: 0;
  flex: 1 1 0;
  display: flex;
  align-items: center;
  pointer-events: auto;
}

.project-screen-header__side--right {
  justify-content: flex-end;
  align-items: flex-start;
}


.project-screen-title {
  text-align: center;
  font-family: YouSheBiaoTiHei, "PingFang SC", "Microsoft YaHei", sans-serif;
  background-clip: text;
  color: transparent;
  font-size: 50px;
  line-height: 50px;
  letter-spacing: 20px;
  background-image: linear-gradient(to top, #5ad2df 10%, #fff 50%);
  cursor: pointer;
  padding-top: 3px;
}

.project-screen-title--clickable {
  cursor: pointer;
}

.project-screen-datetime {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  line-height: 1;
  align-self: flex-start;
  padding-top: 14px;
}

.project-screen-datetime__date {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.project-screen-datetime__time {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.project-screen-content {
  min-width: 0;
  min-height: 0;
  padding: var(--project-screen-content-padding);
  box-sizing: border-box;
}

/* 挂到主应用 body 时需足够高；铺满真实屏幕视口 */
.project-screen-teleport-dialog {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2147483646;
  pointer-events: none;

  :deep(.dialog-mask--viewport),
  :deep(.dialog-box) {
    pointer-events: auto;
  }
}
</style>
