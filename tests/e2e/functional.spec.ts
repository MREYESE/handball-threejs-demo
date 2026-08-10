import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  dispatchMouseSwipe,
  dispatchTouchSwipe,
  type PointerGestureEvidence,
} from "./pointerGestures";

async function openReady(page: Page, seed = 1): Promise<void> {
  await page.goto(`/?playtest&seed=${seed}`);
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
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

async function dispatchAcceptedMouseSwipe(
  page: Page,
  options: Parameters<typeof dispatchMouseSwipe>[1] = {},
): Promise<PointerGestureEvidence> {
  const before = await demoSnapshot(page);
  const pointerEvidence = await dispatchMouseSwipe(page, options);

  await page.waitForFunction(
    ({ acceptedBefore, rejectedBefore }) => {
      const snapshot = window.__DEMO__?.snapshot();
      return (
        snapshot !== undefined &&
        (snapshot.acceptedShots > acceptedBefore ||
          snapshot.rejectedGestures > rejectedBefore)
      );
    },
    {
      acceptedBefore: before.acceptedShots,
      rejectedBefore: before.rejectedGestures,
    },
    { timeout: 5_000 },
  );

  const after = await demoSnapshot(page);
  expect(
    after.rejectedGestures,
    `The real Chromium mouse gesture was rejected. Evidence: ${JSON.stringify(pointerEvidence)} Snapshot: ${JSON.stringify(after)}`,
  ).toBe(before.rejectedGestures);
  expect(after.acceptedShots).toBe(before.acceptedShots + 1);
  expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
  return pointerEvidence;
}

async function waitForOneShotReset(page: Page, resolvedShots: number): Promise<void> {
  await page.waitForFunction(
    (expected) => window.__DEMO__?.snapshot().resolvedShots === expected,
    resolvedShots,
  );
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
}

function collectRuntimeErrors(page: Page): readonly string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  return errors;
}

test("a real accepted pointer swipe resolves exactly once and re-enables input", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page);
  expect((await demoSnapshot(page)).feedback.hud).toMatchObject({
    firstShotInstructionVisible: true,
    audioEnabled: true,
  });
  await expect(page.getByText("STANDARD", { exact: true })).toBeVisible();

  await dispatchAcceptedMouseSwipe(page);
  const released = await demoSnapshot(page);
  expect(released.inputEnabled).toBe(false);
  expect(released.feedback.hud.firstShotInstructionVisible).toBe(false);

  await dispatchMouseSwipe(page, { horizontalAim: -0.7 });
  await waitForOneShotReset(page, 1);
  const snapshot = await demoSnapshot(page);

  expect(snapshot.acceptedShots).toBe(1);
  expect(snapshot.resolvedShots).toBe(1);
  expect(snapshot.outcomes).toEqual(["SAVED"]);
  expect(snapshot.match.phase).toBe("READY");
  expect(snapshot.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
});

test("real pointer swipes reach GOAL, SAVED, and MISS scoring branches", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  const cases = [
    { horizontalAim: -0.7, expected: "GOAL" },
    { horizontalAim: 0, expected: "SAVED" },
    { horizontalAim: 1, expected: "MISS" },
  ] as const;

  for (const scoringCase of cases) {
    await openReady(page);
    await dispatchAcceptedMouseSwipe(page, {
      horizontalAim: scoringCase.horizontalAim,
    });
    await waitForOneShotReset(page, 1);
    const snapshot = await demoSnapshot(page);
    expect(snapshot.outcomes).toEqual([scoringCase.expected]);
  }
  expect(errors).toEqual([]);
});

