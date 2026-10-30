import { describe, expect, it } from "vitest";
import {
  STANDARD_BALL_FLIGHT_CONFIG,
  STANDARD_GESTURE_CONFIG,
  STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG,
  STANDARD_RELEASE_POSITION,
  STANDARD_TRAJECTORY_CONFIG,
} from "../../src/config/defaults";
import type { GestureConfig } from "../../src/config/types";
import { SeededRng } from "../../src/core/SeededRng";
import { recognizeFeintPrefix } from "../../src/domain/gesture/feint";
import { analyzeStandardGesture } from "../../src/domain/gesture/features";
import type { NormalizedGesturePoint } from "../../src/domain/gesture/model";
import {
  chooseGoalkeeperZone,
  goalkeeperPositionDuringShot,
} from "../../src/domain/goalkeeper/zones";
import {
  advanceBallFlight,
  createBaselineBallFlight,
  type BallFlightState,
} from "../../src/domain/shot/ballFlight";
import { mapAimToGoalTarget } from "../../src/domain/shot/target";

const VIEWPORT = Object.freeze({ widthPixels: 1000, heightPixels: 500 });
const FIXED_STEP_SECONDS = 1 / 60;
const EDGE_DELTA = 1e-6;

function point(x: number, y: number, timeSeconds: number): NormalizedGesturePoint {
  return Object.freeze({
    positionPixels: Object.freeze({ x: x * 1000, y: y * 500 }),
    safeAreaPosition01: Object.freeze({ x, y }),
    timeSeconds,
  });
}

function canonicalFeint(direction: -1 | 1): readonly NormalizedGesturePoint[] {
  return Object.freeze([
    point(0.5, 0.84, 0),
    point(0.5 + direction * 0.1, 0.8, 0.08),
    point(0.5 + direction * 0.05, 0.79, 0.14),
    point(0.5 - direction * 0.12, 0.6, 0.22),
    point(0.5 - direction * 0.16, 0.55, 0.28),
  ]);
}

function brakeOnlyFeint(): readonly NormalizedGesturePoint[] {
  return Object.freeze([
    point(0.5, 0.84, 0),
    point(0.6, 0.8, 0.08),
    point(0.601, 0.7996, 0.14),
    point(0.4, 0.6, 0.22),
  ]);
}

function recognizeWithConfig(
  trace: readonly NormalizedGesturePoint[],
  config: Partial<GestureConfig>,
) {
  return recognizeFeintPrefix(trace, {
    ...STANDARD_GESTURE_CONFIG,
    ...config,
  });
}

function snapshotFlight(state: BallFlightState) {
  return Object.freeze({
    ...state,
    position: Object.freeze({ ...state.position }),
    previousPosition: Object.freeze({ ...state.previousPosition }),
    velocity: Object.freeze({ ...state.velocity }),
    initialVelocity: Object.freeze({ ...state.initialVelocity }),
    contactHistory: Object.freeze([...state.contactHistory]),
  });
}

function replayFeintShot(seed: number) {
  const trace = canonicalFeint(1);
  const feint = recognizeFeintPrefix(trace, STANDARD_GESTURE_CONFIG);
  if (feint === null) {
    throw new Error("Canonical FEINT must be recognized before replay.");
  }
  const gesture = analyzeStandardGesture(
    [point(0.5, 0.84, 0), point(0.42, 0.73, 0.08), point(0.34, 0.62, 0.16)],
    VIEWPORT,
    STANDARD_GESTURE_CONFIG,
  );
  const target = mapAimToGoalTarget(
    gesture.aim.horizontalAim,
    gesture.aim.verticalAim,
    STANDARD_GOAL_CONFIG,
  );
  const flight = createBaselineBallFlight(
    STANDARD_RELEASE_POSITION,
    target,
    gesture.power,
    STANDARD_TRAJECTORY_CONFIG,
    STANDARD_BALL_FLIGHT_CONFIG,
    gesture.loft,
    gesture.sideSpin,
    gesture.topSpin,
    gesture.bounceIntent,
  );
  const keeperZone = chooseGoalkeeperZone(
    new SeededRng(seed).fork("keeper"),
  );
  const flightStates = [];
  for (let step = 0; step < 600 && flight.terminalState === null; step += 1) {
    const previousKeeper = goalkeeperPositionDuringShot(
      keeperZone,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      flight.elapsedSeconds,
    );
    const currentKeeper = goalkeeperPositionDuringShot(
      keeperZone,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      flight.elapsedSeconds + FIXED_STEP_SECONDS,
    );
    advanceBallFlight(
      flight,
      FIXED_STEP_SECONDS,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: previousKeeper, currentPosition: currentKeeper },
    );
    flightStates.push(snapshotFlight(flight));
  }
  if (flight.terminalState === null) {
    throw new Error("Canonical FEINT replay did not physically terminate.");
  }
  return Object.freeze({
    gesture,
    keeperZone,
    flightStates: Object.freeze(flightStates),
    contacts: Object.freeze([...flight.contactHistory]),
    terminalState: flight.terminalState,
  });
}

