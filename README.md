# Sketchmind

手绘风学习看板：沉淀 AI 全栈 / AI Agent 方向的资料、评分与进度。

**在线：** https://123sssdd.github.io/Sketchmind/

唯一数据文件是根目录的 `manifest.json`。更新清单 → `git push` → GitHub Pages 自动发布。

## 本地预览

```bash
python3 -m http.server 8080
```

打开 http://localhost:8080 （不要用 `file://`）。

## 更新数据

1. 编辑 `manifest.json`（或导入合并后覆盖）
2. `git add manifest.json && git commit && git push`
3. 稍等 Pages 构建完成，刷新网站即可

## 目录

| 路径 | 说明 |
| --- | --- |
| `index.html` / `style.css` / `app.js` | 界面 |
| `manifest.json` | 清单数据 |
| `docs/` | 工作流架构图 |
| `fonts/` / `vendor/` | 字体与 Rough.js |
