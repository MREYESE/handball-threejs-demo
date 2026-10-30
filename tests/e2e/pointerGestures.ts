import type { BrowserContext, Page } from "@playwright/test";
import type { AppSnapshot } from "../../src/app/HandballDemoApp";
import { STANDARD_GESTURE_CONFIG } from "../../src/config/defaults";
import { isIntermediateSampleFarEnough } from "../../src/domain/gesture/preprocess";

export interface SwipeOptions {
  readonly horizontalAim?: number;
  readonly verticalAim?: number;
  /**
   * Routes the real pointermove through a distant in-canvas anchor before
   * pointerup lands on the requested aim. Capture tests use this to saturate
   * all three existing power features even at the production maximum sample
   * gap, without custom timestamps or application hooks.
   */
  readonly saturatePower?: boolean;
  /**
   * Routes a full-power mouse trace below its aim chord while keeping every
   * sample at the matching chord-relative horizontal progress. Legacy contact
   * fixtures use this when they need power without adding side-spin or loft.
   */
  readonly neutralSideSpinPower?: boolean;
  /**
   * Routes the native pointer through the midpoint of the aim chord with a
   * signed vertical offset in safe-area fractions. Positive values bow upward.
   */
  readonly loftWaypointOffsetSafeFraction?: number;
  /**
   * Routes the native pointer through the midpoint of the aim chord with a
   * signed horizontal offset in safe-area fractions.
   */
  readonly sideSpinWaypointOffsetSafeFraction?: number;
  /**
   * Routes the native pointer through a vertical downward turn before release.
   * The positive offset from the start is expressed in safe-area fractions.
   */
  readonly topSpinWaypointOffsetSafeFraction?: number;
  /** Opt into dense collinear sampling for timing-sensitive CROSSBAR fixtures. */
  readonly stabilizeStraightReleasePower?: boolean;
  /** Optional host duration for renderer/input coexistence tests. */
  readonly holdMilliseconds?: number;
  /**
   * Require at least one presentation frame during this gesture. This is
   * reserved for dedicated renderer/input coexistence checks and profiles.
   */
  readonly requirePresentedFrame?: boolean;
}

export interface PointerBounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const POWER_ANCHOR_EDGE_FRACTION = 0.02;

export function resolvePowerSaturationAnchor(
  bounds: PointerBounds,
  endX: number,
): Readonly<{ x: number; y: number }> {
  if (
    !Number.isFinite(bounds.x) ||
    !Number.isFinite(bounds.y) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    !Number.isFinite(endX)
  ) {
    throw new RangeError("Power-saturation anchor requires finite positive bounds.");
  }
  const normalizedEndX = (endX - bounds.x) / bounds.width;
  const anchorXFraction =
    normalizedEndX >= 0.5
      ? POWER_ANCHOR_EDGE_FRACTION
      : 1 - POWER_ANCHOR_EDGE_FRACTION;
  return Object.freeze({
    x: bounds.x + bounds.width * anchorXFraction,
    y: bounds.y + bounds.height * POWER_ANCHOR_EDGE_FRACTION,
  });
}

export function resolveNeutralSideSpinPowerWaypoints(
  bounds: PointerBounds,
  endX: number,
  endY: number,
): readonly Readonly<{ x: number; y: number }>[] {
  if (
    !Number.isFinite(bounds.x) ||
    !Number.isFinite(bounds.y) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    !Number.isFinite(endX) ||
    !Number.isFinite(endY)
  ) {
    throw new RangeError(
      "Neutral power waypoints require finite positive bounds and endpoint.",
    );
  }

  const start = { x: 0.5, y: 0.84 } as const;
  const end = {
    x: (endX - bounds.x) / bounds.width,
    y: (endY - bounds.y) / bounds.height,
  } as const;
  const anchorY = 1 - POWER_ANCHOR_EDGE_FRACTION;
  const deltaX = end.x - start.x;
  let lowProgress = 0;
  let highProgress = 1;
  for (let iteration = 0; iteration < 64; iteration += 1) {
    const progress = (lowProgress + highProgress) / 2;
    const anchorX = start.x + deltaX * progress;
    const firstLength = Math.hypot(anchorX - start.x, anchorY - start.y);
    const secondLength = Math.hypot(end.x - anchorX, end.y - anchorY);
    const arcProgress = firstLength / (firstLength + secondLength);
    if (progress < arcProgress) {
      lowProgress = progress;
    } else {
      highProgress = progress;
    }
  }
  const anchorProgress = (lowProgress + highProgress) / 2;
  const anchor = {
    x: start.x + deltaX * anchorProgress,
    y: anchorY,
  } as const;
  const subdivisionCount = 5;
  const normalizedWaypoints = [
    ...Array.from({ length: subdivisionCount }, (_, index) =>
      interpolatePoint(start, anchor, (index + 1) / subdivisionCount),
    ),
    ...Array.from({ length: subdivisionCount - 1 }, (_, index) =>
      interpolatePoint(anchor, end, (index + 1) / subdivisionCount),
    ),
  ];
  return Object.freeze(
    normalizedWaypoints.map((point) =>
      Object.freeze({
        x: bounds.x + point.x * bounds.width,
        y: bounds.y + point.y * bounds.height,
      }),
    ),
  );
}

function interpolatePoint(
  start: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>,
  progress: number,
): Readonly<{ x: number; y: number }> {
  return Object.freeze({
    x: start.x + (end.x - start.x) * progress,
    y: start.y + (end.y - start.y) * progress,
  });
}

export interface PointerTraceEvent {
  readonly type: string;
  readonly timeStamp: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;
  readonly presentedFrames: number;
  readonly coalescedEvents: readonly Readonly<{
    readonly timeStamp: number;
    readonly clientX: number;
    readonly clientY: number;
    readonly pointerId: number;
  }>[];
}

