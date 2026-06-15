#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const auditSource = readFileSync(resolve(root, "scripts/data-quality-audit.mjs"), "utf8");
const failures = [];

function runAudit(...args) {
  return spawnSync(process.execPath, [resolve(root, "scripts/data-quality-audit.mjs"), ...args], {
    cwd: root,
    encoding: "utf8",
  });
}

const jsonRun = runAudit("--json");
if (jsonRun.status !== 0) {
  failures.push(`--json exited ${jsonRun.status}: ${jsonRun.stderr || jsonRun.stdout}`);
} else {
  try {
    const report = JSON.parse(jsonRun.stdout);
    if (!Array.isArray(report.anomalies)) failures.push("--json output should include an anomalies array");
    if (!report.count || report.count !== report.anomalies?.length) failures.push("--json count should match anomalies length");
    if (!report.byType || typeof report.byType !== "object") failures.push("--json output should include byType totals");
    const sample = report.anomalies?.[0] || {};
    for (const key of ["id", "sitting", "field", "type", "detail", "snippet"]) {
      if (!(key in sample)) failures.push(`anomaly rows should include ${key}`);
    }
    if (!report.byType?.["spacing-hebrew-english"]) failures.push("audit should classify mixed Hebrew/English spacing separately");
    if (report.byType?.["pdf-tail-artifact"]) failures.push("canonical fixtures should not contain copied PDF tail artifacts");
    if (!/function hasPdfTailArtifact\(/.test(auditSource)) failures.push("audit should keep copied PDF tail detection implemented");
    if (!/יש לבחור בתשובה אחת בלבד עבור כל שאלה/.test(auditSource)) failures.push("audit should keep the copied PDF instruction detector");
    if (report.byType?.["weak-ref"]) failures.push("canonical fixtures should not contain weak source-reference metadata");
    if (!/function hasWeakRef\(/.test(auditSource)) failures.push("audit should keep weak source-reference classification implemented");
    if (report.anomalies?.some(issue => issue.type === "glued-hebrew-english")) failures.push("old glued-hebrew-english type should be replaced by spacing-hebrew-english");
    const remaining2020Spacing = report.anomalies?.filter(issue => issue.type === "spacing-hebrew-english" && issue.sitting === "2020") || [];
    if (remaining2020Spacing.length) {
      failures.push(`2020 source-backed spacing cleanup should remain complete; found ${remaining2020Spacing.length} remaining 2020 spacing issues`);
    }
  } catch (err) {
    failures.push(`--json output is not parseable JSON: ${err.message}`);
  }
}

const markdownRun = runAudit("--markdown");
if (markdownRun.status !== 0) {
  failures.push(`--markdown exited ${markdownRun.status}: ${markdownRun.stderr || markdownRun.stdout}`);
} else {
  const md = markdownRun.stdout;
  if (!md.includes("# Data Quality Audit")) failures.push("--markdown should render a report title");
  if (!md.includes("## spacing-hebrew-english")) failures.push("--markdown should group spacing issues");
  if (md.includes("## pdf-tail-artifact")) failures.push("--markdown should not list resolved PDF tail artifacts");
  if (!md.includes("| id | field | sitting | snippet |")) failures.push("--markdown should include a triage table");
}

if (failures.length) {
  console.error(`Data quality regression failed (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("Data quality regression passed.");
