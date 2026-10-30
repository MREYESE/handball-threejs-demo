# Handball Gesture V3 — PLAYTEST artifact

This repository publishes compiled browser artifacts only. Application TypeScript,
source maps, dependencies, development tests and private infrastructure are excluded
from this release tree. Browser JavaScript is necessarily downloadable to run the game.

[Play](https://mreyese.github.io/handball-threejs-demo/?playtest&seed=71&quality=balanced)

Source provenance: `d14a427de2893349623ac0aacd5c3e533f620832` in the private
`MREYESE/environmentTesting` repository. `site/release.json` records file hashes.
No human traces or calibration data are published.

## Gestos — español

Empieza en el 45 % inferior del campo y usa un dedo o el botón izquierdo del ratón.

- DIRECT: desliza hacia arriba; inclina el gesto para apuntar.
- LOB: sube y dibuja un pequeño gancho hacia abajo, terminando por encima del inicio.
- BOUNCE: baja y vuelve a subir formando una V; el rebote depende de la física real.
- ROSCA: sube, dibuja una barriga a izquierda/derecha y vuelve hacia la línea de tiro.
- FEINT: empieza lateralmente, frena o invierte claramente y levanta el dedo.
  El balón sigue en la mano y no cuenta ningún tiro. **Toca de nuevo y dibuja otro
  gesto para lanzar**. El portero conserva su estado real; la finta no garantiza gol.

Completa cinco tiros y reinicia. Comprueba móvil vertical/horizontal y escritorio.
Las señales F5-A del portero muestran READ, HOLD, COMMIT y recuperación.

## Validation and release limitations

PLAYTEST only. Human validation pending. FULL_MILESTONE_ACCEPTED: NO.
Private typecheck, 282 unit tests, asset audit and source-map-free production build
pass. Local hosted-style normal-shot / desktop FEINT / mobile FEINT smoke passes.
Five broader browser checks remain unresolved: two staged FEINT keeper-zone
expectations, two 1920-wide terminal snapshot races and a touch commitment
checkpoint. Capture reference mismatches and balanced/high profiling sample floors
also remain unresolved. These results do not constitute full milestone acceptance.
Deployment requires the requested explicit playtest waiver or resolved mandatory checks.

## Publication and recovery

The existing Pages workflow verifies the checked-in artifact, uploads `site/`,
deploys with the official Pages actions and runs real pointer smoke on the URL.
The source is built and tested privately; this public repository cannot rebuild it.
Old source remains in historical Git commits/closed PRs; removing it from the
current tree does not erase prior public copies.

The previous version is preserved at tag
`backup/pre-gesture-v3-playtest-20261030-6aba313`, SHA
`6aba3133019778c29af36c0017612e675fb781c1`.
To roll back without publishing old source again, build that version privately
without source maps, replace only `site/`, update its manifest and merge a normal
rollback PR after checks. Never force-push main.

[MIT License](LICENSE). Bundled Three.js is MIT licensed.
