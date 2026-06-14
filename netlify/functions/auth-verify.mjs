import { authConfig, json, JSON_HEADERS, requireAuth } from "./lib/auth.mjs";

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "Method not allowed" }, 405);

  if (!authConfig().enabled) return json({ enabled: false, user: null });
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  return json({
    enabled: true,
    user: { username: auth.user.username },
    expiresAt: auth.user.expiresAt
  });
}

export const config = {
  path: "/api/auth-verify",
  method: ["GET", "POST", "OPTIONS"]
};
