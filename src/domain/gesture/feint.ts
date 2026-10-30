import type { GestureConfig } from "../../config/types";
import type { FeintAction, NormalizedGesturePoint } from "./model";

const DIRECTION_EPSILON = 1e-9;
const THRESHOLD_EPSILON = 1e-9;

interface Direction {
  readonly x: number;
  readonly y: number;
  readonly length: number;
}

function directionBetween(
  from: NormalizedGesturePoint,
  to: NormalizedGesturePoint,
): Direction {
  const x = to.safeAreaPosition01.x - from.safeAreaPosition01.x;
  const y = from.safeAreaPosition01.y - to.safeAreaPosition01.y;
  return { x, y, length: Math.hypot(x, y) };
}

function projection(direction: Direction, unitX: number, unitY: number): number {
  return direction.x * unitX + direction.y * unitY;
}

export function validateFeintConfig(config: GestureConfig): void {
  const positiveFractions = [
    ["initial impulse", config.feintMinimumInitialImpulseSafeFraction],
    ["brake", config.feintMinimumBrakeSafeFraction],
    ["second impulse", config.feintMinimumSecondImpulseSafeFraction],
  ] as const;
  for (const [name, value] of positiveFractions) {
    if (!Number.isFinite(value) || value <= 0 || value > 1) {
      throw new RangeError(
        `FEINT ${name} threshold must be finite and within (0, 1].`,
      );
    }
  }
  if (
    !Number.isFinite(config.feintMinimumInitialHorizontalRatio) ||
    config.feintMinimumInitialHorizontalRatio <= 0 ||
    config.feintMinimumInitialHorizontalRatio > 1
  ) {
    throw new RangeError(
      "FEINT initial horizontal ratio must be finite and within (0, 1].",
    );
  }
  if (
    !Number.isFinite(config.feintMaximumBrakeSpeedRatio) ||
    config.feintMaximumBrakeSpeedRatio < 0 ||
    config.feintMaximumBrakeSpeedRatio >= 1
  ) {
    throw new RangeError(
      "FEINT brake speed ratio must be finite and within [0, 1).",
    );
  }
  for (const [name, value] of [
    ["reversal direction", config.feintMaximumReversalDirectionDot],
    ["second impulse direction", config.feintMaximumSecondImpulseDirectionDot],
  ] as const) {
    if (!Number.isFinite(value) || value < -1 || value >= 0) {
      throw new RangeError(
        `FEINT ${name} dot threshold must be finite and within [-1, 0).`,
      );
    }
  }
  if (
    !Number.isFinite(config.feintMaximumPrefixDurationSeconds) ||
    config.feintMaximumPrefixDurationSeconds <= 0 ||
    config.feintMaximumPrefixDurationSeconds > config.maximumDurationSeconds
  ) {
    throw new RangeError(
      "FEINT prefix duration must be finite, positive, and no longer than the gesture duration.",
    );
  }
}

/**
 * Recognizes a deliberately conservative lateral fake. The trace must contain
 * an initial lateral impulse, a real slow-down or reversal, and a later impulse
 * opposed to the apparent direction. Equality at every boundary is rejected.
 */
export function recognizeFeintPrefix(
  points: readonly NormalizedGesturePoint[],
  config: GestureConfig,
): FeintAction | null {
  validateFeintConfig(config);
  if (points.length < 4) {
    return null;
  }
  if (
    points.some(
      (point) =>
        !Number.isFinite(point.safeAreaPosition01.x) ||
        !Number.isFinite(point.safeAreaPosition01.y) ||
        !Number.isFinite(point.timeSeconds),
    )
  ) {
    throw new RangeError("FEINT points must contain only finite values.");
  }

  const start = points[0];
  if (start === undefined) {
    return null;
  }

  const firstMotion = points.find((point) => directionBetween(start, point).length > 0.035);
  if (firstMotion !== undefined) {
    const motion = directionBetween(start, firstMotion);
    if (Math.abs(motion.x) / motion.length <= config.feintMinimumInitialHorizontalRatio) return null;
  }

  for (
    let impulseIndex = 1;
    impulseIndex < points.length - 2;
    impulseIndex += 1
  ) {
    const impulsePoint = points[impulseIndex];
    if (impulsePoint === undefined) {
      continue;
    }
    const initial = directionBetween(start, impulsePoint);
    if (
      initial.length <=
        config.feintMinimumInitialImpulseSafeFraction + THRESHOLD_EPSILON ||
      Math.abs(initial.x) / initial.length <=
        config.feintMinimumInitialHorizontalRatio + THRESHOLD_EPSILON
    ) {
      continue;
    }
    const initialDuration = impulsePoint.timeSeconds - start.timeSeconds;
    if (initialDuration <= 0) {
      continue;
    }
    const unitX = initial.x / initial.length;
    const unitY = initial.y / initial.length;
    const initialSpeed = initial.length / initialDuration;
    let maximumProgress = initial.length;

    for (
      let brakeIndex = impulseIndex + 1;
      brakeIndex < points.length - 1;
      brakeIndex += 1
    ) {
      const previous = points[brakeIndex - 1];
      const brakePoint = points[brakeIndex];
      if (previous === undefined || brakePoint === undefined) {
        continue;
      }
      const fromStart = directionBetween(start, brakePoint);
      const progress = projection(fromStart, unitX, unitY);
      maximumProgress = Math.max(maximumProgress, progress);
      const retraced = maximumProgress - progress;
      const segment = directionBetween(previous, brakePoint);
      const segmentDuration = brakePoint.timeSeconds - previous.timeSeconds;
      if (segmentDuration <= 0) {
        continue;
      }
      const segmentSpeed = segment.length / segmentDuration;
      const segmentDot =
        segment.length <= DIRECTION_EPSILON
          ? 1
          : projection(segment, unitX, unitY) / segment.length;
      const genuinelyReversed =
        retraced > config.feintMinimumBrakeSafeFraction + THRESHOLD_EPSILON &&
        segmentDot <
          config.feintMaximumReversalDirectionDot - THRESHOLD_EPSILON;
      const genuinelyBraked =
        segmentSpeed <
        initialSpeed * config.feintMaximumBrakeSpeedRatio -
          THRESHOLD_EPSILON;
      if (!genuinelyReversed && !genuinelyBraked) {
        continue;
      }

      for (
        let secondIndex = brakeIndex + 1;
        secondIndex < points.length;
        secondIndex += 1
      ) {
        const secondPoint = points[secondIndex];
        if (secondPoint === undefined) {
          continue;
        }
        const recognizedAtSeconds = secondPoint.timeSeconds - start.timeSeconds;
        if (
          recognizedAtSeconds <= 0 ||
          recognizedAtSeconds >=
            config.feintMaximumPrefixDurationSeconds - THRESHOLD_EPSILON
        ) {
          continue;
        }
        const second = directionBetween(brakePoint, secondPoint);
        if (
          second.length <=
          config.feintMinimumSecondImpulseSafeFraction + THRESHOLD_EPSILON
        ) {
          continue;
        }
        const secondDirectionDot =
          projection(second, unitX, unitY) / second.length;
        if (
          secondDirectionDot >=
          config.feintMaximumSecondImpulseDirectionDot - THRESHOLD_EPSILON
        ) {
          continue;
        }
        // A sampled two-leg rising ROSCA bow has one continuous return.
        // Without a measured slowdown, require a distinct braking/second cue,
        // rather than treating subdivisions of that same return as two impulses.
        if (genuinelyReversed && !genuinelyBraked && segment.length > DIRECTION_EPSILON) {
          const continuationDot = (segment.x * second.x + segment.y * second.y) /
            (segment.length * second.length);
          if (continuationDot > 0.95) continue;
        }
        return Object.freeze({
          type: "FEINT",
          apparentDirection: Object.freeze({ x: unitX, y: unitY }),
          recognizedAtSeconds,
          initialImpulseSafeFraction: initial.length,
          brakeSafeFraction: genuinelyReversed ? retraced : segment.length,
          secondImpulseSafeFraction: second.length,
        });
      }
    }
  }
  return null;
}

