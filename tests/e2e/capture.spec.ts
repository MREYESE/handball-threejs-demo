import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, resolve } from "node:path";
import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  captureSceneDefinition,
  type CaptureSceneName,
} from "../../src/dev/CaptureScenes";
import {
  compareExactPng,
  comparePngFile,
  shouldWritePngBaseline,
  writePng,
} from "./imageDiff";
import { dispatchMouseSwipe } from "./pointerGestures";
import {
  auditProductionRequests,
  expectNoRuntimeErrors,
  observeRuntime,
} from "./runtimeObservation";

const ARTIFACTS_ROOT = resolve(process.cwd(), "artifacts");
const CAPTURE_ROOT = resolve(ARTIFACTS_ROOT, "captures");
const BASELINE_ROOT = resolve(ARTIFACTS_ROOT, "baselines");
const DIFF_ROOT = resolve(ARTIFACTS_ROOT, "diffs");
const UPDATE_BASELINES = process.env["DEMO_UPDATE_BASELINES"] === "1";
const CAPTURE_HARNESS_REVISION = 2;

const OUTPUT_NAMES: Readonly<Record<CaptureSceneName, string>> = Object.freeze({
  "hero-ready": "hero-ready-1920x1080.png",
  "hero-release": "hero-release-1920x1080.png",
  "hero-ball-flight": "hero-ball-flight-1920x1080.png",
  "hero-promo": "hero-promo-capture-1920x1080.png",
  "hero-goal": "hero-goal-1920x1080.png",
  "hero-save-high": "hero-save-high-1920x1080.png",
  "hero-miss": "hero-miss-1920x1080.png",
  "mobile-ready": "mobile-ready-844x390.png",
  "round-complete": "round-complete-1920x1080.png",
});

const REQUIRED_SCENES = [
  "hero-ready",
  "hero-release",
  "hero-ball-flight",
  "hero-promo",
  "hero-goal",
  "hero-save-high",
  "hero-miss",
  "mobile-ready",
  "round-complete",
] as const satisfies readonly CaptureSceneName[];

test.describe("isolated deterministic fixed-frame captures", () => {
  test.beforeAll(() => {
    mkdirSync(CAPTURE_ROOT, { recursive: true });
    mkdirSync(BASELINE_ROOT, { recursive: true });
    mkdirSync(DIFF_ROOT, { recursive: true });
  });

  for (const sceneName of REQUIRED_SCENES) {
    test(`${sceneName} is reproducible through the real app path`, async ({
      browser,
    }) => {
      const first = await renderSceneInIsolatedPage(browser, sceneName);
      const second = await renderSceneInIsolatedPage(browser, sceneName);
      const outputPath = resolve(CAPTURE_ROOT, OUTPUT_NAMES[sceneName]);
      const baselinePath = resolve(BASELINE_ROOT, OUTPUT_NAMES[sceneName]);
      const repeatPath = resolve(
        DIFF_ROOT,
        `${basename(OUTPUT_NAMES[sceneName], ".png")}-repeat.png`,
      );
      const reportPath = resolve(DIFF_ROOT, `${sceneName}.json`);

      writePng(outputPath, first.png);
      const repeatDiff = compareExactPng(first.png, second.png);
      if (!repeatDiff.matches) {
        writePng(repeatPath, second.png);
      }

      const baselineExisted = existsSync(baselinePath);
      const priorBaselineCreatedByFailedRepeat =
        baselineExisted &&
        wasBaselineCreatedByFailedRepeat(reportPath);
      const baselineRequiresHarnessMigration =
        baselineExisted &&
        wasBaselineCreatedByObsoleteHarness(reportPath);
      const baselineWritten = shouldWritePngBaseline({
        baselineExists: baselineExisted,
        explicitUpdate: UPDATE_BASELINES,
        currentRepeatMatches: repeatDiff.matches,
        priorBaselineCreatedByFailedRepeat,
        baselineRequiresHarnessMigration,
      });
      if (baselineWritten) {
        writePng(baselinePath, first.png);
      }
      const baselineDiff = existsSync(baselinePath)
        ? comparePngFile(baselinePath, first.png)
        : null;
      const report = {
        schemaVersion: 1,
        captureHarnessRevision: CAPTURE_HARNESS_REVISION,
        scene: sceneName,
        output: outputPath,
        baseline: baselinePath,
        baselineCreated: baselineWritten && !baselineExisted,
        baselineUpdated:
          baselineWritten && baselineExisted && UPDATE_BASELINES,
        baselineRecoveredFromFailedRepeat:
          baselineWritten &&
          baselineExisted &&
          priorBaselineCreatedByFailedRepeat,
        baselineMigratedToCurrentHarness:
          baselineWritten &&
          baselineExisted &&
          baselineRequiresHarnessMigration,
        comparison: "exact_lossless_png_bytes",
        isolatedPageRepeat: repeatDiff,
        baselineDiff,
        deterministicState: {
          first: deterministicCaptureState(first.snapshot),
          second: deterministicCaptureState(second.snapshot),
        },
        requestPaths: first.requestPaths,
      } as const;
      writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

      expect(deterministicCaptureState(second.snapshot)).toEqual(
        deterministicCaptureState(first.snapshot),
      );
      expect(
        repeatDiff,
        `Fresh isolated pages rendered different PNGs. See ${reportPath}.`,
      ).toMatchObject({ matches: true, differingBytes: 0 });
      expect(
        baselineDiff,
        `Capture differs from its deterministic baseline. ` +
          `Use DEMO_UPDATE_BASELINES=1 only for an intentional reviewed visual change. ` +
          `See ${reportPath}.`,
      ).not.toBeNull();
      expect(baselineDiff).toMatchObject({
        matches: true,
        differingBytes: 0,
      });
      expect(first.snapshot.scene.finiteTransforms).toBe(true);
      expect(first.snapshot.scene.prewarmComplete).toBe(true);
      expect(
        first.snapshot.scene.shaderProgramsStableSincePrewarm,
      ).toBe(true);
    });
  }
});

