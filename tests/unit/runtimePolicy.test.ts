import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE_ROOT = join(APP_ROOT, "src");
const FORBIDDEN_MEDIA_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
  ".hdr",
  ".exr",
  ".glb",
  ".gltf",
  ".fbx",
  ".obj",
  ".dae",
  ".blend",
  ".mp3",
  ".wav",
  ".ogg",
  ".m4a",
  ".aac",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

function filesUnder(directory: string): readonly string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });
}

function sourceText(): string {
  return filesUnder(SOURCE_ROOT)
    .filter((path) => [".ts", ".css"].includes(extname(path)))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

describe("runtime asset and network policy", () => {
  it("keeps three as the only runtime dependency", () => {
    const packageJson = JSON.parse(
      readFileSync(join(APP_ROOT, "package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };

    expect(Object.keys(packageJson.dependencies ?? {})).toEqual(["three"]);
  });

  it("contains no runtime media, model, audio, or font files", () => {
    const forbidden = filesUnder(APP_ROOT)
      .filter((path) => !path.includes(`${join("", "node_modules")}`))
      .filter((path) => !path.includes(`${join("", "artifacts")}`))
      .filter((path) => FORBIDDEN_MEDIA_EXTENSIONS.has(extname(path).toLowerCase()))
      .map((path) => relative(APP_ROOT, path));

    expect(forbidden).toEqual([]);
  });

  it("contains no network APIs, external asset URLs, or asset loaders in runtime source", () => {
    const source = sourceText();
    const networkCall = new RegExp(
      String.raw`\b(?:fe${"tch"}|XMLHttpRequest|EventSource|WebSocket)\s*\(`,
    );
    const assetLoader = new RegExp(
      String.raw`\b(?:TextureLoader|CubeTextureLoader|ImageLoader|AudioLoader|FileLoader|GLTFLoader|FBXLoader|OBJLoader|FontLoader)\b`,
    );
    const externalMedia = new RegExp(
      String.raw`(?:https?:)?//[^\s"']+\.(?:png|jpe?g|webp|svg|hdr|glb|gltf|mp3|wav|ogg|woff2?|ttf)`,
      "i",
    );

    expect(source).not.toMatch(networkCall);
    expect(source).not.toMatch(assetLoader);
    expect(source).not.toMatch(externalMedia);
  });

  it("does not reference the documentation-only art target or nondeterministic gameplay RNG", () => {
    const source = sourceText();
    const referenceName = ["handball-arcade-anime-europe", ".png"].join("");
    const nondeterministicRng = ["Math", "random"].join(".");

    expect(source).not.toContain(referenceName);
    expect(source).not.toContain(nondeterministicRng);
  });

  it("keeps the domain independent from three and the boot entrypoint connected", () => {
    const domainFiles = filesUnder(join(SOURCE_ROOT, "domain"));
    for (const path of domainFiles) {
      expect(readFileSync(path, "utf8"), relative(APP_ROOT, path)).not.toMatch(
        /from\s+["']three(?:\/|["'])/,
      );
    }

    const html = readFileSync(join(APP_ROOT, "index.html"), "utf8");
    const main = readFileSync(join(SOURCE_ROOT, "main.ts"), "utf8");
    const hud = readFileSync(join(SOURCE_ROOT, "ui", "GameHud.ts"), "utf8");
    const functionalPlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "functional.spec.ts"),
      "utf8",
    );
    expect(html).toContain('src="/src/main.ts"');
    expect(hud).toContain('id="app-status"');
    expect(hud).toContain('id="game-canvas"');
    expect(main).toContain("new HandballDemoApp(root");
    expect(main).toContain("app.start()");
    expect(main).toContain('search.has("playtest")');
    expect(functionalPlaytest).toContain("/?playtest&seed=");
  });

  it("keeps procedural character roots presentation-only and outside scoring authority", () => {
    const characterSource = filesUnder(
      join(SOURCE_ROOT, "presentation", "characters"),
    )
      .map((path) => readFileSync(path, "utf8"))
      .join("\n");
    const scene = readFileSync(
      join(SOURCE_ROOT, "presentation", "GameplayScene.ts"),
      "utf8",
    );
    const app = readFileSync(
      join(SOURCE_ROOT, "app", "HandballDemoApp.ts"),
      "utf8",
    );

    expect(characterSource).not.toContain("resolveShotOutcome");
    expect(characterSource).not.toContain("resolveMatchShot");
    expect(characterSource).not.toContain("beginShot");
    expect(characterSource).not.toContain("saveRadiusMeters");
    expect(characterSource).toContain('userData["ownsScoring"] = false');
    expect(scene).toContain("characterVisualRootsOwnScoring: false");
    expect(app).toContain("keeperZone: shot.keeperZone");
    expect(app.indexOf("resolveShotOutcome(")).toBeLessThan(
      app.indexOf("this.scene.apply({", app.indexOf("private applyShotVisuals")),
    );
  });

  it("keeps procedural materials, crowd, environment, and pre-warm on the real scene path", () => {
    const materials = readFileSync(
      join(
        SOURCE_ROOT,
        "presentation",
        "materials",
        "ProceduralMaterials.ts",
      ),
      "utf8",
    );
    const crowd = readFileSync(
      join(SOURCE_ROOT, "presentation", "crowd", "ProceduralCrowd.ts"),
      "utf8",
    );
    const scene = readFileSync(
      join(SOURCE_ROOT, "presentation", "GameplayScene.ts"),
      "utf8",
    );
    const app = readFileSync(
      join(SOURCE_ROOT, "app", "HandballDemoApp.ts"),
      "utf8",
    );
    const main = readFileSync(join(SOURCE_ROOT, "main.ts"), "utf8");

    expect(materials).toContain("new THREE.CanvasTexture(canvas)");
    expect(materials).toContain("Procedural texture base resolution");
    expect(materials).toContain('"wall-panel"');
    expect(materials).toContain('"led-board"');
    expect(materials).not.toContain("TextureLoader");
    expect(crowd).toContain("new THREE.InstancedMesh(");
    expect(crowd).toContain('"hero" | "distant"');
    expect(crowd).not.toContain("resolveShotOutcome");
    expect(crowd).not.toContain("resolveMatchShot");
    expect(scene).toContain("new RoomEnvironment()");
    expect(scene).toContain("await this.renderer.compileAsync(");
    expect(scene).toContain("new ProceduralCrowd(");
    expect(scene).toContain("GeneratedContactShadow");
    expect(scene).toContain("ENSEMBLE, PLUS FORTS");
    expect(scene).toContain("JUNTOS HACIA EL GOL");
    expect(scene).toContain("GEMEINSAM STARK");
    expect(app.indexOf("await this.scene.prewarm()")).toBeLessThan(
      app.indexOf("this.setInputEnabled(true)", app.indexOf("public async start")),
    );
    expect(main.indexOf("await app.start()")).toBeLessThan(
      main.indexOf("window.__READY__ = true"),
    );
    expect(main).toContain("window.__PERF_SNAPSHOT__");
  });

  it("keeps arcade feedback event-driven, bounded, synthesized, and outside scoring authority", () => {
    const app = readFileSync(
      join(SOURCE_ROOT, "app", "HandballDemoApp.ts"),
      "utf8",
    );
    const effects = readFileSync(
      join(
        SOURCE_ROOT,
        "presentation",
        "fx",
        "ArcadeEffects.ts",
      ),
      "utf8",
    );
    const audio = readFileSync(
      join(SOURCE_ROOT, "audio", "SynthAudio.ts"),
      "utf8",
    );
    const hud = readFileSync(
      join(SOURCE_ROOT, "ui", "GameHud.ts"),
      "utf8",
    );

    expect(app).toContain('this.events.on("shotReleased"');
    expect(app).toContain('this.events.on("outcome"');
    expect(app.indexOf("resolveMatchShot(")).toBeLessThan(
      app.indexOf('this.events.emit("outcome"'),
    );
    expect(effects).toContain("export const ARCADE_FX_LIMITS");
    expect(effects).toContain('"ownsScoring"] = false');
    expect(effects).toContain("this.root.visible = false");
    expect(effects).not.toContain("new THREE.PointsMaterial");
    expect(effects).not.toContain("resolveShotOutcome");
    expect(effects).not.toContain("resolveMatchShot");
    expect(audio).toContain("context.createOscillator()");
    expect(audio).toContain("context.createBuffer(");
    expect(audio).not.toContain("AudioLoader");
    expect(hud).toContain('id="toggle-audio"');
    expect(hud).toContain('id="toggle-motion"');
    expect(hud).toContain("NOVA AEGIS");
    expect(hud).toContain("VOLT UNION");
    expect(hud).toContain("AURORA FORUM");
    expect(app).not.toContain("trailHoldSeconds");
    expect(app).toContain("this.hud.clearTrail();");
    expect(app.indexOf("this.hud.clearTrail();", app.indexOf("private acceptGesture")))
      .toBeLessThan(
        app.indexOf(
          'this.events.emit("shotReleased"',
          app.indexOf("private acceptGesture"),
        ),
      );
  });

  it("keeps desktop playtests on Chromium's native mouse-to-PointerEvent path", () => {
    const pointerHelper = readFileSync(
      join(APP_ROOT, "tests", "e2e", "pointerGestures.ts"),
      "utf8",
    );
    const functionalPlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "functional.spec.ts"),
      "utf8",
    );
    const capturePlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "capture.spec.ts"),
      "utf8",
    );
    const playwrightConfig = readFileSync(
      join(APP_ROOT, "playwright.config.ts"),
      "utf8",
    );
    const gestureDefaults = readFileSync(
      join(SOURCE_ROOT, "config", "defaults.ts"),
      "utf8",
    );

    expect(pointerHelper).toContain(
      "// Setup positioning is outside the measured gesture.",
    );
    expect(pointerHelper).toContain(
      'client.send("Input.dispatchMouseEvent"',
    );
    expect(pointerHelper).toContain(
      'client.send("Input.dispatchTouchEvent"',
    );
    expect(pointerHelper).toContain(
      "await hostDelay(holdMilliseconds)",
    );
    expect(pointerHelper).toContain(
      "const NATIVE_HOLD_MILLISECONDS = 80",
    );
    expect(pointerHelper).toContain(
      "const MAXIMUM_CONFIGURABLE_HOLD_MILLISECONDS = 220",
    );
    expect(pointerHelper).toContain("resolveNativeHoldMilliseconds");
    expect(pointerHelper).toContain("const NATIVE_MOVE_COUNT = 1");
    expect(pointerHelper).toContain(
      "await Promise.all(pendingNativeEvents)",
    );
    expect(pointerHelper).not.toContain("await client.send(");
    expect(pointerHelper).toContain(
      "durationMilliseconds > MAXIMUM_DURATION_MS",
    );
    expect(pointerHelper).not.toContain("Promise.all(commands)");
    expect(pointerHelper).not.toContain("page.waitForTimeout(");
    expect(pointerHelper).not.toContain(
      "page.mouse.move(endX, endY, { steps:",
    );
    expect(pointerHelper).not.toContain("timestamp:");
    expect(pointerHelper).toContain(
      "return validatePointerTrace(\n    collected.trace,",
    );
    expect(pointerHelper).toContain(
      "window.__DEMO__?.snapshot().lastGestureRejectionReason",
    );
    expect(pointerHelper).toContain("__HANDBALL_PRESENTED_FRAMES__");
    expect(pointerHelper).toContain(
      "requirePresentedFrame && renderFramesDuringGesture < 1",
    );
    expect(pointerHelper).toContain("options.requirePresentedFrame");
    expect(pointerHelper).toContain('"Input.dispatchTouchEvent"');
    expect(pointerHelper).not.toContain("acceptGesture");
    expect(pointerHelper).not.toContain("resolveMatchShot");
    expect(pointerHelper).toContain("resolvePowerSaturationAnchor(box, endX)");
    expect(functionalPlaytest).toContain("dispatchMouseSwipe,");
    expect(functionalPlaytest).toContain('} from "./pointerGestures"');
    expect(capturePlaytest).toContain(
      'import { dispatchMouseSwipe } from "./pointerGestures"',
    );
    expect(playwrightConfig).toContain('name: "functional"');
    expect(playwrightConfig).toContain("workers: 1");
    expect(playwrightConfig).toContain(
      "viewport: { width: 960, height: 540 }",
    );
    expect(playwrightConfig).toContain('trace: "off"');
    const captureGestureViewport = capturePlaytest.indexOf(
      "? { width: 960, height: 540 }",
    );
    expect(captureGestureViewport).toBeGreaterThanOrEqual(0);
    expect(capturePlaytest).toContain("await driveRequiredState(page, sceneName)");
    expect(capturePlaytest).toContain(
      "saturatePower: true",
    );
    expect(
      capturePlaytest.match(
        /saturatePower: true/g,
      ),
    ).toHaveLength(2);
    expect(capturePlaytest).toContain(
      "expect(accepted?.activeShot?.power).toBe(1)",
    );
    expect(
      capturePlaytest.match(
        /expect\(accepted\?\.activeShot\?\.power\)\.toBe\(1\)/g,
      ),
    ).toHaveLength(2);
    expect(capturePlaytest).toContain("const png = await page.screenshot()");
    expect(gestureDefaults).toContain("maximumSampleGapSeconds: 0.25");
    expect(gestureDefaults).toContain("minimumDurationSeconds: 0.03");
  });

  it("keeps balanced as the default, high opt-in, and capture fixed-frame only", () => {
    const quality = readFileSync(
      join(SOURCE_ROOT, "core", "Quality.ts"),
      "utf8",
    );
    const app = readFileSync(
      join(SOURCE_ROOT, "app", "HandballDemoApp.ts"),
      "utf8",
    );
    const main = readFileSync(join(SOURCE_ROOT, "main.ts"), "utf8");

    expect(quality).toContain(
      'export type QualityPreset = "balanced" | "high" | "capture"',
    );
    expect(quality).toContain('queryValue === "high" ? "high" : "balanced"');
    expect(quality).toContain('return "capture"');
    expect(app).toContain('options.quality ?? "balanced"');
    expect(app).toContain(
      'this.quality === "capture" && !this.manualTime',
    );
    expect(app).toContain(
      'root.dataset.runtimeMode = this.manualTime ? "capture" : "gameplay"',
    );
    expect(main).toContain("resolveQualityPreset(");
    expect(main).toContain('captureMode ? "capture" : "gameplay"');
    expect(main).not.toContain('? "high"\n      : "medium"');
  });

  it("keeps crowd animation bounded, distant rows static, and every instanced mesh cullable", () => {
    const crowd = readFileSync(
      join(SOURCE_ROOT, "presentation", "crowd", "ProceduralCrowd.ts"),
      "utf8",
    );

    expect(crowd).toContain("this.heroMembers.slice(0,");
    expect(crowd).toContain("this.heroMembers.slice(config.animatedInstanceMaximum)");
    expect(crowd).toContain('mesh.userData["crowdMotion"] = "static"');
    expect(crowd).toContain('mesh.userData["crowdMotion"] = "animated"');
    expect(crowd).toContain("1 / this.animationMaximumHz");
    expect(crowd).toContain("this.animatedMembers.length");
    expect(crowd).toContain("this.animatedScarfMembers.length");
    expect(crowd).toContain("distantRowsStatic: true");
    expect(crowd).toContain("mesh.frustumCulled = true");
    expect(crowd).not.toContain("mesh.frustumCulled = false");
    expect(crowd).toContain("mesh.computeBoundingBox()");
    expect(crowd).toContain("mesh.computeBoundingSphere()");
    expect(crowd).toContain("mesh.instanceMatrix.addUpdateRange(");
    const updateStart = crowd.indexOf(
      "public update(simulationSeconds: number)",
    );
    const diagnosticsStart = crowd.indexOf(
      "public diagnostics()",
      updateStart,
    );
    const updateBody = crowd.slice(updateStart, diagnosticsStart);
    expect(updateBody).not.toContain("this.distantMembers");
    expect(updateBody).not.toContain("this.distantBodies");
    expect(updateBody).not.toContain("this.distantHeads");
  });

  it("keeps one shadow-casting light, bounded generated textures, and no input-time suspension", () => {
    const scene = readFileSync(
      join(SOURCE_ROOT, "presentation", "GameplayScene.ts"),
      "utf8",
    );
    const materials = readFileSync(
      join(
        SOURCE_ROOT,
        "presentation",
        "materials",
        "ProceduralMaterials.ts",
      ),
      "utf8",
    );
    const engine = readFileSync(
      join(SOURCE_ROOT, "core", "Engine.ts"),
      "utf8",
    );
    const staticLayerCache = readFileSync(
      join(
        SOURCE_ROOT,
        "presentation",
        "cache",
        "LockedStaticLayerCache.ts",
      ),
      "utf8",
    );

    expect(scene).toContain(
      "key.castShadow = quality.shadowCastingKeyLight",
    );
    expect(scene).toContain(
      "this.renderer.shadowMap.enabled = quality.shadowCastingKeyLight",
    );
    expect(scene).toContain("fill.castShadow = false");
    expect(scene).toContain("shooterRim.castShadow = false");
    expect(scene).toContain("goalkeeperRim.castShadow = false");
    expect(scene).not.toContain("balancedShooterRim");
    expect(scene).not.toContain("balancedKeeperRim");
    expect(scene).toContain('quality.name !== "balanced"');
    expect(scene).toContain('quality.name === "capture"');
    expect(scene).toContain("new THREE.MeshLambertMaterial({");
    expect(scene).toContain("new THREE.MeshBasicMaterial({");
    expect(scene).toContain("new THREE.InstancedMesh(\n        stripeGeometry");
    expect(scene).toContain('quality.name === "capture" ? "pbr" : "albedo"');
    expect(scene).toContain("private readonly disposables = new Set<");
    expect(scene).toContain("this.disposables.add(resource)");
    expect(scene).not.toContain("this.disposables.push(");
    expect(scene).toContain(
      "this.collectStaticLayerObjects(() => this.addCourt())",
    );
    expect(scene).toContain(
      "this.collectStaticLayerObjects(() => this.addArenaBackdrop())",
    );
    expect(scene).toContain(
      "preservesGoalKeeperOcclusion:",
    );
    expect(scene).toContain("this.scene.background = null");
    expect(scene).toContain("this.scene.background = background");
    expect(staticLayerCache).toContain("renderer.clearDepth()");
    expect(staticLayerCache).toContain("toneMapped: false");
    expect(staticLayerCache).toContain(
      "this.widthPixels === width",
    );
    expect(staticLayerCache).toContain(
      "this.quality === quality",
    );
    expect(staticLayerCache).toContain("this.renderTarget.dispose()");
    expect(staticLayerCache).toContain(
      "orphanedRenderTargets:",
    );
    expect(materials).toContain(
      "this.maximumResolution / requestedLargestEdge",
    );
    expect(materials).not.toContain("Math.min(512, baseResolution * 2)");
    expect(engine).toContain("this.presentationFrame");
    expect(engine).toContain("this.options.onPresent?.(0)");
    expect(engine).not.toMatch(
      /setSuspended|suspendRendering|renderingSuspended/,
    );
  });

  it("preserves coalesced hardware samples and exposes exact rejection diagnostics", () => {
    const input = readFileSync(
      join(SOURCE_ROOT, "input", "PointerGestureInput.ts"),
      "utf8",
    );
    const app = readFileSync(
      join(SOURCE_ROOT, "app", "HandballDemoApp.ts"),
      "utf8",
    );
    const pointerHarness = readFileSync(
      join(APP_ROOT, "tests", "e2e", "pointerGestures.ts"),
      "utf8",
    );

    expect(input).toContain("event.getCoalescedEvents()");
    expect(input).toContain(
      "coalesced.length > 0 ? coalesced : [event]",
    );
    expect(input).not.toContain("[...coalesced, event]");
    expect(app).toContain("lastGestureRejectionReason");
    expect(app).toContain("this.lastGestureRejectionReason = reason");
    expect(pointerHarness).toContain("productionRejectionReason");
    expect(pointerHarness).toContain(
      "window.__DEMO__?.snapshot().lastGestureRejectionReason",
    );
    expect(pointerHarness).toContain("rawEvents: trace");
    expect(pointerHarness).toContain(
      "rawEvents: Object.freeze([...trace])",
    );
    expect(input).toContain(
      'canvas.addEventListener("pointercancel", this.onPointerCancel)',
    );
    expect(input).not.toContain(
      'canvas.addEventListener("lostpointercapture"',
    );
  });

  it("publishes all balanced/high/capture profile and promotional capture entrypoints", () => {
    const packageJson = JSON.parse(
      readFileSync(join(APP_ROOT, "package.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    const profile = readFileSync(
      join(APP_ROOT, "tests", "e2e", "profile.spec.ts"),
      "utf8",
    );
    const capture = readFileSync(
      join(APP_ROOT, "tests", "e2e", "capture.spec.ts"),
      "utf8",
    );

    expect(packageJson.scripts).toMatchObject({
      "profile:balanced":
        "DEMO_PROFILE_PRESET=balanced playwright test --project=profile",
      "profile:high":
        "DEMO_PROFILE_PRESET=high playwright test --project=profile",
      "profile:capture":
        "DEMO_PROFILE_PRESET=capture playwright test --project=profile",
      "profile:all":
        "npm run profile:balanced && npm run profile:high && npm run profile:capture",
      "validate:browser":
        "npm run test:e2e && npm run capture && npm run profile:all",
      validate: "npm run validate:static && npm run validate:browser",
    });
    expect(profile).toContain("artifacts/profiles/balanced-gameplay.json");
    expect(profile).toContain("artifacts/profiles/high-gameplay.json");
    expect(profile).toContain("artifacts/profiles/capture-scene.json");
    expect(profile).toContain("maximumObservedSampleGapMilliseconds");
    expect(profile).toContain("renderFramesDuringGesture");
    expect(profile).toContain("medianFrameMilliseconds");
    expect(profile).toContain("p95FrameMilliseconds");
    expect(profile).toContain("p99FrameMilliseconds");
    expect(profile).toContain("worstFrameMilliseconds");
    expect(profile).toContain("shadowMapSizeMaximum");
    expect(profile).toContain("environmentMapSizeMaximum");
    expect(profile).toContain("shadowCastingLightsMaximum");
    expect(profile).toContain("postProcessingAllowed");
    expect(profile).toContain("productionRejectionReason");
    expect(profile).toContain(
      "const MEASUREMENT_VIEWPORT = Object.freeze({ width: 1920, height: 1080 })",
    );
    const profileInputViewport = profile.indexOf(
      "await page.setViewportSize(MEASUREMENT_VIEWPORT)",
    );
    const profileMouseGesture = profile.indexOf(
      "const mouseEvidence = await dispatchMouseSwipe(page",
    );
    const profileMeasurementViewport = profile.indexOf(
      "const warmup = await warmActivePresentation(page)",
    );
    expect(profileInputViewport).toBeGreaterThanOrEqual(0);
    expect(profileMouseGesture).toBeGreaterThan(profileInputViewport);
    expect(profileMeasurementViewport).toBeGreaterThan(profileInputViewport);
    expect(profileMeasurementViewport).toBeLessThan(profileMouseGesture);
    expect(profile).toContain(
      'measurementSource: "real_pointer_active_gameplay_after_warmup"',
    );
    expect(capture).toContain(
      '"hero-promo": "hero-promo-capture-1920x1080.png"',
    );
    expect(capture).toContain('"hero-promo"');
    expect(capture).toContain("return apply(name)");
  });

  it("keeps one camera and one balanced resize listener on the real app lifecycle", () => {
    const app = readFileSync(
      join(SOURCE_ROOT, "app", "HandballDemoApp.ts"),
      "utf8",
    );
    const scene = readFileSync(
      join(SOURCE_ROOT, "presentation", "GameplayScene.ts"),
      "utf8",
    );
    const main = readFileSync(join(SOURCE_ROOT, "main.ts"), "utf8");
    const capturePlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "capture.spec.ts"),
      "utf8",
    );

    expect(app.match(/window\.addEventListener\("resize"/g)).toHaveLength(1);
    expect(app.match(/window\.removeEventListener\("resize"/g)).toHaveLength(1);
    expect(app).toContain("Duplicate gameplay resize listener registration.");
    expect(scene.match(/new LockedCameraRig\(\)/g)).toHaveLength(1);
    expect(main).toContain("window.__CAPTURE_SCENES__ = CAPTURE_SCENES");
    expect(main).toContain("app.applyCaptureScene(name)");
    expect(capturePlaytest).toContain("return apply(name)");
    expect(
      capturePlaytest.indexOf("await driveRequiredState(page, sceneName)"),
    ).toBeLessThan(
      capturePlaytest.indexOf("const snapshot = await page.evaluate"),
    );
  });
  it("uses longer native holds only for dedicated renderer-observation paths", () => {
    const pointerHelper = readFileSync(
      join(APP_ROOT, "tests", "e2e", "pointerGestures.ts"),
      "utf8",
    );
    const qaPlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "qa.spec.ts"),
      "utf8",
    );
    const configuredHolds = filesUnder(join(APP_ROOT, "tests", "e2e"))
      .filter((path) => path.endsWith(".spec.ts"))
      .flatMap((path) =>
        [...readFileSync(path, "utf8").matchAll(/holdMilliseconds:\s*(\d+)/g)]
          .map((match) => ({
            path: relative(APP_ROOT, path),
            milliseconds: Number(match[1]),
          })),
      );
    expect(pointerHelper).toContain(
      "const NATIVE_HOLD_MILLISECONDS = 80",
    );
    expect(pointerHelper).toContain(
      "MAXIMUM_CONFIGURABLE_HOLD_MILLISECONDS = 220",
    );
    expect(pointerHelper).toContain("options.holdMilliseconds");
    expect(configuredHolds).toEqual([
      {
        path: join("tests", "e2e", "profile.spec.ts"),
        milliseconds: 180,
      },
      {
        path: join("tests", "e2e", "profile.spec.ts"),
        milliseconds: 180,
      },
      {
        path: join("tests", "e2e", "qa.spec.ts"),
        milliseconds: 180,
      },
    ]);
    expect(qaPlaytest).toContain("holdMilliseconds: 180");
    expect(qaPlaytest).toContain("requirePresentedFrame: true");
    expect(qaPlaytest).toContain("evidence.renderFramesDuringGesture");
  });

  it("separates gameplay semantics from dedicated frame-coexistence evidence", () => {
    const pointerHelper = readFileSync(
      join(APP_ROOT, "tests", "e2e", "pointerGestures.ts"),
      "utf8",
    );
    const functionalPlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "functional.spec.ts"),
      "utf8",
    );
    const profilePlaytest = readFileSync(
      join(APP_ROOT, "tests", "e2e", "profile.spec.ts"),
      "utf8",
    );

    expect(pointerHelper).toContain(
      "readonly requirePresentedFrame?: boolean",
    );
    expect(pointerHelper).toContain(
      "requirePresentedFrame && renderFramesDuringGesture < 1",
    );
    expect(functionalPlaytest).toContain(
      "presentationRequirementApplied).toBe(false)",
    );
    expect(profilePlaytest).toContain("requirePresentedFrame: true");
    expect(profilePlaytest).toContain("holdMilliseconds: 180");
  });

});
