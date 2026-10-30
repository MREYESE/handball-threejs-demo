import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  STANDARD_BALL_FLIGHT_CONFIG,
  STANDARD_GESTURE_CONFIG,
  STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG,
  STANDARD_RELEASE_POSITION,
  STANDARD_TRAJECTORY_CONFIG,
} from "../../src/config/defaults";
import { resolveStraightSwipeWaypoints, validatePointerTrace, type PointerTraceEvent } from "../e2e/pointerGestures";
import { HandballDemoApp } from "../../src/app/HandballDemoApp";
import { beginShot, createMatchState } from "../../src/domain/match/state";
import { FixedClock } from "../../src/core/FixedClock";
import { SeededRng } from "../../src/core/SeededRng";
import { analyzeStandardGesture } from "../../src/domain/gesture/features";
import {
  chooseGoalkeeperZone,
  goalkeeperDiveProgress,
  goalkeeperPositionDuringShot,
  goalkeeperReturnPosition,
  goalkeeperZonePosition,
} from "../../src/domain/goalkeeper/zones";
import {
  advanceBallFlight,
  createBaselineBallFlight,
  groundRestitutionForBounceIntent,
  releaseSpeedForPower,
  type BallFlightState,
} from "../../src/domain/shot/ballFlight";
import {
  calculateGoalTargetBounds,
  mapAimToGoalTarget,
} from "../../src/domain/shot/target";
import {
  evaluateStandardTrajectory,
  standardShotDuration,
} from "../../src/domain/shot/trajectory";
import type { Vec3 } from "../../src/domain/math";

function vectorIsFinite(vector: Vec3): boolean {
  return [vector.x, vector.y, vector.z].every(Number.isFinite);
}

describe("regulation target mapping", () => {
  it("matches the regulation-ball golden clearance and 15 percent overshoot", () => {
    const bounds = calculateGoalTargetBounds(STANDARD_GOAL_CONFIG);

    expect(bounds.validHorizontalHalfRange).toBeCloseTo(1.386, 12);
    expect(bounds.validVerticalHalfRange).toBeCloseTo(0.886, 12);
    expect(bounds.horizontalTargetRange).toBeCloseTo(1.611, 12);
    expect(bounds.verticalTargetLow).toBeCloseTo(-1.036, 12);
    expect(bounds.verticalTargetHigh).toBeCloseTo(1.036, 12);
    const lowLeftSwipe = mapAimToGoalTarget(-1, -1, STANDARD_GOAL_CONFIG);
    const highRightSwipe = mapAimToGoalTarget(1, 1, STANDARD_GOAL_CONFIG);
    expect(lowLeftSwipe.x).toBeCloseTo(1.611, 12);
    expect(lowLeftSwipe.y).toBeCloseTo(-0.036, 12);
    expect(lowLeftSwipe.z).toBe(7);
    expect(highRightSwipe.x).toBeCloseTo(-1.611, 12);
    expect(highRightSwipe.y).toBeCloseTo(2.036, 12);
    expect(highRightSwipe.z).toBe(7);
  });

  it("mirrors world X so screen-right swipes aim screen-right from the locked camera", () => {
    const rightSwipe = mapAimToGoalTarget(0.5, 0, STANDARD_GOAL_CONFIG);
    const leftSwipe = mapAimToGoalTarget(-0.5, 0, STANDARD_GOAL_CONFIG);

    expect(rightSwipe.x).toBeLessThan(STANDARD_GOAL_CONFIG.center.x);
    expect(leftSwipe.x).toBeGreaterThan(STANDARD_GOAL_CONFIG.center.x);
    expect(rightSwipe.y).toBe(leftSwipe.y);
  });
});

describe("standard deterministic trajectory", () => {
  it("maps stronger power to the 0.35 second minimum", () => {
    expect(standardShotDuration(0, STANDARD_TRAJECTORY_CONFIG)).toBe(0.8);
    expect(standardShotDuration(1, STANDARD_TRAJECTORY_CONFIG)).toBeCloseTo(0.35);
  });

  it("matches the Unity arc at the adapted seven-metre midpoint", () => {
    const midpoint = evaluateStandardTrajectory(
      STANDARD_RELEASE_POSITION,
      { x: 0, y: 1, z: 7 },
      0.175,
      1,
      STANDARD_TRAJECTORY_CONFIG,
    );

    expect(midpoint).toEqual({ x: 0, y: 2.1, z: 3.5 });
    expect(
      evaluateStandardTrajectory(
        STANDARD_RELEASE_POSITION,
        { x: 1, y: 2, z: 7 },
        99,
        1,
        STANDARD_TRAJECTORY_CONFIG,
      ),
    ).toEqual({ x: 1, y: 2, z: 7 });
  });
});

