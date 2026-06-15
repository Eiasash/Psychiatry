# Source-Backed Spacing Cleanup - 2020 Sitting - 2026-06-15

Scope: canonical Hebrew/Latin spacing cleanup for the 2020 sitting only. This batch resolves the 37 `spacing-hebrew-english` audit findings attached to 2020 questions and options.

## Source Boundary

Source PDF: `E:\Downloads\Sniffer\642885_5f860274-4fe6-4ce6-8e97-6113c98c556a.zip` -> `642867_be33bc17-0858-4430-bda9-3deda06261f0.pdf`.

Extraction method: `pypdf` text extraction from the source PDF. Some extracted source quotes preserve adjacent Hebrew/Latin tokens because of PDF text-layer spacing, but the quoted source confirms the exact stem/option text and Latin term boundaries. This cleanup only inserts separator spaces at Hebrew/Latin boundaries; it does not change answer keys, accepted answers, references, topics, or medical wording.

## Edited Source Quotes

| id | field(s) | source page | source quote |
|---|---|---:|---|
| `psych-2020-q004` | question | 2 | `הבאות נכללות בקבוצה שלObsessive Compulsive and Related Disorders ,על-פי DSM-5 , פרט ל: א. Body Dysmorphic Disorder ב. Hoarding Disorder ג. Trichotillomania ד. Obsessive Compulsive Personality Disorder` |
| `psych-2020-q007` | question | 3 | `7. מה מאפיין את הזיכרונות במסגרתFalse Memory Syndrome? א. משוחזרים במהלך הטיפול ב. מפוברקים בכוונה על-ידי המטופל ג. לטווח קצר ד. שכיחים ב- Ganser Syndrome` |
| `psych-2020-q010` | question | 4 | `בבדיקות שגרתיות נמצא BHCG חיובי. איזה תכשיר מתאים יותר למטופלת זו? א. Lithium ב. Lamotrigine ג. Carbamazepine ד. Quetiapine` |
| `psych-2020-q020` | question | 6 | `מה מבין הבאים יסייעיותר באבחנה מבדלת בין Seizures לביןPseudoseizures? א. נשיכת לשון ב. בדיקת רמת פרולקטין בדם ג. אובדן שליטה על סוגרים ד. חבלה בזמן הנפילה` |
| `psych-2020-q024` | question | 7 | `על איזה ניסוי התבססה תורתLearned Helplessness שהוצעה על-ידי Martin Seligman? א. מתן שוק חשמלי לכלבים ב. שחיה מאומצת בחולדות ג. הפרדה בין גור לאימו בשימפנזה ד. השארת תינוקות לבדם` |
| `psych-2020-q027` | question | 8 | `27. בת75 ,עםMinimal Cognitive Impairment מגלה סימני דיכאון מלווים באינסומניה. איזה מהתכשירים יכול להחמיר בסבירות גבוהה יותר את הפרעותיה הקוגניטיביות? א. Amitriptyline ב. Mirtazapine ג. Escitalopram ד. Bupropion` |
| `psych-2020-q033` | question | 10 | `עם אבחנה של Dissociative Disorder. לא טופלה במהלך הלילה...`; `לאחר הזרקת Diazepam 5 mg IV ,החלה לדבר וסיפרה שמרגישה כאילו נמצאת בגיהינום לאחר אפוקליפסה` |
| `psych-2020-q038` | question, options 1-4 | 11 | `מה הממצא שנתגלה ב- MRI בחולים עםOCD? א. הקטנת Caudate Nuclei ב. הגדלת Cerebellum ג. הקטנת Reticular Formation ד. הגדלת Hypophysis` |
| `psych-2020-q052` | question | 14 | `למטופל הלוקה בהפרעה סכיזואפקטיבית, מתן Clozapine בשילוב עם איזה תכשיר יחשבבטוח יותר? א. Clomipramine ב. Lithium Carbonate ג. Carbamazepine ד. Valproic Acid` |
| `psych-2020-q054` | question | 15 | `איזו תכונה מאפיינת את הפרעת האישיותPassive-Aggressive? א. אסרטיביות ב. דייקנות ג. אופטימיות ד. מניפולטיביות` |
| `psych-2020-q062` | question | 17 | `על מה מתבסס ההבדל העיקרי ביןNormal Anxiety לביןGeneralized Anxiety Disorder? א. הגזמה בחששות וחרדות ב. תחושת "על הקוצים" ג. רגזנות ד. מתח בשרירים` |
| `psych-2020-q066` | question | 18 | `66. מה נחשבComplex Motor Tic? א. מצמוץ בעיניים ב. הרחת חפצים ג. משיכת כתפיים ד. מתיחות צוואר` |
| `psych-2020-q072` | question | 19 | `כתוב Flumazenil. מה המנגנון שעומד מאחורי תחושותיה? א. α2 Antagonism ב. GABA Antagonism ג. mCPP Effect ד. Caffeine-Like Effect` |
| `psych-2020-q076` | question | 20 | `76. על מה מבוססת בדיקתPET של המוח? א. שדה מגנטי ב. מטבוליזם סוכר ג. אנגיוגרפיה ד. מדידת זרם דם` |
| `psych-2020-q091` | options 1-2 | 24 | `מה הטיפול המומלץ ב- Pernicious Anemia מלווה סימפטומים של דיכאון, חולשה ובלבול? א. כדורי קומפלקס ויטמין B למשך כחצי שנה ב. זריקה תוך שרירית של 0111 מ"ג ויטמין B12 אחת ליום למשך שבוע` |
| `psych-2020-q093` | question | 25 | `טופל ב- Perphenan 8mg ובהמשך ב- Zyprexa 10mg ,אל ללא שיפור ועם סימניEPS ניכרים... הומלץ על מתן SSRI's` |
| `psych-2020-q095` | question | 25 | `95. עד כמה זמן יכולים להימשך סימנים שלEPS אצל מטופל בן65 לאחר הפסקת טיפול אנטיפסיכוטי? א. שבועיים ב. חודש ג. חודשיים ד. שלושה חודשים` |
| `psych-2020-q097` | question | 26 | `מה האבחנה המתאימה ביותר לפי DSM-5? א. Illness Anxiety Disorder ב. Somatic Symptom Disorder ג. Functional Neurological Symptom Disorder ד. Conversion Disorder` |
| `psych-2020-q102` | question | 27 | `שלבי ההתפתחות על-פי Erik Erikson הוא שלב של'אמון' מול 'אי אמון'. לאיזה שלב התפתחותי על-פי Sigmund Freud הוא מקביל?` |
| `psych-2020-q109` | option 4 | 29 | `ג. הפניה לאשפוז כפוי בבית-חולים פסיכיאטרי ד. הפניה לביצוע CT ראש` |
| `psych-2020-q111` | question | 29 | `איזה מהסוגים שלNarcissistic Transference נחשב לפרימיטיבי ביותר? א. Idealized ב. Mirror ג. Merger ד. Twinship` |
| `psych-2020-q114` | question | 30 | `בת61 ,הלוקה ב- Parkinson's Disease ,מאושפזת בשלUTI ומפתחת דליריום. רופא בכיר מבקש מהמתמחה להתחיל טיפול בבנזודיאזפין לשינה` |
| `psych-2020-q115` | question | 30 | `מהי התחלואה הנלוויתהפחות סבירה לאבחנת Excoriation (Skin Picking) Disorder? א. OCD ב. Trichotillomania ג. Substance Dependence ד. Schizophrenia` |
| `psych-2020-q121` | question | 32 | `המתמחה מתקשר בהתלהבות לכונן ומדווח שרואה La Belle Indifférence "כמו בספר". הכונן מתלהב פחות מאבחנת המתמחה ומבקש לשלול קודם פגיעה אורגנית` |
| `psych-2020-q123` | option 1 | 32 | `א. Melatonin - היות והפרעות שינה הן סימפטום שכיח בילדים עםASD ב. Fluoxetine - היות וככל הנראה מדובר בהפרעה דיכאונית נלווית` |
| `psych-2020-q127` | question | 33 | `בטיפול באיזו הפרעה תהיינה קבוצות מסוגSelf-Help יעילות יותר? א. אנורקסיה נרבוזה ב. חרדה חברתית ג. ג'נדר דיספוריה ד. הפרעת אישיות אנטיסוציאלית` |
| `psych-2020-q139` | question | 36 | `כל הבאים מאפיינים קליניים שלAmotivational Syndrome ,פרט ל: א. חוסר רצון להתמיד במשימות ב. אפתיות ג. עצלנות ד. ירידה במשקל` |
| `psych-2020-q140` | question | 36 | `מהו הסימן היחודי שלLethal Catatonia בשונה מ- Catatonia רגילה? א. Fever ב. mlteoh ג. Teteuiioa ד. Mannerism` |
| `psych-2020-q142` | option 3 | 37 | `איזו מהבדיקות הבאות תסייע בצורה הטובה ביותר האם מדובר בהפרעה נוירולוגית? א. הערכה פסיכו-דיאגנוסטית ב. MRI ג. וידאו EEG ד. PET` |
| `psych-2020-q144` | question | 37 | `בבדיקות מעבדה ירידה ברמות TSH וקורטיזול. מה האבחנה המתאימה ביותר? א. SLE ב. Post-Partum Depression ג. Hashimoto's Thyroiditis ד. Sheehan's Syndrome` |
| `psych-2020-q145` | question | 38 | `Lancet 2019 Sep 14; 394: 939-951, איזה תכשיר נחשב לגורםיותר להארכת QTc? א. Paliperidone ב. Amisulpride ג. Haloperidol ד. Aripiprazole` |
| `psych-2020-q150` | question | 39 | `במעבדה - לויקוציטיזים ורמת CPK גבוהה. לפני 01 ימים הוחל טיפול בזריקהארוכת טווח, בשל מצב פסיכוטי לראשונה בחייו. איזה טיפול פחות יעיל במצב זה?` |

## Validation

After this batch:

- `spacing-hebrew-english` count dropped from 341 to 304.
- 2020 sitting spacing findings dropped from 37 to 0.
- `scripts/data-quality-regression.mjs` now fails if 2020 spacing findings return.