async function renderSceneInIsolatedPage(
  browser: Browser,
  sceneName: CaptureSceneName,
) {
  const definition = captureSceneDefinition(sceneName);
  const requiresPointerState = definition.requirement !== "READY";
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    viewport: requiresPointerState
      ? { width: 960, height: 540 }
      : definition.viewport,
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  const observation = observeRuntime(page);

  try {
    await page.goto(
      `/?capture&seed=${definition.seed}&quality=${definition.quality}`,
    );
    await page.waitForFunction(() => window.__READY__ === true);
    await driveRequiredState(page, sceneName);
    await page.setViewportSize(definition.viewport);
    const snapshot = await page.evaluate((name) => {
      const apply = window.__APPLY_CAPTURE_SCENE__;
      if (apply === undefined) {
        throw new Error("Deterministic capture hook is unavailable.");
      }
      return apply(name);
    }, sceneName);

    expect(snapshot.quality).toBe(definition.quality);
    expect(snapshot.sessionSeed).toBe(definition.seed);
    expect(snapshot.scene.cameraCount).toBe(1);
    expect(snapshot.resizeListenerCount).toBe(1);
    expect(snapshot.scene.goalProjection.fullyVisible).toBe(true);
    expect(snapshot.scene.goalCentered).toBe(true);
    expect(snapshot.scene.shooterLeftForeground).toBe(true);
    expect(snapshot.scene.renderCalls).toBeGreaterThan(0);
    expect(snapshot.scene.renderedTriangles).toBeGreaterThan(0);
    expect(snapshot.scene.staticLayerCache).toMatchObject({
      enabled: true,
      valid: true,
      activeRenderTargets: 1,
      orphanedRenderTargets: 0,
      preservesGoalKeeperOcclusion: true,
    });

    if (
      sceneName === "hero-release" ||
      sceneName === "hero-ball-flight" ||
      sceneName === "hero-promo"
    ) {
      expect(snapshot.activeShot?.resolved).toBe(false);
      expect(snapshot.scene.ballProjection.visible).toBe(true);
      expect(snapshot.scene.ballPathPointCount).toBeGreaterThanOrEqual(2);
      expect(snapshot.scene.arcadeFx.phase).toBe("FLIGHT");
      await expect(page.locator(".swipe-trail")).not.toHaveClass(
        /is-active/,
      );
    }
    if (sceneName === "hero-save-high") {
      expect(snapshot.activeShot).toMatchObject({
        keeperZone: "high-center",
        resolved: true,
        ball: {
          contactHistory: [{ kind: "KEEPER", outcome: "SAVED" }],
          terminalState: "SAVED",
        },
      });
      expect(snapshot.scene.goalkeeperPoseName).toContain(
        "high-center-impact",
      );
      expect(snapshot.scene.goalkeeperReachErrorMeters).toBeLessThanOrEqual(
        0.65,
      );
    }
    if (sceneName === "hero-goal") {
      expect(snapshot.outcomes).toEqual(["GOAL"]);
    }
    if (sceneName === "hero-miss") {
      expect(snapshot.outcomes).toEqual(["MISS"]);
    }
    if (sceneName === "round-complete") {
      expect(snapshot.match.phase).toBe("ROUND_COMPLETE");
      expect(snapshot.match.shotsTaken).toBe(5);
      expect(snapshot.outcomes).toEqual([
        "GOAL",
        "SAVED",
        "MISS",
        "SAVED",
        "MISS",
      ]);
      await expect(page.locator("#round-summary")).toBeVisible();
    }
    if (sceneName === "hero-ball-flight") {
      expect(snapshot.quality).toBe("balanced");
      expect(snapshot.scene.goalProjection.width).toBeGreaterThanOrEqual(
        0.64,
      );
      expect(snapshot.scene.shooterProjection.visibleWidth).toBeGreaterThanOrEqual(
        0.48,
      );
      expect(snapshot.scene.shooterProjection.visibleWidth).toBeLessThanOrEqual(
        0.54,
      );
      expect(snapshot.scene.renderCalls).toBeLessThanOrEqual(180);
      expect(snapshot.scene.renderedTriangles).toBeLessThanOrEqual(750_000);
    }
    if (sceneName === "hero-promo") {
      expect(snapshot.quality).toBe("capture");
      expect(snapshot.scene.crowd.animatedInstances).toBe(0);
      expect(snapshot.scene.crowd.animationMaximumHz).toBe(0);
    }

    const png = await page.screenshot();
    expectNoRuntimeErrors(observation);
    const requestPaths = auditProductionRequests(observation.requests);
    return { png, snapshot, requestPaths };
  } finally {
    await context.close();
  }
}

