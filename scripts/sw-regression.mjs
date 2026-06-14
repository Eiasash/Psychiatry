#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sw = readFileSync(resolve(here, "../sw.js"), "utf8");
const pkg = JSON.parse(readFileSync(resolve(here, "../package.json"), "utf8"));
const failures = [];

function expect(pattern, label) {
  if (!pattern.test(sw)) failures.push(label);
}

expect(new RegExp(`psych-shlava-v${pkg.version.replaceAll(".", "\\.")}`), "service worker cache name must include package version");
expect(/APP_SHELL/, "service worker should name the app shell routes");
expect(/isAppShell/, "service worker should detect app-shell navigations");
expect(/e\.request\.mode\s*===\s*"navigate"/, "service worker should treat browser navigations as app-shell requests");
expect(/fetch\(e\.request\)[\s\S]*cache\.put/, "app shell should use network-first fetch and update cache");
expect(/caches\.match\("\.\/index\.html"\)/, "app shell should fall back to cached index.html offline");
expect(/cache-first for static assets/, "service worker comment should document cache-first static asset behavior");

if (/else\s*\{\s*e\.respondWith\(caches\.match\(e\.request\)\.then\(r=>r\|\|fetch\(e\.request\)\)\)/.test(sw)) {
  failures.push("service worker still uses cache-first for every non-data request");
}

if (failures.length) {
  console.error(`Service-worker regression audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("Service-worker regression audit passed.");
