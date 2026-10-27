# 学习看板

本地手绘风格的学习条目看板。纯静态页面，无后端，唯一数据源是 `manifest.json`。

## 运行

```bash
cd /workspace/learning-hub && python3 -m http.server 8080
```

浏览器打开 [http://localhost:8080](http://localhost:8080)。

请用本地 HTTP 服务打开。直接用 `file://` 打开时，浏览器会拦截 `fetch('./manifest.json')`。

## 功能

- 顶部统计：总数、已读、已应用、平均分（`score` 为空时记为「未评分」，不计入平均分）
- 按类型、分类、轮次、已读、已应用筛选，按日期 / 综合分 / 质量 / 相关度排序，并支持搜索
- 卡片展示标题链接、类型、来源、日期、简介、质量与相关度条形、已读 / 已应用勾选、效果批注
- 轮次时间线：每轮主题与挑选的条目
- 勾选和效果批注保存在浏览器 `localStorage`
- 「导出更新后的 manifest.json」会下载合并了本地勾选状态的 JSON，不会改写仓库里的 `manifest.json`

## 文件

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构 |
| `style.css` | 纸面手绘视觉 |
| `app.js` | 读取数据、筛选排序、绘制 Rough.js 描边 |
| `manifest.json` | 条目与轮次数据（应用不会修改此文件） |
