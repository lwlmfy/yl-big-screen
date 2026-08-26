<script setup lang="ts">
import { inject, onUnmounted } from "vue";
import GlobalDialog from "./GlobalDialog.vue";
import {
  createDialogHost,
  type DialogHost
} from "../../composables/dialogService";
import { DIALOG_HOST_KEY } from "../../composables/screenScaleContext";

const fallbackHost = createDialogHost();
const host = inject(DIALOG_HOST_KEY, null) as DialogHost | null;
const dialogHost = host ?? fallbackHost;
const dialogs = dialogHost.dialogs;
const closeDialog = dialogHost.closeDialog;
const dismissDialog = dialogHost.dismissDialog;

onUnmounted(() => {
  if (!host) {
    dialogHost.closeAll();
  }
});

function handleRequestClose(id: string, result?: any) {
  closeDialog(id, result);
}

function handleClosed(id: string) {
  dismissDialog(id);
}
</script>

<template>
  <div class="dialog-container">
    <GlobalDialog
      v-for="(dialog, index) in dialogs"
      :key="dialog.id"
      v-model="dialog.visible"
      :title="dialog.title"
      :size="dialog.size"
      :width="dialog.width"
      :height="dialog.height"
      :close-on-click-mask="dialog.closeOnClickMask"
      :show-header="dialog.showHeader"
      :on-closed="() => handleClosed(dialog.id)"
      :on-title-click="dialog.onTitleClick"
      :on-open="dialog.onOpen"
      :depth="index"
    >
      <component
        :is="dialog.component"
        v-bind="{ ...dialog.props, close: (res: any) => handleRequestClose(dialog.id, res) }"
      />
    </GlobalDialog>
  </div>
</template>

<style scoped lang="scss">
.dialog-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;

  :deep(.global-dialog),
  :deep(.dialog-mask.fit) {
    pointer-events: auto;
  }
}
</style>
