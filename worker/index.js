const APEX_HOST = "xn--42cn4aobed0eb6hubj4es0m5dhvd.com";
const LEGACY_PATH = "/รับซื้อโน๊ตบุ๊ค/";

function safeDecodePath(pathname) {
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

function normalizeTrailingSlash(pathname) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const decodedPath = safeDecodePath(requestUrl.pathname);
    const normalizedPath = normalizeTrailingSlash(decodedPath);

    if (
      requestUrl.hostname.toLowerCase() === APEX_HOST &&
      normalizedPath === LEGACY_PATH
    ) {
      const destination = new URL(request.url);
      destination.protocol = "https:";
      destination.hostname = APEX_HOST;
      destination.port = "";
      destination.pathname = "/";

      return Response.redirect(destination.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
