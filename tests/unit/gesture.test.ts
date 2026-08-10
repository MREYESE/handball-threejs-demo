import { describe, expect, it } from "vitest";
import { STANDARD_GESTURE_CONFIG } from "../../src/config/defaults";
import {
  analyzeStandardGesture,
  calculatePowerFeatures,
  calculateWeightedPower,
  normalizeAim,
} from "../../src/domain/gesture/features";
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
});
