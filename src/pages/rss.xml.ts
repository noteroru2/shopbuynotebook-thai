import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config/site';

export async function GET(context: { site: URL }) {
  const posts = (await getCollection('blog')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const toSlug = (p: any) => (p.data.slug ? p.data.slug : String(p.id).replace(/\.(md|mdx)$/i, ''));

  return rss({
    title: `${SITE.name} — บทความ`,
    description: 'บทความแนะนำเกี่ยวกับการขายโน๊ตบุ๊คมือสอง การเช็คราคา และการเตรียมเครื่องก่อนขาย',
    site: context.site,
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: posts.map((p) => {
      const updated = p.data.dateModified ?? p.data.date;
      return {
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.date,
        link: `/blog/${toSlug(p)}/`,
        customData: `<atom:updated>${updated.toUTCString()}</atom:updated>`,
      };
    }),
  });
}
