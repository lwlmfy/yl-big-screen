# yl-big-screen

大屏可视化通用 Vue 3 组件库。提供大屏项目的标准布局、自适应缩放、面板容器和弹窗系统。

## 快速开始

```bash
# pnpm
pnpm install yl-big-screen

# 或 npm
npm install yl-big-screen
```

```ts
// main.ts —— 无需手动引入样式，组件会自动注入
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

```vue
<!-- App.vue -->
<script setup>
import { ProjectScreenRoot, ProjectPanelShell, openBigScreenDialog } from "yl-big-screen";
</script>

<template>
  <ProjectScreenRoot title="我的大屏">
    <template #header-left>
      <span>2026-05-28</span>
    </template>

    <div style="display: grid; grid-template-columns: 400px 1fr 400px; gap: 16px; height: 100%;">
      <ProjectPanelShell title="左侧面板">
        <p>内容...</p>
      </ProjectPanelShell>
      <ProjectPanelShell title="中间面板">
        <p>内容...</p>
      </ProjectPanelShell>
      <ProjectPanelShell title="右侧面板">
        <p>内容...</p>
      </ProjectPanelShell>
    </div>
  </ProjectScreenRoot>
</template>
```

---

## 组件 API

### ProjectScreenRoot

大屏根布局组件，包含自适应缩放、顶部标题栏、内容区和弹窗容器。

**Props**

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `String` | `"大屏"` | 大屏标题 |
| `width` | `Number` | `1920` | 设计稿宽度 |
| `height` | `Number` | `1080` | 设计稿高度 |
| `scaleMode` | `String` | `"fixed-height"` | 缩放模式：`contain` / `cover` / `stretch` / `width` / `height` / `fixed-height` / `fixed-width` |
| `renderMode` | `String` | `"zoom"` | 渲染模式：`auto` / `transform` / `zoom` |
| `alignX` | `String` | `"center"` | 水平对齐：`start` / `center` / `end` |
| `alignY` | `String` | `"center"` | 垂直对齐：`start` / `center` / `end` |
| `disabledScale` | `Boolean` | `false` | 禁用缩放 |
| `minScale` | `Number` | `0` | 最小缩放比例 |
| `maxScale` | `Number` | `Infinity` | 最大缩放比例 |
| `showHeader` | `Boolean` | `true` | 是否显示顶部标题栏 |
| `showDateTime` | `Boolean` | `true` | 是否在标题栏右侧显示当前年月日时间（header-right 插槽可覆盖） |
| `headerHeight` | `Number` | `80` | 标题栏高度（px） |
| `background` | `String` | `"#07111f"` | 背景色 |
| `pageBackgroundImage` | `String` | `""` | 页面背景图 URL（推荐传入 .svg） |
| `headerBackgroundImage` | `String` | `""` | 标题栏背景图 URL（推荐传入 .png） |
| `contentPadding` | `String` | `"0 10px 10px"` | 内容区内边距 |
| `gap` | `Number` | `18` | 标题栏与内容区间距（px） |
| `enableMenuBridge` | `Boolean` | `true` | 点击标题时通过 postMessage 通知父窗口打开菜单 |
| `titleClickable` | `Boolean` | `true` | 标题是否可点击 |
| `overflowHidden` | `Boolean` | `true` | 缩放容器是否隐藏溢出 |
| `useResizeObserver` | `Boolean` | `true` | 使用 ResizeObserver 监听容器尺寸 |
| `listenWindowResize` | `Boolean` | `true` | 监听 window resize 事件 |
| `containerSelector` | `String` | `""` | 自定义缩放参考容器的 CSS 选择器 |
| `teleportDialog` | `Boolean` | `true` | 是否将弹窗容器 Teleport 到 body，避免缩放容器内 z-index/裁剪问题 |

**Slots**

| 插槽 | 作用域数据 | 说明 |
|---|---|---|
| `default` | `ScreenState` | 主内容区 |
| `title` | `ScreenState` | 自定义标题内容 |
| `header-left` | `ScreenState` | 标题栏左侧区域 |
| `header-right` | `ScreenState` | 标题栏右侧区域（不传时默认显示年月日时间） |

**ScreenState 类型**

```ts
{
  containerWidth: number   // 实际容器宽度
  containerHeight: number  // 实际容器高度
  contentWidth: number     // 内容宽度
  contentHeight: number    // 内容高度
  scale: number            // 最小缩放比
  scaleX: number           // X 轴缩放比
  scaleY: number           // Y 轴缩放比
  offsetX: number          // X 轴偏移
  offsetY: number          // Y 轴偏移
}
```

**Events**

| 事件 | 参数 | 说明 |
|---|---|---|
| `title-click` | `(event: Event)` | 点击标题时触发 |
| `scale-update` | `(state: ScaleState)` | 缩放状态更新时触发 |

**Expose**

| 方法 | 说明 |
|---|---|
| `refresh()` | 手动触发重新计算缩放 |

**使用示例**

```vue
<ProjectScreenRoot
  title="智慧城市大屏"
  :width="1920"
  :height="1080"
  scale-mode="fixed-height"
  @title-click="handleTitleClick"
  @scale-update="handleScaleUpdate"
