export const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { ...JSON_HEADERS, ...headers } });
}

export function env(name) {
  return globalThis.Netlify?.env?.get(name) || "";
}

export function supabaseConfig() {
  const url = env("SUPABASE_URL").replace(/\/+$/, "");
  const key = env("SUPABASE_PUBLISHABLE_KEY") || env("SUPABASE_ANON_KEY");
  return { enabled: !!(url && key), url, key };
}

function bearerToken(req) {
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

export async function requireSupabaseUser(req, { allowDisabled = true } = {}) {
  const cfg = supabaseConfig();
  if (!cfg.enabled) {
    if (allowDisabled) return { ok: true, enabled: false, user: null };
    return { ok: false, enabled: false, response: json({ error: "Supabase is not configured" }, 501) };
  }

  const token = bearerToken(req);
  if (!token) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };

  const response = await fetch(`${cfg.url}/auth/v1/user`, {
    headers: {
      "apikey": cfg.key,
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };
  const user = await response.json().catch(() => null);
  if (!user?.id) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };
  return { ok: true, enabled: true, user, token };
}