test("five real gestures complete a round and restart restores ready state", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page);
  const roundAims = [-0.7, 0, 1, 0.7, 1] as const;

  for (let shot = 1; shot <= 5; shot += 1) {
    const horizontalAim = roundAims[shot - 1];
    if (horizontalAim === undefined) {
      throw new Error(`Missing deterministic aim for shot ${shot}.`);
    }
    await dispatchAcceptedMouseSwipe(page, {
      horizontalAim,
    });
    await page.waitForFunction(
      (expected) => window.__DEMO__?.snapshot().resolvedShots === expected,
      shot,
    );
    if (shot < 5) {
      await page.waitForFunction(
        () => window.__DEMO__?.snapshot().inputEnabled === true,
      );
    }
  }

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().match.phase === "ROUND_COMPLETE",
  );
  const completed = await demoSnapshot(page);
  expect(completed.match.shotsTaken).toBe(5);
  expect(completed.outcomes).toEqual([
    "GOAL",
    "SAVED",
    "MISS",
    "GOAL",
    "MISS",
  ]);
  expect(
    completed.match.goals + completed.match.saves + completed.match.misses,
  ).toBe(5);
  expect(completed.inputEnabled).toBe(false);
  expect(completed.scene.arcadeFx).toMatchObject({
    releaseBursts: 5,
    impactBursts: 5,
    outcomeBursts: { GOAL: 2, SAVED: 1, MISS: 2 },
    resultEffectsStartedAfterOutcome: true,
  });
  expect(completed.feedback.hud).toMatchObject({
    outcomePresentations: { GOAL: 2, SAVED: 1, MISS: 2 },
    lastPresentedOutcome: "MISS",
    fictionalHomeTeam: "NOVA AEGIS",
    fictionalAwayTeam: "VOLT UNION",
    fictionalArena: "AURORA FORUM",
  });
  expect(completed.feedback.audio).toMatchObject({
    enabled: true,
    requestedCues: {
      crowd: 5,
      throw: 5,
      flight: 5,
      goal: 2,
      save: 1,
      miss: 2,
      ui: 5,
    },
    synthesizedOnly: true,
  });
  await expect(page.locator("#round-summary")).toBeVisible();
  await expect(page.locator("#summary-title")).toHaveText(
    "Volt Union holds firm",
  );
  await expect(page.locator("#summary-text")).toHaveText(
    "2 goals · 1 saved · 2 wide",
  );

  await page.getByRole("button", { name: "Restart round" }).click();
  const restarted = await demoSnapshot(page);
  expect(restarted.match.shotsTaken).toBe(0);
  expect(restarted.acceptedShots).toBe(0);
  expect(restarted.resolvedShots).toBe(0);
  expect(restarted.inputEnabled).toBe(true);
  expect(restarted.feedback.hud.firstShotInstructionVisible).toBe(true);
  await expect(page.locator("#round-summary")).toBeHidden();
  expect(errors).toEqual([]);
});

test("regulation geometry and transforms remain valid after landscape resize", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await page.setViewportSize({ width: 960, height: 540 });
  await openReady(page);
  await dispatchAcceptedMouseSwipe(page, {
    horizontalAim: 0.2,
    verticalAim: 0.25,
  });
  await waitForOneShotReset(page, 1);
  const snapshot = await demoSnapshot(page);

  expect(snapshot.scene).toMatchObject({
    finiteTransforms: true,
    goalInnerWidthMeters: 3,
    goalInnerHeightMeters: 2,
    releaseToGoalMeters: 7,
    goalAreaRadiusMeters: 6,
    penaltyLineDistanceMeters: 7,
    freeThrowRadiusMeters: 9,
    cameraCount: 1,
    goalCentered: true,
    shooterLeftForeground: true,
  });
  expect(snapshot.resizeListenerCount).toBe(1);
  expect(errors).toEqual([]);
});

