<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "标题"
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  bodyClass: {
    type: String,
    default: ""
  },
  titleBackgroundImage: {
    type: String,
    default: ""
  },
  titleClickable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(["titleClick"]);

const shellClass = computed(() => ({
  "project-panel-shell--no-title": !props.showTitle
}));

const titleBarStyle = computed(() => {
  const style: Record<string, string> = {
    width: "460px",
    height: "40px",
    flexShrink: "0"
  };
  if (props.titleBackgroundImage) {
    style.backgroundImage = `url(${props.titleBackgroundImage})`;
    style.backgroundRepeat = "no-repeat";
    style.backgroundPosition = "center";
    style.backgroundSize = "100% 100%";
  }
  return style;
});

function handleTitleClick() {
  if (props.titleClickable) {
    emit("titleClick");
  }
}
</script>

<template>
  <section class="project-panel-shell" :class="shellClass">
    <div v-if="showTitle" class="project-panel-shell__headline">
      <div class="project-panel-shell__title" :style="titleBarStyle">
        <span
          class="project-panel-shell__title-text"
          :class="{ 'project-panel-shell__title-text--clickable': titleClickable }"
          @click="handleTitleClick"
        >{{ title }}</span>
        <span class="project-panel-shell__title-icon"><slot name="title-icon" /></span>
      </div>
    </div>
    <div class="project-panel-shell__body" :class="bodyClass">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.project-panel-shell {
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  position: relative;
  border: 1px solid rgba(90, 154, 255, 0.34);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(18, 55, 95, 0.28), rgba(12, 38, 70, 0.16)),
  radial-gradient(circle at 50% 0, rgba(34, 157, 255, 0.08), transparent 40%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow: visible;
  padding: 28px 8px 8px;
  box-sizing: border-box;
  height: 100%;
}

.project-panel-shell--no-title {
  padding-top: 8px;
}

.project-panel-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(61, 135, 232, 0.2),
  inset 0 -20px 36px rgba(6, 20, 38, 0.18);
}

/* ── 顶部浮动标题 ── */
.project-panel-shell__headline {
  position: absolute;
  left: 0;
  right: 0;
  top: -20px;
  height: 40px;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.project-panel-shell__title {
  position: relative;
  z-index: 9;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  background-image: url("../assets/panelShellBgc_sm.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.project-panel-shell__title-text {
  max-width: 78%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: normal;
  background: linear-gradient(180deg, #ffffff 47.22%, #3ee0ff 91.67%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
  font-family: YouSheBiaoTiHei, "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 30px;
  letter-spacing: 0.12em;
  text-align: center;
}

.project-panel-shell__title-text--clickable {
  cursor: pointer;
}

.project-panel-shell__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 4px;
}

.project-panel-shell__body {
  min-width: 0;
  min-height: 0;
  position: relative;
  margin: 0;
  overflow: auto;
  background: linear-gradient(180deg, rgba(15, 50, 85, 0.06), rgba(12, 38, 66, 0.02)),
  rgba(14, 42, 72, 0.015);
}

.project-panel-shell__body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.project-panel-shell__body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(48, 104, 170, 0.92), rgba(28, 72, 132, 0.9));
}
</style>
