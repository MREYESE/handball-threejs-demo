import { verticalTurn } from "./verticalTurn";
import type { GestureConfig } from "../../config/types";
import { clamp, clamp01, distance2, lerp, type Vec2 } from "../math";
import type {
  GesturePowerFeatures,
  FeintAction,
  NormalizedAim,
  NormalizedGesturePoint,
  StandardShotGesture,
  Viewport,
} from "./model";
import { classifyShotCategory } from "./classification";
import { resampleGesturePath, smoothGesturePath } from "./preprocess";

const TIME_EPSILON_SECONDS = 0.0001;
// Matches the normalized path tolerance used during preprocessing and absorbs
// sub-pixel PointerEvent coordinate quantization without masking real curvature.
const GEOMETRY_NOISE_EPSILON_SAFE_FRACTION = 1e-6;
// Half a CSS pixel is about 0.001 safe-area units on the shortest supported
// browser viewport. Top-spin ignores that scale of PointerEvent quantization.
const TOP_SPIN_BROWSER_NOISE_SAFE_FRACTION = 0.0011;

function pathLength(points: readonly Vec2[]): number {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (previous !== undefined && current !== undefined) {
      length += distance2(previous, current);
    }
  }
  return length;
}

/** Fixed temporal bins measure real time intervals, independent of event count.
 * Interpolation estimates motion between retained hardware samples; it does not
 * change their timestamps or populate the recorded pointer history.
 */
function rawSegmentSpeeds(points: readonly NormalizedGesturePoint[]): readonly number[] {
  const first = points[0], last = points.at(-1);
  if (!first || !last) return [];
  const duration = last.timeSeconds - first.timeSeconds;
  if (duration <= TIME_EPSILON_SECONDS) return [];
  const bins = 32;
  const dt = duration / bins;
  const atTime = (time: number): Vec2 => {
    let i = 1;
    while (i < points.length - 1 && points[i]!.timeSeconds < time) i++;
    const a = points[i - 1]!, b = points[i]!;
    const span = b.timeSeconds - a.timeSeconds;
    const t = span <= TIME_EPSILON_SECONDS ? 1 : clamp01((time - a.timeSeconds) / span);
    return { x: lerp(a.safeAreaPosition01.x, b.safeAreaPosition01.x, t),
      y: lerp(a.safeAreaPosition01.y, b.safeAreaPosition01.y, t) };
  };
  const speeds: number[] = [];
  let previous = first.safeAreaPosition01;
  for (let i = 1; i <= bins; i++) {
    const current = atTime(first.timeSeconds + dt * i);
    speeds.push(distance2(previous, current) / dt);
    previous = current;
  }
  return speeds;
}

function median(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) {
    return sorted[middle] ?? 0;
  }
  return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
}

export function normalizeAim(
  deltaPixels: Readonly<{ dx: number; dyUp: number }>,
  viewport: Viewport,
  config: GestureConfig,
): NormalizedAim {
  const horizontalDenominator = Math.max(
    1,
    viewport.widthPixels * config.horizontalFullRangeViewportFraction,
  );
  const verticalDenominator = Math.max(
    1,
    viewport.heightPixels * config.verticalFullRangeViewportFraction,
  );
  const horizontalAim = clamp(deltaPixels.dx / horizontalDenominator, -1, 1);
  const verticalGesture01 = clamp01(deltaPixels.dyUp / verticalDenominator);
  return Object.freeze({
    horizontalAim,
    verticalGesture01,
    verticalAim: verticalGesture01 * 2 - 1,
  });
}

