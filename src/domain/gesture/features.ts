import type { GestureConfig } from "../../config/types";
import { clamp, clamp01, distance2, type Vec2 } from "../math";
import type {
  GesturePowerFeatures,
  NormalizedAim,
  NormalizedGesturePoint,
  StandardShotGesture,
  Viewport,
} from "./model";
import { resampleGesturePath, smoothGesturePath } from "./preprocess";

const TIME_EPSILON_SECONDS = 0.0001;

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

function rawSegmentSpeeds(points: readonly NormalizedGesturePoint[]): readonly number[] {
  const speeds: number[] = [];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (previous === undefined || current === undefined) {
      continue;
    }
    const duration = current.timeSeconds - previous.timeSeconds;
    if (duration > TIME_EPSILON_SECONDS) {
      speeds.push(
        distance2(previous.safeAreaPosition01, current.safeAreaPosition01) / duration,
      );
    }
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

export function analyzeStandardGesture(
  rawPoints: readonly NormalizedGesturePoint[],
  viewport: Viewport,
  config: GestureConfig,
): StandardShotGesture {
  const first = rawPoints[0];
  const last = rawPoints[rawPoints.length - 1];
  if (first === undefined || last === undefined) {
    throw new Error("At least two preprocessed gesture points are required.");
  }
  const safePoints = rawPoints.map((point) => point.safeAreaPosition01);
  const smoothedPoints = smoothGesturePath(safePoints, config.smoothingWindow);
  const resampledPoints = resampleGesturePath(smoothedPoints, config.resamplePointCount);
  const features = calculatePowerFeatures(rawPoints, resampledPoints, config);
  const aim = normalizeAim(
    {
      dx: last.positionPixels.x - first.positionPixels.x,
      dyUp: first.positionPixels.y - last.positionPixels.y,
    },
    viewport,
    config,
  );
  return Object.freeze({
    aim,
    power: calculateWeightedPower(features, config),
    features,
    rawPoints,
    smoothedPoints,
    resampledPoints,
  });
}
