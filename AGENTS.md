# AGENTS.md — Public Three.js Handball Demo

## Mission

Evolve the playable browser handball demo through small, reviewable slices while keeping the real
Pointer Events -> domain -> Three.js/HUD path working.

## Product path

```text
pointer gesture
  -> normalized swipe features
  -> standard-shot intent and goal target
  -> deterministic trajectory and goalkeeper decision
  -> GOAL / SAVED / MISS
  -> HUD, effects, reset, and five-shot result
```

## Boundaries

- TypeScript strict mode.
- `src/domain/**` remains deterministic and independent of Three.js and browser presentation.
- Runtime art and audio are generated in code. Do not add downloaded images, textures, models,
  animation clips, audio files, fonts, brands, or CDN assets.
- `three` is the only runtime dependency. Do not add an engine, physics library, UI framework,
  backend, analytics, account system, or runtime fetch without an explicit Issue.
- Keep desktop and mobile-landscape Pointer Events functional.
- Do not commit `node_modules/`, `dist/`, browser reports, test results, or generated captures.
- Do not hide failures with fixtures, mocked gameplay boundaries, fallback success, or screenshot-only
  proof.
- CodeGraphContext is optional. Hosted development must work from repository files alone.

## Required validation

For source changes, run at minimum:

```bash
npm run typecheck
npm test
npm run build
npm run asset:audit
```

Run the focused Playwright project for browser/input/presentation changes. A build or screenshot is
not a substitute for a real pointer-driven browser path.

## Git and delivery

- Work on a branch, not directly on `main`.
- Keep one coherent feature or fix per pull request.
- Preserve source/runtime separation and existing deterministic hooks.
- Update README instructions when setup, deployment, or public behavior changes.
- Do not merge automatically. Report tests run, tests skipped, mocks used, and remaining blockers.
