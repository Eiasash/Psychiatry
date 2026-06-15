# Data Quality Triage - 2026-06-15

Scope: tracked JSON fixtures only. This report quotes the current fixture text so issues can be reproduced, but it is not a source-PDF verification pass and does not authorize canonical question/answer edits by itself.

## Counts

After the 2021 source-backed question/option spacing cleanup, `node scripts/data-quality-audit.mjs --json` reports 257 non-blocking anomalies:

| type | count | action |
|---|---:|---|
| `spacing-hebrew-english` | 257 | Covered in-app by display-only spacing normalization. Data edits still require source verification. The 2020 sitting is resolved in `docs/SOURCE_BACKED_SPACING_2020_2026-06-15.md`; 2021 question/option text is resolved in `docs/SOURCE_BACKED_SPACING_2021_2026-06-15.md`. |
| `pdf-tail-artifact` | 0 | Resolved in `docs/PDF_TAIL_CLEANUP_2026-06-15.md`; repeated exam instruction tails were removed from option fixtures and obsolete explanation notes. |
| `weak-ref` | 0 | Resolved in `docs/OCR_REF_REPAIR_2026-06-15.md`; official-key blanks are explicit and numeric answer-key tails were removed. |
| `ocr-needs-source-review` | 0 | Resolved in `docs/OCR_REF_REPAIR_2026-06-15.md` for the source-backed OCR repairs. |

## Fixture Quotes

Spacing examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2021-q071` | explanation | `הבוחן את הצורך בהמשך האשפoz.` |
| `psych-2022-q001` | question | `מהו המינון האקוויוולנטי שלRisperidone` |
| `psych-2022-q002` | question | `איזה מבין התכשירים האנטיהיסטמיניים משמש כטיפול בעיכוב אורגזמה הנובע מטיפול בSSRI's ?` |
| `psych-2022-q003` | question | `איזה קריטריון מבדיל ביןADHD ?לאפיזודה מאנית/היפומאנית` |
| `psych-2022-q005` | question | `איזה מהתכשירים הבאים לא פועל כDopamine-agonist ?` |

Resolved source-backed spacing batch:

| source note | sitting | edited audit findings | result |
|---|---|---:|---|
| `docs/SOURCE_BACKED_SPACING_2020_2026-06-15.md` | `2020` | 37 | 2020 `spacing-hebrew-english` findings reduced to 0. |
| `docs/SOURCE_BACKED_SPACING_2021_2026-06-15.md` | `2021-Jun` | 47 | 2021 question/option `spacing-hebrew-english` findings reduced to 0; one explanation-only finding remains. |

Resolved PDF tail examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2020-q004` | option 4 | `Obsessive Compulsive Personality Disorder` |
| `psych-2020-q008` | option 4 | `תחושת דיסוציאציה` |
| `psych-2020-q016` | option 4 | `חומצה איקוזופנטנוית(EPA)` |
| `psych-2020-q064` | option 4 | `כזרז לתגובה אנטי-דיכאונית בטיפול ב- SSRI's` |

Resolved weak/OCR source examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2025-06-q016` | ref | `מפתח רשמי 2025: ללא מראה מקום` |
| `psych-2025-06-q056` | question | `בן 40 מתלונן על תנועות לא רצוניות בידיים ובצוואר, שהתפתחו לאחרונה. מה מהסימפטומים הקוגניטיביים הבאים מתאים לאבחנה?` |
| `psych-2025-06-q100` | ref | `Kaplan & Sadock Synopsis, p. 177` |

## Decision

Display-time spacing normalization remains active for all unverified items. The canonical source-backed data batches now resolve the 2020 sitting and the 2021 official question/option text, with source quotes in `docs/SOURCE_BACKED_SPACING_2020_2026-06-15.md` and `docs/SOURCE_BACKED_SPACING_2021_2026-06-15.md`.

The next canonical data cleanup should continue as a separate source-backed PR:

1. Quote the source PDF or authoritative fixture for each edited item.
2. Work through the remaining 257 Hebrew/English spacing anomalies only where source verification is available, because the app already normalizes spacing at display time.
3. Keep official answer keys unchanged unless the source explicitly supports a key correction.

## Correction (2026-06-15, all-in audit PR)

The `pdf-tail-artifact: 0` row above was a **detector false-negative**, not a clean state:
`hasPdfTailArtifact()` did not match the `בחינת שלב א' פסיכיאטריה<date> <page>` footer, so 24
live tails in the 2024-May 4th options went unreported while the regression gate asserted 0.
The detector is now widened and those 24 tails removed (deterministic footer strip). A separately
surviving **2020 reversed-digit artifact (25 questions)** is newly documented and deferred to the
source-backed campaign. Full detail + id lists: `docs/AUDIT_2026-06-15_allin.md`.
