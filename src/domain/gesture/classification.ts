import type { GestureConfig } from "../../config/types";
import type { ShotCategory } from "./model";

export interface ShotCategoryFeatures {
  readonly loft: number;
  readonly bounceIntent: number;
}

function assertNormalizedFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be finite and within [0, 1].`);
  }
}

function assertClassificationThreshold(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    throw new RangeError(`${name} must be finite and within (0, 1).`);
  }
}

/**
 * Conservatively labels already-normalized continuous gesture features.
 * Threshold equality and competing signals intentionally remain DIRECT.
 */
export function classifyShotCategory(
  features: ShotCategoryFeatures,
  config: GestureConfig,
): ShotCategory {
  assertNormalizedFinite(features.loft, "Shot-category loft");
  assertNormalizedFinite(features.bounceIntent, "Shot-category bounce intent");
  assertClassificationThreshold(
    config.lobCategoryMinimumLoft,
    "LOB category threshold",
  );
  assertClassificationThreshold(
    config.bounceCategoryMinimumIntent,
    "BOUNCE category threshold",
  );

  const isLob = features.loft > config.lobCategoryMinimumLoft;
  const isBounce =
    features.bounceIntent > config.bounceCategoryMinimumIntent;

  if (isLob === isBounce) {
    return "DIRECT";
  }
  return isLob ? "LOB" : "BOUNCE";
}