>
  <template #header-left>
    <span>2026-05-28 12:00:00</span>
  </template>
  <template #header-right>
    <button @click="openDialog">菜单</button>
  </template>

  <!-- 默认插槽放主内容 -->
  <div class="my-charts">...</div>
</ProjectScreenRoot>
```

---

### ProjectScreenScale

自适应缩放容器组件。ProjectScreenRoot 底层使用的就是它，也可以独立使用。

**Props**（与 ProjectScreenRoot 的缩放相关属性完全一致）

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `width` | `Number` | `1920` | 设计稿宽度 |
| `height` | `Number` | `1080` | 设计稿高度 |
| `mode` | `String` | `"fixed-height"` | 缩放模式 |
| `renderMode` | `String` | `"zoom"` | 渲染模式：`auto` / `transform` / `zoom` |
| `alignX` | `String` | `"center"` | 水平对齐 |
| `alignY` | `String` | `"center"` | 垂直对齐 |
| `disabled` | `Boolean` | `false` | 禁用缩放 |
| `minScale` | `Number` | `0` | 最小缩放 |
| `maxScale` | `Number` | `Infinity` | 最大缩放 |
| `overflowHidden` | `Boolean` | `true` | 隐藏溢出 |
| `background` | `String` | `"transparent"` | 背景色 |
| `useResizeObserver` | `Boolean` | `true` | 使用 ResizeObserver |
| `listenWindowResize` | `Boolean` | `true` | 监听窗口 resize |
| `containerSelector` | `String` | `""` | 自定义容器选择器 |
| `transitionDuration` | `Number` | `180` | 缩放过渡动画时长（ms） |
| `transitionTimingFunction` | `String` | `"cubic-bezier(0.22, 1, 0.36, 1)"` | 过渡缓动函数 |

**Slots**

| 插槽 | 作用域数据 | 说明 |
|---|---|---|
| `default` | `ScreenState` | 需要缩放的内容 |

**Events**: `@update` — 缩放状态更新，参数同 ScreenState

**Expose**: `refresh()` — 手动触发缩放重算

**使用示例**

```vue
<ProjectScreenScale :width="1920" :height="1080" mode="fixed-height">
  <div class="my-fixed-size-content">
    <!-- 这里的内容会按 1920x1080 缩放适配 -->
  </div>
</ProjectScreenScale>
```

---

### ProjectPanelShell

面板容器组件，标题条浮动在面板上方，带有装饰边框。

**Props**

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `String` | `"标题"` | 面板标题 |
| `showTitle` | `Boolean` | `true` | 是否显示浮动标题条 |
| `bodyClass` | `String` | `""` | 内容区额外 CSS class |
| `titleBackgroundImage` | `String` | `""` | 自定义标题条背景图 URL |
| `titleClickable` | `Boolean` | `false` | 标题是否可点击 |

**Slots**

| 插槽 | 说明 |
|---|---|
| `default` | 面板主体内容 |

**Events**

| 事件 | 说明 |
|---|---|
| `titleClick` | `titleClickable` 为 true 时点击标题触发 |

**使用示例**

```vue
<!-- 默认带标题 -->
<ProjectPanelShell title="监控指标">
  <div>内容...</div>
</ProjectPanelShell>

<!-- 隐藏标题 -->
<ProjectPanelShell title="无标题面板" :show-title="false">
  <div>内容...</div>
