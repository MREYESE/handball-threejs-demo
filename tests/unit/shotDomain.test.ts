import { describe, expect, it } from "vitest";
import {
  STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG,
  STANDARD_RELEASE_POSITION,
  STANDARD_TRAJECTORY_CONFIG,
} from "../../src/config/defaults";
import { SeededRng } from "../../src/core/SeededRng";
import {
  chooseGoalkeeperZone,
  goalkeeperDiveProgress,
  goalkeeperPositionDuringShot,
  goalkeeperReturnPosition,
  goalkeeperZonePosition,
} from "../../src/domain/goalkeeper/zones";
import { resolveShotOutcome } from "../../src/domain/shot/outcome";
import {
  calculateGoalTargetBounds,
  mapAimToGoalTarget,
} from "../../src/domain/shot/target";
import {
  evaluateStandardTrajectory,
  standardShotDuration,
} from "../../src/domain/shot/trajectory";
import type { Vec3 } from "../../src/domain/math";
import type { ShotOutcome } from "../../src/domain/shot/outcome";

interface OutcomeCase {
  readonly name: string;
  readonly target: Vec3;
  readonly keeper: Vec3;
  readonly expected: ShotOutcome;
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

describe("seeded goalkeeper and outcomes", () => {
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

  const outcomeCases: readonly OutcomeCase[] = [
    {
      name: "saved",
      target: { x: 0, y: 1, z: 7 },
      keeper: { x: 0.5, y: 1, z: 7 },
      expected: "SAVED",
    },
    {
      name: "goal",
      target: { x: 0, y: 1, z: 7 },
      keeper: { x: 1.2, y: 1.75, z: 7 },
      expected: "GOAL",
    },
    {
      name: "miss",
      target: { x: 1.611, y: 1, z: 7 },
      keeper: { x: 0, y: 0.25, z: 7 },
      expected: "MISS",
    },
  ];

  it.each(outcomeCases)(
    "resolves $name from target and current keeper position",
    ({ target, keeper, expected }: OutcomeCase) => {
      expect(
        resolveShotOutcome(
          target,
          keeper,
          STANDARD_GOAL_CONFIG,
          STANDARD_GOALKEEPER_CONFIG,
        ),
      ).toBe(expected);
    },
  );
});
