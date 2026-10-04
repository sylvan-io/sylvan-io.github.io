# AGENT.md

本文档为 AI 助手（Codex / Claude Code 等）提供项目上下文，让助手在不熟悉项目的情况下也能给出符合预期的修改建议。

## 项目概述

### 产品定位

**Sylvan 的个人技术博客**，部署在 `https://sylvan-io.github.io`。

- **形态**：单作者静态博客 + 个人作品集
- **主航道**：互联网架构、编程语言（Go / Java / Python / Rust）、AI 与 AI Agent、容器与中间件、系统架构设计
- **读者**：技术同行（工程师 / 架构师 / AI 应用开发者），默认中文受众
- **品牌**：克制、内容驱动、工程师审美；视觉风格延续 [astro-wanderer](https://github.com/igagansingh/astro-wanderer) 主题

### 做什么

1. 写作并发布 Markdown 文章（**blog**）
2. 展示个人简历 / 工作经历（**work**）
3. 罗列 GitHub 开源项目（**projects**）
4. 个人名片页（**home**，承载 Hero 区块 + 打字机角色 + 星空动画）
5. 自动构建并发布到 GitHub Pages

### 不做什么

- **不接评论系统**（无 giscus / utterances）
- **不接访问统计**（无 Umami / Plausible / GA）
- **已支持 i18n**（中 / 英双语，默认中文根路由 + `/en/*`，英文回退到中文）
- **不做独立 `/tags` 页面**（标签整合在 `/blog` 顶部过滤栏）
- **不做 `/about` 页面**（wanderer 默认没有；品牌信息在 `/home`）
- **不做 Project 详情页**（MVP 简化，卡片直跳 GitHub）
- **不做 GitHub API 集成**（不展示 star / fork 数）
- **不做搜索**
- **不做 Newsletter / 邮件订阅**
- **不做系列文章索引页**（`series` 字段已预留，等系列 ≥ 3 篇再启用）

### 技术栈

| 层 | 选型 |
|---|---|
| 静态站点生成器 | [Astro](https://astro.build/) 5.x（严格 TS） |
| 主题 | [astro-wanderer](https://github.com/igagansingh/astro-wanderer)（MIT，已在 README 致谢） |
| 内容格式 | Markdown（`.md`），frontmatter schema 强校验 |
| RSS / Sitemap | `@astrojs/rss` + `@astrojs/sitemap` |
| 字体 | `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono` |
| 部署 | GitHub Pages（用户页仓库，源 = "GitHub Actions"） |
| CI/CD | `.github/workflows/deploy.yml` → `withastro/action@v3` → `actions/deploy-pages@v4` |
| 运行环境 | Node.js ≥ 22 |

### 路由与导航

```
导航：Home / Work / Blog / Projects（4 项，顺序固定，label 走 i18n 字典）

/                → Astro.redirect('/blog')        （302）
/home            → Hero（个人名片，含 typing 角色动画 + 星空背景）
/blog            → 文章列表 + 标签过滤栏（默认入口）
/blog/[slug]     → 单篇文章
/work            → 工作经历（来自 src/data/resume.ts）
/projects        → GitHub 开源项目卡片网格
/rss.xml         → RSS（中文，含 lang="zh-cn"）
/sitemap-index.xml
/404

/en/             → Astro.redirect('/en/blog')    （302）
/en/home         → 英文 Hero
/en/blog         → 英文文章列表（混合语种卡片，缺失翻译时显示 ZH 徽标）
/en/blog/[slug]  → 英文文章（有翻译时渲染英文；否则回退到中文并显示角标）
/en/work         → 英文工作经历
/en/projects     → 英文项目
/en/rss.xml      → 英文 RSS（含 lang="en-us"）
```


### i18n / 多语言支持

**目标**：默认语言 = 中文（根路由）；英文 = `/en/*` 子路径；博客文章走"翻译优先 / 回退中文"模式。

**配置位置**：`astro.config.mjs` → `i18n: { defaultLocale: 'zh-CN', locales: ['zh-CN', 'en'], routing: { prefixDefaultLocale: false } }`。
**字典**：`src/i18n/{zh-CN,en}.json` —— 所有 UI 文案在这里维护。
**翻译函数**：`import { useT } from '../utils/t'; const t = useT(Astro.currentLocale); t('nav.home')`。
**辅助**：`src/i18n/index.ts` 暴露 `LOCALES / Locale / DEFAULT_LOCALE / LOCALE_LABELS / LOCALE_BCP47 / OG_LOCALES / prefixPathname / stripLocalePrefix / canonicalSlugOf`。

#### 新增一种语言（如日语）

1. `astro.config.mjs` → `locales: ['zh-CN', 'en', 'ja']`、`prefixPathname` / `stripLocalePrefix` 不变。
2. `src/i18n/index.ts` → `LOCALES` 加 `'ja'`、`LOCALE_LABELS` 加一行、`LOCALE_BCP47` / `OG_LOCALES` 加对应映射。
3. 新建 `src/i18n/ja.json`（复制 en.json 改值即可，键必须一致）。
4. `src/content.config.ts` → `BLOG_LANGS` 加 `'ja'`；blog / projects schema 的 `lang` 枚举同步。
5. 新建 `src/pages/ja/index.astro`（302 → `/ja/blog`）+ 5 个镜像页面（home / work / projects / blog/index / blog/[...slug]）。
6. `src/pages/ja/rss.xml.ts`（镜像 `en/rss.xml.ts`）。

#### 新增一篇英文博客文章

1. 写中文版：`src/content/blog/hello-world.md`，frontmatter 加 `lang: zh-CN`（或省略，默认就是 zh-CN）。
2. 写英文版：`src/content/blog/hello-world.en.md`，frontmatter **必须**显式声明：
   ```yaml
   ---
   slug: hello-world.en       # 必填 —— Astro 的 github-slugger 会吞掉文件名里的 `.en`，用 slug 还原
   title: Hello World
   description: ...
   pubDate: 2026-10-01
   tags: ["go"]
   lang: en                   # 必填
   translations:
     zh-CN: hello-world       # 可选：明确指向中文版 id
   ---
   ```
3. 不要手动访问 `/blog/hello-world.en/` —— 该 URL 不会生成。所有公开 URL 都是 canonical slug（`/blog/hello-world/`、`/en/blog/hello-world/`）。`resolvePost` 在 `<locale>.en` 不存在时自动回退到中文版，并在右下角弹出"正在阅读 中文 / 查看英文版"角标。
4. `resolvePost` / `getLocalizedList` / `getPostNeighbors` 已封装在 `src/utils/posts.ts`；新增博客详情页时直接用，不要自己写 fallback 逻辑。

#### 文案翻译流程

- 文案改字 → `src/i18n/zh-CN.json` 与 `en.json` **两边同步改**。
- 新增 UI 文案 → 先在两本字典里都加上对应 key，再在组件里 `t('new.key')`。缺 key 时构建不会失败（fallback 到默认 locale，再缺就回退到 key 字面量，便于 grep）。


### 内容数据规则

#### Blog（`src/content/blog/*.md`）

```yaml
---
title: string                     # 必填
description: string               # 必填
pubDate: Date                     # 必填
updatedDate?: Date                # 可选
tags: BlogTag[]                   # 必填但可空数组
series?: string                   # 可选（如 "Go 进阶"）
seriesOrder?: positive int        # 可选，强制排序
draft?: boolean = false           # true 则不进入生产构建
heroImage?: string                # 可选
---
```

**9 个 blog tags**（frontmatter 用 slug，展示用中文）：

| slug | 中文 |
|---|---|
| `cs-fundamentals` | 计算机基础 |
| `go` | Go |
| `java` | Java |
| `python` | Python |
| `rust` | Rust |
| `ai` | AI |
| `containers` | 容器 |
| `middleware` | 中间件 |
| `architecture` | 架构设计 |

→ 标签枚举在 `src/content.config.ts` 的 `BLOG_TAGS`，中文映射在 `src/utils/tags.ts` 的 `TAG_LABELS` / `TAG_DESCRIPTIONS`。**两边必须保持同步**。

#### Projects（`src/content/projects/*.md`）

```yaml
---
title: string                     # 必填
description: string               # 必填
repoUrl: URL                      # 必填
demoUrl?: URL                     # 可选
stack: string[]                   # 必填但可空
coverImage?: string               # 可选
startDate: Date                   # 必填
endDate?: Date                    # 可选（不填 = 进行中）
order: int = 0                    # 越小越靠前
draft?: boolean = false
---
```

**MVP 阶段不渲染 Projects 详情页**——卡片直接跳 `repoUrl`。

### 站点身份（`src/data/site.ts`）

```ts
site = {
  title: 'Sylvan',
  shortTitle: 'sylvan',
  url: 'https://sylvan-io.github.io',
  author: { name: 'Sylvan', email: '<TODO>', location: 'China' },
  socials: {
    github:    { url: 'https://github.com/sylvan-io', ... },
    linkedin:  { url: '<TODO>', ... },     // 不用可设 null
    instagram: { url: '<TODO>', ... },     // 不用可设 null
    email:     { url: 'mailto:ou_xue_ying@sina.com', ... },
    rss:       { url: '/rss.xml', ... },
  },
};
```

Hero 打字机角色数组在 `src/data/resume.ts` 的 `typingRoles`：

```ts
typingRoles = ['Internet Architect', 'AI Agent Builder', 'Lifelong Learner'];
```

### 部署与运维预期

| 项 | 预期 |
|---|---|
| 触发 | `push` 到 `main` 分支；也支持 `workflow_dispatch` 手动触发 |
| 部署目标 | GitHub Pages（用户页仓库，必须 Source = "GitHub Actions"） |
| Workflow 权限 | `pages: write` + `id-token: write` + `contents: read` |
| Node 版本 | 22（由 `actions/setup-node@v4` 固定） |
| 缓存 | `npm` 缓存由 setup-node 自动管理 |
| 并发 | `concurrency: pages`，新 push 不取消旧部署 |
| 构建产物 | `./dist`，由 `actions/upload-pages-artifact@v3` 上传 |
| 回滚 | 重新触发历史 commit 的 deploy workflow 即可 |
| 失败定位 | GitHub Actions 日志 + 本地 `npm run build` / `npm run check` |

### 本地开发

```bash
npm install        # 依赖
npm run dev        # http://localhost:4321 → 自动跳 /blog
npm run build      # 生产构建到 dist/
npm run preview    # 预览构建产物
npm run check      # Astro + TypeScript 类型检查（保持 0 error）
```

### 文件 / 目录速查

| 路径 | 角色 |
|---|---|
| `src/i18n/{index.ts,zh-CN.json,en.json}` | i18n 字典与 Locale helper |
| `src/utils/t.ts` | `useT(locale)` —— 翻译函数 |
| `src/components/LangSwitcher.astro` | Header 右上角的语言切换 |
| `src/components/TranslationFallbackBadge.astro` | 文章回退时右下角的悬浮角标 |
| `src/pages/en/**` | 英文路由镜像（home / work / projects / blog/index / blog/[...slug] / rss.xml） |
| `src/content.config.ts` | blog + projects schema 定义（新增 `lang` / `translations` / `slug`） |
| `src/data/site.ts` | 站点身份、socials、URL helper |
| `src/data/resume.ts` | work 页数据 + Hero typing roles |
| `src/utils/tags.ts` | tag slug ↔ 中文名映射 |
| `src/utils/posts.ts` | `getAllPosts` / `getRecentPosts` / `getPostsByTag` / `formatDate` / `readingTime` |
| `src/components/Hero.astro` | Hero 区块（保留 wanderer 原版） |
| `src/components/PostCard.astro` | 文章卡片（YYYY-MM-DD + 中文标签） |
| `src/components/ProjectCard.astro` | Project 卡片（直跳 GitHub） |
| `src/pages/index.astro` | 一行 `Astro.redirect('/blog')` |
| `src/pages/home.astro` | Hero 页（承载 wanderer 原 index 内容） |
| `.github/workflows/deploy.yml` | GitHub Actions 部署流水线 |

### 强制约束（改动前请确认）

1. **不允许修改 9 个 tag slug**——改了会破坏所有 `/blog/tags/<slug>/` URL 和 RSS category
2. **不允许删除 wanderer 的 Hero 组件**——必须保留 `Hero.astro` 文件本身；只是默认入口是 `/blog`
3. **不允许引入客户端 JS 框架**（React / Vue / Svelte）——保持纯静态
4. **schema 字段新增**要同步更新 `src/content.config.ts`、README 的 frontmatter 示例、所有引用该字段的页面/组件
5. **新增依赖**前先确认 npm 缓存能解析（避免在沙箱环境装到一半失败）
6. **占位符 TODO**（`site.author.email` / `socials.*.url` / `resume.experience[]`）上线前必须替换
7. **禁止在修改代码后执行编译 / `npm run preview`**——改完代码后不得自行运行 `npm run build`、`npm run check`、`npm run preview` 等编译或预览命令；如需要验证，先列出待执行命令与预期，交由用户自行触发
