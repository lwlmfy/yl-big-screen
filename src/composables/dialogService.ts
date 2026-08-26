import { computed, ref, type Ref } from "vue";

export interface DialogItem {
  id: string
  title?: string
  component: any
  props?: Record<string, any>
  size?: "medium" | "large" | "full"
  width?: string
  height?: string
  closeOnClickMask?: boolean
  showHeader?: boolean
  visible: boolean
  /** 关闭动画结束后带回的结果 */
  pendingResult?: any
  resolve: (result?: any) => void
  onTitleClick?: () => void
  onOpen?: () => void
  onClose?: (result?: any) => void
}

export interface DialogHost {
  dialogs: Ref<DialogItem[]>
  openBigScreenDialog: (
    options: Omit<DialogItem, "id" | "visible" | "resolve" | "pendingResult">
  ) => Promise<unknown>
  /** 触发关闭动画（不立刻移除） */
  closeDialog: (id: string, result?: any) => void
  /** 动画结束后真正移除并 resolve */
  dismissDialog: (id: string) => void
  closeAll: () => void
}

const hostStack: DialogHost[] = [];

function generateUUID() {
  return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 创建独立弹窗宿主（供 ProjectScreenRoot 按实例挂载） */
export function createDialogHost(): DialogHost {
  const dialogs = ref<DialogItem[]>([]);

  function openBigScreenDialog(
    options: Omit<DialogItem, "id" | "visible" | "resolve" | "pendingResult">
  ) {
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

  function closeDialog(id: string, result?: any) {
    const item = dialogs.value.find(d => d.id === id);
    if (!item || !item.visible) {
      return;
    }
    item.pendingResult = result;
    item.visible = false;
  }

  function dismissDialog(id: string) {
    const idx = dialogs.value.findIndex(d => d.id === id);
    if (idx === -1) {
      return;
    }
    const item = dialogs.value[idx];
    const result = item.pendingResult;
    item.resolve(result);
    item.onClose?.(result);
    dialogs.value.splice(idx, 1);
  }

  function closeAll() {
    const items = [...dialogs.value];
    dialogs.value = [];
    items.forEach(dialog => {
      dialog.resolve(dialog.pendingResult);
      dialog.onClose?.(dialog.pendingResult);
    });
  }

  return {
    dialogs,
    openBigScreenDialog,
    closeDialog,
    dismissDialog,
    closeAll
  };
}

const fallbackHost = createDialogHost();

export function registerDialogHost(host: DialogHost) {
  hostStack.push(host);
}

export function unregisterDialogHost(host: DialogHost) {
  const idx = hostStack.lastIndexOf(host);
  if (idx !== -1) {
    hostStack.splice(idx, 1);
  }
}

function getActiveHost() {
  return hostStack[hostStack.length - 1] ?? fallbackHost;
}

export function openBigScreenDialog(
  options: Omit<DialogItem, "id" | "visible" | "resolve" | "pendingResult">
) {
  return getActiveHost().openBigScreenDialog(options);
}

export function closeDialog(id: string, result?: any) {
  getActiveHost().closeDialog(id, result);
}

export function dismissDialog(id: string) {
  getActiveHost().dismissDialog(id);
}

/** 当前激活宿主的弹窗列表（多 Root 时指向最内层已注册实例） */
export const dialogs = computed(() => getActiveHost().dialogs.value);
