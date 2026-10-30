import { mkdirSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STANDARD_BALL_FLIGHT_CONFIG, STANDARD_GESTURE_CONFIG, STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG, STANDARD_RELEASE_POSITION, STANDARD_TRAJECTORY_CONFIG } from "../../src/config/defaults";
import { analyzeStandardGesture } from "../../src/domain/gesture/features";
import { createBaselineBallFlight, advanceBallFlight } from "../../src/domain/shot/ballFlight";
import { mapAimToGoalTarget } from "../../src/domain/shot/target";
import {
  LockedCameraRig,
  lockedCameraLayout,
  type LockedCameraProfile,
} from "../../src/presentation/camera/LockedCameraRig";

const APPROVED_VIEWPORTS: readonly {
  width: number;
  height: number;
  profile: LockedCameraProfile;
}[] = [
  { width: 1920, height: 1080, profile: "desktop-wide" },
  { width: 1440, height: 900, profile: "desktop-compact" },
  { width: 1280, height: 720, profile: "desktop-wide" },
  { width: 844, height: 390, profile: "mobile-landscape" },
];

const GOAL_MINIMUM = Object.freeze({ x: -1.62, y: 0, z: 7 });
const GOAL_MAXIMUM = Object.freeze({ x: 1.62, y: 2.12, z: 7.8 });
const SHOOTER_MINIMUM = Object.freeze({ x: -1.24, y: 0, z: -0.78 });
const SHOOTER_MAXIMUM = Object.freeze({ x: -0.28, y: 2.05, z: 0.25 });
const MINIMUM_GOAL_WIDTH_BY_PROFILE: Readonly<
  Record<LockedCameraProfile, number>
> = Object.freeze({
  "desktop-wide": 0.64,
  "desktop-compact": 0.56,
  "mobile-landscape": 0.46,
});
const SHOOTER_VISIBLE_WIDTH_BY_PROFILE: Readonly<
  Record<LockedCameraProfile, readonly [number, number]>
> = Object.freeze({
  "desktop-wide": [0.48, 0.54],
  "desktop-compact": [0.66, 0.72],
  "mobile-landscape": [0.66, 0.72],
});

