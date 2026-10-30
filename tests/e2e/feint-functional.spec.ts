import { expect, test, type Browser, type Page } from "@playwright/test";
import type { AppSnapshot } from "../../src/app/HandballDemoApp";
import {
  dispatchMouseFeint,
  dispatchMouseSwipe,
  dispatchTouchFeint,
  dispatchTouchSwipe,
} from "./pointerGestures";

async function openReady(page: Page, seed: number): Promise<void> {
  await page.goto(`/?playtest&seed=${seed}&quality=balanced`);
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
}

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

function containsOnlyFiniteNumbers(value: unknown): boolean {
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (Array.isArray(value)) {
    return value.every(containsOnlyFiniteNumbers);
  }
  if (value !== null && typeof value === "object") {
    return Object.values(value).every(containsOnlyFiniteNumbers);
  }
  return true;
}

function expectFiniteGameplaySnapshot(snapshot: AppSnapshot): void {
  expect(snapshot.scene.finiteTransforms).toBe(true);
  expect(Number.isFinite(snapshot.simulationSeconds)).toBe(true);
  expect(containsOnlyFiniteNumbers(snapshot.pendingFeint)).toBe(true);
  expect(containsOnlyFiniteNumbers(snapshot.gestureInput.pendingFeint)).toBe(true);
  expect(containsOnlyFiniteNumbers(snapshot.activeShot)).toBe(true);
}

async function installReleaseProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing for FEINT release proof.");
    }
    const probe = window as typeof window & {
      __FEINT_RELEASE__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    canvas.addEventListener(
      "pointerup",
      () => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable at FEINT release.");
        }
        probe.__FEINT_RELEASE__ = demo.snapshot();
      },
      { once: true },
    );
  });
}

async function releaseSnapshot(page: Page) {
  return page.evaluate(() => {
    const probe = window as typeof window & {
      __FEINT_RELEASE__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    if (probe.__FEINT_RELEASE__ === undefined) {
      throw new Error("FEINT release snapshot was not captured.");
    }
    return probe.__FEINT_RELEASE__;
  });
}

async function expectPhysicalCompletionAndReset(page: Page): Promise<void> {
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().resolvedShots === 1,
  );
  const terminal = await page.evaluate(() => window.__DEMO__?.snapshot());
  if (terminal === undefined) {
    throw new Error("FEINT terminal snapshot is unavailable.");
  }
  expectFiniteGameplaySnapshot(terminal);
  expect(terminal?.activeShot?.ball.terminalState).not.toBeNull();
  expect(
    terminal?.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
  if (terminal?.activeShot?.ball.terminalState === "SAVED") {
    expect(
      terminal.activeShot.ball.contactHistory.some(
        (contact) => contact.kind === "KEEPER",
      ),
    ).toBe(true);
  }
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const reset = await page.evaluate(() => window.__DEMO__?.snapshot());
  expect(reset?.pendingFeint).toBeNull();
  expect(reset?.gestureInput.pendingFeint).toBeNull();
  expect(reset?.activeShot).toBeNull();
  expect(reset?.feedback.hud.feintState).toBeNull();
}

test("a staged real mouse FEINT is observable before one physical shot release", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 19);
  await installReleaseProbe(page);

  const evidence = await dispatchMouseFeint(page, 1);
  expect(evidence.pointer.pointerType).toBe("mouse");
  expect(evidence.pointer.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
  expect(evidence.captureHeldAtCheckpoint).toBe(true);
  expect(evidence.checkpoint.gestureInput).toMatchObject({
    captureActive: true,
    pointerType: "mouse",
    pendingFeint: { type: "FEINT" },
  });
  expect(
    evidence.checkpoint.pendingFeint?.apparentDirection.x,
  ).toBeGreaterThan(0);
  expect(evidence.checkpoint.feedback.hud).toMatchObject({
    techniqueLabel: "FEINT",
    feintState: "pending",
  });
  expect(evidence.checkpoint.acceptedShots).toBe(0);
  expect(evidence.checkpoint.resolvedShots).toBe(0);
  expect(evidence.checkpoint.activeShot).toBeNull();
  expect(evidence.checkpoint.outcomes).toEqual([]);
  expect(evidence.checkpoint.goalkeeper).toMatchObject({
    phase: "COMMIT",
    committedDestination: expect.stringContaining("right"),
  });
  expectFiniteGameplaySnapshot(evidence.checkpoint);

  const fake = await releaseSnapshot(page);
  expect(fake.acceptedShots).toBe(0);
  expect(fake.resolvedShots).toBe(0);
  expect(fake.activeShot).toBeNull();
  expect(fake.outcomes).toEqual([]);
  expect(fake.inputEnabled).toBe(true);
  expect(fake.completedFeints).toBe(1);
  await installReleaseProbe(page);
  await dispatchMouseSwipe(page, { horizontalAim: -0.7, verticalAim: 0.5, requirePresentedFrame: true });
  const released = await releaseSnapshot(page);
  expect(released.acceptedShots).toBe(1);
  expect(released.resolvedShots).toBe(0);
  expect(["DIRECT", "LOB", "BOUNCE"]).toContain(released.activeShot?.category);
  expect(released.activeShot?.feint).toBeNull();
  expect(released.activeShot?.keeperZone).toBe(
    evidence.checkpoint.goalkeeper.committedDestination,
  );
  // Goal world X is mirrored from the shooter-facing screen axis, so the
  // screen-left release after this screen-right fake resolves to +world X.
  expect(Math.sign(released.activeShot?.target.x ?? 0)).toBe(1);
  expect(released.pendingFeint).toBeNull();
  expect(released.activeShot?.ball).toMatchObject({
    terminalState: null,
    contactHistory: [],
  });
  expect(released.outcomes).toEqual([]);
  expect(released.feedback.hud.techniqueLabel).toMatch(
    /^(DIRECT|LOB|BOUNCE)$/,
  );
  expectFiniteGameplaySnapshot(released);
  await expectPhysicalCompletionAndReset(page);
  expect(errors).toEqual([]);
});

