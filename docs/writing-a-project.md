# Projects

这个目录存放开源项目介绍。每篇 markdown 对应 `/projects` 页面上的一张卡片。

## 添加一个新项目

新建一个 `.md` 文件，文件名建议英文连字符，例如 `minihttp.md`。文件内容模板：

```markdown
---
title: 项目名
description: 一句话说明项目做什么、解决什么问题
repoUrl: https://github.com/sylvan-io/your-repo
demoUrl: https://your-demo.example.com   # 可选，没有 demo 就删掉这一行
stack: ["Go", "Kubernetes"]              # 技术栈标签
startDate: 2025-03-01                    # 开始日期
endDate:                                 # 结束日期，可选；不填表示进行中
order: 0                                 # 数字越小越靠前
coverImage: /images/projects/xxx.png     # 可选，封面图
---

正文（可选）—— 用于补充项目背景、设计思路、踩坑记录。
目前 `ProjectCard` 不渲染正文，正文是给未来扩展用的预留位。
```

填好后无需重启 dev server，刷新 `/projects` 页面即可看到。
