type ConsentValue = 'granted' | 'denied';
type EventParams = Record<string, string | number | boolean>;

export {};

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const provider = document.querySelector<HTMLMetaElement>('meta[name="analytics-provider"]')?.content ?? 'none';
const debug = new URLSearchParams(window.location.search).get('analytics_debug') === '1';
const consentKey = 'rnb_analytics_consent_v1';
const sessionKey = 'rnb_analytics_session_v1';
const fired = new Set<string>();
const pendingFirstPartyEvents: Array<{ name: string; params: EventParams }> = [];

const readConsent = (): ConsentValue | null => {
  try {
    const value = window.localStorage.getItem(consentKey);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
};
let consentState = readConsent();

const cleanText = (value: string | null | undefined, max = 100) =>
  (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const pageType = () => {
  const path = decodeURI(window.location.pathname);
  if (path === '/') return 'homepage';
  if (path.startsWith('/ประเมินราคา/')) return 'valuation';
  if (path.startsWith('/แบรนด์/')) return 'brand';
  if (path.startsWith('/รุ่น/')) return 'model';
  if (path.startsWith('/อาการ/')) return 'condition';
  if (path.startsWith('/พื้นที่/') || path.startsWith('/พื้นที่ให้บริการ/')) return 'location';
  if (path.startsWith('/blog/')) return 'blog';
  if (/รับเหมา|รับประมูล/.test(path)) return 'b2b';
  return 'content';
};

const deviceCategory = () => {
  if (window.matchMedia('(max-width: 639px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
  return 'desktop';
};

const commonParams = (): EventParams => ({
  page_path: window.location.pathname,
  page_type: pageType(),
  device_category: deviceCategory(),
  viewport_width: window.innerWidth,
});

const getSessionId = () => {
  try {
    const existing = window.sessionStorage.getItem(sessionKey);
    if (existing) return existing;
    const value = window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(sessionKey, value);
    return value;
  } catch {
    return 'anonymous';
  }
};

const transmitFirstParty = (name: string, params: EventParams) => {
  const body = JSON.stringify({ name, params, session_id: getSessionId() });
  const blob = new Blob([body], { type: 'application/json' });
  if (navigator.sendBeacon?.('/api/analytics', blob)) return;
  void fetch('/api/analytics', {
    method: 'POST',
    body,
    headers: { 'content-type': 'application/json' },
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => undefined);
};

const flushFirstPartyEvents = () => {
  if (provider !== 'first_party' || consentState !== 'granted') return;
  pendingFirstPartyEvents.splice(0).forEach(({ name, params }) => transmitFirstParty(name, params));
};

const emit = (name: string, params: EventParams = {}) => {
  const eventParams = { ...commonParams(), ...params, ...(debug ? { debug_mode: true } : {}) };

  if (provider === 'ga4' && window.gtag) {
    window.gtag('event', name, eventParams);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...eventParams });
  }

  if (provider === 'first_party') {
    if (consentState === 'granted') transmitFirstParty(name, eventParams);
    else if (consentState !== 'denied' && pendingFirstPartyEvents.length < 20) {
      pendingFirstPartyEvents.push({ name, params: eventParams });
    }
  }

  if (debug) console.info('[analytics]', name, eventParams);
};

const emitOnce = (key: string, name: string, params: EventParams = {}) => {
  if (fired.has(key)) return;
  fired.add(key);
  emit(name, params);
};

const inferCtaLocation = (element: Element) => {
  const explicit = element.closest<HTMLElement>('[data-cta-location]')?.dataset.ctaLocation;
  if (explicit) return explicit;
  if (element.closest('header')) return 'header';
  if (element.closest('footer')) return 'footer';
  return 'content';
};

const linkDestination = (anchor: HTMLAnchorElement) => {
  try {
    return new URL(anchor.href, window.location.href).hostname;
  } catch {
    return '';
  }
};

document.addEventListener('click', (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const anchor = target?.closest<HTMLAnchorElement>('a[href]');
  if (!anchor) return;

  const rawHref = anchor.getAttribute('href') ?? '';
  const details: EventParams = {
    cta_location: inferCtaLocation(anchor),
    link_text: cleanText(anchor.textContent || anchor.getAttribute('aria-label')),
    link_url_host: linkDestination(anchor),
  };

  if (/^https?:\/\/(line\.me|lin\.ee)\//i.test(anchor.href)) {
    emit('generate_lead', { ...details, contact_method: 'line' });
    return;
  }

  if (rawHref.startsWith('tel:')) {
    emit('generate_lead', { ...details, contact_method: 'phone' });
    return;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin === window.location.origin && decodeURI(url.pathname).startsWith('/ประเมินราคา/')) {
      emit('valuation_start', details);
    } else if (url.origin !== window.location.origin) {
      emit('outbound_click', details);
    }
  } catch {
    // Invalid or browser-owned URLs are ignored safely.
  }
});

document.querySelectorAll<HTMLFormElement>('form').forEach((form, index) => {
  const formName = cleanText(form.getAttribute('name') || form.id || `form_${index + 1}`, 50);
  const markStarted = () => emitOnce(`form_start:${formName}`, 'form_start', { form_name: formName });
  form.addEventListener('focusin', markStarted, { once: true });
  form.addEventListener('input', markStarted, { once: true });
  form.addEventListener('submit', () => {
    emit('generate_lead', { contact_method: 'form', form_name: formName, cta_location: inferCtaLocation(form) });
  });
});

const mobileCta = document.querySelector<HTMLElement>('[data-mobile-cta]');
if (mobileCta && window.matchMedia('(max-width: 639px)').matches) {
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      emitOnce('mobile_cta_impression', 'mobile_cta_impression', { cta_location: 'mobile_sticky' });
      observer.disconnect();
    }
  });
  observer.observe(mobileCta);
}