export interface PointerGestureEvidence {
  readonly events: readonly PointerTraceEvent[];
  readonly rawEvents: readonly PointerTraceEvent[];
  readonly pointerType: string;
  readonly durationMilliseconds: number;
  readonly maximumSampleGapMilliseconds: number;
  readonly maximumDispatchedEventGapMilliseconds: number;
  readonly renderFramesDuringGesture: number;
  readonly renderFramesDuringHandlerInterval: number;
  readonly renderIntervals: readonly (readonly [number, number])[];
  readonly productionRejectionReason: string | null;
  readonly presentationRequirementApplied: boolean;
  readonly canvasBounds: PointerBounds;
}

export interface FeintPointerGestureEvidence {
  readonly pointer: PointerGestureEvidence;
  readonly checkpoint: AppSnapshot;
  readonly captureHeldAtCheckpoint: boolean;
}

export interface KeeperPointerGestureEvidence {
  readonly pointer: PointerGestureEvidence;
  readonly checkpoint: AppSnapshot;
  readonly captureHeldAtCheckpoint: boolean;
  readonly checkpointHostDurationMilliseconds: number;
}

const NATIVE_MOVE_COUNT = 1;
const NATIVE_HOLD_MILLISECONDS = 80;
const MAXIMUM_CONFIGURABLE_HOLD_MILLISECONDS = 220;
const MAX_SAMPLE_GAP_MS = 250;
const MINIMUM_DURATION_MS = 30;
const MAXIMUM_DURATION_MS = 1_500;

export function resolveNativeHoldMilliseconds(
  requested: number | undefined,
): number {
  const resolved = requested ?? NATIVE_HOLD_MILLISECONDS;
  if (
    !Number.isFinite(resolved) ||
    resolved < MINIMUM_DURATION_MS ||
    resolved > MAXIMUM_CONFIGURABLE_HOLD_MILLISECONDS
  ) {
    throw new RangeError(
      `Native hold must be between ${MINIMUM_DURATION_MS} and ` +
        `${MAXIMUM_CONFIGURABLE_HOLD_MILLISECONDS} ms.`,
    );
  }
  return resolved;
}

// Keep several nonzero release segments in the power window even when native
// touch dispatch delays the initial segment or coalesces adjacent moves.
export function resolveStraightSwipeWaypoints(
  start: Readonly<{ x: number; y: number }>,
  end: Readonly<{ x: number; y: number }>,
  stabilizeReleasePower = false,
): readonly Readonly<{ x: number; y: number }>[] {
  const segments = stabilizeReleasePower ? 8 : 2;
  return Object.freeze(Array.from({ length: segments - 1 }, (_, index) =>
    interpolatePoint(start, end, (index + 1) / segments)));
}

function resolveSwipeWaypoints(
  box: PointerBounds,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  options: SwipeOptions,
) {
  const powerAnchor = options.saturatePower
    ? resolvePowerSaturationAnchor(box, endX)
    : null;
  const neutralPowerWaypoints = options.neutralSideSpinPower
    ? resolveNeutralSideSpinPowerWaypoints(box, endX, endY)
    : null;
  const loftWaypointOffset = options.loftWaypointOffsetSafeFraction;
  const sideSpinWaypointOffset = options.sideSpinWaypointOffsetSafeFraction;
  const topSpinWaypointOffset = options.topSpinWaypointOffsetSafeFraction;
  if (
    loftWaypointOffset !== undefined &&
    !Number.isFinite(loftWaypointOffset)
  ) {
    throw new RangeError("Loft waypoint offset must be finite.");
  }
  if (
    sideSpinWaypointOffset !== undefined &&
    !Number.isFinite(sideSpinWaypointOffset)
  ) {
    throw new RangeError("Side-spin waypoint offset must be finite.");
  }
  if (
    topSpinWaypointOffset !== undefined &&
    !Number.isFinite(topSpinWaypointOffset)
  ) {
    throw new RangeError("Top-spin waypoint offset must be finite.");
  }
  if (
    (powerAnchor !== null || neutralPowerWaypoints !== null) &&
    (loftWaypointOffset !== undefined ||
      sideSpinWaypointOffset !== undefined ||
      topSpinWaypointOffset !== undefined)
  ) {
    throw new RangeError(
      "Power saturation and a gesture waypoint cannot share one canonical trace.",
    );
  }
  if (powerAnchor !== null && neutralPowerWaypoints !== null) {
    throw new RangeError(
      "Power saturation modes cannot share one canonical trace.",
    );
  }
  if (
    [loftWaypointOffset, sideSpinWaypointOffset, topSpinWaypointOffset].filter(
      (offset) => offset !== undefined,
    ).length > 1
  ) {
    throw new RangeError(
      "Loft, side-spin, and top-spin waypoints cannot share one canonical trace.",
    );
  }
  const topSpinWaypoints =
    topSpinWaypointOffset === undefined
      ? null
      : topSpinWaypointOffset === 0
        ? resolveStraightSwipeWaypoints(
            { x: startX, y: startY }, { x: endX, y: endY },
            options.stabilizeStraightReleasePower,
          )
        : Object.freeze([
          Object.freeze({
            x: (startX + endX) / 2,
            y:
              topSpinWaypointOffset <= 0
                ? (startY + endY) / 2 + topSpinWaypointOffset * box.height
                : startY + topSpinWaypointOffset * box.height,
          }),
        ]);
  const gestureWaypoint =
    loftWaypointOffset !== undefined
      ? Object.freeze({
          x: (startX + endX) / 2,
          y:
            (startY + endY) / 2 -
            loftWaypointOffset * box.height,
        })
      : sideSpinWaypointOffset !== undefined
        ? Object.freeze({
            x:
              (startX + endX) / 2 +
              sideSpinWaypointOffset * box.width,
            y: (startY + endY) / 2,
          })
        : null;
  const gestureWaypoints =
    neutralPowerWaypoints ??
    topSpinWaypoints ??
    (gestureWaypoint === null ? null : Object.freeze([gestureWaypoint]));

  return { powerAnchor, gestureWaypoints };
}

