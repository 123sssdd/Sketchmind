# Sketchmind 发布说明

Sketchmind 是一个公开的手绘风学习看板。访客刷新即可看到最新清单；其他 AI 通过 API 写入，不必为加数据再发版。

在线地址：https://sketchmind.grok.me

## 架构

- **运行时唯一数据源：数据库**，经 `GET /api/hub` 读写。
- `data/hub.json` 只在数据库为空时导入一次，用于首次上线。之后进程不再读这个文件。
- 前端只请求 `/api/hub`，不直接读仓库里的 JSON。

## API

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| GET | `/api/hub` | 返回完整清单 `{ version, updatedAt, rounds, items }` |
| POST | `/api/hub` | 按 `id` 合并：新 id 追加，同 id 更新，未提及的旧条目保留 |
| DELETE | `/api/hub/:id` | 删除单条 |
| PUT | `/api/hub` | 整表覆盖（恢复用，日常导入不要用） |

写成功后更新 `updatedAt`。

## 前端约定

- 启动只拉 `GET /api/hub`。
- 「导入」：选 JSON → `POST /api/hub` → 再 GET 刷新。
- 「导出快照」：下载当前 GET 结果，仅作备份。
- 「已读 / 已应用 / 效果」存浏览器 `localStorage`（按 item id），与线上清单分开。

## 上线检查

1. Publish 本项目（需带数据库）。
2. 打开正式域名，确认 Network 里是 `/api/hub`。
3. `POST` 一条测试数据，另一浏览器刷新能看到。
4. `DELETE` 测试数据，确认消失。
5. 正式写入只打已发布域名，不要打预览环境。

## 本地静态预览

无 API 时可用仓库自带页面预览 UI：根目录执行 `python3 -m http.server 8080`，页面会读 `data/hub.json`。这与线上路径不同，仅用于看样式。