export function calculatePowerFeatures(
  rawPoints: readonly NormalizedGesturePoint[],
  resampledPoints: readonly Vec2[],
  config: GestureConfig,
): GesturePowerFeatures {
  const durationSeconds =
    (rawPoints[rawPoints.length - 1]?.timeSeconds ?? 0) -
    (rawPoints[0]?.timeSeconds ?? 0);
  const speeds = rawSegmentSpeeds(rawPoints);
  const maximumSpeed = speeds.length > 0 ? Math.max(...speeds) : 0;
  const releaseSpeeds = speeds.slice(-Math.max(1, config.releaseSpeedSampleCount));
  const releaseSpeed = median(releaseSpeeds);
  const processedPathLength = pathLength(resampledPoints);
  const releaseSpeedContribution = clamp01(
    releaseSpeed / config.releaseSpeedFullPowerSafeFractionsPerSecond,
  );
  const maximumSpeedContribution = clamp01(
    maximumSpeed / config.maximumSpeedFullPowerSafeFractionsPerSecond,
  );
  const pathLengthContribution = clamp01(
    processedPathLength / config.pathLengthFullPowerSafeFraction,
  );

  return Object.freeze({
    durationSeconds,
    pathLengthSafeFraction: processedPathLength,
    maximumSpeedSafeFractionsPerSecond: maximumSpeed,
    releaseSpeedSafeFractionsPerSecond: releaseSpeed,
    releaseSpeedContribution,
    maximumSpeedContribution,
    pathLengthContribution,
    usedTimingFallback:
      durationSeconds <= TIME_EPSILON_SECONDS ||
      maximumSpeed <= 0 ||
      releaseSpeed <= 0,
  });
}

export function calculateWeightedPower(
  features: GesturePowerFeatures,
  config: GestureConfig,
): number {
  const totalWeight =
    config.releaseSpeedWeight + config.maximumSpeedWeight + config.pathLengthWeight;
  if (features.usedTimingFallback || totalWeight <= TIME_EPSILON_SECONDS) {
    return features.pathLengthContribution;
  }
  return clamp01(
    (features.releaseSpeedContribution * config.releaseSpeedWeight +
      features.maximumSpeedContribution * config.maximumSpeedWeight +
      features.pathLengthContribution * config.pathLengthWeight) /
      totalWeight,
  );
}

/**
 * Measures how far the accepted path bows upward near its start-to-end chord.
 * Screen-space Y grows downward, so a point above the chord has positive loft.
 * Large lateral detours remain available to power and later gesture grammar;
 * they do not accidentally become loft.
 */
export function calculateGestureLoft(
  points: readonly Vec2[],
  config: GestureConfig,
): number {
  if (
    !Number.isFinite(config.loftFullRangeSafeFraction) ||
    config.loftFullRangeSafeFraction <= 0 ||
    !Number.isFinite(config.loftMaximumHorizontalDeviationSafeFraction) ||
    config.loftMaximumHorizontalDeviationSafeFraction <= 0
  ) {
    throw new RangeError("Gesture loft range must be a positive finite number.");
  }
  if (points.length < 2) {
    throw new RangeError("Gesture loft requires at least two trace points.");
  }
  if (
    points.some(
      (point) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
    )
  ) {
    throw new RangeError("Gesture loft points must contain only finite values.");
  }

  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) {
    throw new RangeError("Gesture loft requires finite endpoints.");
  }

  let maximumUpwardDeviation = 0;
  const segmentLengths: number[] = [];
  let totalPathLength = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    if (previous === undefined || point === undefined) {
      continue;
    }
    const segmentLength = distance2(previous, point);
    segmentLengths.push(segmentLength);
    totalPathLength += segmentLength;
  }
  if (totalPathLength <= Number.EPSILON) {
    return 0;
  }

  let traversedPathLength = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    if (point === undefined) {
      continue;
    }
    traversedPathLength += segmentLengths[index - 1] ?? 0;
    const chordProgress = traversedPathLength / totalPathLength;
    const chordX = lerp(first.x, last.x, chordProgress);
    if (
      Math.abs(point.x - chordX) >
      config.loftMaximumHorizontalDeviationSafeFraction
    ) {
      continue;
    }
    const chordY = lerp(first.y, last.y, chordProgress);
    maximumUpwardDeviation = Math.max(
      maximumUpwardDeviation,
      chordY - point.y,
    );
  }
  return clamp01(maximumUpwardDeviation / config.loftFullRangeSafeFraction);
}

/**
 * Measures the strongest signed horizontal bow away from the start-to-release
 * chord. Endpoints remain authoritative for aim; intermediate path geometry
 * alone controls side-spin.
 */
