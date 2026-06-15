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

// Fail closed by default: a caller must explicitly opt into the Supabase-disabled
// passthrough (allowDisabled:true). Protected endpoints rely on the default, so a new
// endpoint that forgets to pass an option still rejects when Supabase env is unset.
export async function requireSupabaseUser(req, { allowDisabled = false } = {}) {
  const cfg = supabaseConfig();
  if (!cfg.enabled) {
    if (allowDisabled) return { ok: true, enabled: false, user: null };
    return { ok: false, enabled: false, response: json({ error: "Supabase is not configured" }, 501) };
  }

  const token = bearerToken(req);
  if (!token) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };

  let response;
  try {
    response = await fetchWithTimeout(`${cfg.url}/auth/v1/user`, {
      headers: {
        "apikey": cfg.key,
        "Authorization": `Bearer ${token}`
      }
    }, 6000);
  } catch {
    // network error or timeout reaching Supabase auth — clean 503, not a platform hang
    return { ok: false, enabled: true, response: json({ error: "Auth check failed" }, 503) };
  }

  if (!response.ok) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };
  const user = await response.json().catch(() => null);
  if (!user?.id) return { ok: false, enabled: true, response: json({ error: "Unauthorized" }, 401) };
  return { ok: true, enabled: true, user, token };
}

// fetch with an abort timeout so a hung upstream returns a clean error instead of
// burning the function's wall-clock until the platform kills it.
export function fetchWithTimeout(url, options = {}, ms = 9000) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(ms) });
}

export function isHttpsUrl(url) {
  try { return new URL(url).protocol === "https:"; } catch { return false; }
}

// Best-effort, per-instance sliding-window rate limiter. NOTE: a serverless platform runs
// many function instances, so this only throttles bursts that hit the same warm instance —
// it is defense-in-depth against a single authed client hammering the SHARED, billed AI
// proxy, NOT a global guarantee. The authoritative controls are the upstream proxy limits
// and the tight per-request token caps.
const RATE_BUCKETS = new Map(); // key -> number[] of request timestamps (ms)
export function rateLimit(key, { limit = 30, windowMs = 60000 } = {}) {
  if (!key) return { ok: true };
  const now = Date.now();
  const recent = (RATE_BUCKETS.get(key) || []).filter(t => now - t < windowMs);
  if (recent.length >= limit) {
    RATE_BUCKETS.set(key, recent);
    return { ok: false, retryAfter: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000)) };
  }
  recent.push(now);
  RATE_BUCKETS.set(key, recent);
  if (RATE_BUCKETS.size > 5000) {
    for (const [k, v] of RATE_BUCKETS) {
      if (!v.length || now - v[v.length - 1] > windowMs) RATE_BUCKETS.delete(k);
    }
  }
  return { ok: true };
}