export async function dispatchMouseSwipe(
  page: Page,
  options: SwipeOptions = {},
): Promise<PointerGestureEvidence> {
  const canvas = page.locator("#game-canvas");
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error("Gameplay canvas has no bounding box.");
  }

  const horizontalAim = options.horizontalAim ?? 0;
  const verticalAim = options.verticalAim ?? 0;
  const holdMilliseconds = resolveNativeHoldMilliseconds(
    options.holdMilliseconds,
  );
  const startX = box.x + box.width * 0.5;
  const startY = box.y + box.height * 0.84;
  const endX = startX + horizontalAim * box.width * 0.22;
  const deltaYUp = ((verticalAim + 1) / 2) * box.height * 0.28;
  const endY = startY - deltaYUp;
  const { powerAnchor, gestureWaypoints } = resolveSwipeWaypoints(
    box, startX, startY, endX, endY, options,
  );

  // Setup positioning is outside the measured gesture.
  await page.mouse.move(startX, startY);
  await installPointerTrace(page);
  const client = await page.context().newCDPSession(page);

  try {
    const dispatchPress = () =>
      client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: startX,
        y: startY,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });
    const dispatchMove = (x: number, y: number) =>
      client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x,
        y,
        buttons: 1,
      });
    const dispatchRelease = () =>
      client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: endX,
        y: endY,
        button: "left",
        buttons: 0,
        clickCount: 1,
      });

    if (gestureWaypoints !== null) {
      const pendingNativeEvents: Promise<unknown>[] = [dispatchPress()];
      const segmentMilliseconds =
        holdMilliseconds / (gestureWaypoints.length + 1);
      for (const waypoint of gestureWaypoints) {
        await hostDelay(segmentMilliseconds);
        pendingNativeEvents.push(dispatchMove(waypoint.x, waypoint.y));
      }
      await hostDelay(segmentMilliseconds);
      pendingNativeEvents.push(dispatchRelease());
      await Promise.all(pendingNativeEvents);
      await waitForPointerUp(page, "mouse");
      return collectPointerTrace(
        page,
        options.requirePresentedFrame ?? false,
      );
    }

    const pendingNativeEvents: Promise<unknown>[] = [dispatchPress()];

    // This timer runs in the Node host, not on the render-blocked page main thread.
    await hostDelay(holdMilliseconds);

    const movementTargetX = powerAnchor?.x ?? endX;
    const movementTargetY = powerAnchor?.y ?? endY;
    for (let index = 1; index <= NATIVE_MOVE_COUNT; index += 1) {
      pendingNativeEvents.push(
        dispatchMove(
          startX +
            ((movementTargetX - startX) * index) / NATIVE_MOVE_COUNT,
          startY +
            ((movementTargetY - startY) * index) / NATIVE_MOVE_COUNT,
        ),
      );
    }
    pendingNativeEvents.push(dispatchRelease());
    await Promise.all(pendingNativeEvents);
    await waitForPointerUp(page, "mouse");
  } finally {
    await client.detach();
  }

  return collectPointerTrace(
    page,
    options.requirePresentedFrame ?? false,
  );
}

export async function dispatchTouchSwipe(
  page: Page,
  context: BrowserContext,
  options: SwipeOptions = {},
): Promise<PointerGestureEvidence> {
  const canvas = page.locator("#game-canvas");
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error("Gameplay canvas has no touch bounding box.");
  }

  const horizontalAim = options.horizontalAim ?? 0;
  const verticalAim = options.verticalAim ?? 0;
  const holdMilliseconds = resolveNativeHoldMilliseconds(
    options.holdMilliseconds,
  );
  const startX = box.x + box.width * 0.5;
  const startY = box.y + box.height * 0.84;
  const endX = startX + horizontalAim * box.width * 0.22;
  const deltaYUp = ((verticalAim + 1) / 2) * box.height * 0.28;
  const endY = startY - deltaYUp;
  const { powerAnchor, gestureWaypoints } = resolveSwipeWaypoints(
    box, startX, startY, endX, endY, options,
  );
  const client = await context.newCDPSession(page);

  await installPointerTrace(page);
  try {
    const pendingNativeEvents: Promise<unknown>[] = [
      client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: startX, y: startY, id: 1 }],
      }),
    ];
    const dispatchMove = (x: number, y: number) =>
      client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y, id: 1 }],
      });
    // Pace native waypoints from touchStart without a page/RAF round trip
    // before the first move, matching the mouse path. Waiting here can time
    // out before any movement and stretches the unsampled pointerdown gap.
    // collectPointerTrace still requires actual presented frames between the
    // recorded pointerdown and pointerup when requirePresentedFrame is set.
    if (gestureWaypoints !== null) {
      // Never block the native gesture on Chromium's GPU presentation.
      // A frame-polling wait created a measured 375.9 ms gap between
      // two real touch moves, triggering production SAMPLE_GAP_TOO_LONG.
      // The collected trace independently REQUIRES a real presented
      // frame when options.requirePresentedFrame is enabled.
      const segmentMilliseconds = holdMilliseconds / (gestureWaypoints.length + 1);
      for (const waypoint of gestureWaypoints) {
        await hostDelay(segmentMilliseconds);
        pendingNativeEvents.push(dispatchMove(waypoint.x, waypoint.y));
      }
      await hostDelay(segmentMilliseconds);
    } else {
      await hostDelay(holdMilliseconds);
      if (powerAnchor !== null) pendingNativeEvents.push(dispatchMove(powerAnchor.x, powerAnchor.y));
    }
    // Touch end has no coordinates: reach the aim and release without an
    // extra hold on the final direction cue.
    pendingNativeEvents.push(dispatchMove(endX, endY));
    pendingNativeEvents.push(
      client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      }),
    );
    await Promise.all(pendingNativeEvents);
    await waitForPointerUp(page, "touch");
  } finally {
    await client.detach();
  }

  return collectPointerTrace(
    page,
    options.requirePresentedFrame ?? false,
  );
}

