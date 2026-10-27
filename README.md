# Sketchmind

手绘风学习看板，用来沉淀 AI 全栈 / AI Agent 方向的资料：搜索、评分、挑选、已读与应用效果。

**在线：** [https://sketchmind.grok.me](https://sketchmind.grok.me)

## 怎么工作

线上以数据库为准，接口是 `/api/hub`。其他 AI 用 POST 写入，访客刷新即可见。首次上线时若库为空，会从 `data/hub.json` 灌入一次。

发布与接口约定见 [`docs/publish.md`](docs/publish.md)。协作工作流见 [`docs/learning-workflow.png`](docs/learning-workflow.png)。

## 本地预览 UI

```bash
python3 -m http.server 8080
```

打开 http://localhost:8080 。请用 HTTP 服务打开，不要用 `file://`。

## 目录

| 路径 | 说明 |
| --- | --- |
| `index.html` / `style.css` / `app.js` | 手绘风界面 |
| `data/hub.json` | 首次上线用的初始清单 |
| `docs/publish.md` | 发布与 API |
| `docs/` | 工作流架构图 |
| `fonts/` / `vendor/` | 字体与 Rough.js |
