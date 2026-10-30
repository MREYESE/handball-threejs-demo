import type { Vec2 } from "../math";

export interface Viewport {
  readonly widthPixels: number;
  readonly heightPixels: number;
}

export interface SafeArea {
  readonly xPixels: number;
  readonly yPixels: number;
  readonly widthPixels: number;
  readonly heightPixels: number;
}

export interface GestureSample {
  readonly positionPixels: Vec2;
  readonly timeSeconds: number;
}

export interface NormalizedGesturePoint {
  readonly positionPixels: Vec2;
  readonly safeAreaPosition01: Vec2;
  readonly timeSeconds: number;
}

export type GestureRejectionReason =
  | "INVALID_VIEWPORT"
  | "TOO_FEW_POINTS"
  | "INPUT_DISABLED"
  | "CAPTURE_ALREADY_ACTIVE"
  | "START_OUTSIDE_INPUT_ZONE"
  | "STARTED_OVER_BLOCKING_UI"
  | "INTERRUPTED"
  | "NON_FINITE_SAMPLE"
  | "NON_MONOTONIC_TIME"
  | "SAMPLE_GAP_TOO_LONG"
  | "DURATION_TOO_SHORT"
  | "DURATION_TOO_LONG"
  | "DISTANCE_TOO_SHORT";

export interface GestureCaptureOptions {
  readonly inputEnabled?: boolean;
  readonly captureAlreadyActive?: boolean;
  readonly startedOverBlockingUi?: boolean;
  readonly interrupted?: boolean;
  /** Only set after real lateral impulse/brake/reversal recognition. */
  readonly nonShootingFeint?: boolean;
  readonly safeArea?: SafeArea;
}

export interface RejectedGesture {
  readonly accepted: false;
  readonly reason: GestureRejectionReason;
}

export interface AcceptedGesture {
  readonly accepted: true;
  readonly points: readonly NormalizedGesturePoint[];
  readonly durationSeconds: number;
}

export type GesturePreprocessResult = RejectedGesture | AcceptedGesture;

export interface NormalizedAim {
  readonly horizontalAim: number;
  readonly verticalGesture01: number;
  readonly verticalAim: number;
}

export interface GesturePowerFeatures {
  readonly durationSeconds: number;
  readonly pathLengthSafeFraction: number;
  readonly maximumSpeedSafeFractionsPerSecond: number;
  readonly releaseSpeedSafeFractionsPerSecond: number;
  readonly releaseSpeedContribution: number;
  readonly maximumSpeedContribution: number;
  readonly pathLengthContribution: number;
  readonly usedTimingFallback: boolean;
}

export type ShotCategory = "DIRECT" | "LOB" | "BOUNCE";

export interface FeintAction {
  readonly type: "FEINT";
  /** Unit direction of the first apparent impulse, with positive Y pointing up. */
  readonly apparentDirection: Vec2;
  readonly recognizedAtSeconds: number;
  readonly initialImpulseSafeFraction: number;
  readonly brakeSafeFraction: number;
  readonly secondImpulseSafeFraction: number;
}

export interface StandardShotGesture {
  readonly category: ShotCategory;
  readonly feint: FeintAction | null;
  readonly aim: NormalizedAim;
  readonly power: number;
  readonly loft: number;
  readonly sideSpin: number;
  readonly topSpin: number;
  readonly bounceIntent: number;
  readonly features: GesturePowerFeatures;
  readonly rawPoints: readonly NormalizedGesturePoint[];
  readonly smoothedPoints: readonly Vec2[];
  readonly resampledPoints: readonly Vec2[];
}
