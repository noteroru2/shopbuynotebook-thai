import assert from "node:assert/strict";
import worker from "../worker/index.js";

const APEX_HOST = "xn--42cn4aobed0eb6hubj4es0m5dhvd.com";
const WWW_HOST = `www.${APEX_HOST}`;
const THAI_PATH = "/รับซื้อ-notebook/";

async function run(url) {
  const forwarded = [];
  const request = new Request(url);
  const env = {
    ASSETS: {
      async fetch(assetRequest) {
        forwarded.push(assetRequest);
        return new Response("asset", { status: 200 });
      },
    },
  };

  const response = await worker.fetch(request, env);
  return { request, response, forwarded };
}

async function expectRedirect(input, expected) {
  const { response, forwarded } = await run(input);
  assert.equal(response.status, 301, `${input} should return 301`);
  assert.equal(response.headers.get("location"), expected);
  assert.equal(forwarded.length, 0, "redirects must not call the assets binding");
}

async function expectAssetPassThrough(input) {
  const { request, response, forwarded } = await run(input);
  assert.equal(response.status, 200, `${input} should be served by assets`);
  assert.equal(forwarded.length, 1, "assets binding should be called exactly once");
  assert.equal(forwarded[0], request, "the original Request must be forwarded unchanged");
  assert.equal(forwarded[0].url, request.url, "the forwarded URL must be unchanged");
}

await expectRedirect(
  `https://${WWW_HOST}/`,
  `https://${APEX_HOST}/`,
);
await expectRedirect(
  `https://${WWW_HOST}${THAI_PATH}`,
  `https://${APEX_HOST}${encodeURI(THAI_PATH)}`,
);
await expectRedirect(
  `https://${WWW_HOST}${THAI_PATH}?source=test&campaign=seo`,
  `https://${APEX_HOST}${encodeURI(THAI_PATH)}?source=test&campaign=seo`,
);
await expectAssetPassThrough(`https://${APEX_HOST}/`);
await expectAssetPassThrough(`https://${APEX_HOST}${THAI_PATH}`);
await expectAssetPassThrough(`https://preview.example.test${THAI_PATH}`);

console.log("Worker routing validation passed: 6/6 cases.");
