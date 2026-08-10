import type { QualityPreset } from "../core/Quality";
import type { GoalkeeperZone } from "../domain/goalkeeper/zones";
import type { ShotOutcome } from "../domain/shot/outcome";

export const CAPTURE_SCENE_NAMES = [
  "hero-ready",
  "hero-release",
  "hero-ball-flight",
  "hero-promo",
  "hero-goal",
  "hero-save-high",
  "hero-miss",
  "mobile-ready",
  "round-complete",
] as const;

export type CaptureSceneName = (typeof CAPTURE_SCENE_NAMES)[number];
export type CaptureSceneRequirement =
  | "READY"
  | "ACTIVE_SHOT"
  | "RESULT"
  | "ROUND_COMPLETE";

export interface CaptureSceneDefinition {
  readonly name: CaptureSceneName;
  readonly viewport: Readonly<{ width: number; height: number }>;
  readonly quality: QualityPreset;
  readonly seed: number;
  readonly requirement: CaptureSceneRequirement;
  readonly targetShotFrame: number | null;
  readonly expectedOutcome: ShotOutcome | null;
  readonly expectedKeeperZone: GoalkeeperZone | null;
}

const HERO_VIEWPORT = Object.freeze({ width: 1920, height: 1080 });
const CAPTURE_SCENE_DEFINITIONS: Readonly<
  Record<CaptureSceneName, CaptureSceneDefinition>
> = Object.freeze({
  "hero-ready": Object.freeze({
    name: "hero-ready",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 1,
    requirement: "READY",
    targetShotFrame: null,
    expectedOutcome: null,
    expectedKeeperZone: null,
  }),
  "hero-release": Object.freeze({
    name: "hero-release",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 1,
    requirement: "ACTIVE_SHOT",
    targetShotFrame: 8,
    expectedOutcome: null,
    expectedKeeperZone: null,
  }),
  "hero-ball-flight": Object.freeze({
    name: "hero-ball-flight",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 1,
    requirement: "ACTIVE_SHOT",
    targetShotFrame: 12,
    expectedOutcome: null,
    expectedKeeperZone: null,
  }),
  "hero-promo": Object.freeze({
    name: "hero-promo",
    viewport: HERO_VIEWPORT,
    quality: "capture",
    seed: 1,
    requirement: "ACTIVE_SHOT",
    targetShotFrame: 12,
    expectedOutcome: null,
    expectedKeeperZone: null,
  }),
  "hero-goal": Object.freeze({
    name: "hero-goal",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 1,
    requirement: "RESULT",
    targetShotFrame: null,
    expectedOutcome: "GOAL",
    expectedKeeperZone: null,
  }),
  "hero-save-high": Object.freeze({
    name: "hero-save-high",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 3,
    requirement: "RESULT",
    targetShotFrame: null,
    expectedOutcome: "SAVED",
    expectedKeeperZone: "high-center",
  }),
  "hero-miss": Object.freeze({
    name: "hero-miss",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 1,
    requirement: "RESULT",
    targetShotFrame: null,
    expectedOutcome: "MISS",
    expectedKeeperZone: null,
  }),
  "mobile-ready": Object.freeze({
    name: "mobile-ready",
    viewport: Object.freeze({ width: 844, height: 390 }),
    quality: "balanced",
    seed: 1,
    requirement: "READY",
    targetShotFrame: null,
    expectedOutcome: null,
    expectedKeeperZone: null,
  }),
  "round-complete": Object.freeze({
    name: "round-complete",
    viewport: HERO_VIEWPORT,
    quality: "balanced",
    seed: 1,
    requirement: "ROUND_COMPLETE",
    targetShotFrame: null,
    expectedOutcome: null,
    expectedKeeperZone: null,
  }),
});

export const CAPTURE_SCENES: readonly CaptureSceneDefinition[] = Object.freeze(
  CAPTURE_SCENE_NAMES.map((name) => CAPTURE_SCENE_DEFINITIONS[name]),
);

export function captureSceneDefinition(
  name: CaptureSceneName,
): CaptureSceneDefinition {
  return CAPTURE_SCENE_DEFINITIONS[name];
}
