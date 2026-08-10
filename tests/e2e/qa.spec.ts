import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  dispatchMouseSwipe,
  dispatchTouchSwipe,
} from "./pointerGestures";
import {
  auditProductionRequests,
  expectNoRuntimeErrors,
  observeRuntime,
} from "./runtimeObservation";

const AUDIT_ROOT = resolve(process.cwd(), "artifacts/audits");
const RESIZE_TOUCH_FRAME_PHASE_OFFSET_MILLISECONDS = 90;

test.beforeAll(() => {
  mkdirSync(AUDIT_ROOT, { recursive: true });
});

test("audits production requests and runtime errors through a real shot", async ({
  page,
}) => {
  const observation = observeRuntime(page);
  await page.goto("/?playtest&seed=1&quality=balanced");
  await waitForReady(page);
  await dispatchMouseSwipe(page, { horizontalAim: -0.7 });
  await waitForShotReset(page, 1);

  const snapshot = await demoSnapshot(page);
  expect(snapshot.outcomes).toEqual(["GOAL"]);
  expect(snapshot.scene.finiteTransforms).toBe(true);
  expectNoRuntimeErrors(observation);
  const requestPaths = auditProductionRequests(observation.requests);
  const report = {
    schemaVersion: 1,
    entrypoint: "/?playtest&seed=1&quality=balanced",
    terminalState: snapshot.match.phase,
    runtimeRequests: requestPaths,
    externalRequests: [],
    runtimeMediaOrDataRequests: [],
    consoleErrors: observation.errors,
    passed: true,
  } as const;
  writeFileSync(
    resolve(AUDIT_ROOT, "runtime-network-audit.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
});

test("touch emulation remains finite and playable across landscape resize", async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 844, height: 390 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const observation = observeRuntime(page);
  try {
    await page.goto("/?playtest&seed=1&quality=balanced");
    await waitForReady(page);
    const presentedFramesBeforeResize = await presentedFrameCount(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    // Keep resize work outside the measured gesture. The production renderer
    // must present the resized canvas before this case's bounded 180 ms native
    // touch observation begins.
    await page.waitForFunction(
      (framesBeforeResize) => {
        const canvas = document.querySelector<HTMLCanvasElement>(
          "#game-canvas",
        ) as
          | (HTMLCanvasElement & {
              __HANDBALL_PRESENTED_FRAMES__?: number;
            })
          | null;
        return (
          (canvas?.__HANDBALL_PRESENTED_FRAMES__ ?? 0) > framesBeforeResize
        );
      },
      presentedFramesBeforeResize,
      { timeout: 5_000 },
    );
    // The preceding assertion intentionally observes the first post-resize
    // frame. Starting touch-down immediately afterwards can place the entire
    // bounded gesture between two slow SwiftShader presentations. Phase-shift
    // only this QA stimulus on the Node host; production RAF and input remain
    // untouched.
    await new Promise<void>((resolveDelay) => {
      setTimeout(resolveDelay, RESIZE_TOUCH_FRAME_PHASE_OFFSET_MILLISECONDS);
    });
    const evidence = await dispatchTouchSwipe(page, context, {
      horizontalAim: 0.2,
      verticalAim: 0.25,
      // Targeted renderer/input coexistence observation after resize.
      holdMilliseconds: 180,
      requirePresentedFrame: true,
    });
    await waitForShotReset(page, 1);
    const snapshot = await demoSnapshot(page);

    expect(evidence.pointerType).toBe("touch");
    expect(evidence.productionRejectionReason).toBeNull();
    expect(evidence.presentationRequirementApplied).toBe(true);
    expect(evidence.durationMilliseconds).toBeGreaterThanOrEqual(160);
    expect(evidence.maximumSampleGapMilliseconds).toBeLessThanOrEqual(250);
    expect(evidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
    expect(snapshot.lastPointerType).toBe("touch");
    expect(snapshot.acceptedShots).toBe(1);
    expect(snapshot.resolvedShots).toBe(1);
    expect(snapshot.resizeListenerCount).toBe(1);
    expect(snapshot.scene).toMatchObject({
      finiteTransforms: true,
      cameraCount: 1,
      goalCentered: true,
      shooterLeftForeground: true,
    });
    expect(snapshot.scene.goalProjection.fullyVisible).toBe(true);
    expectNoRuntimeErrors(observation);
  } finally {
    await context.close();
  }
});

test("GPU and application resources do not grow across ten complete rounds", async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const context = await browser.newContext({
    baseURL: "http://127.0.0.1:4173",
    viewport: { width: 480, height: 270 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const observation = observeRuntime(page);
  const rounds: ResourceSample[] = [];
  try {
    await page.goto("/?capture&seed=1&quality=balanced");
    await waitForReady(page);

    for (let round = 1; round <= 10; round += 1) {
      for (const horizontalAim of [-0.7, 0, 1, 0.7, 1] as const) {
        const before = await demoSnapshot(page);
        await dispatchMouseSwipe(page, { horizontalAim });
        await page.waitForFunction(
          (acceptedBefore) =>
            window.__DEMO__?.snapshot().acceptedShots === acceptedBefore + 1,
          before.acceptedShots,
        );
        await pumpUntilShotStops(page, before.resolvedShots + 1);
        expect((await demoSnapshot(page)).scene.finiteTransforms).toBe(true);
      }

      await page.waitForFunction(
        () => window.__DEMO__?.snapshot().match.phase === "ROUND_COMPLETE",
      );
      await page.evaluate(() => {
        for (let frame = 0; frame < 90; frame += 1) {
          window.__PUMP__?.(1);
          if (window.__DEMO__?.snapshot().activeShot === null) {
            return;
          }
        }
        throw new Error("Round result did not release its active shot.");
      });
      const snapshot = await demoSnapshot(page);
      const sample = resourceSample(round, snapshot);
      rounds.push(sample);

      expect(snapshot.match.shotsTaken).toBe(5);
      expect(snapshot.scene.finiteTransforms).toBe(true);
      expect(snapshot.scene.shaderProgramsStableSincePrewarm).toBe(true);
      expect(snapshot.scene.staticLayerCache).toMatchObject({
        activeRenderTargets: 1,
        orphanedRenderTargets: 0,
      });

      if (round > 1) {
        const baseline = rounds[0];
        if (baseline === undefined) {
          throw new Error("Resource baseline was not recorded.");
        }
        expect(sample.gpuGeometries).toBeLessThanOrEqual(
          baseline.gpuGeometries,
        );
        expect(sample.gpuTextures).toBeLessThanOrEqual(baseline.gpuTextures);
        expect(sample.shaderPrograms).toBeLessThanOrEqual(
          baseline.shaderPrograms,
        );
        expect(sample.activeRenderTargets).toBe(
          baseline.activeRenderTargets,
        );
        expect(sample.orphanedRenderTargets).toBe(0);
        expect(sample.resizeListenerCount).toBe(1);
      }

      if (round < 10) {
        await page.getByRole("button", { name: "Restart round" }).click();
        await page.waitForFunction(
          () =>
            window.__DEMO__?.snapshot().match.phase === "READY" &&
            window.__DEMO__?.snapshot().acceptedShots === 0,
        );
      }
    }

    expectNoRuntimeErrors(observation);
    writeFileSync(
      resolve(AUDIT_ROOT, "resource-growth-10-rounds.json"),
      `${JSON.stringify(
        {
          schemaVersion: 1,
          roundsCompleted: rounds.length,
          realPointerShots: rounds.length * 5,
          baselineRound: 1,
          finiteTransformsEveryShot: true,
          stable: true,
          samples: rounds,
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    await context.close();
  }
});

async function presentedFrameCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as
      | (HTMLCanvasElement & {
          __HANDBALL_PRESENTED_FRAMES__?: number;
        })
      | null;
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    return canvas.__HANDBALL_PRESENTED_FRAMES__ ?? 0;
  });
}

interface ResourceSample {
  readonly round: number;
  readonly gpuGeometries: number;
  readonly gpuTextures: number;
  readonly shaderPrograms: number;
  readonly activeRenderTargets: number;
  readonly orphanedRenderTargets: number;
  readonly resizeListenerCount: number;
}

function resourceSample(
  round: number,
  snapshot: Awaited<ReturnType<typeof demoSnapshot>>,
): ResourceSample {
  return Object.freeze({
    round,
    gpuGeometries: snapshot.scene.gpuGeometries,
    gpuTextures: snapshot.scene.gpuTextures,
    shaderPrograms: snapshot.scene.shaderPrograms,
    activeRenderTargets:
      snapshot.scene.staticLayerCache.activeRenderTargets,
    orphanedRenderTargets:
      snapshot.scene.staticLayerCache.orphanedRenderTargets,
    resizeListenerCount: snapshot.resizeListenerCount,
  });
}

async function waitForReady(page: Page): Promise<void> {
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
}

async function waitForShotReset(
  page: Page,
  resolvedShots: number,
): Promise<void> {
  await page.waitForFunction(
    (expected) =>
      window.__DEMO__?.snapshot().resolvedShots === expected &&
      window.__DEMO__?.snapshot().inputEnabled === true,
    resolvedShots,
  );
}

async function pumpUntilShotStops(
  page: Page,
  resolvedShots: number,
): Promise<void> {
  await page.evaluate((expectedResolved) => {
    for (let frame = 0; frame < 120; frame += 1) {
      window.__PUMP__?.(1);
      const snapshot = window.__DEMO__?.snapshot();
      if (
        snapshot !== undefined &&
        snapshot.resolvedShots === expectedResolved &&
        (snapshot.inputEnabled || snapshot.match.phase === "ROUND_COMPLETE")
      ) {
        return;
      }
    }
    throw new Error("The real fixed-frame shot did not reach its next state.");
  }, resolvedShots);
}

async function demoSnapshot(page: Page) {
  return page.evaluate(() => {
    const demo = window.__DEMO__;
    if (demo === undefined) {
      throw new Error("Demo QA API is unavailable.");
    }
    return demo.snapshot();
  });
}
