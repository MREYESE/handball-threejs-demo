import type { StandardTrajectoryConfig } from "../../config/types";
import { clamp01, lerp, type Vec3 } from "../math";

export function standardShotDuration(
  power: number,
  config: StandardTrajectoryConfig,
): number {
  return lerp(
    config.maximumDurationSeconds,
    config.minimumDurationSeconds,
    clamp01(power),
  );
}

export function evaluateStandardTrajectory(
  release: Vec3,
  target: Vec3,
  elapsedSeconds: number,
  power: number,
  config: StandardTrajectoryConfig,
): Vec3 {
  const duration = standardShotDuration(power, config);
  const progress = clamp01(elapsedSeconds / duration);
  const verticalArc = 4 * config.arcHeightMeters * progress * (1 - progress);
  return Object.freeze({
    x: lerp(release.x, target.x, progress),
    y: lerp(release.y, target.y, progress) + verticalArc,
    z: lerp(release.z, target.z, progress),
  });
}

