import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  expect,
  test,
  type Browser,
  type Page,
} from "@playwright/test";
import {
  dispatchMouseSwipe,
  dispatchTouchSwipe,
  type PointerGestureEvidence,
} from "./pointerGestures";
import {
  expectNoRuntimeErrors,
  observeRuntime,
} from "./runtimeObservation";

type ProfilePreset = "balanced" | "high" | "capture";

interface PolicyPreset {
  readonly runtimeRole:
    | "default_gameplay"
    | "explicit_opt_in_gameplay"
    | "offline_capture_only";
  readonly maximumPixelRatio: number;
  readonly shadowMapSizeMaximum: number;
  readonly crowdInstancesMaximum: number;
  readonly animatedCrowdInstancesMaximum: number;
  readonly crowdAnimationMaximumHz: number;
  readonly proceduralTextureResolutionMaximum: number;
  readonly environmentMapSizeMaximum: number;
  readonly shadowCastingLightsMaximum: number;
  readonly postProcessing: boolean;
  readonly frustumCullingRequired: boolean;
}

interface QualityPolicy {
  readonly presets: Record<ProfilePreset, PolicyPreset>;
  readonly interaction: Readonly<{
    maximumSampleGapMilliseconds: number;
    renderFramesDuringPointerCaptureMinimum: number;
  }>;
  readonly balancedComplexity: Readonly<{
    drawCallsMaximum: number;
    trianglesMaximum: number;
  }>;
  readonly hardwarePerformanceTargets: Readonly<{
    medianFrameMillisecondsMaximum: number;
    p95FrameMillisecondsMaximum: number;
    p99FrameMillisecondsMaximum: number;
    worstFrameMillisecondsMaximum: number;
    bootToReadyMillisecondsMaximum: number;
  }>;
  readonly softwareRendererPolicy: Readonly<{
    requiredProfileStatus: "unverified_software_renderer";
  }>;
}

const PROFILE_PRESET = profilePresetFromEnvironment();
const POLICY = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "config/quality-policy.json"),
    "utf8",
  ),
) as QualityPolicy;
const PROFILE_PATHS = {
  balanced: "artifacts/profiles/balanced-gameplay.json",
  high: "artifacts/profiles/high-gameplay.json",
  capture: "artifacts/profiles/capture-scene.json",
} as const satisfies Record<ProfilePreset, string>;
const INPUT_VIEWPORT = Object.freeze({ width: 960, height: 540 });
const MEASUREMENT_VIEWPORT = Object.freeze({ width: 1920, height: 1080 });
const WARMUP_PRESENTED_FRAMES = 30;
const MINIMUM_MEASURED_SHOT_SAMPLES = 20;
const EXPECTED_FX_LIMITS = Object.freeze({
  balanced: Object.freeze({
    ribbonPoints: 18,
    speedLines: 6,
    particles: 24,
  }),
  high: Object.freeze({
    ribbonPoints: 24,
    speedLines: 10,
    particles: 36,
  }),
  capture: Object.freeze({
    ribbonPoints: 28,
    speedLines: 12,
    particles: 48,
  }),
});

test(`profiles the real ${PROFILE_PRESET} production path`, async ({
  browser,
  page,
}) => {
  const profile =
    PROFILE_PRESET === "capture"
      ? await captureProfile(page)
      : await interactiveProfile(page, browser, PROFILE_PRESET);

  expect(profile.schemaVersion).toBe(1);
  expect(profile.preset).toBe(PROFILE_PRESET);
  expect(profile.renderer.acceleration).toMatch(
    /^(hardware|software|unknown)$/,
  );
  expect(profile.runtimeMode).toBe(
    PROFILE_PRESET === "capture" ? "capture" : "gameplay",
  );
  expect(profile).toHaveProperty("quality");
  expect(profile).toHaveProperty("input");
  expect(profile).toHaveProperty("performance");
  expect(profile).toHaveProperty("scene");

  mkdirSync(resolve(process.cwd(), "artifacts/profiles"), {
    recursive: true,
  });
  writeFileSync(
    resolve(process.cwd(), PROFILE_PATHS[PROFILE_PRESET]),
    `${JSON.stringify(profile, null, 2)}\n`,
  );
});