document.querySelectorAll<HTMLDetailsElement>('[data-mobile-menu]').forEach((menu) => {
  menu.addEventListener('toggle', () => {
    if (menu.open) emit('mobile_menu_open', { menu_location: 'header' });
  });
});

const scrollThresholds = [25, 50, 75, 90];
let ticking = false;
const measureScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  const depth = Math.round((window.scrollY / max) * 100);
  scrollThresholds.forEach((threshold) => {
    if (depth >= threshold) emitOnce(`scroll:${threshold}`, 'scroll_depth', { percent_scrolled: threshold });
  });
};
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  window.requestAnimationFrame(() => {
    measureScroll();
    ticking = false;
  });
}, { passive: true });

window.setTimeout(() => {
  if (document.visibilityState === 'visible') emitOnce('engaged:10', 'user_engagement_10s');
}, 10_000);

const consentPanel = document.querySelector<HTMLElement>('#analytics-consent');
const updateConsent = (value: ConsentValue, persist = true) => {
  consentState = value;
  window.gtag?.('consent', 'update', {
    analytics_storage: value,
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  if (persist) {
    try { window.localStorage.setItem(consentKey, value); } catch { /* Storage may be unavailable. */ }
  }
  consentPanel?.classList.add('hidden');
  if (value === 'denied') pendingFirstPartyEvents.splice(0);
  else flushFirstPartyEvents();
  if (value === 'granted') emit('analytics_consent_update', { consent_state: value });
};

if (provider !== 'none' && consentPanel) {
  const savedConsent = readConsent();
  if (savedConsent) {
    updateConsent(savedConsent, false);
  } else {
    consentPanel.classList.remove('hidden');
  }

  consentPanel.querySelectorAll<HTMLButtonElement>('[data-analytics-consent]').forEach((button) => {
    button.addEventListener('click', () => updateConsent(button.dataset.analyticsConsent as ConsentValue));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-analytics-consent-manage]').forEach((button) => {
    button.addEventListener('click', () => {
      try { window.localStorage.removeItem(consentKey); } catch { /* Storage may be unavailable. */ }
      consentPanel.classList.remove('hidden');
      consentPanel.querySelector<HTMLButtonElement>('[data-analytics-consent="granted"]')?.focus();
    });
  });
}

if (provider === 'first_party') emitOnce('page_view', 'page_view');
