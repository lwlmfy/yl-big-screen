export { default as CardSubTitle } from "./components/CardSubTitle.vue";
export { default as ProjectScreenScale } from "./components/ProjectScreenScale.vue";
export { default as ProjectPanelShell } from "./components/ProjectPanelShell.vue";
export { default as ProjectScreenRoot } from "./components/ProjectScreenRoot.vue";
export { default as GlobalDialog } from "./components/dialog/GlobalDialog.vue";
export { default as DialogContainer } from "./components/dialog/DialogContainer.vue";

export {
  openBigScreenDialog,
  closeDialog,
  dialogs
} from "./composables/dialogService";
export type { DialogItem } from "./composables/dialogService";