test("a real small correction remains non-FEINT", async ({ page }) => {
  await openReady(page, 23);
  await installReleaseProbe(page);
  await dispatchMouseSwipe(page, {
    horizontalAim: 0.1,
    verticalAim: 0,
    sideSpinWaypointOffsetSafeFraction: 0.02,
    requirePresentedFrame: true,
  });
  const released = await releaseSnapshot(page);
  expect(released.pendingFeint).toBeNull();
  expect(released.activeShot?.feint).toBeNull();
  expect(released.feedback.hud.feintState).toBeNull();
  await expectPhysicalCompletionAndReset(page);
});

test("a staged real touch FEINT uses the same captured Pointer Events path", async ({
  browser,
}) => {
  await runTouchFeint(browser);
});

async function runTouchFeint(browser: Browser): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: 960, height: 540 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  const errors = collectRuntimeErrors(page);
  try {
    await openReady(page, 29);
    await installReleaseProbe(page);
    const evidence = await dispatchTouchFeint(page, context, -1);
    expect(evidence.pointer.pointerType).toBe("touch");
    expect(evidence.captureHeldAtCheckpoint).toBe(true);
    expect(
      evidence.checkpoint.pendingFeint?.apparentDirection.x,
    ).toBeLessThan(0);
    expect(evidence.checkpoint.acceptedShots).toBe(0);
    expect(evidence.checkpoint.activeShot).toBeNull();
    expect(evidence.checkpoint.goalkeeper).toMatchObject({
      phase: "COMMIT",
      committedDestination: expect.stringContaining("left"),
    });
    expectFiniteGameplaySnapshot(evidence.checkpoint);

    const fake = await releaseSnapshot(page);
    expect(fake.acceptedShots).toBe(0);
    expect(fake.activeShot).toBeNull();
    expect(fake.inputEnabled).toBe(true);
    expect(fake.outcomes).toEqual([]);
    await installReleaseProbe(page);
    await dispatchTouchSwipe(page, context, { horizontalAim: 0.7, verticalAim: 0.5, requirePresentedFrame: true });
    const released = await releaseSnapshot(page);
    expect(released.acceptedShots).toBe(1);
    expect(released.resolvedShots).toBe(0);
    expect(released.lastPointerType).toBe("touch");
    expect(released.activeShot?.feint).toBeNull();
    expect(released.activeShot?.keeperZone).toBe(
      evidence.checkpoint.goalkeeper.committedDestination,
    );
    // This screen-right release reverses the screen-left fake and maps to
    // negative world X through the shooter-facing camera convention.
    expect(Math.sign(released.activeShot?.target.x ?? 0)).toBe(-1);
    expect(released.activeShot?.ball).toMatchObject({
      terminalState: null,
      contactHistory: [],
    });
    expectFiniteGameplaySnapshot(released);
    await expectPhysicalCompletionAndReset(page);
    expect(errors).toEqual([]);
  } finally {
    await context.close();
  }
}
