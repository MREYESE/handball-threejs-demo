import { readFile, writeFile } from "node:fs/promises";
import { verifyHighReboundArc } from "./reboundEvidence";
import { LockedCameraRig } from "../../src/presentation/camera/LockedCameraRig";
import { GestureTrace, replayGestureTrace, replayGestureSession } from "../../src/dev/GestureTrace";
import { createBaselineBallFlight, advanceBallFlight, type BallContact } from "../../src/domain/shot/ballFlight";
import { mapAimToGoalTarget } from "../../src/domain/shot/target";
import { expect, test, type Browser, type Page } from "@playwright/test";
import {
  STANDARD_BALL_FLIGHT_CONFIG,
  STANDARD_GESTURE_CONFIG,
  STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG,
  STANDARD_TRAJECTORY_CONFIG,
  STANDARD_RELEASE_POSITION,
} from "../../src/config/defaults";
import { analyzeStandardGesture } from "../../src/domain/gesture/features";
import type { GestureSample } from "../../src/domain/gesture/model";
import { preprocessGesture } from "../../src/domain/gesture/preprocess";
import {
  goalkeeperDiveProgress,
  goalkeeperPositionDuringShot,
  type GoalkeeperZone,
} from "../../src/domain/goalkeeper/zones";
import {
  dispatchMouseFeint,
  dispatchTouchFeint,
  dispatchMouseKeeperCommitment,
  dispatchMouseSwipe,
  dispatchNativePath,
  dispatchTouchSwipe,
  dispatchTouchKeeperCommitment,
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

interface SnapshotVector {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface HighSaveTraceFrame {
  readonly frame: number;
  readonly previousElapsedSeconds: number;
  readonly elapsedSeconds: number;
  readonly previousPosition: SnapshotVector;
  readonly position: SnapshotVector;
  readonly velocity: SnapshotVector;
  readonly contactHistory: readonly {
    readonly kind: string;
    readonly elapsedSeconds: number;
    readonly position: SnapshotVector;
    readonly outcome: string | null;
  }[];
  readonly terminalState: string | null;
}

interface HighSaveTrace {
  readonly frames: readonly HighSaveTraceFrame[];
  readonly keeperContactObserved: boolean;
  readonly firstTerminalOutcome: string | null;
  readonly goalPlaneCrossingFrame: number | null;
}

function highSaveGestureDiagnostics(
  commitment: Awaited<ReturnType<typeof dispatchMouseKeeperCommitment>>,
  releaseStart: Awaited<ReturnType<typeof demoSnapshot>>,
) {
  const { events, rawEvents, canvasBounds } = commitment.pointer;
  const boundedEvents = events.slice(0, 16);
  const nativeSamples: GestureSample[] = [];
  for (const event of boundedEvents) {
    if (event.type === "pointermove") {
      const movementEvents =
        event.coalescedEvents.length > 0 ? event.coalescedEvents : [event];
      for (const movementEvent of movementEvents) {
        nativeSamples.push({
          positionPixels: {
            x: movementEvent.clientX - canvasBounds.x,
            y: movementEvent.clientY - canvasBounds.y,
          },
          timeSeconds: movementEvent.timeStamp / 1_000,
        });
      }
      continue;
    }
    nativeSamples.push({
      positionPixels: {
        x: event.clientX - canvasBounds.x,
        y: event.clientY - canvasBounds.y,
      },
      timeSeconds: event.timeStamp / 1_000,
    });
  }

  const productionLikeSamples: GestureSample[] = [];
  for (const [index, sample] of nativeSamples.entries()) {
    const isTerminalSample = index === nativeSamples.length - 1;
    const previous = productionLikeSamples.at(-1);
    if (
      previous === undefined ||
      isTerminalSample ||
      Math.hypot(
        (sample.positionPixels.x - previous.positionPixels.x) /
          canvasBounds.width,
        (sample.positionPixels.y - previous.positionPixels.y) /
          canvasBounds.height,
      ) + Number.EPSILON * 8 >=
        STANDARD_GESTURE_CONFIG.minimumIntermediateDistanceSafeFraction
    ) {
      productionLikeSamples.push(sample);
    }
  }

  const viewport = {
    widthPixels: canvasBounds.width,
    heightPixels: canvasBounds.height,
  };
  const preprocessed = preprocessGesture(
    productionLikeSamples,
    viewport,
    STANDARD_GESTURE_CONFIG,
  );
  const reconstructed = preprocessed.accepted
    ? analyzeStandardGesture(
        preprocessed.points,
        viewport,
        STANDARD_GESTURE_CONFIG,
      )
    : null;
  const reconstructedSegments = productionLikeSamples.slice(1).map((sample, index) => {
    const previous = productionLikeSamples[index];
    const gapSeconds =
      previous === undefined ? Number.NaN : sample.timeSeconds - previous.timeSeconds;
    const distanceSafeFraction =
      previous === undefined
        ? Number.NaN
        : Math.hypot(
            (sample.positionPixels.x - previous.positionPixels.x) /
              canvasBounds.width,
            (sample.positionPixels.y - previous.positionPixels.y) /
              canvasBounds.height,
          );
    return {
      index,
      gapMilliseconds: gapSeconds * 1_000,
      distanceSafeFraction,
      speedSafeFractionsPerSecond:
        gapSeconds > 0.0001
          ? distanceSafeFraction / gapSeconds
          : null,
      zeroLength: distanceSafeFraction === 0,
      includedInProductionSpeedSeries: gapSeconds > 0.0001,
    };
  });
  const gapsMilliseconds = boundedEvents.slice(1).map((event, index) => ({
    from: boundedEvents[index]?.type ?? "unknown",
    to: event.type,
    gapMilliseconds:
      event.timeStamp - (boundedEvents[index]?.timeStamp ?? event.timeStamp),
  }));

  return {
    evidenceBounds: {
      maximumParentEvents: 16,
      maximumCoalescedEventsPerParent: 32,
      capturedParentEventCount: events.length,
      capturedRawEventCount: rawEvents.length,
      parentEventsTruncated: events.length > boundedEvents.length,
    },
    reconstructionNotice:
      "Feature values below are reconstructed with production preprocessing and feature functions from the bounded native parent/coalesced event trace. The accepted activeShot.power is authoritative; reconstruction can differ if Chromium exposes coalesced samples differently across listeners.",
    nativePointer: {
      events: boundedEvents,
      gapsMilliseconds,
      durationMilliseconds: commitment.pointer.durationMilliseconds,
      maximumSampleGapMilliseconds:
        commitment.pointer.maximumSampleGapMilliseconds,
      productionMaximumSampleGapMilliseconds:
        STANDARD_GESTURE_CONFIG.maximumSampleGapSeconds * 1_000,
      renderFramesDuringGesture:
        commitment.pointer.renderFramesDuringGesture,
      productionRejectionReason:
        commitment.pointer.productionRejectionReason,
    },
    geometry: {
      canvasBounds,
      viewport,
      normalizedNativeSamples: nativeSamples.map((sample) => ({
        x: sample.positionPixels.x / canvasBounds.width,
        y: sample.positionPixels.y / canvasBounds.height,
        timeSeconds: sample.timeSeconds,
      })),
    },
    reconstructedProductionGesture: preprocessed.accepted
      ? {
          accepted: true,
          inputSamples: productionLikeSamples,
          preprocessedSamples: preprocessed.points,
          releaseSpeedSafeFractionsPerSecond:
            reconstructed?.features.releaseSpeedSafeFractionsPerSecond,
          maximumSpeedSafeFractionsPerSecond:
            reconstructed?.features.maximumSpeedSafeFractionsPerSecond,
          releaseSpeedContribution:
            reconstructed?.features.releaseSpeedContribution,
          weightedReleaseSpeedContribution:
            (reconstructed?.features.releaseSpeedContribution ?? 0) *
            STANDARD_GESTURE_CONFIG.releaseSpeedWeight,
          maximumSpeedContribution:
            reconstructed?.features.maximumSpeedContribution,
          weightedMaximumSpeedContribution:
            (reconstructed?.features.maximumSpeedContribution ?? 0) *
            STANDARD_GESTURE_CONFIG.maximumSpeedWeight,
          pathLengthContribution:
            reconstructed?.features.pathLengthContribution,
          weightedPathLengthContribution:
            (reconstructed?.features.pathLengthContribution ?? 0) *
            STANDARD_GESTURE_CONFIG.pathLengthWeight,
          usedTimingFallback: reconstructed?.features.usedTimingFallback,
          weightedPower: reconstructed?.power,
          releaseSpeedSampleCount:
            STANDARD_GESTURE_CONFIG.releaseSpeedSampleCount,
          segments: reconstructedSegments,
          releaseMedianSegments: reconstructedSegments
            .filter((segment) => segment.includedInProductionSpeedSeries)
            .slice(-STANDARD_GESTURE_CONFIG.releaseSpeedSampleCount),
          category: reconstructed?.category,
          loft: reconstructed?.loft,
          sideSpin: reconstructed?.sideSpin,
          topSpin: reconstructed?.topSpin,
          bounceIntent: reconstructed?.bounceIntent,
        }
      : {
          accepted: false,
          inputSamples: productionLikeSamples,
          rejectionReason: preprocessed.reason,
        },
    acceptedShot: releaseStart.activeShot === null
      ? null
      : {
          power: releaseStart.activeShot.power,
          target: releaseStart.activeShot.target,
          initialVelocity: releaseStart.activeShot.ball.initialVelocity,
          releaseSpeedMetersPerSecond:
            releaseStart.activeShot.ball.releaseSpeedMetersPerSecond,
          category: releaseStart.activeShot.category,
          loft: releaseStart.activeShot.ball.releaseLoft,
          sideSpin: releaseStart.activeShot.ball.releaseSideSpin,
          topSpin: releaseStart.activeShot.ball.releaseTopSpin,
          bounceIntent: releaseStart.activeShot.ball.releaseBounceIntent,
        },
    goalkeeper: {
      preReleaseCheckpoint: commitment.checkpoint.goalkeeper,
      release: releaseStart.goalkeeper,
      captureHeldAtCheckpoint: commitment.captureHeldAtCheckpoint,
      checkpointHostDurationMilliseconds:
        commitment.checkpointHostDurationMilliseconds,
    },
  };
}

function vectorAtFraction(
  from: SnapshotVector,
  to: SnapshotVector,
  fraction: number,
): SnapshotVector {
  return {
    x: from.x + (to.x - from.x) * fraction,
    y: from.y + (to.y - from.y) * fraction,
    z: from.z + (to.z - from.z) * fraction,
  };
}

function closestHighSaveApproach(
  trace: HighSaveTrace,
  keeperZone: GoalkeeperZone,
) {
  let closest:
    | Readonly<{
        frame: number;
        elapsedSeconds: number;
        ballPosition: SnapshotVector;
        keeperPosition: SnapshotVector;
        distanceMeters: number;
      }>
    | null = null;

  for (const frame of trace.frames) {
    const keeperPrevious = goalkeeperPositionDuringShot(
      keeperZone,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      frame.previousElapsedSeconds,
    );
    const keeperCurrent = goalkeeperPositionDuringShot(
      keeperZone,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      frame.elapsedSeconds,
    );
    const relativeStart = {
      x: frame.previousPosition.x - keeperPrevious.x,
      y: frame.previousPosition.y - keeperPrevious.y,
      z: frame.previousPosition.z - keeperPrevious.z,
    };
    const relativeDelta = {
      x:
        frame.position.x -
        frame.previousPosition.x -
        (keeperCurrent.x - keeperPrevious.x),
      y:
        frame.position.y -
        frame.previousPosition.y -
        (keeperCurrent.y - keeperPrevious.y),
      z:
        frame.position.z -
        frame.previousPosition.z -
        (keeperCurrent.z - keeperPrevious.z),
    };
    const relativeDeltaSquared =
      relativeDelta.x * relativeDelta.x +
      relativeDelta.y * relativeDelta.y +
      relativeDelta.z * relativeDelta.z;
    const fraction =
      relativeDeltaSquared <= Number.EPSILON
        ? 0
        : Math.max(
            0,
            Math.min(
              1,
              -(
                relativeStart.x * relativeDelta.x +
                relativeStart.y * relativeDelta.y +
                relativeStart.z * relativeDelta.z
              ) / relativeDeltaSquared,
            ),
          );
    const ballPosition = vectorAtFraction(
      frame.previousPosition,
      frame.position,
      fraction,
    );
    const keeperPosition = vectorAtFraction(
      keeperPrevious,
      keeperCurrent,
      fraction,
    );
    const distanceMeters = Math.hypot(
      ballPosition.x - keeperPosition.x,
      ballPosition.y - keeperPosition.y,
      ballPosition.z - keeperPosition.z,
    );
    if (closest === null || distanceMeters < closest.distanceMeters) {
      closest = Object.freeze({
        frame: frame.frame,
        elapsedSeconds:
          frame.previousElapsedSeconds +
          (frame.elapsedSeconds - frame.previousElapsedSeconds) * fraction,
        ballPosition,
        keeperPosition,
        distanceMeters,
      });
    }
  }

  return closest;
}

function highSaveKeeperContact(
  trace: HighSaveTrace,
  keeperZone: GoalkeeperZone,
) {
  for (const frame of trace.frames) {
    const contact = frame.contactHistory.find(
      (candidate) => candidate.kind === "KEEPER",
    );
    if (contact === undefined) {
      continue;
    }
    const keeperPosition = goalkeeperPositionDuringShot(
      keeperZone,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      contact.elapsedSeconds,
    );
    return Object.freeze({
      elapsedSeconds: contact.elapsedSeconds,
      diveProgress: goalkeeperDiveProgress(
        contact.elapsedSeconds,
        STANDARD_GOALKEEPER_CONFIG,
      ),
      ballPosition: contact.position,
      keeperPosition,
      distanceMeters: Math.hypot(
        contact.position.x - keeperPosition.x,
        contact.position.y - keeperPosition.y,
        contact.position.z - keeperPosition.z,
      ),
    });
  }
  return null;
}

async function collectHighSaveTrace(page: Page): Promise<HighSaveTrace> {
  return page.evaluate(() => {
    const frames: HighSaveTraceFrame[] = [];
    let keeperContactObserved = false;
    let firstTerminalOutcome: string | null = null;
    let goalPlaneCrossingFrame: number | null = null;

    for (let frame = 0; frame < 90; frame += 1) {
      const before = window.__DEMO__?.snapshot().activeShot?.ball;
      const previousElapsedSeconds = before?.elapsedSeconds ?? Number.NaN;
      window.__PUMP__?.(1);
      const ball = window.__DEMO__?.snapshot().activeShot?.ball;
      if (ball === undefined) {
        break;
      }
      const crossedGoalPlane =
        ball.previousPosition.z < 7 && ball.position.z >= 7;
      if (
        goalPlaneCrossingFrame === null &&
        (crossedGoalPlane ||
          ball.contactHistory.some((contact) => contact.kind === "GOAL_PLANE"))
      ) {
        goalPlaneCrossingFrame = frame;
      }
      frames.push({
        frame,
        previousElapsedSeconds,
        elapsedSeconds: ball.elapsedSeconds,
        previousPosition: { ...ball.previousPosition },
        position: { ...ball.position },
        velocity: { ...ball.velocity },
        contactHistory: ball.contactHistory.map((contact) => ({
          kind: contact.kind,
          elapsedSeconds: contact.elapsedSeconds,
          position: { ...contact.position },
          outcome: contact.outcome,
        })),
        terminalState: ball.terminalState,
      });
      keeperContactObserved = ball.contactHistory.some(
        (contact) => contact.kind === "KEEPER",
      );
      if (ball.terminalState !== null) {
        firstTerminalOutcome = ball.terminalState;
      }
      if (keeperContactObserved || firstTerminalOutcome !== null) {
        break;
      }
    }

    return {
      frames,
      keeperContactObserved,
      firstTerminalOutcome,
      goalPlaneCrossingFrame,
    };
  });
}

function expectFiniteVector(vector: SnapshotVector): void {
  expect([vector.x, vector.y, vector.z].every(Number.isFinite)).toBe(true);
}

function expectFiniteContact(contact: {
  readonly position: SnapshotVector;
  readonly normal?: SnapshotVector;
  readonly incomingVelocity?: SnapshotVector;
  readonly outgoingVelocity?: SnapshotVector;
}): void {
  expectFiniteVector(contact.position);
  if (contact.normal !== undefined) {
    expectFiniteVector(contact.normal);
  }
  if (contact.incomingVelocity !== undefined) {
    expectFiniteVector(contact.incomingVelocity);
  }
  if (contact.outgoingVelocity !== undefined) {
    expectFiniteVector(contact.outgoingVelocity);
  }
}

function expectFiniteBallState(ball: {
  readonly position: SnapshotVector;
  readonly previousPosition: SnapshotVector;
  readonly velocity: SnapshotVector;
  readonly initialVelocity: SnapshotVector;
  readonly releasePower: number;
  readonly releaseLoft: number;
  readonly releaseSideSpin: number;
  readonly releaseTopSpin: number;
  readonly releaseBounceIntent: number;
  readonly launchLiftMeters: number;
  readonly sideSpinAccelerationMetersPerSecondSquared: number;
  readonly topSpinDropAccelerationMetersPerSecondSquared: number;
  readonly releaseSpeedMetersPerSecond: number;
  readonly gravityMetersPerSecondSquared: number;
  readonly groundRestitution: number;
  readonly minimumGroundReboundSpeedMetersPerSecond: number;
  readonly maximumGroundBounces: number;
  readonly groundBounceCount: number;
  readonly elapsedSeconds: number;
}): void {
  expectFiniteVector(ball.position);
  expectFiniteVector(ball.previousPosition);
  expectFiniteVector(ball.velocity);
  expectFiniteVector(ball.initialVelocity);
  expect(
    [
      ball.releasePower,
      ball.releaseLoft,
      ball.releaseSideSpin,
      ball.releaseTopSpin,
      ball.releaseBounceIntent,
      ball.launchLiftMeters,
      ball.sideSpinAccelerationMetersPerSecondSquared,
      ball.topSpinDropAccelerationMetersPerSecondSquared,
      ball.releaseSpeedMetersPerSecond,
      ball.gravityMetersPerSecondSquared,
      ball.groundRestitution,
      ball.minimumGroundReboundSpeedMetersPerSecond,
      ball.maximumGroundBounces,
      ball.groundBounceCount,
      ball.elapsedSeconds,
    ].every(Number.isFinite),
  ).toBe(true);
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
  await expect(page.getByText("DIRECT", { exact: true })).toBeVisible();

  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    const releaseProbe = canvas as HTMLCanvasElement & {
      __ACCEPTED_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
      __BLOCKED_POINTER_DOWN_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
      __TERMINAL_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    let pointerDownCount = 0;
    canvas.addEventListener("pointerdown", () => {
      pointerDownCount += 1;
      if (pointerDownCount !== 2) {
        return;
      }
      const demo = window.__DEMO__;
      if (demo === undefined) {
        throw new Error("Demo test API is unavailable at blocked pointer down.");
      }
      releaseProbe.__BLOCKED_POINTER_DOWN_SNAPSHOT__ = demo.snapshot();
    });
    const captureTerminalSnapshot = (): void => {
      const demo = window.__DEMO__;
      if (demo === undefined) {
        throw new Error("Demo test API is unavailable while observing resolution.");
      }
      const snapshot = demo.snapshot();
      if (snapshot.resolvedShots === 1) {
        releaseProbe.__TERMINAL_SNAPSHOT__ = snapshot;
        return;
      }
      requestAnimationFrame(captureTerminalSnapshot);
    };
    requestAnimationFrame(captureTerminalSnapshot);
    canvas.addEventListener(
      "pointerup",
      () => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable at pointer release.");
        }
        releaseProbe.__ACCEPTED_RELEASE_SNAPSHOT__ = demo.snapshot();
      },
      { once: true },
    );
  });

  await dispatchAcceptedMouseSwipe(page);
  const blockedPointer = await dispatchMouseSwipe(page, {
    horizontalAim: -0.7,
  });
  const { pointerRelease, blockedPointerDown } = await page.evaluate(() => {
    const releaseProbe = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as (HTMLCanvasElement & {
      __ACCEPTED_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
      __BLOCKED_POINTER_DOWN_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    }) | null;
    if (releaseProbe === null) {
      throw new Error("Gameplay canvas is missing after pointer release.");
    }
    const pointerRelease = releaseProbe.__ACCEPTED_RELEASE_SNAPSHOT__;
    if (pointerRelease === undefined) {
      throw new Error("Accepted pointer release snapshot was not captured.");
    }
    const blockedPointerDown = releaseProbe.__BLOCKED_POINTER_DOWN_SNAPSHOT__;
    if (blockedPointerDown === undefined) {
      throw new Error("Blocked pointer-down snapshot was not captured.");
    }
    delete releaseProbe.__ACCEPTED_RELEASE_SNAPSHOT__;
    delete releaseProbe.__BLOCKED_POINTER_DOWN_SNAPSHOT__;
    return { pointerRelease, blockedPointerDown };
  });
  expect(pointerRelease.inputEnabled).toBe(false);
  expect(pointerRelease.acceptedShots).toBe(1);
  expect(pointerRelease.resolvedShots).toBe(0);
  expect(pointerRelease.outcomes).toEqual([]);
  expect(pointerRelease.activeShot?.ball).toMatchObject({
    contactHistory: [],
    terminalState: null,
  });
  expect(pointerRelease.scene.finiteTransforms).toBe(true);

  // Playwright has crossed process boundaries since pointer release, so fixed-step
  // simulation may now be either in flight or already terminal. The second real
  // Chromium gesture proves its own pointerdown occurred while input was blocked
  // instead of assuming the reset-delay window remained open.
  expect(blockedPointer.pointerType).toBe("mouse");
  expect(blockedPointer.productionRejectionReason).toBeNull();
  expect(blockedPointerDown.inputEnabled).toBe(false);
  expect(blockedPointerDown.acceptedShots).toBe(1);
  expect(blockedPointerDown.rejectedGestures).toBe(0);
  expect(blockedPointerDown.scene.finiteTransforms).toBe(true);
  const progressedBall = blockedPointerDown.activeShot?.ball;
  if (progressedBall === undefined) {
    throw new Error("Blocked-input snapshot did not retain the active shot.");
  }
  expectFiniteBallState(progressedBall);
  if (blockedPointerDown.resolvedShots === 0) {
    expect(blockedPointerDown.outcomes).toEqual([]);
    expect(progressedBall.terminalState).toBeNull();
    expect(
      progressedBall.contactHistory.filter((contact) => contact.outcome !== null),
    ).toEqual([]);
    for (const contact of progressedBall.contactHistory) {
      expect(contact).toMatchObject({
        kind: "KEEPER",
        outcome: null,
        normal: expect.any(Object),
        incomingVelocity: expect.any(Object),
        outgoingVelocity: expect.any(Object),
      });
      expectFiniteContact(contact);
      expect(contact.outgoingVelocity).not.toEqual(contact.incomingVelocity);
    }
  } else {
    expect(blockedPointerDown.resolvedShots).toBe(1);
    expect(blockedPointerDown.outcomes).toEqual(["SAVED"]);
    expect(progressedBall.terminalState).toBe("SAVED");
    expect(progressedBall.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null },
      { kind: "GROUND", outcome: "SAVED" },
    ]);
    expect(
      progressedBall.contactHistory.filter((contact) => contact.outcome !== null),
    ).toHaveLength(1);
    for (const contact of progressedBall.contactHistory) {
      expectFiniteContact(contact);
    }
  }
  expect(blockedPointerDown.feedback.hud.firstShotInstructionVisible).toBe(false);

  const afterBlockedPointer = await demoSnapshot(page);
  expect(afterBlockedPointer.acceptedShots).toBe(1);
  expect(afterBlockedPointer.rejectedGestures).toBe(0);
  expect(afterBlockedPointer.resolvedShots).toBeLessThanOrEqual(1);
  expect(afterBlockedPointer.scene.finiteTransforms).toBe(true);

  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas") as
      | (HTMLCanvasElement & { __TERMINAL_SNAPSHOT__?: unknown })
      | null;
    return canvas?.__TERMINAL_SNAPSHOT__ !== undefined;
  });
  const terminal = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas") as
      | (HTMLCanvasElement & {
          __TERMINAL_SNAPSHOT__?: ReturnType<
            NonNullable<typeof window.__DEMO__>["snapshot"]
          >;
        })
      | null;
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing at terminal resolution.");
    }
    const snapshot = canvas.__TERMINAL_SNAPSHOT__;
    if (snapshot === undefined) {
      throw new Error("Terminal snapshot was not captured.");
    }
    delete canvas.__TERMINAL_SNAPSHOT__;
    return snapshot;
  });
  expect(terminal.inputEnabled).toBe(false);
  expect(terminal.acceptedShots).toBe(1);
  expect(terminal.resolvedShots).toBe(1);
  expect(terminal.outcomes).toEqual(["SAVED"]);
  expect(terminal.activeShot?.ball).toMatchObject({
    contactHistory: [
      { kind: "KEEPER", outcome: null },
      { kind: "GROUND", outcome: "SAVED" },
    ],
    terminalState: "SAVED",
  });
  expect(
    terminal.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
  if (terminal.activeShot === null) {
    throw new Error("Terminal snapshot did not retain the resolved shot.");
  }
  expectFiniteBallState(terminal.activeShot.ball);
  for (const contact of terminal.activeShot.ball.contactHistory) {
    expectFiniteContact(contact);
  }
  expect(terminal.scene.finiteTransforms).toBe(true);

  await waitForOneShotReset(page, 1);
  const snapshot = await demoSnapshot(page);

  expect(snapshot.acceptedShots).toBe(1);
  expect(snapshot.resolvedShots).toBe(1);
  expect(snapshot.outcomes).toEqual(["SAVED"]);
  expect(snapshot.match.phase).toBe("READY");
  expect(snapshot.inputEnabled).toBe(true);
  expect(snapshot.activeShot).toBeNull();
  expect(snapshot.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
});

