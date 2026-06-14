#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../netlify/functions/ai-tutor.mjs"), "utf8");
const failures = [];

function expect(pattern, label) {
  if (!pattern.test(source)) failures.push(label);
}

function extractFunction(name) {
  const start = source.indexOf(`function ${name}(`);
  if (start < 0) return "";
  const bodyStart = source.indexOf("{", start);
  if (bodyStart < 0) return "";
  let depth = 0;
  for (let i = bodyStart; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  return "";
}

expect(/function sanitizeAiAnswer\(/, "AI tutor function needs an output sanitizer");
expect(/sanitizeAiAnswer\(answer\)/, "AI tutor response should sanitize model text before returning it");
expect(/אל תשתמש בטבלאות Markdown/, "AI tutor prompt should forbid Markdown tables");
expect(/עד 4 כותרות קצרות/, "AI tutor prompt should constrain section count");
expect(/עד 6 נקודות/, "AI tutor prompt should constrain bullet count");
expect(/max_tokens:\s*520/, "AI tutor should use a tighter token budget for mobile answers");

const sanitizerSource = `${extractFunction("compact")}\n${extractFunction("sanitizeAiAnswer")}`;
if (sanitizerSource) {
  try {
    const context = {};
    vm.createContext(context);
    vm.runInContext(sanitizerSource, context);
    const sanitized = vm.runInContext(`sanitizeAiAnswer(${JSON.stringify([
      "## ניתוח",
      "| תרופה | הערה |",
      "|---|---|",
      "| Sertraline | נכון |",
      "< נקודת מפתח: טקסט",
      "> עוד נקודה"
    ].join("\n"))})`, context);
    if (/\|---|\|\s*Sertraline\s*\||^<\s|^>\s/m.test(sanitized)) {
      failures.push("AI tutor sanitizer leaves raw table or quote markers visible");
    }
    if (!/Sertraline/.test(sanitized) || !/נקודת מפתח/.test(sanitized)) {
      failures.push("AI tutor sanitizer drops useful model content");
    }
  } catch (err) {
    failures.push(`AI tutor sanitizer regression threw: ${err.message}`);
  }
}

if (failures.length) {
  console.error(`AI Tutor regression audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("AI Tutor regression audit passed.");
