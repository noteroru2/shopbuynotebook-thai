import assert from "node:assert/strict";
import fs from "node:fs";
import worker from "../worker/index.js";
import redirectManifest from "../src/data/rebuild-v2-production-redirects.json" with { type: "json" };

const APEX_HOST = "xn--42cn4aobed0eb6hubj4es0m5dhvd.com";
const redirects = redirectManifest.redirects;

assert.equal(redirectManifest.status, "PRODUCTION_MIGRATION_CANDIDATE");
assert.equal(redirectManifest.policy.statusCode, 301);
assert.equal(redirectManifest.policy.oneHopOnly, true);
assert.equal(redirectManifest.policy.preserveQuery, true);
assert.equal(redirects.length, 31, "R13 redirect manifest must contain exactly 31 migrations");
assert.equal(new Set(redirects.map(({ source }) => source)).size, redirects.length, "redirect sources must be unique");

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

function expectedLocation(target, query = "") {
  const destination = new URL(`https://${APEX_HOST}/`);
  destination.pathname = target;
  destination.search = query;
  return destination.toString();
}

async function expectRedirect(source, target, query = "") {
  const input = `https://${APEX_HOST}${source}${query}`;
  const { response, forwarded } = await run(input);
  assert.equal(response.status, 301, `${input} should return 301`);
  assert.equal(
    response.headers.get("location"),
    expectedLocation(target, query),
    `${input} should preserve the declared one-hop target and query string`,
  );
  assert.equal(forwarded.length, 0, `${source} redirect must not call the assets binding`);
}

async function expectAsset(input, status = 200) {
  const { request, response, forwarded } = await run(input, status);
  assert.equal(response.status, status, `${input} should preserve the asset response`);
  assert.equal(forwarded.length, 1, "assets binding should be called exactly once");
  assert.equal(forwarded[0], request, "the original Request must be forwarded unchanged");
  return response;
}

for (const { source, target } of redirects) {
  await expectRedirect(source, target);
  await expectRedirect(source, target, "?source=r13&campaign=migration");

  if (source !== "/") {
    await expectRedirect(source.replace(/\/$/, ""), target);
  }
}

const encodedLegacyPath = encodeURI("/รับซื้อโน๊ตบุ๊ค/");
await expectRedirect(encodedLegacyPath, "/");

await expectAsset(`https://${APEX_HOST}/`);
await expectAsset(`https://${APEX_HOST}/รับซื้อโน๊ตบุ๊คมือสอง/`);
await expectAsset(`https://${APEX_HOST}/this-page-must-not-exist-r13-control/`, 404);
await expectAsset(`https://preview.example.test${redirects[0].source}`, 404);

const adminResponse = await expectAsset(`https://${APEX_HOST}/admin/`);
assert.equal(adminResponse.headers.get("x-robots-tag"), "noindex, nofollow");

const config = fs.readFileSync(new URL("../wrangler.toml", import.meta.url), "utf8");
assert.match(config, /^main\s*=\s*"\.\/worker\/index\.js"\s*$/m);
assert.match(config, /^\s*directory\s*=\s*"dist"\s*$/m);
assert.match(config, /^\s*binding\s*=\s*"ASSETS"\s*$/m);
assert.match(config, /^\s*run_worker_first\s*=\s*true\s*$/m);
assert.doesNotMatch(config, /^\s*run_worker_first\s*=\s*\[/m, "R13 must not fall back to the old two-path selective routing policy");

for (const { source, target } of redirects) {
  assert.ok(source.startsWith("/") && source.endsWith("/"), `invalid redirect source ${source}`);
  assert.ok(target.startsWith("/") && target.endsWith("/"), `invalid redirect target ${target}`);
  assert.notEqual(source, target, `${source} must not redirect to itself`);
}

const sourceSet = new Set(redirects.map(({ source }) => source));
for (const { source, target } of redirects) {
  assert.ok(!sourceSet.has(target), `${source} -> ${target} creates a redirect chain because target is also a source`);
}

console.log(
  `R13 Worker routing validation passed: ${redirects.length} one-hop redirects, query preservation, encoded path handling, asset fall-through, admin noindex, and Worker-first config.`,
);