test("equal-aim real mouse gestures map timing-derived power to distinct physical speeds", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 1);

  const exercisePowerTrace = async (
    holdMilliseconds: number,
    expectedResolvedShots: number,
  ) => {
    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
      if (canvas === null) {
        throw new Error("Gameplay canvas is missing.");
      }
      const probe = canvas as HTMLCanvasElement & {
        __POWER_RELEASE_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
      };
      canvas.addEventListener(
        "pointerup",
        () => {
          const demo = window.__DEMO__;
          if (demo === undefined) {
            throw new Error("Demo test API is unavailable at power release.");
          }
          probe.__POWER_RELEASE_SNAPSHOT__ = demo.snapshot();
        },
        { once: true },
      );
    });

    const pointer = await dispatchAcceptedMouseSwipe(page, {
      horizontalAim: -0.7,
      verticalAim: 0,
      holdMilliseconds,
    });
    const release = await page.evaluate(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & {
            __POWER_RELEASE_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
          })
        | null;
      if (probe === null) {
        throw new Error("Gameplay canvas is missing after power release.");
      }
      const snapshot = probe.__POWER_RELEASE_SNAPSHOT__;
      if (snapshot === undefined) {
        throw new Error("Power release snapshot was not captured.");
      }
      delete probe.__POWER_RELEASE_SNAPSHOT__;
      return snapshot;
    });

    expect(release.resolvedShots).toBe(expectedResolvedShots - 1);
    expect(release.outcomes).toHaveLength(expectedResolvedShots - 1);
    const releasedShot = release.activeShot;
    if (releasedShot === null) {
      throw new Error("Physical shot state is missing at release.");
    }
    expect(release.activeShot?.ball).toMatchObject({
      releasePower: releasedShot.power,
      contactHistory: [],
      terminalState: null,
    });
    const releaseBall = releasedShot.ball;
    expect(
      Math.hypot(
        releaseBall.initialVelocity.x,
        releaseBall.initialVelocity.y,
        releaseBall.initialVelocity.z,
      ),
    ).toBeCloseTo(releaseBall.releaseSpeedMetersPerSecond, 10);
    expect(releaseBall.gravityMetersPerSecondSquared).toBe(-9.81);

    await page.waitForFunction(
      (expected) => window.__DEMO__?.snapshot().resolvedShots === expected,
      expectedResolvedShots,
    );
    const terminal = await demoSnapshot(page);
    expect(terminal.outcomes).toHaveLength(expectedResolvedShots);
    expect(terminal.activeShot?.ball.terminalState).not.toBeNull();
    expect(
      terminal.activeShot?.ball.contactHistory.filter(
        (contact) => contact.outcome !== null,
      ),
    ).toHaveLength(1);
    await page.waitForFunction(
      () => window.__DEMO__?.snapshot().inputEnabled === true,
    );

    return { pointer, release, terminal };
  };

  const slow = await exercisePowerTrace(220, 1);
  const fast = await exercisePowerTrace(40, 2);
  const slowShot = slow.release.activeShot;
  const fastShot = fast.release.activeShot;
  if (slowShot === null || fastShot === null) {
    throw new Error("Expected both accepted shots to expose release state.");
  }

  expect(fast.pointer.durationMilliseconds).toBeLessThan(
    slow.pointer.durationMilliseconds,
  );
  expect(fastShot.power).toBeGreaterThan(slowShot.power);
  expect(fastShot.ball.releaseSpeedMetersPerSecond).toBeGreaterThan(
    slowShot.ball.releaseSpeedMetersPerSecond,
  );
  expect(fastShot.target).toEqual(slowShot.target);
  expect(
    fast.terminal.activeShot?.ball.elapsedSeconds !==
      slow.terminal.activeShot?.ball.elapsedSeconds ||
      JSON.stringify(fast.terminal.activeShot?.ball.position) !==
        JSON.stringify(slow.terminal.activeShot?.ball.position),
  ).toBe(true);
  expect((await demoSnapshot(page)).resolvedShots).toBe(2);
  expect(errors).toEqual([]);
});

