import type {
  BallFlightConfig,
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
  loftFullRangeSafeFraction: 0.12,
  loftMaximumHorizontalDeviationSafeFraction: 0.12,
  sideSpinFullRangeSafeFraction: 0.12,
  topSpinFullRangeSafeFraction: 0.12,
  topSpinMaximumHorizontalDeviationSafeFraction: 0.12,
  bounceZeroIntentVerticalGesture01: 0.5,
  lobCategoryMinimumLoft: 0.6,
  bounceCategoryMinimumIntent: 0.6,
  feintMinimumInitialImpulseSafeFraction: 0.055,
  feintMinimumInitialHorizontalRatio: 0.7,
  feintMinimumBrakeSafeFraction: 0.025,
  feintMaximumBrakeSpeedRatio: 0.3,
  feintMaximumReversalDirectionDot: -0.35,
  feintMinimumSecondImpulseSafeFraction: 0.06,
  feintMaximumSecondImpulseDirectionDot: -0.2,
  feintMaximumPrefixDurationSeconds: 0.75,
  releaseSpeedWeight: 0.5,
  maximumSpeedWeight: 0.3,
  pathLengthWeight: 0.2,
});

export const STANDARD_GOAL_CONFIG: GoalConfig = Object.freeze({
  widthMeters: 3,
  heightMeters: 2,
  postThicknessMeters: 0.12,
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

export const STANDARD_BALL_FLIGHT_CONFIG: BallFlightConfig = Object.freeze({
  playableVolume: Object.freeze({
    halfWidthMeters: 10.025, // side wall inner face: 10.2 - 0.35 / 2
    ceilingHeightMeters: 9.58, // ceiling underside: 9.7 - 0.24 / 2
    minimumZMeters: -12.5, // open end of the rendered 28 m arena shell
  }),
  minimumReleaseSpeedMetersPerSecond: 8,
  maximumReleaseSpeedMetersPerSecond: 24,
  minimumLaunchLiftMeters: 0.45,
  maximumLaunchLiftMeters: 1.35,
  maximumSideSpinAccelerationMetersPerSecondSquared: 8,
  maximumTopSpinDropAccelerationMetersPerSecondSquared: 12,
  gravityMetersPerSecondSquared: -9.81,
  postRestitution: 0.72,
  crossbarRestitution: 0.68,
  minimumGroundRestitution: 0,
  maximumGroundRestitution: 0.72,
  minimumGroundReboundSpeedMetersPerSecond: 1.25,
  maximumGroundBounces: 1,
});

export const STANDARD_GOALKEEPER_CONFIG: GoalkeeperConfig = Object.freeze({
  feintHoldSeconds: 0.65,
  feintRecoverySeconds: 0.6,
  feintMaximumSpeedMetersPerSecond: 1.2,
  horizontalRangeMeters: 1.2,
  verticalRangeMeters: 0.75,
  reactionDelaySeconds: 0.15,
  diveDurationSeconds: 0.3,
  returnDurationSeconds: 0.25,
  saveRadiusMeters: 0.65,
  contactRestitution: 0.6,
  minimumReadSeconds: 0.08,
  maximumReadSeconds: 0.45,
  minimumCueConfidence: 0.055,
  minimumCueAgreementDot: 0.5,
  minimumStableCueSamples: 2,
  horizontalCommitThreshold: 0.3,
  verticalCommitThreshold: 0.35,
  maximumTendency: 0.08,
});

export const STANDARD_MATCH_CONFIG: MatchConfig = Object.freeze({
  shotsPerRound: 5,
});

export const STANDARD_RELEASE_POSITION = Object.freeze({ x: 0, y: 1, z: 0 });

