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
- Optional Netlify username/password login gate at `/api/auth-login`.
- Optional Netlify AI Tutor endpoint at `/api/ai-tutor`.
- In-app key-doubt study flags sourced from `docs/answer_key_doubts.json`.

## Guardrails

- Official answer keys remain unchanged.
- OCR stems remain unchanged.
- AI Tutor is optional and source-grounded in the local question/explanation payload.
- No API key, password, or signing secret is committed; Netlify must provide `OPENAI_API_KEY` and login env vars when those features are enabled.
- Canonical question data stays static; user progress, stars, and sessions are local-only.
- Password login stores only a signed session token in the browser; raw passwords are never persisted by the app.

## Deployment Notes

- GitHub Pages continues to serve the offline PWA without AI.
- Netlify can serve the same static app plus the login and AI endpoints.
- Set `APP_AUTH_USERNAME`, `APP_AUTH_PASSWORD_HASH`, and `APP_AUTH_SESSION_SECRET` to require login.
- Every release still requires aligned `package.json`, `manifest.json`, and `sw.js` cache markers.