function canonicalFeintCoordinates(
  bounds: PointerBounds,
  direction: -1 | 1,
): readonly Readonly<{ x: number; y: number }>[] {
  const startX = bounds.x + bounds.width * 0.5;
  const startY = bounds.y + bounds.height * 0.84;
  return Object.freeze([
    Object.freeze({ x: startX, y: startY }),
    Object.freeze({
      x: startX + direction * bounds.width * 0.1,
      y: startY - bounds.height * 0.04,
    }),
    Object.freeze({
      x: startX + direction * bounds.width * 0.05,
      y: startY - bounds.height * 0.05,
    }),
    Object.freeze({
      x: startX - direction * bounds.width * 0.12,
      y: startY - bounds.height * 0.24,
    }),
    Object.freeze({
      x: startX - direction * bounds.width * 0.16,
      y: startY - bounds.height * 0.29,
    }),
  ]);
}

async function installFeintCheckpoint(page: Page): Promise<void> {
  await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (canvas === null) throw new Error("FEINT canvas is unavailable.");
    const probe = window as typeof window & {
      __FEINT_E2E_CHECKPOINT__?: {
        checkpoint: AppSnapshot;
        captureHeldAtCheckpoint: boolean;
      };
    };
    delete probe.__FEINT_E2E_CHECKPOINT__;
    // Observe the real pre-release state without stopping the native pointer
    // driver for page/host polling and snapshot round trips between samples.
    canvas.addEventListener("pointerdown", (event) => {
      const observe = (): void => {
        if (!canvas.hasPointerCapture(event.pointerId)) return;
        const snapshot = window.__DEMO__?.snapshot();
        if (snapshot?.pendingFeint != null && snapshot.goalkeeper.phase === "COMMIT") {
          probe.__FEINT_E2E_CHECKPOINT__ = {
            checkpoint: snapshot,
            captureHeldAtCheckpoint: canvas.hasPointerCapture(event.pointerId),
          };
          return;
        }
        requestAnimationFrame(observe);
      };
      requestAnimationFrame(observe);
    }, { once: true });
  });
}

async function collectFeintCheckpoint(page: Page): Promise<{
  readonly checkpoint: AppSnapshot;
  readonly captureHeldAtCheckpoint: boolean;
}> {
  return page.evaluate(() => {
    const checkpoint = (window as typeof window & {
      __FEINT_E2E_CHECKPOINT__?: {
        checkpoint: AppSnapshot;
        captureHeldAtCheckpoint: boolean;
      };
    }).__FEINT_E2E_CHECKPOINT__;
    if (checkpoint === undefined) {
      throw new Error("No captured pre-release FEINT/COMMIT checkpoint was observed.");
    }
    return checkpoint;
  });
}

export async function dispatchMouseFeint(
  page: Page,
  direction: -1 | 1 = 1,
): Promise<FeintPointerGestureEvidence> {
  const canvas = page.locator("#game-canvas");
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error("Gameplay canvas has no FEINT bounding box.");
  }
  const [start, initial, brake, second, release] =
    canonicalFeintCoordinates(box, direction);
  if (
    start === undefined ||
    initial === undefined ||
    brake === undefined ||
    second === undefined ||
    release === undefined
  ) {
    throw new Error("Canonical FEINT coordinates are incomplete.");
  }

  await page.mouse.move(start.x, start.y);
  await installPointerTrace(page);
  await installFeintCheckpoint(page);
  const client = await page.context().newCDPSession(page);
  try {
    const prefixEvents: Promise<unknown>[] = [
      client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: start.x,
        y: start.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      }),
    ];
    for (const waypoint of [initial, brake, second]) {
      await hostDelay(45);
      prefixEvents.push(
        client.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: waypoint.x,
          y: waypoint.y,
          button: "left",
          buttons: 1,
          force: 0.5,
        }),
      );
    }
    await Promise.all(prefixEvents);
    await hostDelay(45);
    await Promise.all([
      client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: release.x,
        y: release.y,
        button: "left",
        buttons: 1,
        force: 0.5,
      }),
      client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: release.x,
        y: release.y,
        button: "left",
        buttons: 0,
        clickCount: 1,
      }),
    ]);
    await waitForPointerUp(page, "mouse");
    const checkpoint = await collectFeintCheckpoint(page);
    return Object.freeze({
      pointer: await collectPointerTrace(page, true),
      ...checkpoint,
    });
  } finally {
    await client.detach();
  }
}

export async function dispatchTouchFeint(
  page: Page,
  context: BrowserContext,
  direction: -1 | 1 = -1,
): Promise<FeintPointerGestureEvidence> {
  const canvas = page.locator("#game-canvas");
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error("Gameplay canvas has no touch FEINT bounding box.");
  }
  const [start, initial, brake, second, release] =
    canonicalFeintCoordinates(box, direction);
  if (
    start === undefined ||
    initial === undefined ||
    brake === undefined ||
    second === undefined ||
    release === undefined
  ) {
    throw new Error("Canonical touch FEINT coordinates are incomplete.");
  }

  await installPointerTrace(page);
  await installFeintCheckpoint(page);
  const client = await context.newCDPSession(page);
  try {
    const prefixEvents: Promise<unknown>[] = [
      client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: start.x, y: start.y, id: 1 }],
      }),
    ];
    for (const waypoint of [initial, brake, second]) {
      await hostDelay(45);
      prefixEvents.push(
        client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: waypoint.x, y: waypoint.y, id: 1 }],
        }),
      );
    }
    await Promise.all(prefixEvents);
    await hostDelay(45);
    await Promise.all([
      client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: release.x, y: release.y, id: 1 }],
      }),
      client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      }),
    ]);
    await waitForPointerUp(page, "touch");
    const checkpoint = await collectFeintCheckpoint(page);
    return Object.freeze({
      pointer: await collectPointerTrace(page, true),
      ...checkpoint,
    });
  } finally {
    await client.detach();
  }
}

