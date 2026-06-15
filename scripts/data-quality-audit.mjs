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
const args = new Set(process.argv.slice(2));

function snippet(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 220);
}

function add(q, type, detail, field = "", value = "") {
  anomalies.push({ id: q.id, sitting: q.t, field, type, detail, snippet: snippet(value) });
}

function hasGluedHebrewEnglish(text) {
  return /[\u0590-\u05ff][A-Za-z]|[A-Za-z][\u0590-\u05ff]/.test(String(text || ""));
}

function hasPdfTailArtifact(text) {
  return /יש לבחור בתשובה אחת בלבד עבור כל שאלה|עמוד\s*\d+|עמוד\d+|בחינת שלב א['׳]\s*פסיכיאטריה\s*\d/i.test(String(text || ""));
}

function hasLongNumericRefBlob(ref) {
  return String(ref || "").split(/\s+/).filter(x => /^\d{2,4}$/.test(x)).length >= 8;
}

function hasWeakRef(q) {
  const ref = String(q.ref || "").trim();
  return !ref || ref.length < 3 || hasLongNumericRefBlob(ref);
}

function inspectText(q, field, value) {
  if (hasGluedHebrewEnglish(value)) {
    add(q, "spacing-hebrew-english", "Hebrew and Latin/digit tokens are adjacent; fix display spacing or verify source text before editing data.", field, value);
  }
  if (hasPdfTailArtifact(value)) {
    add(q, "pdf-tail-artifact", "Text appears to include copied PDF navigation/footer text.", field, value);
  }
}

for (const q of questions) {
  inspectText(q, "question", q.q);
  q.o.forEach((option, idx) => inspectText(q, `option_${idx + 1}`, option));
  if (hasWeakRef(q)) {
    add(q, "weak-ref", "Question has an empty, very short, or numeric-blob source reference.", "ref", q.ref);
  }
  if (q.vision && hasWeakRef(q) && !doubtIds.has(q.id)) {
    add(q, "ocr-needs-source-review", "OCR-marked question has weak source metadata and no key-doubt note.", "question", q.q);
  }
  const exp = String(explanations[q.id] || "");
  if (exp) inspectText(q, "explanation", exp);
  if (/answer_consistent=false|תשובה לא עקבית/i.test(exp)) {
    add(q, "explanation-consistency-marker", "Explanation still contains an internal consistency marker.", "explanation", exp);
  }
}

const byType = anomalies.reduce((acc, issue) => {
  acc[issue.type] = (acc[issue.type] || 0) + 1;
  return acc;
}, {});
const report = {
  count: anomalies.length,
  byType,
  generatedAt: new Date().toISOString(),
  anomalies,
};

function markdownCell(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function printMarkdown() {
  console.log(`# Data Quality Audit`);
  console.log("");
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`Total non-blocking anomalies: ${report.count}`);
  console.log("");
  for (const type of Object.keys(byType).sort()) {
    console.log(`## ${type}`);
    console.log("");
    console.log(`Count: ${byType[type]}`);
    console.log("");
    console.log("| id | field | sitting | snippet |");
    console.log("|---|---|---|---|");
    for (const issue of anomalies.filter(x => x.type === type).slice(0, 20)) {
      console.log(`| ${markdownCell(issue.id)} | ${markdownCell(issue.field)} | ${markdownCell(issue.sitting)} | ${markdownCell(issue.snippet)} |`);
    }
    console.log("");
  }
}

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else if (args.has("--markdown")) {
  printMarkdown();
} else {
  console.log(`Data quality audit: ${anomalies.length} non-blocking anomalies.`);
  for (const issue of anomalies.slice(0, 40)) {
    console.log(`- ${issue.id} [${issue.type}/${issue.field}] ${issue.detail}`);
  }
  if (anomalies.length > 40) console.log(`... ${anomalies.length - 40} more`);
}
