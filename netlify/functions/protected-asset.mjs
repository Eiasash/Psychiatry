import { readFile } from "node:fs/promises";
import { json, requireSupabaseUser } from "./lib/supabase.mjs";

const ALLOWED = new Map([
  ["data/questions.json", new URL("../../data/questions.json", import.meta.url)],
  ["data/explanations.json", new URL("../../data/explanations.json", import.meta.url)],
  ["docs/answer_key_doubts.json", new URL("../../docs/answer_key_doubts.json", import.meta.url)]
]);

export default async function handler(req) {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const auth = await requireSupabaseUser(req, { allowDisabled: false });
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "";
  const target = ALLOWED.get(path);
  if (!target) return json({ error: "Not found" }, 404);

  const body = await readFile(target, "utf8");
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store"
    }
  });
}

export const config = {
  path: "/api/protected-asset",
  method: ["GET"]
};
