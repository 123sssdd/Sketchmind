在 /workspace/learning-hub/ 下构建一个本地手绘风格的学习看板（纯静态，无后端）。

## 数据
- 唯一数据源：./manifest.json，用 fetch('./manifest.json') 读取，禁止写死数据。
- 若 manifest.json 不存在，先按下面结构创建，并放 2 条示例数据（标注 example）。
- 结构：
{
  "version": 1,
  "updatedAt": "ISO 日期",
  "rounds": [{ "id": 1, "date": "", "topic": "", "picked": ["item-id"] }],
  "items": [{
    "id": "", "title": "", "url": "", "type": "skill|article|video|doc|repo",
    "source": "", "category": "编程|内容创作|...", "date": "", "summary": "",
    "quality": 0, "relevance": 0, "score": 0, "round": 1, "reason": "",
    "read": false, "applied": false, "effect": "", "notes": "", "tags": []
  }]
}

## 页面（index.html + style.css + app.js）
- 顶部：标题、统计（总数、已读、已应用、平均分）、筛选（类型、分类、轮次、已读、已应用）、排序（日期、综合分、质量、相关度）、搜索框。
- 主体：卡片网格，每条一张卡，显示标题链接、类型标签、来源、日期、简介、质量和相关度条形、已读和已应用勾选框、效果批注。
- 一个"轮次时间线"视图，展示每轮主题和挑选的条目。
- 勾选状态先存在 localStorage，并提供"导出更新后的 manifest.json"按钮。

## 手绘风格（遵循 project-diagram-studio 规范）
- 动手前先读 /home/box/agent-data/workflows/project-diagram-studio/references/visual-style.md 和 review-checklist.md，并严格遵守。
- 配色：纸面背景 #FFFEF8，文字和轮廓深藏蓝 #142A49；分区填充用浅蓝 #EAF6FF、浅绿 #EEF8E8、淡黄 #FFF8D8、浅粉 #FCEBF1、浅紫 #F0EDFF，每种类型固定一种。
- 线条：Rough.js（https://unpkg.com/roughjs/bundled/rough.js），只要轻微手绘感（roughness 约 0.8–1.2），容器对齐，不要抖动过度。
- 字体：主标题用手写粗字（如 LXGW WenKai Bold / Caveat），正文清晰易读，≥16px。
- 重点用少量荧光笔底纹强调；图标线条粗细一致；便签、纸飞机等装饰少用。
- 禁止：大面积深色、霓虹、厚重 3D、大渐变、密集小字。

## 运行
- 在 README.md 中写明：cd /workspace/learning-hub && python3 -m http.server 8080，然后打开 http://localhost:8080。
- 完成后启动服务并自检：页面能加载 manifest、筛选和排序可用、控制台无报错。
