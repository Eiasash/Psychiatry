# Source-backed digit repair — 2020 sitting — 2026-06-16

## Problem
The 2020 sitting carried a **digit-corruption** distinct from the spacing class: multi-digit
numbers (ages, doses, percentages, hour-ranges, a statute year) were mangled when the PDF
text layer was extracted. The corruption is **lossy and non-reversible** — e.g. the same
stored token `01%` is the true `10%` in one option and `40%` in another (q050), and `0111`
is the true `1000` (q091, not `1110`). So no programmatic transform recovers the truth.

## Method (source-backed, per IMA "text-layer corrupt / visual clean" rule)
Rendered the official source `2020/Psychiatry 2020 - Questions [642867].pdf` to page images
(fitz, 200 dpi) and read the **visual** true value for every affected number. The high-risk
cases (q050 percentages, q118 hour-ranges, q109 doses, q091 B12 dose) were verified by a
human-in-the-loop re-read of the rendered page; option order (א→ד = o0→o3) and the official
answer key (`c`/`c_accept`) are unchanged. Only digits were edited — Hebrew wording and
spacing were left exactly as stored (spacing is handled by the separate display-normalizer).

## Corrections (25 questions, 35 numeric tokens)
| id | field | before → after | source |
|---|---|---|---|
| q001 | stem | בת **01→40** | age 40 |
| q014 | stem | בת **01→40** | age 40 (visual-confirmed) |
| q029 | stem | בת **05→45** | age 45 |
| q037 | stem | בן **00→41** | age 41 |
| q043 | stem | בן **01→40** | age 40 |
| q050 | o0/o1/o2/o3 | **01→10 / 21→20 / 01→40 / 61→60** % | 10/20/40/60% (visual-confirmed) |
| q053 | stem | בן **05→45** | age 45 |
| q058 | stem | בן **05→15** | age 15 |
| q061 | stem | חוק נפש **0990→1991** | Israeli Mental Health Law 1991 |
| q073 | stem | בת **61→60**; דקנואט **051→150** מ"ג | age 60; Haldol decanoate 150 mg |
| q077 | stem | בת **01→40** | age 40 |
| q079 | stem | בן **08→18** | age 18 |
| q080 | stem | בת **05→15** | age 15 |
| q089 | stem | בן **05→45** | age 45 (visual-confirmed) |
| q091 | o1 | של **0111→1000** מ"ג B12 | 1000 mg (visual-confirmed) |
| q093 | stem | בן **05→45** | age 45 |
| q099 | stem | בן **08→18** | age 18 |
| q109 | o0/o1 | מתן **21→20** מ"ג; בתוספת **011→100** מ"ג תיאמין | 20 mg valium + 100 mg thiamine (visual-confirmed) |
| q118 | o0/o1/o2/o3 | **02-6→12-6 / 20-02→24-12 / 08-20→48-24 / 72-08→72-48** | cocaine-withdrawal hour ranges (visual-confirmed) |
| q120 | stem | בן **05→45** | age 45 (visual-confirmed) |
| q123 | stem | ילד בן **01→10** | age 10 |
| q126 | stem | בת **05→45** | age 45 |
| q134 | stem | בת **20→24**; עד **011→100** פעמים ביום | age 24; up to 100×/day |
| q147 | o0 | בן **08→18** | age 18 |
| q150 | stem | לפני **01→10** ימים | 10 days ago |

## Not changed
- Answer keys (`c`/`c_accept`/`all_accepted`) — unchanged.
- Hebrew wording / spacing — unchanged (display-normalized at render).
- 2025-Jun OCR stems — out of scope (corrupt source text layer; only a human re-key from a
  clean PDF can byte-verify them).
