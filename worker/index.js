const APEX_HOST = "xn--42cn4aobed0eb6hubj4es0m5dhvd.com";
const WWW_HOST = `www.${APEX_HOST}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname.toLowerCase() === WWW_HOST) {
      url.protocol = "https:";
      url.hostname = APEX_HOST;
      url.port = "";

      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