describe("FEINT prefix recognition", () => {
  it.each([-1, 1] as const)(
    "recognizes and deterministically replays a horizontal %s prefix",
    (direction) => {
      const trace = canonicalFeint(direction);
      const first = recognizeFeintPrefix(trace, STANDARD_GESTURE_CONFIG);
      const replay = recognizeFeintPrefix(trace, STANDARD_GESTURE_CONFIG);
      const transitions = trace.map((_, index) =>
        recognizeFeintPrefix(
          trace.slice(0, index + 1),
          STANDARD_GESTURE_CONFIG,
        )?.type ?? null,
      );
      const replayTransitions = trace.map((_, index) =>
        recognizeFeintPrefix(
          trace.slice(0, index + 1),
          STANDARD_GESTURE_CONFIG,
        )?.type ?? null,
      );

      expect(first).not.toBeNull();
      expect(replay).toEqual(first);
      expect(transitions).toEqual([null, null, null, "FEINT", "FEINT"]);
      expect(replayTransitions).toEqual(transitions);
      expect(first?.type).toBe("FEINT");
      expect(Math.sign(first?.apparentDirection.x ?? 0)).toBe(direction);
      expect(
        Object.values(first?.apparentDirection ?? {}).every(Number.isFinite),
      ).toBe(true);
      expect(Math.abs(first?.apparentDirection.x ?? 0)).toBeLessThanOrEqual(1);
      expect(Math.abs(first?.apparentDirection.y ?? 0)).toBeLessThanOrEqual(1);

      const released = analyzeStandardGesture(
        trace,
        VIEWPORT,
        STANDARD_GESTURE_CONFIG,
        first,
      );
      const releasedReplay = analyzeStandardGesture(
        trace,
        VIEWPORT,
        STANDARD_GESTURE_CONFIG,
        replay,
      );
      expect(releasedReplay).toEqual(released);
      expect(released.feint).toEqual(first);
      expect(["DIRECT", "LOB", "BOUNCE"]).toContain(released.category);
      expect(Math.sign(released.aim.horizontalAim)).toBe(-direction);
    },
  );

  it("replays an independent shot following a recognized fake through seeded fixed-step physical completion", () => {
    const first = replayFeintShot(19);
    const replay = replayFeintShot(19);

    expect(replay.gesture).toEqual(first.gesture);
    expect(replay.gesture.feint).toEqual(first.gesture.feint);
    expect(replay.gesture.category).toBe(first.gesture.category);
    expect(replay.keeperZone).toBe(first.keeperZone);
    expect(replay.flightStates).toEqual(first.flightStates);
    expect(replay.contacts).toEqual(first.contacts);
    expect(replay.terminalState).toBe(first.terminalState);
    expect(["DIRECT", "LOB", "BOUNCE"]).toContain(first.gesture.category);
    expect(first.contacts.filter((contact) => contact.outcome !== null)).toHaveLength(1);
  });

  it.each([
    [
      "straight",
      [point(0.5, 0.84, 0), point(0.5, 0.75, 0.08), point(0.5, 0.66, 0.16), point(0.5, 0.57, 0.24)],
    ],
    [
      "smooth curve",
      [point(0.5, 0.84, 0), point(0.57, 0.8, 0.08), point(0.62, 0.73, 0.14), point(0.64, 0.64, 0.22)],
    ],
    [
      "LOB waypoint",
      [point(0.5, 0.84, 0), point(0.5, 0.64, 0.08), point(0.5, 0.7, 0.14), point(0.5, 0.6, 0.22)],
    ],
    [
      "BOUNCE trace",
      [point(0.5, 0.84, 0), point(0.43, 0.83, 0.08), point(0.36, 0.82, 0.14), point(0.3, 0.81, 0.22)],
    ],
    [
      "browser jitter",
      [point(0.5, 0.84, 0), point(0.501, 0.839, 0.08), point(0.499, 0.838, 0.14), point(0.5, 0.837, 0.22)],
    ],
    [
      "small correction",
      [point(0.5, 0.84, 0), point(0.6, 0.8, 0.08), point(0.58, 0.78, 0.14), point(0.5, 0.62, 0.22)],
    ],
    [
      "incomplete reversal",
      [point(0.5, 0.84, 0), point(0.6, 0.8, 0.08), point(0.55, 0.79, 0.14), point(0.54, 0.78, 0.22)],
    ],
  ] as const)("does not recognize a %s", (_name, trace) => {
    expect(recognizeFeintPrefix(trace, STANDARD_GESTURE_CONFIG)).toBeNull();
  });

  it("keeps every distance, direction, speed, and duration threshold equality non-FEINT", () => {
    const trace = canonicalFeint(1).slice(0, 4);
    const [start, initial, brake, second] = trace;
    if (
      start === undefined ||
      initial === undefined ||
      brake === undefined ||
      second === undefined
    ) {
      throw new Error("Threshold trace is incomplete.");
    }
    const initialX = initial.safeAreaPosition01.x - start.safeAreaPosition01.x;
    const initialY = start.safeAreaPosition01.y - initial.safeAreaPosition01.y;
    const initialLength = Math.hypot(initialX, initialY);
    const unitX = initialX / initialLength;
    const unitY = initialY / initialLength;
    const brakeX = brake.safeAreaPosition01.x - initial.safeAreaPosition01.x;
    const brakeY = initial.safeAreaPosition01.y - brake.safeAreaPosition01.y;
    const brakeLength = Math.hypot(brakeX, brakeY);
    const brakeProgress =
      (brake.safeAreaPosition01.x - start.safeAreaPosition01.x) * unitX +
      (start.safeAreaPosition01.y - brake.safeAreaPosition01.y) * unitY;
    const retraced = initialLength - brakeProgress;
    const reversalDot = (brakeX * unitX + brakeY * unitY) / brakeLength;
    const secondX = second.safeAreaPosition01.x - brake.safeAreaPosition01.x;
    const secondY = brake.safeAreaPosition01.y - second.safeAreaPosition01.y;
    const secondLength = Math.hypot(secondX, secondY);
    const secondDirectionDot =
      (secondX * unitX + secondY * unitY) / secondLength;
    const recognizedAtSeconds = second.timeSeconds - start.timeSeconds;

    const brakeTrace = brakeOnlyFeint();
    const [brakeStart, brakeInitial, brakeSlow] = brakeTrace;
    if (
      brakeStart === undefined ||
      brakeInitial === undefined ||
      brakeSlow === undefined
    ) {
      throw new Error("Brake-speed trace is incomplete.");
    }
    const brakeInitialLength = Math.hypot(
      brakeInitial.safeAreaPosition01.x - brakeStart.safeAreaPosition01.x,
      brakeStart.safeAreaPosition01.y - brakeInitial.safeAreaPosition01.y,
    );
    const brakeInitialSpeed =
      brakeInitialLength / (brakeInitial.timeSeconds - brakeStart.timeSeconds);
    const slowLength = Math.hypot(
      brakeSlow.safeAreaPosition01.x - brakeInitial.safeAreaPosition01.x,
      brakeInitial.safeAreaPosition01.y - brakeSlow.safeAreaPosition01.y,
    );
    const brakeSpeedRatio =
      slowLength /
      (brakeSlow.timeSeconds - brakeInitial.timeSeconds) /
      brakeInitialSpeed;

    const cases: readonly Readonly<{
      name: string;
      candidateTrace: readonly NormalizedGesturePoint[];
      equality: Partial<GestureConfig>;
      adjacent: Partial<GestureConfig>;
    }>[] = [
      {
        name: "initial impulse distance",
        candidateTrace: trace,
        equality: { feintMinimumInitialImpulseSafeFraction: initialLength },
        adjacent: {
          feintMinimumInitialImpulseSafeFraction: initialLength - EDGE_DELTA,
        },
      },
      {
        name: "initial horizontal ratio",
        candidateTrace: trace,
        equality: {
          feintMinimumInitialHorizontalRatio: Math.abs(initialX) / initialLength,
        },
        adjacent: {
          feintMinimumInitialHorizontalRatio:
            Math.abs(initialX) / initialLength - EDGE_DELTA,
        },
      },
      {
        name: "reversal distance",
        candidateTrace: trace,
        equality: { feintMinimumBrakeSafeFraction: retraced },
        adjacent: { feintMinimumBrakeSafeFraction: retraced - EDGE_DELTA },
      },
      {
        name: "reversal direction",
        candidateTrace: trace,
        equality: { feintMaximumReversalDirectionDot: reversalDot },
        adjacent: {
          feintMaximumReversalDirectionDot: reversalDot + EDGE_DELTA,
        },
      },
      {
        name: "brake speed ratio",
        candidateTrace: brakeTrace,
        equality: { feintMaximumBrakeSpeedRatio: brakeSpeedRatio },
        adjacent: {
          feintMaximumBrakeSpeedRatio: brakeSpeedRatio + EDGE_DELTA,
        },
      },
      {
        name: "second impulse distance",
        candidateTrace: trace,
        equality: { feintMinimumSecondImpulseSafeFraction: secondLength },
        adjacent: {
          feintMinimumSecondImpulseSafeFraction: secondLength - EDGE_DELTA,
        },
      },
      {
        name: "second impulse direction",
        candidateTrace: trace,
        equality: {
          feintMaximumSecondImpulseDirectionDot: secondDirectionDot,
        },
        adjacent: {
          feintMaximumSecondImpulseDirectionDot:
            secondDirectionDot + EDGE_DELTA,
        },
      },
      {
        name: "maximum prefix duration",
        candidateTrace: trace,
        equality: { feintMaximumPrefixDurationSeconds: recognizedAtSeconds },
        adjacent: {
          feintMaximumPrefixDurationSeconds: recognizedAtSeconds + EDGE_DELTA,
        },
      },
    ];

    for (const edge of cases) {
      expect(
        recognizeWithConfig(edge.candidateTrace, edge.equality),
        `${edge.name} equality`,
      ).toBeNull();
      expect(
        recognizeWithConfig(edge.candidateTrace, edge.adjacent),
        `${edge.name} adjacent permissive edge`,
      ).not.toBeNull();
    }
  });

  it("rejects invalid FEINT configuration", () => {
    expect(() =>
      recognizeFeintPrefix(canonicalFeint(1), {
        ...STANDARD_GESTURE_CONFIG,
        feintMinimumBrakeSafeFraction: Number.NaN,
      }),
    ).toThrow(/FEINT brake threshold.*finite/);
    expect(() =>
      recognizeFeintPrefix(canonicalFeint(1), {
        ...STANDARD_GESTURE_CONFIG,
        feintMaximumSecondImpulseDirectionDot: 0,
      }),
    ).toThrow(/second impulse direction.*within/);
  });

  it("does not alter category or continuous release features", () => {
    const trace = canonicalFeint(1);
    const feint = recognizeFeintPrefix(trace, STANDARD_GESTURE_CONFIG);
    const ordinary = analyzeStandardGesture(trace, VIEWPORT, STANDARD_GESTURE_CONFIG);
    const prefixed = analyzeStandardGesture(trace, VIEWPORT, STANDARD_GESTURE_CONFIG, feint);
    const { feint: ordinaryMetadata, ...ordinaryShot } = ordinary;
    const { feint: prefixedMetadata, ...prefixedShot } = prefixed;

    expect(ordinaryMetadata).toBeNull();
    expect(prefixedMetadata).toEqual(feint);
    expect(prefixedShot).toEqual(ordinaryShot);
  });
});
