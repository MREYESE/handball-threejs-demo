import { describe, expect, it, vi } from "vitest";
import { STANDARD_GESTURE_CONFIG } from "../../src/config/defaults";
import type {
  FeintAction,
  GestureRejectionReason,
} from "../../src/domain/gesture/model";
import type { GoalkeeperObservation } from "../../src/domain/goalkeeper/commitment";
import { GoalkeeperCommitmentController } from "../../src/domain/goalkeeper/commitment";
import { STANDARD_GOALKEEPER_CONFIG } from "../../src/config/defaults";
import { SeededRng } from "../../src/core/SeededRng";
import {
  PointerGestureInput,
  type AcceptedPointerGesture,
} from "../../src/input/PointerGestureInput";

interface PointerDispatch {
  readonly pointerId?: number;
  readonly pointerType?: string;
  readonly isPrimary?: boolean;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly timeStamp?: number;
  readonly coalesced?: readonly PointerEvent[];
}

class FakeCanvas {
  private readonly listeners = new Map<
    string,
    Set<EventListenerOrEventListenerObject>
  >();
  private readonly capturedPointers = new Set<number>();

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
  ): void {
    if (listener === null) {
      return;
    }
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
  ): void {
    if (listener !== null) {
      this.listeners.get(type)?.delete(listener);
    }
  }

  public setPointerCapture(pointerId: number): void {
    this.capturedPointers.add(pointerId);
  }

  public hasPointerCapture(pointerId: number): boolean {
    return this.capturedPointers.has(pointerId);
  }

  public releasePointerCapture(pointerId: number): void {
    this.capturedPointers.delete(pointerId);
  }

  public getBoundingClientRect(): DOMRect {
    return {
      x: 0,
      y: 0,
      width: 960,
      height: 540,
      top: 0,
      right: 960,
      bottom: 540,
      left: 0,
      toJSON: () => ({}),
    } as DOMRect;
  }

  public dispatchPointer(type: string, dispatch: PointerDispatch = {}): void {
    const pointerId = dispatch.pointerId ?? 1;
    if (type === "lostpointercapture") {
      this.capturedPointers.delete(pointerId);
    }
    const event = {
      type,
      pointerId,
      pointerType: dispatch.pointerType ?? "mouse",
      isPrimary: dispatch.isPrimary ?? true,
      clientX: dispatch.clientX ?? 480,
      clientY: dispatch.clientY ?? 454,
      timeStamp: dispatch.timeStamp ?? 1_000,
      preventDefault: vi.fn(),
      getCoalescedEvents: () => dispatch.coalesced ?? [],
    } as unknown as PointerEvent;
    for (const listener of this.listeners.get(type) ?? []) {
      if (typeof listener === "function") {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    }
  }
}

function pointerEvent(dispatch: PointerDispatch): PointerEvent {
  return {
    pointerId: dispatch.pointerId ?? 1,
    pointerType: dispatch.pointerType ?? "mouse",
    isPrimary: dispatch.isPrimary ?? true,
    clientX: dispatch.clientX ?? 480,
    clientY: dispatch.clientY ?? 454,
    timeStamp: dispatch.timeStamp ?? 1_000,
  } as PointerEvent;
}

function createInput(canvas: FakeCanvas): {
  readonly input: PointerGestureInput;
  readonly accepted: AcceptedPointerGesture[];
  readonly completed: AcceptedPointerGesture[];
  readonly rejected: GestureRejectionReason[];
  readonly feints: (FeintAction | null)[];
  readonly observations: GoalkeeperObservation[];
  readonly gestureStarts: ReturnType<typeof vi.fn>;
} {
  const accepted: AcceptedPointerGesture[] = [];
  const completed: AcceptedPointerGesture[] = [];
  const rejected: GestureRejectionReason[] = [];
  const feints: (FeintAction | null)[] = [];
  const observations: GoalkeeperObservation[] = [];
  const gestureStarts = vi.fn();
  const input = new PointerGestureInput(
    canvas as unknown as HTMLCanvasElement,
    STANDARD_GESTURE_CONFIG,
    {
      onAccepted: (result) => accepted.push(result),
      onFeintCompleted: (result) => completed.push(result),
      onRejected: (reason) => rejected.push(reason),
      onGestureStarted: gestureStarts,
      onGoalkeeperObservation: (observation) => observations.push(observation),
      onFeintChanged: (feint) => feints.push(feint),
      onTrailChanged: vi.fn(),
    },
  );
  return { input, accepted, completed, rejected, feints, observations, gestureStarts };
}

