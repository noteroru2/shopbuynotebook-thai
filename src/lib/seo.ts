export type BreadcrumbItem = { name: string; url: string };
export type FaqItem = { question: string; answer: string };

import { SITE } from '../config/site';
export { SITE };

export function absoluteUrl(pathname: string) {
  const base = SITE.url.replace(/\/$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export function localBusinessSchema(opts?: { description?: string }) {
  const description = opts?.description ?? SITE.description;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    alternateName: SITE.physicalStoreName,
    url: SITE.url,
    telephone: SITE.telephone,
    areaServed: SITE.areaServed,
    description,
    hasMap: SITE.googleMapsUrl,
    sameAs: [SITE.sameAs.facebook, SITE.lineUrl, SITE.sameAs.tiktok, SITE.googleMapsUrl],
  };
}

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageSchema(faqs: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };
}

export function serviceSchema(opts: { name: string; url: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    url: opts.url,
    description: opts.description,
    provider: {
      '@type': 'LocalBusiness',
      name: SITE.name,
      url: SITE.url,
      telephone: SITE.telephone,
    },
    areaServed: SITE.areaServed,
  };
}