async function collectKeeperCheckpoint(
  page: Page,
  pointerType: "mouse" | "touch",
): Promise<{
  readonly checkpoint: AppSnapshot;
  readonly captureHeldAtCheckpoint: boolean;
}> {
  return page.evaluate(async (expectedPointerType) => {
    if (window.__PUMP__ !== undefined) {
      // Capture mode owns a deterministic fixed-step clock, so advance the
      // keeper read while the pointer remains captured. Keeping the pump and
      // checkpoint read in one browser task avoids inserting a host round-trip
      // pause into the native gesture trace.
      window.__PUMP__(5);
    } else if (window.__DEMO__?.snapshot().goalkeeper.phase !== "COMMIT") {
      // Gameplay mode advances the same fixed-step controller from RAF. Wait
      // in-page so the active pointer trace is not stretched by polling calls.
      await new Promise<void>((resolve, reject) => {
        const startedAt = performance.now();
        const waitForCommit = (): void => {
          if (window.__DEMO__?.snapshot().goalkeeper.phase === "COMMIT") {
            resolve();
            return;
          }
          if (performance.now() - startedAt >= 5_000) {
            reject(new Error("Goalkeeper did not commit within 5000ms."));
            return;
          }
          requestAnimationFrame(waitForCommit);
        };
        requestAnimationFrame(waitForCommit);
      });
    }

    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    const trace = (
      window as typeof window & { __POINTER_E2E_TRACE__?: PointerTraceEvent[] }
    ).__POINTER_E2E_TRACE__ ?? [];
    const pointerId = trace?.find((event) => event.type === "pointerdown")?.pointerId;
    const inputAtCheckpoint = window.__DEMO__?.snapshot().gestureInput;
    const tracedMoves = trace.filter(
      (event) =>
        event.type === "pointermove" &&
        event.pointerType === expectedPointerType,
    ).length;
    if (
      canvas === null ||
      pointerId === undefined ||
      inputAtCheckpoint?.captureActive !== true ||
      inputAtCheckpoint.pointerType !== expectedPointerType ||
      inputAtCheckpoint.sampleCount < 3 ||
      tracedMoves < 2
    ) {
      throw new Error("Goalkeeper commitment checkpoint is unavailable.");
    }

    const snapshot = window.__DEMO__?.snapshot();
    const captureHeldAtCheckpoint = canvas.hasPointerCapture(pointerId);
    if (
      snapshot === undefined ||
      snapshot.goalkeeper.phase !== "COMMIT" ||
      !captureHeldAtCheckpoint
    ) {
      throw new Error(
        `Goalkeeper did not reach COMMIT: ${JSON.stringify({
          goalkeeper: snapshot?.goalkeeper ?? null,
          gestureInput: snapshot?.gestureInput ?? null,
          tracedMoves,
          captureHeldAtCheckpoint,
        })}`,
      );
    }
    return {
      checkpoint: snapshot,
      captureHeldAtCheckpoint,
    };
  }, pointerType);
}

export async function dispatchMouseKeeperCommitment(
  page: Page,
  cueDirection: -1 | 0 | 1,
  finalHorizontalAim: number,
  finalVerticalAim = 3 / 7,
  stabilizeReleasePower = false,
): Promise<KeeperPointerGestureEvidence> {
  const canvas = page.locator("#game-canvas");
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error("Gameplay canvas has no goalkeeper cue bounds.");
  }
  const start = {
    x: box.x + box.width * 0.5,
    y: box.y + box.height * 0.84,
  };
  const centeredCue = cueDirection === 0;
  const cueOne = {
    x: start.x + cueDirection * box.width * 0.08,
    y: start.y - box.height * (centeredCue ? 0.07 : 0.05),
  };
  const cueTwo = {
    x: start.x + cueDirection * box.width * 0.11,
    y: start.y - box.height * (centeredCue ? 0.1 : 0.08),
  };
  const release = {
    x: start.x + finalHorizontalAim * box.width * 0.22,
    y: start.y - ((finalVerticalAim + 1) / 2) * box.height * 0.28,
  };
  const releasePowerWaypoints = [0.05, 0.36, 0.68].map((progress) => ({
    x: cueTwo.x + (release.x - cueTwo.x) * progress,
    y: cueTwo.y + (release.y - cueTwo.y) * progress,
  }));
  await page.mouse.move(start.x, start.y);
  await installPointerTrace(page);
  const client = await page.context().newCDPSession(page);
  try {
    await Promise.all([
      client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: start.x,
        y: start.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      }),
    ]);
    await waitForProcessedGestureSamples(page, "mouse", 0);
    for (const [index, cue] of [cueOne, cueTwo].entries()) {
      await hostDelay(55);
      await Promise.all([
        client.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: cue.x,
          y: cue.y,
          button: "left",
          buttons: 1,
        }),
      ]);
      await waitForProcessedGestureSamples(page, "mouse", index + 1);
    }
    const checkpointStartedAtMilliseconds = performance.now();
    const checkpoint = await collectKeeperCheckpoint(page, "mouse");
    const checkpointHostDurationMilliseconds =
      performance.now() - checkpointStartedAtMilliseconds;
    const releaseEvents: Promise<unknown>[] = [];
    if (stabilizeReleasePower) {
      // Keep the final release-speed window independent of the variable time
      // spent observing the pre-release commitment. The first short waypoint
      // absorbs that pause; the next two moves and pointerup form three
      // substantial collinear release segments. Queue Chromium commands in
      // protocol order without polling renderer/page state between samples.
      for (const waypoint of releasePowerWaypoints) {
        releaseEvents.push(
          client.send("Input.dispatchMouseEvent", {
            type: "mouseMoved",
            x: waypoint.x,
            y: waypoint.y,
            button: "left",
            buttons: 1,
          }),
        );
        await hostDelay(20);
      }
    }
    if (stabilizeReleasePower) {
      releaseEvents.push(
        client.send("Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x: release.x,
          y: release.y,
          button: "left",
          buttons: 0,
          clickCount: 1,
        }),
      );
      await Promise.all(releaseEvents);
    } else {
      await Promise.all([
        client.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: release.x,
          y: release.y,
          button: "left",
          buttons: 1,
        }),
        client.send("Input.dispatchMouseEvent", {
          type: "mouseReleased",
          x: release.x,
          y: release.y,
          button: "left",
          buttons: 0,
          clickCount: 1,
        }),
      ]);
    }
    await waitForPointerUp(page, "mouse");
    return Object.freeze({
      pointer: await collectPointerTrace(page, true),
      ...checkpoint,
      checkpointHostDurationMilliseconds,
    });
  } finally {
    await client.detach();
  }
}