async function interactiveProfile(
  page: Page,
  browser: Browser,
  preset: "balanced" | "high",
) {
  const observation = observeRuntime(page);
  await page.setViewportSize(MEASUREMENT_VIEWPORT);
  await page.goto(`/?playtest&seed=1&quality=${preset}`);
  await waitForReady(page);
  const warmup = await warmActivePresentation(page);
  await page.setViewportSize(INPUT_VIEWPORT);

  // The measured window begins only when this real pointer gesture starts the
  // production shot, after material pre-warm and active RAF presentation. The
  // accepted 960x540 native-input strategy isolates pointer timing from a slow
  // software renderer; the active flight is then profiled at 1920x1080.
  const mouseEvidence = await dispatchMouseSwipe(page, {
    horizontalAim: 0,
    verticalAim: -0.35,
    holdMilliseconds: 180,
    requirePresentedFrame: true,
  });
  await page.setViewportSize(MEASUREMENT_VIEWPORT);
  await waitForOneShotReset(page);
  const mouseSnapshot = await demoSnapshot(page);
  const performance = await performanceSnapshot(page);
  const touch = await runTouchShot(browser, preset);
  const policyPreset = POLICY.presets[preset];
  const measured = performance.measuredShot;

  expect(mouseSnapshot.lastPointerType).toBe("mouse");
  expect(mouseSnapshot.acceptedShots).toBe(1);
  expect(mouseSnapshot.resolvedShots).toBe(1);
  expect(mouseEvidence.productionRejectionReason).toBeNull();
  expect(touch.snapshot.lastPointerType).toBe("touch");
  expect(touch.snapshot.acceptedShots).toBe(1);
  expect(touch.snapshot.resolvedShots).toBe(1);
  expect(touch.evidence.productionRejectionReason).toBeNull();
  expect(mouseEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(
    POLICY.interaction.renderFramesDuringPointerCaptureMinimum,
  );
  expect(touch.evidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(
    POLICY.interaction.renderFramesDuringPointerCaptureMinimum,
  );
  expect(
    Math.max(
      mouseEvidence.maximumSampleGapMilliseconds,
      touch.evidence.maximumSampleGapMilliseconds,
    ),
  ).toBeLessThanOrEqual(POLICY.interaction.maximumSampleGapMilliseconds);
  expect(performance.selectedQuality.maximumPixelRatio).toBe(
    policyPreset.maximumPixelRatio,
  );
  expect(performance.appliedPixelRatio).toBeLessThanOrEqual(
    policyPreset.maximumPixelRatio,
  );
  expect(mouseSnapshot.scene.shadowMapSize).toBeLessThanOrEqual(
    policyPreset.shadowMapSizeMaximum,
  );
  expect(performance.selectedQuality.crowdInstances).toBeLessThanOrEqual(
    policyPreset.crowdInstancesMaximum,
  );
  expect(performance.animatedCrowdInstances).toBeLessThanOrEqual(
    policyPreset.animatedCrowdInstancesMaximum,
  );
  expect(mouseSnapshot.scene.crowd.animationMaximumHz).toBeLessThanOrEqual(
    policyPreset.crowdAnimationMaximumHz,
  );
  expect(
    mouseSnapshot.scene.proceduralMaterials.largestTextureEdge,
  ).toBeLessThanOrEqual(
    policyPreset.proceduralTextureResolutionMaximum,
  );
  expect(mouseSnapshot.scene.environmentMapSize).toBeLessThanOrEqual(
    policyPreset.environmentMapSizeMaximum,
  );
  expect(mouseSnapshot.scene.shadowCastingLights).toBeLessThanOrEqual(
    policyPreset.shadowCastingLightsMaximum,
  );
  if (!policyPreset.postProcessing) {
    expect(mouseSnapshot.scene.postProcessing).toBe(false);
  }
  expect(mouseSnapshot.scene.crowd.distantRowsStatic).toBe(true);
  expect(performance.selectedQuality.frustumCullingRequired).toBe(
    policyPreset.frustumCullingRequired,
  );
  expect(mouseSnapshot.scene.crowd.unboundedCullingMeshes).toBe(0);
  expect(mouseSnapshot.scene.staticLayerCache).toMatchObject({
    enabled: true,
    valid: true,
    quality: preset,
    activeRenderTargets: 1,
    orphanedRenderTargets: 0,
    preservesGoalKeeperOcclusion: true,
  });
  expect(
    mouseSnapshot.scene.staticLayerCache.rebuildCount,
  ).toBeGreaterThanOrEqual(2);
  expect(mouseSnapshot.scene.arcadeFx.limits).toEqual(
    EXPECTED_FX_LIMITS[preset],
  );
  expect(mouseSnapshot.scene.arcadeFx.releaseBursts).toBe(1);
  expect(mouseSnapshot.scene.arcadeFx.impactBursts).toBe(1);
  expect(
    mouseSnapshot.scene.arcadeFx.resultEffectsStartedAfterOutcome,
  ).toBe(true);
  expect(mouseSnapshot.feedback.audio.requestedCues).toMatchObject({
    throw: 1,
    flight: 1,
    crowd: 1,
  });
  // SwiftShader can legitimately present exactly twenty frames across the
  // complete measured shot. Keep a bounded evidence floor without turning a
  // one-frame scheduling difference into a performance-budget failure.
  expect(measured.sampleCount).toBeGreaterThanOrEqual(
    MINIMUM_MEASURED_SHOT_SAMPLES,
  );
  expect(measured.shaderProgramsStable).toBe(true);
  expect(performance.prewarmComplete).toBe(true);
  expect(performance.inputActivatedAfterPrewarm).toBe(true);
  expect(performance.prewarmedShaderPrograms).toBeGreaterThan(0);
  expect(measured.shaderProgramsAtShotStart).toBe(
    performance.prewarmedShaderPrograms,
  );
  expect(measured.shaderProgramDelta).toBe(0);
  expect(mouseSnapshot.scene.finiteTransforms).toBe(true);
  expectNoRuntimeErrors(observation);
  expect(touch.errors).toEqual([]);

  if (preset === "balanced") {
    expect(performance.crowdInstances).toBeGreaterThanOrEqual(160);
    expect(measured.maximumDrawCalls).toBeLessThanOrEqual(
      POLICY.balancedComplexity.drawCallsMaximum,
    );
    expect(measured.maximumTriangles).toBeLessThanOrEqual(
      POLICY.balancedComplexity.trianglesMaximum,
    );
  }

  const acceleration = performance.renderer.acceleration;
  const status =
    acceleration === "hardware"
      ? "passed"
      : POLICY.softwareRendererPolicy.requiredProfileStatus;
  const profile = {
    schemaVersion: 1,
    preset,
    runtimeMode: "gameplay",
    renderer: performance.renderer,
    quality: qualityEvidence(performance, mouseSnapshot),
    input: {
      viewport: INPUT_VIEWPORT,
      mousePassed: true,
      touchPassed: true,
      maximumObservedSampleGapMilliseconds: Math.max(
        mouseEvidence.maximumSampleGapMilliseconds,
        touch.evidence.maximumSampleGapMilliseconds,
      ),
      renderFramesDuringGesture: Math.min(
        mouseEvidence.renderFramesDuringGesture,
        touch.evidence.renderFramesDuringGesture,
      ),
      mouse: pointerResult(mouseEvidence, mouseSnapshot.outcomes[0] ?? null),
      touch: pointerResult(
        touch.evidence,
        touch.snapshot.outcomes[0] ?? null,
      ),
    },
    performance: {
      viewport: MEASUREMENT_VIEWPORT,
      status,
      measurementSource: "real_pointer_active_gameplay_after_warmup",
      warmup,
      p50FrameMilliseconds: measured.p50FrameMilliseconds,
      medianFrameMilliseconds: measured.medianFrameMilliseconds,
      p95FrameMilliseconds: measured.p95FrameMilliseconds,
      p99FrameMilliseconds: measured.p99FrameMilliseconds,
      worstFrameMilliseconds: measured.worstFrameMilliseconds,
      bootToReadyMilliseconds: performance.bootTimeMilliseconds,
      renderCpuMeanMilliseconds: measured.meanRenderCpuMilliseconds,
      renderCpuWorstMilliseconds: measured.maximumRenderCpuMilliseconds,
      sampleCount: measured.sampleCount,
    },
    scene: {
      drawCalls: measured.maximumDrawCalls,
      triangles: measured.maximumTriangles,
      shaderPrograms: performance.shaderPrograms,
      prewarmedShaderPrograms: performance.prewarmedShaderPrograms,
      shaderProgramMetrics: {
        atShotStart: measured.shaderProgramsAtShotStart,
        current: measured.shaderProgramsCurrent,
        delta: measured.shaderProgramDelta,
      },
      shaderProgramsStable: measured.shaderProgramsStable,
      shaderPrewarmVerified:
        performance.prewarmComplete &&
        performance.inputActivatedAfterPrewarm &&
        measured.shaderProgramsAtShotStart ===
          performance.prewarmedShaderPrograms &&
        measured.shaderProgramsStable,
      finiteTransforms: mouseSnapshot.scene.finiteTransforms,
      gpuGeometries: mouseSnapshot.scene.gpuGeometries,
      gpuTextures: mouseSnapshot.scene.gpuTextures,
      activeRenderTargets:
        mouseSnapshot.scene.staticLayerCache.activeRenderTargets,
      goalCentered: mouseSnapshot.scene.goalCentered,
      effects: mouseSnapshot.scene.arcadeFx,
      feedback: {
        audio: mouseSnapshot.feedback.audio,
        hud: mouseSnapshot.feedback.hud,
      },
    },
  } as const;

  if (acceleration === "hardware" && preset === "balanced") {
    const targets = POLICY.hardwarePerformanceTargets;
    expect(measured.medianFrameMilliseconds).toBeLessThanOrEqual(
      targets.medianFrameMillisecondsMaximum,
    );
    expect(measured.p95FrameMilliseconds).toBeLessThanOrEqual(
      targets.p95FrameMillisecondsMaximum,
    );
    expect(measured.p99FrameMilliseconds).toBeLessThanOrEqual(
      targets.p99FrameMillisecondsMaximum,
    );
    expect(measured.worstFrameMilliseconds).toBeLessThanOrEqual(
      targets.worstFrameMillisecondsMaximum,
    );
    expect(performance.bootTimeMilliseconds).toBeLessThanOrEqual(
      targets.bootToReadyMillisecondsMaximum,
    );
  }

  return profile;
}

async function captureProfile(page: Page) {
  const observation = observeRuntime(page);
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/?capture&seed=1&quality=capture");
  await waitForReady(page);
  await page.evaluate((frames) => window.__PRESENT__?.(frames), WARMUP_PRESENTED_FRAMES);
  const snapshot = await demoSnapshot(page);
  const performance = await performanceSnapshot(page);
  const policyPreset = POLICY.presets.capture;

  expect(performance.runtimeMode).toBe("capture");
  expect(performance.quality).toBe("capture");
  expect(performance.selectedQuality.maximumPixelRatio).toBe(
    policyPreset.maximumPixelRatio,
  );
  expect(performance.appliedPixelRatio).toBeLessThanOrEqual(
    policyPreset.maximumPixelRatio,
  );
  expect(snapshot.scene.shadowMapSize).toBeLessThanOrEqual(
    policyPreset.shadowMapSizeMaximum,
  );
  expect(performance.crowdInstances).toBeLessThanOrEqual(
    policyPreset.crowdInstancesMaximum,
  );
  expect(performance.animatedCrowdInstances).toBe(0);
  expect(snapshot.scene.crowd.animationMaximumHz).toBe(0);
  expect(snapshot.scene.crowd.animationUpdateCount).toBe(0);
  expect(snapshot.scene.crowd.unboundedCullingMeshes).toBe(0);
  expect(
    snapshot.scene.proceduralMaterials.largestTextureEdge,
  ).toBeLessThanOrEqual(policyPreset.proceduralTextureResolutionMaximum);
  expect(snapshot.scene.shadowCastingLights).toBeLessThanOrEqual(
    policyPreset.shadowCastingLightsMaximum,
  );
  expect(performance.selectedQuality.postProcessingAllowed).toBe(
    policyPreset.postProcessing,
  );
  expect(performance.selectedQuality.frustumCullingRequired).toBe(
    policyPreset.frustumCullingRequired,
  );
  expect(snapshot.scene.staticLayerCache).toMatchObject({
    enabled: true,
    valid: true,
    quality: "capture",
    activeRenderTargets: 1,
    orphanedRenderTargets: 0,
    preservesGoalKeeperOcclusion: true,
  });
  expect(snapshot.scene.arcadeFx.limits).toEqual(
    EXPECTED_FX_LIMITS.capture,
  );
  expect(performance.prewarmComplete).toBe(true);
  expect(performance.prewarmedShaderPrograms).toBeGreaterThan(0);
  expect(snapshot.scene.shaderProgramsStableSincePrewarm).toBe(true);
  expect(snapshot.scene.finiteTransforms).toBe(true);
  expectNoRuntimeErrors(observation);

  return {
    schemaVersion: 1,
    preset: "capture",
    runtimeMode: "capture",
    renderer: performance.renderer,
    quality: qualityEvidence(performance, snapshot),
    input: {
      mousePassed: false,
      touchPassed: false,
      maximumObservedSampleGapMilliseconds: 0,
      renderFramesDuringGesture: 0,
      status: "not_applicable_offline_capture_only",
    },
    performance: {
      status:
        performance.renderer.acceleration === "hardware"
          ? "passed"
          : POLICY.softwareRendererPolicy.requiredProfileStatus,
      bootToReadyMilliseconds: performance.bootTimeMilliseconds,
      fixedFramePresentation: true,
      warmupPresentedFrames: WARMUP_PRESENTED_FRAMES,
      measurementSource: "deterministic_promotional_capture_not_gameplay",
    },
    scene: {
      drawCalls: snapshot.scene.renderCalls,
      triangles: snapshot.scene.renderedTriangles,
      shaderProgramsStable:
        snapshot.scene.shaderProgramsStableSincePrewarm,
      shaderPrograms: performance.shaderPrograms,
      prewarmedShaderPrograms: performance.prewarmedShaderPrograms,
      shaderPrewarmVerified:
        performance.prewarmComplete &&
        snapshot.scene.shaderProgramsStableSincePrewarm,
      finiteTransforms: snapshot.scene.finiteTransforms,
      gpuGeometries: snapshot.scene.gpuGeometries,
      gpuTextures: snapshot.scene.gpuTextures,
      activeRenderTargets:
        snapshot.scene.staticLayerCache.activeRenderTargets,
      goalCentered: snapshot.scene.goalCentered,
      effects: snapshot.scene.arcadeFx,
      feedback: {
        audio: snapshot.feedback.audio,
        hud: snapshot.feedback.hud,
      },
    },
  } as const;
}

async function runTouchShot(
  browser: Browser,
  preset: "balanced" | "high",
): Promise<{
  readonly evidence: PointerGestureEvidence;
  readonly snapshot: Awaited<ReturnType<typeof demoSnapshot>>;
  readonly errors: readonly string[];
}> {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    viewport: MEASUREMENT_VIEWPORT,
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const observation = observeRuntime(page);
  try {
    await page.goto(`/?playtest&seed=1&quality=${preset}`);
    await waitForReady(page);
    await warmActivePresentation(page);
    await page.setViewportSize(INPUT_VIEWPORT);
    const evidence = await dispatchTouchSwipe(page, context, {
      horizontalAim: 0,
      verticalAim: 0,
      holdMilliseconds: 180,
      requirePresentedFrame: true,
    });
    await page.setViewportSize(MEASUREMENT_VIEWPORT);
    await waitForOneShotReset(page);
    return {
      evidence,
      snapshot: await demoSnapshot(page),
      errors: Object.freeze([...observation.errors]),
    };
  } finally {
    await context.close();
  }
}

async function warmActivePresentation(
  page: Page,
): Promise<Readonly<{
  presentedFrames: number;
  prewarmComplete: boolean;
  shaderProgramsStable: boolean;
}>> {
  const before = await demoSnapshot(page);
  const initialFrames = before.scene.presentedFrames;
  await page.waitForFunction(
    ({ start, required }) =>
      (window.__DEMO__?.snapshot().scene.presentedFrames ?? 0) >=
      start + required,
    { start: initialFrames, required: WARMUP_PRESENTED_FRAMES },
  );
  const after = await demoSnapshot(page);
  expect(after.activeShot).toBeNull();
  expect(after.scene.prewarmComplete).toBe(true);
  expect(after.scene.shaderProgramsStableSincePrewarm).toBe(true);
  return Object.freeze({
    presentedFrames: after.scene.presentedFrames - initialFrames,
    prewarmComplete: after.scene.prewarmComplete,
    shaderProgramsStable: after.scene.shaderProgramsStableSincePrewarm,
  });
}

async function waitForReady(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
}

async function waitForOneShotReset(page: Page): Promise<void> {
  await page.waitForFunction(
    () =>
      window.__DEMO__?.snapshot().resolvedShots === 1 &&
      window.__DEMO__?.snapshot().inputEnabled === true,
  );
}

async function demoSnapshot(page: Page) {
  return page.evaluate(() => {
    const demo = window.__DEMO__;
    if (demo === undefined) {
      throw new Error("Demo test API is unavailable.");
    }
    return demo.snapshot();
  });
}

async function performanceSnapshot(page: Page) {
  const snapshot = await page.evaluate(() => window.__PERF_SNAPSHOT__?.());
  if (snapshot === undefined) {
    throw new Error("The production performance hook is unavailable.");
  }
  return snapshot;
}

function pointerResult(
  evidence: PointerGestureEvidence,
  outcome: string | null,
) {
  return {
    passed: true,
    pointerType: evidence.pointerType,
    outcome,
    durationMilliseconds: evidence.durationMilliseconds,
    maximumSampleGapMilliseconds:
      evidence.maximumSampleGapMilliseconds,
    renderFramesDuringGesture: evidence.renderFramesDuringGesture,
    productionRejectionReason: evidence.productionRejectionReason,
  };
}

function qualityEvidence(
  performance: Awaited<ReturnType<typeof performanceSnapshot>>,
  snapshot: Awaited<ReturnType<typeof demoSnapshot>>,
) {
  return {
    runtimeRole: performance.selectedQuality.runtimeRole,
    maximumPixelRatio: performance.maximumPixelRatio,
    appliedPixelRatio: performance.appliedPixelRatio,
    shadowMapSize: snapshot.scene.shadowMapSize,
    shadowMapSizeMaximum:
      performance.selectedQuality.shadowMapSizeMaximum,
    crowdInstances: performance.crowdInstances,
    crowdInstancesMaximum:
      performance.selectedQuality.crowdInstancesMaximum,
    animatedCrowdInstances: performance.animatedCrowdInstances,
    animatedCrowdInstancesMaximum:
      performance.selectedQuality.animatedCrowdInstancesMaximum,
    crowdAnimationMaximumHz:
      snapshot.scene.crowd.animationMaximumHz,
    proceduralTextureResolution:
      snapshot.scene.proceduralMaterials.largestTextureEdge,
    proceduralTextureResolutionMaximum:
      performance.selectedQuality.proceduralTextureResolutionMaximum,
    environmentMapSize: snapshot.scene.environmentMapSize,
    environmentMapSizeMaximum:
      performance.selectedQuality.environmentMapSizeMaximum,
    shadowCastingLights: snapshot.scene.shadowCastingLights,
    shadowCastingLightsMaximum:
      performance.selectedQuality.shadowCastingLightsMaximum,
    postProcessing: snapshot.scene.postProcessing,
    postProcessingAllowed:
      performance.selectedQuality.postProcessingAllowed,
    frustumCullingRequired:
      performance.selectedQuality.frustumCullingRequired,
    boundedCrowdMeshes: snapshot.scene.crowd.boundedCullingMeshes,
    unboundedCrowdMeshes: snapshot.scene.crowd.unboundedCullingMeshes,
    lockedStaticLayerCache: snapshot.scene.staticLayerCache,
  };
}

function profilePresetFromEnvironment(): ProfilePreset {
  const value = process.env["DEMO_PROFILE_PRESET"] ?? "balanced";
  if (value === "balanced" || value === "high" || value === "capture") {
    return value;
  }
  throw new Error(`Unsupported DEMO_PROFILE_PRESET '${value}'.`);
}
