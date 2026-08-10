import type { Vec3 } from "../domain/math";

export interface GestureConfig {
  readonly minimumDistancePixels: number;
  readonly minimumDurationSeconds: number;
  readonly maximumDurationSeconds: number;
  readonly maximumSampleGapSeconds: number;
  readonly startZoneFraction: number;
  readonly minimumIntermediateDistanceSafeFraction: number;
  readonly horizontalFullRangeViewportFraction: number;
  readonly verticalFullRangeViewportFraction: number;
  readonly resamplePointCount: number;
  readonly smoothingWindow: number;
  readonly releaseSpeedSampleCount: number;
  readonly releaseSpeedFullPowerSafeFractionsPerSecond: number;
  readonly maximumSpeedFullPowerSafeFractionsPerSecond: number;
  readonly pathLengthFullPowerSafeFraction: number;
  readonly releaseSpeedWeight: number;
  readonly maximumSpeedWeight: number;
  readonly pathLengthWeight: number;
}

export interface GoalConfig {
  readonly widthMeters: number;
  readonly heightMeters: number;
  readonly ballRadiusMeters: number;
  readonly safetyMarginMeters: number;
  readonly horizontalOvershootFactor: number;
  readonly verticalOvershootFactor: number;
  readonly center: Vec3;
}

export interface StandardTrajectoryConfig {
  readonly minimumDurationSeconds: number;
  readonly maximumDurationSeconds: number;
  readonly arcHeightMeters: number;
  readonly resetDelaySeconds: number;
}

export interface GoalkeeperConfig {
  readonly horizontalRangeMeters: number;
  readonly verticalRangeMeters: number;
  readonly reactionDelaySeconds: number;
  readonly diveDurationSeconds: number;
  readonly returnDurationSeconds: number;
  readonly saveRadiusMeters: number;
}

export interface MatchConfig {
  readonly shotsPerRound: number;
}
