import { verticalTurn } from "./verticalTurn";
import type { GestureConfig } from "../../config/types";
import { distance2, lerp, type Vec2 } from "../math";
import type {
  GestureCaptureOptions,
  GesturePreprocessResult,
  GestureRejectionReason,
  GestureSample,
  NormalizedGesturePoint,
  SafeArea,
  Viewport,
} from "./model";

const PATH_EPSILON = 1e-6;

function reject(reason: GestureRejectionReason): GesturePreprocessResult {
  return Object.freeze({ accepted: false, reason });
}

function resolveSafeArea(viewport: Viewport, safeArea?: SafeArea): SafeArea {
  return (
    safeArea ?? {
      xPixels: 0,
      yPixels: 0,
      widthPixels: viewport.widthPixels,
      heightPixels: viewport.heightPixels,
    }
  );
}

function normalizePoint(sample: GestureSample, safeArea: SafeArea, startTime: number): NormalizedGesturePoint {
  return Object.freeze({
    positionPixels: Object.freeze({ ...sample.positionPixels }),
    safeAreaPosition01: Object.freeze({
      x: (sample.positionPixels.x - safeArea.xPixels) / safeArea.widthPixels,
      y: (sample.positionPixels.y - safeArea.yPixels) / safeArea.heightPixels,
    }),
    timeSeconds: sample.timeSeconds - startTime,
  });
}

export function preprocessGesture(
  samples: readonly GestureSample[],
  viewport: Viewport,
  config: GestureConfig,
  options: GestureCaptureOptions = {},
): GesturePreprocessResult {
  const safeArea = resolveSafeArea(viewport, options.safeArea);
  if (
    !Number.isFinite(viewport.widthPixels) ||
    !Number.isFinite(viewport.heightPixels) ||
    viewport.widthPixels <= 0 ||
    viewport.heightPixels <= 0 ||
    !Number.isFinite(safeArea.widthPixels) ||
    !Number.isFinite(safeArea.heightPixels) ||
    safeArea.widthPixels <= 0 ||
    safeArea.heightPixels <= 0
  ) {
    return reject("INVALID_VIEWPORT");
  }
  if (samples.length < 2) {
    return reject("TOO_FEW_POINTS");
  }
  if (
    samples.some(
      (sample) =>
        !Number.isFinite(sample.positionPixels.x) ||
        !Number.isFinite(sample.positionPixels.y) ||
        !Number.isFinite(sample.timeSeconds),
    )
  ) {
    return reject("NON_FINITE_SAMPLE");
  }
  if (options.inputEnabled === false) {
    return reject("INPUT_DISABLED");
  }
  if (options.captureAlreadyActive === true) {
    return reject("CAPTURE_ALREADY_ACTIVE");
  }
  if (options.startedOverBlockingUi === true) {
    return reject("STARTED_OVER_BLOCKING_UI");
  }
  if (options.interrupted === true) {
    return reject("INTERRUPTED");
  }

  const first = samples[0];
  const last = samples[samples.length - 1];
  if (first === undefined || last === undefined) {
    return reject("TOO_FEW_POINTS");
  }

  const normalizedStart = normalizePoint(first, safeArea, first.timeSeconds);
  if (
    normalizedStart.safeAreaPosition01.x < 0 ||
    normalizedStart.safeAreaPosition01.x > 1 ||
    normalizedStart.safeAreaPosition01.y < 1 - config.startZoneFraction ||
    normalizedStart.safeAreaPosition01.y > 1
  ) {
    return reject("START_OUTSIDE_INPUT_ZONE");
  }

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    if (previous === undefined || current === undefined) {
      return reject("TOO_FEW_POINTS");
    }
    const gap = current.timeSeconds - previous.timeSeconds;
    if (!Number.isFinite(gap) || gap < 0) {
      return reject("NON_MONOTONIC_TIME");
    }
    if (gap > config.maximumSampleGapSeconds) {
      return reject("SAMPLE_GAP_TOO_LONG");
    }
  }

  const durationSeconds = last.timeSeconds - first.timeSeconds;
  if (durationSeconds < config.minimumDurationSeconds) {
    return reject("DURATION_TOO_SHORT");
  }
  if (durationSeconds > config.maximumDurationSeconds) {
    return reject("DURATION_TOO_LONG");
  }
  const points = samples.map((sample) => normalizePoint(sample, safeArea, first.timeSeconds));
  if (!options.nonShootingFeint && distance2(first.positionPixels, last.positionPixels) < config.minimumDistancePixels) {
    const turn = verticalTurn(points.map(point => point.safeAreaPosition01));
    let pathPixels = 0;
    for (let i=1;i<samples.length;i++) pathPixels += distance2(samples[i-1]!.positionPixels,samples[i]!.positionPixels);
    if ((!turn.vee && !turn.hook) || pathPixels < config.minimumDistancePixels) return reject("DISTANCE_TOO_SHORT");
  }

  return Object.freeze({
    accepted: true,
    points: Object.freeze(points),
    durationSeconds,
  });
}