describe("PointerGestureInput browser lifecycle", () => {
  it("preserves keeper cue history and commitment when native moves are coalesced", () => {
    const run = (coalesced: boolean) => {
      const canvas = new FakeCanvas();
      const { input, observations, accepted } = createInput(canvas);
      canvas.dispatchPointer("pointerdown", { timeStamp: 1_000 });
      const moves = [
        { clientX: 403.2, clientY: 427, timeStamp: 1_055 },
        { clientX: 374.4, clientY: 410.8, timeStamp: 1_110 },
      ];
      if (coalesced) {
        canvas.dispatchPointer("pointermove", {
          ...moves[1], coalesced: moves.map(pointerEvent),
        });
      } else {
        for (const move of moves) canvas.dispatchPointer("pointermove", move);
      }
      const keeper = new GoalkeeperCommitmentController(
        STANDARD_GOALKEEPER_CONFIG, new SeededRng(43),
      );
      keeper.queueGestureStart();
      for (const observation of observations) keeper.queueObservation(observation);
      for (let step = 0; step < 5; step++) keeper.advance(1 / 60);
      const result = { observations, keeper: keeper.diagnostics() };
      expect(accepted).toEqual([]);
      expect(canvas.hasPointerCapture(1)).toBe(true);
      input.dispose();
      return result;
    };
    const separate = run(false);
    expect(separate.keeper.phase).toBe("COMMIT");
    expect(separate.keeper.committedDestination).toBe("high-left");
    expect(run(true)).toEqual(separate);
  });

  it("accepts a valid terminal pointerup when normal capture loss is observed first", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown", {
      clientY: 454,
      timeStamp: 1_000,
    });
    canvas.dispatchPointer("pointermove", {
      clientY: 350,
      timeStamp: 1_080,
    });
    canvas.dispatchPointer("lostpointercapture", {
      clientY: 350,
      timeStamp: 1_085,
    });
    canvas.dispatchPointer("pointerup", {
      clientY: 350,
      timeStamp: 1_100,
    });

    expect(rejected).toEqual([]);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.pointerType).toBe("mouse");
    input.dispose();
  });

  it("uses coalesced movement samples without also processing the parent event", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown", {
      clientY: 454,
      timeStamp: 1_000,
    });
    canvas.dispatchPointer("pointermove", {
      clientX: 620,
      clientY: 260,
      timeStamp: 1_300,
      coalesced: [
        pointerEvent({ clientX: 490, clientY: 400, timeStamp: 1_060 }),
        pointerEvent({ clientX: 500, clientY: 350, timeStamp: 1_080 }),
      ],
    });
    canvas.dispatchPointer("pointerup", {
      clientX: 500,
      clientY: 350,
      timeStamp: 1_100,
    });

    expect(rejected).toEqual([]);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.gesture.rawPoints).toHaveLength(4);
    input.dispose();
  });

  it("still treats pointercancel as the interruption terminal", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown");
    canvas.dispatchPointer("pointercancel", { timeStamp: 1_050 });

    expect(accepted).toEqual([]);
    expect(rejected).toEqual(["INTERRUPTED"]);
    expect(canvas.hasPointerCapture(1)).toBe(false);
    input.dispose();
  });

  it("releases active capture and removes listeners during disposal", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown");
    expect(canvas.hasPointerCapture(1)).toBe(true);
    input.dispose();
    expect(canvas.hasPointerCapture(1)).toBe(false);

    canvas.dispatchPointer("pointermove", {
      clientY: 350,
      timeStamp: 1_080,
    });
    canvas.dispatchPointer("pointerup", {
      clientY: 350,
      timeStamp: 1_100,
    });
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([]);
  });

  it("emits one FEINT while capture remains active and completes without shooting", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, completed, rejected, feints } = createInput(canvas);

    canvas.dispatchPointer("pointerdown", { clientX: 480, clientY: 454, timeStamp: 1_000 });
    canvas.dispatchPointer("pointermove", { clientX: 580, clientY: 432, timeStamp: 1_060 });
    canvas.dispatchPointer("pointermove", { clientX: 530, clientY: 426, timeStamp: 1_120 });
    canvas.dispatchPointer("pointermove", { clientX: 360, clientY: 314, timeStamp: 1_200 });

    expect(feints.filter((feint) => feint !== null)).toHaveLength(1);
    expect(input.diagnostics()).toMatchObject({
      captureActive: true,
      pointerType: "mouse",
      pendingFeint: { type: "FEINT" },
    });
    expect(canvas.hasPointerCapture(1)).toBe(true);
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([]);

    canvas.dispatchPointer("pointerup", { clientX: 340, clientY: 290, timeStamp: 1_240 });
    expect(accepted).toHaveLength(0);
    expect(completed).toHaveLength(1);
    expect(completed[0]?.gesture.feint).toEqual(feints[0]);
    expect(input.diagnostics()).toMatchObject({ captureActive: false, pendingFeint: null });
    input.dispose();
  });

  it("publishes finite normalized pre-release cues while capture remains active", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, observations, gestureStarts } = createInput(canvas);
    canvas.dispatchPointer("pointerdown", {
      clientX: 480,
      clientY: 454,
      timeStamp: 1_000,
    });
    canvas.dispatchPointer("pointermove", {
      clientX: 576,
      clientY: 400,
      timeStamp: 1_100,
    });

    expect(gestureStarts).toHaveBeenCalledOnce();
    expect(accepted).toEqual([]);
    expect(canvas.hasPointerCapture(1)).toBe(true);
    expect(observations).toHaveLength(1);
    const cue = observations[0];
    expect(cue?.elapsedGestureSeconds).toBeCloseTo(0.1);
    expect(cue?.feint).toBeNull();
    expect(cue?.confidence).toBeGreaterThan(0);
    expect(
      Math.hypot(
        cue?.apparentDirection.x ?? 0,
        cue?.apparentDirection.y ?? 0,
      ),
    ).toBeCloseTo(1);
    input.dispose();
  });

  it("clears FEINT on cancellation and rejection without leaking to the next gesture", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected, feints } = createInput(canvas);
    const stageFeint = (startTime: number) => {
      canvas.dispatchPointer("pointerdown", { clientX: 480, clientY: 454, timeStamp: startTime });
      canvas.dispatchPointer("pointermove", { clientX: 580, clientY: 432, timeStamp: startTime + 60 });
      canvas.dispatchPointer("pointermove", { clientX: 530, clientY: 426, timeStamp: startTime + 120 });
      canvas.dispatchPointer("pointermove", { clientX: 360, clientY: 314, timeStamp: startTime + 200 });
    };

    stageFeint(1_000);
    canvas.dispatchPointer("pointercancel", { timeStamp: 1_220 });
    expect(rejected).toEqual(["INTERRUPTED"]);
    expect(input.diagnostics().pendingFeint).toBeNull();

    stageFeint(2_000);
    canvas.dispatchPointer("pointerup", { clientX: 340, clientY: 290, timeStamp: 2_600 });
    expect(rejected.at(-1)).toBe("SAMPLE_GAP_TOO_LONG");
    expect(input.diagnostics().pendingFeint).toBeNull();

    canvas.dispatchPointer("pointerdown", { clientX: 480, clientY: 454, timeStamp: 3_000 });
    canvas.dispatchPointer("pointermove", { clientX: 480, clientY: 370, timeStamp: 3_080 });
    canvas.dispatchPointer("pointerup", { clientX: 480, clientY: 330, timeStamp: 3_120 });
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.gesture.feint).toBeNull();
    expect(feints.filter((feint) => feint !== null)).toHaveLength(2);
    input.dispose();
  });
});