test("same-endpoint multi-segment pointer gestures produce distinct physical loft trajectories", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 1);

  const exerciseLoftTrace = async (
    waypointOffset: number,
    expectedResolvedShots: number,
  ) => {
    await page.evaluate((expectedResolved) => {
      const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
      if (canvas === null) {
        throw new Error("Gameplay canvas is missing.");
      }
      const probe = canvas as HTMLCanvasElement & {
        __LOFT_RELEASE_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
        __LOFT_TERMINAL_OBSERVATION__?: Readonly<{
          peakHeightMeters: number;
          snapshot: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>;
        }>;
      };
      let peakHeightMeters = Number.NEGATIVE_INFINITY;
      const observeFlight = (): void => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable during loft flight.");
        }
        const snapshot = demo.snapshot();
        const height = snapshot.activeShot?.ball.position.y;
        if (height !== undefined) {
          peakHeightMeters = Math.max(peakHeightMeters, height);
        }
        if (snapshot.resolvedShots === expectedResolved) {
          probe.__LOFT_TERMINAL_OBSERVATION__ = Object.freeze({
            peakHeightMeters,
            snapshot,
          });
          return;
        }
        requestAnimationFrame(observeFlight);
      };
      requestAnimationFrame(observeFlight);
      canvas.addEventListener(
        "pointerup",
        () => {
          const demo = window.__DEMO__;
          if (demo === undefined) {
            throw new Error("Demo test API is unavailable at loft release.");
          }
          probe.__LOFT_RELEASE_SNAPSHOT__ = demo.snapshot();
        },
        { once: true },
      );
    }, expectedResolvedShots);

    const pointer = await dispatchNativePath(page, "mouse", waypointOffset > 0
      ? [[0.5,0.95],[0.4,0.45],[0.3,0.62]]
      : [[0.5,0.95],[0.4,0.785],[0.3,0.62]], 120);
    await page.waitForFunction(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & { __LOFT_TERMINAL_OBSERVATION__?: unknown })
        | null;
      return probe?.__LOFT_TERMINAL_OBSERVATION__ !== undefined;
    });
    const observed = await page.evaluate(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & {
            __LOFT_RELEASE_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
            __LOFT_TERMINAL_OBSERVATION__?: Readonly<{
              peakHeightMeters: number;
              snapshot: ReturnType<
                NonNullable<typeof window.__DEMO__>["snapshot"]
              >;
            }>;
          })
        | null;
      if (probe === null) {
        throw new Error("Gameplay canvas is missing after loft flight.");
      }
      const release = probe.__LOFT_RELEASE_SNAPSHOT__;
      const terminal = probe.__LOFT_TERMINAL_OBSERVATION__;
      if (release === undefined || terminal === undefined) {
        throw new Error("Loft release or terminal observation is missing.");
      }
      delete probe.__LOFT_RELEASE_SNAPSHOT__;
      delete probe.__LOFT_TERMINAL_OBSERVATION__;
      return { release, terminal };
    });

    const releasedShot = observed.release.activeShot;
    if (releasedShot === null) {
      throw new Error("Loft shot state is missing at pointer release.");
    }
    expect(observed.release.resolvedShots).toBe(expectedResolvedShots - 1);
    expect(observed.release.outcomes).toHaveLength(expectedResolvedShots - 1);
    expect(releasedShot.resolved).toBe(false);
    expect(releasedShot.ball.terminalState).toBeNull();
    expect(releasedShot.ball.contactHistory).toEqual([]);
    expectFiniteBallState(releasedShot.ball);
    expect(observed.release.scene.finiteTransforms).toBe(true);

    const terminalShot = observed.terminal.snapshot.activeShot;
    if (terminalShot === null) {
      throw new Error("Loft terminal shot state is missing.");
    }
    expect(terminalShot.ball.terminalState).not.toBeNull();
    expect(terminalShot.ball.elapsedSeconds).toBeGreaterThan(0);
    expect(
      terminalShot.ball.contactHistory.filter((contact) => contact.outcome !== null),
    ).toHaveLength(1);
    expectFiniteBallState(terminalShot.ball);
    for (const contact of terminalShot.ball.contactHistory) {
      expectFiniteContact(contact);
    }
    expect(observed.terminal.snapshot.scene.finiteTransforms).toBe(true);
    expect(Number.isFinite(observed.terminal.peakHeightMeters)).toBe(true);
    await waitForOneShotReset(page, expectedResolvedShots);

    return { pointer, ...observed };
  };

  const low = await exerciseLoftTrace(-0.12, 1);
  const high = await exerciseLoftTrace(0.12, 2);
  const lowShot = low.release.activeShot;
  const highShot = high.release.activeShot;
  if (lowShot === null || highShot === null) {
    throw new Error("Expected both loft releases to retain active shots.");
  }

  const endpoint = (trace: PointerGestureEvidence) => ({
    start: trace.events[0],
    end: trace.events.at(-1),
  });
  expect(
    low.pointer.events.filter((event) => event.type === "pointermove").length,
  ).toBeGreaterThanOrEqual(1);
  expect(
    high.pointer.events.filter((event) => event.type === "pointermove").length,
  ).toBeGreaterThanOrEqual(1);
  expect(endpoint(low.pointer).start?.clientX).toBe(endpoint(high.pointer).start?.clientX);
  expect(endpoint(low.pointer).start?.clientY).toBe(endpoint(high.pointer).start?.clientY);
  expect(endpoint(low.pointer).end?.clientX).toBe(endpoint(high.pointer).end?.clientX);
  expect(endpoint(low.pointer).end?.clientY).toBe(endpoint(high.pointer).end?.clientY);
  expect(lowShot.target).toEqual(highShot.target);
  expect(Math.abs(lowShot.power - highShot.power)).toBeLessThan(0.03);
  expect(
    Math.abs(
      lowShot.ball.releaseSpeedMetersPerSecond -
        highShot.ball.releaseSpeedMetersPerSecond,
    ),
  ).toBeLessThan(0.5);
  expect(highShot.ball.releaseLoft).toBeGreaterThan(lowShot.ball.releaseLoft);
  expect(highShot.ball.initialVelocity.y).toBeGreaterThan(
    lowShot.ball.initialVelocity.y,
  );
  expect(high.terminal.peakHeightMeters).toBeGreaterThan(
    low.terminal.peakHeightMeters,
  );
  expect((await demoSnapshot(page)).resolvedShots).toBe(2);
  expect(errors).toEqual([]);
});

test("mirrored same-endpoint Pointer Events gestures produce opposite physical side-spin curves", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 1);

  const exerciseSideSpinTrace = async (
    waypointOffset: number,
    expectedResolvedShots: number,
  ) => {
    await page.evaluate((expectedResolved) => {
      const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
      if (canvas === null) {
        throw new Error("Gameplay canvas is missing.");
      }
      const probe = canvas as HTMLCanvasElement & {
        __SPIN_RELEASE_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
        __SPIN_FLIGHT_OBSERVATION__?: Readonly<{
          curveDisplacementMeters: number;
          snapshot: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>;
        }>;
        __SPIN_TERMINAL_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
      };
      const observeFlight = (): void => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable during side-spin flight.");
        }
        const snapshot = demo.snapshot();
        const ball = snapshot.activeShot?.ball;
        if (
          probe.__SPIN_FLIGHT_OBSERVATION__ === undefined &&
          ball !== undefined &&
          ball.terminalState === null &&
          ball.elapsedSeconds >= 0.1
        ) {
          probe.__SPIN_FLIGHT_OBSERVATION__ = Object.freeze({
            curveDisplacementMeters:
              ball.position.x - ball.initialVelocity.x * ball.elapsedSeconds,
            snapshot,
          });
        }
        if (snapshot.resolvedShots === expectedResolved) {
          probe.__SPIN_TERMINAL_SNAPSHOT__ = snapshot;
          return;
        }
        requestAnimationFrame(observeFlight);
      };
      requestAnimationFrame(observeFlight);
      canvas.addEventListener(
        "pointerup",
        () => {
          const demo = window.__DEMO__;
          if (demo === undefined) {
            throw new Error("Demo test API is unavailable at side-spin release.");
          }
          probe.__SPIN_RELEASE_SNAPSHOT__ = demo.snapshot();
        },
        { once: true },
      );
    }, expectedResolvedShots);

    const pointer = await dispatchAcceptedMouseSwipe(page, {
      horizontalAim: 0,
      verticalAim: 0,
      sideSpinWaypointOffsetSafeFraction: waypointOffset,
    });
    await page.waitForFunction(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & { __SPIN_TERMINAL_SNAPSHOT__?: unknown })
        | null;
      return probe?.__SPIN_TERMINAL_SNAPSHOT__ !== undefined;
    });
    const observed = await page.evaluate(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & {
            __SPIN_RELEASE_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
            __SPIN_FLIGHT_OBSERVATION__?: Readonly<{
              curveDisplacementMeters: number;
              snapshot: ReturnType<
                NonNullable<typeof window.__DEMO__>["snapshot"]
              >;
            }>;
            __SPIN_TERMINAL_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
          })
        | null;
      if (probe === null) {
        throw new Error("Gameplay canvas is missing after side-spin flight.");
      }
      const release = probe.__SPIN_RELEASE_SNAPSHOT__;
      const flight = probe.__SPIN_FLIGHT_OBSERVATION__;
      const terminal = probe.__SPIN_TERMINAL_SNAPSHOT__;
      if (release === undefined || flight === undefined || terminal === undefined) {
        throw new Error("Side-spin release, flight, or terminal proof is missing.");
      }
      delete probe.__SPIN_RELEASE_SNAPSHOT__;
      delete probe.__SPIN_FLIGHT_OBSERVATION__;
      delete probe.__SPIN_TERMINAL_SNAPSHOT__;
      return { release, flight, terminal };
    });

    const releasedShot = observed.release.activeShot;
    const flightShot = observed.flight.snapshot.activeShot;
    const terminalShot = observed.terminal.activeShot;
    if (releasedShot === null || flightShot === null || terminalShot === null) {
      throw new Error("Side-spin proof did not retain its authoritative shot state.");
    }
    expect(releasedShot.resolved).toBe(false);
    expect(releasedShot.ball.terminalState).toBeNull();
    expect(releasedShot.ball.contactHistory).toEqual([]);
    expect(flightShot.ball.terminalState).toBeNull();
    expect(terminalShot.ball.terminalState).not.toBeNull();
    expect(
      terminalShot.ball.contactHistory.filter((contact) => contact.outcome !== null),
    ).toHaveLength(1);
    if (terminalShot.ball.terminalState === "SAVED") {
      expect(
        terminalShot.ball.contactHistory.some((contact) => contact.kind === "KEEPER"),
      ).toBe(true);
    }
    for (const snapshot of [
      observed.release,
      observed.flight.snapshot,
      observed.terminal,
    ]) {
      if (snapshot.activeShot === null) {
        throw new Error("Side-spin snapshot unexpectedly lost active shot state.");
      }
      expectFiniteBallState(snapshot.activeShot.ball);
      expect(snapshot.scene.finiteTransforms).toBe(true);
    }
    for (const contact of terminalShot.ball.contactHistory) {
      expectFiniteContact(contact);
    }
    await waitForOneShotReset(page, expectedResolvedShots);
    return { pointer, ...observed };
  };

  const left = await exerciseSideSpinTrace(-0.1, 1);
  const right = await exerciseSideSpinTrace(0.1, 2);
  const leftShot = left.release.activeShot;
  const rightShot = right.release.activeShot;
  if (leftShot === null || rightShot === null) {
    throw new Error("Expected both side-spin releases to retain active shots.");
  }

  const endpoint = (trace: PointerGestureEvidence) => ({
    start: trace.events[0],
    end: trace.events.at(-1),
  });
  expect(endpoint(left.pointer).start?.clientX).toBe(endpoint(right.pointer).start?.clientX);
  expect(endpoint(left.pointer).start?.clientY).toBe(endpoint(right.pointer).start?.clientY);
  expect(endpoint(left.pointer).end?.clientX).toBe(endpoint(right.pointer).end?.clientX);
  expect(endpoint(left.pointer).end?.clientY).toBe(endpoint(right.pointer).end?.clientY);
  expect(leftShot.target).toEqual(rightShot.target);
  expect(leftShot.ball.releaseSideSpin).toBeLessThan(0);
  expect(rightShot.ball.releaseSideSpin).toBeGreaterThan(0);
  expect(rightShot.ball.releaseSideSpin).toBeCloseTo(
    -leftShot.ball.releaseSideSpin,
    5,
  );
  expect(leftShot.ball.sideSpinAccelerationMetersPerSecondSquared).toBeGreaterThan(0);
  expect(rightShot.ball.sideSpinAccelerationMetersPerSecondSquared).toBeLessThan(0);
  expect(Math.abs(leftShot.power - rightShot.power)).toBeLessThan(0.03);
  expect(Math.abs(leftShot.ball.releaseLoft - rightShot.ball.releaseLoft)).toBeLessThan(
    0.03,
  );
  expect(
    Math.abs(
      leftShot.ball.releaseSpeedMetersPerSecond -
        rightShot.ball.releaseSpeedMetersPerSecond,
    ),
  ).toBeLessThan(0.5);
  expect(left.flight.curveDisplacementMeters).toBeGreaterThan(0.01);
  expect(right.flight.curveDisplacementMeters).toBeLessThan(-0.01);
  expect((await demoSnapshot(page)).resolvedShots).toBe(2);
  expect(errors).toEqual([]);
});

