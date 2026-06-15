# Roadmap Implementation - 2026-06-14

This pass implements the next roadmap after the WCAG audit.

## Added

- Resumable quiz sessions persisted in local IndexedDB/localStorage fallback.
- Starred questions and a saved-question practice mode.
- Exam simulation per sitting with timer, final review, skipped/wrong tracking, and retry.
- Browse filters for OCR, key-doubt, all-accepted, multi-accepted, weak, and saved questions.
- Browse pagination and search highlighting.
- Progress export/import JSON.
- IndexedDB-first local state with migration/fallback from old localStorage keys.
- Persistent-storage request on first meaningful save.
- Safari/iPhone Home Screen coach tied to local data durability.
- Quick timed blocks of 25, 50, or 100 random questions.
- Service-worker update banner.
- Optional Supabase email/password login surfaced through Netlify `/api/supabase-config`.
- Protected Netlify JSON delivery for the question bank, explanations, and key-doubt metadata.
- Per-user Supabase progress sync for Leitner state, starred questions, and resumable sessions.
- Optional Netlify AI Tutor endpoint at `/api/ai-tutor`.
- In-app key-doubt study flags sourced from `docs/answer_key_doubts.json`.

## Guardrails

- Official answer keys remain unchanged.
- OCR stems remain unchanged.
- AI Tutor is optional and source-grounded in the local question/explanation payload.
- No API key, password, service-role key, or signing secret is committed; Netlify must provide Supabase public config (`SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_ANON_KEY`) when login/sync are enabled. The AI Tutor and AI-question endpoints route through the shared Toranot Claude proxy authenticated by the signed-in user's Supabase JWT — **no model API key (OpenAI or otherwise) lives in this repo**.
- Canonical question data stays static and is served through a token-checking Netlify Function when auth is enabled.
- User progress, stars, and sessions remain local-first and sync only to rows owned by the authenticated Supabase user.
- Supabase Auth owns password handling; the app stores only the Supabase session in browser storage.

## Deployment Notes

- GitHub Pages continues to serve the offline PWA without AI.
- Netlify can serve the same static app plus Supabase login, protected JSON, progress sync, and AI endpoints.
- Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` to require login on Netlify.
- Apply `supabase/migrations/*_study_progress.sql` before expecting cloud progress sync.
- Every release still requires aligned `package.json`, `manifest.json`, and `sw.js` cache markers.
