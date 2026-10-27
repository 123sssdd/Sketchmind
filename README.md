# Sketchmind

手绘风学习看板：沉淀 AI 全栈 / AI Agent 方向的资料、评分与进度。

**在线：** https://123sssdd.github.io/Sketchmind/

唯一数据文件是根目录 `manifest.json`。由 **Memory** bot 更新并 push，GitHub Pages 自动发布。BrainStorm 只负责产出内容并通知 Memory 写什么。

## 本地预览

```bash
python3 -m http.server 8080
```

打开 http://localhost:8080（不要用 `file://`）。

## 更新数据

Memory（或有写权限的维护者）编辑 `manifest.json` 后：

```bash
git add manifest.json && git commit -m "update hub" && git push
```

稍等 Pages 构建，刷新即可。

## 协作

见 `docs/learning-workflow.png` 与仓库外的 bot 指令清单。角色：BrainStorm（主）· Searcher · 质量评估 · Memory（写清单）· 优化规划师 · 手绘风技术配图。

## 目录

| 路径 | 说明 |
| --- | --- |
| `index.html` / `style.css` / `app.js` | 界面 |
| `manifest.json` | 清单 |
| `docs/` | 工作流架构图 |
| `fonts/` / `vendor/` | 字体与 Rough.js |