export function calculateGestureSideSpin(
  points: readonly Vec2[],
  config: GestureConfig,
): number {
  if (
    !Number.isFinite(config.sideSpinFullRangeSafeFraction) ||
    config.sideSpinFullRangeSafeFraction <= 0
  ) {
    throw new RangeError("Gesture side-spin range must be a positive finite number.");
  }
  if (points.length < 2) {
    throw new RangeError("Gesture side-spin requires at least two trace points.");
  }
  if (
    points.some(
      (point) => !Number.isFinite(point.x) || !Number.isFinite(point.y),
    )
  ) {
    throw new RangeError("Gesture side-spin points must contain only finite values.");
  }

  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) {
    throw new RangeError("Gesture side-spin requires finite endpoints.");
  }

  const segmentLengths: number[] = [];
  let totalPathLength = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    if (previous === undefined || point === undefined) {
      continue;
    }
    const segmentLength = distance2(previous, point);
    segmentLengths.push(segmentLength);
    totalPathLength += segmentLength;
  }
  if (totalPathLength <= Number.EPSILON) {
    return 0;
  }

  let traversedPathLength = 0;
  let strongestSignedDeviation = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    if (point === undefined) {
      continue;
    }
    traversedPathLength += segmentLengths[index - 1] ?? 0;
    const chordProgress = traversedPathLength / totalPathLength;
    const chordX = lerp(first.x, last.x, chordProgress);
    const signedDeviation = point.x - chordX;
    if (Math.abs(signedDeviation) > Math.abs(strongestSignedDeviation)) {
      strongestSignedDeviation = signedDeviation;
    }
  }
  if (
    Math.abs(strongestSignedDeviation) <=
    GEOMETRY_NOISE_EPSILON_SAFE_FRACTION
  ) {
    return 0;
  }
  const resolvedDeviation =
    Math.sign(strongestSignedDeviation) *
    (Math.abs(strongestSignedDeviation) -
      GEOMETRY_NOISE_EPSILON_SAFE_FRACTION);
  return clamp(
    resolvedDeviation / config.sideSpinFullRangeSafeFraction,
    -1,
    1,
  );
}

/**
 * Measures downward bow away from the path-normalized start-to-release chord.
 * Screen-space Y grows downward, so only positive vertical deviation contributes
 * top-spin. Endpoint aim remains authoritative and event timing cannot change
 * the resolved spin. Browser-scale coordinate noise remains neutral.
 */
export function calculateGestureTopSpin(
  points: readonly NormalizedGesturePoint[],
  config: GestureConfig,
): number {
  if (
    !Number.isFinite(config.topSpinFullRangeSafeFraction) ||
    config.topSpinFullRangeSafeFraction <= 0 ||
    !Number.isFinite(config.topSpinMaximumHorizontalDeviationSafeFraction) ||
    config.topSpinMaximumHorizontalDeviationSafeFraction <= 0
  ) {
    throw new RangeError("Gesture top-spin range must be a positive finite number.");
  }
  if (points.length < 2) {
    throw new RangeError("Gesture top-spin requires at least two trace points.");
  }
  if (
    points.some(
      (point) =>
        !Number.isFinite(point.safeAreaPosition01.x) ||
        !Number.isFinite(point.safeAreaPosition01.y) ||
        !Number.isFinite(point.timeSeconds),
    )
  ) {
    throw new RangeError("Gesture top-spin points must contain only finite values.");
  }

  const first = points[0];
  const last = points[points.length - 1];
  if (first === undefined || last === undefined) {
    throw new RangeError("Gesture top-spin requires finite endpoints.");
  }

  const segmentLengths: number[] = [];
  let totalPathLength = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const point = points[index];
    if (previous === undefined || point === undefined) {
      continue;
    }
    const segmentLength = distance2(
      previous.safeAreaPosition01,
      point.safeAreaPosition01,
    );
    segmentLengths.push(segmentLength);
    totalPathLength += segmentLength;
  }
  if (totalPathLength <= Number.EPSILON) {
    return 0;
  }
  let maximumDownwardDeviation = 0;
  let traversedPathLength = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const point = points[index];
    if (point === undefined) {
      continue;
    }
    traversedPathLength += segmentLengths[index - 1] ?? 0;
    const chordProgress = traversedPathLength / totalPathLength;
    const chordX = lerp(
      first.safeAreaPosition01.x,
      last.safeAreaPosition01.x,
      chordProgress,
    );
    if (
      Math.abs(point.safeAreaPosition01.x - chordX) >
      config.topSpinMaximumHorizontalDeviationSafeFraction
    ) {
      continue;
    }
    const chordY = lerp(
      first.safeAreaPosition01.y,
      last.safeAreaPosition01.y,
      chordProgress,
    );
    maximumDownwardDeviation = Math.max(
      maximumDownwardDeviation,
      point.safeAreaPosition01.y - chordY,
    );
  }
  if (maximumDownwardDeviation <= TOP_SPIN_BROWSER_NOISE_SAFE_FRACTION) {
    return 0;
  }
  return clamp01(
    (maximumDownwardDeviation - TOP_SPIN_BROWSER_NOISE_SAFE_FRACTION) /
      config.topSpinFullRangeSafeFraction,
  );
}

