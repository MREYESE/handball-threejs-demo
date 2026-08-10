import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import qualityPolicy from "../../config/quality-policy.json";
import {
  getQualityConfig,
  type QualityPreset,
} from "../../src/core/Quality";
import { PerformanceProbe } from "../../src/dev/PerformanceProbe";
import { LockedStaticLayerCache } from "../../src/presentation/cache/LockedStaticLayerCache";
import {
  CROWD_KIT_COLORS,
  ProceduralCrowd,
  createCrowdLayout,
} from "../../src/presentation/crowd/ProceduralCrowd";
import {
  PROCEDURAL_SURFACE_NAMES,
  type ProceduralSurfaceTextures,
} from "../../src/presentation/materials/ProceduralMaterials";

describe("procedural arena presentation", () => {
  it("declares every bounded code-generated PBR surface required by the arena", () => {
    expect(PROCEDURAL_SURFACE_NAMES).toEqual([
      "court",
      "painted-metal",
      "fabric",
      "skin",
      "hair",
      "rubber",
      "net",
      "wall-panel",
      "led-board",
    ]);
    expect(new Set(PROCEDURAL_SURFACE_NAMES).size).toBe(
      PROCEDURAL_SURFACE_NAMES.length,
    );
  });

  it("creates a deterministic varied crowd with explicit foreground and distant LODs", () => {
    const first = createCrowdLayout(720, 0x5eed_2005);
    const second = createCrowdLayout(720, 0x5eed_2005);

    expect(first).toEqual(second);
    expect(first).toHaveLength(720);
    expect(first.filter((member) => member.lod === "hero").length).toBeGreaterThan(
      180,
    );
    expect(
      first.filter((member) => member.lod === "distant").length,
    ).toBeGreaterThan(180);
    expect(
      first.filter((member) => member.hasScarf).length,
    ).toBeGreaterThan(70);
    expect(
      new Set(first.map((member) => member.kitColorIndex)).size,
    ).toBe(CROWD_KIT_COLORS.length);
    expect(
      new Set(first.map((member) => Math.round(member.pose * 10))).size,
    ).toBeGreaterThan(12);
    expect(
      new Set(
        first.map((member) => Math.round(member.animationPhase * 1_000)),
      ).size,
    ).toBeGreaterThan(600);
    expect(
      Math.max(...first.map((member) => member.heightScale)) -
        Math.min(...first.map((member) => member.heightScale)),
    ).toBeGreaterThan(0.3);
    expect(
      Math.max(...first.map((member) => member.widthScale)) -
        Math.min(...first.map((member) => member.widthScale)),
    ).toBeGreaterThan(0.25);
    expect(
      first
        .filter((member) => Math.abs(member.x) < 2.2)
        .every((member) => member.kitColorIndex !== 2),
    ).toBe(true);
  });

  it("matches every quality-policy hard limit and keeps selected load within it", () => {
    for (const preset of ["balanced", "high", "capture"] as const) {
      const config = getQualityConfig(preset);
      const policy = qualityPolicy.presets[preset];

      expect(config.maximumPixelRatio).toBe(policy.maximumPixelRatio);
      expect(config.shadowMapSizeMaximum).toBe(
        policy.shadowMapSizeMaximum,
      );
      expect(config.crowdInstancesMaximum).toBe(
        policy.crowdInstancesMaximum,
      );
      expect(config.animatedCrowdInstancesMaximum).toBe(
        policy.animatedCrowdInstancesMaximum,
      );
      expect(config.crowdAnimationMaximumHz).toBeLessThanOrEqual(
        policy.crowdAnimationMaximumHz,
      );
      expect(config.proceduralTextureResolutionMaximum).toBe(
        policy.proceduralTextureResolutionMaximum,
      );
      expect(config.environmentMapSizeMaximum).toBe(
        policy.environmentMapSizeMaximum,
      );
      expect(config.shadowCastingLightsMaximum).toBe(
        policy.shadowCastingLightsMaximum,
      );
      expect(config.postProcessingAllowed).toBe(policy.postProcessing);
      expect(config.frustumCullingRequired).toBe(
        policy.frustumCullingRequired,
      );
      expect(config.shadowMapSize).toBeLessThanOrEqual(
        config.shadowMapSizeMaximum,
      );
      expect(config.crowdInstances).toBeLessThanOrEqual(
        config.crowdInstancesMaximum,
      );
      expect(config.animatedCrowdInstances).toBeLessThanOrEqual(
        config.animatedCrowdInstancesMaximum,
      );
      expect(config.proceduralTextureResolution).toBeLessThanOrEqual(
        config.proceduralTextureResolutionMaximum,
      );
      expect(config.environmentMapSize).toBeLessThanOrEqual(
        config.environmentMapSizeMaximum,
      );
      expect(Number(config.shadowCastingKeyLight)).toBeLessThanOrEqual(
        config.shadowCastingLightsMaximum,
      );
    }
    expect(getQualityConfig("balanced").crowdInstances).toBeGreaterThanOrEqual(
      160,
    );
    expect(getQualityConfig("balanced").crowdInstances).toBeLessThanOrEqual(
      240,
    );
  });

  it("keeps distant rows static, bounds animated writes, rate-limits them, and uses culling bounds", () => {
    const surfaces = createTestSurfaces();
    const crowd = new ProceduralCrowd(
      {
        instanceCount: 160,
        animatedInstanceMaximum: 24,
        animationMaximumHz: 10,
        staticRenderLayer: 1,
        animatedRenderLayer: 0,
      },
      0x5eed_2005,
      surfaces.fabric,
      surfaces.skin,
    );

    expect(crowd.diagnostics()).toMatchObject({
      totalInstances: 160,
      animatedInstances: 24,
      staticInstances: 136,
      animationMaximumHz: 10,
      animationUpdateCount: 0,
      distantRowsStatic: true,
      instancedDrawGroups: 10,
      staticInstancedDrawGroups: 6,
      animatedInstancedDrawGroups: 4,
      frustumCulledMeshes: 10,
      boundedCullingMeshes: 10,
      unboundedCullingMeshes: 0,
      sharedGeometryCount: 6,
      sharedMaterialCount: 3,
    });
    const staticLayerMeshes: THREE.InstancedMesh[] = [];
    const animatedLayerMeshes: THREE.InstancedMesh[] = [];
    crowd.root.traverse((object) => {
      if (!(object instanceof THREE.InstancedMesh)) {
        return;
      }
      if (object.userData["crowdMotion"] === "static") {
        staticLayerMeshes.push(object);
      }
      if (object.userData["crowdMotion"] === "animated") {
        animatedLayerMeshes.push(object);
      }
    });
    expect(staticLayerMeshes).toHaveLength(6);
    expect(animatedLayerMeshes).toHaveLength(4);
    expect(staticLayerMeshes.every((mesh) => mesh.layers.mask === 2)).toBe(
      true,
    );
    expect(animatedLayerMeshes.every((mesh) => mesh.layers.mask === 1)).toBe(
      true,
    );
    crowd.update(0.099);
    expect(crowd.diagnostics().animationUpdateCount).toBe(0);
    crowd.update(0.1);
    const afterOneUpdate = crowd.diagnostics();
    expect(afterOneUpdate.animationUpdateCount).toBe(1);
    expect(afterOneUpdate.matrixWritesLastUpdate).toBeGreaterThan(0);
    expect(afterOneUpdate.matrixWritesLastUpdate).toBeLessThanOrEqual(
      24 * 5,
    );
    crowd.update(0.15);
    expect(crowd.diagnostics().animationUpdateCount).toBe(1);
    crowd.update(0.2);
    expect(crowd.diagnostics().animationUpdateCount).toBe(2);

    crowd.dispose();
    disposeTestSurfaces(surfaces);
  });

  it("keeps capture crowd static and disposes shared crowd resources exactly once", () => {
    const geometryDispose = vi.spyOn(
      THREE.BufferGeometry.prototype,
      "dispose",
    );
    const materialDispose = vi.spyOn(THREE.Material.prototype, "dispose");
    const surfaces = createTestSurfaces();
    const crowd = new ProceduralCrowd(
      {
        instanceCount: 720,
        animatedInstanceMaximum: 0,
        animationMaximumHz: 0,
      },
      0x5eed_2005,
      surfaces.fabric,
      surfaces.skin,
    );

    crowd.update(100);
    expect(crowd.diagnostics()).toMatchObject({
      animatedInstances: 0,
      animationUpdateCount: 0,
      matrixWritesLastUpdate: 0,
      distantRowsStatic: true,
    });
    crowd.dispose();
    crowd.dispose();
    expect(geometryDispose).toHaveBeenCalledTimes(6);
    expect(materialDispose).toHaveBeenCalledTimes(3);

    geometryDispose.mockRestore();
    materialDispose.mockRestore();
    disposeTestSurfaces(surfaces);
  });

  it("enforces the capture ceiling without unbounded layout growth", () => {
    for (const preset of ["balanced", "high", "capture"] as QualityPreset[]) {
      const config = getQualityConfig(preset);
      expect(createCrowdLayout(config.crowdInstances, 1)).toHaveLength(
        config.crowdInstances,
      );
    }
    expect(createCrowdLayout(960, 1)).toHaveLength(960);
    expect(() => createCrowdLayout(961, 1)).toThrow(/from 1 to 960/);
  });

  it("invalidates the locked static layer on resize or quality changes and disposes every target", () => {
    const targetDispose = vi.spyOn(
      THREE.WebGLRenderTarget.prototype,
      "dispose",
    );
    const cache = new LockedStaticLayerCache("balanced");

    expect(cache.configure(960, 540, 1, "balanced")).toBe(true);
    expect(cache.configure(960, 540, 1, "balanced")).toBe(false);
    expect(cache.diagnostics()).toMatchObject({
      valid: false,
      quality: "balanced",
      widthPixels: 960,
      heightPixels: 540,
      rebuildCount: 0,
      invalidationCount: 1,
      createdRenderTargets: 1,
      disposedRenderTargets: 0,
      activeRenderTargets: 1,
      orphanedRenderTargets: 0,
    });

    expect(cache.configure(1920, 1080, 1, "balanced")).toBe(true);
    expect(cache.configure(1920, 1080, 1, "high")).toBe(true);
    expect(targetDispose).toHaveBeenCalledTimes(2);
    expect(cache.diagnostics()).toMatchObject({
      quality: "high",
      invalidationCount: 3,
      createdRenderTargets: 3,
      disposedRenderTargets: 2,
      activeRenderTargets: 1,
      orphanedRenderTargets: 0,
    });

    cache.dispose();
    cache.dispose();
    expect(targetDispose).toHaveBeenCalledTimes(3);
    expect(cache.diagnostics()).toMatchObject({
      valid: false,
      createdRenderTargets: 3,
      disposedRenderTargets: 3,
      activeRenderTargets: 0,
      orphanedRenderTargets: 0,
    });
    targetDispose.mockRestore();
  });
});

