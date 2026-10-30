# Handball Three.js — Gesture V3 PLAYTEST

**PLAYTEST candidate — public promotion blocked by unresolved browser checks.**
Human acceptance pending. Full milestone acceptance: NO.
The public URL continues to serve the previous version until this release passes its gates.

[Play Gesture V3](https://mreyese.github.io/handball-threejs-demo/?playtest&seed=71&quality=balanced)
· [Guía de gestos en español](docs/PLAYTEST_GESTURES_V3.md)

Start in the lower 45% of the canvas with one finger or the left mouse button.
Release after each action. Play five shots, then restart.

- DIRECT: draw upward, diagonally to aim; speed and distance control power.
- LOB: rise substantially, then draw a small downward hook while ending above the start.
  The ball launches upward with a physical elevated arc.
- BOUNCE: draw a down-then-up V. This creates physical downward/bounce intent;
  actual floor contact depends on aim and power.
- ROSCA_LEFT / ROSCA_RIGHT: begin upward, bow left/right, then return toward the
  shooting chord. Signed spin produces opposite flight effects independently of aim.
- FEINT: start laterally, brake or reverse clearly, then lift. **No shot is released.**
  Touch again and draw a fresh shooting gesture to release exactly one ball.

F5-A goalkeeper feedback exposes READ, HOLD and COMMIT through procedural poses.
A new shot preserves the keeper's legitimate post-feint position and recovery.
A feint does not guarantee deception or a goal. Saves require physical contact;
ball flight, floor/frame contacts and outcomes remain deterministic.

## Public playtest

Use balanced quality and seed 71 for comparisons. Test desktop and physical mobile,
portrait and landscape. Check held-ball visibility, opposing spin, lob height,
real bounce contact, zero shots after FEINT, a fresh shot afterward, five-shot
completion and reset. Report browser/device, gesture intended and what happened.
No human trace or calibration dataset is included in this repository. Optional
local diagnostics never upload gameplay data; do not publish raw recordings.

## Development

Node.js 24 is supported locally and in CI.

```bash
npm ci
npm run typecheck
npm test
npm run asset:audit
npm run build
npm run browser:install
npm run test:e2e
```

`npm run dev` starts Vite. Production output is ignored under `dist/`.
`npm run dev:smoke` runs focused native pointer cases. The hosted test uses
`PLAYWRIGHT_HOSTED_BASE_URL` with `playwright.hosted.config.ts`.
The relative Vite base supports `/handball-threejs-demo/` without runtime CDNs.
Once the bundled HTML, JS and CSS are downloaded, runtime needs no network.

## Known validation limitations

This is not production or full milestone acceptance. The private final campaign
passed 282 unit tests and 51/52 functional cases; an intermittent 1920-wide mouse
render-completion timing failure remains unresolved. Capture checks passed 2/9:
three existing outcome/zone mismatches and four visual-reference differences
(spin-driven pose and actual hand-held ball position) remain failed acceptance
checks. Balanced/high profiling collected 17/18 samples against the unchanged
minimum of 20. Software-rendered Chromium is not physical mobile performance or
human usability approval. [Current export validation](docs/RELEASE_GESTURE_V3.md) records the public checks;
they do not supersede these full-suite limitations. No historical captures,
reference images or diagnostic recordings are exported.

## Deployment and rollback

The existing `.github/workflows/pages.yml` validates PRs and deploys only public
`main` through the official GitHub Pages actions, then runs hosted Pointer Events
checks. No second deployment mechanism is used.

Previous public main: `6aba3133019778c29af36c0017612e675fb781c1`.
Backup tag: `backup/pre-gesture-v3-playtest-20261030-6aba313`.
To restore the prior playable export without rewriting history, branch from
current main, restore the tracked tree from that tag with `git restore --source
backup/pre-gesture-v3-playtest-20261030-6aba313 --staged --worktree .`, commit,
open a rollback PR, run checks and merge normally. Verify Pages and hosted smoke.
The original public history and MIT license remain preserved.

## Provenance and asset policy

Allowlisted application export from private `MREYESE/environmentTesting`, branch
`feat/gesture-v3-actions`, exact source SHA:
`d14a427de2893349623ac0aacd5c3e533f620832`.
Implementation ancestor: `88823bc1c15eea433a83c775baa9bef6f8470650`.
The HTML source-commit metadata identifies the export. Gameplay source is copied
unchanged; standalone package paths, policy imports, documentation and hosted
validation are adapted for this repository.

Runtime art/audio are procedural; `three` is the only runtime dependency. No Unity,
ECC infrastructure, reference media, private datasets, credentials or local
workstation paths are part of this export. [MIT License](LICENSE); dependencies
retain their upstream licenses.
