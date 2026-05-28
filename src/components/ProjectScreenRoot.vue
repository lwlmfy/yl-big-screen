<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue";
import DialogContainer from "./dialog/DialogContainer.vue";
import ProjectScreenScale from "./ProjectScreenScale.vue";
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
});

onBeforeUnmount(() => {
  clearInterval(timer);
});

function handleTitleClick(event: Event) {
  emit("title-click", event);
  if (!props.enableMenuBridge) {
    return;
  }
  if (window.self !== window.top) {
    window.parent.postMessage({type: "openShowMenu"}, "*");
  }
}

function handleScaleUpdate(payload: any) {
  emit("scale-update", payload);
}

const rootStyle = computed(() => ({
  "--project-screen-header-height": `${props.headerHeight}px`,
  "--project-screen-gap": `${props.gap}px`,
  "--project-screen-content-padding": props.contentPadding
}));

const rootBgStyle = computed(() => ({
  background: props.pageBackgroundImage
    ? `url(${props.pageBackgroundImage}) no-repeat center / 100% 100%`
    : `url(${defaultPageBg}) no-repeat center / 100% 100%`
}));

const headerStyle = computed(() => ({
  background: props.headerBackgroundImage
    ? `url(${props.headerBackgroundImage}) no-repeat center top / 100% 100%`
    : `url(${defaultHeaderBg}) no-repeat center top / 100% 100%`
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
      <div class="project-screen-root" :style="[rootStyle, rootBgStyle]">
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
        <DialogContainer/>
      </div>
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
  /* background 由 inline style 设置 */
}

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
</style>
