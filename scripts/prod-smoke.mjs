#!/usr/bin/env node
const base = process.env.PSYCHIATRY_PROD_URL || "https://psychiatry-szmc.netlify.app/";
const GITHUB_PAGES_URL = process.env.PSYCHIATRY_PAGES_URL || "https://eiasash.github.io/Psychiatry/";
const expectedVersion = process.env.PSYCHIATRY_EXPECTED_VERSION || "";

async function smokeFetch(path, opts = {}) {
  const url = new URL(path, opts.base || base);
  url.searchParams.set("smoke", String(Date.now()));
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: { "Cache-Control": "no-cache", ...(opts.headers || {}) },
    body: opts.body
  });
  const body = await res.text();
  const allowed = opts.allowedStatuses || (opts.expectOk === false ? [res.status] : null);
  if (allowed ? !allowed.includes(res.status) : !res.ok) {
    throw new Error(`${url} returned ${res.status}: ${body.slice(0, 180)}`);
  }
  return { url, res, status: res.status, body };
}

async function text(path, opts = {}) {
  return (await smokeFetch(path, opts)).body;
}

function expect(value, label) {
  if (!value) throw new Error(label);
}

const html = await text("./");
const manifest = JSON.parse(await text("./manifest.json"));
const sw = await text("./sw.js");
const version = expectedVersion || manifest.version;
const protectedQuestions = await smokeFetch("./api/protected-asset?path=data%2Fquestions.json", { allowedStatuses: [401] });
const aiTutor = await smokeFetch("./api/ai-tutor", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
  allowedStatuses: [401]
});
const aiQuestion = await smokeFetch("./api/ai-question", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
  allowedStatuses: [401]
});
const pagesHtml = await text("./", { base: GITHUB_PAGES_URL });
const pagesTopics = JSON.parse(await text("./data/topics.json", { base: GITHUB_PAGES_URL }));

expect(html.includes('rel="canonical" href="https://psychiatry-szmc.netlify.app/"'), "production canonical URL is not Netlify");
expect(html.includes('id="update-banner" role="alert" aria-live="assertive" aria-atomic="true" hidden'), "production update banner is not semantically hidden");
expect(html.includes("function renderStartupError(error)"), "production startup recovery renderer is missing");
expect(html.includes("function shouldProbeAuthConfig()"), "production auth host guard is missing");
expect(manifest.version === version, `manifest version ${manifest.version} does not match expected ${version}`);
expect(sw.includes(`psych-shlava-v${version}`), `service-worker cache marker does not include ${version}`);
expect(sw.includes("CLEAR_PROTECTED_CACHE"), "service worker lacks protected-cache clear handler");
expect(protectedQuestions.status === 401, "protected questions endpoint should return 401 without a token");
expect(aiTutor.status === 401, "AI Tutor endpoint should return 401 without a token");
expect(aiQuestion.status === 401, "AI question endpoint should return 401 without a token");
expect(pagesHtml.includes("function shouldProbeAuthConfig()"), "GitHub Pages mirror should keep the static auth guard");
expect(pagesHtml.includes("canonical-host-note"), "GitHub Pages mirror should show the canonical host notice");
expect(Array.isArray(pagesTopics.topics) && pagesTopics.topics.length > 0, "GitHub Pages mirror should serve static topic data");

console.log(`Production smoke passed for ${base} at version ${version}.`);
