#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, "../netlify/functions/ai-question.mjs"), "utf8");
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

expect(/function sourceScopedCitations\(/, "AI question function needs source-scoped citation normalization");
expect(/sourceContract/, "AI question response should expose an explicit source contract");
expect(/Do not invent page numbers/, "AI question prompt must forbid invented page numbers");
expect(/not part of the verified 900-question bank/, "AI question prompt must distinguish generated practice from verified exam questions");
expect(/sourceLabel:\s*request\.sourceLabel/, "AI question source contract should preserve the selected syllabus label");

const questionSource = `${extractFunction("compact")}\n${extractFunction("sourceScopedCitations")}\n${extractFunction("normalizeQuestion")}`;
if (questionSource.trim()) {
  try {
    const context = {};
    vm.createContext(context);
    vm.runInContext(questionSource, context);
    const normalized = vm.runInContext(`normalizeQuestion({
      stem: "מה נכון?",
      options: ["א", "ב", "ג", "ד"],
      correctIndex: 1,
      explanation: "הסבר מבוסס מקור.",
      citations: ["fake p. 999", "Kaplan & Sadock Synopsis"]
    }, {
      topic: "Psychopharmacology",
      source: "synopsis",
      sourceLabel: "Kaplan & Sadock Synopsis"
    })`, context);
    if (!normalized.sourceContract || normalized.sourceContract.sourceLabel !== "Kaplan & Sadock Synopsis") {
      failures.push("AI question normalized payload lacks source contract metadata");
    }
    if (normalized.citations.includes("fake p. 999")) {
      failures.push("AI question citations keep out-of-scope invented page references");
    }
    if (!normalized.citations.includes("Kaplan & Sadock Synopsis")) {
      failures.push("AI question citations should retain the selected syllabus source");
    }
  } catch (err) {
    failures.push(`AI question normalization regression threw: ${err.message}`);
  }
}

if (failures.length) {
  console.error(`AI question regression audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("AI question regression audit passed.");