describe("fixed-step authoritative ball flight", () => {
  const fixedStepSeconds = 1 / 60;
  const distantKeeper = Object.freeze({ x: 100, y: 100, z: 7 });

  it("starts with authoritative position and velocity but no result or contact", () => {
    const target = mapAimToGoalTarget(0, 0, STANDARD_GOAL_CONFIG);
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );

    expect(state.position).toEqual(STANDARD_RELEASE_POSITION);
    expect(state.previousPosition).toEqual(STANDARD_RELEASE_POSITION);
    expect(state.velocity.z).toBeGreaterThan(0);
    expect(state.elapsedSeconds).toBe(0);
    expect(state.contactHistory).toEqual([]);
    expect(state.terminalState).toBeNull();
    expect(state.gravityMetersPerSecondSquared).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.gravityMetersPerSecondSquared,
    );
    expect(state.releasePower).toBe(1);
    expect(state.releaseTopSpin).toBe(0);
    expect(state.topSpinDropAccelerationMetersPerSecondSquared).toBe(0);
    expect(state.releaseSpeedMetersPerSecond).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.maximumReleaseSpeedMetersPerSecond,
    );
    expect(vectorLength(state.initialVelocity)).toBeCloseTo(
      state.releaseSpeedMetersPerSecond,
      12,
    );
    expect(Object.isFrozen(state.initialVelocity)).toBe(true);
  });

  it("maps continuous power monotonically to bounded physical release speed", () => {
    const powers = [-1, 0, 0.35, 0.7, 1, 2];
    const speeds = powers.map((power) =>
      releaseSpeedForPower(power, STANDARD_BALL_FLIGHT_CONFIG),
    );

    expect(speeds).toEqual([8, 8, 13.6, 19.2, 24, 24]);
    expect(speeds[2]).toBeGreaterThan(speeds[1] ?? Number.POSITIVE_INFINITY);
    expect(speeds[3]).toBeGreaterThan(speeds[2] ?? Number.POSITIVE_INFINITY);
    expect(speeds[4]).toBeGreaterThan(speeds[3] ?? Number.POSITIVE_INFINITY);
  });

  it("maps bounded continuous loft monotonically to physical upward velocity", () => {
    const target = mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG);
    const low = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.65,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      -1,
    );
    const high = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.65,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      2,
    );

    expect(low.releaseLoft).toBe(0);
    expect(high.releaseLoft).toBe(1);
    expect(low.launchLiftMeters).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.minimumLaunchLiftMeters,
    );
    expect(high.launchLiftMeters).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.maximumLaunchLiftMeters,
    );
    expect(high.initialVelocity.y).toBeGreaterThan(low.initialVelocity.y);
    expect(vectorLength(low.initialVelocity)).toBeCloseTo(
      low.releaseSpeedMetersPerSecond,
      12,
    );
    expect(vectorLength(high.initialVelocity)).toBeCloseTo(
      high.releaseSpeedMetersPerSecond,
      12,
    );

    for (let step = 0; step < 6; step += 1) {
      for (const state of [low, high]) {
        advanceBallFlight(
          state,
          fixedStepSeconds,
          STANDARD_GOAL_CONFIG,
          STANDARD_GOALKEEPER_CONFIG,
          { previousPosition: distantKeeper, currentPosition: distantKeeper },
        );
      }
    }
    expect(high.position.y).toBeGreaterThan(low.position.y);
  });

  it("replays identical loft with byte-equivalent velocity, contacts, and result", () => {
    expect(JSON.stringify(replayLoftLaunch(0.65))).toBe(
      JSON.stringify(replayLoftLaunch(0.65)),
    );
  });

  it("curves equal releases in opposite lateral directions only after release", () => {
    const target = mapAimToGoalTarget(0, 0, STANDARD_GOAL_CONFIG);
    const create = (sideSpin: number) =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.65,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        0.4,
        sideSpin,
      );
    const left = create(-2);
    const neutral = create(0);
    const right = create(2);

    expect(left.releaseSideSpin).toBe(-1);
    expect(neutral.releaseSideSpin).toBe(0);
    expect(right.releaseSideSpin).toBe(1);
    expect(left.sideSpinAccelerationMetersPerSecondSquared).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.maximumSideSpinAccelerationMetersPerSecondSquared,
    );
    expect(right.sideSpinAccelerationMetersPerSecondSquared).toBe(
      -STANDARD_BALL_FLIGHT_CONFIG.maximumSideSpinAccelerationMetersPerSecondSquared,
    );
    expect(left.position).toEqual(right.position);
    expect(left.initialVelocity).toEqual(right.initialVelocity);
    expect(left.releaseSpeedMetersPerSecond).toBe(
      right.releaseSpeedMetersPerSecond,
    );

    for (let step = 0; step < 6; step += 1) {
      for (const state of [left, neutral, right]) {
        advanceBallFlight(
          state,
          fixedStepSeconds,
          STANDARD_GOAL_CONFIG,
          STANDARD_GOALKEEPER_CONFIG,
          { previousPosition: distantKeeper, currentPosition: distantKeeper },
        );
      }
    }
    expect(left.position.x).toBeGreaterThan(neutral.position.x);
    expect(right.position.x).toBeLessThan(neutral.position.x);
    expect(right.position.x - neutral.position.x).toBeCloseTo(
      neutral.position.x - left.position.x,
      12,
    );
    expect(left.position.y).toBeCloseTo(right.position.y, 12);
    expect(left.position.z).toBeCloseTo(right.position.z, 12);
  });

  it("replays identical side-spin with byte-equivalent steps, contacts, and result", () => {
    const first = replaySideSpinLaunch(0.7);
    const second = replaySideSpinLaunch(0.7);

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(second.releaseSideSpin).toBe(0.7);
    expect(second.steps).toEqual(first.steps);
    expect(second.contactHistory).toEqual(first.contactHistory);
    expect(second.terminalState).toBe(first.terminalState);
  });

  it("applies bounded top-spin drop only after equal releases advance", () => {
    const target = mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG);
    const create = (topSpin: number) =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.65,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        0.4,
        0,
        topSpin,
      );
    const neutral = create(-1);
    const drop = create(2);

    expect(neutral.releaseTopSpin).toBe(0);
    expect(drop.releaseTopSpin).toBe(1);
    expect(drop.topSpinDropAccelerationMetersPerSecondSquared).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.maximumTopSpinDropAccelerationMetersPerSecondSquared,
    );
    expect(drop.position).toEqual(neutral.position);
    expect(drop.initialVelocity).toEqual(neutral.initialVelocity);
    expect(drop.velocity).toEqual(neutral.velocity);

    for (let step = 0; step < 6; step += 1) {
      for (const state of [neutral, drop]) {
        advanceBallFlight(
          state,
          fixedStepSeconds,
          STANDARD_GOAL_CONFIG,
          STANDARD_GOALKEEPER_CONFIG,
          { previousPosition: distantKeeper, currentPosition: distantKeeper },
        );
      }
    }
    const elapsed = drop.elapsedSeconds;
    const expectedAdditionalDrop =
      0.5 *
      drop.topSpinDropAccelerationMetersPerSecondSquared *
      elapsed *
      elapsed;
    expect(neutral.position.y - drop.position.y).toBeCloseTo(
      expectedAdditionalDrop,
      12,
    );
    expect(neutral.velocity.y - drop.velocity.y).toBeCloseTo(
      drop.topSpinDropAccelerationMetersPerSecondSquared * elapsed,
      12,
    );
    expect(drop.position.x).toBeCloseTo(neutral.position.x, 12);
    expect(drop.position.z).toBeCloseTo(neutral.position.z, 12);
  });

  it("replays the same normalized top-spin trace, keeper seed, and fixed steps exactly", () => {
    const first = replayNormalizedTopSpinTrace();
    const second = replayNormalizedTopSpinTrace();

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first.releaseTopSpin).toBeGreaterThan(0);
    expect(first.releaseLoft).toBe(0);
    expect(first.releaseSideSpin).toBe(0);
    expect(first.steps.length).toBeGreaterThan(0);
    expect(first.contactHistory.at(-1)?.outcome).toBe(first.terminalState);
    if (first.terminalState === "SAVED") {
      expect(first.contactHistory.some((contact) => contact.kind === "KEEPER")).toBe(
        true,
      );
    }
  });

  it("replays identical normalized bounce gesture, seed, fixed steps, and rebound", () => {
    const first = replayNormalizedBounceTrace();
    const second = replayNormalizedBounceTrace();

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first.releaseBounceIntent).toBe(1);
    expect(first.groundRestitution).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.maximumGroundRestitution,
    );
    expect(first.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: null },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
    expect(first.contactHistory[0]?.outgoingVelocity?.y).toBeGreaterThan(0);
    expect(first.terminalState).toBe("GOAL");
  });

  it("replays the same normalized trace, config, keeper seed, and fixed steps exactly", () => {
    const first = replayNormalizedSideSpinTrace();
    const second = replayNormalizedSideSpinTrace();

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(first.releaseSideSpin).toBeGreaterThan(0);
    expect(first.steps.length).toBeGreaterThan(0);
    expect(first.contactHistory.at(-1)?.outcome).toBe(first.terminalState);
    if (first.terminalState === "SAVED") {
      expect(first.contactHistory.some((contact) => contact.kind === "KEEPER")).toBe(
        true,
      );
    }
  });

  it("constructs velocity from aim direction and physical speed, not nominal arrival duration", () => {
    const target = mapAimToGoalTarget(0.35, 0.4, STANDARD_GOAL_CONFIG);
    const shortNominal = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.55,
      {
        ...STANDARD_TRAJECTORY_CONFIG,
        minimumDurationSeconds: 0.1,
        maximumDurationSeconds: 0.2,
      },
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const longNominal = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.55,
      {
        ...STANDARD_TRAJECTORY_CONFIG,
        minimumDurationSeconds: 2,
        maximumDurationSeconds: 3,
      },
      STANDARD_BALL_FLIGHT_CONFIG,
    );

    expect(shortNominal.durationSeconds).not.toBe(longNominal.durationSeconds);
    expect(shortNominal.initialVelocity).toEqual(longNominal.initialVelocity);
    expect(shortNominal.velocity).toEqual(longNominal.velocity);
    expect(vectorLength(shortNominal.velocity)).toBeCloseTo(
      shortNominal.releaseSpeedMetersPerSecond,
      12,
    );
    expect(shortNominal.gravityMetersPerSecondSquared).toBe(-9.81);
  });

  it("rejects non-finite power and flight configuration before creating transforms", () => {
    const target = mapAimToGoalTarget(0, 0, STANDARD_GOAL_CONFIG);

    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        Number.NaN,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
      ),
    ).toThrow(/power must be finite/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        Number.NaN,
      ),
    ).toThrow(/loft must be finite/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        0.5,
        Number.NEGATIVE_INFINITY,
      ),
    ).toThrow(/side-spin must be finite/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        0.5,
        0,
        Number.NaN,
      ),
    ).toThrow(/top-spin must be finite/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        0.5,
        0,
        0,
        Number.NaN,
      ),
    ).toThrow(/bounce intent must be finite/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        {
          ...STANDARD_BALL_FLIGHT_CONFIG,
          gravityMetersPerSecondSquared: Number.POSITIVE_INFINITY,
        },
      ),
    ).toThrow(/configuration must contain only finite values/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        {
          ...STANDARD_BALL_FLIGHT_CONFIG,
          maximumSideSpinAccelerationMetersPerSecondSquared: 0,
        },
      ),
    ).toThrow(/side-spin acceleration bound must be positive/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        STANDARD_TRAJECTORY_CONFIG,
        {
          ...STANDARD_BALL_FLIGHT_CONFIG,
          maximumTopSpinDropAccelerationMetersPerSecondSquared: 0,
        },
      ),
    ).toThrow(/top-spin drop acceleration bound must be positive/);
    expect(() =>
      createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        target,
        0.5,
        {
          ...STANDARD_TRAJECTORY_CONFIG,
          maximumDurationSeconds: Number.NaN,
        },
        STANDARD_BALL_FLIGHT_CONFIG,
      ),
    ).toThrow(/trajectory configuration must be finite/);

    const corrupted = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.5,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    corrupted.velocity.x = Number.NaN;
    expect(() =>
      advanceBallFlight(
        corrupted,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      ),
    ).toThrow(/Ball velocity must contain only finite values/);

    const corruptedSideSpin = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.5,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    Object.defineProperty(corruptedSideSpin, "releaseSideSpin", { value: 2 });
    expect(() =>
      advanceBallFlight(
        corruptedSideSpin,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      ),
    ).toThrow(/within \[-1, 1\]/);

    const corruptedTopSpin = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.5,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    Object.defineProperty(corruptedTopSpin, "releaseTopSpin", { value: 2 });
    expect(() =>
      advanceBallFlight(
        corruptedTopSpin,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      ),
    ).toThrow(/within \[0, 1\]/);

    const corruptedBounce = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      0.5,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    Object.defineProperty(corruptedBounce, "groundRestitution", {
      value: Number.NaN,
    });
    expect(() =>
      advanceBallFlight(
        corruptedBounce,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      ),
    ).toThrow(/state must remain finite/);
  });

  it.each([0, 0.5, 1])(
    "replays power %s with byte-equivalent steps, contacts, and result",
    (power) => {
      expect(JSON.stringify(replayPowerLaunch(power))).toBe(
        JSON.stringify(replayPowerLaunch(power)),
      );
    },
  );

  it("replays identical per-step states, contact history, and terminal result", () => {
    const first = replayCanonicalLaunch();
    const second = replayCanonicalLaunch();

    expect(second.steps).toEqual(first.steps);
    expect(second.contactHistory).toEqual(first.contactHistory);
    expect(second.terminalState).toBe(first.terminalState);
    expect(first.terminalState).toBe("GOAL");
  });

  it("maps continuous bounce intent monotonically to bounded restitution", () => {
    const restitutions = [-1, 0, 0.25, 0.75, 1, 2].map((intent) =>
      groundRestitutionForBounceIntent(intent, STANDARD_BALL_FLIGHT_CONFIG),
    );

    expect(restitutions).toEqual([0, 0, 0.18, 0.54, 0.72, 0.72]);
    expect(() =>
      groundRestitutionForBounceIntent(
        Number.NaN,
        STANDARD_BALL_FLIGHT_CONFIG,
      ),
    ).toThrow(/must be finite/);
    expect(() =>
      groundRestitutionForBounceIntent(1, {
        ...STANDARD_BALL_FLIGHT_CONFIG,
        maximumGroundRestitution: Number.POSITIVE_INFINITY,
      }),
    ).toThrow(/only finite values/);
  });

  it("uses stronger bounce intent for greater outgoing vertical response", () => {
    const reboundFor = (bounceIntent: number) => {
      const state = createBaselineBallFlight(
        STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
        1,
        STANDARD_TRAJECTORY_CONFIG,
        STANDARD_BALL_FLIGHT_CONFIG,
        0,
        0,
        0,
        bounceIntent,
      );
      advanceBallFlight(
        state,
        0.5,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      );
      const contact = state.contactHistory.find(
        (candidate) => candidate.kind === "GROUND",
      );
      if (contact?.outgoingVelocity === undefined) {
        throw new Error("Expected an energetic ground rebound.");
      }
      return contact.outgoingVelocity.y;
    };

    expect(reboundFor(1)).toBeGreaterThan(reboundFor(0.5));
  });

  it("rebounds a canonical low launch before a physical goal-plane result", () => {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      0,
      1,
    );

    expect(state.releaseBounceIntent).toBe(1);
    expect(state.groundRestitution).toBe(
      STANDARD_BALL_FLIGHT_CONFIG.maximumGroundRestitution,
    );
    expect(state.contactHistory).toEqual([]);
    expect(state.terminalState).toBeNull();

    for (let step = 0; step < 120 && state.terminalState === null; step += 1) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      );
    }

    expect(state.terminalState).toBe("GOAL");
    expect(state.groundBounceCount).toBe(1);
    expect(state.contactHistory).toMatchObject([
      {
        kind: "GROUND",
        outcome: null,
        normal: { x: 0, y: 1, z: 0 },
      },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
    const rebound = state.contactHistory[0];
    expect(rebound?.position.y).toBe(STANDARD_GOAL_CONFIG.ballRadiusMeters);
    expect(rebound?.position.z).toBeLessThan(STANDARD_GOAL_CONFIG.center.z);
    expect(rebound?.incomingVelocity?.y).toBeLessThan(0);
    expect(rebound?.outgoingVelocity?.y).toBeGreaterThan(
      STANDARD_BALL_FLIGHT_CONFIG.minimumGroundReboundSpeedMetersPerSecond,
    );
    expect(rebound?.outgoingVelocity?.y).toBeCloseTo(
      -(rebound?.incomingVelocity?.y ?? 0) * state.groundRestitution,
      12,
    );
    expect(
      state.contactHistory[1]?.elapsedSeconds ?? Number.NEGATIVE_INFINITY,
    ).toBeGreaterThan(rebound?.elapsedSeconds ?? Number.POSITIVE_INFINITY);
  });

  it("consumes the same fixed-step remainder after swept ground impact", () => {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      0,
      1,
    );

    const outcome = advanceBallFlight(
      state,
      0.5,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: distantKeeper, currentPosition: distantKeeper },
    );

    expect(outcome).toBe("GOAL");
    expect(state.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: null },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
    expect(state.contactHistory[0]?.elapsedSeconds).toBeLessThan(
      state.contactHistory[1]?.elapsedSeconds ?? Number.NEGATIVE_INFINITY,
    );
    for (const contact of state.contactHistory) {
      expect(vectorIsFinite(contact.position)).toBe(true);
      if (contact.incomingVelocity !== undefined) {
        expect(vectorIsFinite(contact.incomingVelocity)).toBe(true);
      }
      if (contact.outgoingVelocity !== undefined) {
        expect(vectorIsFinite(contact.outgoingVelocity)).toBe(true);
      }
    }
  });

  it("settles weak and exhausted rebounds without sticking or looping", () => {
    const weak = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      0,
      0.05,
    );
    advanceBallFlight(
      weak,
      0.5,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: distantKeeper, currentPosition: distantKeeper },
    );
    expect(weak.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: "MISS" },
    ]);
    expect(weak.groundBounceCount).toBe(0);

    const exhausted = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0, 0, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      0,
      1,
    );
    exhausted.position.y = STANDARD_GOAL_CONFIG.ballRadiusMeters + 0.1;
    exhausted.velocity.y = -2;
    exhausted.velocity.z = 1;
    for (
      let step = 0;
      step < 120 && exhausted.terminalState === null;
      step += 1
    ) {
      advanceBallFlight(
        exhausted,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      );
    }
    expect(exhausted.terminalState).toBe("MISS");
    expect(exhausted.groundBounceCount).toBe(1);
    expect(exhausted.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: null },
      { kind: "GROUND", outcome: "MISS" },
    ]);
    expect(exhausted.contactHistory).toHaveLength(2);
  });

  it.each([0, 0.5, 1])(
    "resolves a canonical low launch at power %s on the ground before the goal plane",
    (power) => {
      const state = simulateToTerminal(
        mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
        distantKeeper,
        power,
      );

      expect(state.terminalState).toBe("MISS");
      expect(state.contactHistory).toHaveLength(1);
      expect(state.contactHistory[0]).toMatchObject({
        kind: "GROUND",
        outcome: "MISS",
      });
      expect(Object.isFrozen(state.contactHistory[0])).toBe(true);
      expect(Object.isFrozen(state.contactHistory[0]?.position)).toBe(true);
      expect(state.position.y).toBeCloseTo(
        STANDARD_GOAL_CONFIG.ballRadiusMeters,
        12,
      );
      expect(state.position.z).toBeLessThan(STANDARD_GOAL_CONFIG.center.z);
    },
  );

  it("uses a swept ground contact to prevent coarse-step floor tunnelling", () => {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const releaseVelocityY = state.velocity.y;

    const outcome = advanceBallFlight(
      state,
      state.durationSeconds + 0.5,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      {
        previousPosition: distantKeeper,
        currentPosition: distantKeeper,
      },
    );

    expect(outcome).toBe("MISS");
    expect(state.position.y).toBe(STANDARD_GOAL_CONFIG.ballRadiusMeters);
    expect(state.position.z).toBeLessThan(STANDARD_GOAL_CONFIG.center.z);
    expect(state.velocity.y).toBeCloseTo(
      releaseVelocityY +
        state.gravityMetersPerSecondSquared * state.elapsedSeconds,
      12,
    );
    expect(state.contactHistory).toEqual([
      expect.objectContaining({ kind: "GROUND", outcome: "MISS" }),
    ]);
  });

  it("uses the top-spin-adjusted acceleration for swept ground contact", () => {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      1,
    );
    const releaseVelocityY = state.velocity.y;
    const effectiveVerticalAcceleration =
      state.gravityMetersPerSecondSquared -
      state.topSpinDropAccelerationMetersPerSecondSquared;

    const outcome = advanceBallFlight(
      state,
      state.durationSeconds + 0.5,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: distantKeeper, currentPosition: distantKeeper },
    );

    expect(outcome).toBe("MISS");
    expect(state.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: "MISS" },
    ]);
    expect(state.position.y).toBe(STANDARD_GOAL_CONFIG.ballRadiusMeters);
    expect(state.velocity.y).toBeCloseTo(
      releaseVelocityY + effectiveVerticalAcceleration * state.elapsedSeconds,
      12,
    );
  });

  it("replays identical low shots through the same ground contact state", () => {
    const first = replayLowLaunch();
    const second = replayLowLaunch();

    expect(second.steps).toEqual(first.steps);
    expect(second.contactHistory).toEqual(first.contactHistory);
    expect(second.contactHistory[0]?.elapsedSeconds).toBe(
      first.contactHistory[0]?.elapsedSeconds,
    );
    expect(second.contactHistory[0]?.position).toEqual(
      first.contactHistory[0]?.position,
    );
    expect(second.terminalState).toBe(first.terminalState);
    expect(first.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: "MISS" },
    ]);
  });

  it("uses GROUND before GOAL_PLANE at the same fixed-step boundary", () => {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      {
        x: STANDARD_GOAL_CONFIG.center.x,
        y: STANDARD_GOAL_CONFIG.ballRadiusMeters,
        z: STANDARD_GOAL_CONFIG.center.z,
      },
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const planeSeconds =
      (STANDARD_GOAL_CONFIG.center.z - state.position.z) / state.velocity.z;
    state.velocity.y =
      (STANDARD_GOAL_CONFIG.ballRadiusMeters -
        1e-9 -
        state.position.y -
        0.5 *
          state.gravityMetersPerSecondSquared *
          planeSeconds *
          planeSeconds) /
      planeSeconds;

    advanceBallFlight(
      state,
      planeSeconds,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      {
        previousPosition: distantKeeper,
        currentPosition: distantKeeper,
      },
    );

    expect(state.contactHistory).toMatchObject([
      { kind: "GROUND", outcome: "MISS" },
    ]);
  });

  it("resolves symmetric left and right post-in shots through a later goal-plane contact", () => {
    for (const horizontalAim of [-0.9, 0.9]) {
      const state = simulateToTerminal(
        mapAimToGoalTarget(horizontalAim, 0, STANDARD_GOAL_CONFIG),
        distantKeeper,
      );

      expect(state.terminalState).toBe("GOAL");
      expect(state.contactHistory).toMatchObject([
        {
          kind: "VERTICAL_POST",
          post: horizontalAim < 0 ? "RIGHT" : "LEFT",
          outcome: null,
        },
        { kind: "GOAL_PLANE", outcome: "GOAL" },
      ]);
    }
  });

  it("resolves symmetric left and right post-out shots through a later ground contact", () => {
    for (const horizontalAim of [-1, 1]) {
      const state = simulateToTerminal(
        mapAimToGoalTarget(horizontalAim, 0, STANDARD_GOAL_CONFIG),
        distantKeeper,
      );

      expect(state.terminalState).toBe("MISS");
      expect(state.contactHistory).toMatchObject([
        {
          kind: "VERTICAL_POST",
          post: horizontalAim < 0 ? "RIGHT" : "LEFT",
          outcome: null,
        },
        { kind: "GROUND", outcome: "MISS" },
      ]);
    }
  });

  it("sweeps through coarse steps without tunnelling and bounds the rebound", () => {
    const target = mapAimToGoalTarget(0.9, 0, STANDARD_GOAL_CONFIG);
    const normalStep = simulateToTerminal(target, distantKeeper);
    const coarseStep = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    advanceBallFlight(
      coarseStep,
      coarseStep.durationSeconds + fixedStepSeconds,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: distantKeeper, currentPosition: distantKeeper },
    );

    expect(coarseStep.contactHistory[0]?.kind).toBe("VERTICAL_POST");
    expect(coarseStep.contactHistory[0]?.post).toBe(
      normalStep.contactHistory[0]?.post,
    );
    const contact = coarseStep.contactHistory[0];
    expect(contact?.outcome).toBeNull();
    expect(Object.isFrozen(contact)).toBe(true);
    expect(Object.isFrozen(contact?.normal)).toBe(true);
    expect(Object.isFrozen(contact?.incomingVelocity)).toBe(true);
    expect(Object.isFrozen(contact?.outgoingVelocity)).toBe(true);
    expect(vectorLength(contact?.normal)).toBeCloseTo(1, 12);
    expect(vectorLength(contact?.outgoingVelocity)).toBeLessThanOrEqual(
      vectorLength(contact?.incomingVelocity) + 1e-12,
    );
    expect(contact?.incomingVelocity).not.toEqual(contact?.outgoingVelocity);
    expect(coarseStep.contactHistory.at(-1)?.kind).toBe("GOAL_PLANE");
  });

  it("orders solid contacts before a later terminal boundary", () => {
    const target = mapAimToGoalTarget(0.9, 0, STANDARD_GOAL_CONFIG);
    const launch = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const keeperZ = STANDARD_GOAL_CONFIG.center.z * 0.5;
    const keeperSeconds = (keeperZ - launch.position.z) / launch.velocity.z;
    const keeperFirst = simulateToTerminal(target, {
      x: target.x * 0.5,
      y:
        launch.position.y +
        launch.velocity.y * keeperSeconds +
        0.5 *
          launch.gravityMetersPerSecondSquared *
          keeperSeconds *
          keeperSeconds,
      z: keeperZ,
    });
    const postFirst = simulateToTerminal(target, distantKeeper);

    expect(keeperFirst.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null },
      { kind: "GROUND", outcome: "SAVED" },
    ]);
    expect(keeperFirst.contactHistory[0]?.elapsedSeconds).toBeLessThan(
      keeperFirst.contactHistory[1]?.elapsedSeconds ?? Number.NEGATIVE_INFINITY,
    );
    expect(postFirst.contactHistory).toMatchObject([
      { kind: "VERTICAL_POST", outcome: null },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
    expect(postFirst.contactHistory[0]?.elapsedSeconds).toBeLessThan(
      postFirst.contactHistory[1]?.elapsedSeconds ?? Number.NEGATIVE_INFINITY,
    );
  });

  it("replays identical post rebound states and terminal history", () => {
    const first = replayPostLaunch();
    const second = replayPostLaunch();

    expect(second).toEqual(first);
    expect(first.contactHistory).toMatchObject([
      {
        kind: "VERTICAL_POST",
        post: "LEFT",
        outcome: null,
      },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
  });

  it("rebounds a canonical high shot from the crossbar before a terminal contact", () => {
    const state = simulateToTerminal(
      mapAimToGoalTarget(0, 1, STANDARD_GOAL_CONFIG),
      distantKeeper,
    );

    expect(state.contactHistory).toMatchObject([
      { kind: "CROSSBAR", outcome: null },
      { kind: "GROUND", outcome: "MISS" },
    ]);
    expect(state.terminalState).toBe("MISS");
    expect(state.contactHistory.filter((contact) => contact.outcome !== null)).toHaveLength(
      1,
    );
  });

  it("sweeps the crossbar in one coarse step and records a bounded frozen rebound", () => {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0, 1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );

    advanceBallFlight(
      state,
      state.durationSeconds + 0.5,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: distantKeeper, currentPosition: distantKeeper },
    );

    const contact = state.contactHistory[0];
    expect(contact).toMatchObject({ kind: "CROSSBAR", outcome: null });
    expect(Object.isFrozen(contact)).toBe(true);
    expect(Object.isFrozen(contact?.position)).toBe(true);
    expect(Object.isFrozen(contact?.normal)).toBe(true);
    expect(Object.isFrozen(contact?.incomingVelocity)).toBe(true);
    expect(Object.isFrozen(contact?.outgoingVelocity)).toBe(true);
    expect(vectorLength(contact?.normal)).toBeCloseTo(1, 10);
    expect(vectorLength(contact?.outgoingVelocity)).toBeLessThanOrEqual(
      vectorLength(contact?.incomingVelocity) + 1e-10,
    );
    expect(contact?.incomingVelocity).not.toEqual(contact?.outgoingVelocity);
    expect(state.contactHistory.at(-1)).toMatchObject({
      kind: "GROUND",
      outcome: "MISS",
    });
  });

  it("orders the solid crossbar contact before the goal plane", () => {
    const state = simulateToTerminal(
      mapAimToGoalTarget(0, 1, STANDARD_GOAL_CONFIG),
      distantKeeper,
    );

    const crossbar = state.contactHistory[0];
    const terminal = state.contactHistory[1];
    expect(crossbar?.kind).toBe("CROSSBAR");
    expect(crossbar?.position.z).toBeLessThan(STANDARD_GOAL_CONFIG.center.z);
    expect(crossbar?.elapsedSeconds).toBeLessThan(
      terminal?.elapsedSeconds ?? Number.NEGATIVE_INFINITY,
    );
    expect(terminal?.kind).not.toBe("GOAL_PLANE");
  });

  it("replays identical crossbar rebound states and terminal history", () => {
    const first = replayCrossbarLaunch();
    const second = replayCrossbarLaunch();

    expect(second).toEqual(first);
    expect(first.contactHistory).toMatchObject([
      { kind: "CROSSBAR", outcome: null },
      { kind: "GROUND", outcome: "MISS" },
    ]);
  });

  it("keeps the straight seeded high gesture on the crossbar path", () => {
    const keeperRng = new SeededRng(2).fork("keeper");
    const zone = chooseGoalkeeperZone(keeperRng);
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0, 1, STANDARD_GOAL_CONFIG),
      0.96,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    for (let step = 0; step < 120 && state.terminalState === null; step += 1) {
      const previousKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds,
      );
      const currentKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds + fixedStepSeconds,
      );
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: previousKeeper, currentPosition: currentKeeper },
      );
    }

    expect(state.contactHistory).toMatchObject([
      { kind: "CROSSBAR", outcome: null },
      { kind: "GROUND", outcome: "MISS" },
    ]);
    expect(state.releasePower).toBe(0.96);
    expect(state.releaseTopSpin).toBe(0);
  });

  it("sweeps keeper contact without tunnelling and records a bounded non-terminal rebound", () => {
    const clampedKeeperConfig = Object.freeze({
      ...STANDARD_GOALKEEPER_CONFIG,
      contactRestitution: 10,
    });
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      STANDARD_GOAL_CONFIG.center,
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const outcome = advanceBallFlight(
      state,
      state.durationSeconds,
      STANDARD_GOAL_CONFIG,
      clampedKeeperConfig,
      {
        previousPosition: STANDARD_GOAL_CONFIG.center,
        currentPosition: STANDARD_GOAL_CONFIG.center,
      },
    );
    expect(outcome).toBeNull();
    expect(state.terminalState).toBeNull();
    expect(state.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null },
    ]);
    const keeperContact = state.contactHistory[0];
    expect(Object.isFrozen(keeperContact)).toBe(true);
    expect(Object.isFrozen(keeperContact?.normal)).toBe(true);
    expect(Object.isFrozen(keeperContact?.incomingVelocity)).toBe(true);
    expect(Object.isFrozen(keeperContact?.outgoingVelocity)).toBe(true);
    expect(vectorLength(keeperContact?.normal)).toBeCloseTo(1, 12);
    expect(vectorLength(keeperContact?.outgoingVelocity)).toBeLessThanOrEqual(
      vectorLength(keeperContact?.incomingVelocity) + 1e-10,
    );
    expect(keeperContact?.incomingVelocity).not.toEqual(
      keeperContact?.outgoingVelocity,
    );
    for (let step = 0; step < 120 && state.terminalState === null; step += 1) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        clampedKeeperConfig,
        {
          previousPosition: STANDARD_GOAL_CONFIG.center,
          currentPosition: STANDARD_GOAL_CONFIG.center,
        },
      );
    }
    expect(state.terminalState).toBe("SAVED");
    expect(state.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null },
      { kind: "PLAY_VOLUME", outcome: "SAVED" },
    ]);
    expect(
      state.contactHistory.filter((contact) => contact.outcome !== null),
    ).toHaveLength(1);

    expect(state.position.z).toBeCloseTo(
      STANDARD_BALL_FLIGHT_CONFIG.playableVolume.minimumZMeters +
        STANDARD_GOAL_CONFIG.ballRadiusMeters, 9,
    );

    const goal = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      STANDARD_GOAL_CONFIG.center,
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const goalOutcome = advanceBallFlight(
      goal,
      goal.durationSeconds + fixedStepSeconds,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
      {
        previousPosition: distantKeeper,
        currentPosition: distantKeeper,
      },
    );
    expect(goalOutcome).toBe("GOAL");
    expect(goal.position.z).toBe(STANDARD_GOAL_CONFIG.center.z);
    expect(goal.contactHistory).toMatchObject([
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
  });

  it("sweeps a top-spin ballistic boundary crossing into physical keeper contact", () => {
    const topSpinState = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      STANDARD_GOAL_CONFIG.center,
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      1,
    );
    const contactSeconds = fixedStepSeconds / 2;
    const effectiveVerticalAcceleration =
      topSpinState.gravityMetersPerSecondSquared -
      topSpinState.topSpinDropAccelerationMetersPerSecondSquared;
    const overlapRadius =
      STANDARD_GOAL_CONFIG.ballRadiusMeters + 0.001;
    const boundaryKeeper = Object.freeze({
      x:
        topSpinState.position.x +
        topSpinState.velocity.x * contactSeconds +
        overlapRadius - 0.000001,
      y:
        topSpinState.position.y +
        topSpinState.velocity.y * contactSeconds +
        0.5 * effectiveVerticalAcceleration * contactSeconds * contactSeconds,
      z:
        topSpinState.position.z +
        topSpinState.velocity.z * contactSeconds,
    });
    const outcome = advanceBallFlight(
      topSpinState,
      fixedStepSeconds,
      STANDARD_GOAL_CONFIG,
      { ...STANDARD_GOALKEEPER_CONFIG, saveRadiusMeters: 0.001 },
      { previousPosition: boundaryKeeper, currentPosition: boundaryKeeper },
    );

    expect(outcome).toBeNull();
    expect(topSpinState.releaseTopSpin).toBe(1);
    expect(topSpinState.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null },
    ]);
    expect(topSpinState.contactHistory[0]?.elapsedSeconds).toBeGreaterThan(0);
    expect(topSpinState.contactHistory[0]?.elapsedSeconds).toBeLessThan(
      contactSeconds,
    );
  });

  it("keeps an in-frame goal-plane crossing as GOAL after a glancing keeper deflection", () => {
    const state = simulateToTerminal(STANDARD_GOAL_CONFIG.center, {
      x: 0.6,
      y: 1,
      z: STANDARD_GOAL_CONFIG.center.z,
    });

    expect(state.terminalState).toBe("GOAL");
    expect(state.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null },
      { kind: "GOAL_PLANE", outcome: "GOAL" },
    ]);
    expect(state.contactHistory.filter((contact) => contact.outcome !== null)).toHaveLength(
      1,
    );
  });

  it("replays byte-equivalent moving-keeper contact vectors, subsequent states, and result", () => {
    const first = replayKeeperDeflection();
    const second = replayKeeperDeflection();

    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
    expect(second).toEqual(first);
    expect(first.contactHistory).toMatchObject([
      {
        kind: "KEEPER",
        outcome: null,
        normal: expect.any(Object),
        incomingVelocity: expect.any(Object),
        outgoingVelocity: expect.any(Object),
      },
      { outcome: "SAVED" },
    ]);
    expect(first.contactHistory[0]?.incomingVelocity).not.toEqual(
      first.contactHistory[0]?.outgoingVelocity,
    );
    expect(first.contactHistory).toHaveLength(2);
    expect(
      relativeVectorLength(
        first.contactHistory[0]?.outgoingVelocity,
        first.keeperVelocityAtContact,
      ),
    ).toBeLessThanOrEqual(
      relativeVectorLength(
        first.contactHistory[0]?.incomingVelocity,
        first.keeperVelocityAtContact,
      ) + 1e-10,
    );
    expect(first.terminalState).toBe("SAVED");
  });

  it("classifies ball-radius-clear in-frame contact as GOAL and outside-frame contact as MISS", () => {
    const inFrame = simulateToTerminal(
      mapAimToGoalTarget(0.7, 0, STANDARD_GOAL_CONFIG),
      distantKeeper,
    );
    const outsideFrame = simulateToTerminal(
      mapAimToGoalTarget(1, 0, STANDARD_GOAL_CONFIG),
      distantKeeper,
    );

    expect(inFrame.terminalState).toBe("GOAL");
    expect(inFrame.contactHistory[0]?.kind).toBe("GOAL_PLANE");
    expect(outsideFrame.terminalState).toBe("MISS");
    expect(outsideFrame.contactHistory).toMatchObject([
      { kind: "VERTICAL_POST", outcome: null },
      { kind: "GROUND", outcome: "MISS" },
    ]);
  });

  it("is invariant to render-frame chunking around the same fixed steps", () => {
    const smallFrames = runThroughClock(Array.from({ length: 48 }, () => 1 / 120));
    const chunkedFrames = runThroughClock([0.1, 0.1, 0.2]);

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames.terminalState).toBe("GOAL");
  });

  it("keeps side-spin replay invariant when fixed steps are grouped into render frames", () => {
    const target = mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG);
    const smallFrames = runThroughClock(
      Array.from({ length: 120 }, () => 1 / 120),
      target,
      0.65,
      0.7,
    );
    const chunkedFrames = runThroughClock(
      [0.2, 0.3, 0.5],
      target,
      0.65,
      0.7,
    );

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames.terminalState).not.toBeNull();
  });

  it("keeps top-spin replay invariant when fixed steps are grouped into render frames", () => {
    const target = mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG);
    const smallFrames = runThroughClock(
      Array.from({ length: 120 }, () => 1 / 120),
      target,
      0.65,
      0,
      0.75,
    );
    const chunkedFrames = runThroughClock(
      [0.2, 0.3, 0.5],
      target,
      0.65,
      0,
      0.75,
    );

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames.terminalState).not.toBeNull();
  });

  it.each([0, 0.5, 1])(
    "keeps power %s invariant when fixed steps are grouped into different render frames",
    (power) => {
      const smallFrames = runThroughClock(
        Array.from({ length: 120 }, () => 1 / 120),
        mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
        power,
      );
      const chunkedFrames = runThroughClock(
        [0.2, 0.3, 0.5],
        mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
        power,
      );

      expect(chunkedFrames).toEqual(smallFrames);
      expect(chunkedFrames.terminalState).not.toBeNull();
    },
  );

  it("keeps ground contact invariant across render-frame chunking", () => {
    const lowTarget = mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG);
    const smallFrames = runThroughClock(
      Array.from({ length: 48 }, () => 1 / 120),
      lowTarget,
    );
    const chunkedFrames = runThroughClock([0.1, 0.1, 0.2], lowTarget);

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames).toMatchObject({
      terminalState: "MISS",
      contactHistory: [{ kind: "GROUND", outcome: "MISS" }],
    });
  });

  it("keeps the intentional rebound invariant across render-frame chunking", () => {
    const lowTarget = mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG);
    const smallFrames = runThroughClock(
      Array.from({ length: 60 }, () => 1 / 120),
      lowTarget,
      1,
      0,
      0,
      1,
    );
    const chunkedFrames = runThroughClock(
      [0.1, 0.1, 0.3],
      lowTarget,
      1,
      0,
      0,
      1,
    );

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames).toMatchObject({
      terminalState: "GOAL",
      contactHistory: [
        { kind: "GROUND", outcome: null },
        { kind: "GOAL_PLANE", outcome: "GOAL" },
      ],
    });
  });

  it("keeps post-in rebound history invariant across render-frame chunking", () => {
    const postTarget = mapAimToGoalTarget(0.9, 0, STANDARD_GOAL_CONFIG);
    const smallFrames = runThroughClock(
      Array.from({ length: 60 }, () => 1 / 120),
      postTarget,
    );
    const chunkedFrames = runThroughClock([0.1, 0.1, 0.3], postTarget);

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames).toMatchObject({
      terminalState: "GOAL",
      contactHistory: [
        { kind: "VERTICAL_POST", outcome: null },
        { kind: "GOAL_PLANE", outcome: "GOAL" },
      ],
    });
  });

  it("keeps crossbar rebound history invariant across render-frame chunking", () => {
    const crossbarTarget = mapAimToGoalTarget(0, 1, STANDARD_GOAL_CONFIG);
    const smallFrames = runThroughClock(
      Array.from({ length: 120 }, () => 1 / 120),
      crossbarTarget,
    );
    const chunkedFrames = runThroughClock([0.2, 0.3, 0.5], crossbarTarget);

    expect(chunkedFrames).toEqual(smallFrames);
    expect(chunkedFrames).toMatchObject({
      terminalState: "MISS",
      contactHistory: [
        { kind: "CROSSBAR", outcome: null },
        { kind: "GROUND", outcome: "MISS" },
      ],
    });
  });

  it("retains the seeded five-shot result loop through physical contacts", () => {
    const keeperRng = new SeededRng(1).fork("keeper");
    const releases = [
      { horizontalAim: -0.7, power: 0.85 },
      { horizontalAim: 0, power: 0.6 },
      { horizontalAim: 1, power: 0.9 },
      { horizontalAim: -0.7, power: 0.85 },
      { horizontalAim: 1, power: 0.9 },
    ] as const;
    const flights = releases.map(({ horizontalAim, power }) =>
      simulateSeededFlight(horizontalAim, keeperRng, 0, 0, power),
    );

    expect(flights.map((flight) => flight.state.terminalState)).toEqual([
      "GOAL",
      "SAVED",
      "MISS",
      "GOAL",
      "MISS",
    ]);
    expect(flights.every((flight) => flight.state.releaseTopSpin === 0)).toBe(true);
    expect(flights[3]).toMatchObject({
      zone: "low-left",
      state: {
        releaseSideSpin: 0,
        releaseTopSpin: 0,
        contactHistory: [{ kind: "GOAL_PLANE", outcome: "GOAL" }],
        terminalState: "GOAL",
      },
    });
  });

  it("records why the former saturated-top-spin fourth-shot fixture is saved", () => {
    const keeperRng = new SeededRng(1).fork("keeper");
    const flights = [-0.7, 0, 1, 0.7].map((horizontalAim) =>
      simulateSeededFlight(horizontalAim, keeperRng, 0, 1),
    );

    expect(flights[3]).toMatchObject({
      zone: "low-left",
      state: {
        releaseSideSpin: 0,
        releaseTopSpin: 1,
        contactHistory: [
          { kind: "KEEPER", outcome: null },
          { kind: "GROUND", outcome: "SAVED" },
        ],
        terminalState: "SAVED",
      },
    });
  });

  it("keeps the canonical fresh-seed gestures on GOAL, SAVED, and MISS branches", () => {
    const outcomes = [-0.7, 0, 1].map((horizontalAim) =>
      simulateSeededShot(horizontalAim, new SeededRng(1).fork("keeper")),
    );

    expect(outcomes).toEqual(["GOAL", "SAVED", "MISS"]);
  });

  it("physically saves the canonical high-center capture gesture", () => {
    const keeperRng = new SeededRng(3).fork("keeper");

    expect(simulateSeededShot(0, keeperRng, 0.72)).toBe("SAVED");
  });

  function replayCanonicalLaunch() {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const steps: object[] = [];
    while (state.terminalState === null) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        {
          previousPosition: distantKeeper,
          currentPosition: distantKeeper,
        },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayPowerLaunch(power: number) {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
      power,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const steps: object[] = [];
    for (let step = 0; step < 180 && state.terminalState === null; step += 1) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      releasePower: state.releasePower,
      releaseSpeedMetersPerSecond: state.releaseSpeedMetersPerSecond,
      initialVelocity: state.initialVelocity,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayLoftLaunch(loft: number) {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
      0.65,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      loft,
    );
    const steps: object[] = [];
    for (let step = 0; step < 180 && state.terminalState === null; step += 1) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      releaseLoft: state.releaseLoft,
      launchLiftMeters: state.launchLiftMeters,
      releaseSpeedMetersPerSecond: state.releaseSpeedMetersPerSecond,
      initialVelocity: state.initialVelocity,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replaySideSpinLaunch(sideSpin: number) {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
      0.65,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0.4,
      sideSpin,
    );
    const steps: object[] = [];
    for (let step = 0; step < 180 && state.terminalState === null; step += 1) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: distantKeeper, currentPosition: distantKeeper },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      releaseSideSpin: state.releaseSideSpin,
      sideSpinAccelerationMetersPerSecondSquared:
        state.sideSpinAccelerationMetersPerSecondSquared,
      releaseSpeedMetersPerSecond: state.releaseSpeedMetersPerSecond,
      initialVelocity: state.initialVelocity,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayNormalizedSideSpinTrace() {
    const point = (x: number, y: number, timeSeconds: number) => ({
      positionPixels: { x: x * 1_000, y: y * 500 },
      safeAreaPosition01: { x, y },
      timeSeconds,
    });
    const gesture = analyzeStandardGesture(
      [
        point(0.5, 0.84, 0),
        point(0.57, 0.76, 0.05),
        point(0.6, 0.68, 0.1),
        point(0.57, 0.6, 0.15),
        point(0.5, 0.52, 0.2),
      ],
      { widthPixels: 1_000, heightPixels: 500 },
      STANDARD_GESTURE_CONFIG,
    );
    const keeperRng = new SeededRng(17).fork("keeper");
    const zone = chooseGoalkeeperZone(keeperRng);
    const state = createBaselineBallFlight(
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
    const steps: object[] = [];
    for (let step = 0; step < 600 && state.terminalState === null; step += 1) {
      const previousKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds,
      );
      const currentKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds + fixedStepSeconds,
      );
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: previousKeeper, currentPosition: currentKeeper },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      zone,
      releaseSideSpin: state.releaseSideSpin,
      sideSpinAccelerationMetersPerSecondSquared:
        state.sideSpinAccelerationMetersPerSecondSquared,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayNormalizedTopSpinTrace() {
    const point = (x: number, y: number, timeSeconds: number) => ({
      positionPixels: { x: x * 1_000, y: y * 500 },
      safeAreaPosition01: { x, y },
      timeSeconds,
    });
    const gesture = analyzeStandardGesture(
      [
        point(0.5, 0.84, 0),
        point(0.5, 0.9, 0.1),
        point(0.5, 0.52, 0.2),
      ],
      { widthPixels: 1_000, heightPixels: 500 },
      STANDARD_GESTURE_CONFIG,
    );
    const keeperRng = new SeededRng(17).fork("keeper");
    const zone = chooseGoalkeeperZone(keeperRng);
    const state = createBaselineBallFlight(
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
      gesture.topSpin,
    );
    const steps: object[] = [];
    for (let step = 0; step < 600 && state.terminalState === null; step += 1) {
      const previousKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds,
      );
      const currentKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds + fixedStepSeconds,
      );
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: previousKeeper, currentPosition: currentKeeper },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      zone,
      releaseLoft: state.releaseLoft,
      releaseSideSpin: state.releaseSideSpin,
      releaseTopSpin: state.releaseTopSpin,
      topSpinDropAccelerationMetersPerSecondSquared:
        state.topSpinDropAccelerationMetersPerSecondSquared,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayNormalizedBounceTrace() {
    const point = (x: number, y: number, timeSeconds: number) => ({
      positionPixels: { x: x * 1_000, y: y * 500 },
      safeAreaPosition01: { x, y },
      timeSeconds,
    });
    const gesture = analyzeStandardGesture(
      [
        point(0.5, 0.62, 0),
        point(0.42, 0.89, 0.1),
        point(0.346, 0.55, 0.2),
      ],
      { widthPixels: 1_000, heightPixels: 500 },
      STANDARD_GESTURE_CONFIG,
    );
    const keeperRng = new SeededRng(1).fork("keeper");
    const zone = chooseGoalkeeperZone(keeperRng);
    const state = createBaselineBallFlight(
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
      gesture.topSpin,
      gesture.bounceIntent,
    );
    const steps: object[] = [];
    for (let step = 0; step < 600 && state.terminalState === null; step += 1) {
      const previousKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds,
      );
      const currentKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds + fixedStepSeconds,
      );
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: previousKeeper, currentPosition: currentKeeper },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      zone,
      releaseBounceIntent: state.releaseBounceIntent,
      groundRestitution: state.groundRestitution,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayLowLaunch() {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, -1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const steps: object[] = [];
    while (state.terminalState === null) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        {
          previousPosition: distantKeeper,
          currentPosition: distantKeeper,
        },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayPostLaunch() {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0.9, 0, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const steps: object[] = [];
    while (state.terminalState === null) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        {
          previousPosition: distantKeeper,
          currentPosition: distantKeeper,
        },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayCrossbarLaunch() {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0, 1, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const steps: object[] = [];
    while (state.terminalState === null) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        {
          previousPosition: distantKeeper,
          currentPosition: distantKeeper,
        },
      );
      steps.push(snapshotFlight(state));
    }
    return {
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function replayKeeperDeflection() {
    const keeperRng = new SeededRng(3).fork("keeper");
    const zone = chooseGoalkeeperZone(keeperRng);
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0, 0.72, STANDARD_GOAL_CONFIG),
      1,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    const steps: object[] = [];
    let keeperVelocityAtContact: Vec3 | null = null;
    for (let step = 0; step < 600 && state.terminalState === null; step += 1) {
      const previousKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds,
      );
      const currentKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds + fixedStepSeconds,
      );
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: previousKeeper, currentPosition: currentKeeper },
      );
      if (keeperVelocityAtContact === null && state.contactHistory.length > 0) {
        keeperVelocityAtContact = Object.freeze({
          x: (currentKeeper.x - previousKeeper.x) / fixedStepSeconds,
          y: (currentKeeper.y - previousKeeper.y) / fixedStepSeconds,
          z: (currentKeeper.z - previousKeeper.z) / fixedStepSeconds,
        });
      }
      steps.push(snapshotFlight(state));
    }
    if (keeperVelocityAtContact === null) {
      throw new Error("Expected the replayed shot to contact the moving keeper.");
    }
    return {
      zone,
      keeperVelocityAtContact,
      steps,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function simulateToTerminal(
    target: Vec3,
    keeper: Vec3,
    power = 1,
  ): BallFlightState {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      power,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
    );
    for (let step = 0; step < 120 && state.terminalState === null; step += 1) {
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: keeper, currentPosition: keeper },
      );
    }
    return state;
  }

  function simulateSeededShot(
    horizontalAim: number,
    keeperRng: SeededRng,
    verticalAim = 0,
  ) {
    return simulateSeededFlight(horizontalAim, keeperRng, verticalAim).state
      .terminalState;
  }

  function simulateSeededFlight(
    horizontalAim: number,
    keeperRng: SeededRng,
    verticalAim = 0,
    topSpin = 0,
    power = 1,
  ) {
    const zone = chooseGoalkeeperZone(keeperRng);
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(horizontalAim, verticalAim, STANDARD_GOAL_CONFIG),
      power,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      0,
      topSpin,
    );
    for (
      let step = 0;
      step < 600 && state.terminalState === null;
      step += 1
    ) {
      const previousKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds,
      );
      const currentKeeper = goalkeeperPositionDuringShot(
        zone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        state.elapsedSeconds + fixedStepSeconds,
      );
      advanceBallFlight(
        state,
        fixedStepSeconds,
        STANDARD_GOAL_CONFIG,
        STANDARD_GOALKEEPER_CONFIG,
        {
          previousPosition: previousKeeper,
          currentPosition: currentKeeper,
        },
      );
    }
    expect(state.contactHistory.at(-1)?.outcome).toBe(state.terminalState);
    if (state.terminalState === "SAVED") {
      expect(
        state.contactHistory.some((contact) => contact.kind === "KEEPER"),
      ).toBe(true);
    }
    return { zone, state } as const;
  }

  function runThroughClock(
    frameSeconds: readonly number[],
    target = mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG),
    power = 1,
    sideSpin = 0,
    topSpin = 0,
    bounceIntent = 0,
  ) {
    const state = createBaselineBallFlight(
      STANDARD_RELEASE_POSITION,
      target,
      power,
      STANDARD_TRAJECTORY_CONFIG,
      STANDARD_BALL_FLIGHT_CONFIG,
      0,
      sideSpin,
      topSpin,
      bounceIntent,
    );
    const clock = new FixedClock({
      stepSeconds: fixedStepSeconds,
      maximumFrameSeconds: 1,
      maximumStepsPerFrame: 120,
    });
    for (const frame of frameSeconds) {
      clock.advance(frame, (step) => {
        advanceBallFlight(
          state,
          step,
          STANDARD_GOAL_CONFIG,
          STANDARD_GOALKEEPER_CONFIG,
          {
            previousPosition: distantKeeper,
            currentPosition: distantKeeper,
          },
        );
      });
    }
    return snapshotFlight(state);
  }

  function snapshotFlight(state: BallFlightState) {
    return {
      position: { ...state.position },
      previousPosition: { ...state.previousPosition },
      velocity: { ...state.velocity },
      elapsedSeconds: state.elapsedSeconds,
      contactHistory: state.contactHistory,
      terminalState: state.terminalState,
    };
  }

  function vectorLength(value: Vec3 | undefined): number {
    if (value === undefined) {
      throw new Error("Expected a recorded contact vector.");
    }
    return Math.hypot(value.x, value.y, value.z);
  }

  function relativeVectorLength(
    value: Vec3 | undefined,
    reference: Vec3,
  ): number {
    if (value === undefined) {
      throw new Error("Expected a recorded contact vector.");
    }
    return Math.hypot(
      value.x - reference.x,
      value.y - reference.y,
      value.z - reference.z,
    );
  }
});