it("records production coalesced provenance, filtered samples and replay without changing acceptance", async () => {
  const { GestureTrace, replayGestureTrace } = await import("../../src/dev/GestureTrace");
  vi.stubGlobal("window", { innerWidth: 960, innerHeight: 540, devicePixelRatio: 2 });
  try {
    const canvas = new FakeCanvas();
    const trace = new GestureTrace(STANDARD_GESTURE_CONFIG, { seed: 1 });
    const accepted: AcceptedPointerGesture[] = [];
  const completed: AcceptedPointerGesture[] = [];
    const input = new PointerGestureInput(canvas as unknown as HTMLCanvasElement, STANDARD_GESTURE_CONFIG,
      { onAccepted: (value) => accepted.push(value), onFeintCompleted: (value) => completed.push(value), onRejected: vi.fn(), onTrailChanged: vi.fn() }, trace);
    canvas.dispatchPointer("pointerdown", { timeStamp: 1000 });
    canvas.dispatchPointer("pointermove", { timeStamp: 1100, clientY: 350, coalesced: [
      pointerEvent({ timeStamp: 1020, clientY: 454 }),
      pointerEvent({ timeStamp: 1100, clientY: 350 }),
    ] });
    canvas.dispatchPointer("pointerup", { timeStamp: 1200, clientY: 280 });
    const attempt = trace.export().attempts[0]!;
    expect(attempt.samples.map((sample) => [sample.source, sample.retained])).toEqual([
      ["down", true], ["parent", false], ["coalesced", false], ["coalesced", true], ["up", true],
    ]);
    expect(accepted).toHaveLength(1);
    expect(replayGestureTrace(attempt, STANDARD_GESTURE_CONFIG)).toEqual({ accepted: true, gesture: accepted[0]!.gesture });
    input.dispose();
  } finally { vi.unstubAllGlobals(); }
});

