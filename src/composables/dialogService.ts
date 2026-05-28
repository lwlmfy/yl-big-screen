import { ref } from "vue";

export interface DialogItem {
  id: string
  title?: string
  component: any
  props?: Record<string, any>
  size?: "medium" | "large" | "full"
  width?: string
  height?: string
  closeOnClickMask?: boolean
  visible: boolean
  resolve: (result?: any) => void
  onTitleClick?: () => void
  onOpen?: () => void
  onClose?: (result?: any) => void
}

export const dialogs = ref<DialogItem[]>([]);

function generateUUID() {
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function openBigScreenDialog(options: Omit<DialogItem, "id" | "visible" | "resolve">) {
  return new Promise((resolve) => {
    const id = generateUUID();
    dialogs.value.push({
      id,
      visible: true,
      resolve,
      ...options
    });
  });
}

export function closeDialog(id: string, result?: any) {
  const idx = dialogs.value.findIndex(d => d.id === id);
  if (idx !== -1) {
    dialogs.value[idx].resolve(result);
    dialogs.value[idx].onClose?.(result);
    dialogs.value.splice(idx, 1);
  }
}
