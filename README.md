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
- Filters by **sitting** and **topic**; "new", "random", and "mistakes" modes.
- Browse + full-text search across stems, options, and references.
- Per-topic accuracy stats.
- Hebrew RTL, dark theme, **offline-capable**, installable to home screen.
- All progress stored locally in your browser (`localStorage`) — nothing leaves the device.

## Tech

Zero-build single-file app (`index.html`) + JSON data files. Service worker (`sw.js`) caches for offline. Hosted on GitHub Pages.

## Verification

Run the repository gate before shipping changes:

```bash
npm run verify
```

This validates question integrity, explanation coverage, official sitting counts, and the WCAG-oriented static accessibility audit (computed color-contrast pairs plus keyboard/focus/live-region checks).

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
