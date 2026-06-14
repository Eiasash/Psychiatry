import { authConfig, createSessionToken, json, JSON_HEADERS, verifyPassword } from "./lib/auth.mjs";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const cfg = authConfig();
  if (!cfg.enabled) return json({ error: "Password login is not configured" }, 501);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");
  const validUser = username === cfg.username;
  const validPassword = verifyPassword(password, cfg.passwordHash);
  if (!validUser || !validPassword) {
    await sleep(250);
    return json({ error: "Invalid username or password" }, 401);
  }

  const session = createSessionToken(cfg.username, cfg);
  return json({
    ...session,
    user: { username: cfg.username }
  });
}

export const config = {
  path: "/api/auth-login",
  method: ["POST", "OPTIONS"]
};
