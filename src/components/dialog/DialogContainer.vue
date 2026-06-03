<script setup lang="ts">
import { onUnmounted } from "vue";
import GlobalDialog from "./GlobalDialog.vue";
import { closeDialog, dialogs } from "../../composables/dialogService";

onUnmounted(() => {
  dialogs.value.forEach(dialog => closeDialog(dialog.id));
});
</script>

<template>
  <div>
    <transition-group name="dialog-fade" tag="div">
      <GlobalDialog
        v-for="(dialog, index) in dialogs"
        :key="dialog.id"
        v-model="dialog.visible"
        :title="dialog.title"
        :size="dialog.size"
        :width="dialog.width"
        :height="dialog.height"
        :close-on-click-mask="dialog.closeOnClickMask"
        :on-close="(result: any) => closeDialog(dialog.id, result)"
        :on-title-click="dialog.onTitleClick"
        :on-open="dialog.onOpen"
        :depth="index"
      >
        <component
          :is="dialog.component"
          v-bind="{ ...dialog.props, close: (res: any) => closeDialog(dialog.id, res) }"
        />
      </GlobalDialog>
    </transition-group>
  </div>
</template>

<style scoped lang="scss">
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: all 0.5s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
  transform: scale(0);
}

.dialog-fade-enter-to,
.dialog-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
