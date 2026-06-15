# Data Quality Triage - 2026-06-15

Scope: tracked JSON fixtures only. This report quotes the current fixture text so issues can be reproduced, but it is not a source-PDF verification pass and does not authorize canonical question/answer edits by itself.

## Counts

`node scripts/data-quality-audit.mjs --json` currently reports 455 non-blocking anomalies:

| type | count | action |
|---|---:|---|
| `spacing-hebrew-english` | 342 | Covered in-app by display-only spacing normalization. Data edits still require source verification. |
| `pdf-tail-artifact` | 107 | Candidate for source-backed cleanup; most are copied option tails like "יש לבחור בתשובה אחת בלבד..." plus page markers. |
| `weak-ref` | 3 | Needs source/reference repair before relying on source metadata. |
| `ocr-needs-source-review` | 3 | Keep OCR warning visible; verify against the original 2025 source before changing stems, answers, or references. |

## Fixture Quotes

Spacing examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2020-q004` | question | `כל האבחנות הבאות נכללות בקבוצה שלObsessive Compulsive and Related Disorders ,על- פיDSM-5 , פרט ל:` |
| `psych-2020-q007` | question | `מה מאפיין את הזיכרונות במסגרתFalse Memory Syndrome ?` |
| `psych-2020-q010` | question | `בת31 ,לוקה בהפרעה דו-קוטבית ,מפתחת מצב מאני חריף ומתאשפזת במחלקה סגורה . בבדיקות שגרתיות נמצאBHCG חיובי. איזה תכשיר מתאים יותר למטופלת זו?` |
| `psych-2020-q038` | option 1 | `הקטנתCaudate Nuclei` |
| `psych-2020-q091` | option 2 | `זריקה תוך שרירית של0111 מ" ג ויטמיןB12 אחת ליום למשך שבוע ובהמשך טיפול אחזקתי חודשי` |

PDF tail examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2020-q004` | option 4 | `Obsessive Compulsive Personality Disorder יש לבחור בתשובה אחת בלבד עבור כל שאלה עמוד2` |
| `psych-2020-q008` | option 4 | `תחושת דיסוציאציה יש לבחור בתשובה אחת בלבד עבור כל שאלה עמוד3` |
| `psych-2020-q016` | option 4 | `חומצה איקוזופנטנוית(EPA) יש לבחור בתשובה אחת בלבד עבור כל שאלה עמוד5` |
| `psych-2020-q064` | option 4 | `כזרז לתגובה אנטי-דיכאונית בטיפול ב- SSRI's יש לבחור בתשובה אחת בלבד עבור כל שאלה עמוד07` |

Weak/OCR source examples:

| id | field | current fixture quote |
|---|---|---|
| `psych-2025-06-q016` | ref | empty string |
| `psych-2025-06-q056` | question | `בן 40 מתלונן על תנועות לא רצוניות בידיו ובפנים, שהתפתחות לאחרונה. מהתחיסמפטומים הקוגניטיביים הבאים מתאים לאבחנה?` |
| `psych-2025-06-q100` | ref | starts with `177 101 377 102 470 472 103...` |

## Decision

This PR fixes the user-visible readability issue without changing source data: rendered question stems, options, explanations, references, browse rows, and AI tutor Markdown now get spacing at display time between adjacent Hebrew and Latin/digit tokens.

The next canonical data cleanup should be a separate source-backed PR:

1. Quote the source PDF or authoritative fixture for each edited item.
2. Remove PDF tail artifacts only when the option text boundary is source-confirmed.
3. Repair the three weak references from source material.
4. Keep official answer keys unchanged unless the source explicitly supports a key correction.
