# 重建 Sketchmind（数据库为唯一真相）

目标：做一个公开的手绘风学习看板，部署到 `https://sketchmind.grok.me`。别的 AI 写入后，访客刷新就能看到，不必为加数据再发版。

参考仓库：https://github.com/123sssdd/Sketchmind（静态 UI / 手绘风格可复用）。种子数据见同目录 `seed.json`。

## 核心原则（必须遵守）

1. **数据库是唯一真相。** 页面运行时只请求 `GET /api/hub`，禁止 `fetch('./manifest.json')`。
2. **文件只叫 `seed.json`，只做冷启动。** 仅当数据库为空时导入一次；之后运行时永远不再读它。不要再叫它 manifest，也不要在 UI 文案里把它说成「数据源」。
3. **写入只走 API。** 别的 AI、导入按钮都调用 API，不要靠改代码再 Publish 来加数据。

## API

- `GET /api/hub` → `{ version, updatedAt, rounds, items }`（与种子同结构）
- `POST /api/hub` → 按 `id` 合并：新 id 追加，相同 id 更新字段，未出现的旧条目保留。body 可以是完整对象，或 `{ items: [...], rounds?: [...] }`。返回合并后的完整清单。
- `DELETE /api/hub/:id` → 删除单条 item（纠错用，必须有）
- `PUT /api/hub` → 仅管理员/受保护：用 body 整表覆盖（紧急恢复用；普通导入不要用）

合并规则写进接口注释。所有写接口成功后更新 `updatedAt`。

## 前端

- 复用 Sketchmind 的手绘风 UI（Rough.js、配色 #FFFEF8 / #142A49，分区浅蓝/绿/黄/粉/紫）。
- 启动时只从 `GET /api/hub` 拉数据。
- 「导入」：选择 JSON → `POST /api/hub`；成功后重新 GET 刷新。文案写成「导入到线上清单」，不要写「同步 manifest」。
- 「导出快照」：下载当前 `GET` 结果为 JSON，用途是备份，不是热路径。
- 「已读 / 已应用 / 效果」短期仍存 `localStorage`（按 item id）；不要和线上清单混写，除非另做用户身份。
- 筛选、排序、搜索、轮次时间线保持现有能力。

## 种子

- 把附件/`seed.json` 放进项目，例如 `data/seed.json`。
- 服务启动或首次 `GET` 时：若库为空，把 seed 写入数据库，然后只从库读。
- Publish 之后，用种子再 POST 一次做校验也可以，但逻辑上仍是「库空才种」。

## 发布检查清单

1. Publish 带数据库的这一版。
2. 打开已发布域名，确认列表来自 API（Network 里能看到 `/api/hub`）。
3. 用一条测试 item `POST`，刷新另一浏览器窗口能看到。
4. 再 `DELETE` 掉测试 item，确认消失。
5. 不要在预览环境当正式写入入口。

## 不要做的事

- 不要保留「代码里的 manifest + 数据库」双清单叙事。
- 不要让预览导入写进正式库（若平台做不到隔离，就在 UI 标明「仅预览，不会进正式站」）。
- 不要为了加几条数据要求用户重新 Publish。
