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
expect(/\.ai-answer\{[^}]*direction:rtl/s, "AI Tutor answer body should be anchored in RTL");
expect(/\.ai-table/, "AI Tutor Markdown tables need mobile-safe styling");
expect(/\.ai-quote/, "AI Tutor blockquotes need semantic styling");
expect(/\.fb\{[^}]*text-align:right/s, "quiz feedback should keep readable RTL text alignment");
expect(/\.expl\{[^}]*text-align:right/s, "quiz explanations should keep readable RTL text alignment");
expect(/\.ai-box\{[^}]*overflow-wrap:anywhere/s, "AI Tutor panel should prevent mobile overflow");
expect(/\.wrap\{[^}]*padding:14px 14px calc\(112px \+ env\(safe-area-inset-bottom\)\)/s, "main content needs safe bottom padding above fixed nav");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.wrap\{[^}]*padding-inline:10px/, "mobile viewport needs tighter horizontal padding");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.card\{[^}]*padding:14px/, "mobile cards need reduced padding");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.fb\.show\{[^}]*margin-inline:-4px/, "mobile feedback should reclaim card width");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.ai-box\{[^}]*padding:10px/, "mobile AI Tutor panel needs compact padding");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.ai-box\{[^}]*margin-inline:-2px/, "mobile AI Tutor panel should reclaim horizontal room");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.ai-box\{[^}]*border-left:0/, "mobile AI Tutor panel should reduce nested side borders");
expect(/@media\(max-width:560px\)\{[\s\S]*?\.ai-output\{[^}]*font-size:14px/, "mobile AI Tutor output needs controlled text sizing");
expectMissing(/out\.innerHTML=`\$\{escapeHtml\(data\.answer\|\|/s, "AI Tutor still appends escaped raw Markdown as text");

const mobile560Index = html.lastIndexOf("@media(max-width:560px)");
const aiActionsIndex = html.indexOf(".ai-actions .btn{width:auto");
const explIndex = html.indexOf(".expl{margin-top:10px");
if (mobile560Index < aiActionsIndex || mobile560Index < explIndex) failures.push("mobile feedback overrides must appear after base feedback and AI Tutor styles");
expect(/home-brief/, "home summary should use a structured brief instead of a dense paragraph");
expect(/home-catalog card/, "home practice entry points should be grouped in a catalog card");
expect(/ai-drill-card card/, "AI syllabus drill card is missing");
expect(/function aiQuestionHtml\(/, "AI syllabus question renderer is missing");
expect(/async function generateAiQuestion\(/, "AI syllabus question generator is missing");
expect(/\/api\/ai-question/, "AI syllabus question endpoint is not wired into the UI");
expect(/const AI_QUESTION_APP_URL = "https:\/\/psychiatry-szmc\.netlify\.app\/"/, "AI syllabus drill needs a canonical Netlify app URL");
expect(/function aiQuestionAvailable\(/, "AI syllabus drill needs an availability check");
expect(/id="ai-open-netlify"/, "AI syllabus drill needs a real Netlify handoff link when functions are unavailable");
expectMissing(/id="ai-open-netlify"[^>]*aria-disabled="true"/, "AI syllabus Netlify handoff link must not be exposed as disabled");
expect(/dir="ltr">Kaplan &amp; Sadock/, "mixed Hebrew/English source names need an LTR boundary");
expectMissing(/v\.append\(el\("div","banner",`בנק עם/, "old dense home banner is still present");
expectMissing(/v\.append\(aiQuestionHtml\(tps\)\)/, "AI syllabus card HTML is appended as text instead of rendered DOM");

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

const rendererSource = ["escapeHtml", "aiInlineMarkdown", "aiTableCells", "aiTableDivider", "renderAiTable", "renderAiMarkdown", "renderAiAnswer"].map(extractFunction).join("\n");
const aiCardSource = ["escapeHtml", "weakestTopicIndex", "aiQuestionAvailable", "aiQuestionHtml"].map(extractFunction).join("\n");
if (aiCardSource.trim()) {
  try {
    const context = {
      AUTH: { required: false, user: null },
      TOPICS: ["Mood Disorders"],
      AI_SYLLABUS_SOURCES: [{ value: "synopsis", label: "Kaplan & Sadock Synopsis", hint: "סיכום ליבה לבחינה" }],
      AI_QUESTION_APP_URL: "https://psychiatry-szmc.netlify.app/",
      QUESTIONS: [],
      PROG: {},
    };
    vm.createContext(context);
    vm.runInContext(aiCardSource, context);
    const renderedAiCard = vm.runInContext("aiQuestionHtml({0: 1})", context);
    if (!renderedAiCard.includes('id="ai-open-netlify" href="https://psychiatry-szmc.netlify.app/"')) failures.push("AI syllabus Netlify handoff href does not render to the canonical URL");
    if (renderedAiCard.includes("${AI_QUESTION_APP_URL}")) failures.push("AI syllabus Netlify handoff leaks a template placeholder");
    const renderedAuthedAiCard = vm.runInContext("AUTH.required = true; AUTH.user = { id: 'test-user' }; aiQuestionHtml({0: 1})", context);
    if (!renderedAuthedAiCard.includes('id="ai-generate"')) failures.push("AI syllabus authenticated card does not render the generate button");
    if (renderedAuthedAiCard.includes('id="ai-open-netlify"')) failures.push("AI syllabus authenticated card still renders the Netlify handoff");
    if (/id="ai-topic" disabled/.test(renderedAuthedAiCard)) failures.push("AI syllabus authenticated card leaves controls disabled");
  } catch (err) {
    failures.push(`AI syllabus card regression threw: ${err.message}`);
  }
}

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
      "- נקודה שתיים",
      "",
      "| הפרעה | שלב שינה | זיכרון |",
      "|---|---|---|",
      "| Nightmare | REM | זוכר |",
      "| Sleepwalking | NREM | לא זוכר |",
      "",
      "> REM = זוכר + מפחיד"
    ].join("\n"))})`, context);
    if (!rendered.includes("<h4>תשובה</h4>")) failures.push("AI Markdown renderer does not convert level-2 headings");
    if (!rendered.includes("<strong>התשובה הנכונה: א. Olanzapine</strong>")) failures.push("AI Markdown renderer does not convert bold emphasis");
    if (!rendered.includes('<hr class="ai-rule">')) failures.push("AI Markdown renderer does not convert separators");
    if (!rendered.includes("<ul>") || !rendered.includes("<li>נקודה אחת</li>")) failures.push("AI Markdown renderer does not convert bullets");
    if (!rendered.includes('<table class="ai-table">')) failures.push("AI Markdown renderer does not convert pipe tables");
    if (!rendered.includes("<th>הפרעה</th>") || !rendered.includes("<td>Nightmare</td>")) failures.push("AI Markdown renderer loses table cells");
    if (!rendered.includes('<blockquote class="ai-quote">REM = זוכר + מפחיד</blockquote>')) failures.push("AI Markdown renderer does not convert blockquotes");
    if (/(^|>)\s*(#{2,3}|---|\*\*|\|---|\|[^<]*\|)/.test(rendered)) failures.push("AI Markdown renderer leaves raw Markdown markers visible");

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
