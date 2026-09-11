# Conversion Measurement + Mobile UX Instrumentation

## Production activation (first-party default)

When no Google ID is set, the site sends consent-approved events to the same-origin
`/api/analytics` endpoint. The Cloudflare Worker writes them to the
`shopbuynotebook_conversion_events` Analytics Engine dataset. No Google script is
loaded and no Google Analytics request is sent.

Google remains optional for a later phase. To enable it, set exactly one build
environment variable in the deployment service, then rebuild:

Set exactly one build environment variable in the deployment service, then rebuild:

```text
PUBLIC_GTM_CONTAINER_ID=GTM-XXXXXXX
```

or

```text
PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

GTM takes precedence when both are present, preventing duplicate events. No ID is committed to the repository.

## Event contract

| Event | Trigger | Important parameters |
|---|---|---|
| `page_view` | First-party collector loads a page | `page_type`, `device_category` |
| `generate_lead` | LINE click, phone click, or form submit | `contact_method`, `cta_location`, `page_type`, `device_category` |
| `valuation_start` | Internal click to `/ประเมินราคา/` | `cta_location`, `link_text` |
| `form_start` | First interaction with any future form | `form_name` |
| `mobile_cta_impression` | Sticky mobile CTA becomes visible | `cta_location` |
| `mobile_menu_open` | Mobile navigation opens | `menu_location` |
| `scroll_depth` | 25%, 50%, 75%, or 90% depth | `percent_scrolled` |
| `user_engagement_10s` | Page remains visible for 10 seconds | page/device dimensions |
| `outbound_click` | External link except LINE | `link_url_host`, `link_text` |
| `analytics_consent_update` | Visitor grants analytics consent | `consent_state` |

Every event also includes `page_path`, `page_type`, `device_category`, and `viewport_width`.

In GA4, mark `generate_lead` as a key event. Create custom dimensions for `contact_method`, `cta_location`, `page_type`, and `device_category`. With GTM, create a Custom Event trigger for each event name and map the data-layer variables to the GA4 Event tag.

## Privacy and consent

The first-party collector queues at most 20 events in memory until the visitor
chooses. It transmits only after consent is granted and discards the queue when
consent is denied. The choice is stored in local storage under
`rnb_analytics_consent_v1`; a random session ID is stored only in session storage.
The collector does not persist IP addresses, user-agent strings, form values,
contact details, link text, or query strings.

If Google is enabled later, Consent Mode initializes `analytics_storage`, all
advertising storage, user-data, and personalization as denied. Advertising signals
remain disabled.

## Seven-day baseline

Day 0 begins when the production deployment containing this collector succeeds.
After seven complete days, query the Cloudflare Analytics Engine SQL API with an
Account Analytics Read token.

Field mapping:

| Column | Meaning |
|---|---|
| `index1` | anonymous browser-session ID |
| `blob1` | event name |
| `blob2` | page path |
| `blob3` | page type |
| `blob4` | device category |
| `blob5` | CTA location |
| `blob6` | contact method |
| `blob7` | form name |
| `blob8` | outbound hostname |
| `blob9` | menu location |
| `blob10` | `production` or `debug` traffic |
| `double1` | viewport width |
| `double2` | scroll percentage |

Baseline event volume by device:

```sql
SELECT
  blob1 AS event_name,
  blob4 AS device_category,
  SUM(_sample_interval) AS events
FROM shopbuynotebook_conversion_events
WHERE timestamp >= NOW() - INTERVAL '7' DAY
  AND blob10 = 'production'
GROUP BY event_name, device_category
ORDER BY events DESC
```

Lead actions by CTA and contact method:

```sql
SELECT
  blob5 AS cta_location,
  blob6 AS contact_method,
  SUM(_sample_interval) AS leads
FROM shopbuynotebook_conversion_events
WHERE timestamp >= NOW() - INTERVAL '7' DAY
  AND blob1 = 'generate_lead'
  AND blob10 = 'production'
GROUP BY cta_location, contact_method
ORDER BY leads DESC
```

## QA

```bash
npm run check
npm run build
npm run validate:analytics
```

For browser debugging, append `?analytics_debug=1` to any page and inspect the
console/data layer. Test at least homepage, valuation owner, one brand page, one
blog page, and one mobile viewport. In first-party mode, verify successful
`POST /api/analytics` responses after granting consent. If Google is enabled later,
verify LINE and phone clicks in GA4 DebugView or GTM Preview.
