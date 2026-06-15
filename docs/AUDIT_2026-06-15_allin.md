# All-in audit — 2026-06-15

Full read-only audit of the repo across five dimensions (Netlify functions / security,
single-file app logic, data schema integrity, build-deploy-CI-infra, explanation↔key
consistency), followed by the safe fixes shipped in this PR. Findings that require the
source PDFs (held by the offline `E:\Downloads\Sniffer\work\` pipeline) are listed as
**deferred to the source-backed campaign**, not edited here — the anti-fabrication rule
(quote the source before touching canonical question/answer text) governs those.

## Fixed in this PR

1. **2024-May PDF footer-tail contamination (24 options).** Every 4th-option (`o[3]`) of the
   2024-May sitting carried the identical dated exam footer concatenated after the real
   answer, e.g. `"אוטו קרנברג בחינת שלב א' פסיכיאטריה28.05.24 3"`. The real answer always
   preceded the footer, so stripping the literal ` בחינת שלב א' פסיכיאטריה<dd.mm.yy> <page>`
   suffix is deterministic de-contamination, not fabrication — same operation the repo
   already applied to other sittings (`PDF_TAIL_CLEANUP_2026-06-15.md`). All 24 stripped;
   0 remain. Affected ids: q004, q008, q011, q015, q019, q022, q025, q029, q032, q036, q039,
   q042, q051, q055, q058, q062, q069, q073, q077, q081, q085, q089, q093, q097 (all
   `psych-2024-05-*`, option 4).

2. **The data-quality gate was reporting a false `pdf-tail-artifact: 0`.** `hasPdfTailArtifact()`
   only matched the `יש לבחור…` instruction tail + `עמוד\d+`, so it was blind to the
   `בחינת שלב א' פסיכיאטריה…` footer above — and `data-quality-regression.mjs:33` asserts the
   count is 0, so the build stayed green over 24 live tails. The detector is now widened to
   recognize the dated footer; with the data cleaned the count is genuinely 0 (gate honest
   **and** green). Re-contamination will now fail CI.

3. **Explanation OCR mojibake.** `data/explanations.json` for `psych-2021-q071` contained
   `האשפoz` (Latin `oz` corrupting the Hebrew `האשפוז`, "the hospitalization"). Unambiguous,
   in an explanation (not the frozen key) → fixed.

4. **Auth helper now fails closed.** `requireSupabaseUser(req, {allowDisabled})` defaulted to
   `allowDisabled:true` (returns `{ok:true,user:null}` with no token check when Supabase env
   is unset). All current protected callers pass `false` explicitly, so behavior is unchanged
   today, but a future endpoint using the bare default would have been open on a misconfig.
   Default flipped to `false` (fail closed).

5. **ROADMAP doc drift.** `ROADMAP_IMPLEMENTATION_2026-06-14.md` listed `OPENAI_API_KEY` as a
   required env var. Both AI functions route through the Toranot **Claude** proxy with the
   user's Supabase JWT — no model key of any kind lives in this repo. Corrected.

6. **Release trinity bumped** 1.6.9 → 1.6.10 (`package.json`, `manifest.json`, `sw.js` CACHE)
   so the data fix busts the offline cache.

## Deferred — needs the source PDFs (hand to the source-backed campaign)

- **2020 reversed-digit artifact (25 questions).** Multi-digit numbers are stored with digits
  reversed (RTL bidi extraction artifact): `בת01`→age 10, `0111`→1000, options `01%/21%/01%/61%`
  → 10%/12%/10%/16%. Reversing requires the source to disambiguate (e.g. `0111`→1000 vs 1110).
  Answer keys (`c`/`c_accept`) are unaffected — only the rendered number text. The display-time
  normalizer does **not** fix these. Ids: q001, q014, q029, q037, q043, q050, q053, q058, q061,
  q073, q077, q079, q080, q089, q091, q093, q099, q109, q118, q120, q123, q126, q134, q147, q150
  (all `psych-2020-*`).
- **Duplicate distractor.** `psych-2024-09-q056` has `"Idealizing Transference"` as both `o[1]`
  and `o[3]`; `c=2` so the key is unaffected, but one distractor is dead. Needs the source to
  recover the intended 4th option.
- **Under-specified refs.** 70 refs (mostly 2024-May) are page-number-only (`"p. 358-9"`), 3 are
  source-only with no page, 1 malformed (`psych-2023-q059` = `"DSM 446 5"`). Non-blocking.
- **Hebrew↔English spacing (257, the standing campaign).** Already display-normalized in-app and
  being cleaned source-backed sitting-by-sitting (2020 + 2021 done). Not touched here.

## Verified SAFE (no action needed)

- **Security:** no path traversal in `protected-asset` (strict 3-entry `Map` allowlist; user
  input is only a `Map.get` key, never a filesystem path); auth enforced on every protected
  endpoint (401 on missing/invalid/expired; 501 when Supabase unconfigured); no SSRF (proxy URL
  is env/const, never user data); no secret committed; tokens never logged; CORS not permissive.
- **App (`index.html`):** all question/option/explanation/AI text is escaped before HTML
  assembly (no exploitable XSS found); the `*.github.io` host guard is anchored and correct
  (Pages never probes `/api/*`); no closure-stale-read or setAuthSession-unmount race; IDB has a
  localStorage fallback with no data loss/double-count; Leitner box math (`[0,5]` clamp vs
  6-entry `BOX_DAYS`) has no off-by-one.
- **Infra:** the service worker never precaches or caches the protected JSON (and `verify.mjs`
  enforces that); `netlify.toml` routes `data/*.json` + `answer_key_doubts.json` through
  `protected-asset` with `force=true`; the RLS migration has correct `with check` on every
  insert/update across all three tables (no cross-user write); version trinity CI-enforced.

## Recommended follow-ups (not done here)

- **`escapeHtml` (`index.html`)** does not escape `'`. Not exploitable today (all attributes are
  double-quoted), but a latent footgun. Deferred because escaping `'` would alter rendered
  `שלב א'`-style strings and risks the UI regression — bundle it with a UI-regression update.
- **Security headers / CSP** — `netlify.toml` has no `[[headers]]` block. A strict CSP is a real
  task (inline single-file scripts force `'unsafe-inline'` unless hashed — see the workspace
  CSP-hash-drift lesson); the clean wins (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, HSTS) can ship independently.
- **`AbortSignal.timeout`** on the auth-introspection and proxy `fetch` calls (`lib/supabase.mjs`,
  `ai-tutor`/`ai-question`) so a hung upstream returns a clean 503 instead of a platform timeout.
- **Per-user rate limit** on the AI endpoints — they forward to a *shared, billed* proxy.
- **Idempotent RLS policies** — the migration uses bare `create policy` (errors on re-apply);
  prefix `drop policy if exists`. Harmless for a once-run migration.