export async function dispatchTouchKeeperCommitment(
  page: Page,
  context: BrowserContext,
  cueDirection: -1 | 0 | 1,
  finalHorizontalAim: number,
  finalVerticalAim = 3 / 7,
  stabilizeReleasePower = false,
): Promise<KeeperPointerGestureEvidence> {
  const canvas = page.locator("#game-canvas");
  const box = await canvas.boundingBox();
  if (box === null) {
    throw new Error("Gameplay canvas has no touch goalkeeper cue bounds.");
  }
  const start = {
    x: box.x + box.width * 0.5,
    y: box.y + box.height * 0.84,
  };
  const cues = [
    {
      x: start.x + cueDirection * box.width * 0.08,
      y: start.y - box.height * (cueDirection === 0 ? 0.07 : 0.05),
    },
    {
      x: start.x + cueDirection * box.width * 0.11,
      y: start.y - box.height * (cueDirection === 0 ? 0.1 : 0.08),
    },
  ];
  const release = {
    x: start.x + finalHorizontalAim * box.width * 0.22,
    y: start.y - ((finalVerticalAim + 1) / 2) * box.height * 0.28,
  };
  await installPointerTrace(page);
  const client = await context.newCDPSession(page);
  try {
    const cueEvents: Promise<unknown>[] = [
      client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: start.x, y: start.y, id: 1 }],
      }),
    ];
    // Queue the native touch prefix without page-state polling between
    // samples. Those host/page round trips can stretch an otherwise valid
    // Chromium trace beyond the production 250 ms sample-gap contract. The
    // in-page commitment checkpoint below still requires both moves to have
    // reached the real input controller while pointer capture remains active.
    for (const cue of cues) {
      await hostDelay(55);
      cueEvents.push(
        client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: cue.x, y: cue.y, id: 1 }],
        }),
      );
    }
    await Promise.all(cueEvents);
    const checkpointStartedAtMilliseconds = performance.now();
    const checkpoint = await collectKeeperCheckpoint(page, "touch");
    const checkpointHostDurationMilliseconds =
      performance.now() - checkpointStartedAtMilliseconds;
    // Match the native mouse high-save release-speed window after COMMIT.
    // Touch end has no coordinates, so retain the final move to the endpoint.
    const releaseEvents: Promise<unknown>[] = [];
    if (stabilizeReleasePower) {
      const cueTwo = cues[1]!;
      for (const progress of [0.05, 0.36, 0.68]) {
        releaseEvents.push(client.send("Input.dispatchTouchEvent", {
          type: "touchMove", touchPoints: [{
            x: cueTwo.x + (release.x - cueTwo.x) * progress,
            y: cueTwo.y + (release.y - cueTwo.y) * progress, id: 1,
          }],
        }));
        await hostDelay(20);
      }
    }
    await Promise.all([
      ...releaseEvents,
      client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: release.x, y: release.y, id: 1 }],
      }),
      client.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      }),
    ]);
    await waitForPointerUp(page, "touch");
    return Object.freeze({
      pointer: await collectPointerTrace(page, true),
      ...checkpoint,
      checkpointHostDurationMilliseconds,
    });
  } finally {
    await client.detach();
  }
}

function hostDelay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForProcessedGestureSamples(
  page: Page,
  pointerType: "mouse" | "touch",
  expectedMoveCount: number,
): Promise<void> {
  await page.waitForFunction(
    ({ expectedPointerType, expectedMoves }) => {
      const trace = (
        window as typeof window & { __POINTER_E2E_TRACE__?: PointerTraceEvent[] }
      ).__POINTER_E2E_TRACE__;
      const tracedMoves =
        trace?.filter(
          (event) =>
            event.type === "pointermove" &&
            event.pointerType === expectedPointerType,
        ).length ?? 0;
      const input = window.__DEMO__?.snapshot().gestureInput;
      return (
        trace?.some(
          (event) =>
            event.type === "pointerdown" &&
            event.pointerType === expectedPointerType,
        ) === true &&
        tracedMoves >= expectedMoves &&
        input?.captureActive === true &&
        input.pointerType === expectedPointerType &&
        input.sampleCount >= expectedMoves + 1
      );
    },
    {
      expectedPointerType: pointerType,
      expectedMoves: expectedMoveCount,
    },
    { timeout: 5_000 },
  );
}

