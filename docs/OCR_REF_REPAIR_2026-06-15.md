# OCR/Reference Repair - 2026-06-15

Scope: source-backed repairs for the three remaining `weak-ref` / `ocr-needs-source-review` findings from the 2025 June OCR import. Source files were extracted from `642885_5f860274-4fe6-4ce6-8e97-6113c98c556a.zip`.

## Sources Quoted

Question PDF: `750177_78f88cf8-4712-4dd3-a304-9f15e14eae39.pdf`

Answer-key PDF: `750259_d7f7be93-095b-48a8-bca4-b487fa3a0dc3.pdf`

| id | source quote | repair |
|---|---|---|
| `psych-2025-06-q016` | Question PDF p. 4: `איזה מבין הבאים אינו מומלץ כטיפול בקטטוניה?` Options include `נזעי חשמל (ECT)`, `זריקות לורזפם`, `אנטי פסיכוטיים דור ראשון`, `אנטי פסיכוטיים דור שני`. Answer-key extraction around Q15-Q17 reads `15 806 16 17 464`, leaving Q16 without a printed reference. | Fixed option B from `זריקות לורזם` to `זריקות לורזפם`; encoded the official-key blank as `מפתח רשמי 2025: ללא מראה מקום`. |
| `psych-2025-06-q056` | Question PDF p. 13: `בן 40 מתלונן על תנועות לא רצוניות בידיים ובצוואר, שהתפתחו לאחרונה.` Stem asks `מה מהסימפטומים הקוגניטיביים הבאים מתאים לאבחנה?` Options: `מתקשה לבטא מילים`; `מתקשה לחשב עודף בקניות`; `מתקשה להתרכז בביצוע משימות מורכבות`; `מתקשה להבין טקסט כתוב`. Answer-key extraction around Q55-Q57 reads `55 435 56 57 476`, leaving Q56 without a printed reference. | Replaced the corrupted stem/options with the visible PDF text; encoded the official-key blank as `מפתח רשמי 2025: ללא מראה מקום`; aligned the explanation with the repaired option text. |
| `psych-2025-06-q100` | Question PDF p. 23: `נערה בת 16 החלה לחוש במשך החודשיים האחרונים עצבות וייאוש כמעט כל יום...` Options include `התחלת טיפול בנוגד דיכאון (SSRI) בשילוב פסיכותרפיה מתאימה, השגחת ההורים ומעקב צמוד`, `אשפוז במחלקת נוער להשגחה...`, `טיפול פסיכולוגי מבוסס IPT...`, and `התחלת טיפול תרופתי... והמתנה לשיפור...`. Answer-key extraction around Q99-Q101 reads `99 1069 100 177 101 377`. | Repaired the copied/OCR-corrupted stem and option text; replaced the numeric answer-key tail with `Kaplan & Sadock Synopsis, p. 177`; aligned the explanation wording. |

## Validation Target

`node scripts/data-quality-audit.mjs --json` should now report only `spacing-hebrew-english` anomalies. The weak-reference detector remains in place for future imports, but canonical fixtures should no longer contain empty, too-short, or numeric-blob references.
