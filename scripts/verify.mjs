#!/usr/bin/env node
/* Bank integrity gate for data/questions.json, explanation coverage, and PWA metadata. */
import { existsSync, readFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

const Q = readJson("../data/questions.json");
const topicPayload = readJson("../data/topics.json");
const T = topicPayload.topics;
const EXP = readJson("../data/explanations.json");
const KEY_DOUBTS = readJson("../docs/answer_key_doubts.json");
const PKG = readJson("../package.json");
const MANIFEST = readJson("../manifest.json");
const SW = readFileSync(new URL("../sw.js", import.meta.url), "utf8");
const NETLIFY = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");

let errs = [];
const ids = new Set();

if (!Array.isArray(Q)) errs.push("questions.json must be an array");
if (!Array.isArray(T) || !T.length) errs.push("topics.json must expose a non-empty topics array");
if (!EXP || typeof EXP !== "object" || Array.isArray(EXP)) errs.push("explanations.json must be an object keyed by question id");
if (!Array.isArray(KEY_DOUBTS)) errs.push("answer_key_doubts.json must be an array");

for (const [i, q] of (Array.isArray(Q) ? Q : []).entries()) {
  const at = `#${i} (${q?.id || "missing-id"})`;
  if (!q || typeof q !== "object" || Array.isArray(q)) {
    errs.push(`${at}: question must be an object`);
    continue;
  }
  if (!q.id || typeof q.id !== "string") errs.push(`${at}: missing id`);
  if (ids.has(q.id)) errs.push(`${at}: duplicate id`);
  ids.add(q.id);
  if (!q.q || typeof q.q !== "string" || q.q.trim().length < 8) errs.push(`${at}: bad stem`);
  if (!Array.isArray(q.o) || q.o.length !== 4 || q.o.some(o => typeof o !== "string" || !o.trim()))
    errs.push(`${at}: options must be 4 non-empty strings`);
  if (!Number.isInteger(q.c) || q.c < 0 || q.c > 3) errs.push(`${at}: bad c=${q.c}`);
  if (!Array.isArray(q.c_accept) || q.c_accept.some(x => !Number.isInteger(x) || x < 0 || x > 3))
    errs.push(`${at}: bad c_accept`);
  else {
    const unique = new Set(q.c_accept);
    if (unique.size !== q.c_accept.length) errs.push(`${at}: duplicate c_accept values`);
    if (q.all_accepted) {
      const allChoices = [0, 1, 2, 3].every(x => unique.has(x));
      if (!allChoices) errs.push(`${at}: all_accepted must include all four choices`);
    } else if (!unique.has(q.c)) errs.push(`${at}: c not in c_accept`);
  }
  if (!q.t || typeof q.t !== "string") errs.push(`${at}: missing sitting tag`);
  if (!Number.isInteger(q.ti) || q.ti < 0 || q.ti >= T.length) errs.push(`${at}: bad ti=${q.ti}`);
  if (q.tis && (!Array.isArray(q.tis) || q.tis.some(ti => !Number.isInteger(ti) || ti < 0 || ti >= T.length)))
    errs.push(`${at}: bad tis`);
  if (typeof q.vision !== "undefined" && typeof q.vision !== "boolean") errs.push(`${at}: vision must be boolean when present`);
  const exp = EXP?.[q.id];
  if (typeof exp !== "string" || exp.trim().length < 20) errs.push(`${at}: missing or too-short explanation`);
}

for (const [id, exp] of Object.entries(EXP || {})) {
  if (!ids.has(id)) errs.push(`explanations.json: orphan explanation id ${id}`);
  if (typeof exp !== "string" || !exp.trim()) errs.push(`explanations.json: empty explanation for ${id}`);
}

const doubtIds = new Set();
for (const [i, doubt] of (Array.isArray(KEY_DOUBTS) ? KEY_DOUBTS : []).entries()) {
  const at = `answer_key_doubts[${i}]`;
  if (!doubt || typeof doubt !== "object" || Array.isArray(doubt)) {
    errs.push(`${at}: doubt must be an object`);
    continue;
  }
  if (!ids.has(doubt.id)) errs.push(`${at}: unknown question id ${doubt.id}`);
  if (doubtIds.has(doubt.id)) errs.push(`${at}: duplicate doubt id ${doubt.id}`);
  doubtIds.add(doubt.id);
  if (typeof doubt.issue !== "string" || doubt.issue.trim().length < 20) errs.push(`${at}: missing issue text`);
  if (typeof doubt.keyed !== "string" || !doubt.keyed.trim()) errs.push(`${at}: missing keyed letter`);
}

// Per-sitting counts must match the known official exam sizes.
const counts = {};
for (const q of Array.isArray(Q) ? Q : []) counts[q.t] = (counts[q.t] || 0) + 1;
const EXPECT = { "2020": 150, "2021-Jun": 150, "2022-Jun": 150, "2023-Jun": 150, "2024-May": 100, "2024-Sep": 100, "2025-Jun": 100 };
for (const [t, n] of Object.entries(EXPECT))
  if (counts[t] !== n) errs.push(`sitting ${t}: ${counts[t] || 0} != ${n}`);
for (const t of Object.keys(counts))
  if (!(t in EXPECT)) errs.push(`unexpected sitting ${t}: ${counts[t]}`);

// PWA/version/cache checks: shipped assets must invalidate together.
if (!PKG.version || typeof PKG.version !== "string") errs.push("package.json: missing version");
if (MANIFEST.version !== PKG.version) errs.push(`manifest.json version ${MANIFEST.version} != package.json ${PKG.version}`);
const cacheMatch = SW.match(/const CACHE = "([^"]+)"/);
if (!cacheMatch) errs.push("sw.js: missing CACHE marker");
else if (!cacheMatch[1].includes(PKG.version)) errs.push(`sw.js CACHE ${cacheMatch[1]} does not include package version ${PKG.version}`);
if (MANIFEST.start_url !== "./") errs.push(`manifest.json: start_url should be "./" for GitHub Pages scope, got ${MANIFEST.start_url}`);
if (MANIFEST.scope !== "./") errs.push(`manifest.json: scope should be "./", got ${MANIFEST.scope}`);
if (!Array.isArray(MANIFEST.icons) || MANIFEST.icons.length < 2) errs.push("manifest.json: expected PNG icons");
else {
  for (const icon of MANIFEST.icons) {
    if (typeof icon.src !== "string" || icon.src.startsWith("data:")) errs.push(`manifest.json: icon src must be a file path (${icon.src})`);
    if (icon.type !== "image/png") errs.push(`manifest.json: icon ${icon.src} should be image/png`);
    if (icon.src && !icon.src.startsWith("data:") && !existsSync(new URL(`../${icon.src}`, import.meta.url)))
      errs.push(`manifest.json: missing icon file ${icon.src}`);
  }
}
const assetBlock = SW.match(/const ASSETS = \[([\s\S]*?)\];/);
if (!assetBlock) errs.push("sw.js: missing ASSETS list");
else {
  const protectedAssets = new Set(["./data/questions.json", "./data/explanations.json", "./docs/answer_key_doubts.json"]);
  for (const match of assetBlock[1].matchAll(/"([^"]+)"/g)) {
    const asset = match[1];
    if (protectedAssets.has(asset)) errs.push(`sw.js: protected asset must not be precached ${asset}`);
    if (asset === "./") continue;
    const rel = asset.replace(/^\.\//, "");
    if (!existsSync(new URL(`../${rel}`, import.meta.url))) errs.push(`sw.js: missing cached asset ${asset}`);
  }
}
for (const asset of ["data/questions.json", "data/explanations.json", "docs/answer_key_doubts.json"]) {
  if (!NETLIFY.includes(`path=${asset}`)) errs.push(`netlify.toml: missing protected redirect for ${asset}`);
}
if (!NETLIFY.includes("included_files")) errs.push("netlify.toml: protected JSON files must be included in functions bundle");

if (errs.length) {
  console.error(`✗ ${errs.length} problems:`);
  errs.slice(0, 80).forEach(e => console.error("  - " + e));
  if (errs.length > 80) console.error(`  ... ${errs.length - 80} more`);
  process.exit(1);
}

console.log(`✓ ${Q.length} questions valid · ${Object.keys(EXP).length} explanations covered · ${doubtIds.size} key-doubt flags mapped · PWA ${PKG.version} aligned · sittings: ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(", ")}`);