async function waitForPointerUp(page: Page, pointerType: string): Promise<void> {
  await page.waitForFunction(
    (expectedPointerType) => {
      const state = window as typeof window & {
        __POINTER_E2E_TRACE__?: PointerTraceEvent[];
      };
      return state.__POINTER_E2E_TRACE__?.some(
        (event) =>
          event.type === "pointerup" && event.pointerType === expectedPointerType,
      ) === true;
    },
    pointerType,
    { timeout: 5_000 },
  );
}

async function installPointerTrace(page: Page): Promise<void> {
  await page.evaluate(() => {
    const target = document.querySelector<HTMLCanvasElement>("#game-canvas");
    if (target === null) {
      throw new Error("Gameplay canvas is missing.");
    }

    const state = window as typeof window & {
      __POINTER_E2E_TRACE__?: PointerTraceEvent[];
      __POINTER_E2E_ABORT__?: AbortController;
    };
    const presentedCanvas = target as HTMLCanvasElement & {
      __HANDBALL_PRESENTED_FRAMES__?: number;
    };

    state.__POINTER_E2E_ABORT__?.abort();
    const controller = new AbortController();
    const trace: PointerTraceEvent[] = [];
    state.__POINTER_E2E_ABORT__ = controller;
    state.__POINTER_E2E_TRACE__ = trace;

    const record = (event: PointerEvent): void => {
      const coalescedEvents =
        typeof event.getCoalescedEvents === "function"
          ? event.getCoalescedEvents().slice(0, 32).map((coalescedEvent) => ({
              timeStamp: coalescedEvent.timeStamp,
              clientX: coalescedEvent.clientX,
              clientY: coalescedEvent.clientY,
              pointerId: coalescedEvent.pointerId,
            }))
          : [];
      trace.push({
        type: event.type,
        timeStamp: event.timeStamp,
        clientX: event.clientX,
        clientY: event.clientY,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        presentedFrames: presentedCanvas.__HANDBALL_PRESENTED_FRAMES__ ?? 0,
        coalescedEvents,
      });
    };

    for (const type of [
      "pointerdown",
      "pointermove",
      "pointerup",
      "pointercancel",
      "lostpointercapture",
    ]) {
      target.addEventListener(type, record as EventListener, {
        capture: true,
        signal: controller.signal,
      });
    }
  });
}

