# AI Practice Pool — Medical Correctness Audit (2026-06-16)

Scope: full medical audit of every question in `data/practice_questions.json` — the
AI-generated **practice-only** pool (Synopsis-grounded, labeled `ai_generated`, isolated
from the verified 900-question bank). This audit followed the Codex review of PR #29, which
caught 2 medical errors in a sample and prompted a complete pass.

## Method

- 6 parallel auditor subagents over the pool (≈50 questions each), each judging items
  against current board-correct psychiatry / DSM-5 / Kaplan & Sadock knowledge — not mere
  internal consistency. Calibrated with the two Codex-found errors as the flagging bar.
- The batch whose agent miscounted (batch 3) was re-audited exhaustively (all 50 indices
  enumerated) to close the coverage gap.
- Every flag was then personally adjudicated against DSM-5 before any change. Conservative
  policy: medical errors are **removed** (not hand-rewritten without the source passage);
  a wrong tangential explanation detail on an otherwise-correct item is **surgically
  corrected**.

## Result

Across all questions audited, **zero** high/medium-confidence wrong-answer-key errors beyond
what is fixed below. The pool is medically sound. Findings acted on:

| id | defect | confidence | action |
|---|---|---|---|
| `ai-dysthymia-cyclothymia-3` | Keyed answer states cyclothymia requires "≥1 hypomanic **episode** and ≥1 depressive **episode**." DSM-5 cyclothymic disorder requires numerous periods of **subsyndromal** hypomanic and depressive **symptoms** that never meet full episode criteria. No option carried the correct criterion. | high (fact_error) | **removed** |
| `ai-somatoform-disorders-4` | Key/stem correct (DSM-5 SSD: ≥6 months, ≥1 somatic symptom). Explanation's final sentence wrongly graded SSD **severity** "by number of somatic symptoms"; DSM-5 grades severity by the count of **Criterion B** psychobehavioral features. | low (explanation only) | **corrected** (erroneous sentence removed; key unchanged) |

Earlier, in the PR #29 Codex round, two items were already removed:
`ai-sexuality-sexual-dysfunction-5` (paraphilic-disorder criterion: "only when acted on" —
DSM-5 also diagnoses on distress/impairment without acting) and
`ai-psychopharmacological-somati-2` (contested ECT-in-psychotic-depression claim keyed as
fact).

## Pool size

300 generated → 299 kept at assembly → 297 after the PR #29 Codex removals → **296** after
this audit (1 removed here).

## Reusable lessons

1. Adversarially-verified AI MCQ generation still ships a small fraction of medical errors
   (here ~4 / 300 ≈ 1.3% across the full lifecycle). A medical-correctness pass over
   AI-practice content is worth running even when the content is isolated and labeled.
2. The dominant error shape was **inverted DSM-5 criteria presented as fact** (cyclothymia,
   paraphilia) and **contested claims stated as established** (ECT) — internally consistent
   but board-wrong. Internal consistency checks do not catch this class; medical-knowledge
   judgment does.
3. AI MCQ generators skew answer-position hard (the pool originally never keyed option ד);
   rebalance the answer-key distribution after generation.
4. When an auditor subagent's self-reported count disagrees with the file, re-audit that
   batch — a miscount is a coverage signal.
