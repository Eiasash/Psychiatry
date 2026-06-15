import { env, json, JSON_HEADERS, requireSupabaseUser } from "./lib/supabase.mjs";

const SOURCE_LABELS = {
  synopsis: "Kaplan & Sadock Synopsis",
  dsm: "DSM diagnostic criteria",
  psychopharm: "Psychopharmacology syllabus",
  ethics: "Law, ethics and board syllabus"
};

const LEVEL_LABELS = {
  board: "Israeli Psychiatry Shlav Aleph board level",
  hard: "hard board-style distractors",
  review: "short high-yield review"
};

function compact(value, max = 2000) {
  return String(value || "").slice(0, max);
}

function hasUnsupportedLocator(value) {
  return /\b(?:p|pp|page)\.?\s*\d+(?:[-–]\d+)?\b|עמ(?:'|וד)?\s*\d+(?:[-–]\d+)?/i.test(String(value || ""));
}

function extractText(data) {
  if (Array.isArray(data?.content)) {
    return data.content.filter(part => part.type === "text").map(part => part.text).join("\n");
  }
  if (typeof data?.answer === "string") return data.answer;
  if (typeof data?.text === "string") return data.text;
  return "";
}

function parseJsonBlock(text) {
  const raw = String(text || "").trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1].trim() : raw;
  try {
    return JSON.parse(body);
  } catch {}
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(body.slice(start, end + 1));
  throw new Error("AI response was not valid JSON");
}