it("replays FEINT at the same retained prefix inside a coalesced batch", async () => {
  const { GestureTrace, replayGestureTrace } = await import("../../src/dev/GestureTrace");
  vi.stubGlobal("window", { innerWidth: 960, innerHeight: 540, devicePixelRatio: 1 });
  const canvas = new FakeCanvas();
  const trace = new GestureTrace(STANDARD_GESTURE_CONFIG, {});
  const accepted: AcceptedPointerGesture[] = [];
  const completed: AcceptedPointerGesture[] = [];
  const input = new PointerGestureInput(canvas as unknown as HTMLCanvasElement, STANDARD_GESTURE_CONFIG,
    { onAccepted: (value) => accepted.push(value), onFeintCompleted: (value) => completed.push(value), onRejected: vi.fn(), onTrailChanged: vi.fn() }, trace);
  try {
    canvas.dispatchPointer("pointerdown", { clientX: 480, clientY: 454, timeStamp: 1000 });
    const moves = [
      { clientX: 580, clientY: 432, timeStamp: 1060 },
      { clientX: 530, clientY: 426, timeStamp: 1120 },
      { clientX: 360, clientY: 314, timeStamp: 1200 },
      { clientX: 350, clientY: 300, timeStamp: 1220 },
    ];
    canvas.dispatchPointer("pointermove", { ...moves[3], coalesced: moves.map(pointerEvent) });
    canvas.dispatchPointer("pointerup", { clientX: 340, clientY: 290, timeStamp: 1240 });
    expect(accepted).toHaveLength(0);
    expect(completed).toHaveLength(1);
    expect(completed[0]!.gesture.feint).not.toBeNull();
    expect(replayGestureTrace(trace.export().attempts[0]!, trace.config)).toEqual({
      accepted: true, gesture: completed[0]!.gesture,
    });
  } finally {
    input.dispose();
    vi.unstubAllGlobals();
  }
});