export function isIntermediateSampleFarEnough(
  previousPositionPixels: Vec2,
  candidatePositionPixels: Vec2,
  safeArea: SafeArea,
  config: GestureConfig,
): boolean {
  if (safeArea.widthPixels <= 0 || safeArea.heightPixels <= 0) {
    return false;
  }
  const normalizedPrevious = {
    x: (previousPositionPixels.x - safeArea.xPixels) / safeArea.widthPixels,
    y: (previousPositionPixels.y - safeArea.yPixels) / safeArea.heightPixels,
  };
  const normalizedCandidate = {
    x: (candidatePositionPixels.x - safeArea.xPixels) / safeArea.widthPixels,
    y: (candidatePositionPixels.y - safeArea.yPixels) / safeArea.heightPixels,
  };
  return (
    distance2(normalizedPrevious, normalizedCandidate) + Number.EPSILON * 8 >=
    config.minimumIntermediateDistanceSafeFraction
  );
}

export function smoothGesturePath(
  points: readonly Vec2[],
  window: number,
): readonly Vec2[] {
  if (points.length < 2 || window <= 1) {
    return Object.freeze(points.map((point) => Object.freeze({ ...point })));
  }

  const radius = Math.max(1, Math.floor(window / 2));
  const smoothed = points.map((point, index) => {
    if (index === 0 || index === points.length - 1) {
      return Object.freeze({ ...point });
    }

    let x = 0;
    let y = 0;
    let count = 0;
    const start = Math.max(0, index - radius);
    const end = Math.min(points.length - 1, index + radius);
    for (let sampleIndex = start; sampleIndex <= end; sampleIndex += 1) {
      const sample = points[sampleIndex];
      if (sample !== undefined) {
        x += sample.x;
        y += sample.y;
        count += 1;
      }
    }
    return Object.freeze({ x: x / count, y: y / count });
  });
  return Object.freeze(smoothed);
}

export function resampleGesturePath(
  points: readonly Vec2[],
  targetCount: number,
): readonly Vec2[] {
  if (!Number.isInteger(targetCount) || targetCount < 2) {
    throw new RangeError("Gesture resample count must be an integer of at least two.");
  }
  if (points.length === 0) {
    return Object.freeze(
      Array.from({ length: targetCount }, () => Object.freeze({ x: 0, y: 0 })),
    );
  }
  const first = points[0];
  if (first === undefined) {
    return Object.freeze([]);
  }
  if (points.length === 1) {
    return Object.freeze(
      Array.from({ length: targetCount }, () => Object.freeze({ ...first })),
    );
  }

  const cumulative = new Array<number>(points.length).fill(0);
  let totalLength = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (previous !== undefined && current !== undefined) {
      totalLength += distance2(previous, current);
      cumulative[index] = totalLength;
    }
  }

  const last = points[points.length - 1] ?? first;
  if (totalLength <= PATH_EPSILON) {
    return Object.freeze(
      Array.from({ length: targetCount }, (_, index) =>
        Object.freeze({ ...(index === targetCount - 1 ? last : first) }),
      ),
    );
  }

  const result: Vec2[] = [Object.freeze({ ...first })];
  let segment = 1;
  for (let index = 1; index < targetCount - 1; index += 1) {
    const targetDistance = (totalLength * index) / (targetCount - 1);
    while (
      segment < cumulative.length - 1 &&
      (cumulative[segment] ?? 0) < targetDistance
    ) {
      segment += 1;
    }
    const from = points[segment - 1] ?? first;
    const to = points[segment] ?? last;
    const previousDistance = cumulative[segment - 1] ?? 0;
    const nextDistance = cumulative[segment] ?? totalLength;
    const span = nextDistance - previousDistance;
    const amount = span <= PATH_EPSILON ? 0 : (targetDistance - previousDistance) / span;
    result.push(
      Object.freeze({
        x: lerp(from.x, to.x, amount),
        y: lerp(from.y, to.y, amount),
      }),
    );
  }
  result.push(Object.freeze({ ...last }));
  return Object.freeze(result);
}
