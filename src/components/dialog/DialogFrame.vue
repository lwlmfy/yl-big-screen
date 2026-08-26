<script setup lang="ts">
defineProps({
  title: String,
  size: { type: String, default: "full" },
  width: String,
  height: String,
  showHeader: { type: Boolean, default: true }
});

const emit = defineEmits(["close", "title-click"]);
</script>

<template>
  <div
    class="dialog-box"
    :class="[size, { 'dialog-box--no-header': !showHeader }]"
    :style="{ width: width || '', height: height || '' }"
    @click.stop
  >
    <header v-if="showHeader && title" class="dialog-header">
      <div></div>
      <div class="dialog-title cursor-pointer" @click="emit('title-click')">{{ title }}</div>
      <button
        type="button"
        class="dialog-close"
        aria-label="关闭"
        @click.stop="emit('close')"
      >
        <img class="dialog-close__icon" src="../../assets/close_icon.svg" alt="" />
      </button>
    </header>

    <button
      v-if="!showHeader"
      type="button"
      class="dialog-close dialog-close--floating"
      aria-label="关闭"
      @click.stop="emit('close')"
    >
      <img class="dialog-close__icon" src="../../assets/close_icon.svg" alt="" />
    </button>

    <div class="dialog-content">
      <div class="fit dialog-content-scroll">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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

.dialog-box--no-header {
  grid-template-rows: 1fr;
  position: relative;
}

.dialog-close--floating {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 5;
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
    margin: -4px -6px -4px 0;
    min-width: 48px;
    min-height: 48px;
  }
}

.dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgba(62, 224, 255, 0.45);
  border-radius: 10px;
  background: rgba(8, 36, 68, 0.5);
  box-shadow: 0 0 12px rgba(62, 224, 255, 0.15);
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

@media (prefers-reduced-motion: reduce) {
  .dialog-close:hover .dialog-close__icon,
  .dialog-close:active .dialog-close__icon {
    transform: none;
  }

  .dialog-close:hover,
  .dialog-close:active {
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