test("same-endpoint downward-bowed Pointer Events gesture produces physical top-spin drop", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 1);

  const exerciseTopSpinTrace = async (
    waypointOffset: number,
    expectedResolvedShots: number,
  ) => {
    await page.evaluate((expectedResolved) => {
      const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
      if (canvas === null) {
        throw new Error("Gameplay canvas is missing.");
      }
      const probe = canvas as HTMLCanvasElement & {
        __TOP_SPIN_RELEASE_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
        __TOP_SPIN_FLIGHT_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
        __TOP_SPIN_TERMINAL_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
      };
      const observeFlight = (): void => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable during top-spin flight.");
        }
        const snapshot = demo.snapshot();
        const ball = snapshot.activeShot?.ball;
        if (
          probe.__TOP_SPIN_FLIGHT_SNAPSHOT__ === undefined &&
          ball !== undefined &&
          ball.terminalState === null &&
          ball.elapsedSeconds >= 0.1
        ) {
          probe.__TOP_SPIN_FLIGHT_SNAPSHOT__ = snapshot;
        }
        if (snapshot.resolvedShots === expectedResolved) {
          probe.__TOP_SPIN_TERMINAL_SNAPSHOT__ = snapshot;
          return;
        }
        requestAnimationFrame(observeFlight);
      };
      requestAnimationFrame(observeFlight);
      canvas.addEventListener(
        "pointerup",
        () => {
          const demo = window.__DEMO__;
          if (demo === undefined) {
            throw new Error("Demo test API is unavailable at top-spin release.");
          }
          probe.__TOP_SPIN_RELEASE_SNAPSHOT__ = demo.snapshot();
        },
        { once: true },
      );
    }, expectedResolvedShots);

    const pointer = await dispatchAcceptedMouseSwipe(page, {
      horizontalAim: 0,
      verticalAim: 0,
      topSpinWaypointOffsetSafeFraction: waypointOffset,
    });
    await page.waitForFunction(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & { __TOP_SPIN_TERMINAL_SNAPSHOT__?: unknown })
        | null;
      return probe?.__TOP_SPIN_TERMINAL_SNAPSHOT__ !== undefined;
    });
    const observed = await page.evaluate(() => {
      const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & {
            __TOP_SPIN_RELEASE_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
            __TOP_SPIN_FLIGHT_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
            __TOP_SPIN_TERMINAL_SNAPSHOT__?: ReturnType<
              NonNullable<typeof window.__DEMO__>["snapshot"]
            >;
          })
        | null;
      if (probe === null) {
        throw new Error("Gameplay canvas is missing after top-spin flight.");
      }
      const release = probe.__TOP_SPIN_RELEASE_SNAPSHOT__;
      const flight = probe.__TOP_SPIN_FLIGHT_SNAPSHOT__;
      const terminal = probe.__TOP_SPIN_TERMINAL_SNAPSHOT__;
      if (release === undefined || flight === undefined || terminal === undefined) {
        throw new Error("Top-spin release, flight, or terminal proof is missing.");
      }
      delete probe.__TOP_SPIN_RELEASE_SNAPSHOT__;
      delete probe.__TOP_SPIN_FLIGHT_SNAPSHOT__;
      delete probe.__TOP_SPIN_TERMINAL_SNAPSHOT__;
      return { release, flight, terminal };
    });

    const releaseShot = observed.release.activeShot;
    const flightShot = observed.flight.activeShot;
    const terminalShot = observed.terminal.activeShot;
    if (releaseShot === null || flightShot === null || terminalShot === null) {
      throw new Error("Top-spin proof did not retain its authoritative shot state.");
    }
    expect(releaseShot.resolved).toBe(false);
    expect(releaseShot.ball.elapsedSeconds).toBe(0);
    expect(releaseShot.ball.terminalState).toBeNull();
    expect(releaseShot.ball.contactHistory).toEqual([]);
    expect(flightShot.ball.terminalState).toBeNull();
    expect(terminalShot.ball.terminalState).not.toBeNull();
    expect(
      terminalShot.ball.contactHistory.filter((contact) => contact.outcome !== null),
    ).toHaveLength(1);
    if (terminalShot.ball.terminalState === "SAVED") {
      expect(
        terminalShot.ball.contactHistory.some((contact) => contact.kind === "KEEPER"),
      ).toBe(true);
    }
    for (const snapshot of [
      observed.release,
      observed.flight,
      observed.terminal,
    ]) {
      if (snapshot.activeShot === null) {
        throw new Error("Top-spin snapshot unexpectedly lost active shot state.");
      }
      expectFiniteBallState(snapshot.activeShot.ball);
      expect(snapshot.scene.finiteTransforms).toBe(true);
    }
    for (const contact of terminalShot.ball.contactHistory) {
      expectFiniteContact(contact);
    }

    const elapsed = flightShot.ball.elapsedSeconds;
    const baseGravityHeight =
      releaseShot.ball.position.y +
      releaseShot.ball.initialVelocity.y * elapsed +
      0.5 * releaseShot.ball.gravityMetersPerSecondSquared * elapsed * elapsed;
    const additionalDropMeters = baseGravityHeight - flightShot.ball.position.y;
    expect(additionalDropMeters).toBeCloseTo(
      0.5 *
        releaseShot.ball.topSpinDropAccelerationMetersPerSecondSquared *
        elapsed *
        elapsed,
      8,
    );
    await waitForOneShotReset(page, expectedResolvedShots);
    return { pointer, additionalDropMeters, ...observed };
  };

  const neutral = await exerciseTopSpinTrace(0, 1);
  const downward = await exerciseTopSpinTrace(0.06, 2);
  const neutralShot = neutral.release.activeShot;
  const downwardShot = downward.release.activeShot;
  if (neutralShot === null || downwardShot === null) {
    throw new Error("Expected both top-spin releases to retain active shots.");
  }

  const endpoint = (trace: PointerGestureEvidence) => ({
    start: trace.events[0],
    end: trace.events.at(-1),
  });
  expect(endpoint(neutral.pointer).start?.clientX).toBe(
    endpoint(downward.pointer).start?.clientX,
  );
  expect(endpoint(neutral.pointer).start?.clientY).toBe(
    endpoint(downward.pointer).start?.clientY,
  );
  expect(endpoint(neutral.pointer).end?.clientX).toBe(
    endpoint(downward.pointer).end?.clientX,
  );
  expect(endpoint(neutral.pointer).end?.clientY).toBe(
    endpoint(downward.pointer).end?.clientY,
  );
  expect(neutralShot.target).toEqual(downwardShot.target);
  expect(downwardShot.ball.releaseTopSpin).toBeGreaterThan(
    neutralShot.ball.releaseTopSpin,
  );
  expect(downwardShot.ball.topSpinDropAccelerationMetersPerSecondSquared).toBeGreaterThan(
    neutralShot.ball.topSpinDropAccelerationMetersPerSecondSquared,
  );
  expect(neutralShot.ball.releaseLoft).toBeLessThan(0.03);
  expect(downwardShot.ball.releaseLoft).toBeLessThan(0.03);
  expect(neutralShot.ball.releaseSideSpin).toBeCloseTo(0, 12);
  expect(downwardShot.ball.releaseSideSpin).toBeCloseTo(0, 12);
  expect(downward.additionalDropMeters).toBeGreaterThan(
    neutral.additionalDropMeters + 0.01,
  );
  expect((await demoSnapshot(page)).resolvedShots).toBe(2);
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

test("a real low pointer swipe rebounds from swept ground contact before scoring", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 1);

  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    const releaseProbe = canvas as HTMLCanvasElement & {
      __GROUND_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
      __GROUND_REBOUND_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    const captureReboundSnapshot = (): void => {
      const demo = window.__DEMO__;
      if (demo === undefined) {
        throw new Error("Demo test API is unavailable while observing rebound.");
      }
      const snapshot = demo.snapshot();
      const ball = snapshot.activeShot?.ball;
      if (
        ball !== undefined &&
        ball.terminalState === null &&
        ball.contactHistory.some(
          (contact) => contact.kind === "GROUND" && contact.outcome === null,
        )
      ) {
        releaseProbe.__GROUND_REBOUND_SNAPSHOT__ = snapshot;
        return;
      }
      if (snapshot.resolvedShots === 0) {
        requestAnimationFrame(captureReboundSnapshot);
      }
    };
    requestAnimationFrame(captureReboundSnapshot);
    canvas.addEventListener(
      "pointerup",
      () => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable at pointer release.");
        }
        releaseProbe.__GROUND_RELEASE_SNAPSHOT__ = demo.snapshot();
      },
      { once: true },
    );
  });

  const pointerEvidence = await dispatchNativePath(page, "mouse",
    [[0.5,0.62],[0.42,0.89],[0.346,0.55]],180);
  const released = await page.evaluate(() => {
    const releaseProbe = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as (HTMLCanvasElement & {
      __GROUND_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    }) | null;
    if (releaseProbe === null) {
      throw new Error("Gameplay canvas is missing after pointer release.");
    }
    const snapshot = releaseProbe.__GROUND_RELEASE_SNAPSHOT__;
    if (snapshot === undefined) {
      throw new Error("Post-release gameplay snapshot was not captured.");
    }
    delete releaseProbe.__GROUND_RELEASE_SNAPSHOT__;
    return snapshot;
  });
  expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
  expect(released.inputEnabled).toBe(false);
  expect(released.resolvedShots).toBe(0);
  expect(released.outcomes).toEqual([]);
  expect(released.activeShot?.ball).toMatchObject({
    releaseBounceIntent: 1,
    groundRestitution: 0.72,
    groundBounceCount: 0,
    contactHistory: [],
    terminalState: null,
  });
  const releasedBall = released.activeShot?.ball;
  if (releasedBall === undefined) {
    throw new Error("Ground-path release did not expose physical ball state.");
  }
  expect(releasedBall.releasePower).toBe(released.activeShot?.power);
  expect(releasedBall.releaseSpeedMetersPerSecond).toBeGreaterThan(0);
  expect(
    Math.hypot(
      releasedBall.initialVelocity.x,
      releasedBall.initialVelocity.y,
      releasedBall.initialVelocity.z,
    ),
  ).toBeCloseTo(releasedBall.releaseSpeedMetersPerSecond, 10);

  await page.waitForFunction(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas") as
      | (HTMLCanvasElement & { __GROUND_REBOUND_SNAPSHOT__?: unknown })
      | null;
    return canvas?.__GROUND_REBOUND_SNAPSHOT__ !== undefined;
  });
  const rebound = await page.evaluate(() => {
    const probe = document.querySelector<HTMLCanvasElement>("#game-canvas") as
      | (HTMLCanvasElement & {
          __GROUND_REBOUND_SNAPSHOT__?: ReturnType<
            NonNullable<typeof window.__DEMO__>["snapshot"]
          >;
        })
      | null;
    if (probe?.__GROUND_REBOUND_SNAPSHOT__ === undefined) {
      throw new Error("Nonterminal ground rebound snapshot was not captured.");
    }
    const snapshot = probe.__GROUND_REBOUND_SNAPSHOT__;
    delete probe.__GROUND_REBOUND_SNAPSHOT__;
    return snapshot;
  });
  const reboundBall = rebound.activeShot?.ball;
  if (reboundBall === undefined) {
    throw new Error("Ground rebound did not retain authoritative ball state.");
  }
  expect(rebound.resolvedShots).toBe(0);
  expect(reboundBall.terminalState).toBeNull();
  expect(reboundBall.groundBounceCount).toBe(1);
  expect(reboundBall.contactHistory).toHaveLength(1);
  const groundContact = reboundBall.contactHistory[0];
  expect(groundContact).toMatchObject({
    kind: "GROUND",
    outcome: null,
    normal: { x: 0, y: 1, z: 0 },
  });
  expect(groundContact?.incomingVelocity?.y).toBeLessThan(0);
  expect(groundContact?.outgoingVelocity?.y).toBeGreaterThan(0);
  expect(groundContact?.position.y).toBeCloseTo(0.094, 12);
  expectFiniteBallState(reboundBall);
  if (groundContact !== undefined) {
    expectFiniteContact(groundContact);
  }
  expect(rebound.scene.finiteTransforms).toBe(true);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().resolvedShots === 1,
  );
  const resolved = await demoSnapshot(page);
  expect(resolved.resolvedShots).toBe(1);
  expect(resolved.outcomes).toEqual(["GOAL"]);
  expect(resolved.activeShot?.ball).toMatchObject({
    releaseBounceIntent: 1,
    groundRestitution: 0.72,
    groundBounceCount: 1,
    contactHistory: [
      { kind: "GROUND", outcome: null },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ],
    terminalState: "GOAL",
  });
  expect(resolved.activeShot?.ball.contactHistory).toHaveLength(2);
  expect(resolved.activeShot?.ball.contactHistory[0]?.position.y).toBeCloseTo(
    0.094,
    12,
  );
  expect(
    resolved.activeShot?.ball.contactHistory[0]?.position.z,
  ).toBeLessThan(7);
  expect(resolved.scene.finiteTransforms).toBe(true);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const reset = await demoSnapshot(page);
  expect(reset.resolvedShots).toBe(1);
  expect(reset.outcomes).toEqual(["GOAL"]);
  expect(reset.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
});

