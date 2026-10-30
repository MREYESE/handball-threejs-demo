import { writeFile } from "node:fs/promises";
import { expect, test, type Browser, type Page } from "@playwright/test";
import type { AppSnapshot } from "../../src/app/HandballDemoApp";
import {
  dispatchMouseKeeperCommitment,
  dispatchTouchKeeperCommitment,
  type KeeperPointerGestureEvidence,
} from "./pointerGestures";

async function retainEvidence(name: string, value: unknown): Promise<void> {
  const path = test.info().outputPath(`${name}.json`);
  await writeFile(path, JSON.stringify(value, null, 2));
  await test.info().attach(name, { path, contentType: "application/json" });
}

async function openReady(page: Page, seed: number): Promise<void> {
  await page.goto(`/?playtest&seed=${seed}&quality=balanced`);
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
}

async function installReleaseProbe(page: Page): Promise<void> {
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas") as
      | (HTMLCanvasElement & { __KEEPER_RELEASE__?: AppSnapshot })
      | null;
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    const probe = window as typeof window & {
      __KEEPER_READ__?: { snapshot: AppSnapshot; captureHeld: boolean };
    };
    delete probe.__KEEPER_READ__;
    let released = false;
    canvas.addEventListener("pointerup", () => { released = true; }, { once: true });
    canvas.addEventListener("pointerdown", (event) => {
      const observe = (): void => {
        if (released) return;
        const snapshot = window.__DEMO__?.snapshot();
        if (snapshot?.goalkeeper.phase === "READ" && probe.__KEEPER_READ__ === undefined) {
          probe.__KEEPER_READ__ = { snapshot, captureHeld: canvas.hasPointerCapture(event.pointerId) };
        }
        requestAnimationFrame(observe);
      };
      requestAnimationFrame(observe);
    }, { once: true });
    canvas.addEventListener(
      "pointerup",
      () => {
        const snapshot = window.__DEMO__?.snapshot();
        if (snapshot !== undefined) canvas.__KEEPER_RELEASE__ = snapshot;
      },
      { once: true },
    );
  });
}

async function releaseSnapshot(page: Page): Promise<AppSnapshot> {
  return page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas") as
      | (HTMLCanvasElement & { __KEEPER_RELEASE__?: AppSnapshot })
      | null;
    if (canvas?.__KEEPER_RELEASE__ === undefined) {
      throw new Error("Goalkeeper release snapshot was not captured.");
    }
    return canvas.__KEEPER_RELEASE__;
  });
}