describe("seeded goalkeeper movement", () => {
  it("chooses a reproducible sequence across all nine semantic zones", () => {
    const first = new SeededRng(1234);
    const second = new SeededRng(1234);
    const firstSequence = Array.from({ length: 5 }, () =>
      chooseGoalkeeperZone(first),
    );
    const secondSequence = Array.from({ length: 5 }, () =>
      chooseGoalkeeperZone(second),
    );

    expect(firstSequence).toEqual([
      "low-left",
      "high-left",
      "high-right",
      "high-right",
      "low-left",
    ]);
    expect(secondSequence).toEqual(firstSequence);
  });

  it("maps zones to the Unity-derived 1.20 by 0.75 metre offsets", () => {
    expect(
      goalkeeperZonePosition(
        "high-right",
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
      ),
    ).toEqual({ x: 1.2, y: 1.75, z: 7 });
    expect(
      goalkeeperZonePosition(
        "low-left",
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
      ),
    ).toEqual({ x: -1.2, y: 0.25, z: 7 });
  });

  it("keeps prepare, dive, arrival, and return motion deterministic", () => {
    expect(
      goalkeeperPositionDuringShot(
        "high-right",
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        0.1,
      ),
    ).toEqual(STANDARD_GOAL_CONFIG.center);
    expect(
      goalkeeperDiveProgress(0.3, STANDARD_GOALKEEPER_CONFIG),
    ).toBeCloseTo(0.5);
    const arrival = goalkeeperPositionDuringShot(
      "high-right",
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      0.45,
    );
    expect(arrival).toEqual({ x: 1.2, y: 1.75, z: 7 });
    expect(
      goalkeeperReturnPosition(
        arrival,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        STANDARD_GOALKEEPER_CONFIG.returnDurationSeconds,
      ),
    ).toEqual(STANDARD_GOAL_CONFIG.center);
  });
});

