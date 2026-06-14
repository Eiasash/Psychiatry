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
- Optional username/password login gate on Netlify, backed by a hashed password and signed session token.
- Optional AI Tutor via Netlify Function (`/api/ai-tutor`) when deployed with `OPENAI_API_KEY`.
- Hebrew RTL, dark theme, **offline-capable**, installable to home screen.
- All progress stored locally in your browser — nothing leaves the device unless you explicitly use the optional AI Tutor.

## Tech

Zero-build single-file app (`index.html`) + JSON data files. Service worker (`sw.js`) caches for offline. Hosted on GitHub Pages; Netlify Functions add optional login and AI features when deployed there.

The optional AI Tutor is implemented as a Netlify Function in `netlify/functions/ai-tutor.mjs`. Configure `OPENAI_API_KEY` in Netlify environment variables; optionally set `OPENAI_MODEL` to override the default model. The GitHub Pages version keeps working without this endpoint and shows a graceful unavailable message.

## Netlify login

Password login is enabled only when these Netlify environment variables are set:

- `APP_AUTH_USERNAME` — the login username.
- `APP_AUTH_PASSWORD_HASH` — generated with `npm run auth:hash -- "your password"`.
- `APP_AUTH_SESSION_SECRET` — a random signing secret, at least 32 bytes.
- `APP_AUTH_SESSION_HOURS` — optional session lifetime, default `168`.

When enabled, the app shows the login screen before loading the question bank, and `/api/ai-tutor` requires the signed session token. Do not commit raw passwords or secrets.

## Verification

Run the repository gate before shipping changes:

```bash
npm run verify
```

This validates JavaScript syntax, Netlify auth/tutor functions, question integrity, explanation coverage, key-doubt mappings, official sitting counts, local-durability hooks, PWA metadata/cache alignment, and the WCAG-oriented static accessibility audit (computed color-contrast pairs plus keyboard/focus/live-region checks).

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
