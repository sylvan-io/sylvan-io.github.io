# Sylvan 的技术博客

记录互联网架构、编程语言、AI 落地相关的学习与实践。

## 主题

计算机基础 · Go · Java · Python · Rust · AI · 容器 · 中间件 · 架构设计

## 技术栈

基于 [Astro](https://astro.build/) + [astro-wanderer](https://github.com/igagansingh/astro-wanderer) 主题，通过 GitHub Actions 自动构建并发布到 GitHub Pages。

## 本地开发

```bash
git clone https://github.com/sylvan-io/sylvan-io.github.io.git
cd sylvan-io.github.io
npm install
npm run dev      # http://localhost:4321
```
构建与预览：

```bash
npm run build    # 产出 dist/
npm run preview  # 本地预览构建产物
npm run check    # TypeScript / Astro 类型检查
```

## 写作一篇新文章

1. 在 `src/content/blog/` 下新建 `.md` 文件（文件名建议英文连字符）
2. 按下面 frontmatter schema 填写
3. `draft: true` 时不会出现在生产构建中

```yaml
---
title: 文章标题
description: 一句话简介
pubDate: 2026-09-30
updatedDate: 2026-10-15       # 可选
tags: ["go", "architecture"]  # 9 个标签 slug 之一
series: "Go 进阶"             # 可选
seriesOrder: 1                # 可选，正整数
draft: false                  # true 则仅本地可见
heroImage: /images/x.jpg      # 可选
---
```

可用 `tags` slug：`cs-fundamentals`、`go`、`java`、`python`、`rust`、`ai`、`containers`、`middleware`、`architecture`。

## 添加一个新 Project

在 `src/content/projects/` 下新建 `.md` 文件：

```yaml
---
title: 项目名
description: 项目简介
repoUrl: https://github.com/sylvan-io/xxx
demoUrl: https://xxx.example.com    # 可选
stack: ["Go", "Kubernetes"]
startDate: 2025-03-01
endDate:                       # 可选，不填表示进行中
order: 0                       # 越小越靠前
---
```

## 多语言支持

- **默认语言**：中文（根路由 `/`）
- **英文**：`/en/*` 子路径
- **博客翻译**：每篇文章中文版为 canonical slug；英文版文件名加 `.en` 后缀（如 `hello-world.md` + `hello-world.en.md`）。访问 `/en/blog/hello-world/` 时自动选择英文版，缺失翻译时回退中文版并在右下角弹出"正在阅读 中文"角标
- **UI 文案**：所有可见文案走 `src/i18n/{zh-CN,en}.json` 字典；新增翻译时使用 `import { useT } from '../utils/t'; const t = useT(Astro.currentLocale);`
- **完整文档**：见 `AGENT.md` 的 *i18n / 多语言支持* 章节

### 新增一篇英文博客

```bash
# 1. 已有中文版 hello-world.md
# 2. 新建英文版，注意 slug 必填（Astro 的 github-slugger 会吞掉 .en）
cat > src/content/blog/hello-world.en.md << 'EOF'
---
slug: hello-world.en
title: Hello World
description: An English demo
pubDate: 2026-10-01
tags: ["go"]
lang: en
translations:
  zh-CN: hello-world
---

(English content here)
EOF
```

## 部署

`push` 到 `main` 分支 → `.github/workflows/deploy.yml` 自动构建 → 发布到 GitHub Pages。

首次部署需要在 GitHub 仓库 Settings → Pages → Source 选 **"GitHub Actions"**。

## 致谢 / Credits

本博客基于 [astro-wanderer](https://github.com/igagansingh/astro-wanderer) 模板构建，原作者为 [Gagan Singh](https://github.com/igagansingh)，采用 [MIT License](https://github.com/igagansingh/astro-wanderer/blob/main/LICENSE) 开源。

在 wanderer 基础上做了以下定制：
- Hero 内容与社交链接替换为个人化信息
- 新增 `/projects` 页面，承载 GitHub 开源项目列表
- `/` 自动重定向到 `/blog`，Hero 内容迁移至 `/home`
- 文章 frontmatter schema 改为 `pubDate` + 9 个英文 slug 标签 + 可选 `series` 字段
- 中文日期格式 `YYYY-MM-DD`、中文 UI 文案、简化 Hero 区域外的内容入口
- 删除 wanderer 默认的 `/travel` 路由与 `trips` content collection

非常感谢 Gagan Singh 提供了一个简洁、克制、内容驱动的 Astro 主题。

## License

[MIT](./LICENSE)