/** Whole-action fallback: a single substantial return or observed slow braking
 * can complete a fake without requiring the old third throwing impulse.
 * A stationary pointerup alone is never evidence of braking.
 */
export function recognizeFeintAction(
  points: readonly NormalizedGesturePoint[],
  config: GestureConfig,
): FeintAction | null {
  const prefix = recognizeFeintPrefix(points, config);
  if (prefix !== null || points.length < 3) return prefix;
  if (points.some(p => !Number.isFinite(p.safeAreaPosition01.x) ||
      !Number.isFinite(p.safeAreaPosition01.y) || !Number.isFinite(p.timeSeconds))) {
    throw new RangeError("FEINT points must contain only finite values.");
  }
  const start = points[0]!;
  const firstMotion = points.find(p => directionBetween(start, p).length > 0.035);
  if (!firstMotion) return null;
  const motion = directionBetween(start, firstMotion);
  if (Math.abs(motion.x) / motion.length <= config.feintMinimumInitialHorizontalRatio) return null;
  for (let i=1;i<points.length-1;i++) {
    const impulse = points[i]!;
    const initial = directionBetween(start, impulse);
    const dt = impulse.timeSeconds - start.timeSeconds;
    if (dt <= 0 || initial.length <= config.feintMinimumInitialImpulseSafeFraction + THRESHOLD_EPSILON ||
        Math.abs(initial.x)/initial.length <= config.feintMinimumInitialHorizontalRatio + THRESHOLD_EPSILON) continue;
    const ux=initial.x/initial.length, uy=initial.y/initial.length;
    for(let j=i+1;j<points.length;j++) {
      const end=points[j]!;
      const elapsed=end.timeSeconds-start.timeSeconds;
      if(elapsed >= config.feintMaximumPrefixDurationSeconds || elapsed <= 0) continue;
      const change=directionBetween(impulse,end);
      const dot=change.length===0?1:projection(change,ux,uy)/change.length;
      const retrace=-projection(change,ux,uy);
      // A monotonically rising bow is shooting/ROSCA ambiguity, not a
      // stand-alone two-leg fake. Require a flat/decreasing vertical return
      // or a near-closed action; genuine moving brakes remain separate proof.
      const lateralReturn = change.y <= 0.015 ||
        start.safeAreaPosition01.y - end.safeAreaPosition01.y <= 0.02;
      const reversed=lateralReturn && change.length > config.feintMinimumSecondImpulseSafeFraction + THRESHOLD_EPSILON &&
        retrace > config.feintMinimumBrakeSafeFraction + THRESHOLD_EPSILON &&
        dot < config.feintMaximumReversalDirectionDot - THRESHOLD_EPSILON;
      // Brake must be real moving data inside the action, not the release pause.
      const brakeDt=end.timeSeconds-impulse.timeSeconds;
      const braked=j<points.length-1 && brakeDt>=0.06 && change.length>0.006 &&
        projection(change,ux,uy)>0 && change.length/brakeDt < initial.length/dt*config.feintMaximumBrakeSpeedRatio;
      if (!reversed && !braked) continue;
      return Object.freeze({type:"FEINT",apparentDirection:Object.freeze({x:ux,y:uy}),
        recognizedAtSeconds:elapsed, initialImpulseSafeFraction:initial.length,
        brakeSafeFraction:reversed?retrace:change.length,secondImpulseSafeFraction:reversed?change.length:0});
    }
  }
  return null;
}
