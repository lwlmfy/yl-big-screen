<script setup lang="ts">
import { defineComponent, h, ref } from "vue";
import {
  ProjectScreenRoot,
  ProjectPanelShell,
  openBigScreenDialog,
} from "../src/index";

// ── 全屏弹窗内容 ──
const FullDialog = defineComponent({
  props: { close: Function },
  setup(props) {
    const count = ref(0);
    return () =>
      h("div", { style: { padding: "20px", color: "#d7e6ff" } }, [
        h("p", { style: { fontSize: "18px", marginBottom: "16px" } }, "通过 openBigScreenDialog 打开的全屏弹窗 (size=full)"),
        h("p", { style: { marginBottom: "16px" } }, `计数器: ${count.value}`),
        h("button", {
          onClick: () => count.value++,
          style: {
            padding: "8px 20px", marginRight: "12px", cursor: "pointer",
            background: "rgba(62,224,255,0.2)", border: "1px solid rgba(62,224,255,0.5)",
            color: "#3ee0ff", borderRadius: "6px", fontSize: "14px"
          }
        }, "计数 +1"),
        h("button", {
          onClick: () => props.close?.("done"),
          style: {
            padding: "8px 20px", cursor: "pointer",
            background: "rgba(255,100,100,0.2)", border: "1px solid rgba(255,100,100,0.5)",
            color: "#ff6b6b", borderRadius: "6px", fontSize: "14px"
          }
        }, "关闭弹窗")
      ]);
  }
});

function openFullDialog() {
  openBigScreenDialog({
    title: "全屏弹窗",
    component: FullDialog,
    onClose: (r: any) => console.log("弹窗关闭:", r)
  });
}

// ── 大尺寸弹窗内容 ──
const LargeDialog = defineComponent({
  props: { close: Function },
  setup() {
    return () =>
      h("div", { style: { padding: "20px", color: "#d7e6ff" } }, [
        h("p", { style: { fontSize: "16px", marginBottom: "12px" } }, "大尺寸弹窗 (size=large) —— 适合表格、图表等复杂内容。"),
        h("button", {
          onClick: () => props.close?.(),
          style: {
            padding: "8px 20px", cursor: "pointer", marginTop: "12px",
            background: "rgba(62,224,255,0.2)", border: "1px solid rgba(62,224,255,0.5)",
            color: "#3ee0ff", borderRadius: "6px", fontSize: "14px"
          }
        }, "关闭")
      ]);
  }
});

function openLargeDialog() {
  openBigScreenDialog({
    title: "大尺寸弹窗",
    component: LargeDialog,
    size: "large"
  });
}

// 演示数据
const leftItems = [
  { label: "CPU 使用率", value: "47.2%", color: "#3ee0ff" },
  { label: "内存使用率", value: "63.8%", color: "#3ee0ff" },
  { label: "磁盘 IO", value: "12.5 MB/s", color: "#3ee0ff" },
  { label: "网络流量", value: "1.8 Gbps", color: "#3ee0ff" },
];

const centerItems = [
  { label: "待处理工单", value: "28" },
  { label: "进行中任务", value: "15" },
  { label: "已完成(今日)", value: "142" },
  { label: "超时未处理", value: "2" },
];

const rightItems = [
  { label: "在线用户", value: "12,847", color: "#ffd43b" },
  { label: "今日访问", value: "34,291", color: "#ffd43b" },
  { label: "异常告警", value: "3", color: "#ff6b6b" },
  { label: "运行天数", value: "128", color: "#ffd43b" },
];
</script>