it("keeps recorded and unrecorded FEINT, rejection and physical release/contact/results identical", async () => {
  const { GestureTrace, replayGestureTrace } = await import("../../src/dev/GestureTrace");
  const defaults = await import("../../src/config/defaults");
  const { mapAimToGoalTarget } = await import("../../src/domain/shot/target");
  const { createBaselineBallFlight, advanceBallFlight } = await import("../../src/domain/shot/ballFlight");
  const { goalkeeperPositionDuringShot } = await import("../../src/domain/goalkeeper/zones");
  vi.stubGlobal("window", { innerWidth: 960, innerHeight: 540, devicePixelRatio: 1 });
  try {
    const trace = new GestureTrace(STANDARD_GESTURE_CONFIG, {});
    const recordedCanvas = new FakeCanvas();
    const plainCanvas = new FakeCanvas();
    const plain = createInput(plainCanvas);
    const recorded: AcceptedPointerGesture[] = [];
    const rejected: GestureRejectionReason[] = [];
    const input = new PointerGestureInput(recordedCanvas as unknown as HTMLCanvasElement, STANDARD_GESTURE_CONFIG,
      { onAccepted: (a) => recorded.push(a), onRejected: (r) => rejected.push(r), onTrailChanged: vi.fn() }, trace);
    for (const canvas of [plainCanvas, recordedCanvas]) {
      canvas.dispatchPointer("pointerdown", { clientX: 480, clientY: 454, timeStamp: 1000 });
      canvas.dispatchPointer("pointerdown", { pointerId: 2, timeStamp: 1010 });
      canvas.dispatchPointer("pointermove", { pointerId: 2, clientX: 20, timeStamp: 1020 });
      canvas.dispatchPointer("pointerup", { pointerId: 2, timeStamp: 1030 });
      expect(canvas.hasPointerCapture(1)).toBe(true);
      canvas.dispatchPointer("pointermove", { clientX: 580, clientY: 432, timeStamp: 1060 });
      canvas.dispatchPointer("pointermove", { clientX: 530, clientY: 426, timeStamp: 1120 });
      canvas.dispatchPointer("pointermove", { clientX: 360, clientY: 314, timeStamp: 1200 });
      canvas.dispatchPointer("pointerup", { clientX: 340, clientY: 290, timeStamp: 1240 });
      canvas.dispatchPointer("pointerdown", { clientX: 480, clientY: 454, timeStamp: 1500 });
      canvas.dispatchPointer("pointermove", { clientX: 500, clientY: 370, timeStamp: 1580 });
      canvas.dispatchPointer("pointerup", { clientX: 520, clientY: 330, timeStamp: 1620 });
      canvas.dispatchPointer("pointerdown", { timeStamp: 2000 });
      canvas.dispatchPointer("pointercancel", { timeStamp: 2100 });
    }
    expect(recorded).toEqual(plain.accepted);
    expect(rejected).toEqual(plain.rejected);
    expect(recorded).toHaveLength(1);
    expect(recorded[0]!.gesture.feint).toBeNull();
    expect(trace.export().attempts[0]!.action).toBe("FEINT");
    expect(trace.export().attempts[0]!.release).toBeNull();
    expect(replayGestureTrace(trace.export().attempts[1]!, trace.config)).toEqual({ accepted: true, gesture: recorded[0]!.gesture });
    const flights = [recorded[0]!, plain.accepted[0]!].map(({ gesture }) => {
      const target = mapAimToGoalTarget(gesture.aim.horizontalAim, gesture.aim.verticalAim, defaults.STANDARD_GOAL_CONFIG);
      const ball = createBaselineBallFlight(defaults.STANDARD_RELEASE_POSITION, target, gesture.power,
        defaults.STANDARD_TRAJECTORY_CONFIG, defaults.STANDARD_BALL_FLIGHT_CONFIG, gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent);
      for (let i = 0; i < 600 && ball.terminalState === null; i++) {
        const position = (seconds: number) => goalkeeperPositionDuringShot("mid-center", defaults.STANDARD_GOAL_CONFIG.center,
          defaults.STANDARD_GOALKEEPER_CONFIG, seconds);
        advanceBallFlight(ball, 1 / 60, defaults.STANDARD_GOAL_CONFIG, defaults.STANDARD_GOALKEEPER_CONFIG,
          { previousPosition: position(ball.elapsedSeconds), currentPosition: position(ball.elapsedSeconds + 1 / 60) });
      }
      expect(ball.terminalState).not.toBeNull();
      return ball;
    });
    expect(flights[0]).toEqual(flights[1]);
    input.dispose();
    plain.input.dispose();
  } finally { vi.unstubAllGlobals(); }
});

