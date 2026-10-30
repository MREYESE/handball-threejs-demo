import { describe, expect, it } from "vitest";
import {
  STANDARD_BALL_FLIGHT_CONFIG,
  STANDARD_GESTURE_CONFIG,
  STANDARD_GOAL_CONFIG,
  STANDARD_RELEASE_POSITION,
  STANDARD_TRAJECTORY_CONFIG,
} from "../../src/config/defaults";
import {
  analyzeStandardGesture,
  calculateGestureBounceIntent,
  calculateGestureLoft,
  calculateGestureSideSpin,
  calculateGestureTopSpin,
  calculatePowerFeatures,
  calculateWeightedPower,
  normalizeAim,
} from "../../src/domain/gesture/features";
import { classifyShotCategory } from "../../src/domain/gesture/classification";
import type {
  GestureCaptureOptions,
  GestureRejectionReason,
  GestureSample,
  NormalizedGesturePoint,
  Viewport,
} from "../../src/domain/gesture/model";
import {
  isIntermediateSampleFarEnough,
  preprocessGesture,
  resampleGesturePath,
  smoothGesturePath,
} from "../../src/domain/gesture/preprocess";
import { createBaselineBallFlight } from "../../src/domain/shot/ballFlight";
import { mapAimToGoalTarget } from "../../src/domain/shot/target";

const VIEWPORT: Viewport = Object.freeze({
  widthPixels: 1000,
  heightPixels: 500,
});

interface RejectionCase {
  readonly name: string;
  readonly points: readonly GestureSample[];
  readonly options: GestureCaptureOptions;
  readonly reason: GestureRejectionReason;
}

function sample(x: number, y: number, timeSeconds: number): GestureSample {
  return {
    positionPixels: { x, y },
    timeSeconds,
  };
}

function normalizedPoint(
  x: number,
  y: number,
  timeSeconds: number,
): NormalizedGesturePoint {
  return {
    positionPixels: { x: x * 1000, y: y * 500 },
    safeAreaPosition01: { x, y },
    timeSeconds,
  };
}

