# שלב א' פסיכיאטריה — בנק שאלות / Psychiatry Shlav Aleph Board Prep

A single-file, installable PWA for drilling the Israeli **Shlav Aleph (שלב א') Psychiatry** board exam — built from the **המועצה המדעית / הר"י** sittings, with official answer keys (post-appeal) and source references.

🔗 **Live:** https://eiasash.github.io/Psychiatry/

## What's inside

- **700 real exam questions** from 5 sittings (byte-accurate from the official PDFs):

  | Sitting | Questions |
  |---|---|
  | 2020 | 150 |
  | 2021 · June | 150 |
  | 2022 · June | 150 |
  | 2023 · June | 150 |
  | 2024 · September | 100 |

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

Zero-build single-file app (`index.html`) + `data/questions.json`. Service worker (`sw.js`) caches for offline. Hosted on GitHub Pages.

## Pending (phase 2)

- **2024 · May** (100 Q) and **2025 · June** (100 Q) sittings — their source PDFs need image-based recovery (corrupt/edge-case text layers) before they meet the same byte-accuracy bar. They'll be added to `data/questions.json` once verified.

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
