#!/usr/bin/env node
/* Bank integrity gate for data/questions.json */
import { readFileSync } from "node:fs";

const Q = JSON.parse(readFileSync(new URL("../data/questions.json", import.meta.url)));
const T = JSON.parse(readFileSync(new URL("../data/topics.json", import.meta.url))).topics;

let errs = [];
const ids = new Set();
for (const [i, q] of Q.entries()) {
  const at = `#${i} (${q.id})`;
  if (!q.id) errs.push(`${at}: missing id`);
  if (ids.has(q.id)) errs.push(`${at}: duplicate id`);
  ids.add(q.id);
  if (!q.q || q.q.length < 8) errs.push(`${at}: bad stem`);
  if (!Array.isArray(q.o) || q.o.length !== 4 || q.o.some(o => !o || !o.trim()))
    errs.push(`${at}: options must be 4 non-empty`);
  if (!Number.isInteger(q.c) || q.c < 0 || q.c > 3) errs.push(`${at}: bad c=${q.c}`);
  if (!Array.isArray(q.c_accept) || q.c_accept.some(x => x < 0 || x > 3))
    errs.push(`${at}: bad c_accept`);
  if (!q.all_accepted && !q.c_accept.includes(q.c)) errs.push(`${at}: c not in c_accept`);
  if (!q.t) errs.push(`${at}: missing sitting tag`);
  if (!Number.isInteger(q.ti) || q.ti < 0 || q.ti >= T.length) errs.push(`${at}: bad ti=${q.ti}`);
}

// per-sitting counts must match the known exam sizes
const counts = {};
for (const q of Q) counts[q.t] = (counts[q.t] || 0) + 1;
const EXPECT = { "2020": 150, "2021-Jun": 150, "2022-Jun": 150, "2023-Jun": 150, "2024-Sep": 100 };
for (const [t, n] of Object.entries(EXPECT))
  if (counts[t] !== n) errs.push(`sitting ${t}: ${counts[t]} != ${n}`);

if (errs.length) {
  console.error(`✗ ${errs.length} problems:`);
  errs.slice(0, 50).forEach(e => console.error("  - " + e));
  process.exit(1);
}
console.log(`✓ ${Q.length} questions valid · sittings: ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(", ")}`);
