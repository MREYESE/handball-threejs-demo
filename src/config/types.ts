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
  readonly loftFullRangeSafeFraction: number;
  readonly loftMaximumHorizontalDeviationSafeFraction: number;
  readonly sideSpinFullRangeSafeFraction: number;
  readonly topSpinFullRangeSafeFraction: number;
  readonly topSpinMaximumHorizontalDeviationSafeFraction: number;
  readonly bounceZeroIntentVerticalGesture01: number;
  readonly lobCategoryMinimumLoft: number;
  readonly bounceCategoryMinimumIntent: number;
  readonly feintMinimumInitialImpulseSafeFraction: number;
  readonly feintMinimumInitialHorizontalRatio: number;
  readonly feintMinimumBrakeSafeFraction: number;
  readonly feintMaximumBrakeSpeedRatio: number;
  readonly feintMaximumReversalDirectionDot: number;
  readonly feintMinimumSecondImpulseSafeFraction: number;
  readonly feintMaximumSecondImpulseDirectionDot: number;
  readonly feintMaximumPrefixDurationSeconds: number;
  readonly releaseSpeedWeight: number;
  readonly maximumSpeedWeight: number;
  readonly pathLengthWeight: number;
}

export interface GoalConfig {
  readonly widthMeters: number;
  readonly heightMeters: number;
  readonly postThicknessMeters: number;
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

export interface BallFlightConfig {
  /** Interior arena surfaces; ball radius is applied by the swept boundary. */
  readonly playableVolume: Readonly<{
    halfWidthMeters: number;
    ceilingHeightMeters: number;
    minimumZMeters: number;
  }>;
  readonly minimumReleaseSpeedMetersPerSecond: number;
  readonly maximumReleaseSpeedMetersPerSecond: number;
  readonly minimumLaunchLiftMeters: number;
  readonly maximumLaunchLiftMeters: number;
  readonly maximumSideSpinAccelerationMetersPerSecondSquared: number;
  readonly maximumTopSpinDropAccelerationMetersPerSecondSquared: number;
  readonly gravityMetersPerSecondSquared: number;
  readonly postRestitution: number;
  readonly crossbarRestitution: number;
  readonly minimumGroundRestitution: number;
  readonly maximumGroundRestitution: number;
  readonly minimumGroundReboundSpeedMetersPerSecond: number;
  readonly maximumGroundBounces: number;
}

export interface GoalkeeperConfig {
  readonly feintHoldSeconds: number;
  readonly feintRecoverySeconds: number;
  readonly feintMaximumSpeedMetersPerSecond: number;
  readonly horizontalRangeMeters: number;
  readonly verticalRangeMeters: number;
  readonly reactionDelaySeconds: number;
  readonly diveDurationSeconds: number;
  readonly returnDurationSeconds: number;
  readonly saveRadiusMeters: number;
  readonly contactRestitution: number;
  readonly minimumReadSeconds: number;
  readonly maximumReadSeconds: number;
  readonly minimumCueConfidence: number;
  readonly minimumCueAgreementDot: number;
  readonly minimumStableCueSamples: number;
  readonly horizontalCommitThreshold: number;
  readonly verticalCommitThreshold: number;
  readonly maximumTendency: number;
}

export interface MatchConfig {
  readonly shotsPerRound: number;
}

