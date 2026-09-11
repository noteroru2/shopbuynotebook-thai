import redirectManifest from "../src/data/rebuild-v2-production-redirects.json" with { type: "json" };

const APEX_HOST = "xn--42cn4aobed0eb6hubj4es0m5dhvd.com";
const REDIRECTS = new Map(
  redirectManifest.redirects.map(({ source, target }) => [source, target]),
);

function safeDecodePath(pathname) {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

function normalizeTrailingSlash(pathname) {
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname === "/admin/" || pathname.startsWith("/admin/");
}

const ANALYTICS_PATH = "/api/analytics";
const ANALYTICS_EVENTS = new Set([
  "page_view",
  "generate_lead",
  "valuation_start",
  "outbound_click",
  "form_start",
  "mobile_cta_impression",
  "mobile_menu_open",
  "scroll_depth",
  "user_engagement_10s",
  "analytics_consent_update",
]);

function cleanAnalyticsString(value, max = 160) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

async function recordAnalytics(request, env) {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { Allow: "POST" } });
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) return new Response(null, { status: 413 });

  let payload;
  try {
    payload = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const name = cleanAnalyticsString(payload?.name, 50);
  if (!ANALYTICS_EVENTS.has(name)) return new Response(null, { status: 400 });

  const params = payload?.params && typeof payload.params === "object" ? payload.params : {};
  const sessionId = cleanAnalyticsString(payload?.session_id, 80) || "anonymous";
  env.CONVERSION_ANALYTICS.writeDataPoint({
    indexes: [sessionId],
    blobs: [
      name,
      cleanAnalyticsString(params.page_path, 240),
      cleanAnalyticsString(params.page_type, 40),
      cleanAnalyticsString(params.device_category, 20),
      cleanAnalyticsString(params.cta_location, 40),
      cleanAnalyticsString(params.contact_method, 20),
      cleanAnalyticsString(params.form_name, 60),
      cleanAnalyticsString(params.link_url_host, 120),
      cleanAnalyticsString(params.menu_location, 40),
      params.debug_mode === true ? "debug" : "production",
    ],
    doubles: [
      Number.isFinite(Number(params.viewport_width)) ? Number(params.viewport_width) : 0,
      Number.isFinite(Number(params.percent_scrolled)) ? Number(params.percent_scrolled) : 0,
      1,
    ],
  });

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const decodedPath = safeDecodePath(requestUrl.pathname);
    const normalizedPath = normalizeTrailingSlash(decodedPath);
    const redirectTarget = REDIRECTS.get(normalizedPath);

    if (requestUrl.hostname.toLowerCase() === APEX_HOST && decodedPath === ANALYTICS_PATH) {
      return recordAnalytics(request, env);
    }

    if (requestUrl.hostname.toLowerCase() === APEX_HOST && redirectTarget) {
      const destination = new URL(request.url);
      destination.protocol = "https:";
      destination.hostname = APEX_HOST;
      destination.port = "";
      destination.pathname = redirectTarget;

      return Response.redirect(destination.toString(), 301);
    }

    const response = await env.ASSETS.fetch(request);

    if (isAdminPath(decodedPath)) {
      const headers = new Headers(response.headers);
      headers.set("X-Robots-Tag", "noindex, nofollow");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};
