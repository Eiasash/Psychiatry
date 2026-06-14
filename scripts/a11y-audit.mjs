#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(here, "../index.html");
const html = readFileSync(indexPath, "utf8");

function fail(message) {
  failures.push(message);
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Unsupported color: ${hex}`);
  }
  return [0, 2, 4].map(i => parseInt(normalized.slice(i, i + 2), 16));
}

function srgbToLinear(v) {
  const n = v / 255;
  return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function colorValue(token) {
  if (token.startsWith("#")) return token;
  const value = cssVars.get(token);
  if (!value) throw new Error(`Missing CSS variable ${token}`);
  return value;
}

const failures = [];
const cssVars = new Map();
const rootMatch = html.match(/:root\s*\{([\s\S]*?)\}/);
if (!rootMatch) fail("Missing :root CSS variables");
else {
  for (const match of rootMatch[1].matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)) {
    cssVars.set(match[1], match[2]);
  }
}

const contrastPairs = [
  ["--txt", "--bg", "body text on page background"],
  ["--txt", "--bg2", "body text on secondary background"],
  ["--txt", "--card", "body text on card"],
  ["--txt", "--card2", "button and option text"],
  ["--txt", "--chip", "chip text"],
  ["--txt", "--accent", "primary button text"],
  ["--txt", "--accent-d", "primary button text on darker gradient edge"],
  ["--txt", "--good-bg", "feedback text on correct background"],
  ["--txt", "--bad-bg", "feedback text on incorrect background"],
  ["--muted", "--bg", "muted text on page background"],
  ["--muted", "--card", "muted text on card"],
  ["--muted", "--card2", "muted text on option/button surface"],
  ["--muted", "--chip", "muted text on chip"],
  ["--muted", "--good-bg", "feedback source text on correct background"],
  ["--muted", "--bad-bg", "feedback source text on incorrect background"],
  ["--faint", "--bg", "inactive nav text"],
  ["--faint", "--card", "secondary meta text on card"],
  ["--faint", "--card2", "secondary meta text on secondary card"],
  ["--faint", "--chip", "chip count text"],
  ["--accent2", "--bg", "accent link on page background"],
  ["--accent2", "--card", "accent text on card"],
  ["--accent2", "--card2", "accent text on option/button surface"],
  ["--accent2", "--chip", "accent text on chip"],
  ["--accent2", "--good-bg", "explanation heading on correct feedback"],
  ["--accent2", "--bad-bg", "explanation heading on incorrect feedback"],
  ["#ffffff", "--accent", "active chip text"],
  ["--bg", "--focus", "skip-link text on focus background"],
  ["--good", "--good-bg", "correct border/status color"],
  ["--bad", "--bad-bg", "incorrect border/status color"],
  ["--warn", "--bg", "warning text on page background"],
  ["--warn", "--card", "warning text on card"],
  ["--warn", "--card2", "warning text on secondary card"],
  ["#04231a", "--good", "correct option key text"],
  ["#3d0a14", "--bad", "incorrect option key text"]
];

const ratios = [];
for (const [fg, bg, label] of contrastPairs) {
  const value = contrast(colorValue(fg), colorValue(bg));
  ratios.push({ label, fg, bg, ratio: value });
  if (value < 4.5) fail(`Contrast ${value.toFixed(2)}:1 fails for ${label} (${fg} on ${bg})`);
}

const checks = [
  [/button:focus-visible,input:focus-visible,.fb:focus-visible/, "visible focus styles for buttons, inputs, and feedback"],
  [/class="skip-link"/, "skip link"],
  [/<main class="wrap" id="main" tabindex="-1">/, "semantic main landmark with managed focus"],
  [/<nav class="bar" aria-label="ניווט ראשי">/, "labeled navigation landmark"],
  [/role="status" aria-live="polite" aria-atomic="true"/, "toast live region"],
  [/fb\.setAttribute\("role","status"\)/, "grading feedback role"],
  [/fb\.setAttribute\("aria-live","polite"\)/, "grading feedback live region"],
  [/fb\.focus\(\{preventScroll:true\}\)/, "feedback focus management"],
  [/aria-keyshortcuts",String\(k\+1\)/, "number-key option shortcuts"],
  [/aria-keyshortcuts","Enter"/, "Enter shortcut for next question"],
  [/prefers-reduced-motion: reduce/, "reduced motion media query"],
  [/prefers-reduced-data: reduce/, "reduced data media query"],
  [/navigator\.connection\?\.saveData/, "Save-Data runtime handling"],
  [/indexedDB\.open/, "IndexedDB-first local state"],
  [/navigator\.storage\?\.persist/, "persistent storage request"],
  [/שמירה יציבה יותר באייפון/, "Safari Home Screen durability coach"],
  [/aria-labelledby","auth-title"/, "login view label management"],
  [/autocomplete="username"/, "username autocomplete"],
  [/autocomplete="current-password"/, "password autocomplete"],
  [/id="auth-message" role="status" aria-live="polite"/, "login feedback live region"],
  [/min-height:44px/, "44px minimum hit target"],
  [/min-height:56px/, "larger quiz option hit target"]
];

for (const [pattern, label] of checks) {
  if (!pattern.test(html)) fail(`Missing ${label}`);
}

if (/tabindex="[1-9]/.test(html)) fail("Positive tabindex detected");
if (/role=["']button["']/.test(html)) fail("role=button detected; use semantic button elements");
if (/<div[^>]+onclick=/.test(html)) fail("Clickable div detected");

console.log("WCAG 2.1 AA contrast audit:");
for (const item of ratios) {
  console.log(`  ${item.ratio.toFixed(2)}:1  ${item.label} (${item.fg} on ${item.bg})`);
}

if (failures.length) {
  console.error(`\nAccessibility audit failed (${failures.length}):`);
  failures.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}

console.log(`\nAccessibility audit passed (${ratios.length} contrast pairs, ${checks.length} structural checks).`);
