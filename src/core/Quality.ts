export type QualityPreset = "balanced" | "high" | "capture";
export type QualityRuntimeRole =
  | "default_gameplay"
  | "explicit_opt_in_gameplay"
  | "offline_capture_only";
export type RuntimeMode = "gameplay" | "capture";

export interface QualityConfig {
  readonly name: QualityPreset;
  readonly runtimeRole: QualityRuntimeRole;
  readonly maximumPixelRatio: number;
  readonly shadowMapSize: number;
  readonly shadowMapSizeMaximum: number;
  readonly crowdInstances: number;
  readonly crowdInstancesMaximum: number;
  readonly animatedCrowdInstances: number;
  readonly animatedCrowdInstancesMaximum: number;
  readonly crowdAnimationMaximumHz: number;
  readonly proceduralTextureResolution: number;
  readonly proceduralTextureResolutionMaximum: number;
  readonly environmentMapSize: number;
  readonly environmentMapSizeMaximum: number;
  readonly shadowCastingLightsMaximum: number;
  readonly shadowCastingKeyLight: boolean;
  readonly antialias: boolean;
  readonly postProcessing: boolean;
  readonly postProcessingAllowed: boolean;
  readonly frustumCullingRequired: boolean;
}

const QUALITY_CONFIGS = {
  balanced: Object.freeze({
    name: "balanced",
    runtimeRole: "default_gameplay",
    maximumPixelRatio: 1.25,
    shadowMapSize: 512,
    shadowMapSizeMaximum: 1024,
    crowdInstances: 160,
    crowdInstancesMaximum: 240,
    animatedCrowdInstances: 0,
    animatedCrowdInstancesMaximum: 48,
    crowdAnimationMaximumHz: 0,
    proceduralTextureResolution: 96,
    proceduralTextureResolutionMaximum: 128,
    environmentMapSize: 32,
    environmentMapSizeMaximum: 96,
    shadowCastingLightsMaximum: 1,
    shadowCastingKeyLight: false,
    antialias: false,
    postProcessing: false,
    postProcessingAllowed: false,
    frustumCullingRequired: true,
  }),
  high: Object.freeze({
    name: "high",
    runtimeRole: "explicit_opt_in_gameplay",
    maximumPixelRatio: 1.5,
    shadowMapSize: 512,
    shadowMapSizeMaximum: 1024,
    crowdInstances: 256,
    crowdInstancesMaximum: 480,
    animatedCrowdInstances: 0,
    animatedCrowdInstancesMaximum: 96,
    crowdAnimationMaximumHz: 0,
    proceduralTextureResolution: 128,
    proceduralTextureResolutionMaximum: 192,
    environmentMapSize: 64,
    environmentMapSizeMaximum: 128,
    shadowCastingLightsMaximum: 1,
    shadowCastingKeyLight: false,
    antialias: false,
    postProcessing: false,
    postProcessingAllowed: false,
    frustumCullingRequired: true,
  }),
  capture: Object.freeze({
    name: "capture",
    runtimeRole: "offline_capture_only",
    maximumPixelRatio: 1,
    shadowMapSize: 1024,
    shadowMapSizeMaximum: 2048,
    crowdInstances: 480,
    crowdInstancesMaximum: 960,
    animatedCrowdInstances: 0,
    animatedCrowdInstancesMaximum: 0,
    crowdAnimationMaximumHz: 0,
    proceduralTextureResolution: 192,
    proceduralTextureResolutionMaximum: 256,
    environmentMapSize: 96,
    environmentMapSizeMaximum: 256,
    shadowCastingLightsMaximum: 1,
    shadowCastingKeyLight: true,
    antialias: true,
    postProcessing: false,
    postProcessingAllowed: true,
    frustumCullingRequired: true,
  }),
} as const satisfies Record<QualityPreset, QualityConfig>;

export function getQualityConfig(preset: QualityPreset): QualityConfig {
  return QUALITY_CONFIGS[preset];
}

export function resolveQualityPreset(
  queryValue: string | null,
  runtimeMode: RuntimeMode,
): QualityPreset {
  if (runtimeMode === "gameplay") {
    return queryValue === "high" ? "high" : "balanced";
  }

  if (
    queryValue === "balanced" ||
    queryValue === "medium" ||
    queryValue === "low"
  ) {
    return "balanced";
  }
  if (queryValue === "high") {
    return "high";
  }
  return "capture";
}
