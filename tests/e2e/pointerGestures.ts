import type { BrowserContext, Page } from "@playwright/test";

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

export interface PointerTraceEvent {
  readonly type: string;
  readonly timeStamp: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly isPrimary: boolean;
  readonly presentedFrames: number;
}

export interface PointerGestureEvidence {
  readonly events: readonly PointerTraceEvent[];
  readonly rawEvents: readonly PointerTraceEvent[];
  readonly pointerType: string;
  readonly durationMilliseconds: number;
  readonly maximumSampleGapMilliseconds: number;
  readonly renderFramesDuringGesture: number;
  readonly productionRejectionReason: string | null;
  readonly presentationRequirementApplied: boolean;
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
  const powerAnchor = options.saturatePower
    ? resolvePowerSaturationAnchor(box, endX)
    : null;

  // Setup positioning is outside the measured gesture.
  await page.mouse.move(startX, startY);
  await installPointerTrace(page);
  const client = await page.context().newCDPSession(page);

  try {
    const pendingNativeEvents: Promise<unknown>[] = [
      client.send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: startX,
        y: startY,
        button: "left",
        buttons: 1,
        clickCount: 1,
      }),
    ];

    // This timer runs in the Node host, not on the render-blocked page main thread.
    await hostDelay(holdMilliseconds);

    const movementTargetX = powerAnchor?.x ?? endX;
    const movementTargetY = powerAnchor?.y ?? endY;
    for (let index = 1; index <= NATIVE_MOVE_COUNT; index += 1) {
      pendingNativeEvents.push(
        client.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x:
            startX +
            ((movementTargetX - startX) * index) / NATIVE_MOVE_COUNT,
          y:
            startY +
            ((movementTargetY - startY) * index) / NATIVE_MOVE_COUNT,
          buttons: 1,
        }),
      );
    }
    pendingNativeEvents.push(
      client.send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: endX,
        y: endY,
        button: "left",
        buttons: 0,
        clickCount: 1,
      }),
    );
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
  const client = await context.newCDPSession(page);

  await installPointerTrace(page);
  try {
    const pendingNativeEvents: Promise<unknown>[] = [
      client.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: startX, y: startY, id: 1 }],
      }),
    ];
    await hostDelay(holdMilliseconds);

    for (let index = 1; index <= NATIVE_MOVE_COUNT; index += 1) {
      pendingNativeEvents.push(
        client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [
            {
              x: startX + ((endX - startX) * index) / NATIVE_MOVE_COUNT,
              y: startY + ((endY - startY) * index) / NATIVE_MOVE_COUNT,
              id: 1,
            },
          ],
        }),
      );
    }
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

function hostDelay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
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
      trace.push({
        type: event.type,
        timeStamp: event.timeStamp,
        clientX: event.clientX,
        clientY: event.clientY,
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        presentedFrames: presentedCanvas.__HANDBALL_PRESENTED_FRAMES__ ?? 0,
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
    delete state.__POINTER_E2E_ABORT__;
    delete state.__POINTER_E2E_TRACE__;
    return { trace, productionRejectionReason };
  });

  return validatePointerTrace(
    collected.trace,
    collected.productionRejectionReason,
    requirePresentedFrame,
  );
}

function validatePointerTrace(
  trace: readonly PointerTraceEvent[],
  productionRejectionReason: string | null,
  requirePresentedFrame: boolean,
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
  const gapsMilliseconds = captured.slice(1).map((event, index) => {
    const previous = captured[index];
    return previous === undefined
      ? Number.NaN
      : event.timeStamp - previous.timeStamp;
  });
  const maximumSampleGapMilliseconds = Math.max(...gapsMilliseconds);
  const renderFramesDuringGesture =
    last.presentedFrames - first.presentedFrames;

  if (
    !Number.isFinite(durationMilliseconds) ||
    durationMilliseconds < MINIMUM_DURATION_MS ||
    durationMilliseconds > MAXIMUM_DURATION_MS ||
    gapsMilliseconds.some(
      (gapMilliseconds) =>
        !Number.isFinite(gapMilliseconds) || gapMilliseconds < 0,
    ) ||
    !Number.isFinite(maximumSampleGapMilliseconds) ||
    maximumSampleGapMilliseconds > MAX_SAMPLE_GAP_MS ||
    !Number.isInteger(renderFramesDuringGesture) ||
    (requirePresentedFrame && renderFramesDuringGesture < 1)
  ) {
    throw new Error(
      "Native Chromium pointer timing or presentation violates the production gesture contract: " +
        JSON.stringify({
          durationMilliseconds,
          maximumSampleGapMilliseconds,
          renderFramesDuringGesture,
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
    renderFramesDuringGesture,
    productionRejectionReason,
    presentationRequirementApplied: requirePresentedFrame,
  });
}
