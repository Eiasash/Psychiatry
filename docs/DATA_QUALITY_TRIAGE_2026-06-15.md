# Data Quality Triage - 2026-06-15

Scope: tracked JSON fixtures only. This report quotes the current fixture text so issues can be reproduced, but it is not a source-PDF verification pass and does not authorize canonical question/answer edits by itself.

## Counts

After the source-backed OCR/reference cleanup, `node scripts/data-quality-audit.mjs --json` reports 341 non-blocking anomalies:

| type | count | action |
|---|---:|---|
| `spacing-hebrew-english` | 341 | Covered in-app by display-only spacing normalization. Data edits still require source verification. |
| `pdf-tail-artifact` | 0 | Resolved in `docs/PDF_TAIL_CLEANUP_2026-06-15.md`; repeated exam instruction tails were removed from option fixtures and obsolete explanation notes. |
| `weak-ref` | 0 | Resolved in `docs/OCR_REF_REPAIR_2026-06-15.md`; official-key blanks are explicit and numeric answer-key tails were removed. |
| `ocr-needs-source-review` | 0 | Resolved in `docs/OCR_REF_REPAIR_2026-06-15.md` for the source-backed OCR repairs. |

## Fixture Quotes

Spacing examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2020-q004` | question | `כל האבחנות הבאות נכללות בקבוצה שלObsessive Compulsive and Related Disorders ,על- פיDSM-5 , פרט ל:` |
| `psych-2020-q007` | question | `מה מאפיין את הזיכרונות במסגרתFalse Memory Syndrome ?` |
| `psych-2020-q010` | question | `בת31 ,לוקה בהפרעה דו-קוטבית ,מפתחת מצב מאני חריף ומתאשפזת במחלקה סגורה . בבדיקות שגרתיות נמצאBHCG חיובי. איזה תכשיר מתאים יותר למטופלת זו?` |
| `psych-2020-q038` | option 1 | `הקטנתCaudate Nuclei` |
| `psych-2020-q091` | option 2 | `זריקה תוך שרירית של0111 מ" ג ויטמיןB12 אחת ליום למשך שבוע ובהמשך טיפול אחזקתי חודשי` |

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

This PR fixes the user-visible readability issue without changing source data: rendered question stems, options, explanations, references, browse rows, and AI tutor Markdown now get spacing at display time between adjacent Hebrew and Latin/digit tokens.

The next canonical data cleanup should be a separate source-backed PR:

1. Quote the source PDF or authoritative fixture for each edited item.
2. Work through the remaining Hebrew/English spacing anomalies only where source verification is available, because the app already normalizes spacing at display time.
3. Keep official answer keys unchanged unless the source explicitly supports a key correction.