<template>
  <ProjectScreenRoot
    title="组件预览"
    :width="1920"
    :height="1080"
    :header-height="80"
    :gap="16"
    content-padding="0 10px 10px"
  >
    <!-- 不传 header-left / header-right，右侧默认显示年月日时间 -->

    <!-- 主内容 -->
    <div style="display: grid; grid-template-columns: 420px 1fr 420px; gap: 16px; height: 100%;">
      <!-- ========== 左栏 ========== -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ProjectPanelShell title="系统监控">
          <div style="padding: 8px 14px;">
            <div
              v-for="item in leftItems" :key="item.label"
              style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(90,154,255,0.12);color:#d7e6ff;font-size:14px"
            >
              <span>{{ item.label }}</span>
              <span :style="{ color: item.color, fontWeight: '700', fontSize: '16px' }">{{ item.value }}</span>
            </div>
          </div>
        </ProjectPanelShell>

        <ProjectPanelShell title="任务概览">
          <div style="padding: 8px 14px;">
            <div
              v-for="item in centerItems" :key="item.label"
              style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(90,154,255,0.12);color:#d7e6ff;font-size:14px"
            >
              <span>{{ item.label }}</span>
              <span style="color: #3ee0ff; font-weight: 700; font-size: 16px;">{{ item.value }}</span>
            </div>
          </div>
        </ProjectPanelShell>

        <ProjectPanelShell title="业务指标">
          <div style="padding: 8px 14px;">
            <div
              v-for="item in rightItems" :key="item.label"
              style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(90,154,255,0.12);color:#d7e6ff;font-size:14px"
            >
              <span>{{ item.label }}</span>
              <span :style="{ color: item.color, fontWeight: '700', fontSize: '16px' }">{{ item.value }}</span>
            </div>
          </div>
        </ProjectPanelShell>
      </div>

      <!-- ========== 中间 ========== -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ProjectPanelShell title="组件说明" style="height: 70%">
          <div style="padding: 12px 16px; color: #d7e6ff; font-size: 14px; line-height: 2;">
            <div><strong>ProjectScreenRoot</strong> — 大屏根布局，标题栏 + 自适应缩放 + 弹窗容器</div>
            <div><strong>ProjectScreenScale</strong> — 缩放容器，contain/cover/height/stretch 等模式</div>
            <div><strong>ProjectPanelShell</strong> — 面板容器，浮动标题条，showTitle=false 可隐藏</div>
            <div><strong>openBigScreenDialog</strong> — Promise 风格弹窗，medium/large/full</div>
          </div>
        </ProjectPanelShell>

        <ProjectPanelShell title="功能演示" style="flex: 1;">
          <div style="padding: 16px; color: #d7e6ff; font-size: 14px; display: flex; flex-direction: column; gap: 12px;">
            <p>点击按钮打开不同类型的弹窗：</p>
            <div style="display: flex; gap: 12px;">
              <button
                style="padding:8px 20px;cursor:pointer;background:rgba(62,224,255,0.15);border:1px solid rgba(62,224,255,0.4);color:#3ee0ff;border-radius:6px;font-size:14px"
                @click="openFullDialog"
              >全屏弹窗 (默认)</button>
              <button
                style="padding:8px 20px;cursor:pointer;background:rgba(255,212,59,0.15);border:1px solid rgba(255,212,59,0.4);color:#ffd43b;border-radius:6px;font-size:14px"
                @click="openLargeDialog"
              >大尺寸弹窗</button>
            </div>
            <div style="color: rgba(221,239,255,0.55); font-size: 13px; line-height: 1.8; margin-top: 8px;">
              <div>标题右侧默认显示当前年月日时间</div>
              <div>传 showDateTime=false 可隐藏时间</div>
              <div>传 header-right 插槽会覆盖默认时间</div>
              <div>调整窗口大小查看自适应缩放</div>
            </div>
          </div>
        </ProjectPanelShell>
      </div>

      <!-- ========== 右栏 ========== -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ProjectPanelShell title="实时状态">
          <template #default="screenState">
            <div style="padding: 10px 14px; color: #d7e6ff; font-size: 13px; font-family: monospace; line-height: 1.9;">
              <div>容器: {{ screenState["container-width"] }} x {{ screenState["container-height"] }}</div>
              <div>Scale: {{ screenState["scale"]?.toFixed(4) }}</div>
              <div>ScaleX: {{ screenState["scale-x"]?.toFixed(4) }}</div>
              <div>ScaleY: {{ screenState["scale-y"]?.toFixed(4) }}</div>
              <div>Offset: {{ screenState["offset-x"] }}, {{ screenState["offset-y"] }}</div>
            </div>
          </template>
        </ProjectPanelShell>

        <ProjectPanelShell title="Props速查">
          <div style="padding: 10px 14px; color: #d7e6ff; font-size: 13px; line-height: 1.9;">
            <div style="color: #3ee0ff;">ProjectScreenRoot</div>
            <div>width/height · scaleMode · renderMode</div>
            <div>showDateTime · showHeader</div>
            <div>pageBackgroundImage</div>
            <div style="color: #3ee0ff; margin-top: 6px;">ProjectPanelShell</div>
            <div>title · showTitle</div>
            <div>titleClickable</div>
          </div>
        </ProjectPanelShell>

        <ProjectPanelShell :show-title="false">
          <div style="padding: 10px 14px; color: rgba(221,239,255,0.55); font-size: 13px; text-align: center;">
            无标题面板 (showTitle=false)
          </div>
        </ProjectPanelShell>
      </div>
    </div>
  </ProjectScreenRoot>
</template>

<style>
body {
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  background: #07111f;
}
</style>