test("approved landscape viewports keep one locked camera and an unobstructed projected goal", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  const viewports = [
    { width: 1920, height: 1080, profile: "desktop-wide" },
    { width: 1440, height: 900, profile: "desktop-compact" },
    { width: 1280, height: 720, profile: "desktop-wide" },
    { width: 844, height: 390, profile: "mobile-landscape" },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await openReady(page);
    const snapshot = await demoSnapshot(page);
    expect(snapshot.scene.cameraCount).toBe(1);
    expect(snapshot.resizeListenerCount).toBe(1);
    expect(snapshot.scene.cameraProfile).toBe(viewport.profile);
    expect(snapshot.scene.goalProjection.fullyVisible).toBe(true);
    expect(snapshot.scene.goalCentered).toBe(true);
    expect(snapshot.scene.shooterProjection.left).toBeLessThan(-0.3);
    expect(snapshot.scene.shooterProjection.right).toBeLessThan(0.05);
    expect(snapshot.scene.shooterLeftForeground).toBe(true);
    expect(snapshot.feedback.hud.safeAreaPanels).toEqual([
      "top-left",
      "top-center",
      "top-right",
      "right-edge",
      "bottom-left",
      "bottom-right",
    ]);
  }

  expect(errors).toEqual([]);
});

test("one real swipe drives release and its selected high zone drives the matching dive through resolution", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/?capture&seed=3&quality=balanced");
  await page.waitForFunction(() => window.__READY__ === true);
  await dispatchAcceptedMouseSwipe(page, {
    horizontalAim: 0,
    verticalAim: 0.72,
  });

  await page.evaluate(() => window.__PUMP__?.(8));
  const release = await demoSnapshot(page);
  expect(release.activeShot).toMatchObject({
    keeperZone: "high-center",
    plannedOutcome: "SAVED",
    resolved: false,
  });
  expect(release.scene.shooterAnimationStage).toBe("RELEASE");
  expect(release.scene.shooterPoseName).toBe("shooter-handball-release");
  expect(release.scene.goalkeeperAnimationStage).toBe("ANTICIPATION");
  expect(release.scene.arcadeFx).toMatchObject({
    phase: "FLIGHT",
    releaseBursts: 1,
    impactBursts: 0,
    outcomeBursts: { GOAL: 0, SAVED: 0, MISS: 0 },
    currentOutcome: null,
  });
  expect(release.feedback.hud.outcomePresentations).toEqual({
    GOAL: 0,
    SAVED: 0,
    MISS: 0,
  });
  expect(release.feedback.audio.requestedCues).toMatchObject({
    throw: 1,
    flight: 1,
    goal: 0,
    save: 0,
    miss: 0,
  });

  await page.evaluate(() => window.__PUMP__?.(12));
  const dive = await demoSnapshot(page);
  expect(dive.scene.goalkeeperZone).toBe("high-center");
  expect(dive.scene.goalkeeperAnimationStage).toBe("DIVE");
  expect(dive.scene.goalkeeperPoseName).toContain("keeper-high-center-dive");

  await page.evaluate(() => {
    for (let frame = 0; frame < 90; frame += 1) {
      window.__PUMP__?.(1);
      if (window.__DEMO__?.snapshot().resolvedShots === 1) {
        window.__PUMP__?.(1);
        return;
      }
    }
    throw new Error("The real high-save integration shot did not resolve.");
  });
  const resolved = await demoSnapshot(page);
  expect(resolved.outcomes).toEqual(["SAVED"]);
  expect(resolved.scene.goalkeeperAnimationStage).toBe("IMPACT");
  expect(resolved.scene.goalkeeperReachErrorMeters).toBeLessThanOrEqual(0.65);
  expect(resolved.scene.characterVisualRootsOwnScoring).toBe(false);
  expect(resolved.scene.arcadeFx).toMatchObject({
    phase: "RESULT",
    impactBursts: 1,
    outcomeBursts: { GOAL: 0, SAVED: 1, MISS: 0 },
    currentOutcome: "SAVED",
    currentOutcomeColor: "#4ed8ff",
    resultEffectsStartedAfterOutcome: true,
  });
  expect(resolved.feedback.hud).toMatchObject({
    lastPresentedOutcome: "SAVED",
    outcomePresentations: { GOAL: 0, SAVED: 1, MISS: 0 },
  });
  expect(resolved.feedback.audio.requestedCues).toMatchObject({
    crowd: 1,
    throw: 1,
    flight: 1,
    goal: 0,
    save: 1,
    miss: 0,
    ui: 1,
  });
  expect(resolved.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
});

