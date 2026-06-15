# Data Quality Triage - 2026-06-15

Scope: tracked JSON fixtures only. This report quotes the current fixture text so issues can be reproduced, but it is not a source-PDF verification pass and does not authorize canonical question/answer edits by itself.

## Counts

After the 2020 source-backed spacing cleanup, `node scripts/data-quality-audit.mjs --json` reports 304 non-blocking anomalies:

| type | count | action |
|---|---:|---|
| `spacing-hebrew-english` | 304 | Covered in-app by display-only spacing normalization. Data edits still require source verification. The 2020 sitting is resolved in `docs/SOURCE_BACKED_SPACING_2020_2026-06-15.md`. |
| `pdf-tail-artifact` | 0 | Resolved in `docs/PDF_TAIL_CLEANUP_2026-06-15.md`; repeated exam instruction tails were removed from option fixtures and obsolete explanation notes. |
| `weak-ref` | 0 | Resolved in `docs/OCR_REF_REPAIR_2026-06-15.md`; official-key blanks are explicit and numeric answer-key tails were removed. |
| `ocr-needs-source-review` | 0 | Resolved in `docs/OCR_REF_REPAIR_2026-06-15.md` for the source-backed OCR repairs. |

## Fixture Quotes

Spacing examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2021-q001` | question | `בן45, נשוי ואב ל- 4, הופנה על- ,ידי רופא משפחה לטיפול פסיכיאטרי בשל אינסומניה קשה .על רקע התפרצויות זעם והתלהמות, בעיקר בעבודה עקב עמידותו, מטופל בשילוב שלDoxepine, Lamotrigine, Trazodone, Escitalopram` |
| `psych-2021-q004` | question | `מהי ההשפעה שלOmega 3 ?` |
| `psych-2021-q007` | question | `הפרעת אישיות פרנואידית מתאפיינת על- פיDSM5 על- ,ידי כל הבאים פרט ל:` |
| `psych-2021-q024` | question | `לאיזו קבוצה שייךAnandamide ?` |
| `psych-2021-q037` | option 2 | `שינויים בגלT באק"ג` |

Resolved source-backed spacing batch:

| source note | sitting | edited audit findings | result |
|---|---|---:|---|
| `docs/SOURCE_BACKED_SPACING_2020_2026-06-15.md` | `2020` | 37 | 2020 `spacing-hebrew-english` findings reduced to 0. |

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

Display-time spacing normalization remains active for all unverified items. The first canonical data batch now resolves the 2020 sitting only, with source quotes in `docs/SOURCE_BACKED_SPACING_2020_2026-06-15.md`.

The next canonical data cleanup should continue as a separate source-backed PR:

1. Quote the source PDF or authoritative fixture for each edited item.
2. Work through the remaining 304 Hebrew/English spacing anomalies only where source verification is available, because the app already normalizes spacing at display time.
3. Keep official answer keys unchanged unless the source explicitly supports a key correction.
