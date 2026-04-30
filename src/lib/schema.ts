import { SITE } from '../config/site';
import { absoluteUrl } from './seo';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    alternateName: SITE.physicalStoreName,
    url: SITE.url,
    logo: absoluteUrl(SITE.logo),
    telephone: SITE.telephone,
    description: SITE.description,
    sameAs: [SITE.sameAs.facebook, SITE.lineUrl, SITE.sameAs.tiktok, SITE.googleMapsUrl],
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: SITE.language,
  };
}

export function webPageSchema(opts: { title: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    description: opts.description,
    url: opts.url,
    inLanguage: SITE.language,
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
  };
}

export function blogPostingSchema(opts: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: opts.headline,
    description: opts.description,
    mainEntityOfPage: opts.url,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    inLanguage: SITE.language,
    author: { '@type': 'Organization', name: SITE.name, url: SITE.url },
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url, logo: { '@type': 'ImageObject', url: absoluteUrl(SITE.logo) } },
    ...(opts.image ? { image: [opts.image] } : {}),
  };
}

export function itemListSchema(opts: { name: string; url: string; items: { name: string; url: string }[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    url: opts.url,
    itemListElement: opts.items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      url: it.url,
    })),
  };
}

