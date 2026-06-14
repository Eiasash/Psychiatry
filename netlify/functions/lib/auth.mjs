import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const DEFAULT_TTL_HOURS = 168;
const MAX_TTL_HOURS = 720;

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function env(name) {
  return globalThis.Netlify?.env?.get(name) || process.env?.[name] || "";
}

export function authConfig() {
  const ttlRaw = Number(env("APP_AUTH_SESSION_HOURS") || DEFAULT_TTL_HOURS);
  const ttlHours = Number.isFinite(ttlRaw) ? Math.min(Math.max(ttlRaw, 1), MAX_TTL_HOURS) : DEFAULT_TTL_HOURS;
  const username = env("APP_AUTH_USERNAME").trim();
  const passwordHash = env("APP_AUTH_PASSWORD_HASH").trim();
  const sessionSecret = env("APP_AUTH_SESSION_SECRET").trim();
  return {
    enabled: !!(username && passwordHash && sessionSecret),
    username,
    passwordHash,
    sessionSecret,
    ttlHours
  };
}

function safeEqual(a, b) {
  const left = Buffer.isBuffer(a) ? a : Buffer.from(String(a));
  const right = Buffer.isBuffer(b) ? b : Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

export function makePasswordHash(password, iterations = 310000) {
  if (!password || typeof password !== "string") throw new Error("Password is required");
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return `pbkdf2_sha256$${iterations}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const [scheme, iterationsRaw, saltRaw, hashRaw] = String(storedHash).split("$");
  if (scheme !== "pbkdf2_sha256" || !iterationsRaw || !saltRaw || !hashRaw) return false;
  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) return false;
  const expected = Buffer.from(hashRaw, "base64url");
  const actual = pbkdf2Sync(String(password), Buffer.from(saltRaw, "base64url"), iterations, expected.length, "sha256");
  return safeEqual(actual, expected);
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(username, cfg = authConfig()) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + cfg.ttlHours * 3600;
  const payload = Buffer.from(JSON.stringify({ sub: username, iat: now, exp }), "utf8").toString("base64url");
  return { token: `${payload}.${sign(payload, cfg.sessionSecret)}`, expiresAt: new Date(exp * 1000).toISOString() };
}

export function verifySessionToken(token, cfg = authConfig()) {
  if (!cfg.enabled || !token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, cfg.sessionSecret))) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (body.sub !== cfg.username || !Number.isFinite(body.exp) || body.exp <= Math.floor(Date.now() / 1000)) return null;
  return { username: body.sub, expiresAt: new Date(body.exp * 1000).toISOString() };
}

function bearerToken(req) {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

export function requireAuth(req) {
  const cfg = authConfig();
  if (!cfg.enabled) return { ok: true, enabled: false, user: null };
  const user = verifySessionToken(bearerToken(req), cfg);
  if (!user) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };
  return { ok: true, enabled: true, user };
}