test("a real edge pointer swipe rebounds from a post before resolving", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 1);

  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    const releaseProbe = canvas as HTMLCanvasElement & {
      __POST_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    canvas.addEventListener(
      "pointerup",
      () => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable at pointer release.");
        }
        releaseProbe.__POST_RELEASE_SNAPSHOT__ = demo.snapshot();
      },
      { once: true },
    );
  });

  const pointerEvidence = await dispatchAcceptedMouseSwipe(page, {
    horizontalAim: 0.9,
    stabilizeStraightReleasePower: true,
    requirePresentedFrame: true,
  });
  const released = await page.evaluate(() => {
    const releaseProbe = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as (HTMLCanvasElement & {
      __POST_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    }) | null;
    if (releaseProbe === null) {
      throw new Error("Gameplay canvas is missing after pointer release.");
    }
    const snapshot = releaseProbe.__POST_RELEASE_SNAPSHOT__;
    if (snapshot === undefined) {
      throw new Error("Post-release gameplay snapshot was not captured.");
    }
    delete releaseProbe.__POST_RELEASE_SNAPSHOT__;
    return snapshot;
  });
  expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
  expect(released.inputEnabled).toBe(false);
  expect(released.resolvedShots).toBe(0);
  expect(released.outcomes).toEqual([]);
  expect(released.activeShot?.ball).toMatchObject({
    contactHistory: [],
    terminalState: null,
  });
  expect(released.activeShot?.ball.releaseSideSpin).toBeCloseTo(0, 10);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().resolvedShots === 1,
  );
  const resolved = await demoSnapshot(page);
  expect(resolved.resolvedShots).toBe(1);
  expect(resolved.outcomes).toEqual(["GOAL"]);
  expect(resolved.activeShot?.ball.terminalState).toBe("GOAL");
  expect(resolved.activeShot?.ball.contactHistory).toMatchObject([
    {
      kind: "VERTICAL_POST",
      post: "LEFT",
      outcome: null,
    },
    { kind: "GOAL_PLANE", outcome: "GOAL" },
  ]);
  expect(
    resolved.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
  expect(
    resolved.activeShot?.ball.contactHistory[0]?.incomingVelocity,
  ).not.toEqual(resolved.activeShot?.ball.contactHistory[0]?.outgoingVelocity);
  expect(resolved.scene.finiteTransforms).toBe(true);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const reset = await demoSnapshot(page);
  expect(reset.resolvedShots).toBe(1);
  expect(reset.outcomes).toEqual(["GOAL"]);
  expect(reset.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
});

test("a real high pointer swipe rebounds from the crossbar before resolving", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  // A diagonal high endpoint clears both HOLD and the observed cue commitment.
  // The seed alone does not keep a centered shot clear of a high-center keeper.
  await openReady(page, 2);

  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    const releaseProbe = canvas as HTMLCanvasElement & {
      __CROSSBAR_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    canvas.addEventListener(
      "pointerup",
      () => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable at pointer release.");
        }
        releaseProbe.__CROSSBAR_RELEASE_SNAPSHOT__ = demo.snapshot();
      },
      { once: true },
    );
  });

  const pointerEvidence = await dispatchAcceptedMouseSwipe(page, {
    horizontalAim: 0.7,
    verticalAim: 1,
    // Collinear non-zero segments keep release power independent of
    // whether Chromium separates its final move and pointerup timestamps,
    // without adding meaningful loft, side-spin, or top-spin.
    topSpinWaypointOffsetSafeFraction: 0,
    stabilizeStraightReleasePower: true,
    requirePresentedFrame: true,
  });
  const released = await page.evaluate(() => {
    const releaseProbe = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as (HTMLCanvasElement & {
      __CROSSBAR_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    }) | null;
    if (releaseProbe === null) {
      throw new Error("Gameplay canvas is missing after pointer release.");
    }
    const snapshot = releaseProbe.__CROSSBAR_RELEASE_SNAPSHOT__;
    if (snapshot === undefined) {
      throw new Error("Post-release gameplay snapshot was not captured.");
    }
    delete releaseProbe.__CROSSBAR_RELEASE_SNAPSHOT__;
    return snapshot;
  });
  expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
  expect(released.inputEnabled).toBe(false);
  expect(released.resolvedShots).toBe(0);
  expect(released.outcomes).toEqual([]);
  expect(released.activeShot?.ball).toMatchObject({
    contactHistory: [],
    terminalState: null,
  });
  expect(released.activeShot?.ball.releasePower).toBeGreaterThanOrEqual(0.9);
  expect(
    Math.abs(released.activeShot?.ball.releaseLoft ?? Number.NaN),
  ).toBeLessThan(1e-6);
  expect(released.activeShot?.ball.releaseSideSpin).toBeCloseTo(0, 10);
  expect(released.activeShot?.ball.releaseTopSpin).toBe(0);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().resolvedShots === 1,
  );
  const resolved = await demoSnapshot(page);
  await test.info().attach("crossbar-native-release-and-contacts", {
    contentType: "application/json",
    body: JSON.stringify({ pointerEvidence, released, resolved }),
  });
  expect(resolved.resolvedShots).toBe(1);
  expect(resolved.outcomes).toEqual(["MISS"]);
  expect(resolved.activeShot?.ball.terminalState).toBe("MISS");
  expect(resolved.activeShot?.ball.contactHistory).toMatchObject([
    { kind: "CROSSBAR", outcome: null },
    { kind: "GROUND", outcome: "MISS" },
  ]);
  expect(resolved.activeShot?.ball.contactHistory[0]?.incomingVelocity).not.toEqual(
    resolved.activeShot?.ball.contactHistory[0]?.outgoingVelocity,
  );
  expect(
    resolved.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
  expect(resolved.scene.finiteTransforms).toBe(true);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const reset = await demoSnapshot(page);
  expect(reset.resolvedShots).toBe(1);
  expect(reset.outcomes).toEqual(["MISS"]);
  expect(reset.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
});

