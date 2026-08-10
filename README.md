# Handball Three.js Demo

An interactive browser-first handball penalty game built with Three.js and strict TypeScript.
Swipe or drag across the court to aim and shoot against a procedural goalkeeper.

**Play:** <https://mreyese.github.io/handball-threejs-demo/>

## Features

- Mouse, touch, and stylus Pointer Events
- Deterministic shot trajectory, goalkeeper decisions, and five-shot rounds
- Procedural arena, characters, materials, crowd, effects, and synthesized audio
- Accessible HTML/CSS HUD over a WebGL canvas
- No downloaded runtime media, models, fonts, or audio assets
- No CDN or runtime network dependency after the JavaScript bundle loads

## Development

Node.js 24 is the supported development and CI runtime.

```bash
npm ci
npm run typecheck
npm test
npm run build
```

For Chromium validation:

```bash
npm run browser:install
npm run test:e2e
```

Run the local development server with `npm run dev`. Production output is written to the ignored
`dist/` directory.

## Architecture

```text
Pointer Events
  -> gesture preprocessing and normalized shot intent
  -> deterministic target, trajectory, goalkeeper, and match domain
  -> Three.js presentation, HUD, effects, and synthesized audio
```

The domain modules do not import Three.js. Presentation consumes domain results; it does not decide
goals, saves, misses, or match progress.

## Asset policy

Runtime visual and audio content is generated in code. The export intentionally excludes the
private Unity project, historical evidence, reference imagery, local environment paths, and
CodeGraphContext data.

## Deployment

`.github/workflows/pages.yml` validates the locked dependency graph, type-checks, runs unit tests,
builds the Vite artifact, and deploys `dist/` with GitHub's official Pages actions. Pull requests
run the build path without deploying; pushes to `main` deploy the reviewed commit.

To roll back, revert the public repository to a previously validated commit and push that revert.
To unpublish without deleting source, disable or unpublish Pages in the repository settings.

## Provenance and license

This public repository is an allowlisted export of the Three.js application from the private
`MREYESE/environmentTesting` repository, source commit
`c78410dd1cc12e41a2ee0bb8ef5e12c4c57b51d9`. No private evidence or Unity content is included.

The project is released under the [MIT License](LICENSE). The runtime dependency `three` is also
MIT-licensed; development dependencies retain their respective upstream licenses.
