# Syllabus integration — 2026-06-16

Adds the official IMA psychiatry residency syllabus (curriculum chapter taxonomy) as
structured data, cross-walks it to the bank's 15 topics (B), and wires it into the AI
practice-drill so generated questions can be scoped to a real syllabus chapter (C).

Source: `e140855f…pdf` — "סילבוס להתמחות בפסיכיאטריה" (IMA Scientific Council, v1.3 2015,
54pp). Exam blueprint per the syllabus: שלב א' = 150–200 questions (older format; the actual
2024/2025 sittings are 100 each), Hebrew-only MCQ; base texts K&S Comprehensive 9e + Synopsis
10e, DSM-IV, ICD-10.

## `data/syllabus.json` (new, public)
6 curriculum sections → ~60 chapters (HE + EN), plus a `topicCrosswalk`. Served as a public
static file (like `topics.json`), precached by `sw.js` for offline. Not exam content.

| # | Section | chapters |
|---|---|---|
| 1 | Biological/Psychological/Social Basic Sciences | interview, exam, DSM/ICD, doctor-patient-society, life cycle, personality theory, psychodiagnostics, neuropsychiatry, genetics, epidemiology |
| 2 | The Psychiatric Disorders | dementia, delirium, substance, schizophrenia + psychoses, mood (MDD/bipolar/dysthymia/cyclothymia), anxiety+OCD, ASD/PTSD, somatoform, factitious, dissociative, sexual, eating, sleep, impulse-control, adjustment, personality, psychosomatic, C-L, emergencies |
| 3 | Special Populations | intellectual disability, learning, autism spectrum, ADHD, disruptive behavior, child & adolescent, early-childhood, geriatric |
| 4 | Treatments | psychopharm + somatic (incl. ECT), psychotherapy (dynamic/CBT/crisis/group) |
| 5 | Other Issues | rehabilitation, community, forensic, ethics, history |
| 6 | Unique Israeli Aspects | Holocaust trauma, Mental-Health-Treatment Law, Patient-Rights Law, community-rehab law, guardianship/driving/firearm, mandatory reporting, criminal/civil court, disability laws, IDF service, MH-services organization, immigration |

## B — topic ↔ syllabus crosswalk + `q.ti` validation
`topicCrosswalk` maps each of the 15 bank topics to its syllabus section/chapters.
**Validation result: all 15 `q.ti` topics map cleanly to syllabus chapters — no retag needed.**
Documented overlaps/gaps: `Personality Theories` feeds both Personality (#3) and Psychotherapy
(#10); `Neuropsychiatry` feeds both Neurocognitive (#6) and Neuroscience (#12); the entire
"Unique Israeli Aspects" section is split across Forensic/Law (#11) and Other/General (#14);
the cross-cutting interview/exam/classification chapters fold into Neuroscience & Basics (#12)
for lack of a dedicated "clinical assessment" topic.

## C — AI-drill scoped to syllabus chapters
`index.html` loads `data/syllabus.json` and adds a **"פרק סילבוס" (syllabus chapter)** select
(grouped by section) to the AI-question panel, default "— כל הסילבוס —" (whole syllabus / by
topic). The selected chapter (EN) is POSTed as `chapter` to `/api/ai-question`. The function's
`buildPrompt` adds, when present: *"Official IMA Shlav Aleph syllabus chapter (scope the
question to this chapter): …"*. Generated questions remain **practice-only**, labeled AI, and
are never written into the verified 900-question bank.
