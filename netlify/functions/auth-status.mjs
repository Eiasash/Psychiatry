import { authConfig, json, JSON_HEADERS } from "./lib/auth.mjs";

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  return json({ enabled: authConfig().enabled });
}

export const config = {
  path: "/api/auth-status",
  method: ["GET", "OPTIONS"]
};
