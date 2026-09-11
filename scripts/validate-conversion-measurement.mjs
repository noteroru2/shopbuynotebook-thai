import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

const required = [
  'src/components/AnalyticsHead.astro',
  'src/components/AnalyticsConsent.astro',
  'src/scripts/conversion-measurement.ts',
  'src/layouts/BaseLayout.astro',
];
for (const file of required) assert(exists(file), `Missing analytics file: ${file}`);

if (required.every(exists)) {
  const head = read('src/components/AnalyticsHead.astro');
  const consent = read('src/components/AnalyticsConsent.astro');
  const tracker = read('src/scripts/conversion-measurement.ts');
  const layout = read('src/layouts/BaseLayout.astro');
  const sticky = read('src/components/StickyMobileCTA.astro');
  const header = read('src/components/Header.astro');
  const worker = read('worker/index.js');
  const wrangler = read('wrangler.toml');

  assert(head.includes('PUBLIC_GTM_CONTAINER_ID'), 'GTM environment variable support is missing.');
  assert(head.includes('PUBLIC_GA4_MEASUREMENT_ID'), 'GA4 environment variable support is missing.');
  assert(!/G-[A-Z0-9]{6,}/.test(head.replace(/G-\[A-Z0-9\]/g, '')), 'A GA4 ID appears to be hard-coded.');
  assert(head.includes("analytics_storage: 'denied'"), 'Consent Mode must default analytics storage to denied.');
  assert(head.includes("ad_personalization: 'denied'"), 'Advertising personalization must remain denied.');
  assert(head.includes("'first_party'"), 'First-party analytics must be the default without a Google ID.');
  assert(consent.includes('data-analytics-consent="granted"'), 'Consent accept control is missing.');
  assert(consent.includes('data-analytics-consent="denied"'), 'Consent reject control is missing.');
  assert(layout.includes('<AnalyticsHead />'), 'AnalyticsHead is not mounted sitewide.');
  assert(layout.includes('<AnalyticsConsent />'), 'AnalyticsConsent is not mounted sitewide.');
  assert(layout.includes('conversion-measurement.ts'), 'Measurement client is not mounted sitewide.');
  assert(sticky.includes('data-mobile-cta'), 'Mobile CTA impression marker is missing.');
  assert(sticky.includes('data-cta-location="mobile_sticky"'), 'Mobile CTA location marker is missing.');
  assert(header.includes('data-mobile-menu'), 'Mobile menu instrumentation marker is missing.');
  assert(tracker.includes("'/api/analytics'"), 'First-party analytics endpoint is not wired in the client.');
  assert(worker.includes('CONVERSION_ANALYTICS.writeDataPoint'), 'Worker Analytics Engine writer is missing.');
  assert(wrangler.includes('shopbuynotebook_conversion_events'), 'Analytics Engine dataset binding is missing.');

  for (const event of [
    'generate_lead',
    'valuation_start',
    'outbound_click',
    'form_start',
    'mobile_cta_impression',
    'mobile_menu_open',
    'scroll_depth',
    'user_engagement_10s',
    'page_view',
  ]) {
    assert(tracker.includes(`'${event}'`), `Required event is missing: ${event}`);
  }
  for (const dimension of ['contact_method', 'cta_location', 'page_type', 'device_category']) {
    assert(tracker.includes(dimension), `Required event dimension is missing: ${dimension}`);
  }
}

if (exists('dist/index.html')) {
  const homepage = read('dist/index.html');
  assert(homepage.includes('name="analytics-provider"'), 'Built homepage is missing analytics provider metadata.');
  assert(homepage.includes('data-mobile-cta'), 'Built homepage is missing mobile CTA instrumentation.');
  assert(homepage.includes('generate_lead') && homepage.includes('mobile_cta_impression'), 'Built homepage is missing bundled measurement client.');
}

if (errors.length) {
  console.error(`CONVERSION MEASUREMENT FAIL (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`CONVERSION MEASUREMENT PASS: sitewide events, mobile markers, consent controls and provider configuration are present${exists('dist/index.html') ? '; built homepage verified' : '; dist verification pending'}.`);