</ProjectPanelShell>
```

---

### CardSubTitle

轻量卡片容器组件，无装饰边框，只保留标题栏和内容区。适合嵌套在 ProjectPanelShell 内部做模块分区。

**Props**

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `String` | `"标题"` | 模块标题 |
| `showTitle` | `Boolean` | `true` | 是否显示标题栏 |

**Slots**

| 插槽 | 说明 |
|---|---|
| `default` | 卡片主体内容 |
| `header-right` | 标题栏右侧自定义区域 |

**使用示例**

```vue
<CardSubTitle title="监控指标">
  <template #header-right>
    <button>更多</button>
  </template>
  <div>内容...</div>
</CardSubTitle>
```

---

### GlobalDialog

独立弹窗组件。通常不直接使用，由 DialogContainer 和 dialogService 管理。

**Props**

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `String` | — | 弹窗标题 |
| `modelValue` | `Boolean` | — | 控制显示/隐藏 |
| `size` | `String` | `"medium"` | 预设尺寸：`medium` / `large` / `full` |
| `width` | `String` | — | 自定义宽度 |
| `height` | `String` | — | 自定义高度 |
| `closeOnClickMask` | `Boolean` | `true` | 点击遮罩层是否关闭 |

---

### DialogContainer

弹窗管理器，内部使用 GlobalDialog 渲染所有打开的弹窗。已在 ProjectScreenRoot 中内置，通常不需要手动引入。

---

## 弹窗服务 API

通过 `openBigScreenDialog` 以编程方式打开弹窗，比声明式组件更灵活。

```ts
import { openBigScreenDialog, closeDialog, dialogs } from "yl-big-screen";
import type { DialogItem } from "yl-big-screen";
```

### openBigScreenDialog(options)

打开一个弹窗，返回 Promise（在弹窗关闭时 resolve）。

```ts
openBigScreenDialog({
  title: "数据详情",
  component: MyDialogContent,  // Vue 组件
  size: "medium",              // "medium" | "large" | "full"
  props: {                     // 传给 component 的 props
    dataId: "123"
  },
  closeOnClickMask: true,      // 点击遮罩关闭
  onClose: (result) => {       // 关闭回调
    console.log("弹窗关闭，返回:", result);
  },
  onOpen: () => {              // 打开回调
    console.log("弹窗已打开");
  },
  onTitleClick: () => {        // 点击标题回调
    console.log("点击了弹窗标题");
  }
}).then(result => {
  console.log("弹窗已关闭，结果:", result);
});
```

弹窗内容组件会收到一个 `close` prop，调用它来关闭弹窗并传回数据：

```ts
// MyDialogContent.vue
const props = defineProps({
  dataId: String,
  close: Function
});

function handleConfirm() {
  props.close?.({ status: "ok", data: this.formData });
}
```

### closeDialog(id, result?)

手动关闭指定弹窗。

### dialogs

响应式弹窗列表（`Ref<DialogItem[]>`），用于自定义弹窗逻辑。

---

## 背景图

组件内置了默认的页面背景和标题栏背景图（通过 `import` 打包进 dist，npm 引用时无需额外配置）。

不传 `page-background-image` / `header-background-image` 即可使用默认图。

如需自定义，请使用**业务项目里能访问到的 URL**（`public` 目录或 `import` 后的地址），不要使用包内 `src/assets` 路径：

```vue
<script setup>
import myPageBg from "@/assets/my-page-bg.png";
import myHeaderBg from "@/assets/my-header-bg.png";
</script>

<template>
  <ProjectScreenRoot
    :page-background-image="myPageBg"
    :header-background-image="myHeaderBg"
  >
    ...
  </ProjectScreenRoot>
</template>
```

> 若传了 `page-background-image="/bg/xxx.svg"` 但文件不在宿主项目的 `public` 下，会表现为整页背景不显示，而头部默认图仍正常。

---

## 字体

组件标题使用 `YouSheBiaoTiHei` 字体（有回退：PingFang SC → Microsoft YaHei → sans-serif）。

要在项目中使用该字体，需自行引入字体文件并声明 `@font-face`：

```css
@font-face {
  font-family: 'YouSheBiaoTiHei';
  src: url('/fonts/YouSheBiaoTiHei.ttf') format('truetype');
}
```

---

## 在线 Demo

在线预览组件效果：[GitHub Pages 演示地址](https://lwlmfy.github.io/yl-big-screen)

## 本地开发

```bash
# pnpm
pnpm install
pnpm dev

# 或 npm
npm install
npm run dev
```

启动后打开 http://localhost:3100 查看组件效果。
