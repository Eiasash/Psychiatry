#!/usr/bin/env node
const base = process.env.PSYCHIATRY_PROD_URL || "https://psychiatry-szmc.netlify.app/";
const expectedVersion = process.env.PSYCHIATRY_EXPECTED_VERSION || "";

async function text(path) {
  const url = new URL(path, base);
  url.searchParams.set("smoke", String(Date.now()));
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

function expect(value, label) {
  if (!value) throw new Error(label);
}

const html = await text("./");
const manifest = JSON.parse(await text("./manifest.json"));
const sw = await text("./sw.js");
const version = expectedVersion || manifest.version;

expect(html.includes('rel="canonical" href="https://psychiatry-szmc.netlify.app/"'), "production canonical URL is not Netlify");
expect(html.includes('id="update-banner" role="alert" aria-live="assertive" aria-atomic="true" hidden'), "production update banner is not semantically hidden");
expect(html.includes("function renderStartupError(error)"), "production startup recovery renderer is missing");
expect(html.includes("function shouldProbeAuthConfig()"), "production auth host guard is missing");
expect(manifest.version === version, `manifest version ${manifest.version} does not match expected ${version}`);
expect(sw.includes(`psych-shlava-v${version}`), `service-worker cache marker does not include ${version}`);
expect(sw.includes("CLEAR_PROTECTED_CACHE"), "service worker lacks protected-cache clear handler");

console.log(`Production smoke passed for ${base} at version ${version}.`);