describe("shot render performance probe", () => {
  it("measures frame distributions, bounded render work, and shader changes", () => {
    const probe = new PerformanceProbe();
    probe.beginShot(17);
    probe.recordRender(2.5, 16, 96, 245_000, 17);
    probe.recordRender(4.25, 18, 102, 251_000, 17);
    probe.recordRender(3, 34, 100, 249_000, 17);

    expect(probe.snapshot()).toMatchObject({
      measurementActive: true,
      sampleCount: 3,
      maximumRenderCpuMilliseconds: 4.25,
      meanRenderCpuMilliseconds: 3.25,
      medianFrameMilliseconds: 18,
      p50FrameMilliseconds: 18,
      p95FrameMilliseconds: 34,
      p99FrameMilliseconds: 34,
      worstFrameMilliseconds: 34,
      maximumDrawCalls: 102,
      maximumTriangles: 251_000,
      shaderProgramDelta: 0,
      shaderProgramsStable: true,
    });

    probe.recordRender(18, 40, 104, 253_000, 18);
    probe.finishShot(18);
    expect(probe.snapshot()).toMatchObject({
      measurementActive: false,
      shaderProgramDelta: 1,
      shaderProgramsStable: false,
    });
  });
});

function createTestSurface(
  name: "fabric" | "skin",
): ProceduralSurfaceTextures {
  const createTexture = () =>
    new THREE.CanvasTexture({ width: 1, height: 1 } as HTMLCanvasElement);
  return {
    name,
    albedo: createTexture(),
    normal: createTexture(),
    roughness: createTexture(),
    alpha: null,
    resolution: 1,
    detailScales: [1, 2],
  };
}

function createTestSurfaces(): {
  readonly fabric: ProceduralSurfaceTextures;
  readonly skin: ProceduralSurfaceTextures;
} {
  return {
    fabric: createTestSurface("fabric"),
    skin: createTestSurface("skin"),
  };
}

function disposeTestSurfaces(surfaces: {
  readonly fabric: ProceduralSurfaceTextures;
  readonly skin: ProceduralSurfaceTextures;
}): void {
  for (const surface of [surfaces.fabric, surfaces.skin]) {
    surface.albedo.dispose();
    surface.normal.dispose();
    surface.roughness.dispose();
  }
}