describe("gesture preprocessing", () => {
  it("accepts a swipe starting in the lower 45 percent and continuing outside it", () => {
    const result = preprocessGesture(
      [sample(500, 400, 2), sample(530, 300, 2.1), sample(540, 180, 2.2)],
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );

    expect(result.accepted).toBe(true);
    if (result.accepted) {
      expect(result.durationSeconds).toBeCloseTo(0.2);
      expect(result.points[0]?.timeSeconds).toBe(0);
      expect(result.points.at(-1)?.safeAreaPosition01.y).toBeCloseTo(0.36);
    }
  });

  const rejectionCases: readonly RejectionCase[] = [
    {
      name: "disabled input",
      points: [sample(500, 400, 0), sample(500, 300, 0.1)],
      options: { inputEnabled: false },
      reason: "INPUT_DISABLED",
    },
    {
      name: "another active capture",
      points: [sample(500, 400, 0), sample(500, 300, 0.1)],
      options: { captureAlreadyActive: true },
      reason: "CAPTURE_ALREADY_ACTIVE",
    },
    {
      name: "start above input zone",
      points: [sample(500, 200, 0), sample(500, 100, 0.1)],
      options: {},
      reason: "START_OUTSIDE_INPUT_ZONE",
    },
    {
      name: "blocking UI",
      points: [sample(500, 400, 0), sample(500, 300, 0.1)],
      options: { startedOverBlockingUi: true },
      reason: "STARTED_OVER_BLOCKING_UI",
    },
    {
      name: "interruption",
      points: [sample(500, 400, 0), sample(500, 300, 0.1)],
      options: { interrupted: true },
      reason: "INTERRUPTED",
    },
    {
      name: "non-finite sample",
      points: [sample(500, 400, 0), sample(Number.NaN, 300, 0.1)],
      options: {},
      reason: "NON_FINITE_SAMPLE",
    },
    {
      name: "short duration",
      points: [sample(500, 400, 0), sample(500, 300, 0.02)],
      options: {},
      reason: "DURATION_TOO_SHORT",
    },
    {
      name: "long duration",
      points: [sample(500, 400, 0), sample(500, 300, 1.51)],
      options: {},
      reason: "SAMPLE_GAP_TOO_LONG",
    },
    {
      name: "sample gap",
      points: [
        sample(500, 400, 0),
        sample(500, 350, 0.1),
        sample(500, 300, 0.36),
      ],
      options: {},
      reason: "SAMPLE_GAP_TOO_LONG",
    },
    {
      name: "short displacement",
      points: [sample(500, 400, 0), sample(510, 390, 0.1)],
      options: {},
      reason: "DISTANCE_TOO_SHORT",
    },
  ];

  it.each(rejectionCases)("rejects $name", ({ points, options, reason }: RejectionCase) => {
    const result = preprocessGesture(
      points,
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
      options,
    );

    expect(result).toEqual({ accepted: false, reason });
  });

  it("rejects excessive total duration even when individual gaps remain valid", () => {
    const points = Array.from({ length: 8 }, (_, index) =>
      sample(500, 430 - index * 20, index * 0.22),
    );
    const result = preprocessGesture(points, VIEWPORT, STANDARD_GESTURE_CONFIG);

    expect(result).toEqual({ accepted: false, reason: "DURATION_TOO_LONG" });
  });

  it("preserves endpoints while smoothing and resamples by path length", () => {
    const smoothed = smoothGesturePath(
      [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 0 },
      ],
      3,
    );
    expect(smoothed[0]).toEqual({ x: 0, y: 0 });
    expect(smoothed[1]).toEqual({ x: 1, y: 1 / 3 });
    expect(smoothed[2]).toEqual({ x: 2, y: 0 });

    const resampled = resampleGesturePath(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ],
      3,
    );
    expect(resampled).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  it("applies the Unity-derived 0.002 safe-area intermediate sample threshold", () => {
    const safeArea = {
      xPixels: 0,
      yPixels: 0,
      widthPixels: 1000,
      heightPixels: 500,
    };
    expect(
      isIntermediateSampleFarEnough(
        { x: 100, y: 400 },
        { x: 101, y: 400 },
        safeArea,
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(false);
    expect(
      isIntermediateSampleFarEnough(
        { x: 100, y: 400 },
        { x: 102, y: 400 },
        safeArea,
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(true);
  });
});

describe("normalized aim and feature power", () => {
  it("matches the Unity-derived 0.22 width and 0.28 height golden ranges", () => {
    expect(
      normalizeAim({ dx: 220, dyUp: 70 }, VIEWPORT, STANDARD_GESTURE_CONFIG),
    ).toEqual({
      horizontalAim: 1,
      verticalGesture01: 0.5,
      verticalAim: 0,
    });
    expect(
      normalizeAim({ dx: -440, dyUp: 140 }, VIEWPORT, STANDARD_GESTURE_CONFIG),
    ).toEqual({
      horizontalAim: -1,
      verticalGesture01: 1,
      verticalAim: 1,
    });
    expect(
      normalizeAim({ dx: 0, dyUp: -20 }, VIEWPORT, STANDARD_GESTURE_CONFIG),
    ).toEqual({
      horizontalAim: 0,
      verticalGesture01: 0,
      verticalAim: -1,
    });
  });

  it("weights release, maximum speed, and processed path instead of distance alone", () => {
    const path = [
      { x: 0, y: 0 },
      { x: 0, y: 0.35 },
    ];
    const slow = calculatePowerFeatures(
      [normalizedPoint(0, 0, 0), normalizedPoint(0, 0.35, 0.35)],
      path,
      STANDARD_GESTURE_CONFIG,
    );
    const fast = calculatePowerFeatures(
      [normalizedPoint(0, 0, 0), normalizedPoint(0, 0.35, 0.1)],
      path,
      STANDARD_GESTURE_CONFIG,
    );

    expect(slow.pathLengthContribution).toBe(1);
    expect(fast.pathLengthContribution).toBe(1);
    expect(calculateWeightedPower(fast, STANDARD_GESTURE_CONFIG)).toBeGreaterThan(
      calculateWeightedPower(slow, STANDARD_GESTURE_CONFIG),
    );
    expect(calculateWeightedPower(fast, STANDARD_GESTURE_CONFIG)).toBe(1);
  });

  it("uses 32 smoothed/resampled points for an accepted standard gesture", () => {
    const capture = preprocessGesture(
      [
        sample(400, 430, 0),
        sample(440, 360, 0.05),
        sample(500, 250, 0.1),
      ],
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );
    expect(capture.accepted).toBe(true);
    if (!capture.accepted) {
      return;
    }

    const analyzed = analyzeStandardGesture(
      capture.points,
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );
    expect(analyzed.resampledPoints).toHaveLength(32);
    expect(analyzed.aim.horizontalAim).toBeCloseTo(100 / 220);
    expect(analyzed.aim.verticalAim).toBe(1);
    expect(analyzed.power).toBeGreaterThan(0);
  });

  it("derives bounded deterministic loft from path geometry independently of endpoint aim", () => {
    const lowTrace = [
      normalizedPoint(0.5, 0.84, 0),
      normalizedPoint(0.423, 0.89, 0.1),
      normalizedPoint(0.346, 0.7, 0.2),
    ];
    const highTrace = [
      normalizedPoint(0.5, 0.84, 0),
      normalizedPoint(0.423, 0.65, 0.1),
      normalizedPoint(0.346, 0.7, 0.2),
    ];

    const low = analyzeStandardGesture(
      lowTrace,
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );
    const high = analyzeStandardGesture(
      highTrace,
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );
    const replay = analyzeStandardGesture(
      highTrace,
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );

    expect(low.aim).toEqual(high.aim);
    // Final leg speeds differ: power uses temporal bins, not event counts.
    expect(low.power).toBeGreaterThan(high.power);
    expect([low.loft, high.loft, replay.loft].every(Number.isFinite)).toBe(true);
    expect(low.loft).toBeGreaterThanOrEqual(0);
    expect(high.loft).toBeLessThanOrEqual(1);
    expect(high.loft).toBeGreaterThan(low.loft);
    expect(replay.loft).toBe(high.loft);

    const launch = (gesture: typeof high) =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(
          gesture.aim.horizontalAim,
          gesture.aim.verticalAim,
          STANDARD_GOAL_CONFIG,
        ),
        0.75, // Isolate loft from the deliberately different final-leg speeds.
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        gesture.loft,
      );
    const lowLaunch = launch(low);
    const highLaunch = launch(high);
    const replayLaunch = launch(replay);
    expect(highLaunch.releaseSpeedMetersPerSecond).toBeCloseTo(
      lowLaunch.releaseSpeedMetersPerSecond,
      12,
    );
    expect(highLaunch.initialVelocity.y).toBeGreaterThan(
      lowLaunch.initialVelocity.y,
    );
    expect(replayLaunch.initialVelocity).toEqual(highLaunch.initialVelocity);
  });

  it("clamps extreme loft traces and rejects non-finite loft inputs and config", () => {
    expect(
      calculateGestureLoft(
        [
          { x: 0.5, y: 0.9 },
          { x: 0.5, y: -10_000 },
          { x: 0.5, y: 0.7 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(1);
    expect(() =>
      calculateGestureLoft(
        [
          { x: 0.5, y: 0.9 },
          { x: 0.5, y: Number.POSITIVE_INFINITY },
          { x: 0.5, y: 0.7 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toThrow(/only finite values/);
    expect(() =>
      calculateGestureLoft(
        [
          { x: 0.5, y: 0.9 },
          { x: 0.5, y: 0.7 },
        ],
        { ...STANDARD_GESTURE_CONFIG, loftFullRangeSafeFraction: Number.NaN },
      ),
    ).toThrow(/positive finite/);
    expect(
      calculateGestureLoft(
        [
          { x: 0.5, y: 0.84 },
          { x: 0.02, y: 0.02 },
          { x: 0.346, y: 0.7 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(0);
  });

  it("does not infer loft from uneven samples or a repeated release endpoint", () => {
    expect(
      calculateGestureLoft(
        [
          { x: 0.5, y: 0.84 },
          { x: 0.346, y: 0.7 },
          { x: 0.346, y: 0.7 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBeCloseTo(0, 12);
  });

  it("derives neutral and mirrored bounded side-spin without changing endpoint intent", () => {
    const trace = (offset: number) => [
      normalizedPoint(0.5, 0.84, 0),
      normalizedPoint(0.5 + offset * 0.7, 0.76, 0.05),
      normalizedPoint(0.5 + offset, 0.68, 0.1),
      normalizedPoint(0.5 + offset * 0.7, 0.6, 0.15),
      normalizedPoint(0.5, 0.52, 0.2),
    ];
    const neutral = analyzeStandardGesture(
      trace(0),
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );
    const left = analyzeStandardGesture(
      trace(-0.09),
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );
    const right = analyzeStandardGesture(
      trace(0.09),
      VIEWPORT,
      STANDARD_GESTURE_CONFIG,
    );

    expect(neutral.sideSpin).toBeCloseTo(0, 12);
    expect(left.sideSpin).toBeLessThan(0);
    expect(right.sideSpin).toBeGreaterThan(0);
    expect(right.sideSpin).toBeCloseTo(-left.sideSpin, 12);
    expect(Math.abs(right.sideSpin)).toBeLessThanOrEqual(1);
    expect(left.aim).toEqual(right.aim);
    expect(left.power).toBeCloseTo(right.power, 12);
    expect(left.loft).toBeCloseTo(right.loft, 12);

    const launch = (gesture: typeof left) =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(
          gesture.aim.horizontalAim,
          gesture.aim.verticalAim,
          STANDARD_GOAL_CONFIG,
        ),
        gesture.power,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        gesture.loft,
        gesture.sideSpin,
      );
    const leftLaunch = launch(left);
    const rightLaunch = launch(right);
    expect(leftLaunch.initialVelocity).toEqual(rightLaunch.initialVelocity);
    expect(leftLaunch.releaseSpeedMetersPerSecond).toBeCloseTo(
      rightLaunch.releaseSpeedMetersPerSecond,
      12,
    );
    expect(leftLaunch.releaseSideSpin).toBe(left.sideSpin);
    expect(rightLaunch.releaseSideSpin).toBe(right.sideSpin);
  });

  it("treats browser-scale coordinate quantization as neutral side-spin", () => {
    for (const coordinateNoise of [-5e-8, 5e-8]) {
      expect(
        calculateGestureSideSpin(
          [
            { x: 0.5, y: 0.84 },
            { x: 0.5 + coordinateNoise, y: 0.68 },
            { x: 0.5, y: 0.52 },
          ],
          STANDARD_GESTURE_CONFIG,
        ),
      ).toBe(0);
    }
  });

  it("clamps extreme side-spin and rejects non-finite trace and configuration values", () => {
    expect(
      calculateGestureSideSpin(
        [
          { x: 0.5, y: 0.84 },
          { x: 10_000, y: 0.68 },
          { x: 0.5, y: 0.52 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(1);
    expect(
      calculateGestureSideSpin(
        [
          { x: 0.5, y: 0.84 },
          { x: -10_000, y: 0.68 },
          { x: 0.5, y: 0.52 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(-1);
    expect(() =>
      calculateGestureSideSpin(
        [
          { x: 0.5, y: 0.84 },
          { x: Number.NaN, y: 0.68 },
          { x: 0.5, y: 0.52 },
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toThrow(/only finite values/);
    expect(() =>
      calculateGestureSideSpin(
        [
          { x: 0.5, y: 0.84 },
          { x: 0.5, y: 0.52 },
        ],
        {
          ...STANDARD_GESTURE_CONFIG,
          sideSpinFullRangeSafeFraction: Number.POSITIVE_INFINITY,
        },
      ),
    ).toThrow(/positive finite/);
  });

  it("derives bounded monotonic top-spin from downward bow without changing endpoint intent", () => {
    const trace = (downwardOffset: number) => {
      if (downwardOffset === 0) {
        return [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, 0.68, 0.1),
          normalizedPoint(0.5, 0.52, 0.2),
        ];
      }
      return [
        normalizedPoint(0.5, 0.84, 0),
        ...Array.from({ length: 6 }, (_, index) => {
          const progress = (index + 1) / 6;
          return normalizedPoint(
            0.5,
            0.84 + downwardOffset * progress,
            progress * 0.1,
          );
        }),
        normalizedPoint(0.5, 0.52, 0.2),
      ];
    };
    const monotonicTestConfig = {
      ...STANDARD_GESTURE_CONFIG,
      topSpinFullRangeSafeFraction: 1,
    };
    const neutral = analyzeStandardGesture(
      trace(0),
      VIEWPORT,
      monotonicTestConfig,
    );
    const low = analyzeStandardGesture(
      trace(0.08),
      VIEWPORT,
      monotonicTestConfig,
    );
    const high = analyzeStandardGesture(
      trace(0.09),
      VIEWPORT,
      monotonicTestConfig,
    );

    expect(neutral.topSpin).toBe(0);
    expect(low.topSpin).toBeGreaterThan(0);
    expect(high.topSpin).toBeGreaterThan(low.topSpin);
    expect(high.topSpin).toBeLessThanOrEqual(1);
    expect(neutral.aim).toEqual(low.aim);
    expect(low.aim).toEqual(high.aim);
    for (const gesture of [neutral, low, high]) {
      expect(gesture.loft).toBe(0);
      expect(gesture.sideSpin).toBe(0);
    }
  });

  it("keeps geometrically straight traces neutral regardless of pointer-event timing", () => {
    expect(
      calculateGestureTopSpin(
        [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, 0.76, 0.1),
          normalizedPoint(0.5, 0.52, 0.2),
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBeCloseTo(0, 12);
    expect(
      calculateGestureTopSpin(
        [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, 0.76, 0.19),
          normalizedPoint(0.5, 0.52, 0.2),
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBeCloseTo(0, 12);
  });

  it("absorbs half-pixel browser jitter on neutral and downward-bowed traces", () => {
    const halfPixel = 0.5 / VIEWPORT.heightPixels;
    const neutral = calculateGestureTopSpin(
      [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.5, 0.76 + halfPixel, 0.1),
        normalizedPoint(0.5, 0.52, 0.2),
      ],
      STANDARD_GESTURE_CONFIG,
    );
    const bowed = calculateGestureTopSpin(
      [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.5, 0.88 + halfPixel, 0.1),
        normalizedPoint(0.5, 0.52, 0.2),
      ],
      STANDARD_GESTURE_CONFIG,
    );

    expect(neutral).toBe(0);
    expect(bowed).toBeGreaterThan(0);
  });

  it("guards extreme and invalid top-spin values", () => {
    expect(
      calculateGestureTopSpin(
        [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, 1.04, 0.1),
          normalizedPoint(0.5, 0.52, 0.2),
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe(1);
    expect(() =>
      calculateGestureTopSpin(
        [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, Number.NaN, 0.1),
          normalizedPoint(0.5, 0.52, 0.2),
        ],
        STANDARD_GESTURE_CONFIG,
      ),
    ).toThrow(/only finite values/);
    expect(() =>
      calculateGestureTopSpin(
        [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, 0.52, 0.2),
        ],
        {
          ...STANDARD_GESTURE_CONFIG,
          topSpinFullRangeSafeFraction: Number.POSITIVE_INFINITY,
        },
      ),
    ).toThrow(/positive finite/);
  });

  it("derives bounded monotonic bounce intent from lower endpoint intent", () => {
    expect(
      calculateGestureBounceIntent(0.5, STANDARD_GESTURE_CONFIG),
    ).toBe(0);
    expect(
      calculateGestureBounceIntent(0.25, STANDARD_GESTURE_CONFIG),
    ).toBe(0.5);
    expect(
      calculateGestureBounceIntent(0, STANDARD_GESTURE_CONFIG),
    ).toBe(1);
    expect(
      calculateGestureBounceIntent(-10, STANDARD_GESTURE_CONFIG),
    ).toBe(1);
    expect(
      calculateGestureBounceIntent(10, STANDARD_GESTURE_CONFIG),
    ).toBe(0);
  });

  it("carries bounce intent without changing endpoint aim or existing features", () => {
    const analyze = (releaseY: number) =>
      analyzeStandardGesture(
        [
          normalizedPoint(0.5, 0.84, 0),
          normalizedPoint(0.5, (0.84 + releaseY) / 2, 0.1),
          normalizedPoint(0.5, releaseY, 0.2),
        ],
        VIEWPORT,
        STANDARD_GESTURE_CONFIG,
      );
    const lower = analyze(0.8);
    const higher = analyze(0.7);

    expect(lower.bounceIntent).toBe(0);
    expect(higher.bounceIntent).toBe(0);
    expect(lower.category).toBe("DIRECT");
    expect(lower.aim.verticalGesture01).toBeLessThan(
      higher.aim.verticalGesture01,
    );
    expect(lower.loft).toBe(0);
    expect(higher.loft).toBe(0);
    expect(lower.sideSpin).toBe(0);
    expect(higher.sideSpin).toBe(0);
    expect(lower.topSpin).toBe(0);
    expect(higher.topSpin).toBe(0);
  });

  it("rejects non-finite bounce intent and configuration", () => {
    expect(() =>
      calculateGestureBounceIntent(Number.NaN, STANDARD_GESTURE_CONFIG),
    ).toThrow(/must be finite/);
    expect(() =>
      calculateGestureBounceIntent(0.25, {
        ...STANDARD_GESTURE_CONFIG,
        bounceZeroIntentVerticalGesture01: Number.POSITIVE_INFINITY,
      }),
    ).toThrow(/finite and within/);
  });

  it("classifies canonical and conservative normalized gesture traces", () => {
    const traces = {
      direct: [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.5, 0.77, 0.1),
        normalizedPoint(0.5, 0.7, 0.2),
      ],
      lob: [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.5, 0.65, 0.1),
        normalizedPoint(0.5, 0.7, 0.2),
      ],
      bounce: [
        normalizedPoint(0.5, 0.62, 0),
        normalizedPoint(0.43, 0.84, 0.1),
        normalizedPoint(0.36, 0.48, 0.2),
      ],
      conflicting: [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.43, 0.69, 0.1),
        normalizedPoint(0.36, 0.82, 0.2),
      ],
      ambiguous: [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.5, 0.73, 0.1),
        normalizedPoint(0.5, 0.77, 0.2),
      ],
      smallCorrection: [
        normalizedPoint(0.5, 0.84, 0),
        normalizedPoint(0.52, 0.74, 0.1),
        normalizedPoint(0.5, 0.7, 0.2),
      ],
    } as const;
    const classifyTrace = (trace: readonly NormalizedGesturePoint[]) =>
      analyzeStandardGesture(trace, VIEWPORT, STANDARD_GESTURE_CONFIG).category;

    expect(classifyTrace(traces.direct)).toBe("DIRECT");
    expect(classifyTrace(traces.lob)).toBe("LOB");
    expect(classifyTrace(traces.bounce)).toBe("BOUNCE");
    expect(classifyTrace(traces.conflicting)).toBe("DIRECT");
    expect(classifyTrace(traces.ambiguous)).toBe("DIRECT");
    expect(classifyTrace(traces.smallCorrection)).toBe("DIRECT");

    const firstBytes = JSON.stringify(
      Object.values(traces).map((trace) => classifyTrace(trace)),
    );
    const replayBytes = JSON.stringify(
      Object.values(traces).map((trace) => classifyTrace(trace)),
    );
    expect(replayBytes).toBe(firstBytes);
  });

  it("uses strict bounded thresholds and DIRECT for edges or competing signals", () => {
    const thresholdEdgeTrace = [
      normalizedPoint(0.5, 0.84, 0),
      normalizedPoint(0.5, 0.66, 0.1),
      normalizedPoint(0.5, 0.705, 0.2),
    ];
    const thresholdEdgeLoft = calculateGestureLoft(
      thresholdEdgeTrace.map((point) => point.safeAreaPosition01),
      STANDARD_GESTURE_CONFIG,
    );
    const thresholdEdgeConfig = {
      ...STANDARD_GESTURE_CONFIG,
      lobCategoryMinimumLoft: thresholdEdgeLoft,
    };
    expect(
      analyzeStandardGesture(
        thresholdEdgeTrace,
        VIEWPORT,
        thresholdEdgeConfig,
      ).category,
    ).toBe("DIRECT");
    expect(
      analyzeStandardGesture(
        thresholdEdgeTrace,
        VIEWPORT,
        thresholdEdgeConfig,
      ).category,
    ).toBe("DIRECT");

    expect(
      classifyShotCategory(
        {
          loft: STANDARD_GESTURE_CONFIG.lobCategoryMinimumLoft,
          bounceIntent: 0,
        },
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe("DIRECT");
    expect(
      classifyShotCategory(
        {
          loft: 0,
          bounceIntent:
            STANDARD_GESTURE_CONFIG.bounceCategoryMinimumIntent,
        },
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe("DIRECT");
    expect(
      classifyShotCategory(
        { loft: 0.9, bounceIntent: 0.9 },
        STANDARD_GESTURE_CONFIG,
      ),
    ).toBe("DIRECT");

    expect(() =>
      classifyShotCategory(
        { loft: Number.NaN, bounceIntent: 0 },
        STANDARD_GESTURE_CONFIG,
      ),
    ).toThrow(/loft.*finite and within/);
    expect(() =>
      classifyShotCategory(
        { loft: 0, bounceIntent: 1.01 },
        STANDARD_GESTURE_CONFIG,
      ),
    ).toThrow(/bounce intent.*finite and within/);
    expect(() =>
      classifyShotCategory(
        { loft: 0, bounceIntent: 0 },
        { ...STANDARD_GESTURE_CONFIG, lobCategoryMinimumLoft: 1 },
      ),
    ).toThrow(/LOB category threshold.*within/);
    expect(() =>
      classifyShotCategory(
        { loft: 0, bounceIntent: 0 },
        {
          ...STANDARD_GESTURE_CONFIG,
          bounceCategoryMinimumIntent: Number.POSITIVE_INFINITY,
        },
      ),
    ).toThrow(/BOUNCE category threshold.*within/);
  });

  it("changes only the category when classification thresholds change", () => {
    const trace = [
      normalizedPoint(0.5, 0.84, 0),
      normalizedPoint(0.5, 0.65, 0.1),
      normalizedPoint(0.5, 0.7, 0.2),
    ];
    const lob = analyzeStandardGesture(trace, VIEWPORT, {
      ...STANDARD_GESTURE_CONFIG,
      lobCategoryMinimumLoft: 0.5,
    });
    const direct = analyzeStandardGesture(trace, VIEWPORT, {
      ...STANDARD_GESTURE_CONFIG,
      lobCategoryMinimumLoft: 0.95,
    });
    const { category: lobCategory, ...lobContinuousFeatures } = lob;
    const { category: directCategory, ...directContinuousFeatures } = direct;

    expect(lobCategory).toBe("LOB");
    expect(directCategory).toBe("DIRECT");
    expect(directContinuousFeatures).toEqual(lobContinuousFeatures);
  });
});
