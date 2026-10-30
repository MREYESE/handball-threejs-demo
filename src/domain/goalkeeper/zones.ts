import type { GoalkeeperConfig } from "../../config/types";
import type { SeededRng } from "../../core/SeededRng";
import { clamp01, lerp, type Vec2, type Vec3 } from "../math";

export const GOALKEEPER_ZONES = [
  "low-left",
  "low-center",
  "low-right",
  "mid-left",
  "mid-center",
  "mid-right",
  "high-left",
  "high-center",
  "high-right",
] as const;

export type GoalkeeperZone = (typeof GOALKEEPER_ZONES)[number];

const ZONE_FACTORS: Readonly<Record<GoalkeeperZone, Vec2>> = Object.freeze({
  "low-left": Object.freeze({ x: -1, y: -1 }),
  "low-center": Object.freeze({ x: 0, y: -1 }),
  "low-right": Object.freeze({ x: 1, y: -1 }),
  "mid-left": Object.freeze({ x: -1, y: 0 }),
  "mid-center": Object.freeze({ x: 0, y: 0 }),
  "mid-right": Object.freeze({ x: 1, y: 0 }),
  "high-left": Object.freeze({ x: -1, y: 1 }),
  "high-center": Object.freeze({ x: 0, y: 1 }),
  "high-right": Object.freeze({ x: 1, y: 1 }),
});

export function chooseGoalkeeperZone(rng: SeededRng): GoalkeeperZone {
  const zone = GOALKEEPER_ZONES[rng.nextInt(GOALKEEPER_ZONES.length)];
  if (zone === undefined) {
    throw new Error("Seeded goalkeeper choice produced an invalid zone.");
  }
  return zone;
}

export function goalkeeperZonePosition(
  zone: GoalkeeperZone,
  goalCenter: Vec3,
  config: GoalkeeperConfig,
): Vec3 {
  const factor = ZONE_FACTORS[zone];
  return Object.freeze({
    x: goalCenter.x + factor.x * config.horizontalRangeMeters,
    y: goalCenter.y + factor.y * config.verticalRangeMeters,
    z: goalCenter.z,
  });
}

export function goalkeeperDiveProgress(
  elapsedSeconds: number,
  config: GoalkeeperConfig,
): number {
  return clamp01(
    (elapsedSeconds - config.reactionDelaySeconds) / config.diveDurationSeconds,
  );
}

export function goalkeeperPositionDuringShot(
  zone: GoalkeeperZone,
  goalCenter: Vec3,
  config: GoalkeeperConfig,
  elapsedSeconds: number,
  from: Vec3 = goalCenter,
): Vec3 {
  const target = goalkeeperZonePosition(zone, goalCenter, config);
  const progress = goalkeeperDiveProgress(elapsedSeconds, config);
  return Object.freeze({
    x: lerp(from.x, target.x, progress),
    y: lerp(from.y, target.y, progress),
    z: goalCenter.z,
  });
}

export function goalkeeperReturnPosition(
  from: Vec3,
  goalCenter: Vec3,
  config: GoalkeeperConfig,
  elapsedSeconds: number,
): Vec3 {
  const progress = clamp01(elapsedSeconds / config.returnDurationSeconds);
  return Object.freeze({
    x: lerp(from.x, goalCenter.x, progress),
    y: lerp(from.y, goalCenter.y, progress),
    z: goalCenter.z,
  });
}
