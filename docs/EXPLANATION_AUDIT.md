# Explanation layer — generation & verification audit

Synopsis-grounded Hebrew explanations were generated for all **900** questions and put through an independent adversarial verification pass.

## Pipeline
1. **Retrieval** — BM25 index over the full Kaplan & Sadock *Synopsis* (2021) text (the cited book-page numbers don't map — the source is a reflowed ebook). Top passages per question. 565/900 explanations are passage-grounded; 335 rely on standard Synopsis knowledge where retrieval was thin.
2. **Generation** — Opus agents wrote each explanation (why the keyed answer is correct, why distractors are wrong), self-flagging grounding + answer-consistency.
3. **Verification** — an independent adversarial pass over all 900 (refute-or-confirm): **4 explanations corrected**, 896 confirmed. Corrected: `psych-2020-q006`, `psych-2021-q060`, `psych-2023-q037`, `psych-2024-09-q094`.

## Answer-key doubts (for review — keys NOT changed)

The verifier flagged **10 questions where the official IMA post-appeal key looks clinically questionable**. The official key is authoritative for what the exam scored, so it is **retained unchanged**; the explanation supports the keyed answer and flags the nuance. Raw detail: [`answer_key_doubts.json`](answer_key_doubts.json).

| Question | Keyed | Doubt (short) | Mitigation |
|---|---|---|---|
| 2020 Q88 | ב | Methadone is metabolized *faster* in 3rd trimester → often needs a *higher* dose, not lower | ג also accepted (`c_accept`) |
| 2022 Q71 | א Capgras | Vignette ("staff are imposters identified as familiar people") fits **Fregoli** | single-answer |
| 2022 Q121 | ד | Garbled options; distractor ב arguably the better "not a geriatric principle" | single-answer |
| 2023 Q37 | ג | Israeli MHL §30–31: furlough authority sits with the hospital director; relative's objection applies to *discharge*, not furlough | single-answer |
| 2023 Q71 | א Escitalopram | "Most likely manic switch" is backwards — TCAs highest, SSRIs lowest | dual-accepted |
| 2024-Sep Q46 | א | Respiratory depression is an *opioid* feature, not a stimulant toxidrome | a,c,d accepted |
| 2024-Sep Q51 | ג | First MDE continuation is 6–12 mo (K&S/APA), not "match the 1.5-yr episode" | single-answer |
| 2024-Sep Q70 | א | Female gender isn't a classic good-prognosis factor; defensible only by elimination | single-answer |
| 2024-Sep Q80 | א | Written consent is wrong for emergency involuntary sedation (Patient Rights Law §15(3) exception) | ב,ד accepted |
| 2024-Sep Q94 | ג Naltrexone | Hepatotoxicity warning in significant hepatic impairment; acamprosate usually preferred | single-answer |

> These are **study flags**, not corrections. Verify against the official IMA key / a current reference before relying on them.
