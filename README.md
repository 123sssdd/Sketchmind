# Sketchmind

手绘风学习看板：记录 AI 全栈 / AI Agent 工程师方向的搜索、评分、挑选与应用进度。

**在线预览：** [https://sketchmind.grok.me](https://sketchmind.grok.me)（重建发布后生效）

## 数据模型

**数据库是唯一真相。** 页面只请求 `GET /api/hub`。仓库里的 `seed.json`（见 `rebuild/`）只在库为空时冷启动一次，不是运行时数据源。

写入：`POST /api/hub`（按 id 合并）、`DELETE /api/hub/:id`。导出快照仅用于备份。

重建说明与给 Grok Build 的提示词：[`rebuild/grok-build-prompt.md`](rebuild/grok-build-prompt.md)。种子：[`rebuild/seed.json`](rebuild/seed.json)。

本仓库根目录仍保留静态原型（`index.html` + `manifest.json`），便于本地预览 UI；正式站以带 API 的发布版为准。

## 本地静态预览

```bash
cd /workspace/learning-hub && python3 -m http.server 8080
```

浏览器打开 [http://localhost:8080](http://localhost:8080)。`file://` 会拦截 `fetch`。

## 工作流

多 Bot 协作：BrainStorm（主）→ Searcher → 质量评估 → 通知用户挑选 → 深挖新一轮；优化规划师复盘；手绘风技术配图负责画图；Memory 归档。架构图：[`docs/learning-workflow.png`](docs/learning-workflow.png)。
