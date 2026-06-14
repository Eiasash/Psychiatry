#!/usr/bin/env node
import { makePasswordHash } from "../netlify/functions/lib/auth.mjs";

const password = process.argv.slice(2).join(" ") || process.env.APP_AUTH_PASSWORD || "";

if (!password) {
  console.error("Usage: npm run auth:hash -- \"your password\"");
  console.error("Or set APP_AUTH_PASSWORD and run: npm run auth:hash");
  process.exit(1);
}

console.log(makePasswordHash(password));
