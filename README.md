# שלב א' פסיכיאטריה — בנק שאלות / Psychiatry Shlav Aleph Board Prep

A single-file, installable PWA for drilling the Israeli **Shlav Aleph (שלב א') Psychiatry** board exam — built from the **המועצה המדעית / הר"י** sittings, with official answer keys (post-appeal) and source references.

🔗 **Live:** https://eiasash.github.io/Psychiatry/

## What's inside

- **900 real exam questions** from 7 sittings:

  | Sitting | Questions | Source fidelity |
  |---|---|---|
  | 2020 | 150 | byte-accurate (PDF text layer) |
  | 2021 · June | 150 | byte-accurate |
  | 2022 · June | 150 | byte-accurate |
  | 2023 · June | 150 | byte-accurate |
  | 2024 · May | 100 | byte-accurate |
  | 2024 · September | 100 | byte-accurate |
  | 2025 · June | 100 | **OCR/vision** — see note below |

  > **2025 · June** is tagged `vision: true`. Its source PDF has a corrupt font/text layer (private-use glyphs), so the **question stems were transcribed from page images and are not byte-verified** — they may contain occasional word-level errors. The **answer options, the official answer key, and the source references are reliable**, so questions remain answerable; the app marks these with an `OCR` badge and a "verify against the PDF" note. The other 800 questions are byte-accurate from the clean PDF text layers.

- **Official answer keys** (תשובה נכונה לאחר ערעור), including multi-accept answers and questions nullified on appeal (`כל התשובות מתקבלות`).
- **Source references** per question — Kaplan & Sadock *Synopsis*, DSM-5, and the relevant statutes (חוק לטיפול בחולי נפש וכו').
- **14 DSM-5 / Kaplan & Sadock topic categories** (rule-based tagging).

## Features

- MCQ drilling with instant grading (respects multi-accept keys).
- **Spaced repetition** (Leitner boxes) — "smart review" surfaces questions when due.
- Resumable quiz sessions after refresh/close.
- Starred questions with a dedicated saved-question practice mode.
- Exam simulation by sitting, including timer, final review, and wrong-answer retry.
- Filters by **sitting** and **topic**; "new", "random", and "mistakes" modes.
- Browse + full-text search across stems, options, references, and study flags; includes filters for OCR, all-accepted, multi-accepted, weak, saved, and key-doubt questions.
- Per-topic accuracy stats.
- Quick timed random blocks of 25, 50, or 100 questions.
- Progress export/import as local JSON.
- IndexedDB-first local persistence with a persistent-storage request when study state is saved.
- Optional Supabase email/password login on Netlify, with protected question JSON and cross-device progress sync.
- Optional AI Tutor via Netlify Function (`/api/ai-tutor`), routed through the shared Toranot Claude proxy.
- Hebrew RTL, dark theme, **offline-capable**, installable to home screen.
- Progress is stored locally first; when Supabase auth is configured it also syncs per user to Supabase.

## Tech

Zero-build single-file app (`index.html`) + JSON data files. Service worker (`sw.js`) caches the shell for offline use while keeping protected question JSON out of the public cache. Hosted on GitHub Pages for the public/offline build; Netlify Functions add optional Supabase login, protected JSON delivery, AI, and progress sync when deployed there.

The optional AI Tutor is implemented as a Netlify Function in `netlify/functions/ai-tutor.mjs`. It calls the shared **Toranot Claude proxy** (`toranot.netlify.app/api/claude`, Anthropic messages API) rather than a model vendor directly, so no model API key is stored in this project. The function requires an authenticated Supabase user and **forwards that user's Supabase session JWT to the proxy** as the `Authorization: Bearer` credential — the proxy validates it against the same shared Supabase project, so **no shared proxy secret needs to be stored on this site**. Optionally set `CLAUDE_PROXY_URL` to point at a different proxy, `CLAUDE_MODEL` to override the default model (`claude-sonnet-4-6`), and `CLAUDE_PROXY_SECRET` to send an explicit `x-api-secret` instead of the user JWT (only needed when pointing at a non-Supabase proxy). The GitHub Pages version keeps working without this endpoint and shows a graceful unavailable message.

## Supabase + Netlify auth

Supabase login is enabled only when these Netlify environment variables are set:

- `SUPABASE_URL` — project URL, for example `https://<project-ref>.supabase.co`.
- `SUPABASE_PUBLISHABLE_KEY` — Supabase publishable/anon browser key. `SUPABASE_ANON_KEY` is accepted as a fallback.
- `/api/ai-tutor` needs no extra secret — it forwards the signed-in user's Supabase JWT to the Toranot Claude proxy.
- `CLAUDE_PROXY_URL` — optional; overrides the proxy endpoint (default `https://toranot.netlify.app/api/claude`).
- `CLAUDE_MODEL` — optional; overrides the default AI Tutor model (`claude-sonnet-4-6`).
- `CLAUDE_PROXY_SECRET` — optional; sends an explicit `x-api-secret` instead of the user JWT (only for a non-Supabase proxy).

Apply the SQL migration in `supabase/migrations/` to create the per-user progress tables and row-level-security policies. Enable email/password signups in Supabase Auth, then manage users from the Supabase dashboard.

When Supabase env vars are enabled, the app shows the login screen before loading the question bank. Netlify redirects direct requests for `data/questions.json`, `data/explanations.json`, and `docs/answer_key_doubts.json` through `/api/protected-asset`, which validates the Supabase access token before returning JSON. Do not commit raw service keys or secrets.

## Verification

Run the repository gate before shipping changes:

```bash
npm run verify
```

This validates JavaScript syntax, Netlify Supabase/tutor functions, protected-asset routing, question integrity, explanation coverage, key-doubt mappings, official sitting counts, local-durability hooks, PWA metadata/cache alignment, and the WCAG-oriented static accessibility audit (computed color-contrast pairs plus keyboard/focus/live-region checks).

## Provenance & use

Questions are transcribed from official IMA Scientific Council exam PDFs for **personal exam preparation**. Answer keys and source citations follow the official published keys.

## Data schema (`data/questions.json`)

```json
{
  "id": "psych-2023-q041",
  "q": "<stem>",
  "o": ["<א>", "<ב>", "<ג>", "<ד>"],
  "c": 1,                 // 0-based correct index (primary)
  "c_accept": [1, 3],     // all accepted indices (post-appeal)
  "all_accepted": false,  // true = nullified, any answer accepted
  "t": "2023-Jun",        // sitting tag
  "ti": 11,               // topic index (see data/topics.json)
  "tis": [11],
  "ref": "Synopsis 11ed p. 619",
  "src": "IMA Shlav Aleph Psychiatry"
}
```
