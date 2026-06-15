#!/usr/bin/env node
import { readFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

const questions = readJson("../data/questions.json");
const explanations = readJson("../data/explanations.json");
const doubts = readJson("../docs/answer_key_doubts.json");

const anomalies = [];
const doubtIds = new Set((Array.isArray(doubts) ? doubts : []).map(d => d.id));

function add(q, type, detail) {
  anomalies.push({ id: q.id, sitting: q.t, type, detail });
}

function hasGluedHebrewEnglish(text) {
  return /[\u0590-\u05ff][A-Za-z]|[A-Za-z][\u0590-\u05ff]/.test(String(text || ""));
}

function hasLongNumericRefBlob(ref) {
  return String(ref || "").split(/\s+/).filter(x => /^\d{2,4}$/.test(x)).length >= 8;
}

function hasWeakRef(q) {
  const ref = String(q.ref || "").trim();
  return !ref || ref.length < 3 || hasLongNumericRefBlob(ref);
}

for (const q of questions) {
  if (hasGluedHebrewEnglish(q.q) || q.o.some(hasGluedHebrewEnglish)) {
    add(q, "glued-hebrew-english", "Question or option contains glued Hebrew/English text.");
  }
  if (hasWeakRef(q)) {
    add(q, "weak-ref", "Question has an empty, very short, or numeric-blob source reference.");
  }
  if (q.vision && hasWeakRef(q) && !doubtIds.has(q.id)) {
    add(q, "ocr-needs-source-review", "OCR-marked question has weak source metadata and no key-doubt note.");
  }
  const exp = String(explanations[q.id] || "");
  if (/answer_consistent=false|תשובה לא עקבית/i.test(exp)) {
    add(q, "explanation-consistency-marker", "Explanation still contains an internal consistency marker.");
  }
}

console.log(`Data quality audit: ${anomalies.length} non-blocking anomalies.`);
for (const issue of anomalies.slice(0, 40)) {
  console.log(`- ${issue.id} [${issue.type}] ${issue.detail}`);
}
if (anomalies.length > 40) console.log(`... ${anomalies.length - 40} more`);

