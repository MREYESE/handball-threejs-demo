# Gesture V3 PLAYTEST candidate — promotion blocked

Source: `d14a427de2893349623ac0aacd5c3e533f620832`.
Previous public main: `6aba3133019778c29af36c0017612e675fb781c1`.
Verified backup tag: `backup/pre-gesture-v3-playtest-20261030-6aba313`.

No gameplay source or physics was changed during export. Standalone changes adapt
package/tool paths, quality-policy imports and a unit assertion about the private
host supervisor (excluded from this standalone project). The existing public
Pages workflow, hosted configuration, asset audit and MIT license are preserved.
The hosted test adds real desktop/mobile FEINT/new-shot checks, including exact
keeper-state equality across the native pointerdown input callback.

## Executed local validation

Node.js 24.20.0; Chromium; one browser worker and zero retries.

| Check | Result |
| --- | --- |
| npm ci | PASS on host; initial sandbox esbuild execution denied |
| npm run typecheck | PASS |
| npm test | PASS, 282/282 in 18 files |
| npm run asset:audit | PASS |
| npm run build | PASS; large-chunk advisory, 676.12 kB JS before gzip |
| Production resource inventory | PASS, relative JS/CSS references exist under dist |
| Native V3/FEINT/keeper browser campaign | FAIL, 9/14 |
| Hosted-style test against local production preview | PASS, 3/3 |
| Runtime npm audit | PASS, zero runtime advisories |
| Full npm audit | FAIL, six development-tool advisories |
| Export safety inventory | PASS; all candidate files inspected by allowlist/denylist scan |

The local hosted test is not evidence about a new live Pages deployment.

## Browser failures retained; no promotion

- Staged mouse FEINT and staged touch FEINT expected the earlier committed
  high-right/high-left keeper zone at the later shot release, but observed
  mid-center. The immediate new-gesture hosted smoke preserves keeper state,
  but this does not resolve the staged test failures or establish their cause.
- Mouse and touch 1920-wide five-shot matrices read `activeShot.ball` after the
  application had cleared `activeShot` during reset. Terminal-state observation
  was missed; these remain failed tests, not passing physical-contact proofs.
- The staged touch keeper test could not obtain its commitment checkpoint.

Passed: all five techniques across five-shot rounds and reset on mouse/touch at
960×540 and 1440×900; portrait 390×844 fake-only expiry and subsequent shot;
small correction; centered hold/cancel; mouse commitment; exact seeded native
keeper/flight/contact replay. The five-technique matrices assert physical ground
contact for V BOUNCE and opposite signed ROSCA. Unit tests also cover physical
LOB elevation, bounce and keeper continuity. No new public full functional run,
capture campaign or profile acceptance is claimed.

The separate local hosted campaign passed normal-shot resolution and desktop /
844×390 touch FEINT followed by one shot. It verifies held-ball visibility,
zero feint shot/sound, exact keeper-state preservation at fresh pointerdown,
physical terminal contact, reset, finite transforms, no console errors and no
failed network resources. It does not excuse the broader failures above.

## Dependency findings and exclusions

`npm audit` reports development-only advisories in vitest, @vitest/mocker,
tinypool, vite, nanoid and source-map-js (two critical, three high, one moderate).
`npm audit --omit=dev` reports zero vulnerabilities. Static Pages serves no Vite
or Vitest server. Dependency major upgrades are not silently applied during this
source-bound export; development-tool advisories remain unresolved.

The source's known full-suite render-timing, capture-reference and balanced/high
profile sample-floor blockers remain documented in README. Human desktop/mobile
usability, visual acceptance and performance remain pending. No full milestone
acceptance is claimed. No traces, reports, captures, calibration data or private
infrastructure are committed. Tests contain synthetic input paths only.

## Release gate

Keep the PR open; do not merge or deploy until the unresolved mandatory browser
checks are diagnosed and the release gates pass. Public main remains unchanged.
A subsequent approved merge must use the existing Pages workflow and verify the
actual hosted game, console/resources, source-commit metadata and mobile layout.
Rollback uses a normal restore commit from the backup tag through a reviewed PR;
never force-push main. See README for the exact restore command.
