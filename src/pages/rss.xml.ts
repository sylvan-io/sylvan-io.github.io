import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site, withBase, siteDescription } from '../data/site';
import { canonicalSlugOf } from '../i18n';

/**
 * Chinese (default locale) RSS feed — /rss.xml.
 * Contains only posts tagged as lang="zh-CN". Other locales serve their
 * own feed at /en/rss.xml (see src/pages/en/rss.xml.ts).
 */
export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft && data.lang === 'zh-CN')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: site.title,
    description: siteDescription('zh-CN'),
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: withBase(`/blog/${canonicalSlugOf(post.id)}/`),
      categories: post.data.tags,
    })),
    customData: `<language>zh-cn</language>`,
  });
}