// Fixed release fixtures found by the pre-repair HEAD campaign; outcomes emerge from contacts.
// HB-INT-T03: negate the legacy world-signed spin fixtures to preserve their exact
// physical trajectories under the corrected screen-bow convention. Assertions unchanged.
describe("HB-VAL-02 arena-bounded high rebounds", () => {
  it("checks retained coalesced touch samples while preserving raw dispatch cadence", () => {
    // Bounded coordinates/timings from the failing VERTICAL_POST native trace.
    const event = (type: string, timeStamp: number, clientX: number, clientY: number,
      presentedFrames: number, coalescedEvents: PointerTraceEvent["coalescedEvents"] = []): PointerTraceEvent =>
      ({ type, timeStamp, clientX, clientY, presentedFrames, coalescedEvents,
        pointerId: 2, pointerType: "touch", isPrimary: true });
    const trace = [
      event("pointerdown", 1601.7, 480, 453.6, 17),
      event("pointermove", 1857.5, 518.016, 498.96, 25, [
        { timeStamp: 1840.2, clientX: 492.672, clientY: 468.72, pointerId: 2 },
        { timeStamp: 1849.3, clientX: 505.344, clientY: 483.84, pointerId: 2 },
        { timeStamp: 1857.5, clientX: 518.016, clientY: 498.96, pointerId: 2 },
      ]),
      event("pointermove", 1884, 568.704, 498.96, 25),
      event("pointermove", 1902.1, 619.392, 438.48, 27),
      event("pointermove", 1911.6, 644.736, 408.24, 27),
      event("pointermove", 1923.6, 670.08, 378, 27),
      event("pointerup", 1923.6, 670.08, 378, 27),
    ];
    const bounds = { x: 0, y: 0, width: 960, height: 540 };
    const evidence = validatePointerTrace(trace, null, true, bounds, [[1700, 1702]]);
    expect(evidence.maximumDispatchedEventGapMilliseconds).toBeCloseTo(255.8, 8);
    expect(evidence.maximumSampleGapMilliseconds).toBeCloseTo(238.5, 8);
    expect(evidence.renderFramesDuringGesture).toBe(1);
    expect(evidence.renderFramesDuringHandlerInterval).toBe(10);
    expect(evidence.rawEvents).toEqual(trace);
    // Removing hardware samples exposes the real >250 ms gap. A too-close
    // or unrelated early sample must not manufacture continuity either.
    for (const coalescedEvents of [[],
      [{ timeStamp: 1840.2, clientX: 480, clientY: 453.6, pointerId: 2 },
        { timeStamp: 1857.5, clientX: 518.016, clientY: 498.96, pointerId: 2 }],
      [{ timeStamp: 1840.2, clientX: 492.672, clientY: 468.72, pointerId: 99 },
        { timeStamp: 1857.5, clientX: 518.016, clientY: 498.96, pointerId: 2 }],
    ]) {
      expect(() => validatePointerTrace(trace.map((entry, index) => index === 1
        ? { ...entry, coalescedEvents } : entry), null, true, bounds, [[1700, 1702]])).toThrow("timing or presentation");
    }
    expect(() => validatePointerTrace(trace, null, true, bounds, [])).toThrow("timing or presentation");
    expect(() => validatePointerTrace(trace.map((entry, index) => index === 1
      ? { ...entry, coalescedEvents: entry.coalescedEvents.map((sample, i) =>
          i === 1 ? { ...sample, timeStamp: 1830 } : sample) } : entry),
      null, true, bounds, [[1700, 1702]])).toThrow("timing or presentation");
  });
  it("preserves the round's midpoint release power unless dense CROSSBAR sampling is requested", () => {
    const start = { x: 480, y: 453.6 };
    const end = { x: 480, y: 378 };
    const release = (dense: boolean) => {
      const points = [start, ...resolveStraightSwipeWaypoints(start, end, dense), end];
      const gesture = analyzeStandardGesture(points.map((point, index) => ({
        safeAreaPosition01: { x: point.x / 960, y: point.y / 540 },
        // Native dispatch can delay the first move and compress later moves.
        // The same 80 ms stroke then exposes the dense fixture's different
        // release-speed window; this is a deterministic timing model only.
        positionPixels: point,
        timeSeconds: index === 0 ? 0 : 0.04 + (index - 1) * 0.04 / (points.length - 2),
      })), { widthPixels: 960, heightPixels: 540 }, STANDARD_GESTURE_CONFIG);
      expect(gesture.category).toBe("DIRECT");
      expect(gesture.aim.horizontalAim).toBe(0);
      expect(gesture.aim.verticalAim).toBeCloseTo(0, 10);
      expect([gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent]).toEqual([0, 0, 0, 0]);
      return createBaselineBallFlight(STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(0, 0, STANDARD_GOAL_CONFIG), gesture.power,
        STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG);
    };
    const midpoint = release(false);
    const dense = release(true);
    expect(midpoint.releasePower).toBeGreaterThanOrEqual(0.55);
    expect(dense.releasePower).toBeGreaterThan(midpoint.releasePower + 0.1);
    expect(dense.releaseSpeedMetersPerSecond).toBeGreaterThan(midpoint.releaseSpeedMetersPerSecond);
  });
  it("keeps the straight CROSSBAR release stable despite an initial presentation delay", () => {
    const start = { x: 480, y: 453.6 };
    const end = { x: 480, y: 302.4 };
    const analyze = (samples: readonly { point: { x: number; y: number }; ms: number }[]) =>
      analyzeStandardGesture(samples.map(({ point, ms }) => ({
        safeAreaPosition01: { x: point.x / 960, y: point.y / 540 },
        positionPixels: point, timeSeconds: ms / 1000,
      })), { widthPixels: 960, heightPixels: 540 }, STANDARD_GESTURE_CONFIG);
    const fly = (gesture: ReturnType<typeof analyze>) => {
      const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(gesture.aim.horizontalAim, gesture.aim.verticalAim, STANDARD_GOAL_CONFIG),
        gesture.power, STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG,
        gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent);
      // Isolate the real frame collision; the browser retains its live keeper.
      const away = { x: 10, y: 1, z: 6.5 };
      for (let step = 0; step < 360 && ball.terminalState === null; step++) {
        advanceBallFlight(ball, 1 / 120, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
          { previousPosition: away, currentPosition: away });
      }
      return ball;
    };
    // Retained failing native trace: the presentation wait split the stroke.
    const former = analyze([
      { point: start, ms: 0 }, { point: { x: 480, y: 378 }, ms: 40.2 },
      { point: end, ms: 175.2 }, { point: end, ms: 175.31 },
    ]);
    expect(former.power).toBeCloseTo(0.676049, 5);
    expect(fly(former).contactHistory.map((contact) => contact.kind)).toEqual(["GOAL_PLANE"]);
    for (const initialDelayMs of [0, 95.3, 160]) {
      // Cover every move plus native coalescing into pairs of collinear moves.
      for (const coalescePairs of [false, true]) {
        const points = [...resolveStraightSwipeWaypoints(start, end, true), end];
        const samples = [{ point: start, ms: 0 }, ...points.flatMap((point, index) =>
          coalescePairs && index % 2 === 0 ? [] :
            [{ point, ms: initialDelayMs + (index + 1) * 80 / points.length }]),
          { point: end, ms: initialDelayMs + 80.11 }];
        const gesture = analyze(samples);
        expect(gesture.category).toBe("DIRECT");
        expect(gesture.aim.horizontalAim).toBe(0);
        expect(gesture.aim.verticalAim).toBeCloseTo(1, 10);
        expect([gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent]).toEqual([0, 0, 0, 0]);
        expect(gesture.power).toBeGreaterThan(0.9);
        const ball = fly(gesture);
        expect(ball.contactHistory[0]?.kind).toBe("CROSSBAR");
        expect(ball.contactHistory.filter((contact) => contact.outcome !== null)).toHaveLength(1);
        expect(ball.elapsedSeconds).toBeLessThan(3);
      }
    }
  });
  it("keeps the diagonal CROSSBAR fixture clear of HOLD and committed keepers", () => {
    const fly = (horizontalAim: number, power: number,
      zone: "mid-center" | "high-center" | "high-right", stepSeconds: number) => {
      const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(horizontalAim, 1, STANDARD_GOAL_CONFIG), power,
        STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG);
      for (let step = 0; step < 360 && ball.terminalState === null; step++) {
        advanceBallFlight(ball, stepSeconds, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG, {
          previousPosition: goalkeeperPositionDuringShot(zone, STANDARD_GOAL_CONFIG.center,
            STANDARD_GOALKEEPER_CONFIG, ball.elapsedSeconds),
          currentPosition: goalkeeperPositionDuringShot(zone, STANDARD_GOAL_CONFIG.center,
            STANDARD_GOALKEEPER_CONFIG, ball.elapsedSeconds + stepSeconds),
        });
      }
      return ball;
    };
    // Dense straight sampling can provide enough observations to commit high-center.
    // Seed 2 alone cannot keep a centered shot clear of that physical keeper.
    const intercepted = fly(0, 0.96, "high-center", 1 / 60);
    expect(intercepted.contactHistory[0]?.kind).toBe("KEEPER");
    expect(intercepted.terminalState).toBe("SAVED");
    // Use the same dense collinear geometry as the native browser fixture.
    const start = { x: 480, y: 453.6 };
    const end = { x: 480 + 0.7 * 960 * 0.22, y: 302.4 };
    const points = [start, ...resolveStraightSwipeWaypoints(start, end, true), end];
    const gesture = analyzeStandardGesture(points.map((point, index) => ({
      positionPixels: point,
      safeAreaPosition01: { x: point.x / 960, y: point.y / 540 },
      timeSeconds: index * 0.08 / (points.length - 1),
    })), { widthPixels: 960, heightPixels: 540 }, STANDARD_GESTURE_CONFIG);
    expect(gesture.category).toBe("DIRECT");
    expect(gesture.aim.horizontalAim).toBeCloseTo(0.7, 10);
    expect(gesture.aim.verticalAim).toBeCloseTo(1, 10);
    expect(gesture.power).toBeGreaterThanOrEqual(0.9);
    expect(Math.abs(gesture.loft)).toBeLessThan(1e-6);
    expect([gesture.sideSpin, gesture.topSpin, gesture.bounceIntent]).toEqual([0, 0, 0]);
    for (const stepSeconds of [1 / 60, 1 / 120]) {
      for (const power of [0.9, 0.95, 0.96, 1, gesture.power]) {
        // HOLD, the old centered commitment, and the diagonal cue's commitment.
        for (const zone of ["mid-center", "high-center", "high-right"] as const) {
          const ball = fly(0.7, power, zone, stepSeconds);
          expect(ball.contactHistory.map(contact => contact.kind)).toEqual(["CROSSBAR", "GROUND"]);
          expect(ball.contactHistory.map(contact => contact.outcome)).toEqual([null, "MISS"]);
          expect(ball.terminalState).toBe("MISS");
          expect(ball.contactHistory[0]?.outgoingVelocity).not.toEqual(ball.contactHistory[0]?.incomingVelocity);
          expect(ball.elapsedSeconds).toBeLessThan(3);
          expect(vectorIsFinite(ball.position)).toBe(true);
        }
      }
    }
  });
  it("keeps the native KEEPER fixture on the torso across presentation-delayed release timings", () => {
    for (const durationMilliseconds of [80, 184.4, 240]) {
      // The failed native trace had only down and endpoint samples, with an
      // observed 184.4 ms gap. Exercise the same shape without fabricated
      // browser evidence, including a slower gap below the input limit.
      const gesture = analyzeStandardGesture([
        { safeAreaPosition01: { x: 0.5, y: 0.84 },
          positionPixels: { x: 480, y: 453.6 }, timeSeconds: 0 },
        { safeAreaPosition01: { x: 0.5, y: 0.64 },
          positionPixels: { x: 480, y: 345.6 }, timeSeconds: durationMilliseconds / 1000 },
      ], { widthPixels: 960, heightPixels: 540 }, STANDARD_GESTURE_CONFIG);
      expect(gesture.category).toBe("DIRECT");
      expect(gesture.sideSpin).toBe(0);
      const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
        mapAimToGoalTarget(gesture.aim.horizontalAim, gesture.aim.verticalAim, STANDARD_GOAL_CONFIG),
        gesture.power, STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG,
        gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent);
      for (let step = 0; step < 360 && ball.terminalState === null; step++) {
        advanceBallFlight(ball, 1 / 120, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG, {
          previousPosition: STANDARD_GOAL_CONFIG.center,
          currentPosition: STANDARD_GOAL_CONFIG.center,
        });
      }
      expect(ball.contactHistory[0]?.kind).toBe("KEEPER");
      expect(ball.contactHistory.filter((contact) => contact.outcome !== null)).toHaveLength(1);
      expect(ball.terminalState).toBe("SAVED");
      expect(ball.elapsedSeconds).toBeLessThan(3);
    }
  });
  const cases = [
    ["high-left", 0.9, 0.5, 1, 0, 0, 0, "VERTICAL_POST"],
    ["high-right", -0.9, 0.5, 1, 0, 0, 0, "VERTICAL_POST"],
    ["high-left", 1, 0.5, 1, 0, -1, 0, "VERTICAL_POST"],
    ["high-right", -1, 0.5, 1, 0, 1, 0, "VERTICAL_POST"],
    ["low-left", 1, 0.5, 1, 0.5, -1, 0, "VERTICAL_POST"],
    ["low-right", -1, 0.5, 1, 0.5, 1, 0, "VERTICAL_POST"],
    ["low-left", -1, 0.5, 1, 0.5, 0, 0, "VERTICAL_POST"],
    ["low-left", 1, 0.5, 1, 0.5, 0, 0, "VERTICAL_POST"],
    ["low-left", 0.9, 0.5, 1, 0, -1, 1, "VERTICAL_POST"],
    ["low-right", -0.9, 0.5, 1, 0, 1, 1, "VERTICAL_POST"],
    ["high-left", 0.5, 1, 1, 0, 0, 0, "CROSSBAR"],
    ["high-right", -0.5, 1, 1, 0, 0, 0, "CROSSBAR"],
    ["high-left", 0, 1, 1, 0, 1, 0, "CROSSBAR"],
    ["high-right", 0, 1, 1, 0, -1, 0, "CROSSBAR"],
    ["mid-left", 0.5, 0.5, 1, 0.5, 0, 0, "CROSSBAR"],
    ["mid-right", -0.5, 0.5, 1, 0.5, 0, 0, "CROSSBAR"],
    ["high-center", 0, 1, 1, 0.5, 1, 1, "CROSSBAR"],
    ["high-center", 0, 1, 1, 0.5, -1, 1, "CROSSBAR"],
    ["mid-left", 0.5, 0.5, 1, 0.5, -1, 0, "CROSSBAR"],
    ["mid-right", -0.5, 0.5, 1, 0.5, 1, 0, "CROSSBAR"],
    ["mid-center", -0.5, 0.5, 0.5, 0.5, 1, 0, "KEEPER"],
    ["mid-center", 0.5, 0.5, 0.5, 0.5, -1, 0, "KEEPER"],
    ["high-center", 0, 0.5, 1, 0, 0, 0, "KEEPER"],
    ["high-left", 0.5, 0.5, 1, 0, -1, 0, "KEEPER"],
    ["high-right", -0.5, 0.5, 1, 0, 1, 0, "KEEPER"],
    ["high-left", 0, 0.5, 1, 0, 1, 0, "KEEPER"],
    ["high-right", -0.5, 0.5, 1, 0, 0, 0, "KEEPER"],
    ["mid-center", 0, 0.5, 0.5, 0.5, 0, 0, "KEEPER"],
    ["high-center", 0, 0.5, 0.5, 1, 0, 0, "KEEPER"],
    ["high-left", 0, 1, 0.5, 0.5, 1, 0, "KEEPER"],
  ] as const;
  function replay(c: (typeof cases)[number], frames: readonly number[]) {
    const [zone, horizontal, vertical, power, loft, sideSpin, topSpin] = c;
    const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(horizontal, vertical, STANDARD_GOAL_CONFIG),
      power, STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG, loft, sideSpin, topSpin);
    const clock = new FixedClock();
    const steps: object[] = [];
    let peakHeight = ball.position.y;
    for (let frame = 0; frame < 1_200 && ball.terminalState === null; frame++) {
      clock.advance(frames[frame % frames.length]!, (dt) => {
        if (ball.terminalState !== null) return;
        const sweep = {
          previousPosition: goalkeeperPositionDuringShot(zone, STANDARD_GOAL_CONFIG.center,
            STANDARD_GOALKEEPER_CONFIG, ball.elapsedSeconds),
          currentPosition: goalkeeperPositionDuringShot(zone, STANDARD_GOAL_CONFIG.center,
            STANDARD_GOALKEEPER_CONFIG, ball.elapsedSeconds + dt),
        };
        advanceBallFlight(ball, dt, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG, sweep);
        expect(vectorIsFinite(ball.position) && vectorIsFinite(ball.velocity)).toBe(true);
        peakHeight = Math.max(peakHeight, ball.position.y);
        steps.push({ time: ball.elapsedSeconds, position: { ...ball.position },
          velocity: { ...ball.velocity }, contacts: ball.contactHistory.length,
          outcome: ball.terminalState });
      });
    }
    return { release: c, peakHeight, ball, steps };
  }
  // Real fixedUpdate/resolveActiveShot/match/reset consumer; only presentation and
  // device adapters are inert. These fixtures start at release and do not claim
  // native input, goalkeeper perception, WebGL or RAF proof.
  function replayApplication(c: (typeof cases)[number], frames: readonly number[]) {
    const [zone, horizontal, vertical, power, loft, sideSpin, topSpin] = c;
    const target = mapAimToGoalTarget(horizontal, vertical, STANDARD_GOAL_CONFIG);
    const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION, target, power,
      STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG, loft, sideSpin, topSpin);
    const releasedShot = { ball, keeperZone: zone, target, category: "DIRECT", feint: null,
      power, keeperTerminalPosition: null, resultElapsedSeconds: 0 };
    const clock = new FixedClock();
    let inputEnabled = false;
    const events: { type: string; payload: unknown }[] = [];
    const adapters = {
      activeShot: releasedShot as typeof releasedShot | null,
      match: beginShot(createMatchState()), state: "running", resolvedShots: 0,
      outcomeHistory: [] as string[], engine: clock, root: { dataset: {} },
      events: { emit: (type: string, payload: unknown) => events.push({ type, payload }) },
      input: { setEnabled: (enabled: boolean) => { inputEnabled = enabled; } },
      keeperController: { reset() {} },
      scene: { finishShotMeasurement() {}, resetFeedback() {} },
      hud: { clearTrail() {}, setStatus(_status: string) {} },
      applyShotVisuals() {}, applyResultVisuals() {}, forceReadyVisuals() {}, updateHud() {},
    };
    const app = Object.assign(Object.create(HandballDemoApp.prototype) as
      typeof adapters & { fixedUpdate(dt: number, time: number): void }, adapters);
    const states: object[] = [];
    for (let frame = 0; frame < 1_200 && app.activeShot !== null; frame++) {
      const advanced = clock.advance(frames[frame % frames.length]!, (dt, time) => {
        if (app.activeShot === null) return;
        app.fixedUpdate(dt, time);
        states.push({ simulationSeconds: time, active: app.activeShot !== null,
          position: { ...ball.position }, velocity: { ...ball.velocity },
          contacts: ball.contactHistory.length, resultElapsedSeconds: releasedShot.resultElapsedSeconds,
          outcomes: [...app.outcomeHistory], inputEnabled, match: app.match });
      });
      expect(advanced.droppedSeconds).toBe(0);
    }
    expect(app.activeShot).toBeNull();
    expect(inputEnabled).toBe(true);
    expect(app.match.phase).toBe("READY");
    expect(app.resolvedShots).toBe(1);
    expect(app.outcomeHistory).toEqual([ball.terminalState]);
    expect(events.filter((event) => event.type === "outcome")).toHaveLength(1);
    const resetSimulationSeconds = (states.at(-1) as { simulationSeconds: number }).simulationSeconds;
    expect(resetSimulationSeconds).toBeLessThan(3.75);
    expect(resetSimulationSeconds - ball.elapsedSeconds).toBeGreaterThanOrEqual(
      STANDARD_TRAJECTORY_CONFIG.resetDelaySeconds);
    return { release: c, resetSimulationSeconds, outcomeCount: app.resolvedShots,
      inputEnabled, states, events };
  }
  it("observes the real application reset for all 30 releases with deterministic frame grouping", () => {
    const reports = cases.map((c) => {
      const first = replayApplication(c, [1 / 60]);
      expect(replayApplication(c, [1 / 60])).toEqual(first);
      expect(replayApplication(c, [1 / 120, 1 / 40, 1 / 30])).toEqual(first);
      return first;
    });
    mkdirSync("artifacts/hb-val02", { recursive: true });
    writeFileSync("artifacts/hb-val02/application-reset-campaign.json", JSON.stringify(reports, null, 2));
  });
  it("replays 30 distinct cases twice and with different render grouping", () => {
    const reports = cases.map((c) => {
      const first = replay(c, [1 / 60]);
      expect(replay(c, [1 / 60])).toEqual(first);
      expect(replay(c, [1 / 120, 1 / 40, 1 / 30])).toEqual(first);
      expect(first.ball.contactHistory.some((contact) => contact.kind === c[7])).toBe(true);
      expect(first.ball.contactHistory.filter((contact) => contact.outcome !== null)).toHaveLength(1);
      expect(first.ball.terminalState).not.toBeNull();
      // Measured campaign envelope, not a production timeout.
      expect(first.ball.elapsedSeconds).toBeLessThan(3);
      expect(first.peakHeight).toBeLessThanOrEqual(9.486 + 1e-9);
      if (first.ball.terminalState === "SAVED") {
        expect(first.ball.contactHistory.some((contact) => contact.kind === "KEEPER")).toBe(true);
      }
      const terminal = JSON.stringify(first.ball);
      advanceBallFlight(first.ball, 1 / 60, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
        { previousPosition: STANDARD_GOAL_CONFIG.center, currentPosition: STANDARD_GOAL_CONFIG.center });
      expect(JSON.stringify(first.ball)).toBe(terminal);
      return first;
    });
    mkdirSync("artifacts/hb-val02", { recursive: true });
    writeFileSync("artifacts/hb-val02/deterministic-campaign.json", JSON.stringify(reports, null, 2));
  });
  it("resolves the original escape at the ceiling while preserving both impulses", () => {
    const result = replay(["high-left", 0.5, 1, 1, 0, 0, 0, "CROSSBAR"], [1 / 60]);
    expect(result.ball.elapsedSeconds).toBeCloseTo(0.8152370684159442, 9);
    expect(result.ball.position.y).toBeCloseTo(9.486, 9);
    expect(result.ball.contactHistory).toMatchObject([
      { kind: "KEEPER", outcome: null }, { kind: "CROSSBAR", outcome: null },
      { kind: "PLAY_VOLUME", outcome: "SAVED" },
    ]);
    expect(result.ball.contactHistory[1]?.outgoingVelocity?.y).toBeCloseTo(16.774450219299872, 9);
  });
  it("retains earlier goal-plane authority in a large integration step", () => {
    const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(-0.7, 0, STANDARD_GOAL_CONFIG), 1,
      STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG);
    const farKeeper = { x: 10, y: 1, z: 7 };
    expect(advanceBallFlight(ball, 2, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: farKeeper, currentPosition: farKeeper })).toBe("GOAL");
    expect(ball.contactHistory).toHaveLength(1);
    expect(ball.contactHistory[0]?.kind).toBe("GOAL_PLANE");
  });
  it("detects an upward volume exit even when the step ends below the ceiling", () => {
    const ball = createBaselineBallFlight({ x: 0, y: 2, z: 0 },
      STANDARD_GOAL_CONFIG.center, 1, STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG);
    Object.assign(ball.velocity, { x: 0, y: 20, z: 0 });
    const far = { x: 10, y: 1, z: 7 };
    expect(advanceBallFlight(ball, 4, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: far, currentPosition: far })).toBe("MISS");
    expect(ball.position.y).toBeCloseTo(9.486, 9);
    expect(ball.contactHistory).toMatchObject([{ kind: "PLAY_VOLUME", outcome: "MISS" }]);
    expect(ball.elapsedSeconds).toBeLessThan(0.5);
  });
  it("preserves goal-plane precedence at a simultaneous volume crossing", () => {
    const ball = createBaselineBallFlight({ x: 0, y: 1, z: 0 },
      STANDARD_GOAL_CONFIG.center, 1, STANDARD_TRAJECTORY_CONFIG,
      { ...STANDARD_BALL_FLIGHT_CONFIG, playableVolume: {
        ...STANDARD_BALL_FLIGHT_CONFIG.playableVolume,
        halfWidthMeters: 1 + STANDARD_GOAL_CONFIG.ballRadiusMeters,
      } });
    Object.assign(ball.velocity, { x: 1, y: 4.905, z: 7 });
    const far = { x: 10, y: 1, z: 7 };
    expect(advanceBallFlight(ball, 1, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: far, currentPosition: far })).toBe("GOAL");
    expect(ball.contactHistory).toMatchObject([{ kind: "GOAL_PLANE", outcome: "GOAL" }]);
  });

});
