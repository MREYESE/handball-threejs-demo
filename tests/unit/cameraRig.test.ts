import { describe, expect, it } from "vitest";
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