async function driveRequiredState(
  page: Page,
  sceneName: CaptureSceneName,
): Promise<void> {
  if (sceneName === "hero-ready" || sceneName === "mobile-ready") {
    return;
  }
  if (sceneName === "round-complete") {
    for (const horizontalAim of [-0.7, 0, 1, 0.7, 1] as const) {
      await dispatchMouseSwipe(page, {
        horizontalAim,
        saturatePower: true,
      });
      const accepted = await page.evaluate(() => window.__DEMO__?.snapshot());
      expect(accepted?.activeShot?.power).toBe(1);
      await pumpUntilShotStops(page);
    }
    return;
  }

  const swipe =
    sceneName === "hero-save-high"
      ? { horizontalAim: 0, verticalAim: 0.72 }
      : sceneName === "hero-miss"
        ? { horizontalAim: 1, verticalAim: 0 }
        : sceneName === "hero-goal"
          ? { horizontalAim: -0.7, verticalAim: 0 }
          : { horizontalAim: 0.42, verticalAim: 0.45 };
  // This remains a native Chromium pointer gesture through the production
  // PointerGestureInput. Routing the move through a distant in-canvas anchor
  // before releasing at the requested endpoint keeps both speed segments
  // above the full-power threshold even at the allowed 250 ms sample gap.
  // The final pointerup still owns target mapping through the production path.
  await dispatchMouseSwipe(page, {
    ...swipe,
    saturatePower: true,
  });
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().acceptedShots === 1,
  );
  const accepted = await page.evaluate(() => window.__DEMO__?.snapshot());
  expect(accepted?.activeShot?.power).toBe(1);
  if (
    sceneName === "hero-goal" ||
    sceneName === "hero-save-high" ||
    sceneName === "hero-miss"
  ) {
    await page.evaluate(() => {
      for (let frame = 0; frame < 90; frame += 1) {
        window.__PUMP__?.(1);
        if (window.__DEMO__?.snapshot().resolvedShots === 1) {
          return;
        }
      }
      throw new Error("The real capture shot did not resolve in 90 frames.");
    });
  }
}

function wasBaselineCreatedByFailedRepeat(reportPath: string): boolean {
  if (!existsSync(reportPath)) {
    return false;
  }
  try {
    const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
      readonly baselineCreated?: unknown;
      readonly isolatedPageRepeat?: {
        readonly matches?: unknown;
      };
    };
    return (
      report.baselineCreated === true &&
      report.isolatedPageRepeat?.matches === false
    );
  } catch {
    return false;
  }
}

function wasBaselineCreatedByObsoleteHarness(reportPath: string): boolean {
  if (!existsSync(reportPath)) {
    return false;
  }
  try {
    const report = JSON.parse(readFileSync(reportPath, "utf8")) as {
      readonly captureHarnessRevision?: unknown;
    };
    return report.captureHarnessRevision !== CAPTURE_HARNESS_REVISION;
  } catch {
    return false;
  }
}

function deterministicCaptureState(
  snapshot: Awaited<ReturnType<typeof renderSceneInIsolatedPage>>["snapshot"],
) {
  return {
    simulationSeconds: snapshot.simulationSeconds,
    acceptedShots: snapshot.acceptedShots,
    resolvedShots: snapshot.resolvedShots,
    outcomes: snapshot.outcomes,
    match: snapshot.match,
    activeShot: snapshot.activeShot,
    lastPointerType: snapshot.lastPointerType,
    shooterPoseName: snapshot.scene.shooterPoseName,
    shooterReleaseAmount: snapshot.scene.shooterReleaseAmount,
    goalkeeperPoseName: snapshot.scene.goalkeeperPoseName,
    goalkeeperDiveAmount: snapshot.scene.goalkeeperDiveAmount,
    goalkeeperZone: snapshot.scene.goalkeeperZone,
    ballProjection: snapshot.scene.ballProjection,
    ballPathPointCount: snapshot.scene.ballPathPointCount,
    arcadeFx: snapshot.scene.arcadeFx,
  } as const;
}

async function pumpUntilShotStops(page: Page): Promise<void> {
  await page.evaluate(() => {
    const startingResolved = window.__DEMO__?.snapshot().resolvedShots ?? 0;
    for (let frame = 0; frame < 120; frame += 1) {
      window.__PUMP__?.(1);
      const snapshot = window.__DEMO__?.snapshot();
      if (
        snapshot !== undefined &&
        snapshot.resolvedShots === startingResolved + 1 &&
        (snapshot.inputEnabled || snapshot.match.phase === "ROUND_COMPLETE")
      ) {
        return;
      }
    }
    throw new Error("The real capture shot did not reach its next state.");
  });
}