it.each([
  [[480,454],[480,380],[480,330]],
  [[480,459],[480,243],[480,335]],
  [[480,335],[480,454],[480,259]],
  [[480,459],[480,416],[384,378],[480,335]],
  [[480,459],[480,416],[576,378],[480,335]],
])("a completed fake never launches, and a new independent shooting trace launches exactly once: %j", (...path) => {
  const canvas=new FakeCanvas(); const {input,accepted,completed,rejected}=createInput(canvas);
  const dispatch=(points:number[][],start:number)=>{
    canvas.dispatchPointer("pointerdown",{clientX:points[0]![0]!,clientY:points[0]![1]!,timeStamp:start});
    for(let i=1;i<points.length;i++) canvas.dispatchPointer("pointermove",{clientX:points[i]![0]!,clientY:points[i]![1]!,timeStamp:start+i*60});
    canvas.dispatchPointer("pointerup",{clientX:points.at(-1)![0]!,clientY:points.at(-1)![1]!,timeStamp:start+points.length*60});
  };
  // Return near the origin: net distance is not the validity test for a fake.
  dispatch([[480,454],[586,432],[532,426],[480,454]],1000);
  expect(completed).toHaveLength(1); expect(accepted).toHaveLength(0);
  expect(rejected).toEqual([]); expect(input.diagnostics().captureActive).toBe(false);
  dispatch(path as number[][],2000);
  expect(accepted).toHaveLength(1); expect(accepted[0]!.gesture.feint).toBeNull();
  expect(completed).toHaveLength(1); expect(rejected).toEqual([]); input.dispose();
});

it("unexpected capture loss cancels without a shot while ordinary capture loss/up ordering remains valid", async()=>{
  vi.useFakeTimers();
  try {
    const canvas=new FakeCanvas(); const {input,accepted,rejected}=createInput(canvas);
    canvas.dispatchPointer("pointerdown");
    canvas.dispatchPointer("pointermove",{clientY:350,timeStamp:1080});
    canvas.dispatchPointer("lostpointercapture",{timeStamp:1090});
    await vi.runAllTimersAsync();
    expect(accepted).toEqual([]); expect(rejected).toEqual(["INTERRUPTED"]);
    expect(input.diagnostics().captureActive).toBe(false); input.dispose();
  } finally {vi.useRealTimers();}
});

it("three-point lateral reversal and moving brake complete independent non-shooting actions",()=>{
  for(const path of [
    [[480,454,1000],[586,432,1080],[480,454,1160],[480,454,1180]],
    [[480,454,1000],[586,432,1080],[594,430,1180],[594,430,1200]],
  ]) {
    const canvas=new FakeCanvas(); const {input,accepted,completed,rejected}=createInput(canvas);
    canvas.dispatchPointer("pointerdown",{clientX:path[0]![0]!,clientY:path[0]![1]!,timeStamp:path[0]![2]!});
    for(const [i,p] of path.slice(1).entries())canvas.dispatchPointer(i===path.length-2?"pointerup":"pointermove",{clientX:p[0]!,clientY:p[1]!,timeStamp:p[2]!});
    expect(accepted).toEqual([]);expect(completed).toHaveLength(1);expect(rejected).toEqual([]);input.dispose();
  }
});

it("a lateral stroke without a real moving brake remains a shot even when released stationary",()=>{
  const canvas=new FakeCanvas(); const {input,accepted,completed}=createInput(canvas);
  canvas.dispatchPointer("pointerdown",{clientX:480,clientY:454,timeStamp:1000});
  canvas.dispatchPointer("pointermove",{clientX:535,clientY:444,timeStamp:1080});
  canvas.dispatchPointer("pointermove",{clientX:590,clientY:434,timeStamp:1160});
  canvas.dispatchPointer("pointerup",{clientX:590,clientY:434,timeStamp:1200});
  expect(completed).toEqual([]);expect(accepted).toHaveLength(1);input.dispose();
});

it.each([
  {path:[[480,335],[480,454],[480,335]],category:"BOUNCE"},
  {path:[[480,459],[480,367],[480,421]],category:"LOB"},
])("recognizes meaningful $category legs even with a short net endpoint distance",({path,category})=>{
  const canvas=new FakeCanvas();const {input,accepted,rejected}=createInput(canvas);
  canvas.dispatchPointer("pointerdown",{clientX:path[0]![0]!,clientY:path[0]![1]!,timeStamp:1000});
  canvas.dispatchPointer("pointermove",{clientX:path[1]![0]!,clientY:path[1]![1]!,timeStamp:1080});
  canvas.dispatchPointer("pointerup",{clientX:path[2]![0]!,clientY:path[2]![1]!,timeStamp:1160});
  expect(rejected).toEqual([]);expect(accepted).toHaveLength(1);expect(accepted[0]!.gesture.category).toBe(category);input.dispose();
});
