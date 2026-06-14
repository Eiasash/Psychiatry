#!/usr/bin/env node
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const match = html.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);

if (!match) {
  console.error("index.html: missing inline app script");
  process.exit(1);
}

try {
  new vm.Script(match[1], { filename: "index.html<script>" });
  console.log("✓ index.html inline script parses");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
