# Source-Backed Spacing Cleanup - 2021 Sitting - 2026-06-15

Scope: canonical Hebrew/Latin spacing cleanup for official 2021 question and option text only. This batch resolves 47 `spacing-hebrew-english` findings attached to 2021 question/option fields.

## Source Boundary

Source PDF: `E:\Downloads\Sniffer\642885_5f860274-4fe6-4ce6-8e97-6113c98c556a.zip` -> `642869_93d23280-6783-4283-8c6f-4223c0c5f6fe.pdf`.

Extraction method: `pypdf` text extraction from the source PDF. Some source quotes preserve adjacent Hebrew/Latin tokens because of PDF text-layer spacing, but the quoted source confirms the exact stem/option text and Latin term boundaries. This cleanup only inserts separator spaces at Hebrew/Latin boundaries; it does not change answer keys, accepted answers, references, topics, explanations, or medical wording.

`psych-2021-q071` has an explanation-only spacing finding and is deliberately left out of this PDF-backed batch because it is not official question/option source text.

## Edited Source Quotes

| id | field(s) | source page | source quote |
|---|---|---:|---|
| `psych-2021-q001` | question | 2 | `מטופל בשילוב של Doxepine, Lamotrigine, Trazodone, Escitalopram . בסופו של דבר מצבו התייצב לחלוטין, אך החל להתלונן על אצירת שתן וירידה קוגניטיבית איזה תכשיר אחראי לכך בסבירות גבוהה יותר?` |
| `psych-2021-q004` | question | 2 | `4. מהי ההשפעה שלOmega 3? א. האטה של זרימת דם מוחי ב. העלאת אגרגציה של טסיות בדם ג. הורדת לחץ דם ד. העלאת רמת שומנים בדם` |
| `psych-2021-q007` | question | 3 | `7. הפרעת אישיות פרנואידית מתאפיינת על-פי DSM5 על-ידי כל הבאים, פרט ל: א. חוסר עניין ביחסי מין בשל חשד לבגידה ב. חיפוש אחר משמעות סמויה ג. חשד שמרמים או מנצלים אותו ד. אי אמון באנשים מתוך חשד שינצלו מידע לרעה` |
| `psych-2021-q009` | question | 4 | `Anderson KN, Lind JN, Simeone RM, et al. שפורסם ב- JAMA Psychiatry. August 5, 2020, "Maternal use of specific antidepressant medications during early pregnancy and the risk of selected birth defects". מהו התכשיר שנטעןכהכי טרטוגני ביניהם?` |
| `psych-2021-q019` | question | 6 | `פעילות מוגברת ב- FMRI במטופלים הסובלים מ- OCD. באיזהמסלול נמצאה פעילות זו? א. Cortico-Striato-Thalamo-Cortical Loop ב. Fronto-Mesolimbial-Cortical Loop ג. Tubero-Infundibular-Cortical Loop ד. Parieto-Amygdala-Cortical Loop` |
| `psych-2021-q024` | question | 7 | `24. לאיזו קבוצה שייךAnandamide? א. Cannabinoids ב. Opioids ג. Stimulants ד. Hallucinogens` |
| `psych-2021-q025` | question | 8 | `25. איזה משלבי ההתפתחות על-פי פרויד תואם שלב של קביעות האובייקט (Object Constancy) לפיObject Relations? א. אורלי ב. אנלי ג. פאלי ד. לטנטי` |
| `psych-2021-q032` | question | 9 | `32. מה הסימן שמבדיל ביןLethal Catatonia לשאר הסוגים? א. Fever ב. Catalepsy ג. Cataplexy ד. Perplexity` |
| `psych-2021-q037` | option 2 | 11 | `37. איזו מתופעות הלוואי הבאותלא אופיינית לליתיום? א. פולידיפסיה משנית ב. שינויים בגל T באק"ג ג. התפרצות של נגעי עור פוליקולריים ד. רעד איטי במנוחה` |
| `psych-2021-q038` | question | 11 | `מה תהיה האבחנה הסבירה ביותר? א. Adjustment Disorder ב. Borderline Personality Disorder ג. Factitious Disorder ד. Anxiety Disorder, Unspecified` |
| `psych-2021-q041` | question, option 3 | 12 | `41. למה דומה באופן עקרוני שיטת האבחון של דיכאון מז'ורי על-פי DSM? א. היסטריה על-פי פרויד ב. סכרת על-פי בדיקת רמת סוכר חוזרת ג. התקף לב על-פי ECG ד. פיברומיאלגיה על-פי אוסף סימנים ותסמינים` |
| `psych-2021-q047` | question, option 1 | 13 | `47. בבדיקת דם לרמתLithium התקבלה תוצאה0.4, למרות שבבדיקות הקודמות התקבלו תוצאות0.7-0.8 , ולא נעשה שינוי במינון של ה- Lithium. מה יכולה להיות הסיבה לכך? א. הוספת Hypothiazide ב. הריון ג. מעבר ללקיחת התרופה במנה אחת בערב ד. לקיחת התרופה כשמונה שעות לפני הבדיקה` |
| `psych-2021-q048` | question | 13 | `48. כל הבאים הם מאפיינים קליניים שלRett Syndrome , פרט ל: א. תנועות סטריאוטיפיות בידיים ב. ספסטיות ג. אטקסיה ד. דיבור רב עם נטייה להפשטת יתר` |
| `psych-2021-q051` | question | 14 | `51. על מה נסמך הסיווג שלBulimia Nervosa מקל עד כבד(Mild to Extreme)? א. מספר האפיזודות של ההתנהגויות המפצות בשבוע ב. סוג ההתנהגות המפצה ג. השפעת ההתנהגות המפצה על המשקל ד. השלב בו החלה ההתנהגות המפצה` |
| `psych-2021-q052` | question | 14 | `52. איזו מההפרעות הבאות מופיעה בשכיחותהנמוכה ביותר עם Hording Disorder? א. Schizophrenia ב. Compulsive Buying ג. ADHD ד. Manic Episode` |
| `psych-2021-q054` | question | 15 | `54. איזה נוגד פסיכוזה מהבאים יגרום בסבירותהגבוהה ביותר להארכת QTC? א. Sertindole ב. Olanzapine ג. Risperidone ד. Quetiapine` |
| `psych-2021-q057` | option 4 | 16 | `57. בן12, מובא למיון על-ידי הוריו עקב טיקים מוטוריים רבים (תנועות צוואר, מצמוצים בעיניים) וכחכוח בגרון, אשר נמשכים קרוב לשנה עם תקופות של הטבה והחמרה. איזה מהבאים הכי פחות יתמוך באבחנה של תסמונת טורט (Tourette's Disorder)? א. התחלת הטיקים בגיל 7 ב. שילוב של טיקים מוטורים וקוליים ג. סימנים פסיכוטיים בבדיקה ד. הפרעת ADHD נלווית` |
| `psych-2021-q062` | question | 17 | `איזה מהתכשירים הבאים יכול לשמש למטרה זו? א. Lithium ב. Haloperidol ג. Propranolol ד. Lorazepam` |
| `psych-2021-q063` | question | 17 | `63. באיזו הפרעהלא נצפה קיצור REM Latency? א. Major Depressive Disorder ב. Schizophrenia ג. Dysthymic Disorder ד. Obsessive-Compulsive Personality Disorder` |
| `psych-2021-q064` | options 2-4 | 17 | `64. מה הפתרון המעשי ביותר כטיפול בריור יתר לילי הנובע משימוש ב- Clozapine , כאשרלא ניתן להחליף את התרופה? א. שימת מגבת על הכרית ב. מתן Biperiden ג. מתן Clonidine ד. מתן Amitriptyline` |
| `psych-2021-q068` | question | 18 | `68. במה מתבטא ההבדלהמשמעותי ביותר בין Factitious Disorder לביןMalingering? א. התנהגות ב. חשיבה ג. רגש ד. רווח` |
| `psych-2021-q080` | question | 21 | `80. במה מלווהPseudocyesis? א. Amenorrhea ב. Dyspareunia ג. Pica ד. Vaginismus` |
| `psych-2021-q082` | question | 22 | `82. מהו מנגנון הפעולה האנטי-דיכאוני של Mirtazapine? א. agonism 2HT-c 5Postsynapti ב. agonism 3HT-Postsynaptic 5 ג. antagomism 2αPresynaptic ד. HT1 agonism` |
| `psych-2021-q090` | option 3 | 24 | `90. מטופל מתבקש בפגישת היכרות עם המטפל לתאר את עצמו. המטופל נותן פרטים המתייחסים לגילו והשכלתו אך מתקשה בכל תיאור מעמיק יותר המתייחס לעצמו. באיזו בעיה מדובר על-פי קרנברג? א. הפרעה ב- Body Image ב. Identity Diffusion ג. שימוש במנגנון של Split ד. חוסר ב- Superego Integration` |
| `psych-2021-q092` | question | 24 | `92. איזה מהקולטנים הבאים נחסם על-ידי Caffeine? א. GABA ב. Adenosine ג. NMDA ד. Acetylcholine` |
| `psych-2021-q093` | question | 25 | `93. בן15, עםADHD, הגיב בתופעות לוואי לתכשירים שונים. כשהרופא המטפל מציע שימוש ב- Modafinil בהתבסס על מחקרים, מנהל המחלקה לא מסכים בנימוק, שבזמנו ה- FDA פסל אותו לשימוש ב- ADHD. מה הייתה הסיבה לפסילתו? א. נדודי שינה ב. Steven-Jonson Syndrome ג. כאבי ראש ד. Agranulocytosis` |
| `psych-2021-q096` | question | 25 | `96. כל הבאים מהווים קריטריונים ל- Binge Eating Disorder על-פי DSM5 , פרט ל: א. אכילת כמות האוכל שבהחלט עולה על כמות האוכל של רוב האנשים בפרק זמן דומה ב. אכילת כמויות מזון ללא תחושת רעב ג. תחושת הנאה ושובע אחרי הבולמוס ד. אכילה הרבה יותר מהירה מהנורמה` |
| `psych-2021-q097` | question | 26 | `97. מהי ההפרעה הנפשית הנלוויתהנפוצה ביותר להפרעת OCD? א. הפרעת חרדה חברתית ב. טורט ג. סכיזופרניה ד. דיכאון מז'ורי` |
| `psych-2021-q103` | question | 27 | `103. מהי משמעות המונח "התייעצות טלפונית" בגישתDBT? א. החלפת מפגשים לטלפונים בתקופת הקורונה ב. אפשרות לשיחה קצרה מהמטופל למטפל סביב השעון ג. סוג של קבוצת בלינט ד. שיחה חד-שבועית מהמטפל למטופל כתוספת לטיפול פרטני` |
| `psych-2021-q105` | option 2 | 28 | `105. בן45, סובל מסכיזופרניה ממושכת ומטופל באולנזפין, מעשן2 חפיסות סיגריות ביום הפסיכיאטר המטפל מנסה לשכנע אותו להפסיק לעשן. מה הטיעון הנכון להשתמש בו לצורך הפסקת העישון במקרה זה? א. מוריד משמעותית רמת אולנזפין בדם ב. מחמיר EPS ג. פוגע בתפקודים קוגניטיביים ד. מגביר סיכון ל- Rheumatoid Arthritis` |
| `psych-2021-q107` | question | 28 | `107. אצל מטופל עם שימוש לרעה בחומרים, מתקבלת תוצאתEEG שמדגימה ירידה בפעילות באיזה חומר מדובר? א. מריחואנה ב. קוקאין ג. מורפין ד. ניקוטין` |
| `psych-2021-q108` | options 3-4 | 28 | `108. בת32, אושפזה בשל אירועים של התנהגות מוזרה, אי שקט פסיכומוטורי, התפרצויות אלימות ושִכחה לאחר מכן איזה מהבדיקות הבאות תאפשר בצורה הטובה ביותר להבדיל בין גורם נוירולוגי לגורם נפשי של מצבה? א. MRI של המוח ב. מבחן בנדר ג. מבחן SIMS ד. וידאו EEG` |
| `psych-2021-q110` | question | 29 | `110. באיזה סוג של הפרעות חרדהPropranolol יעיל יותר? א. חרדת ביצוע ב. אגורפוביה ג. פאניקה ד. חרדת נטישה` |
| `psych-2021-q111` | question, options 1-3 | 29 | `111. מהנכון לגבי אינטראקציות תרופתיות של Valproate? א. מתן יחד עם Carbamazepine, מעלה את ריכוז ה- Valproate בסרום ב. מתן יחד עם Clozapine, מפחית סדציה ג. מתן יחד עם Fluoxetine, עשוי להעלות ריכוזValproate בסרום ד. מתן יחד עם תכשירים נוגדי פסיכוזה, מפחית תופעות אקסטרפירמידליות` |
| `psych-2021-q124` | question | 32 | `124. איזו תכונה מאפיינת אתADHD? א. נמנעים משעורי בית ב. קשובים לבן שיח ג. עובדים לפי הדרכה ד. שומרים על כלי עבודה` |
| `psych-2021-q134` | question | 35 | `134. לאיזו הפרעה מהבאות תגרוםNightmare Disorder בסבירותגבוהה יותר? א. אינונות ב. הרטבת לילה ג. אכילת יתר ד. פחד משינה` |
| `psych-2021-q136` | question | 35 | `136. איזה מהקריטריונים הבאים מאפיין מטופלים הסובלים מדיכאון מז'וריואינו מאפיין PTSD? א. הפרעות בריכוז ב. מחשבות אשמה ג. אובדן עניין בפעילויות ד. מחשבות אובדניות` |
| `psych-2021-q142` | question | 37 | `142. דייר בהוסטל מגיע לחדר מיון מבולבל בבדיקות נמצא כי WBC - 7000, HB - 13.6, CPK - 170, Na - 122, K - 4.5 . מה מהבאים יכול להסביר את מצבו? א. Diabetes Mellitus ב. Psychogenic Polydipsia ג. Valproic Acid ד. Psychogenic Vomiting` |
| `psych-2021-q150` | option 4 | 39 | `150. בת66, מאושפזת במחלקה סגורה ולא מגיבה לטיפול שניתן לה. מחשש לאי שיתוף פעולה לא חודש ליתיום, אליו הגיבה טוב בעבר וכשחודש במינון של 300 מ"ג בלבד, נתגלתה רמה של1.5 מא"ק לליטר מה הגורם הסביר ביותר לרמה כה גבוהה במינון כה נמוך? א. דיאטה עשירה במלח ב. התייבשות ג. הפסקת Voltaren (diclofenac) ד. מתן Mannitol` |

## Validation

After this batch:

- `spacing-hebrew-english` count dropped from 304 to 257.
- 2021 question/option spacing findings dropped from 47 to 0.
- One 2021 explanation-only spacing finding remains outside this source-PDF batch.
- `scripts/data-quality-regression.mjs` now fails if 2021 question/option spacing findings return.
