# Merged-stem defect resolution — 2026-06-16

Resolves the 6 `_defects.json` "possible merged stem (2× ?)" flags and the
`psych-2024-09-q056` "duplicate distractor" flag, checked against the official source PDFs
(rendered to image, fitz). The heuristic flag (a stem containing two `?`) was mostly a
**false positive** — a *quoted* question inside the clinical vignette plus the real question.

## Fixed (source-backed re-transcription)
Two 2022 stems were genuinely garbled by RTL text extraction (scrambled punctuation, word
boundaries, misplaced `?`) beyond what the display-normalizer repairs:

- **`psych-2022-q008`** — surgical: `פסיכ יאטרי`→`פסיכיאטרי`; `…לאנש .ים קרובים בסביבתה ?באיזו
  תסמונת לוקה המטופלת` → `…לאנשים קרובים בסביבתה. באיזו תסמונת לוקה המטופלת?` (source p3).
  Meaning (Fregoli) and options unchanged.
- **`psych-2022-q148`** — full-stem re-transcription (pervasive quote/punctuation scramble).
  True stem read from source p32; options (defense mechanisms) and key `c=2` (התקה) unchanged.

## Benign — no change (faithful transcription, the 2nd `?` is a quoted question)
- `psych-2020-q021` — vignette quotes `"כמה ילדים יש לך?"` + real question. Coherent.
- `psych-2020-q069` — vignette quotes `"האם אתה כבר לא אוהב אותי?"` + real question. Coherent.
- `psych-2020-q105` — vignette quotes `"מה שלומך בארץ?"` + real question. Coherent.
- `psych-2021-q009` — journal-editorial question; quoted article titles contain `?`. Coherent
  (only Hebrew/Latin spacing remains, handled by the display-normalizer).

## Source-faithful quirk — no change
- **`psych-2024-09-q056`** — options ב and ד are **both** `Idealizing Transference`. Verified
  against the official 2024-09 source (p14, high-DPI): **the duplicate is in the exam itself**
  (a real printing error in the original). The bank faithfully reflects the source, so it is
  **not** "fixed" by inventing a 4th option (that would be fabrication). Official key `c=2`
  (Mirror Transference). Documented here so the flag isn't re-raised.
