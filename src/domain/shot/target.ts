import type { GoalConfig } from "../../config/types";
import { clamp, clamp01, lerp, type Vec3 } from "../math";

export interface GoalTargetBounds {
  readonly validHorizontalHalfRange: number;
  readonly validVerticalHalfRange: number;
  readonly horizontalTargetRange: number;
  readonly verticalTargetLow: number;
  readonly verticalTargetHigh: number;
}

export function calculateGoalTargetBounds(config: GoalConfig): GoalTargetBounds {
  const halfWidth = config.widthMeters / 2;
  const halfHeight = config.heightMeters / 2;
  const clearance = Math.max(0, config.ballRadiusMeters + config.safetyMarginMeters);
  const validHorizontalHalfRange = Math.max(0, halfWidth - clearance);
  const validVerticalHalfRange = Math.max(0, halfHeight - clearance);
  return Object.freeze({
    validHorizontalHalfRange,
    validVerticalHalfRange,
    horizontalTargetRange:
      validHorizontalHalfRange + halfWidth * config.horizontalOvershootFactor,
    verticalTargetLow:
      -validVerticalHalfRange - halfHeight * config.verticalOvershootFactor,
    verticalTargetHigh:
      validVerticalHalfRange + halfHeight * config.verticalOvershootFactor,
  });
}

export function mapAimToGoalTarget(
  horizontalAim: number,
  verticalAim: number,
  config: GoalConfig,
): Vec3 {
  const bounds = calculateGoalTargetBounds(config);
  const horizontalAmount = clamp(horizontalAim, -1, 1);
  const verticalAmount = clamp01((clamp(verticalAim, -1, 1) + 1) / 2);
  return Object.freeze({
    // The locked shooter-facing camera projects negative world X to screen-right.
    // Mirror only the horizontal gesture axis so a right swipe aims visually right.
    x: config.center.x - horizontalAmount * bounds.horizontalTargetRange,
    y:
      config.center.y +
      lerp(bounds.verticalTargetLow, bounds.verticalTargetHigh, verticalAmount),
    z: config.center.z,
  });
}

export function isInsideValidGoalTarget(target: Vec3, config: GoalConfig): boolean {
  const bounds = calculateGoalTargetBounds(config);
  return (
    Math.abs(target.x - config.center.x) <= bounds.validHorizontalHalfRange &&
    Math.abs(target.y - config.center.y) <= bounds.validVerticalHalfRange
  );
}
