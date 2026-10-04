import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { site, withBase, siteDescription } from '../../data/site';
import { canonicalSlugOf } from '../../i18n';

/**
 * English RSS feed — /en/rss.xml.
 * Contains only posts tagged as lang="en". The default-locale Chinese feed
 * lives at /rss.xml (see src/pages/rss.xml.ts).
 */
export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft && data.lang === 'en')).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: `${site.title} (English)`,
    description: siteDescription('en'),
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: withBase(`/en/blog/${canonicalSlugOf(post.id)}/`),
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}
