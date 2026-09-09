import redirectManifest from "../src/data/rebuild-v2-production-redirects.json";

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

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const decodedPath = safeDecodePath(requestUrl.pathname);
    const normalizedPath = normalizeTrailingSlash(decodedPath);
    const redirectTarget = REDIRECTS.get(normalizedPath);

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
