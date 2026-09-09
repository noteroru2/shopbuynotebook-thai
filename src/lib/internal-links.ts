import authority from '../data/rebuild-v2-internal-link-authority.json';

const normalizeInternalPath = (value: string) => {
  if (!value || !value.startsWith('/')) return value;
  const suffixIndex = value.search(/[?#]/u);
  const path = suffixIndex >= 0 ? value.slice(0, suffixIndex) : value;
  const suffix = suffixIndex >= 0 ? value.slice(suffixIndex) : '';
  const normalized = path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
  return `${normalized}${suffix}`;
};

const rewriteMap = authority.rewriteMap as Record<string, string>;

export function rewriteAuthorityHref(href: string) {
  if (!href || !href.startsWith('/')) return href;
  const normalized = normalizeInternalPath(href);
  const match = normalized.match(/^([^?#]+)(.*)$/u);
  if (!match) return normalized;
  const [, path, suffix] = match;
  return `${rewriteMap[path] ?? path}${suffix}`;
}

export const coreAuthorityOwners = authority.coreOwners;
export const priorityAuthorityBrands = authority.priorityBrands;
