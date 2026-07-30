import assert from "node:assert/strict";
import fs from "node:fs";
import worker from "../worker/index.js";

const APEX_HOST = "xn--42cn4aobed0eb6hubj4es0m5dhvd.com";
const LEGACY_PATH = "/รับซื้อโน๊ตบุ๊ค";
const ENCODED_PATH =
  "/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%82%E0%B8%99%E0%B9%8A%E0%B8%95%E0%B8%9A%E0%B8%B8%E0%B9%8A%E0%B8%84";
const EXPECTED_PATTERNS = [
  LEGACY_PATH,
  `${LEGACY_PATH}/`,
];

async function run(url, assetStatus = 200) {
  const forwarded = [];
  const request = new Request(url);
  const env = {
    ASSETS: {
      async fetch(assetRequest) {
        forwarded.push(assetRequest);
        return new Response("asset", { status: assetStatus });
      },
    },
  };

  const response = await worker.fetch(request, env);
  return { request, response, forwarded };
}

async function expectRedirect(path, query = "") {
  const input = `https://${APEX_HOST}${path}${query}`;
  const { response, forwarded } = await run(input);
  assert.equal(response.status, 301, `${input} should return 301`);
  assert.equal(
    response.headers.get("location"),
    `https://${APEX_HOST}/${query}`,
    `${input} should redirect to the apex homepage without re-encoding`,
  );
  assert.equal(forwarded.length, 0, "redirect must not call the assets binding");
}

async function expectAsset(input, status = 200) {
  const { request, response, forwarded } = await run(input, status);
  assert.equal(response.status, status, `${input} should preserve the asset response`);
  assert.equal(forwarded.length, 1, "assets binding should be called exactly once");
  assert.equal(forwarded[0], request, "the original Request must be forwarded unchanged");
}

await expectRedirect(`${LEGACY_PATH}/`);
await expectRedirect(LEGACY_PATH);
await expectRedirect(`${ENCODED_PATH}/`);
await expectRedirect(`${LEGACY_PATH}/`, "?source=test&campaign=seo");
await expectAsset(`https://${APEX_HOST}/`);
await expectAsset(`https://${APEX_HOST}/รับซื้อ-notebook/`);
await expectAsset(
  `https://${APEX_HOST}/this-page-must-not-exist-legacy-control/`,
  404,
);
await expectAsset(`https://preview.example.test${LEGACY_PATH}/`, 404);

const config = fs.readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
assert.match(config, /^main\s*=\s*"\.\/worker\/index\.js"\s*$/m);
assert.match(config, /^\s*binding\s*=\s*"ASSETS"\s*$/m);
assert.doesNotMatch(config, /^\s*run_worker_first\s*=\s*true\s*$/m);
assert.doesNotMatch(config, /["']\/\*["']/);

const routeBlock = config.match(/run_worker_first\s*=\s*\[([\s\S]*?)\]/)?.[1];
assert.ok(routeBlock, "run_worker_first must be an array");
const configuredPatterns = [
  ...routeBlock.matchAll(/"([^"]+)"/g),
].map((match) => match[1]);
assert.deepEqual(
  configuredPatterns,
  EXPECTED_PATTERNS,
  "selective routes must contain only the two exact Unicode legacy path forms",
);
assert.ok(
  configuredPatterns.every(
    (pattern) =>
      !pattern.includes("www") &&
      !/\.(?:css|js|png|jpe?g|gif|svg|webp|ico)$/i.test(pattern),
  ),
  "selective routes must not include hosts, core pages, or asset extensions",
);

console.log("Selective Worker routing validation passed: 8 request cases and config scope.");