function expectCommitCheckpoint(
  evidence: KeeperPointerGestureEvidence,
  pointerType: "mouse" | "touch",
  side: "left" | "right",
): void {
  expect(evidence.pointer.pointerType).toBe(pointerType);
  expect(evidence.pointer.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
  expect(evidence.captureHeldAtCheckpoint).toBe(true);
  expect(evidence.checkpoint.gestureInput).toMatchObject({
    captureActive: true,
    pointerType,
  });
  expect(evidence.checkpoint.goalkeeper).toMatchObject({
    phase: "COMMIT",
    commitmentTimeSeconds: expect.any(Number),
    committedDestination: `high-${side}`,
    releaseDestination: null,
    conflictingCue: false,
  });
  expect(evidence.checkpoint.goalkeeper.observedCue?.confidence).toBeGreaterThan(
    0.055,
  );
  expect(evidence.checkpoint.scene).toMatchObject({
    goalkeeperVisualPhase: "COMMIT",
    goalkeeperAnimationStage: "ANTICIPATION",
    goalkeeperZone: `high-${side}`,
    goalkeeperPoseName: `keeper-high-${side}-commit`,
  });
  expect(evidence.checkpoint.acceptedShots).toBe(0);
  expect(evidence.checkpoint.resolvedShots).toBe(0);
  expect(evidence.checkpoint.activeShot).toBeNull();
  expect(evidence.checkpoint.outcomes).toEqual([]);
}

async function expectReleaseCompletionAndReset(
  page: Page,
  evidence: KeeperPointerGestureEvidence,
  expectedFinalTargetSign: -1 | 1,
): Promise<void> {
  const read = await page.evaluate(() => (window as typeof window & {
    __KEEPER_READ__?: { snapshot: AppSnapshot; captureHeld: boolean };
  }).__KEEPER_READ__);
  expect(read?.captureHeld).toBe(true);
  expect(read?.snapshot.goalkeeper).toMatchObject({ phase: "READ", committedDestination: null, releaseDestination: null });
  expect(read?.snapshot.scene).toMatchObject({ goalkeeperVisualPhase: "READ", goalkeeperZone: null });
  expect(read?.snapshot.gestureInput.captureActive).toBe(true);
  expect(read?.snapshot.activeShot).toBeNull();
  expect(read?.snapshot.acceptedShots).toBe(0);
  const released = await releaseSnapshot(page);
  await retainEvidence("keeper-read-commit-release", { read, evidence, released });
  const destination = evidence.checkpoint.goalkeeper.committedDestination;
  expect(released.acceptedShots).toBe(1);
  expect(released.resolvedShots).toBe(0);
  expect(released.goalkeeper).toMatchObject({
    phase: "COMMIT",
    committedDestination: destination,
    releaseDestination: destination,
  });
  expect(released.activeShot?.keeperZone).toBe(destination);
  expect(Math.sign(released.activeShot?.target.x ?? 0)).toBe(
    expectedFinalTargetSign,
  );
  expect(released.activeShot?.ball).toMatchObject({
    terminalState: null,
    contactHistory: [],
  });

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().resolvedShots === 1,
  );
  const terminal = await page.evaluate(() => window.__DEMO__?.snapshot());
  expect(
    terminal?.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
  if (terminal?.activeShot?.ball.terminalState === "SAVED") {
    const contacts = terminal.activeShot.ball.contactHistory;
    const terminalIndex = contacts.findIndex(
      (contact) => contact.outcome === "SAVED",
    );
    expect(
      contacts.slice(0, terminalIndex + 1).some((contact) => contact.kind === "KEEPER"),
    ).toBe(true);
  }

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const reset = await page.evaluate(() => window.__DEMO__?.snapshot());
  expect(reset?.activeShot).toBeNull();
  expect(reset?.goalkeeper).toMatchObject({
    phase: "READY",
    observedCue: null,
    seededTendency: null,
    commitmentTimeSeconds: null,
    committedDestination: null,
    releaseDestination: null,
  });
  expect(reset?.scene).toMatchObject({ goalkeeperVisualPhase: "READY", goalkeeperPoseName: "keeper-ready" });
}

test("native pointer hold shows a centered guard and cancellation returns to ready", async ({ page }) => {
  await openReady(page, 41);
  await page.mouse.move(480, 440);
  await page.mouse.down();
  await page.waitForFunction(() => window.__DEMO__?.snapshot().goalkeeper.phase === "HOLD");
  const hold = await page.evaluate(() => window.__DEMO__!.snapshot());
  expect(hold.goalkeeper.committedDestination).toBeNull();
  expect(hold.scene).toMatchObject({ goalkeeperVisualPhase: "HOLD", goalkeeperPoseName: "keeper-hold", goalkeeperZone: null });
  expect(hold.acceptedShots).toBe(0);
  expect(hold.gestureInput.captureActive).toBe(true);
  await retainEvidence("keeper-centered-hold", hold);
  await page.screenshot({ path: test.info().outputPath("keeper-centered-hold.png") });
  // A stationary native gesture is rejected by the real input adapter.
  await page.mouse.up();
  await page.waitForFunction(() => window.__DEMO__?.snapshot().goalkeeper.phase === "READY");
  const ready = await page.evaluate(() => window.__DEMO__!.snapshot());
  expect(ready.acceptedShots).toBe(0);
  expect(ready.scene.goalkeeperPoseName).toBe("keeper-ready");
});

test("real Chromium mouse cues lock the keeper before an opposite release aim", async ({
  page,
}) => {
  await openReady(page, 41);
  await installReleaseProbe(page);
  const evidence = await dispatchMouseKeeperCommitment(page, 1, 0.9);
  expectCommitCheckpoint(evidence, "mouse", "right");
  await expectReleaseCompletionAndReset(page, evidence, -1);
});

test("real Chromium touch cues use the same fixed-step commitment path", async ({
  browser,
}) => {
  await runTouchCommitment(browser);
});

async function runTouchCommitment(browser: Browser): Promise<void> {
  const context = await browser.newContext({
    viewport: { width: 960, height: 540 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await openReady(page, 43);
    await installReleaseProbe(page);
    const evidence = await dispatchTouchKeeperCommitment(page, context, -1, -0.9);
    expectCommitCheckpoint(evidence, "touch", "left");
    await expectReleaseCompletionAndReset(page, evidence, 1);
  } finally {
    await context.close();
  }
}

// The existing manual clock schedules production fixed updates. Native pointer
// Native input is recorded once; domain replay consumes those exact samples and
// fixed-step ordering. Browser timestamps and PointerEvents remain untouched.
test("seeded native gesture replay matches commitments, every flight step, contacts and score", async ({ page }) => {
  await page.goto("/?playtest&trace&seed=71&quality=balanced");
  await page.waitForFunction(() => window.__READY__ === true);
  const { dispatchNativePath } = await import("./pointerGestures");
  const { replayGestureSession } = await import("../../src/dev/GestureTrace");
  await dispatchNativePath(page, "mouse", [[0.5, 0.84], [0.61, 0.8], [0.55, 0.79], [0.4, 0.76]]);
  const fake = await page.evaluate(() => window.__DEMO__!.snapshot());
  expect(fake.activeShot).toBeNull();
  expect(fake.acceptedShots).toBe(0);
  const fakeTrace = await page.evaluate(() => window.__DEMO__!.exportGestureTrace());
  expect(replayGestureSession(fakeTrace!).shots).toHaveLength(0);
  await dispatchNativePath(page, "mouse", [[0.5, 0.84], [0.42, 0.73], [0.34, 0.62]]);
  await page.waitForFunction(() => window.__DEMO__!.snapshot().resolvedShots === 1);
  const native = await page.evaluate(() => window.__DEMO__!.snapshot());
  await page.waitForFunction(() => window.__DEMO__!.snapshot().inputEnabled);
  const trace = await page.evaluate(() => window.__DEMO__!.exportGestureTrace());
  const first = replayGestureSession(trace!), second = replayGestureSession(trace!);
  expect(second).toEqual(first);
  expect(first.shots).toHaveLength(1);
  expect(first.actions.map(a => a.action)).toEqual(["FEINT", "SHOT"]);
  expect(first.keeperSteps).toEqual(trace!.attempts.flatMap(a => a.events.filter(e => e.type === "KEEPER_STEP")
    .map(e => ({ simulationSeconds: e.simulationSeconds, keeper: e.keeper }))));
  expect(first.shots[0]!.ball.contactHistory).toEqual(native.activeShot!.ball.contactHistory);
  expect(first.shots[0]!.steps).toEqual(trace!.attempts[1]!.events.filter(e=>e.type==="FLIGHT_STEP").map(e=>e.keeper));
  expect(first.shots[0]!.ball.terminalState).toBe(native.outcomes[0]);
  expect(first.shots[0]!.keeper).toEqual(trace!.attempts[1]!.events.find(e => e.type === "SHOT_RELEASED")!.keeper);
  await retainEvidence("integrated-seeded-replay", { native, trace, first, second });
});
