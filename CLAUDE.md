# CLAUDE.md — Psychiatry Shlav Aleph (שלב א' פסיכיאטריה)

Guidance for Claude Code working in this repo. The cross-repo workspace map and the
global operating model / shell / security rules live in `~/repos/CLAUDE.md` and
`~/.claude/CLAUDE.md` — don't duplicate them here. This file is the per-repo detail.

## What this is

An installable, offline-capable **single-file PWA** for drilling the Israeli
**Shlav Aleph (שלב א') Psychiatry** board exam (המועצה המדעית / הר"י).

- **Live (GitHub Pages, public/offline):** https://eiasash.github.io/Psychiatry/
- **Live (Netlify, login + sync + AI):** https://psychiatry-szmc.netlify.app/
- **Main file:** `index.html` (all HTML/CSS/JS — no build step). Data in `data/*.json`,
  offline shell cached by `sw.js`.
- The 7th medical PWA in the workspace, newest (built 2026-06-14). Cloned the
  *Geriatrics* study UX; psychiatry-appropriate sources (Kaplan & Sadock *Synopsis*,
  DSM-5, Israeli mental-health statutes).

## Content (the bank)

`data/questions.json` — **900 real exam questions** across 7 sittings:

| Sitting `t` | Count | Fidelity |
|---|---|---|
| `2020` | 150 | byte-accurate (clean PDF text layer) |
| `2021-Jun` | 150 | byte-accurate |
| `2022-Jun` | 150 | byte-accurate |
| `2023-Jun` | 150 | byte-accurate |
| `2024-May` | 100 | byte-accurate |
| `2024-Sep` | 100 | byte-accurate |
| `2025-Jun` | 100 | **vision/OCR** (`vision:true`) — see caveat |

- **`2025-Jun` (100 Qs) is `vision:true`**: its source PDF had a corrupt font/text layer,
  so the **question stems were transcribed from page images and are NOT byte-verified**
  (occasional word-level errors). The **options, official answer key, and refs are
  reliable**, so they're answerable; the app marks them with an `OCR` badge. The other
  800 are byte-accurate. **Don't "fix" OCR stems by guessing** — only a human re-key
  from a clean PDF makes 2025-Jun byte-accurate.
- `data/explanations.json` — id-keyed, **900/900**, Synopsis-grounded (BM25 RAG +
  Opus workflow). The app shows הסבר in quiz feedback and browse.
- `data/topics.json` — `{ "topics": [...] }`, 15 DSM-5 / Kaplan & Sadock categories
  (Mood, Schizophrenia & Psychosis, Anxiety/OCD/Trauma, Personality, Child & Adolescent,
  Substance Use, Neurocognitive & Geriatric, Psychopharmacology, Eating, Sleep & Sexual,
  Psychotherapy, Forensic/Law/Ethics, Neuroscience & Basics, Consultation-Liaison, Other).
  `q.ti` is the primary index; `q.tis[]` the multi-tag array.

### `data/questions.json` schema

```json
{
  "id": "psych-2023-q041",
  "q": "<stem>",
  "o": ["<א>", "<ב>", "<ג>", "<ד>"],
  "c": 1,                 // 0-based correct index (primary)
  "c_accept": [1, 3],     // all accepted indices (post-appeal multi-accept)
  "all_accepted": false,  // true = nullified on appeal, any answer accepted
  "t": "2023-Jun",        // sitting tag (see table above)
  "ti": 11,               // primary topic index (data/topics.json)
  "tis": [11],            // multi-tag topic indices
  "ref": "Synopsis 11ed p. 619",
  "src": "IMA Shlav Aleph Psychiatry",
  "vision": true          // ONLY on 2025-Jun — stem is OCR, not byte-verified
}
```

Answer keys are the **official post-appeal** keys (`c_accept` for multi-accept, 12
questions nullified → `all_accepted:true`). **Never paraphrase or fabricate option/stem
text** — quote the source PDF/fixture first (same anti-fabrication rule as the sibling
medical PWAs; this is why the v9.81-class incident is cited workspace-wide).

## Architecture

Zero-build single-file app + JSON data. Two deploy targets from the same repo:

- **GitHub Pages** — public, offline, **no login**. `index.html` guards against the
  `*.github.io` host so it never probes `/api/*` (no console 404, never auth-gates the
  static build).
- **Netlify** (`psychiatry-szmc.netlify.app`) — adds Supabase email/password login,
  protected question JSON, cross-device progress sync, and the AI Tutor. Git-linked,
  auto-deploys from `main` (build command empty, publish `.`).

### Netlify Functions (`netlify/functions/`)

| Function | Path | Purpose |
|---|---|---|
| `supabase-config.mjs` | `/api/supabase-config` | Returns `{enabled,url,key}` to the client (enabled only when env vars set) |
| `protected-asset.mjs` | `/api/protected-asset?path=…` | Validates the Supabase access token, then serves `data/questions.json` / `data/explanations.json` / `docs/answer_key_doubts.json`. Returns 401 without a valid token. |
| `ai-tutor.mjs` | `/api/ai-tutor` | Optional AI Tutor |
| `ai-question.mjs` | `/api/ai-question` | Optional AI-generated **practice-only** syllabus drill — labeled, never written into `data/questions.json` |
| `lib/supabase.mjs` | — | Shared helpers (`supabaseConfig`, `requireSupabaseUser`) |

`netlify.toml` redirects direct `data/*.json` + `docs/answer_key_doubts.json` requests
through `/api/protected-asset`. **Gotcha (learned the hard way):** Netlify v2 functions
do NOT receive query params added by a `netlify.toml` rewrite — the client calls the
function path with `?path=…` directly when `AUTH.required`; the function also falls back
to parsing the request pathname.

## Supabase + AI

- **Shared project `krmlzwwelqvlfslwltol`** (the "Toranot" project used by all the
  medical PWAs). Psychiatry uses **native Supabase Auth** + the generic
  `study_progress` / `study_stars` / `study_sessions` tables (per-user RLS,
  `auth.uid() = user_id`). Migration: `supabase/migrations/20260614132243_psychiatry_study_progress.sql`.
  CLI-linkable (`supabase/config.toml`, `project_id "Psychiatry"`): `supabase link --project-ref krmlzwwelqvlfslwltol`.
- **AI Tutor routes through the shared Toranot Claude proxy** (`toranot.netlify.app/api/claude`,
  default model `claude-sonnet-4-6`) — **not** a model vendor directly, so **no model API
  key lives in this repo**. The function forwards the signed-in user's **Supabase JWT** as
  `Authorization: Bearer`; the proxy validates it against the same shared project. No proxy
  secret stored here.
- **Netlify env vars** that gate login: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`
  (`SUPABASE_ANON_KEY` fallback). Optional: `CLAUDE_PROXY_URL`, `CLAUDE_MODEL`,
  `CLAUDE_PROXY_SECRET` (only for a non-Supabase proxy).

## Verify / CI

Gate before shipping: **`npm run verify`** (`.github/workflows/verify.yml` runs it on push
to `main` and every PR; required status check). It runs:

1. `check:syntax` — `check-index-script.mjs` + `node --check` on every script and Netlify function
2. `scripts/verify.mjs` — data integrity (question/option/key schema, explanation coverage,
   key-doubt mappings, official sitting counts, local-durability hooks) + **version/PWA checks**
3. `audit:a11y` (`a11y-audit.mjs` — computed contrast + keyboard/focus/live-region), `audit:ui`,
   `audit:sw`, `audit:ai`, `audit:data`, `audit:data:regression`

Other useful scripts (not in the gate): `npm run verify:prod` (prod smoke), `npm run visual:mobile`.

### Version trinity (enforced by `scripts/verify.mjs`)

Three must agree or `verify` fails — bump together on every release:

- `package.json` → `version`
- `manifest.json` → `version` (must `===` package version; also `start_url` must be `"./"`)
- `sw.js` → `const CACHE = "psych-shlava-v<version>"` (the cache string must **include**
  the package version — mismatched cache markers mask shipped fixes behind the browser cache)

## Conventions & traps

- **Hebrew RTL**: store strings as-is UTF-8, never transliterate. UI uses `dir="auto"` +
  `unicode-bidi: plaintext`, not forced `dir="rtl"`. Drug names / English clinical terms
  stay in English per Israeli convention.
- **Branch + PR for all non-trivial work** (`claude/<slug>` → PR → CI green → merge). Never
  push `main` directly.
- **Codex review is NOT yet enabled on this repo.** The Codex GitHub App
  (`chatgpt-codex-connector[bot]`) reviews PRs on the sibling repos but has **never** reviewed
  one here (0 reviews on #20–#25; `@codex review` is a no-op). To turn it on, install/grant the
  Codex app access to `Eiasash/Psychiatry` at github.com/settings/installations, then trigger
  with an `@codex review` PR comment. Until then, treat CI-green + a fresh-eye/audit pass as the
  review bar — don't "wait for Codex" here expecting it to arrive.
- **OCR caveat** (above): never silently "correct" a `vision:true` stem.
- **Answer keys are post-appeal official** — `c_accept`/`all_accepted` encode multi-accept
  and nullified questions; don't collapse them to a single `c`.
- AI-generated practice content (`/api/ai-question`) is **practice-only** and must never be
  merged into the verified 900-question bank.

## Pipeline / provenance

The byte-accurate bank + Synopsis-grounded explanations were built by an offline pipeline
under `E:\Downloads\Sniffer\work\` (exam parser, key merger, BM25 retrieval over Synopsis,
Opus generation + adversarial verification). Throttle Opus generation workflows to
**waves of 5** (server rate limit). Questions are transcribed from official IMA Scientific
Council PDFs for **personal exam preparation**.
