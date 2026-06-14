import { env, json, JSON_HEADERS, requireSupabaseUser } from "./lib/supabase.mjs";

const MODE_LABELS = {
  explain: "הסבר קצר ומדויק",
  wrong: "ניתוח הטעות של המשתמש",
  plan: "תכנית חיזוק קצרה"
};

function compact(value, max = 12000) {
  return String(value || "").slice(0, max);
}

function sanitizeAiAnswer(answer) {
  const lines = String(answer || "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let headingCount = 0;
  let bulletCount = 0;
  for (const raw of lines) {
    let line = raw.trim();
    if (!line) {
      if (out[out.length - 1] !== "") out.push("");
      continue;
    }
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line)) continue;
    if (/^\|.*\|$/.test(line)) {
      const cells = line.slice(1, -1).split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length) line = `- ${cells.join(" — ")}`;
    }
    line = line.replace(/^[><]\s*/, "");
    if (/^#{1,4}\s+/.test(line)) {
      headingCount++;
      if (headingCount > 4) line = line.replace(/^#{1,4}\s+/, "- ");
    }
    if (/^[-*]\s+/.test(line)) {
      bulletCount++;
      if (bulletCount > 6) continue;
    }
    out.push(line);
  }
  return compact(out.join("\n").replace(/\n{3,}/g, "\n\n").trim(), 2800);
}

function buildPrompt(body) {
  const q = body.question || {};
  const options = Array.isArray(q.options) ? q.options : [];
  const accepted = Array.isArray(q.acceptedLetters) ? q.acceptedLetters.join(", ") : "";
  const mode = MODE_LABELS[body.mode] || MODE_LABELS.explain;
  const selected = body.selectedLetter ? `${body.selectedLetter}. ${options[body.selectedIndex] || ""}` : "לא נבחרה תשובה";
  const weak = Array.isArray(body.progressSummary?.weak)
    ? body.progressSummary.weak.map(t => `${t.topic}: ${t.accuracy}% (${t.seen})`).join("; ")
    : "";

  return `
מצב: ${mode}
שאלה: ${compact(q.stem, 2500)}
אפשרויות:
${options.map((opt, i) => `${["א", "ב", "ג", "ד"][i]}. ${compact(opt, 1000)}`).join("\n")}
התשובות המתקבלות לפי המפתח הרשמי לאחר ערעור: ${accepted}
תשובת המשתמש: ${compact(selected, 1200)}
נושא: ${compact(q.topic, 200)}
מועד: ${compact(q.sitting, 80)}
מקור: ${compact(q.ref, 300)}
הסבר מקומי קיים: ${compact(body.explanation, 5000)}
דגל מפתח רשמי, אם קיים: ${compact(body.keyDoubt?.issue, 2000)}
חולשות משתמש לפי התקדמות מקומית: ${compact(weak, 1200)}

ענה בעברית. השתמש רק במידע שסופק כאן. אל תשנה את המפתח הרשמי. אם קיים דגל מפתח, הסבר שזה דגל לימודי ולא תיקון רשמי. אל תיתן ייעוץ רפואי למטופל אמיתי.
מבנה תשובה: עד 4 כותרות קצרות, עד 6 נקודות, משפטים קצרים שמתאימים למסך טלפון. אל תשתמש בטבלאות Markdown או בקווי הפרדה ארוכים.
`.trim();
}

function citations(body) {
  const out = [];
  if (body.question?.ref) out.push(body.question.ref);
  if (body.explanation) out.push("הסבר מקומי מאומת");
  if (body.keyDoubt?.id) out.push(`דגל מפתח: ${body.keyDoubt.id}`);
  return out;
}

const SYSTEM_PROMPT = "You are a source-grounded medical exam study tutor. You help with board-exam study, not patient care. Use only the information provided in the user message. Never change the official answer key. Answer in concise Hebrew. Keep answers phone-friendly: no Markdown tables, no long separators, at most four short headings and six bullets.";

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Require a real authenticated Supabase user — the AI tutor is only available on the
  // authenticated deploy, and we forward this user's session JWT to the proxy below.
  const auth = await requireSupabaseUser(req, { allowDisabled: false });
  if (!auth.ok) return auth.response;

  // AI tutor routes through the shared Toranot Claude proxy (Anthropic messages API). The
  // proxy authenticates EITHER an x-api-secret OR a Supabase session JWT validated against
  // the same shared Supabase project. We forward the authenticated user's JWT, so no shared
  // proxy secret needs to be stored on this site. CLAUDE_PROXY_SECRET, when set, is sent as
  // an explicit override (e.g. if this app is ever pointed at a non-Supabase proxy).
  const proxyUrl = env("CLAUDE_PROXY_URL") || "https://toranot.netlify.app/api/claude";
  const proxySecret = env("CLAUDE_PROXY_SECRET");

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body?.question?.id || !body?.question?.stem || !Array.isArray(body?.question?.options)) {
    return json({ error: "Missing question payload" }, 400);
  }

  const model = env("CLAUDE_MODEL") || "claude-sonnet-4-6";
  const proxyHeaders = { "Content-Type": "application/json" };
  if (proxySecret) proxyHeaders["x-api-secret"] = proxySecret;
  else if (auth.token) proxyHeaders["Authorization"] = `Bearer ${auth.token}`;

  let response, data;
  try {
    response = await fetch(proxyUrl, {
      method: "POST",
      headers: proxyHeaders,
      body: JSON.stringify({
        model,
        max_tokens: 520,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(body) }]
      })
    });
    data = await response.json().catch(() => ({}));
  } catch (err) {
    return json({ error: `AI proxy request failed: ${err?.message || "network error"}` }, 502);
  }

  if (!response.ok) {
    return json({ error: data?.error?.message || data?.error || "AI proxy request failed" }, response.status);
  }

  const answer = Array.isArray(data.content)
    ? data.content.filter(part => part.type === "text").map(part => part.text).join("\n")
    : "";

  return json({
    answer: sanitizeAiAnswer(answer) || "לא התקבלה תשובה מהמודל.",
    citations: citations(body),
    keyDoubt: !!body.keyDoubt,
    safetyNote: "Study support only; official answer key is unchanged."
  });
}

export const config = {
  path: "/api/ai-tutor",
  method: ["POST", "OPTIONS"]
};