async function collectPointerTrace(
  page: Page,
  requirePresentedFrame: boolean,
): Promise<PointerGestureEvidence> {
  const collected = await page.evaluate(() => {
    const state = window as typeof window & {
      __POINTER_E2E_TRACE__?: PointerTraceEvent[];
      __POINTER_E2E_ABORT__?: AbortController;
    };
    state.__POINTER_E2E_ABORT__?.abort();
    const trace = [...(state.__POINTER_E2E_TRACE__ ?? [])];
    const productionRejectionReason =
      window.__DEMO__?.snapshot().lastGestureRejectionReason ?? null;
    const canvas = document.querySelector<HTMLCanvasElement>("#game-canvas");
    const times = (canvas as (HTMLCanvasElement & {
      __HANDBALL_RENDER_INTERVALS__?: Float64Array;
    }) | null)?.__HANDBALL_RENDER_INTERVALS__;
    const renderIntervals: [number, number][] = [];
    if (times !== undefined) {
      for (let index = 0; index < times.length; index += 2) {
        if (times[index + 1]! > 0) renderIntervals.push([times[index]!, times[index + 1]!]);
      }
    }
    const rect = canvas?.getBoundingClientRect();
    delete state.__POINTER_E2E_ABORT__;
    delete state.__POINTER_E2E_TRACE__;
    return {
      trace,
      productionRejectionReason,
      renderIntervals,
      canvasBounds:
        rect === undefined
          ? null
          : {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
    };
  });

  if (collected.canvasBounds === null) {
    throw new Error("Gameplay canvas bounds are unavailable for pointer evidence.");
  }

  return validatePointerTrace(
    collected.trace,
    collected.productionRejectionReason,
    requirePresentedFrame,
    collected.canvasBounds,
    collected.renderIntervals,
  );
}

export function validatePointerTrace(
  trace: readonly PointerTraceEvent[],
  productionRejectionReason: string | null,
  requirePresentedFrame: boolean,
  canvasBounds: PointerBounds,
  renderIntervals: readonly (readonly [number, number])[] = [],
): PointerGestureEvidence {
  const gesture = trace.filter(
    (event) =>
      event.type === "pointerdown" ||
      event.type === "pointermove" ||
      event.type === "pointerup",
  );
  const downIndex = gesture.findIndex((event) => event.type === "pointerdown");
  const upIndex = gesture.findIndex(
    (event, index) => index > downIndex && event.type === "pointerup",
  );

  if (downIndex < 0 || upIndex < 0) {
    throw new Error(
      "Native Chromium pointer sequence is incomplete: " +
        JSON.stringify({ trace, productionRejectionReason }),
    );
  }

  const captured = gesture.slice(downIndex, upIndex + 1);
  const first = captured[0];
  const last = captured.at(-1);
  const hasMovement = captured.some((event) => event.type === "pointermove");
  if (first === undefined || last === undefined || !hasMovement) {
    throw new Error(
      "Native Chromium pointer sequence is incomplete: " +
        JSON.stringify({ captured, productionRejectionReason }),
    );
  }

  const durationMilliseconds = last.timeStamp - first.timeStamp;
  const dispatchedGapsMilliseconds = captured.slice(1).map((event, index) => {
    const previous = captured[index];
    return previous === undefined
      ? Number.NaN
      : event.timeStamp - previous.timeStamp;
  });
  // Match PointerGestureInput: coalesced movement samples replace their
  // parent, and only sufficiently spaced intermediate points are retained.
  // Keep raw dispatch cadence separately; it is not the hardware sample gap.
  const samples = [{ timeStamp: first.timeStamp,
    positionPixels: { x: first.clientX - canvasBounds.x, y: first.clientY - canvasBounds.y } }];
  for (const event of captured.slice(1, -1)) {
    const movements = event.coalescedEvents.length > 0 ? event.coalescedEvents : [event];
    for (const movement of movements) {
      if (movement.pointerId !== first.pointerId) continue;
      const point = { x: movement.clientX - canvasBounds.x, y: movement.clientY - canvasBounds.y };
      if (isIntermediateSampleFarEnough(samples.at(-1)!.positionPixels, point,
        { xPixels: 0, yPixels: 0, widthPixels: canvasBounds.width, heightPixels: canvasBounds.height },
        STANDARD_GESTURE_CONFIG)) {
        samples.push({ timeStamp: movement.timeStamp, positionPixels: point });
      }
    }
  }
  samples.push({ timeStamp: last.timeStamp,
    positionPixels: { x: last.clientX - canvasBounds.x, y: last.clientY - canvasBounds.y } });
  const gapsMilliseconds = samples.slice(1).map((sample, index) =>
    sample.timeStamp - samples[index]!.timeStamp);
  const maximumSampleGapMilliseconds = Math.max(...gapsMilliseconds);
  const maximumDispatchedEventGapMilliseconds = Math.max(...dispatchedGapsMilliseconds);
  const renderFramesDuringHandlerInterval =
    last.presentedFrames - first.presentedFrames;
  // Pointer timestamps describe the native gesture. Chromium may queue its
  // handlers until after pointerup was generated. Count complete real renders
  // returning inside that native interval, rather than the compressed delivery
  // burst. A render already in progress at pointerdown still really completes
  // during the gesture; requiring its entry after down would invent a new limit.
  const renderFramesDuringGesture = renderIntervals.filter(([entry, completion]) =>
    Number.isFinite(entry) && Number.isFinite(completion) && completion >= entry &&
    completion >= first.timeStamp && completion <= last.timeStamp).length;

  if (
    !Number.isFinite(durationMilliseconds) ||
    durationMilliseconds < MINIMUM_DURATION_MS ||
    durationMilliseconds > MAXIMUM_DURATION_MS ||
    dispatchedGapsMilliseconds.some((gap) => !Number.isFinite(gap) || gap < 0) ||
    gapsMilliseconds.some(
      (gapMilliseconds) =>
        !Number.isFinite(gapMilliseconds) || gapMilliseconds < 0,
    ) ||
    !Number.isFinite(maximumSampleGapMilliseconds) ||
    maximumSampleGapMilliseconds > MAX_SAMPLE_GAP_MS ||
    !Number.isInteger(renderFramesDuringHandlerInterval) ||
    (requirePresentedFrame && renderFramesDuringGesture < 1)
  ) {
    throw new Error(
      "Native Chromium pointer timing or presentation violates the production gesture contract: " +
        JSON.stringify({
          durationMilliseconds,
          maximumSampleGapMilliseconds,
          maximumDispatchedEventGapMilliseconds,
          renderFramesDuringGesture,
          renderFramesDuringHandlerInterval,
          renderIntervals,
          captured,
          rawEvents: trace,
          productionRejectionReason,
          requirePresentedFrame,
        }),
    );
  }

  return Object.freeze({
    events: Object.freeze(captured),
    rawEvents: Object.freeze([...trace]),
    pointerType: first.pointerType,
    durationMilliseconds,
    maximumSampleGapMilliseconds,
    maximumDispatchedEventGapMilliseconds,
    renderFramesDuringGesture,
    renderFramesDuringHandlerInterval,
    renderIntervals,
    productionRejectionReason,
    presentationRequirementApplied: requirePresentedFrame,
    canvasBounds: Object.freeze({ ...canvasBounds }),
  });
}

/** Native Chromium input with host pacing and unmodified event timestamps. */
export async function dispatchNativePath(
  page: Page,
  pointerType: "mouse" | "touch",
  points: readonly (readonly [number, number])[],
  durationMilliseconds = 240,
): Promise<PointerGestureEvidence> {
  const box = await page.locator("#game-canvas").boundingBox();
  if (!box || points.length < 2) throw new Error("Native path requires canvas and endpoints");
  const pixel = ([x, y]: readonly [number, number]) => ({ x: box.x + x * box.width, y: box.y + y * box.height });
  const start = pixel(points[0]!);
  if (pointerType === "mouse") await page.mouse.move(start.x, start.y);
  await installPointerTrace(page);
  const client = await page.context().newCDPSession(page);
  const pending: Promise<unknown>[] = [];
  const send = (type: "start" | "move" | "end", point: { x: number; y: number }) => {
    if (pointerType === "touch") return client.send("Input.dispatchTouchEvent", {
      type: type === "start" ? "touchStart" : type === "end" ? "touchEnd" : "touchMove",
      touchPoints: type === "end" ? [] : [{ ...point, id: 1 }],
    });
    return client.send("Input.dispatchMouseEvent", {
      type: type === "start" ? "mousePressed" : type === "end" ? "mouseReleased" : "mouseMoved",
      ...point, button: "left", buttons: type === "end" ? 0 : 1, clickCount: 1,
    });
  };
  try {
    pending.push(send("start", start));
    const stepsPerLeg = 4;
    const delay = durationMilliseconds / ((points.length - 1) * stepsPerLeg + 1);
    for (let i = 1; i < points.length; i++) {
      const a = pixel(points[i - 1]!), b = pixel(points[i]!);
      for (let j = 1; j <= stepsPerLeg; j++) {
        await hostDelay(delay);
        pending.push(send("move", { x: a.x + (b.x - a.x) * j / stepsPerLeg,
          y: a.y + (b.y - a.y) * j / stepsPerLeg }));
      }
    }
    await hostDelay(delay);
    pending.push(send("end", pixel(points.at(-1)!)));
    await Promise.all(pending);
    await waitForPointerUp(page, pointerType);
  } finally { await client.detach(); }
  return collectPointerTrace(page, true);
}
