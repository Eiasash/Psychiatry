import { json, JSON_HEADERS, supabaseConfig } from "./lib/supabase.mjs";

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const cfg = supabaseConfig();
  return json({
    enabled: cfg.enabled,
    url: cfg.enabled ? cfg.url : "",
    key: cfg.enabled ? cfg.key : ""
  });
}

export const config = {
  path: "/api/supabase-config",
  method: ["GET", "OPTIONS"]
};