test("audio and reduced-motion controls update the same production feedback consumers", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page);
  const before = await demoSnapshot(page);

  await page.locator("#toggle-motion").click();
  const motionChanged = await demoSnapshot(page);
  expect(motionChanged.feedback.hud.reducedMotion).toBe(
    !before.feedback.hud.reducedMotion,
  );
  expect(motionChanged.scene.arcadeFx.reducedMotion).toBe(
    motionChanged.feedback.hud.reducedMotion,
  );

  await page.locator("#toggle-audio").click();
  const muted = await demoSnapshot(page);
  expect(muted.feedback.audio.enabled).toBe(false);
  expect(muted.feedback.hud.audioEnabled).toBe(false);
  expect(await page.locator("#toggle-audio").getAttribute("aria-pressed")).toBe(
    "false",
  );
  expect(errors).toEqual([]);
});

test("balanced materials and lights stay shader-stable through a measured real shot", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await page.goto("/?playtest&seed=1");
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const readyPerformance = await page.evaluate(() =>
    window.__PERF_SNAPSHOT__?.(),
  );
  expect(readyPerformance).toMatchObject({
    quality: "balanced",
    runtimeMode: "gameplay",
    inputActivatedAfterPrewarm: true,
    prewarmComplete: true,
    crowdInstances: 160,
    animatedCrowdInstances: 0,
    shaderProgramsStableSincePrewarm: true,
  });
  expect(readyPerformance?.bootTimeMilliseconds).toBeGreaterThan(0);
  expect(readyPerformance?.appliedPixelRatio).toBeLessThanOrEqual(
    readyPerformance?.maximumPixelRatio ?? 0,
  );

  // Measure a valid lower-power standard shot so the active gameplay window
  // contains more than 20 real presentations even on the bounded SwiftShader
  // host. Input timing and the production trajectory profile stay unchanged.
  await dispatchAcceptedMouseSwipe(page, {
    horizontalAim: 0,
    verticalAim: -0.3,
  });
  await waitForOneShotReset(page, 1);
  const measured = await page.evaluate(() => window.__PERF_SNAPSHOT__?.());
  expect(measured?.drawCalls).toBeGreaterThan(0);
  expect(measured?.drawCalls).toBeLessThanOrEqual(180);
  expect(measured?.triangles).toBeGreaterThan(0);
  expect(measured?.triangles).toBeLessThanOrEqual(750_000);
  expect(measured?.shaderPrograms).toBe(
    measured?.prewarmedShaderPrograms,
  );
  expect(measured?.measuredShot.measurementActive).toBe(false);
  expect(measured?.measuredShot.sampleCount).toBeGreaterThan(20);
  expect(measured?.measuredShot.maximumRenderCpuMilliseconds).toBeGreaterThan(
    0,
  );
  expect(measured?.measuredShot.shaderProgramDelta).toBe(0);
  expect(measured?.measuredShot.shaderProgramsStable).toBe(true);
  expect(errors).toEqual([]);
});

test("touch input uses the same real pointer-to-shot path", async ({ browser }) => {
  await runTouchSwipe(browser);
});

async function runTouchSwipe(browser: Browser): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: 960, height: 540 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors = collectRuntimeErrors(page);
  await openReady(page);
  const pointerEvidence = await dispatchTouchSwipe(page, context);

  await waitForOneShotReset(page, 1);
  const snapshot = await demoSnapshot(page);
  expect(snapshot.lastPointerType).toBe("touch");
  expect(snapshot.acceptedShots).toBe(1);
  expect(snapshot.resolvedShots).toBe(1);
  expect(pointerEvidence.pointerType).toBe("touch");
  expect(pointerEvidence.productionRejectionReason).toBeNull();
  expect(pointerEvidence.presentationRequirementApplied).toBe(false);
  expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(0);
  expect(errors).toEqual([]);
  await context.close();
}
