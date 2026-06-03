<script setup lang="ts">
import titleBg from "../assets/card-sub-title.png";

defineProps({
  title: {
    type: String,
    default: "标题"
  },
  showTitle: {
    type: Boolean,
    default: true
  },
  padding: {
    type: String,
    default: "0 14px"
  }
});
</script>

<template>
  <div class="card-sub-title">
    <div v-if="showTitle" class="card-sub-title__header">
      <div class="card-sub-title__title-bar">
        <span class="card-sub-title__title-text">{{ title }}</span>
      </div>
      <div v-if="$slots['header-right']" class="card-sub-title__header-right">
        <slot name="header-right" />
      </div>
    </div>
    <div class="card-sub-title__body" :style="{ padding: padding }">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-sub-title {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.card-sub-title__header {
  display: flex;
  align-items: center;
  height: 35px;
  flex-shrink: 0;
  position: relative;
}

.card-sub-title__title-bar {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  background-image: url("../assets/card-sub-title.png");
  background-repeat: no-repeat;
  background-size: contain;
  padding: 0 24px;
}

.card-sub-title__title-text {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #d7e6ff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-sub-title__header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 12px;
}

.card-sub-title__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