/**
 * Historical endpoint diagnostic, retained for trace/config compatibility.
 * The v3 analyzer deliberately never calls this helper.
 * Maps the accepted endpoint's continuous upward displacement to bounce intent.
 * Lower releases produce more intent while the endpoint remains the sole aim
 * authority. This is deliberately not a shot-category classifier.
 */
export function calculateGestureBounceIntent(
  verticalGesture01: number,
  config: GestureConfig,
): number {
  if (!Number.isFinite(verticalGesture01)) {
    throw new RangeError("Gesture bounce vertical intent must be finite.");
  }
  if (
    !Number.isFinite(config.bounceZeroIntentVerticalGesture01) ||
    config.bounceZeroIntentVerticalGesture01 <= 0 ||
    config.bounceZeroIntentVerticalGesture01 > 1
  ) {
    throw new RangeError(
      "Gesture bounce zero-intent boundary must be finite and within (0, 1].",
    );
  }
  return clamp01(
    1 - verticalGesture01 / config.bounceZeroIntentVerticalGesture01,
  );
}

export function analyzeStandardGesture(
  rawPoints: readonly NormalizedGesturePoint[],
  viewport: Viewport,
  config: GestureConfig,
  feint: FeintAction | null = null,
): StandardShotGesture {
  const first = rawPoints[0];
  const last = rawPoints[rawPoints.length - 1];
  if (first === undefined || last === undefined) {
    throw new Error("At least two preprocessed gesture points are required.");
  }
  const safePoints = rawPoints.map((point) => point.safeAreaPosition01);
  const smoothedPoints = smoothGesturePath(safePoints, config.smoothingWindow);
  const resampledPoints = resampleGesturePath(smoothedPoints, config.resamplePointCount);
  const features = calculatePowerFeatures(rawPoints, safePoints, config);
  const aim = normalizeAim(
    {
      dx: last.positionPixels.x - first.positionPixels.x,
      dyUp: first.positionPixels.y - last.positionPixels.y,
    },
    viewport,
    config,
  );
  // Identity requires a genuine vertical turn, never just chord curvature or
  // a low endpoint. Horizontal endpoint remains independent target aim.
  const { hook, vee, descent } = verticalTurn(safePoints);
  const loft = hook ? calculateGestureLoft(safePoints, config) : 0;
  const bounceIntent = vee ? clamp01(0.65 + descent * 1.4) : 0;
  return Object.freeze({
    category: classifyShotCategory({ loft, bounceIntent }, config),
    feint,
    aim,
    // Stable at sub-picounit precision under mirrored interpolation.
    power: Math.round(calculateWeightedPower(features, config) * 1e12) / 1e12,
    loft,
    sideSpin: hook || vee ? 0 : calculateGestureSideSpin(safePoints, config),
    topSpin: vee ? Math.min(0.25, descent) : calculateGestureTopSpin(rawPoints, config),
    bounceIntent,
    features,
    rawPoints,
    smoothedPoints,
    resampledPoints,
  });
}

