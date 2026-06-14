#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(here, "../index.html"), "utf8");
const failures = [];

function expect(pattern, label) {
  if (!pattern.test(html)) failures.push(label);
}

function expectMissing(pattern, label) {
  if (pattern.test(html)) failures.push(label);
}

expect(/function renderAiMarkdown\(/, "AI Tutor answer Markdown renderer is missing");
expect(/function renderAiAnswer\(/, "AI Tutor answer renderer wrapper is missing");
expect(/renderAiAnswer\(out,\s*data\)/, "AI Tutor response is not rendered through renderAiAnswer");
expect(/class="qcount" dir="ltr"/, "quiz counter needs an LTR boundary inside the RTL toolbar");
expect(/\.ai-box\{[^}]*background:var\(--card2\)/s, "AI Tutor panel needs a neutral card background");
expect(/\.ai-output h4/, "AI Tutor Markdown headings need compact panel styling");
expect(/\.ai-citations/, "AI Tutor citations need semantic styling");
expectMissing(/out\.innerHTML=`\$\{escapeHtml\(data\.answer\|\|/s, "AI Tutor still appends escaped raw Markdown as text");

function extractFunction(name) {
  const start = html.indexOf(`function ${name}(`);
  if (start < 0) return "";
  const bodyStart = html.indexOf("{", start);
  if (bodyStart < 0) return "";
  let depth = 0;
  for (let i = bodyStart; i < html.length; i++) {
    if (html[i] === "{") depth++;
    if (html[i] === "}") depth--;
    if (depth === 0) return html.slice(start, i + 1);
  }
  return "";
}

const rendererSource = ["escapeHtml", "aiInlineMarkdown", "renderAiMarkdown", "renderAiAnswer"].map(extractFunction).join("\n");
if (rendererSource.trim()) {
  try {
    const context = {};
    vm.createContext(context);
    vm.runInContext(rendererSource, context);
    const rendered = vm.runInContext(`renderAiMarkdown(${JSON.stringify([
      "## תשובה",
      "",
      "**התשובה הנכונה: א. Olanzapine**",
      "",
      "---",
      "",
      "### הסבר קצר",
      "- נקודה אחת",
      "- נקודה שתיים"
    ].join("\n"))})`, context);
    if (!rendered.includes("<h4>תשובה</h4>")) failures.push("AI Markdown renderer does not convert level-2 headings");
    if (!rendered.includes("<strong>התשובה הנכונה: א. Olanzapine</strong>")) failures.push("AI Markdown renderer does not convert bold emphasis");
    if (!rendered.includes('<hr class="ai-rule">')) failures.push("AI Markdown renderer does not convert separators");
    if (!rendered.includes("<ul>") || !rendered.includes("<li>נקודה אחת</li>")) failures.push("AI Markdown renderer does not convert bullets");
    if (/(^|>)\s*(#{2,3}|---|\*\*)/.test(rendered)) failures.push("AI Markdown renderer leaves raw Markdown markers visible");

    const answerHtml = vm.runInContext(`
      const out = { innerHTML: "" };
      renderAiAnswer(out, { answer: "## מקור", citations: ["<unsafe>", "Lancet"] });
      out.innerHTML;
    `, context);
    if (!answerHtml.includes("ai-citations")) failures.push("AI answer renderer does not include citations block");
    if (!answerHtml.includes("&lt;unsafe&gt;")) failures.push("AI answer renderer does not escape citations");
  } catch (error) {
    failures.push(`AI Markdown renderer behavior check errored: ${error.message}`);
  }
}

if (failures.length) {
  console.error(`UI regression audit failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("UI regression audit passed.");
