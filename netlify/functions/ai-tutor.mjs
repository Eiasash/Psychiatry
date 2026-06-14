import { env, json, JSON_HEADERS, requireSupabaseUser } from "./lib/supabase.mjs";

const MODE_LABELS = {
  explain: "הסבר קצר ומדויק",
  wrong: "ניתוח הטעות של המשתמש",
  plan: "תכנית חיזוק קצרה"
};

function compact(value, max = 12000) {
  return String(value || "").slice(0, max);
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
`.trim();
}

function citations(body) {
  const out = [];
  if (body.question?.ref) out.push(body.question.ref);
  if (body.explanation) out.push("הסבר מקומי מאומת");
  if (body.keyDoubt?.id) out.push(`דגל מפתח: ${body.keyDoubt.id}`);
  return out;
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = await requireSupabaseUser(req);
  if (!auth.ok) return auth.response;

  const apiKey = env("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "OPENAI_API_KEY is not configured" }, 501);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (!body?.question?.id || !body?.question?.stem || !Array.isArray(body?.question?.options)) {
    return json({ error: "Missing question payload" }, 400);
  }

  const model = env("OPENAI_MODEL") || "gpt-5.5";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      instructions: "You are a source-grounded medical exam study tutor. You help with board-exam study, not patient care. Answer in concise Hebrew.",
      input: buildPrompt(body),
      max_output_tokens: 700
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return json({ error: data.error?.message || "OpenAI request failed" }, response.status);
  }

  const answer = data.output_text || (Array.isArray(data.output)
    ? data.output.flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text).join("\n")
    : "");

  return json({
    answer: answer.trim() || "לא התקבלה תשובה מהמודל.",
    citations: citations(body),
    keyDoubt: !!body.keyDoubt,
    safetyNote: "Study support only; official answer key is unchanged."
  });
}

export const config = {
  path: "/api/ai-tutor",
  method: ["POST", "OPTIONS"]
};
