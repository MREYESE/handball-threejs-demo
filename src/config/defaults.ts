import type {
  GestureConfig,
  GoalConfig,
  GoalkeeperConfig,
  MatchConfig,
  StandardTrajectoryConfig,
} from "./types";

export const STANDARD_GESTURE_CONFIG: GestureConfig = Object.freeze({
  minimumDistancePixels: 40,
  minimumDurationSeconds: 0.03,
  maximumDurationSeconds: 1.5,
  maximumSampleGapSeconds: 0.25,
  startZoneFraction: 0.45,
  minimumIntermediateDistanceSafeFraction: 0.002,
  horizontalFullRangeViewportFraction: 0.22,
  verticalFullRangeViewportFraction: 0.28,
  resamplePointCount: 32,
  smoothingWindow: 3,
  releaseSpeedSampleCount: 4,
  releaseSpeedFullPowerSafeFractionsPerSecond: 2.4,
  maximumSpeedFullPowerSafeFractionsPerSecond: 3,
  pathLengthFullPowerSafeFraction: 0.35,
  releaseSpeedWeight: 0.5,
  maximumSpeedWeight: 0.3,
  pathLengthWeight: 0.2,
});

export const STANDARD_GOAL_CONFIG: GoalConfig = Object.freeze({
  widthMeters: 3,
  heightMeters: 2,
  ballRadiusMeters: 0.094,
  safetyMarginMeters: 0.02,
  horizontalOvershootFactor: 0.15,
  verticalOvershootFactor: 0.15,
  center: Object.freeze({ x: 0, y: 1, z: 7 }),
});

export const STANDARD_TRAJECTORY_CONFIG: StandardTrajectoryConfig = Object.freeze({
  minimumDurationSeconds: 0.35,
  maximumDurationSeconds: 0.8,
  arcHeightMeters: 1.1,
  resetDelaySeconds: 0.7,
});

export const STANDARD_GOALKEEPER_CONFIG: GoalkeeperConfig = Object.freeze({
  horizontalRangeMeters: 1.2,
  verticalRangeMeters: 0.75,
  reactionDelaySeconds: 0.15,
  diveDurationSeconds: 0.3,
  returnDurationSeconds: 0.25,
  saveRadiusMeters: 0.65,
});

export const STANDARD_MATCH_CONFIG: MatchConfig = Object.freeze({
  shotsPerRound: 5,
});

export const STANDARD_RELEASE_POSITION = Object.freeze({ x: 0, y: 1, z: 0 });