function sourceScopedCitations(candidate, request) {
  const sourceLabel = compact(request.sourceLabel, 180).trim();
  const raw = Array.isArray(candidate?.citations)
    ? candidate.citations.map(c => compact(c, 180).trim()).filter(Boolean)
    : [];
  const scoped = raw
    .map(c => c
      .replace(/\b(?:p|pp)\.?\s*\d+(?:[-–]\d+)?\b/gi, "")
      .replace(/עמ(?:'|וד)?\s*\d+(?:[-–]\d+)?/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/[·,:;,-]\s*$/, "")
      .trim())
    .filter(c => c && sourceLabel && (c === sourceLabel || c.includes(sourceLabel)));
  const out = [sourceLabel, ...scoped].filter(Boolean);
  return [...new Set(out)].slice(0, 4);
}

function normalizeQuestion(candidate, request) {
  const stem = compact(candidate?.stem, 1600).trim();
  const options = Array.isArray(candidate?.options) ? candidate.options.map(o => compact(o, 600).trim()).filter(Boolean).slice(0, 4) : [];
  const correctIndex = Number(candidate?.correctIndex);
  const explanation = compact(candidate?.explanation, 2600).trim();
  if (!stem || options.length !== 4 || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3 || !explanation) {
    throw new Error("AI response did not include a complete MCQ");
  }
  const rawCitations = Array.isArray(candidate?.citations) ? candidate.citations.map(c => compact(c, 180).trim()).filter(Boolean) : [];
  if (!rawCitations.length) {
    throw new Error("AI response did not include a source citation");
  }
  if ([stem, explanation, ...options].some(hasUnsupportedLocator)) {
    throw new Error("AI response included an unsupported exact source locator/page reference");
  }
  const citations = sourceScopedCitations(candidate, request);
  const qualityWarnings = questionQualityWarnings(candidate, request, citations);
  return {
    stem,
    options,
    correctIndex,
    explanation,
    topic: request.topic,
    source: request.source,
    sourceLabel: request.sourceLabel,
    citations,
    qualityWarnings,
    sourceContract: {
      source: request.source,
      sourceLabel: request.sourceLabel,
      scope: "Generated from the selected syllabus source scope only.",
      limit: "AI-generated practice; not part of the verified 900-question bank or official answer key."
    },
    generated: true
  };
}

function questionQualityWarnings(candidate, request, citations) {
  const warnings = [];
  const sourceLabel = compact(request.sourceLabel, 180).trim();
  const raw = Array.isArray(candidate?.citations)
    ? candidate.citations.map(c => compact(c, 180).trim()).filter(Boolean)
    : [];
  if (!raw.length) {
    warnings.push("המודל לא החזיר מקור מפורש; השאלה נשארת מסומנת כתרגול AI בלבד.");
  }
  if (raw.some(c => sourceLabel && !(c === sourceLabel || c.includes(sourceLabel)))) {
    warnings.push("חלק מציוני המקור של המודל לא תאמו למקור הסילבוס שנבחר וסוננו.");
  }
  if (raw.some(hasUnsupportedLocator)) {
    warnings.push("ציוני עמוד מדויקים של המודל סוננו כדי למנוע מראה מקום מומצא.");
  }
  if (!citations.length) {
    warnings.push("לא נשאר ציון מקור מאומת לאחר סינון.");
  }
  if (/(?:מבחן אמיתי|שאלה אמיתית|real exam)/i.test(`${candidate?.stem || ""}\n${candidate?.explanation || ""}`)) {
    warnings.push("נוסח המודל רמז שמדובר בשאלה אמיתית; יש להתייחס אליה כתרגול AI בלבד.");
  }
  return [...new Set(warnings)].slice(0, 4);
}

function buildPrompt(body) {
  const sourceLabel = SOURCE_LABELS[body.source] || compact(body.sourceLabel, 120) || SOURCE_LABELS.synopsis;
  const level = LEVEL_LABELS[body.level] || LEVEL_LABELS.board;
  const weak = Array.isArray(body.progressSummary?.weak)
    ? body.progressSummary.weak.map(t => `${t.topic}: ${t.accuracy}% (${t.seen})`).join("; ")
    : "";

  return `
Create exactly one original psychiatry board-style multiple-choice question for study.

Topic: ${compact(body.topic, 160)}
Syllabus source scope: ${sourceLabel}
Difficulty: ${level}
Known weak areas from this user's local progress: ${compact(weak, 900)}

Rules:
- The question must be original and must not claim to be from a real exam.
- It is not part of the verified 900-question bank or the official answer key.
- Stay inside the selected syllabus source scope. Do not invent page numbers, direct quotes, or exact source locators.
- Use Hebrew for the stem, options, and explanation, while preserving standard English drug/test names when useful.
- Provide four plausible options.
- Exactly one option is best.
- Keep it suitable for physician board-exam study, not patient-care advice.
- Return strict JSON only, with this shape:
{
  "stem": "string",
  "options": ["string", "string", "string", "string"],
  "correctIndex": 0,
  "explanation": "string",
  "citations": ["${sourceLabel}"]
}
`.trim();
}

const SYSTEM_PROMPT = "You generate source-grounded, source-scoped psychiatry board-study questions. Return only valid JSON. Do not provide patient-care advice. Do not invent page numbers or exact source locators.";

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = await requireSupabaseUser(req, { allowDisabled: false });
  if (!auth.ok) return auth.response;

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body?.topic || !body?.source) return json({ error: "Missing topic or source" }, 400);
  const request = {
    ...body,
    sourceLabel: SOURCE_LABELS[body.source] || compact(body.sourceLabel, 120) || SOURCE_LABELS.synopsis
  };

  const proxyUrl = env("CLAUDE_PROXY_URL") || "https://toranot.netlify.app/api/claude";
  const proxySecret = env("CLAUDE_PROXY_SECRET");
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
        max_tokens: 900,
        temperature: 0.5,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(request) }]
      })
    });
    data = await response.json().catch(() => ({}));
  } catch (err) {
    return json({ error: `AI proxy request failed: ${err?.message || "network error"}` }, 502);
  }

  if (!response.ok) {
    return json({ error: data?.error?.message || data?.error || "AI proxy request failed" }, response.status);
  }

  try {
    const question = normalizeQuestion(parseJsonBlock(extractText(data)), request);
    return json({ question, safetyNote: "AI-generated study question; not part of the official answer key." });
  } catch (err) {
    return json({ error: err?.message || "Invalid AI question response" }, 502);
  }
}

export const config = {
  path: "/api/ai-question",
  method: ["POST", "OPTIONS"]
};
