# Audit Report - 2026-06-14

Scope: single-file Psychiatry Shlav Aleph PWA, static data files, service worker, manifest, README, and repository verification. The audit intentionally did not rewrite official answer keys, OCR stems, or medical content.

## P1 fixed

- Session-end retry bug: the "retry mistakes from this round" button dereferenced `session` after it was cleared. The retry queue is now captured before clearing session state.
- Answer acceptance semantics: `all_accepted` questions now grade all four options as accepted at runtime, independent of stored primary answer shape.
- XSS hygiene: user-visible data rendered through HTML templates now escapes dynamic question/session/topic/reference values in the quiz, browse, and stats paths.

## P2 fixed

- WCAG 2.1 AA color contrast: adjusted low-contrast tokens and text treatments, then added a computed contrast audit covering text-on-background combinations used by the app.
- Keyboard operation: number keys 1-4 choose answers, `Enter` advances after grading, and the current feedback region receives managed focus after grading.
- Screen-reader structure: added skip link, semantic `main`/`nav`, section labels, progressbar values, option group labeling, visible focus states, and live regions for loading, toast, and grading feedback.
- Reduced-motion and reduced-data: added CSS handling for reduced motion/data and runtime explanation loading that respects Save-Data / `prefers-reduced-data`.
- Hit targets: chips, bottom nav, search input, and quiz options now meet or exceed 44 px target sizing.
- PWA metadata: aligned `package.json`, `manifest.json`, and service-worker cache marker to `1.2.1`; removed data-URI manifest icon and fixed GitHub Pages scope/start URL.
- Verification: `npm run verify` now checks question integrity, explanation coverage, PWA version/cache metadata, and accessibility contrast/structure. GitHub Actions runs that gate on PRs.

## P3 fixed

- SEO/share metadata: added canonical, robots, OpenGraph, Twitter card metadata, and PNG favicon.
- No-script/loading states: added accessible loading and no-JavaScript messaging.
- README: documented the verification gate.

## Intentionally left unfixed

- Official answer keys and post-appeal mappings were not changed.
- OCR-marked 2025 stems were not rewritten because the prompt required preserving official/OCR content unless verified against source.
- The browse list remains capped at 300 rendered questions instead of adding virtualization; current data size is small enough for the zero-build architecture.