test("five real gestures complete a round and restart restores ready state", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page);
  // Use a straight trace for this legacy round fixture. The former power
  // detour is now correctly interpreted as maximal top-spin and physically
  // intersects the fourth shot's seeded low-left keeper.
  const roundAims = [-0.7, 0, 1, -0.7, 1] as const;
  const resolvedFlights: Array<
    NonNullable<
      Awaited<ReturnType<typeof demoSnapshot>>["activeShot"]
    >["ball"]
  > = [];

  for (let shot = 1; shot <= 5; shot += 1) {
    const horizontalAim = roundAims[shot - 1];
    if (horizontalAim === undefined) {
      throw new Error(`Missing deterministic aim for shot ${shot}.`);
    }
    await dispatchAcceptedMouseSwipe(page, {
      horizontalAim,
      // Collinear non-zero segments keep release power independent of
      // whether Chromium separates its final move and pointerup timestamps.
      topSpinWaypointOffsetSafeFraction: 0,
    });
    const released = await demoSnapshot(page);
    expect(released.activeShot?.power).toBeGreaterThanOrEqual(0.55);
    // CDP rounds native mouse coordinates to float32. At this 960x540 fixture,
    // the intended collinear midpoint can therefore resolve to about 4e-6 CSS
    // pixels above the cumulative-length chord (roughly 6.3e-8 loft). Keep the
    // bound far below one physical pixel and the 0.12 full-range loft gesture.
    expect(Math.abs(released.activeShot?.ball.releaseLoft ?? Number.NaN)).toBeLessThan(
      1e-6,
    );
    // Side-spin's production geometry-noise dead zone guarantees exact neutral
    // output for the same float32-rounded collinear trace.
    expect(released.activeShot?.ball.releaseSideSpin).toBe(0);
    expect(released.activeShot?.ball.releaseTopSpin).toBe(0);
    await page.waitForFunction(
      (expected) => window.__DEMO__?.snapshot().resolvedShots === expected,
      shot,
    );
    const resolved = await demoSnapshot(page);
    if (resolved.activeShot === null) {
      throw new Error(`Resolved shot ${shot} lost its physical flight evidence.`);
    }
    resolvedFlights.push(resolved.activeShot.ball);
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
  for (const flight of resolvedFlights) {
    if (flight.terminalState === "SAVED") {
      expect(flight.contactHistory.some((contact) => contact.kind === "KEEPER")).toBe(
        true,
      );
    }
  }
  expect(resolvedFlights[3]).toMatchObject({
    contactHistory: [{ kind: "GOAL_PLANE", outcome: "GOAL" }],
    terminalState: "GOAL",
  });
  expect(completed.activeShot?.ball).toMatchObject({
    contactHistory: [
      { kind: "VERTICAL_POST", outcome: null },
      { kind: "GROUND", outcome: "MISS" },
    ],
    terminalState: "MISS",
  });
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
  const commitment = await dispatchMouseKeeperCommitment(
    page,
    0,
    0,
    0.72,
    true,
  );
  const movementSampleCount = commitment.pointer.events
    .filter((event) => event.type === "pointermove")
    .reduce(
      (count, event) =>
        count + Math.max(1, event.coalescedEvents.length),
      0,
    );
  expect(movementSampleCount).toBe(5);
  expect(commitment.captureHeldAtCheckpoint).toBe(true);
  expect(commitment.checkpoint.gestureInput).toMatchObject({
    captureActive: true,
    pointerType: "mouse",
    sampleCount: 3,
  });
  expect(commitment.checkpoint.goalkeeper).toMatchObject({
    phase: "COMMIT",
    stableCueSamples: 2,
    conflictingCue: false,
    commitmentTimeSeconds: expect.any(Number),
    committedDestination: "high-center",
    releaseDestination: null,
  });
  expect(
    commitment.checkpoint.goalkeeper.observedCue?.confidence,
  ).toBeGreaterThan(0.055);
  expect(
    commitment.checkpoint.goalkeeper.gestureElapsedSeconds,
  ).toBeGreaterThanOrEqual(0.08);

  const releaseStart = await demoSnapshot(page);
  const gestureDiagnostics = highSaveGestureDiagnostics(
    commitment,
    releaseStart,
  );
  await test.info().attach("high-save-gesture-diagnostics", {
    body: JSON.stringify(gestureDiagnostics, null, 2),
    contentType: "application/json",
  });
  if (releaseStart.activeShot === null) {
    throw new Error("The real high-save gesture did not release a shot.");
  }
  expect(releaseStart.activeShot).toMatchObject({
    category: "DIRECT",
    target: { x: 0, z: 7 },
    ball: {
      releaseLoft: 0,
      releaseSideSpin: 0,
      releaseTopSpin: 0,
      releaseBounceIntent: 0,
    },
  });
  expect(releaseStart.activeShot.target.y).toBeCloseTo(1.74592, 5);
  expect(releaseStart.activeShot.power).toBeGreaterThanOrEqual(0.5);
  await page.evaluate(() => window.__PUMP__?.(8));
  const release = await demoSnapshot(page);
  expect(release.activeShot).toMatchObject({
    keeperZone: "high-center",
    resolved: false,
    ball: {
      contactHistory: [],
      terminalState: null,
    },
  });
  expect(release.resolvedShots).toBe(0);
  expect(release.outcomes).toEqual([]);
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

  const physicalTrace = await collectHighSaveTrace(page);
  const closestApproach = closestHighSaveApproach(
    physicalTrace,
    releaseStart.activeShot.keeperZone,
  );
  const keeperContact = highSaveKeeperContact(
    physicalTrace,
    releaseStart.activeShot.keeperZone,
  );
  const physicalEvidence = {
    release: {
      keeperZone: releaseStart.activeShot.keeperZone,
      goalkeeperPhase: releaseStart.goalkeeper.phase,
      commitmentTimeSeconds:
        releaseStart.goalkeeper.commitmentTimeSeconds,
      target: releaseStart.activeShot.target,
      category: releaseStart.activeShot.category,
      power: releaseStart.activeShot.power,
      loft: releaseStart.activeShot.ball.releaseLoft,
      sideSpin: releaseStart.activeShot.ball.releaseSideSpin,
      topSpin: releaseStart.activeShot.ball.releaseTopSpin,
      bounceIntent: releaseStart.activeShot.ball.releaseBounceIntent,
      initialPosition: releaseStart.activeShot.ball.position,
      initialVelocity: releaseStart.activeShot.ball.initialVelocity,
      currentPosition: releaseStart.activeShot.ball.position,
      currentVelocity: releaseStart.activeShot.ball.velocity,
    },
    contactThresholdMeters:
      STANDARD_GOALKEEPER_CONFIG.saveRadiusMeters +
      STANDARD_GOAL_CONFIG.ballRadiusMeters,
    closestApproach,
    keeperContact,
    trace: physicalTrace,
  };
  await test.info().attach("high-save-physical-diagnostics", {
    body: JSON.stringify(physicalEvidence, null, 2),
    contentType: "application/json",
  });
  expect(
    physicalTrace.keeperContactObserved,
    `The real high-save integration shot missed keeper contact. Evidence: ${JSON.stringify(physicalEvidence)}`,
  ).toBe(true);
  expect(physicalTrace.firstTerminalOutcome).toBeNull();
  expect(keeperContact?.distanceMeters).toBeCloseTo(
    STANDARD_GOALKEEPER_CONFIG.saveRadiusMeters +
      STANDARD_GOAL_CONFIG.ballRadiusMeters,
    5,
  );
  const deflected = await demoSnapshot(page);
  expect(deflected.resolvedShots).toBe(0);
  expect(deflected.outcomes).toEqual([]);
  expect(deflected.activeShot?.ball).toMatchObject({
    contactHistory: [
      {
        kind: "KEEPER",
        outcome: null,
        normal: expect.any(Object),
        incomingVelocity: expect.any(Object),
        outgoingVelocity: expect.any(Object),
      },
    ],
    terminalState: null,
  });
  expect(
    deflected.activeShot?.ball.contactHistory[0]?.incomingVelocity,
  ).not.toEqual(deflected.activeShot?.ball.contactHistory[0]?.outgoingVelocity);
  expect(deflected.scene.finiteTransforms).toBe(true);

  await page.evaluate(() => {
    // The physical F2 launch can remain airborne beyond the legacy 90-step
    // duration-targeted path after keeper restitution. Keep pumping the same
    // fixed simulation step; only the bounded observation ceiling is wider.
    for (let frame = 0; frame < 240; frame += 1) {
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
  expect(resolved.resolvedShots).toBe(1);
  // A physically intercepted ball may settle on the floor OR escape the
  // playable volume. The post-save terminal surface is not an aim/score contract.
  const terminalBall = resolved.activeShot!.ball;
  const contacts = terminalBall.contactHistory;
  expect(contacts).toHaveLength(2);
  expect(contacts[0]).toMatchObject({ kind: "KEEPER", outcome: null });
  expect(contacts[1]).toMatchObject({ outcome: "SAVED" });
  expect(["GROUND", "PLAY_VOLUME"]).toContain(contacts[1]?.kind);
  expect(terminalBall.terminalState).toBe("SAVED");

  const volume = STANDARD_BALL_FLIGHT_CONFIG.playableVolume;
  const radius = STANDARD_GOAL_CONFIG.ballRadiusMeters;
  const boundaryClearances = [
    volume.halfWidthMeters - radius - Math.abs(terminalBall.position.x),
    volume.ceilingHeightMeters - radius - terminalBall.position.y,
    terminalBall.position.z - (volume.minimumZMeters + radius),
  ];
  // Verify the measured physical terminal surface, not merely the SAVED label.
  if (contacts[1]?.kind === "GROUND") {
    expect(terminalBall.position.y).toBeCloseTo(radius, 8);
    expect(contacts[1].position.y).toBeCloseTo(radius, 8);
    expect(boundaryClearances.every((clearance) => clearance >= -1e-7)).toBe(true);
  } else {
    expect(Math.min(...boundaryClearances)).toBeCloseTo(0, 8);
  }
  expect(terminalBall.elapsedSeconds).toBeGreaterThan(
    terminalBall.contactHistory[0]!.elapsedSeconds,
  );
  expectFiniteBallState(terminalBall);
  await test.info().attach("high-save-arena-terminal", {
    body: JSON.stringify({ ball: terminalBall, volume, radius, boundaryClearances }),
    contentType: "application/json",
  });
  expect(
    resolved.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
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

  await page.evaluate(() => {
    for (let frame = 0; frame < 90; frame += 1) {
      window.__PUMP__?.(1);
      if (window.__DEMO__?.snapshot().inputEnabled === true) {
        return;
      }
    }
    throw new Error("Input was not re-enabled after the keeper-deflection shot.");
  });
  const reset = await demoSnapshot(page);
  expect(reset.resolvedShots).toBe(1);
  expect(reset.outcomes).toEqual(["SAVED"]);
  expect(reset.inputEnabled).toBe(true);
  expect(reset.scene.finiteTransforms).toBe(true);
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
  // host. The longest accepted native hold lowers release speed without
  // changing the production trajectory profile or synthesizing render frames.
  await dispatchAcceptedMouseSwipe(page, {
    horizontalAim: 0,
    verticalAim: -0.3,
    holdMilliseconds: 220,
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

test("real mouse gestures classify DIRECT, LOB, and BOUNCE without preselecting outcomes", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  await openReady(page, 7);
  const cases = [
    {
      category: "DIRECT",
      options: {
        horizontalAim: 0,
        verticalAim: 0,
        requirePresentedFrame: true,
      },
    },
    {
      category: "LOB",
      options: {
        horizontalAim: 0.2,
        verticalAim: 0,
        loftWaypointOffsetSafeFraction: 0.12,
        requirePresentedFrame: true,
      },
    },
    {
      category: "BOUNCE",
      options: {
        horizontalAim: -0.7,
        verticalAim: -1,
        requirePresentedFrame: true,
      },
    },
  ] as const;

  for (const [index, shotCase] of cases.entries()) {
    await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
      if (canvas === null) {
        throw new Error("Gameplay canvas is missing for category release proof.");
      }
      const releaseProbe = canvas as HTMLCanvasElement & {
        __CATEGORY_RELEASE_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
      };
      canvas.addEventListener(
        "pointerup",
        () => {
          const demo = window.__DEMO__;
          if (demo === undefined) {
            throw new Error("Demo test API is unavailable at category release.");
          }
          releaseProbe.__CATEGORY_RELEASE_SNAPSHOT__ = demo.snapshot();
        },
        { once: true },
      );
    });

    const pointerEvidence = shotCase.category === "BOUNCE"
      ? await dispatchNativePath(page, "mouse", [[0.5, 0.62], [0.44, 0.88], [0.346, 0.48]])
      : await dispatchAcceptedMouseSwipe(page, shotCase.options);
    const released = await page.evaluate(() => {
      const releaseProbe = document.querySelector<HTMLCanvasElement>(
        "#game-canvas",
      ) as (HTMLCanvasElement & {
        __CATEGORY_RELEASE_SNAPSHOT__?: ReturnType<
          NonNullable<typeof window.__DEMO__>["snapshot"]
        >;
      }) | null;
      if (releaseProbe === null) {
        throw new Error("Gameplay canvas is missing after category release.");
      }
      const snapshot = releaseProbe.__CATEGORY_RELEASE_SNAPSHOT__;
      if (snapshot === undefined) {
        throw new Error("Category release snapshot was not captured.");
      }
      delete releaseProbe.__CATEGORY_RELEASE_SNAPSHOT__;
      return snapshot;
    });
    const expectedShotCount = index + 1;

    expect(released.acceptedShots).toBe(expectedShotCount);
    expect(released.resolvedShots).toBe(index);
    expect(released.activeShot?.category).toBe(shotCase.category);
    expect(released.activeShot?.ball).toMatchObject({
      contactHistory: [],
      terminalState: null,
    });
    expect(released.feedback.hud.techniqueCategory).toBe(shotCase.category);
    expect(released.scene.finiteTransforms).toBe(true);
    expect(pointerEvidence.pointerType).toBe("mouse");
    expect(pointerEvidence.productionRejectionReason).toBeNull();
    expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
    await expect(page.locator("#hud-technique-value")).toHaveText(
      shotCase.category,
    );

    await page.waitForFunction(
      (resolvedShots) =>
        window.__DEMO__?.snapshot().resolvedShots === resolvedShots,
      expectedShotCount,
    );
    const terminal = await demoSnapshot(page);
    expect(terminal.resolvedShots).toBe(expectedShotCount);
    expect(terminal.outcomes).toHaveLength(expectedShotCount);
    expect(terminal.activeShot?.category).toBe(shotCase.category);
    expect(terminal.activeShot?.ball.terminalState).not.toBeNull();
    expect(
      terminal.activeShot?.ball.contactHistory.filter(
        (contact) => contact.outcome !== null,
      ),
    ).toHaveLength(1);
    expect(terminal.scene.finiteTransforms).toBe(true);
    await waitForOneShotReset(page, expectedShotCount);
  }

  const completed = await demoSnapshot(page);
  expect(completed.acceptedShots).toBe(3);
  expect(completed.resolvedShots).toBe(3);
  expect(completed.outcomes).toHaveLength(3);
  expect(completed.inputEnabled).toBe(true);
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
  await page.goto("/?playtest&seed=3&quality=balanced");
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) {
      throw new Error("Gameplay canvas is missing.");
    }
    const releaseProbe = canvas as HTMLCanvasElement & {
      __TOUCH_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
      __TOUCH_TERMINAL_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    };
    const captureTerminalSnapshot = (): void => {
      const demo = window.__DEMO__;
      if (demo === undefined) {
        throw new Error("Demo test API is unavailable while observing touch resolution.");
      }
      const snapshot = demo.snapshot();
      if (snapshot.resolvedShots === 1) {
        releaseProbe.__TOUCH_TERMINAL_SNAPSHOT__ = snapshot;
        return;
      }
      requestAnimationFrame(captureTerminalSnapshot);
    };
    requestAnimationFrame(captureTerminalSnapshot);
    canvas.addEventListener(
      "pointerup",
      () => {
        const demo = window.__DEMO__;
        if (demo === undefined) {
          throw new Error("Demo test API is unavailable at touch release.");
        }
        releaseProbe.__TOUCH_RELEASE_SNAPSHOT__ = demo.snapshot();
      },
      { once: true },
    );
  });
  // Use the canonical low physical path so host timing cannot move this touch
  // proof across the high-center keeper boundary. The dedicated high-save
  // scenario above retains the KEEPER -> GROUND/SAVED integration proof.
  const pointerEvidence = await dispatchNativePath(page, "touch",
    [[0.5,0.62],[0.42,0.89],[0.346,0.55]],180);

  const released = await page.evaluate(() => {
    const releaseProbe = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as (HTMLCanvasElement & {
      __TOUCH_RELEASE_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    }) | null;
    if (releaseProbe === null) {
      throw new Error("Gameplay canvas is missing after touch release.");
    }
    const snapshot = releaseProbe.__TOUCH_RELEASE_SNAPSHOT__;
    if (snapshot === undefined) {
      throw new Error("Touch release snapshot was not captured.");
    }
    delete releaseProbe.__TOUCH_RELEASE_SNAPSHOT__;
    return snapshot;
  });
  expect(released.inputEnabled).toBe(false);
  expect(released.acceptedShots).toBe(1);
  expect(released.resolvedShots).toBe(0);
  expect(released.outcomes).toEqual([]);
  expect(released.activeShot?.category).toBe("BOUNCE");
  expect(released.feedback.hud.techniqueCategory).toBe("BOUNCE");
  expect(released.activeShot?.ball).toMatchObject({
    contactHistory: [],
    terminalState: null,
  });
  expect(released.scene.finiteTransforms).toBe(true);
  await expect(page.locator("#hud-technique-value")).toHaveText("BOUNCE");
  const releasedBall = released.activeShot?.ball;
  if (releasedBall === undefined) {
    throw new Error("Touch release did not expose physical ball state.");
  }
  expectFiniteBallState(releasedBall);
  expect(releasedBall.releasePower).toBe(released.activeShot?.power);
  expect(releasedBall.releaseSpeedMetersPerSecond).toBeGreaterThan(0);
  expect(
    Math.hypot(
      releasedBall.initialVelocity.x,
      releasedBall.initialVelocity.y,
      releasedBall.initialVelocity.z,
    ),
  ).toBeCloseTo(releasedBall.releaseSpeedMetersPerSecond, 10);

  await page.waitForFunction(
    () => {
      const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas") as
        | (HTMLCanvasElement & { __TOUCH_TERMINAL_SNAPSHOT__?: unknown })
        | null;
      return canvas?.__TOUCH_TERMINAL_SNAPSHOT__ !== undefined;
    },
  );
  const resolved = await page.evaluate(() => {
    const releaseProbe = document.querySelector<HTMLCanvasElement>(
      "#game-canvas",
    ) as (HTMLCanvasElement & {
      __TOUCH_TERMINAL_SNAPSHOT__?: ReturnType<
        NonNullable<typeof window.__DEMO__>["snapshot"]
      >;
    }) | null;
    if (releaseProbe === null) {
      throw new Error("Gameplay canvas is missing at touch resolution.");
    }
    const snapshot = releaseProbe.__TOUCH_TERMINAL_SNAPSHOT__;
    if (snapshot === undefined) {
      throw new Error("Touch terminal snapshot was not captured.");
    }
    delete releaseProbe.__TOUCH_TERMINAL_SNAPSHOT__;
    return snapshot;
  });
  expect(resolved.inputEnabled).toBe(false);
  expect(resolved.lastPointerType).toBe("touch");
  expect(resolved.acceptedShots).toBe(1);
  expect(resolved.resolvedShots).toBe(1);
  expect(resolved.outcomes).toEqual(["GOAL"]);
  expect(resolved.activeShot?.category).toBe("BOUNCE");
  expect(resolved.activeShot?.ball).toMatchObject({
    releaseBounceIntent: 1,
    groundBounceCount: 1,
    contactHistory: [
      { kind: "GROUND", outcome: null },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ],
    terminalState: "GOAL",
  });
  expect(
    resolved.activeShot?.ball.contactHistory.filter(
      (contact) => contact.outcome !== null,
    ),
  ).toHaveLength(1);
  if (resolved.activeShot === null) {
    throw new Error("Touch terminal snapshot did not retain the resolved shot.");
  }
  expectFiniteBallState(resolved.activeShot.ball);
  for (const contact of resolved.activeShot.ball.contactHistory) {
    expectFiniteContact(contact);
  }
  expect(resolved.scene.finiteTransforms).toBe(true);
  expect(pointerEvidence.pointerType).toBe("touch");
  expect(pointerEvidence.productionRejectionReason).toBeNull();
  expect(pointerEvidence.presentationRequirementApplied).toBe(true);
  expect(pointerEvidence.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);

  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );
  const reset = await demoSnapshot(page);
  expect(reset.acceptedShots).toBe(1);
  expect(reset.resolvedShots).toBe(1);
  expect(reset.outcomes).toEqual(["GOAL"]);
  expect(reset.inputEnabled).toBe(true);
  expect(reset.activeShot).toBeNull();
  expect(reset.scene.finiteTransforms).toBe(true);
  expect(errors).toEqual([]);
  await context.close();
}

// Normal RAF only: no manual simulation pumping or outcome hooks.
for (const pointerType of ["mouse", "touch"] as const) {
  for (const family of ["VERTICAL_POST", "CROSSBAR", "KEEPER", "HIGH_KEEPER"] as const) {
    test(`HB-VAL-02 ${pointerType} ${family} retains RAF telemetry through ${family === "HIGH_KEEPER" ? "a high rebound reset" : "five rebound resets"}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 960, height: 540 }, hasTouch: pointerType === "touch",
        isMobile: pointerType === "touch",
      });
      const page = await context.newPage();
      const errors = collectRuntimeErrors(page);
      try {
        for (let trial = 0; trial < (family === "HIGH_KEEPER" ? 1 : 5); trial++) {
          // Match the dedicated crossbar fixture; keep the normal live keeper.
          await openReady(page, family === "HIGH_KEEPER" ? 3 : family === "CROSSBAR" ? 2 : 1);
          await page.evaluate(() => {
            type Snapshot = ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>;
            const probe = window as typeof window & {
              __HB_REBOUND__?: { frames: { wallMs: number; rendered: number; state: Snapshot }[]; done: boolean };
            };
            const record = { frames: [] as { wallMs: number; rendered: number; state: Snapshot }[], done: false };
            probe.__HB_REBOUND__ = record;
            const sample = () => {
              const state = window.__DEMO__!.snapshot();
              const canvas = document.querySelector("#game-canvas") as HTMLCanvasElement & {
                __HANDBALL_PRESENTED_FRAMES__?: number;
              };
              record.frames.push({ wallMs: performance.now(),
                rendered: canvas.__HANDBALL_PRESENTED_FRAMES__ ?? 0, state });
              record.done = state.acceptedShots === 1 && state.inputEnabled && state.activeShot === null;
              if (!record.done && record.frames.length < 1_200) requestAnimationFrame(sample);
            };
            requestAnimationFrame(sample);
          });
          const options = family === "VERTICAL_POST"
            ? { horizontalAim: 0.9, stabilizeStraightReleasePower: true, requirePresentedFrame: true }
            : family === "CROSSBAR"
              ? { horizontalAim: 0.7, verticalAim: 1, topSpinWaypointOffsetSafeFraction: 0, stabilizeStraightReleasePower: true, requirePresentedFrame: true }
              // A mid-height endpoint can hit the ground at the lower power
              // of a touch gesture extended by the real presentation wait.
              // Aim within the keeper's torso over that native timing range.
              : { horizontalAim: 0, verticalAim: 3 / 7, requirePresentedFrame: true };
          const commitment = family === "HIGH_KEEPER"
            ? (pointerType === "mouse"
                ? await dispatchMouseKeeperCommitment(page, 0, 0, 0.72, true)
                : await dispatchTouchKeeperCommitment(page, context, 0, 0, 0.72, true))
            : null;
          const pointer = commitment !== null ? commitment.pointer
            : pointerType === "mouse"
              ? await dispatchAcceptedMouseSwipe(page, options)
              : await dispatchTouchSwipe(page, context, options);
          const resetFailure = await page.waitForFunction(() => (window as typeof window & {
            __HB_REBOUND__?: { done: boolean };
          }).__HB_REBOUND__?.done === true, undefined, { timeout: 20_000 })
            .then(() => null, (error: Error) => error.message);
          const telemetry = await page.evaluate(() => (window as typeof window & {
            __HB_REBOUND__?: { frames: { wallMs: number; rendered: number;
              state: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]> }[]; done: boolean };
          }).__HB_REBOUND__!);
          const flights = telemetry.frames.filter((f) => f.state.activeShot !== null);
          const terminal = flights.find((f) => f.state.activeShot?.ball.terminalState !== null);
          const ball = terminal?.state.activeShot?.ball;
          const gaps = telemetry.frames.slice(1).map((f, i) => f.wallMs - telemetry.frames[i]!.wallMs);
          const telemetryPath = test.info().outputPath(`hb-val02-${pointerType}-${family}-${trial}.json`);
          await writeFile(telemetryPath, JSON.stringify({ pointer, commitment, telemetry, resetFailure,
              maximumRafGapMs: Math.max(...gaps),
              peakHeightMeters: Math.max(...flights.map((f) => f.state.activeShot!.ball.position.y)),
              hardwarePerformance: "PENDING HUMAN; software renderer timing is diagnostic" }));
          await test.info().attach(`hb-val02-${pointerType}-${family}-${trial}`, {
            contentType: "application/json", path: telemetryPath,
          });
          expect(resetFailure).toBeNull();
          expect(ball).toBeDefined();
          expect(ball!.contactHistory.some((c) => c.kind === (family === "HIGH_KEEPER" ? "KEEPER" : family))).toBe(true);
          if (family === "HIGH_KEEPER") {
            expect(await page.evaluate(() => window.__PUMP__ === undefined)).toBe(true);
            // Native release timing changes rebound energy. Both a return to
            // the floor and an arena-volume exit are real SAVED terminals.
            expect(ball!.contactHistory).toHaveLength(2);
            expect(ball!.contactHistory[0]!.kind).toBe("KEEPER");
            const terminalContact = ball!.contactHistory[1]!;
            expect(["GROUND", "PLAY_VOLUME"]).toContain(terminalContact.kind);
            expect(terminalContact.outcome).toBe("SAVED");
            expect(terminalContact.elapsedSeconds).toBeGreaterThan(ball!.contactHistory[0]!.elapsedSeconds);
            if (terminalContact.kind === "GROUND") {
              expect(terminalContact.position.y).toBeCloseTo(STANDARD_GOAL_CONFIG.ballRadiusMeters, 6);
              expect(ball!.velocity.y).toBeLessThan(0);
            } else {
              const volume = STANDARD_BALL_FLIGHT_CONFIG.playableVolume;
              const radius = STANDARD_GOAL_CONFIG.ballRadiusMeters;
              expect(Math.min(
                Math.abs(Math.abs(terminalContact.position.x) - (volume.halfWidthMeters - radius)),
                Math.abs(terminalContact.position.y - (volume.ceilingHeightMeters - radius)),
                Math.abs(terminalContact.position.z - (volume.minimumZMeters + radius)),
              )).toBeLessThan(1e-6);
            }
            const keeper = ball!.contactHistory[0]!;
            expect(keeper.outgoingVelocity!.y).toBeGreaterThan(5);
            // Native timing changes power and the curved keeper contact normal.
            // Verify the actual unspun ballistic arc, including apex coverage,
            // rather than assigning every upward save the same 4 m height.
            const arc = verifyHighReboundArc(keeper, ball!.gravityMetersPerSecondSquared,
              flights.filter(f => f.state.activeShot!.ball.contactHistory.length > 0).map(f => ({
                time: f.state.activeShot!.ball.elapsedSeconds,
                height: f.state.activeShot!.ball.position.y,
              })), STANDARD_GOAL_CONFIG.center.y + STANDARD_GOAL_CONFIG.heightMeters / 2 +
                STANDARD_GOAL_CONFIG.ballRadiusMeters, ball!.elapsedSeconds);
            await writeFile(test.info().outputPath(`high-rebound-${pointerType}-apex.json`), JSON.stringify(arc));
            expect(ball!.elapsedSeconds).toBeGreaterThan(0.5);
            expect(ball!.terminalState).toBe("SAVED");
            // Rendering must advance during the physical rebound, not only during RESULT.
            const rebound = flights.filter((f) => f.state.activeShot!.ball.contactHistory.length === 1
              && f.state.activeShot!.ball.terminalState === null);
            expect(rebound.length).toBeGreaterThan(2);
            expect(rebound.at(-1)!.rendered - rebound[0]!.rendered).toBeGreaterThan(1);
            expect(rebound.at(-1)!.state.simulationSeconds).toBeGreaterThan(rebound[0]!.state.simulationSeconds);
          }
          expect(ball!.contactHistory.filter((c) => c.outcome !== null)).toHaveLength(1);
          expect(ball!.elapsedSeconds).toBeLessThan(3);
          expect(flights.every((f) => f.state.scene.finiteTransforms)).toBe(true);
          expect(flights.length).toBeGreaterThan(2);
          expect(flights.at(-1)!.rendered).toBeGreaterThan(flights[0]!.rendered);
          expect(telemetry.frames.at(-1)!.state.outcomes).toHaveLength(1);
          expect(telemetry.frames.at(-1)!.state.inputEnabled).toBe(true);
          // A second native gesture must be accepted by the reset production input consumer.
          if (pointerType === "mouse") await dispatchAcceptedMouseSwipe(page, { horizontalAim: -0.7 });
          else await dispatchTouchSwipe(page, context, { horizontalAim: -0.7 });
          const nextAccepted = await demoSnapshot(page);
          await test.info().attach(`hb-val02-${pointerType}-${family}-${trial}-next-input`, {
            contentType: "application/json", body: JSON.stringify({ nextAccepted }),
          });
          expect(nextAccepted.acceptedShots).toBe(2);
          await waitForOneShotReset(page, 2);
        }
        expect(errors).toEqual([]);
      } finally { await context.close(); }
    });
  }
}


for (const pointerType of ["mouse", "touch"] as const) {
  test(`HB-VAL-01 ${pointerType} exports production traces and replays release/contact/result`, async ({ browser }) => {
    test.setTimeout(120_000); // Six native shots plus a complete round and restart.
    const context = await browser.newContext({ viewport: { width: 960, height: 540 },
      hasTouch: pointerType === "touch", isMobile: pointerType === "touch" });
    const page = await context.newPage();
    const errors = collectRuntimeErrors(page);
    const externalRequests: string[] = [];
    try {
      await openReady(page);
      const localOrigin = new URL(page.url()).origin;
      page.on("request", (request) => {
        if (new URL(request.url()).origin !== localOrigin) externalRequests.push(request.url());
      });
      await expect(page.locator("[data-gesture-trace]")).toHaveCount(0);
      await page.goto("/?playtest&trace&seed=1");
      await page.waitForFunction(() => window.__DEMO__?.snapshot().inputEnabled === true);
      await page.getByLabel("Dataset partition").selectOption("SYNTHETIC_DIAGNOSTIC");
      // A native pointer tap is an actual rejected attempt, not a fixture outcome.
      if (pointerType === "mouse") await page.mouse.click(480, 454);
      else await page.touchscreen.tap(480, 454);
      const cases = [
        { intended: "DIRECT", options: { horizontalAim: 0, verticalAim: 0, requirePresentedFrame: true } },
        { intended: "LOB", options: { horizontalAim: 0.2, verticalAim: 0, loftWaypointOffsetSafeFraction: 0.12, requirePresentedFrame: true } },
        { intended: "ROSCA_LEFT", options: { horizontalAim: 0, verticalAim: 0, sideSpinWaypointOffsetSafeFraction: -0.15, requirePresentedFrame: true } },
        { intended: "ROSCA_RIGHT", options: { horizontalAim: 0, verticalAim: 0, sideSpinWaypointOffsetSafeFraction: 0.15, requirePresentedFrame: true } },
        { intended: "BOUNCE", options: { horizontalAim: -0.7, verticalAim: -1, requirePresentedFrame: true } },
      ];
      for (const [index, scenario] of cases.entries()) {
        await page.getByLabel("Human intended technique").selectOption(scenario.intended);
        const pointer = scenario.intended === "BOUNCE"
          ? await dispatchNativePath(page, pointerType, [[0.5,0.62],[0.42,0.89],[0.346,0.55]],180)
          : pointerType === "mouse" ? await dispatchMouseSwipe(page, scenario.options)
          : await dispatchTouchSwipe(page, context, scenario.options);
        expect(pointer.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
        const action = await demoSnapshot(page);
        expect(action.acceptedShots).toBe(index+1);
        expect(action.completedFeints).toBe(0);
        await page.waitForFunction((n) => window.__DEMO__?.snapshot().resolvedShots === n, index + 1);
        if (index < 4) await waitForOneShotReset(page, index + 1);
      }
      await page.waitForFunction(() => window.__DEMO__?.snapshot().activeShot === null);
      expect((await demoSnapshot(page)).match.phase).toBe("ROUND_COMPLETE");
      // Use the real app restart, preserving the existing round/reset implementation.
      await page.evaluate(() => window.__DEMO__!.restart());
      await page.getByLabel("Human intended technique").selectOption("FEINT");
      if (pointerType === "mouse") await dispatchMouseFeint(page);
      else await dispatchTouchFeint(page, context);
      const completedFake = await demoSnapshot(page);
      expect(completedFake.acceptedShots).toBe(0);
      expect(completedFake.activeShot).toBeNull();
      expect(completedFake.inputEnabled).toBe(true);
      await page.getByLabel("Human intended technique").selectOption("DIRECT");
      await dispatchNativePath(page,pointerType,[[0.5,0.84],[0.42,0.73],[0.34,0.62]]);
      await waitForOneShotReset(page, 1);
      const downloaded = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download local gesture traces" }).click();
      const download = await downloaded;
      const path = test.info().outputPath(`hb-val01-${pointerType}-production-traces.json`);
      await download.saveAs(path);
      const exported = JSON.parse(await readFile(path, "utf8")) as ReturnType<GestureTrace["export"]>;
      await test.info().attach(`hb-val01-${pointerType}-production-traces`, { path, contentType: "application/json" });
      expect(exported.attempts).toHaveLength(8);
      expect(exported.attempts[0]!.reason).not.toBeNull();
      const accepted = exported.attempts.filter((a) => a.gesture !== null);
      expect(accepted).toHaveLength(7);
      expect(accepted.slice(0, 5).map((a) => a.gesture!.category)).toEqual(["DIRECT", "LOB", "DIRECT", "DIRECT", "BOUNCE"]);
      expect(accepted[2]!.gesture!.sideSpin).toBeLessThan(0);
      expect(accepted[3]!.gesture!.sideSpin).toBeGreaterThan(0);
      expect(accepted[5]!.gesture!.feint).not.toBeNull();
      const session = exported.session as { goal: typeof STANDARD_GOAL_CONFIG; goalkeeper: typeof STANDARD_GOALKEEPER_CONFIG;
        trajectory: typeof STANDARD_TRAJECTORY_CONFIG; flight: typeof STANDARD_BALL_FLIGHT_CONFIG;
        releasePosition: typeof STANDARD_RELEASE_POSITION; fixedStepSeconds: number };
      for (const attempt of exported.attempts) {
        expect(attempt.replayable).toBe(true);
        expect(attempt.lifecycleComplete).toBe(true);
        const replay = replayGestureTrace(attempt, exported.config);
        if (!replay.accepted) { expect(replay.reason).toBe(attempt.reason); continue; }
        expect(replay.gesture).toEqual(attempt.gesture);
        if (attempt.action === "FEINT") {
          expect(attempt.release).toBeNull(); expect(attempt.result).toBeNull(); continue;
        }
        const gesture = replay.gesture;
        const target = mapAimToGoalTarget(gesture.aim.horizontalAim, gesture.aim.verticalAim, session.goal);
        const release = attempt.release as { target: typeof target; initialPosition: typeof target; initialVelocity: typeof target; keeperZone: GoalkeeperZone; keeperStart: typeof target };
        const result = attempt.result as { outcome: string; contacts: BallContact[] };
        const ball = createBaselineBallFlight(session.releasePosition, target, gesture.power, session.trajectory,
          session.flight, gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent);
        expect(target).toEqual(release.target);
        expect(ball.position).toEqual(release.initialPosition);
        expect(ball.initialVelocity).toEqual(release.initialVelocity);
        for (let step = 0; step < 600 && ball.terminalState === null; step++) {
          const previousPosition = goalkeeperPositionDuringShot(release.keeperZone, session.goal.center, session.goalkeeper, ball.elapsedSeconds, release.keeperStart);
          const currentPosition = goalkeeperPositionDuringShot(release.keeperZone, session.goal.center, session.goalkeeper, ball.elapsedSeconds + session.fixedStepSeconds, release.keeperStart);
          advanceBallFlight(ball, session.fixedStepSeconds, session.goal, session.goalkeeper, { previousPosition, currentPosition });
        }
        expect(ball.contactHistory).toEqual(result.contacts);
        expect(ball.terminalState).toBe(result.outcome);
        expect(result.contacts.filter((contact) => contact.outcome !== null)).toHaveLength(1);
      }
      const sessionReplay = replayGestureSession(exported);
      expect(sessionReplay.shots).toHaveLength(6);
      expect(sessionReplay.keeperSteps).toEqual(exported.attempts.flatMap(a => a.events.filter(e => e.type === "KEEPER_STEP")
        .map(e => ({ simulationSeconds:e.simulationSeconds,keeper:e.keeper }))));
      for (const [i, shot] of sessionReplay.shots.entries()) {
        const attempt = exported.attempts.filter(a=>a.action==="SHOT")[i]!;
        expect(shot.steps).toEqual(attempt.events.filter(e=>e.type==="FLIGHT_STEP").map(e=>e.keeper));
      }
      await test.info().attach("browser-coalescing-availability", { contentType: "application/json", body: JSON.stringify({
        coalescedSamplesObserved: exported.attempts.some((a) => a.samples.some((s) => s.source === "coalesced")),
        note: "Availability is browser/hardware dependent; filtering provenance is also exercised by unit tests. Human intent remains unvalidated." }) });
      expect(externalRequests).toEqual([]);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

// HB-INT-T03: labels are evidence only; all shots enter through native Pointer Events.
for (const viewport of [
  { width: 1920, height: 1080 }, { width: 1440, height: 900 },
  { width: 1280, height: 720 }, { width: 844, height: 390 },
]) {
  for (const pointerType of ["mouse", "touch"] as const) {
    test(`HB-VAL-01 projected bow ${pointerType} ${viewport.width}x${viewport.height} all target sides`, async ({ browser }) => {
      test.setTimeout(120_000);
      const context = await browser.newContext({ viewport, hasTouch: pointerType === "touch",
        isMobile: pointerType === "touch" });
      const page = await context.newPage();
      const errors = collectRuntimeErrors(page);
      try {
        const rig = new LockedCameraRig();
        const layout = rig.resize(viewport.width, viewport.height);
        for (const aim of [-0.7, 0, 0.7]) {
          for (const direction of [-1, 1]) {
            const id = `${pointerType}-${viewport.width}x${viewport.height}-${aim}-${direction}`;
            await page.goto("/?playtest&trace&seed=1");
            await page.waitForFunction(() => window.__DEMO__?.snapshot().inputEnabled === true);
            await page.getByLabel("Dataset partition").selectOption("SYNTHETIC_DIAGNOSTIC");
            await page.getByLabel("Human intended technique").selectOption(direction < 0 ? "ROSCA_LEFT" : "ROSCA_RIGHT");
            await page.evaluate(() => {
              type Snapshot = ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>;
              const probe: { release: Snapshot | null; frames: Snapshot[]; done: boolean } =
                { release: null, frames: [], done: false };
              (window as typeof window & { __HB_DIRECTION__?: typeof probe }).__HB_DIRECTION__ = probe;
              document.querySelector("#game-canvas")!.addEventListener("pointerup", () => {
                probe.release = window.__DEMO__!.snapshot();
                const observe = () => {
                  const snapshot = window.__DEMO__!.snapshot();
                  probe.frames.push(snapshot);
                  if (snapshot.inputEnabled && snapshot.resolvedShots === 1) probe.done = true;
                  else if (probe.frames.length < 1000) requestAnimationFrame(observe);
                };
                requestAnimationFrame(observe);
              }, { once: true });
            });
            const options = { horizontalAim: aim, verticalAim: 0,
              sideSpinWaypointOffsetSafeFraction: direction * 0.1,
              // High-res native touchscreen ROSCA: normal 200 ms stroke,
              // never block this physical input on a separate frame poll.
              // Keep the unchanged production and test timing contracts.
              ...(pointerType === "touch" ? { holdMilliseconds: 200 } : {}),
              requirePresentedFrame: true };
            const pointer = pointerType === "mouse" ? await dispatchMouseSwipe(page, options)
              : await dispatchTouchSwipe(page, context, options);
            await page.waitForFunction(() => {
              const probe = (window as typeof window & { __HB_DIRECTION__?: { frames: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>[] } }).__HB_DIRECTION__;
              return probe?.frames.some((f) => (f.activeShot?.ball.elapsedSeconds ?? 0) >= 0.1);
            });
            // Actual rendered page; its exact capture-time state is retained separately.
            const captureState = await demoSnapshot(page);
            await test.info().attach(`${id}-render`, { body: await page.screenshot(), contentType: "image/png" });
            await page.waitForFunction(() => (window as typeof window & { __HB_DIRECTION__?: { done: boolean } }).__HB_DIRECTION__?.done);
            const telemetry = await page.evaluate(() => (window as typeof window & { __HB_DIRECTION__?: {
              release: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>;
              frames: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>[];
            } }).__HB_DIRECTION__!);
            const observation = telemetry.frames.find((f) => f.activeShot !== null &&
              f.activeShot.ball.elapsedSeconds >= 0.1 && f.activeShot.ball.contactHistory.length === 0);
            const released = telemetry.release.activeShot;
            if (!released || !observation?.activeShot) throw new Error("Missing pre-contact production release/flight telemetry");
            const ball = observation.activeShot.ball;
            const t = ball.elapsedSeconds;
            const origin = telemetry.release.activeShot!.ball.position;
            const baseline = {
              x: origin.x + ball.initialVelocity.x * t,
              // Gravity is signed (negative); top-spin adds downward acceleration.
              y: origin.y + ball.initialVelocity.y * t + 0.5 *
                (ball.gravityMetersPerSecondSquared - ball.topSpinDropAccelerationMetersPerSecondSquared) * t * t,
              z: origin.z + ball.initialVelocity.z * t,
            };
            const projected = rig.projectPoint(ball.position);
            const projectedBaseline = rig.projectPoint(baseline);
            const projectedCurvature = projected.x - projectedBaseline.x;
            const paths = telemetry.frames.filter((f) => f.activeShot !== null &&
              f.activeShot.ball.contactHistory.length === 0).map((f) => {
              const b = f.activeShot!.ball;
              const seconds = b.elapsedSeconds;
              const straight = { x: origin.x + b.initialVelocity.x * seconds,
                y: origin.y + b.initialVelocity.y * seconds + 0.5 *
                  (b.gravityMetersPerSecondSquared - b.topSpinDropAccelerationMetersPerSecondSquared) * seconds * seconds,
                z: origin.z + b.initialVelocity.z * seconds };
              const point = (p: typeof straight) => {
                const ndc = rig.projectPoint(p);
                return `${(ndc.x + 1) * viewport.width / 2},${(1 - ndc.y) * viewport.height / 2}`;
              };
              return { curved: point(b.position), baseline: point(straight) };
            });
            await test.info().attach(`${id}-projected-paths`, { contentType: "image/svg+xml", body:
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewport.width} ${viewport.height}">
                <rect width="100%" height="100%" fill="white"/>
                <text x="12" y="24">${id}: measured pre-contact flight (blue), same-release zero-spin baseline (grey)</text>
                <polyline fill="none" stroke="grey" stroke-width="2" points="${paths.map((p) => p.baseline).join(" ")}"/>
                <polyline fill="none" stroke="blue" stroke-width="2" points="${paths.map((p) => p.curved).join(" ")}"/>
              </svg>` });
            const downloadEvent = page.waitForEvent("download");
            await page.getByRole("button", { name: "Download local gesture traces" }).click();
            const download = await downloadEvent;
            const tracePath = test.info().outputPath(`${id}-production-trace.json`);
            await download.saveAs(tracePath);
            const exported = JSON.parse(await readFile(tracePath, "utf8")) as ReturnType<GestureTrace["export"]>;
            const attempt = exported.attempts[0]!;
            const replay = replayGestureTrace(attempt, exported.config);
            await test.info().attach(`${id}-production-trace`, { path: tracePath, contentType: "application/json" });
            const directionPath = test.info().outputPath(`${id}-direction.json`);
            await writeFile(directionPath, JSON.stringify({
              intended: direction < 0 ? "ROSCA_LEFT" : "ROSCA_RIGHT", aim, bow: direction * 0.1,
              input: pointerType === "touch" ? "Chromium automated touch emulation; not real touchscreen" : "Chromium native mouse",
              category: released.category, spin: ball.releaseSideSpin, target: released.target,
              worldAcceleration: ball.sideSpinAccelerationMetersPerSecondSquared,
              baseline, projected, projectedBaseline, projectedCurvature, layout, pointer, telemetry, captureState,
            }, null, 2));
            await test.info().attach(`${id}-direction`, { contentType: "application/json", path: directionPath });
            expect(attempt.replayable && attempt.lifecycleComplete).toBe(true);
            expect(replay.accepted).toBe(true);
            if (replay.accepted) expect(replay.gesture).toEqual(attempt.gesture);
            expect(pointer.renderFramesDuringGesture).toBeGreaterThanOrEqual(1);
            expect(released.ball.contactHistory).toEqual([]);
            expect(released.resolved).toBe(false);
            expect(Math.sign(ball.releaseSideSpin)).toBe(direction);
            expect(Math.sign(ball.sideSpinAccelerationMetersPerSecondSquared)).toBe(-direction);
            expect(projectedCurvature * direction).toBeGreaterThan(0.001);
            expect(ball.position.x - baseline.x).toBeCloseTo(0.5 * ball.sideSpinAccelerationMetersPerSecondSquared * t * t, 8);
            expect(ball.position.y).toBeCloseTo(baseline.y, 8);
            expect(ball.position.z).toBeCloseTo(baseline.z, 8);
            expect(released.target).toEqual(mapAimToGoalTarget(attempt.gesture!.aim.horizontalAim,
              attempt.gesture!.aim.verticalAim, STANDARD_GOAL_CONFIG));
            expect(attempt.gesture!.aim.horizontalAim).toBeCloseTo(aim, 4);
            expect(observation.scene.cameraProfile).toBe(layout.profile);
            expect(observation.scene.goalProjection).toEqual(rig.projectBounds(
              { x: -1.62, y: 0, z: 7 }, { x: 1.62, y: 2.12, z: 7.8 }));
            const terminal = telemetry.frames.find((f) => f.activeShot?.ball.terminalState != null)!.activeShot!.ball;
            expect(terminal.contactHistory.filter((c) => c.outcome !== null)).toHaveLength(1);
            if (terminal.terminalState === "SAVED") expect(terminal.contactHistory.some((c) => c.kind === "KEEPER")).toBe(true);
            expect(telemetry.frames.every((f) => f.scene.finiteTransforms)).toBe(true);
            expect(telemetry.frames.at(-1)!.outcomes).toHaveLength(1);
          }
        }
        expect(errors).toEqual([]);
      } finally { await context.close(); }
    });
  }
}