describe("locked over-the-shoulder camera", () => {
  // Engineering geometry fixtures, not human-calibrated recognition thresholds.
  const gesture = (aim: number, bow: number, duration: number, hook = false) =>
    analyzeStandardGesture(Array.from({ length: 9 }, (_, i) => {
      const t = i / 8;
      const x = 0.5 + aim * 0.22 * t + bow * Math.sin(Math.PI * t);
      const y = hook ? 0.84 - 0.37 * Math.min(t / 0.65, 1) + 0.14 * Math.max(0, (t - 0.65) / 0.35)
        : 0.84 - 0.23 * t;
      return { safeAreaPosition01: { x, y }, positionPixels: { x: x * 1000, y: y * 500 }, timeSeconds: duration * t };
    }), { widthPixels: 1000, heightPixels: 500 }, STANDARD_GESTURE_CONFIG);

  const flight = (g: ReturnType<typeof gesture>, spin = g.sideSpin) => {
    const state = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(g.aim.horizontalAim, g.aim.verticalAim, STANDARD_GOAL_CONFIG),
      g.power, STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG,
      g.loft, spin, g.topSpin, g.bounceIntent);
    // Isolate flight with the real integrator; production browser tests retain the keeper.
    const distant = { x: 100, y: 100, z: 100 };
    for (let i = 0; i < 12; i++) advanceBallFlight(state, 1 / 120,
      STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
      { previousPosition: distant, currentPosition: distant });
    expect(state.contactHistory).toEqual([]);
    return state;
  };

  it.each(APPROVED_VIEWPORTS)("projects lateral bow toward its screen direction independently of aim at $width x $height",
    ({ width, height }) => {
      const rig = new LockedCameraRig();
      rig.resize(width, height);
      const report: object[] = [];
      for (const aim of [-0.7, 0, 0.7]) {
        for (const duration of [0.7, 1.1]) {
          for (const direction of [-1, 1]) {
            const curves: number[] = [];
            for (const amplitude of [0.035, 0.07]) {
              const g = gesture(aim, direction * amplitude, duration);
              const state = flight(g);
              const neutral = flight(g, 0);
              const projected = rig.projectPoint(state.position).x - rig.projectPoint(neutral.position).x;
              expect(g.power).toBeGreaterThan(0);
              expect(g.power).toBeLessThan(1);
              expect(Math.abs(g.sideSpin)).toBeLessThan(1);
              expect(Math.sign(g.sideSpin)).toBe(direction);
              expect(state.initialVelocity).toEqual(neutral.initialVelocity);
              expect(state.releaseSpeedMetersPerSecond).toBe(neutral.releaseSpeedMetersPerSecond);
              expect(state.releaseLoft).toBe(neutral.releaseLoft);
              expect(state.releaseTopSpin).toBe(neutral.releaseTopSpin);
              expect(state.releaseBounceIntent).toBe(neutral.releaseBounceIntent);
              expect(projected * direction, JSON.stringify({ aim, bow: direction * amplitude,
                spin: g.sideSpin, worldAcceleration: state.sideSpinAccelerationMetersPerSecondSquared,
                projected })).toBeGreaterThan(0);
              report.push({ aim, bow: direction * amplitude, duration, category: g.category,
                power: g.power, spin: g.sideSpin, worldAcceleration: state.sideSpinAccelerationMetersPerSecondSquared,
                speed: state.releaseSpeedMetersPerSecond, elapsedSeconds: state.elapsedSeconds,
                target: mapAimToGoalTarget(g.aim.horizontalAim, g.aim.verticalAim, STANDARD_GOAL_CONFIG),
                position: state.position, neutralPosition: neutral.position, projected });
              expect(flight(g)).toEqual(state);
              const mirrored = flight(gesture(-aim, -direction * amplitude, duration));
              expect(mirrored.position.x).toBeCloseTo(-state.position.x, 12);
              curves.push(Math.abs(projected));
            }
            expect(curves[1]!).toBeGreaterThan(curves[0]!);
          }
        }
        const slow = flight(gesture(aim, 0.07, 1.1));
        const fast = flight(gesture(aim, 0.07, 0.7));
        expect(fast.releaseSpeedMetersPerSecond).toBeGreaterThan(slow.releaseSpeedMetersPerSecond);
        expect(fast.position.z).toBeGreaterThan(slow.position.z);
        const direct = gesture(aim, 0, 0.7);
        expect(direct.category).toBe("DIRECT");
        expect(direct.sideSpin).toBe(0);
        expect(direct.aim.horizontalAim).toBeCloseTo(aim, 12);
        expect(flight(direct)).toEqual(flight(direct, 0));
        const lob = gesture(aim, 0, 0.7, true);
        expect(lob.aim.horizontalAim).toBeCloseTo(aim, 12);
        expect(lob.aim.verticalAim).toBeCloseTo(direct.aim.verticalAim, 12);
        const lobState = flight(lob);
        const lobNeutral = flight(lob, 0);
        expect(lobState.initialVelocity).toEqual(lobNeutral.initialVelocity);
        const lobCurve = rig.projectPoint(lobState.position).x - rig.projectPoint(lobNeutral.position).x;
        if (lob.sideSpin !== 0) expect(Math.sign(lobCurve)).toBe(Math.sign(lob.sideSpin));
        else expect(lobCurve).toBe(0);
        const target = mapAimToGoalTarget(lob.aim.horizontalAim, lob.aim.verticalAim, STANDARD_GOAL_CONFIG);
        const centreTarget = mapAimToGoalTarget(0, lob.aim.verticalAim, STANDARD_GOAL_CONFIG);
        expect(Math.sign(rig.projectPoint(target).x - rig.projectPoint(centreTarget).x)).toBe(Math.sign(aim));
        expect(gesture(-aim, 0, 0.7, true).sideSpin).toBeCloseTo(-lob.sideSpin, 12);
        // Record current category and residual slanted-hook spin; no v2 recognition claim.
        report.push({ fixture: "LOB_SHAPED", aim, category: lob.category, spin: lob.sideSpin,
          endpoint: lob.aim, target, projected: lobCurve });
      }
      mkdirSync("artifacts/hb-val01-direction", { recursive: true });
      writeFileSync(`artifacts/hb-val01-direction/${width}x${height}.json`, JSON.stringify(report, null, 2));
    });
  it.each(APPROVED_VIEWPORTS)(
    "keeps the full goal centered and the shooter in the left foreground at $width x $height",
    ({ width, height, profile }) => {
      const rig = new LockedCameraRig();
      const layout = rig.resize(width, height);
      const goal = rig.projectBounds(GOAL_MINIMUM, GOAL_MAXIMUM);
      const shooter = rig.projectBounds(SHOOTER_MINIMUM, SHOOTER_MAXIMUM);

      expect(layout.profile).toBe(profile);
      expect(goal.fullyVisible).toBe(true);
      expect(Math.abs(goal.centerX)).toBeLessThanOrEqual(0.08);
      expect(Math.abs(goal.centerY)).toBeLessThanOrEqual(0.16);
      expect(goal.width).toBeGreaterThanOrEqual(
        MINIMUM_GOAL_WIDTH_BY_PROFILE[profile],
      );
      expect(goal.height).toBeGreaterThan(0.58);
      expect(shooter.left).toBeLessThan(-0.3);
      expect(shooter.right).toBeLessThan(-0.18);
      expect(shooter.top).toBeLessThanOrEqual(1);
      expect(shooter.top).toBeGreaterThanOrEqual(-0.35);
      expect(shooter.centerX).toBeLessThan(-0.22);
      expect(shooter.visibleWidth).toBeGreaterThanOrEqual(
        SHOOTER_VISIBLE_WIDTH_BY_PROFILE[profile][0],
      );
      expect(shooter.visibleWidth).toBeLessThanOrEqual(
        SHOOTER_VISIBLE_WIDTH_BY_PROFILE[profile][1],
      );
    },
  );

  it("reuses exactly one camera while switching responsive profiles", () => {
    const rig = new LockedCameraRig();
    const camera = rig.camera;

    for (const viewport of APPROVED_VIEWPORTS) {
      rig.resize(viewport.width, viewport.height);
      expect(rig.camera).toBe(camera);
      expect(rig.camera.userData["activeGameplayCamera"]).toBe(true);
    }
  });

  it("selects layouts without depending on pointer or gameplay semantics", () => {
    expect(lockedCameraLayout(1920, 1080).aspect).toBeCloseTo(16 / 9);
    expect(lockedCameraLayout(1920, 1080).verticalFovDegrees).toBe(30);
    expect(lockedCameraLayout(1440, 900).verticalFovDegrees).toBe(37);
    expect(lockedCameraLayout(844, 390).verticalFovDegrees).toBe(34);
  });
});
