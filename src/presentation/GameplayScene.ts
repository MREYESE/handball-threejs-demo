import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import type { QualityConfig } from "../core/Quality";
import type { Disposable } from "../core/ResourceTracker";
import {
  PerformanceProbe,
  type PerformanceProbeSnapshot,
} from "../dev/PerformanceProbe";
import type { GoalkeeperZone } from "../domain/goalkeeper/zones";
import type { Vec3 } from "../domain/math";
import type { ShotOutcome } from "../domain/shot/outcome";
import {
  LockedCameraRig,
  type LockedCameraProfile,
  type ProjectedBounds,
} from "./camera/LockedCameraRig";
import {
  LockedStaticLayerCache,
  type LockedStaticLayerCacheDiagnostics,
} from "./cache/LockedStaticLayerCache";
import {
  goalkeeperPoseAt,
  SHOOTER_PRESENTATION_YAW_RADIANS,
  shooterPoseAt,
  type GoalkeeperAnimationStage,
  type ShooterAnimationStage,
} from "./characters/CharacterAnimation";
import {
  createBallRubberMaterial,
  createCharacterMaterials,
  disposeCharacterMaterials,
  type CharacterMaterials,
} from "./characters/CharacterMaterials";
import { ProceduralHumanoid } from "./characters/ProceduralHumanoid";
import {
  ProceduralCrowd,
  type CrowdDiagnostics,
} from "./crowd/ProceduralCrowd";
import {
  ArcadeEffects,
  type ArcadeFxDiagnostics,
} from "./fx/ArcadeEffects";
import {
  ProceduralMaterialLibrary,
  type ProceduralMaterialDiagnostics,
  withSurfaceTextures,
} from "./materials/ProceduralMaterials";

export type KeeperVisualPhase = "READY" | "PREPARE" | "DIVE" | "HOLD" | "RETURN";
export type ShooterVisualPhase = "READY" | "RELEASE" | "RECOVER";

export interface GameplayVisualState {
  readonly ballPosition: Vec3;
  readonly keeperPosition: Vec3;
  readonly keeperZone: GoalkeeperZone | null;
  readonly keeperDiveProgress: number;
  readonly keeperPhase: KeeperVisualPhase;
  readonly shooterPhase: ShooterVisualPhase;
  readonly shotProgress: number;
  readonly resultProgress: number;
  readonly outcome: ShotOutcome | null;
  readonly simulationSeconds: number;
}

export interface SceneDiagnostics {
  readonly finiteTransforms: boolean;
  readonly goalInnerWidthMeters: number;
  readonly goalInnerHeightMeters: number;
  readonly releaseToGoalMeters: number;
  readonly goalAreaRadiusMeters: number;
  readonly penaltyLineDistanceMeters: number;
  readonly freeThrowRadiusMeters: number;
  readonly cameraCount: number;
  readonly cameraProfile: LockedCameraProfile;
  readonly goalProjection: ProjectedBounds;
  readonly shooterProjection: ProjectedBounds;
  readonly ballProjection: Readonly<{
    x: number;
    y: number;
    depth: number;
    visible: boolean;
  }>;
  readonly goalCentered: boolean;
  readonly shooterLeftForeground: boolean;
  readonly shooterAnimationStage: ShooterAnimationStage;
  readonly shooterPoseName: string;
  readonly shooterReleaseAmount: number;
  readonly goalkeeperAnimationStage: GoalkeeperAnimationStage;
  readonly goalkeeperPoseName: string;
  readonly goalkeeperZone: GoalkeeperZone | null;
  readonly goalkeeperDiveAmount: number;
  readonly goalkeeperSaveVolumeCenter: Vec3;
  readonly goalkeeperVisibleReach: Vec3;
  readonly goalkeeperReachErrorMeters: number;
  readonly characterArticulatedJointCount: number;
  readonly characterMaterialNames: readonly string[];
  readonly characterVisualRootsOwnScoring: false;
  readonly ballPathPointCount: number;
  readonly arcadeFx: ArcadeFxDiagnostics;
  readonly renderCalls: number;
  readonly renderedTriangles: number;
  readonly presentedFrames: number;
  readonly shaderPrograms: number;
  readonly prewarmedShaderPrograms: number;
  readonly shaderProgramsStableSincePrewarm: boolean;
  readonly prewarmComplete: boolean;
  readonly appliedPixelRatio: number;
  readonly maximumPixelRatio: number;
  readonly shadowMapSize: number;
  readonly shadowCastingLights: number;
  readonly arenaLights: number;
  readonly environmentMapSize: number;
  readonly postProcessing: boolean;
  readonly renderer: Readonly<{
    acceleration: "hardware" | "software" | "unknown";
    renderer: string;
    vendor: string;
    version: string;
  }>;
  readonly generatedEnvironment: boolean;
  readonly contactShadowCount: number;
  readonly proceduralMaterials: ProceduralMaterialDiagnostics;
  readonly crowd: CrowdDiagnostics;
  readonly staticLayerCache: LockedStaticLayerCacheDiagnostics &
    Readonly<{
      staticSceneObjects: number;
      preservesGoalKeeperOcclusion: boolean;
    }>;
  readonly performance: PerformanceProbeSnapshot;
  readonly gpuGeometries: number;
  readonly gpuTextures: number;
}

const GOAL_Z = 7;
const GOAL_WIDTH = 3;
const GOAL_HEIGHT = 2;
const GOAL_DEPTH = 0.8;
const POST_THICKNESS = 0.12;
const GOAL_AREA_RADIUS = 6;
const PENALTY_LINE_DISTANCE = 7;
const FREE_THROW_RADIUS = 9;
const SHOOTER_BOUNDS_MINIMUM = Object.freeze({
  x: -1.24,
  y: 0,
  z: -0.78,
});
const SHOOTER_BOUNDS_MAXIMUM = Object.freeze({
  x: -0.28,
  y: 2.05,
  z: 0.25,
});
const DYNAMIC_RENDER_LAYER = 0;
const STATIC_RENDER_LAYER = 1;

export class GameplayScene implements Disposable {
  private readonly scene = new THREE.Scene();
  private readonly staticRoot = new THREE.Group();
  private readonly cameraRig = new LockedCameraRig();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly canvas: HTMLCanvasElement & {
    __HANDBALL_PRESENTED_FRAMES__?: number;
  };
  private readonly ball: THREE.Mesh;
  private readonly arcadeEffects: ArcadeEffects;
  private readonly materialLibrary: ProceduralMaterialLibrary;
  private readonly quality: QualityConfig;
  private readonly shooterMaterials: CharacterMaterials;
  private readonly goalkeeperMaterials: CharacterMaterials;
  private readonly shooter: ProceduralHumanoid;
  private readonly goalkeeper: ProceduralHumanoid;
  private readonly goalRoot: THREE.Group;
  private readonly crowd: ProceduralCrowd;
  private readonly staticLayerCache: LockedStaticLayerCache;
  private readonly goalkeeperContactShadow: THREE.Mesh;
  private readonly performanceProbe = new PerformanceProbe();
  private environmentTarget: THREE.WebGLRenderTarget | null = null;
  private readonly disposables = new Set<
    THREE.BufferGeometry | THREE.Material
  >();
  private shooterAnimationStage: ShooterAnimationStage = "IDLE";
  private shooterReleaseAmount = 0;
  private goalkeeperAnimationStage: GoalkeeperAnimationStage = "READY";
  private goalkeeperDiveAmount = 0;
  private goalkeeperZone: GoalkeeperZone | null = null;
  private readonly goalkeeperSaveVolumeCenter = new THREE.Vector3(0, 1, GOAL_Z);
  private readonly goalkeeperVisibleReach = new THREE.Vector3(0, 1.28, GOAL_Z);
  private prewarmComplete = false;
  private prewarmedShaderPrograms = 0;
  private presentedFrames = 0;
  private lastPresentationMilliseconds: number | null = null;
  private lastRenderCalls = 0;
  private lastRenderedTriangles = 0;
  private appliedCanvasTransform = "";

  public constructor(
    canvas: HTMLCanvasElement,
    quality: QualityConfig,
  ) {
    this.quality = quality;
    this.canvas = canvas;
    this.canvas.__HANDBALL_PRESENTED_FRAMES__ = 0;
    this.staticLayerCache = new LockedStaticLayerCache(quality.name);
    this.staticRoot.name = "LockedArenaStaticLayerRoot";
    this.staticRoot.userData["cachedStaticLayer"] = true;
    this.scene.add(this.staticRoot);
    this.materialLibrary = new ProceduralMaterialLibrary(
      quality.proceduralTextureResolution,
    );
    const characterSurfaceDetail =
      quality.name === "capture" ? "pbr" : "albedo";
    this.shooterMaterials = createCharacterMaterials(
      "shooter",
      this.materialLibrary,
      characterSurfaceDetail,
    );
    this.goalkeeperMaterials = createCharacterMaterials(
      "goalkeeper",
      this.materialLibrary,
      characterSurfaceDetail,
    );
    this.shooter = new ProceduralHumanoid(
      "shooter",
      this.shooterMaterials,
    );
    this.goalkeeper = new ProceduralHumanoid(
      "goalkeeper",
      this.goalkeeperMaterials,
    );
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: quality.antialias,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, quality.maximumPixelRatio),
    );
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = quality.shadowCastingKeyLight;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene.background = new THREE.Color(0x07111f);
    this.scene.fog = new THREE.Fog(0x07111f, 18, 38);
    this.cameraRig.camera.layers.set(DYNAMIC_RENDER_LAYER);
    this.scene.add(this.cameraRig.camera);

    this.addGeneratedEnvironment();
    this.addLighting(quality);
    this.collectStaticLayerObjects(() => this.addCourt());
    this.goalRoot = this.addGoal();
    this.collectStaticLayerObjects(() => this.addArenaBackdrop());
    this.shooter.root.position.set(-0.78, 0, -0.42);
    this.shooter.root.rotation.y = SHOOTER_PRESENTATION_YAW_RADIANS;
    this.scene.add(this.shooter.root);
    this.goalkeeper.root.position.set(0, 0, GOAL_Z - 0.08);
    this.scene.add(this.goalkeeper.root);
    this.crowd = new ProceduralCrowd(
      {
        instanceCount: quality.crowdInstances,
        animatedInstanceMaximum: quality.animatedCrowdInstances,
        animationMaximumHz: quality.crowdAnimationMaximumHz,
        staticRenderLayer: STATIC_RENDER_LAYER,
        animatedRenderLayer: DYNAMIC_RENDER_LAYER,
      },
      0x5eed_2005,
      this.materialLibrary.surface("fabric"),
      this.materialLibrary.surface("skin"),
    );
    this.scene.add(this.crowd.root);
    this.goalkeeperContactShadow = this.addContactShadows();
    this.ball = this.mesh(
      new THREE.SphereGeometry(0.094, 20, 14),
      createBallRubberMaterial(this.materialLibrary),
    );
    this.ball.castShadow = true;
    this.scene.add(this.ball);

    this.arcadeEffects = new ArcadeEffects(
      quality,
      this.cameraRig.camera,
    );
    this.scene.add(this.arcadeEffects.root);
  }

  public async prewarm(): Promise<void> {
    if (this.prewarmComplete) {
      return;
    }
    await this.compileLayer(DYNAMIC_RENDER_LAYER);
    this.arcadeEffects.resetVisuals();
    await this.staticLayerCache.compileComposite(this.renderer);
    this.rebuildStaticLayerCache();
    this.presentCachedFrame();
    this.presentCachedFrame();
    this.prewarmedShaderPrograms = this.shaderProgramCount();
    this.prewarmComplete = true;
  }

  public beginShotMeasurement(): void {
    if (!this.prewarmComplete) {
      throw new Error("Cannot measure a shot before material/light pre-warm.");
    }
    this.performanceProbe.beginShot(this.shaderProgramCount());
  }

  public beginShotFeedback(
    origin: Vec3,
    power: number,
    simulationSeconds: number,
  ): void {
    this.arcadeEffects.beginShot(origin, power, simulationSeconds);
  }

  public resolveShotFeedback(
    outcome: ShotOutcome,
    impactPosition: Vec3,
    simulationSeconds: number,
  ): void {
    this.arcadeEffects.resolveOutcome(
      outcome,
      impactPosition,
      simulationSeconds,
    );
  }

  public resetFeedback(): void {
    this.arcadeEffects.resetVisuals();
    this.applyCanvasImpulse(0, 0);
  }

  public setReducedMotion(reducedMotion: boolean): void {
    this.arcadeEffects.setReducedMotion(reducedMotion);
    if (reducedMotion) {
      this.applyCanvasImpulse(0, 0);
    }
  }

  public finishShotMeasurement(): void {
    this.performanceProbe.finishShot(this.shaderProgramCount());
  }

  public resize(widthPixels: number, heightPixels: number): void {
    const width = Math.max(1, Math.floor(widthPixels));
    const height = Math.max(1, Math.floor(heightPixels));
    this.cameraRig.resize(width, height);
    this.renderer.setSize(width, height, false);
    this.staticLayerCache.configure(
      width,
      height,
      this.renderer.getPixelRatio(),
      this.quality.name,
    );
  }

  public apply(state: GameplayVisualState): void {
    this.ball.position.set(
      state.ballPosition.x,
      state.ballPosition.y,
      state.ballPosition.z,
    );
    this.ball.rotation.set(
      state.simulationSeconds * 8,
      state.simulationSeconds * 5,
      state.simulationSeconds * 2,
    );
    this.arcadeEffects.update({
      ballPosition: state.ballPosition,
      shotProgress: state.shotProgress,
      resultProgress: state.resultProgress,
      simulationSeconds: state.simulationSeconds,
    });
    const impulse = this.arcadeEffects.screenImpulse();
    this.applyCanvasImpulse(impulse.x, impulse.y);
    this.crowd.update(state.simulationSeconds);

    const shooterSample = shooterPoseAt(
      state.shooterPhase,
      state.shotProgress,
      state.resultProgress,
      state.simulationSeconds,
    );
    this.shooter.applyPose(shooterSample.pose);
    this.shooterAnimationStage = shooterSample.stage;
    this.shooterReleaseAmount = shooterSample.releaseAmount;

    this.goalkeeper.root.position.set(
      state.keeperPosition.x * 0.52,
      Math.max(0, (state.keeperPosition.y - 1) * 0.28),
      state.keeperPosition.z - 0.08,
    );
    this.goalkeeperContactShadow.position.set(
      this.goalkeeper.root.position.x,
      0.021,
      this.goalkeeper.root.position.z,
    );
    this.goalkeeperContactShadow.scale.set(
      1 + state.keeperDiveProgress * 0.65,
      1 + state.keeperDiveProgress * 0.18,
      1,
    );
    const goalkeeperSample = goalkeeperPoseAt(
      state.keeperZone,
      state.keeperPhase,
      state.keeperDiveProgress,
      state.resultProgress,
      state.outcome,
      state.simulationSeconds,
    );
    this.goalkeeper.applyPose(goalkeeperSample.pose);
    this.goalkeeperAnimationStage = goalkeeperSample.stage;
    this.goalkeeperDiveAmount = goalkeeperSample.diveAmount;
    this.goalkeeperZone = state.keeperZone;
    this.goalkeeperSaveVolumeCenter.set(
      state.keeperPosition.x,
      state.keeperPosition.y,
      state.keeperPosition.z,
    );
    const keeperDiagnostics = this.goalkeeper.diagnostics();
    const visibleReach =
      state.keeperZone?.endsWith("left") === true
        ? keeperDiagnostics.leftHandWorld
        : state.keeperZone?.endsWith("right") === true
          ? keeperDiagnostics.rightHandWorld
          : {
              x:
                (keeperDiagnostics.leftHandWorld.x +
                  keeperDiagnostics.rightHandWorld.x) /
                2,
              y:
                (keeperDiagnostics.leftHandWorld.y +
                  keeperDiagnostics.rightHandWorld.y) /
                2,
              z:
                (keeperDiagnostics.leftHandWorld.z +
                  keeperDiagnostics.rightHandWorld.z) /
                2,
            };
    this.goalkeeperVisibleReach.set(
      visibleReach.x,
      visibleReach.y,
      visibleReach.z,
    );
  }

  public render(): void {
    const renderStarted = performance.now();
    const frameMilliseconds =
      this.lastPresentationMilliseconds === null
        ? 0
        : renderStarted - this.lastPresentationMilliseconds;
    if (!this.staticLayerCache.isValid) {
      this.rebuildStaticLayerCache();
    }
    const frameWork = this.presentCachedFrame();
    this.lastRenderCalls = frameWork.drawCalls;
    this.lastRenderedTriangles = frameWork.triangles;
    this.lastPresentationMilliseconds = renderStarted;
    this.presentedFrames += 1;
    this.canvas.__HANDBALL_PRESENTED_FRAMES__ = this.presentedFrames;
    this.performanceProbe.recordRender(
      performance.now() - renderStarted,
      frameMilliseconds,
      this.lastRenderCalls,
      this.lastRenderedTriangles,
      this.shaderProgramCount(),
    );
  }

  public diagnostics(): SceneDiagnostics {
    let finiteTransforms = true;
    let cameraCount = 0;
    this.scene.traverse((object) => {
      if (object instanceof THREE.Camera) {
        cameraCount += 1;
      }
      const values = [
        object.position.x,
        object.position.y,
        object.position.z,
        object.rotation.x,
        object.rotation.y,
        object.rotation.z,
        object.scale.x,
        object.scale.y,
        object.scale.z,
      ];
      if (values.some((value) => !Number.isFinite(value))) {
        finiteTransforms = false;
      }
    });
    const goalProjection = this.cameraRig.projectBounds(
      {
        x: -GOAL_WIDTH / 2 - POST_THICKNESS,
        y: 0,
        z: GOAL_Z,
      },
      {
        x: GOAL_WIDTH / 2 + POST_THICKNESS,
        y: GOAL_HEIGHT + POST_THICKNESS,
        z: GOAL_Z + GOAL_DEPTH,
      },
    );
    const shooterProjection = this.cameraRig.projectBounds(
      SHOOTER_BOUNDS_MINIMUM,
      SHOOTER_BOUNDS_MAXIMUM,
    );
    const ballProjection = this.cameraRig.projectPoint(this.ball.position);
    const shooterDiagnostics = this.shooter.diagnostics();
    const goalkeeperDiagnostics = this.goalkeeper.diagnostics();
    const materialDiagnostics = this.materialLibrary.diagnostics();
    const crowdDiagnostics = this.crowd.diagnostics();
    const rendererDiagnostics = this.rendererDiagnostics();
    let arenaLights = 0;
    let shadowCastingLights = 0;
    this.scene.traverse((object) => {
      if (object instanceof THREE.Light) {
        arenaLights += 1;
        if (object.castShadow) {
          shadowCastingLights += 1;
        }
      }
    });
    const shaderPrograms = this.shaderProgramCount();
    const materialNames = [
      ...Object.values(this.shooterMaterials),
      ...Object.values(this.goalkeeperMaterials),
    ].map((material) => material.name);
    return Object.freeze({
      finiteTransforms:
        finiteTransforms &&
        shooterDiagnostics.finiteTransforms &&
        goalkeeperDiagnostics.finiteTransforms,
      goalInnerWidthMeters: GOAL_WIDTH,
      goalInnerHeightMeters: GOAL_HEIGHT,
      releaseToGoalMeters: GOAL_Z,
      goalAreaRadiusMeters: GOAL_AREA_RADIUS,
      penaltyLineDistanceMeters: PENALTY_LINE_DISTANCE,
      freeThrowRadiusMeters: FREE_THROW_RADIUS,
      cameraCount,
      cameraProfile: this.cameraRig.currentLayout().profile,
      goalProjection,
      shooterProjection,
      ballProjection,
      goalCentered:
        goalProjection.fullyVisible &&
        Math.abs(goalProjection.centerX) <= 0.08 &&
        Math.abs(goalProjection.centerY) <= 0.16,
      shooterLeftForeground:
        shooterProjection.left < -0.3 &&
        shooterProjection.right < -0.18 &&
        shooterProjection.top <= 1 &&
        shooterProjection.top >= -0.35 &&
        shooterProjection.visibleWidth >= 0.46 &&
        shooterProjection.visibleWidth <= 0.72,
      shooterAnimationStage: this.shooterAnimationStage,
      shooterPoseName: shooterDiagnostics.poseName,
      shooterReleaseAmount: this.shooterReleaseAmount,
      goalkeeperAnimationStage: this.goalkeeperAnimationStage,
      goalkeeperPoseName: goalkeeperDiagnostics.poseName,
      goalkeeperZone: this.goalkeeperZone,
      goalkeeperDiveAmount: this.goalkeeperDiveAmount,
      goalkeeperSaveVolumeCenter: Object.freeze({
        x: this.goalkeeperSaveVolumeCenter.x,
        y: this.goalkeeperSaveVolumeCenter.y,
        z: this.goalkeeperSaveVolumeCenter.z,
      }),
      goalkeeperVisibleReach: Object.freeze({
        x: this.goalkeeperVisibleReach.x,
        y: this.goalkeeperVisibleReach.y,
        z: this.goalkeeperVisibleReach.z,
      }),
      goalkeeperReachErrorMeters:
        this.goalkeeperVisibleReach.distanceTo(
          this.goalkeeperSaveVolumeCenter,
        ),
      characterArticulatedJointCount:
        shooterDiagnostics.articulatedJointCount +
        goalkeeperDiagnostics.articulatedJointCount,
      characterMaterialNames: Object.freeze(materialNames),
      characterVisualRootsOwnScoring: false,
      ballPathPointCount:
        this.arcadeEffects.diagnostics().activeRibbonPoints,
      arcadeFx: this.arcadeEffects.diagnostics(),
      renderCalls: this.lastRenderCalls,
      renderedTriangles: this.lastRenderedTriangles,
      presentedFrames: this.presentedFrames,
      shaderPrograms,
      prewarmedShaderPrograms: this.prewarmedShaderPrograms,
      shaderProgramsStableSincePrewarm:
        this.prewarmComplete && shaderPrograms === this.prewarmedShaderPrograms,
      prewarmComplete: this.prewarmComplete,
      appliedPixelRatio: this.renderer.getPixelRatio(),
      maximumPixelRatio: this.quality.maximumPixelRatio,
      shadowMapSize: this.quality.shadowMapSize,
      shadowCastingLights,
      arenaLights,
      environmentMapSize: this.quality.environmentMapSize,
      postProcessing: this.quality.postProcessing,
      renderer: rendererDiagnostics,
      generatedEnvironment:
        this.environmentTarget?.texture.userData["generatedInCode"] === true,
      contactShadowCount: 3,
      proceduralMaterials: materialDiagnostics,
      crowd: crowdDiagnostics,
      staticLayerCache: Object.freeze({
        ...this.staticLayerCache.diagnostics(),
        staticSceneObjects: this.staticRoot.children.length,
        preservesGoalKeeperOcclusion:
          this.usesOnlyLayer(this.goalRoot, DYNAMIC_RENDER_LAYER) &&
          this.usesOnlyLayer(
            this.goalkeeper.root,
            DYNAMIC_RENDER_LAYER,
          ),
      }),
      performance: this.performanceProbe.snapshot(),
      gpuGeometries: this.renderer.info.memory.geometries,
      gpuTextures: this.renderer.info.memory.textures,
    });
  }

  public dispose(): void {
    this.arcadeEffects.dispose();
    this.shooter.dispose();
    this.goalkeeper.dispose();
    this.crowd.dispose();
    disposeCharacterMaterials(this.shooterMaterials);
    disposeCharacterMaterials(this.goalkeeperMaterials);
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
    this.staticLayerCache.dispose();
    this.environmentTarget?.dispose();
    this.materialLibrary.dispose();
    this.renderer.dispose();
    this.applyCanvasImpulse(0, 0);
    delete this.canvas.__HANDBALL_PRESENTED_FRAMES__;
  }

  private applyCanvasImpulse(xPixels: number, yPixels: number): void {
    const transform =
      xPixels === 0 && yPixels === 0
        ? ""
        : `translate3d(${xPixels.toFixed(2)}px, ${yPixels.toFixed(2)}px, 0) scale(1.003)`;
    if (transform === this.appliedCanvasTransform) {
      return;
    }
    this.appliedCanvasTransform = transform;
    if (transform.length === 0) {
      this.canvas.style.removeProperty("transform");
      return;
    }
    this.canvas.style.transform = transform;
  }

  private collectStaticLayerObjects(build: () => void): void {
    const existingObjects = new Set(this.scene.children);
    build();
    const staticObjects = this.scene.children.filter(
      (object) => !existingObjects.has(object),
    );
    for (const object of staticObjects) {
      object.traverse((descendant) => {
        descendant.layers.set(STATIC_RENDER_LAYER);
        descendant.userData["cachedStaticLayer"] = true;
      });
      this.staticRoot.add(object);
    }
  }

  private async compileLayer(layer: number): Promise<void> {
    const previousMask = this.cameraRig.camera.layers.mask;
    this.cameraRig.camera.layers.set(layer);
    try {
      await this.renderer.compileAsync(this.scene, this.cameraRig.camera);
    } finally {
      this.cameraRig.camera.layers.mask = previousMask;
    }
  }

  private rebuildStaticLayerCache(): void {
    this.staticLayerCache.rebuild(this.renderer, () => {
      this.renderLayer(STATIC_RENDER_LAYER);
    });
  }

  private presentCachedFrame(): Readonly<{
    drawCalls: number;
    triangles: number;
  }> {
    return this.staticLayerCache.present(this.renderer, () => {
      this.renderDynamicLayer();
    });
  }

  private renderDynamicLayer(): void {
    // A Three.js Color background forces a clear even when autoClear is false.
    // Temporarily remove it so the live depth pass composites over the cache.
    const background = this.scene.background;
    this.scene.background = null;
    try {
      this.renderLayer(DYNAMIC_RENDER_LAYER);
    } finally {
      this.scene.background = background;
    }
  }

  private renderLayer(layer: number): void {
    const previousMask = this.cameraRig.camera.layers.mask;
    this.cameraRig.camera.layers.set(layer);
    try {
      this.renderer.render(this.scene, this.cameraRig.camera);
    } finally {
      this.cameraRig.camera.layers.mask = previousMask;
    }
  }

  private usesOnlyLayer(root: THREE.Object3D, layer: number): boolean {
    let usesOnlyExpectedLayer = true;
    const expectedMask = 1 << layer;
    root.traverse((object) => {
      if (object.layers.mask !== expectedMask) {
        usesOnlyExpectedLayer = false;
      }
    });
    return usesOnlyExpectedLayer;
  }

  private addGeneratedEnvironment(): void {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const roomEnvironment = new RoomEnvironment();
    this.environmentTarget = pmremGenerator.fromScene(
      roomEnvironment,
      0.045,
      0.1,
      100,
      { size: this.quality.environmentMapSize },
    );
    this.environmentTarget.texture.name = "GeneratedArenaReflection";
    this.environmentTarget.texture.userData["generatedInCode"] = true;
    this.scene.environment = this.environmentTarget.texture;
    this.scene.environmentIntensity = 0.58;
    roomEnvironment.dispose();
    pmremGenerator.dispose();
  }

  private addLighting(quality: QualityConfig): void {
    const hemisphere = new THREE.HemisphereLight(0xa8d7ff, 0x18243d, 0.68);
    hemisphere.layers.enable(STATIC_RENDER_LAYER);
    this.scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xfff7e8, 2.6);
    key.layers.enable(STATIC_RENDER_LAYER);
    key.position.set(-4.5, 9.5, -1.5);
    key.castShadow = quality.shadowCastingKeyLight;
    key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
    key.shadow.bias = -0.00018;
    key.shadow.normalBias = 0.025;
    key.shadow.camera.left = -11;
    key.shadow.camera.right = 11;
    key.shadow.camera.top = 15;
    key.shadow.camera.bottom = -6;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 30;
    key.target.position.set(0, 1, GOAL_Z);
    this.scene.add(key.target);
    this.scene.add(key);

    if (quality.name !== "balanced") {
      const fill = new THREE.DirectionalLight(0x6abaff, 1.1);
      fill.layers.enable(STATIC_RENDER_LAYER);
      fill.castShadow = false;
      fill.position.set(6, 4.5, -2);
      fill.target.position.set(0, 1.3, 5);
      this.scene.add(fill.target, fill);
    }

    if (quality.name === "capture") {
      const shooterRim = new THREE.SpotLight(
        0x32b8ff,
        28,
        18,
        Math.PI / 5,
        0.62,
        1.7,
      );
      shooterRim.layers.enable(STATIC_RENDER_LAYER);
      shooterRim.castShadow = false;
      shooterRim.position.set(4.5, 5.5, 2);
      shooterRim.target.position.set(-0.75, 1.1, -0.2);
      this.scene.add(shooterRim.target, shooterRim);

      const goalkeeperRim = new THREE.SpotLight(
        0xffbd70,
        24,
        15,
        Math.PI / 5,
        0.65,
        1.8,
      );
      goalkeeperRim.layers.enable(STATIC_RENDER_LAYER);
      goalkeeperRim.castShadow = false;
      goalkeeperRim.position.set(-5, 5.8, 10.5);
      goalkeeperRim.target.position.set(0, 1.1, GOAL_Z);
      this.scene.add(goalkeeperRim.target, goalkeeperRim);
    }
  }

  private addCourt(): void {
    const courtSurface = this.materialLibrary.surface("court");
    const court = this.mesh(
      new THREE.PlaneGeometry(20, 28),
      new THREE.MeshStandardMaterial({
        color: 0x0873d5,
        roughness: 0.5,
        metalness: 0.04,
        normalScale: new THREE.Vector2(0.18, 0.18),
        envMapIntensity: 0.68,
        ...withSurfaceTextures(courtSurface),
      }),
    );
    court.rotation.x = -Math.PI / 2;
    court.position.set(0, 0, 1);
    court.receiveShadow = true;
    court.name = "RegulationBlueCourt";
    this.scene.add(court);

    const goalAreaWash = this.mesh(
      new THREE.CircleGeometry(GOAL_AREA_RADIUS, 64, 0, Math.PI),
      new THREE.MeshBasicMaterial({
        color: 0x0754a6,
        transparent: true,
        opacity: 0.44,
        depthWrite: false,
      }),
    );
    goalAreaWash.rotation.x = -Math.PI / 2;
    goalAreaWash.position.set(0, 0.006, GOAL_Z);
    goalAreaWash.name = "SixMetreGoalArea";
    this.scene.add(goalAreaWash);

    const markingMaterial = new THREE.MeshBasicMaterial({
      color: 0xf4f8ff,
      toneMapped: false,
    });
    this.trackDisposables(markingMaterial);

    this.addFloorRectangle(
      1,
      0.065,
      0,
      GOAL_Z - PENALTY_LINE_DISTANCE,
      markingMaterial,
      "SevenMetrePenaltyLine",
    );
    this.addFloorRectangle(
      20,
      0.055,
      0,
      GOAL_Z,
      markingMaterial,
      "GoalLine",
    );
    for (const x of [-9.97, 9.97]) {
      this.addFloorRectangle(
        0.055,
        20,
        x,
        -3,
        markingMaterial,
        "Sideline",
      );
    }
    this.addArc(GOAL_AREA_RADIUS, false, markingMaterial);
    this.addArc(FREE_THROW_RADIUS, true, markingMaterial);
  }

  private addArc(
    radius: number,
    dashed: boolean,
    material: THREE.Material,
  ): void {
    if (!dashed) {
      const arc = this.mesh(
        new THREE.RingGeometry(
          radius - 0.035,
          radius + 0.035,
          96,
          1,
          0,
          Math.PI,
        ),
        material,
      );
      arc.rotation.x = -Math.PI / 2;
      arc.position.set(0, 0.016, GOAL_Z);
      arc.name = "SixMetreArc";
      this.scene.add(arc);
      return;
    }

    const dashCount = 25;
    const dashAngle = Math.PI / (dashCount * 1.7);
    const dashGeometry = new THREE.BoxGeometry(
      radius * dashAngle,
      0.028,
      0.055,
    );
    const dashes = new THREE.InstancedMesh(
      dashGeometry,
      material,
      dashCount,
    );
    const transform = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3(1, 1, 1);
    for (let index = 0; index < dashCount; index += 1) {
      const angle =
        Math.PI + ((index + 0.5) * Math.PI) / dashCount;
      position.set(
        Math.cos(angle) * radius,
        0.022,
        GOAL_Z + Math.sin(angle) * radius,
      );
      rotation.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -angle - Math.PI / 2,
      );
      transform.compose(position, rotation, scale);
      dashes.setMatrixAt(index, transform);
    }
    dashes.instanceMatrix.needsUpdate = true;
    dashes.name = "InstancedNineMetreDashes";
    this.trackDisposables(dashGeometry);
    this.scene.add(dashes);
  }

  private addGoal(): THREE.Group {
    const paintedMetal = this.materialLibrary.surface("painted-metal");
    const white = new THREE.MeshStandardMaterial({
      color: 0xf4f8ff,
      roughness: 0.38,
      metalness: 0.22,
      envMapIntensity: 0.85,
      ...withSurfaceTextures(paintedMetal),
    });
    const blue = new THREE.MeshStandardMaterial({
      color: 0x0754d8,
      roughness: 0.4,
      metalness: 0.2,
      envMapIntensity: 0.82,
      ...withSurfaceTextures(paintedMetal),
    });
    this.trackDisposables(white, blue);

    const stripeGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.trackDisposables(stripeGeometry);
    const goalRoot = new THREE.Group();
    goalRoot.name = "RegulationThreeByTwoGoal";
    const blueStripeMatrices: THREE.Matrix4[] = [];
    const whiteStripeMatrices: THREE.Matrix4[] = [];
    const stripePosition = new THREE.Vector3();
    const stripeRotation = new THREE.Quaternion();
    const stripeScale = new THREE.Vector3();
    const stripeTransform = new THREE.Matrix4();
    const addStripe = (
      color: "blue" | "white",
      x: number,
      y: number,
      width: number,
      height: number,
    ): void => {
      stripePosition.set(x, y, GOAL_Z);
      stripeScale.set(width, height, POST_THICKNESS);
      stripeTransform.compose(
        stripePosition,
        stripeRotation,
        stripeScale,
      );
      (color === "blue" ? blueStripeMatrices : whiteStripeMatrices).push(
        stripeTransform.clone(),
      );
    };
    for (const x of [
      -GOAL_WIDTH / 2 - POST_THICKNESS / 2,
      GOAL_WIDTH / 2 + POST_THICKNESS / 2,
    ]) {
      for (let stripe = 0; stripe < 6; stripe += 1) {
        addStripe(
          stripe % 2 === 0 ? "blue" : "white",
          x,
          ((stripe + 0.5) * (GOAL_HEIGHT + POST_THICKNESS)) / 6,
          POST_THICKNESS,
          (GOAL_HEIGHT + POST_THICKNESS) / 6,
        );
      }
    }

    for (let stripe = 0; stripe < 9; stripe += 1) {
      addStripe(
        stripe % 2 === 0 ? "blue" : "white",
        -GOAL_WIDTH / 2 -
          POST_THICKNESS +
          ((stripe + 0.5) * (GOAL_WIDTH + POST_THICKNESS * 2)) / 9,
        GOAL_HEIGHT + POST_THICKNESS / 2,
        (GOAL_WIDTH + POST_THICKNESS * 2) / 9,
        POST_THICKNESS,
      );
    }
    for (const [name, material, matrices] of [
      ["Blue", blue, blueStripeMatrices],
      ["White", white, whiteStripeMatrices],
    ] as const) {
      const stripes = new THREE.InstancedMesh(
        stripeGeometry,
        material,
        matrices.length,
      );
      for (let index = 0; index < matrices.length; index += 1) {
        const matrix = matrices[index];
        if (matrix !== undefined) {
          stripes.setMatrixAt(index, matrix);
        }
      }
      stripes.instanceMatrix.needsUpdate = true;
      stripes.castShadow = true;
      stripes.receiveShadow = true;
      stripes.computeBoundingBox();
      stripes.computeBoundingSphere();
      stripes.name = `StripedGoal${name}Sections`;
      stripes.userData["sharedGoalStripeGeometry"] = true;
      goalRoot.add(stripes);
    }

    const netSurface = this.materialLibrary.surface("net");
    const netMaterial = new THREE.MeshBasicMaterial({
      color: 0xe8f7ff,
      map: netSurface.albedo,
      alphaMap: netSurface.alpha,
      transparent: true,
      opacity: 0.72,
      alphaTest: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const backZ = GOAL_Z + GOAL_DEPTH;
    this.trackDisposables(netMaterial);
    const backNet = this.mesh(
      new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_HEIGHT),
      netMaterial,
    );
    backNet.position.set(0, GOAL_HEIGHT / 2, backZ);
    backNet.name = "ProceduralGoalNetBack";
    goalRoot.add(backNet);
    for (const x of [-GOAL_WIDTH / 2, GOAL_WIDTH / 2]) {
      const sideNet = this.mesh(
        new THREE.PlaneGeometry(GOAL_DEPTH, GOAL_HEIGHT),
        netMaterial,
      );
      sideNet.rotation.y = Math.PI / 2;
      sideNet.position.set(x, GOAL_HEIGHT / 2, GOAL_Z + GOAL_DEPTH / 2);
      sideNet.name = "ProceduralGoalNetSide";
      goalRoot.add(sideNet);
    }
    const topNet = this.mesh(
      new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_DEPTH),
      netMaterial,
    );
    topNet.rotation.x = Math.PI / 2;
    topNet.position.set(0, GOAL_HEIGHT, GOAL_Z + GOAL_DEPTH / 2);
    topNet.name = "ProceduralGoalNetTop";
    goalRoot.add(topNet);
    this.scene.add(goalRoot);
    return goalRoot;
  }

  private addArenaBackdrop(): void {
    const paintedMetal = this.materialLibrary.surface("painted-metal");
    const fabricSurface = this.materialLibrary.surface("fabric");
    const ledSurface = this.materialLibrary.surface("led-board");
    // Large dark architecture stays deliberately cheap. The gameplay-facing
    // court, goal, ball, and characters retain the generated PBR surfaces.
    const shellMaterial = new THREE.MeshLambertMaterial({
      color: 0x111b2b,
    });
    const acousticMaterial = new THREE.MeshLambertMaterial({
      color: 0x1a2a42,
    });
    const concreteMaterial = new THREE.MeshLambertMaterial({
      color: 0x263447,
    });
    const seatingMaterial = new THREE.MeshLambertMaterial({
      color: 0x0b376d,
      map: fabricSurface.albedo,
    });
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x9fb7c8,
      roughness: 0.38,
      metalness: 0.78,
      envMapIntensity: 0.9,
      ...withSurfaceTextures(paintedMetal),
    });
    this.trackDisposables(
      shellMaterial,
      acousticMaterial,
      concreteMaterial,
      seatingMaterial,
      metalMaterial,
    );

    const backWall = this.mesh(
      new THREE.BoxGeometry(20.6, 9.6, 0.35),
      shellMaterial,
    );
    backWall.position.set(0, 4.8, 15.4);
    backWall.receiveShadow = true;
    backWall.name = "ArenaEndWall";
    this.scene.add(backWall);

    for (const x of [-10.2, 10.2]) {
      const sideWall = this.mesh(
        new THREE.BoxGeometry(0.35, 9.6, 28),
        acousticMaterial,
      );
      sideWall.position.set(x, 4.8, 1.5);
      sideWall.receiveShadow = true;
      sideWall.name = "ArenaSideWall";
      this.scene.add(sideWall);
    }

    const ceiling = this.mesh(
      new THREE.BoxGeometry(20.7, 0.24, 28),
      shellMaterial,
    );
    ceiling.position.set(0, 9.7, 1.5);
    ceiling.name = "ArenaCeiling";
    this.scene.add(ceiling);

    const standGeometry = new THREE.BoxGeometry(18.4, 0.42, 0.88);
    const standCount = 8;
    const stands = new THREE.InstancedMesh(
      standGeometry,
      seatingMaterial,
      standCount,
    );
    const transform = new THREE.Matrix4();
    for (let row = 0; row < standCount; row += 1) {
      transform.makeTranslation(
        0,
        0.28 + row * 0.43,
        9.25 + row * 0.78,
      );
      stands.setMatrixAt(row, transform);
    }
    stands.instanceMatrix.needsUpdate = true;
    stands.receiveShadow = true;
    stands.name = "SteepEuropeanStands";
    this.trackDisposables(standGeometry);
    this.scene.add(stands);

    const aisleGeometry = new THREE.BoxGeometry(0.72, 0.08, 0.78);
    this.trackDisposables(aisleGeometry);
    const aisleCount = 2 * standCount;
    const aisles = new THREE.InstancedMesh(
      aisleGeometry,
      concreteMaterial,
      aisleCount,
    );
    let aisleIndex = 0;
    for (const aisleX of [-4.1, 4.1]) {
      for (let row = 0; row < standCount; row += 1) {
        transform.makeTranslation(
          aisleX,
          0.53 + row * 0.43,
          9.25 + row * 0.78,
        );
        aisles.setMatrixAt(aisleIndex, transform);
        aisleIndex += 1;
      }
    }
    aisles.instanceMatrix.needsUpdate = true;
    aisles.name = "InstancedStandAisleSteps";
    this.scene.add(aisles);

    const railingBarGeometry = new THREE.CylinderGeometry(
      0.025,
      0.025,
      18,
      6,
    );
    const railingPostGeometry = new THREE.CylinderGeometry(
      0.022,
      0.022,
      0.8,
      6,
    );
    this.trackDisposables(railingBarGeometry, railingPostGeometry);
    const railingBars = new THREE.InstancedMesh(
      railingBarGeometry,
      metalMaterial,
      2,
    );
    const railingPosts = new THREE.InstancedMesh(
      railingPostGeometry,
      metalMaterial,
      14,
    );
    const railingRotation = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      Math.PI / 2,
    );
    const unitScale = new THREE.Vector3(1, 1, 1);
    const railingPosition = new THREE.Vector3();
    let railingIndex = 0;
    let railingPostIndex = 0;
    for (const row of [0, 4]) {
      const z = 8.76 + row * 0.78;
      const y = 0.8 + row * 0.43;
      railingPosition.set(0, y, z);
      transform.compose(railingPosition, railingRotation, unitScale);
      railingBars.setMatrixAt(railingIndex, transform);
      railingIndex += 1;
      for (const x of [-8.5, -6, -3, 0, 3, 6, 8.5]) {
        transform.makeTranslation(x, y - 0.35, z);
        railingPosts.setMatrixAt(railingPostIndex, transform);
        railingPostIndex += 1;
      }
    }
    railingBars.instanceMatrix.needsUpdate = true;
    railingBars.name = "InstancedStandRailings";
    railingPosts.instanceMatrix.needsUpdate = true;
    railingPosts.name = "InstancedStandRailingPosts";
    this.scene.add(railingBars, railingPosts);

    const exitFrameMaterial = new THREE.MeshLambertMaterial({
      color: 0x172330,
    });
    const exitLightMaterial = new THREE.MeshBasicMaterial({
      color: 0x8affca,
      toneMapped: false,
    });
    this.trackDisposables(exitFrameMaterial, exitLightMaterial);
    for (const x of [-6.8, 6.8]) {
      const exit = this.mesh(
        new THREE.BoxGeometry(1.25, 2.2, 0.18),
        exitFrameMaterial,
      );
      exit.position.set(x, 1.15, 15.14);
      exit.name = "ArenaExit";
      this.scene.add(exit);
      const light = this.mesh(
        new THREE.BoxGeometry(0.86, 0.22, 0.08),
        exitLightMaterial,
      );
      light.position.set(x, 2.48, 14.92);
      light.name = "ExitLuminaire";
      this.scene.add(light);
    }

    const boardMaterial = new THREE.MeshBasicMaterial({
      color: 0x063d91,
      map: ledSurface.albedo,
      toneMapped: false,
    });
    this.trackDisposables(boardMaterial);
    const ledMessages = [
      "NOVA AEGIS",
      "AURORA FORUM",
      "VOLT UNION",
      "SPIEL MIT HERZ",
    ] as const;
    const ledPositions = [-6.8, -4.1, 4.1, 6.8] as const;
    for (let index = 0; index < ledPositions.length; index += 1) {
      const x = ledPositions[index];
      const message = ledMessages[index];
      if (x === undefined || message === undefined) {
        continue;
      }
      const board = this.mesh(
        new THREE.BoxGeometry(2.35, 0.72, 0.12),
        boardMaterial,
      );
      board.position.set(x, 0.55, 8.48);
      board.name = "FictionalLedBoard";
      this.scene.add(board);
      const messageTexture = this.materialLibrary.createTextPanelTexture(
        message,
        {
          width: 768,
          height: 192,
          background: "#05275f",
          foreground: "#f4fbff",
          accent: index % 2 === 0 ? "#27c8ff" : "#5d91ff",
          fontPixels: message.length > 16 ? 54 : 66,
        },
      );
      const messageMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: messageTexture,
        toneMapped: false,
      });
      this.trackDisposables(messageMaterial);
      const accent = this.mesh(
        new THREE.PlaneGeometry(2.14, 0.5),
        messageMaterial,
      );
      accent.position.set(x, 0.55, 8.415);
      accent.rotation.y = Math.PI;
      accent.name = "GeneratedLedMessage";
      this.scene.add(accent);
    }

    this.addFictionalBanner(
      -4.15,
      5.25,
      14.98,
      "ENSEMBLE, PLUS FORTS",
      "#0a4cac",
      "#f3f7ff",
    );
    this.addFictionalBanner(
      0,
      5.55,
      14.98,
      "JUNTOS HACIA EL GOL",
      "#123b86",
      "#47cfff",
    );
    this.addFictionalBanner(
      4.15,
      5.25,
      14.98,
      "GEMEINSAM STARK",
      "#0a4cac",
      "#f3f7ff",
    );

    const trussGeometry = new THREE.BoxGeometry(19.4, 0.13, 0.13);
    const trussCrossGeometry = new THREE.BoxGeometry(0.1, 0.1, 2.1);
    const luminaireGeometry = new THREE.BoxGeometry(1.25, 0.08, 0.42);
    this.trackDisposables(
      trussGeometry,
      trussCrossGeometry,
      luminaireGeometry,
    );
    const luminaireMaterial = new THREE.MeshBasicMaterial({
      color: 0xf8fbff,
      toneMapped: false,
    });
    this.trackDisposables(luminaireMaterial);
    const trussDepths = [-0.5, 5, 10.5] as const;
    const trusses = new THREE.InstancedMesh(
      trussGeometry,
      metalMaterial,
      trussDepths.length,
    );
    const trussCrosses = new THREE.InstancedMesh(
      trussCrossGeometry,
      metalMaterial,
      trussDepths.length * 7,
    );
    const luminaires = new THREE.InstancedMesh(
      luminaireGeometry,
      luminaireMaterial,
      trussDepths.length * 4,
    );
    let trussIndex = 0;
    let trussCrossIndex = 0;
    let luminaireIndex = 0;
    for (const z of trussDepths) {
      transform.makeTranslation(0, 8.65, z);
      trusses.setMatrixAt(trussIndex, transform);
      trussIndex += 1;
      for (const x of [-7.5, -5, -2.5, 0, 2.5, 5, 7.5]) {
        transform.makeTranslation(x, 8.65, z);
        trussCrosses.setMatrixAt(trussCrossIndex, transform);
        trussCrossIndex += 1;
      }
      for (const x of [-6, -2, 2, 6]) {
        transform.makeTranslation(x, 8.5, z);
        luminaires.setMatrixAt(luminaireIndex, transform);
        luminaireIndex += 1;
      }
    }
    trusses.instanceMatrix.needsUpdate = true;
    trusses.name = "InstancedArenaRoofTrusses";
    trussCrosses.instanceMatrix.needsUpdate = true;
    trussCrosses.name = "InstancedArenaTrussCrossMembers";
    luminaires.instanceMatrix.needsUpdate = true;
    luminaires.name = "InstancedSportsHallLuminaires";
    this.scene.add(trusses, trussCrosses, luminaires);

    const upperPanelGeometry = new THREE.BoxGeometry(3.1, 1.15, 0.12);
    this.trackDisposables(upperPanelGeometry);
    const upperPanelPositions = [-7.2, -3.6, 0, 3.6, 7.2] as const;
    const upperPanels = new THREE.InstancedMesh(
      upperPanelGeometry,
      acousticMaterial,
      upperPanelPositions.length,
    );
    for (let index = 0; index < upperPanelPositions.length; index += 1) {
      transform.makeTranslation(
        upperPanelPositions[index] ?? 0,
        7.15,
        15.05,
      );
      upperPanels.setMatrixAt(index, transform);
    }
    upperPanels.instanceMatrix.needsUpdate = true;
    upperPanels.name = "InstancedAcousticWallPanels";
    this.scene.add(upperPanels);
  }

  private addFictionalBanner(
    x: number,
    y: number,
    z: number,
    message: string,
    fieldColor: string,
    accentColor: string,
  ): void {
    const bannerTexture = this.materialLibrary.createTextPanelTexture(
      message,
      {
        width: 1024,
        height: 320,
        background: fieldColor,
        foreground: "#f6f9ff",
        accent: accentColor,
        fontPixels: message.length > 18 ? 74 : 88,
      },
    );
    const bannerMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      map: bannerTexture,
    });
    this.trackDisposables(bannerMaterial);
    const banner = this.mesh(
      new THREE.PlaneGeometry(3.45, 1.05),
      bannerMaterial,
    );
    banner.position.set(x, y, z);
    banner.rotation.y = Math.PI;
    banner.name = "FictionalEuropeanBanner";
    this.scene.add(banner);
  }

  private addContactShadows(): THREE.Mesh {
    const shadowTexture = this.materialLibrary.createContactShadowTexture();
    const shadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x02050a,
      map: shadowTexture,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      toneMapped: false,
    });
    this.trackDisposables(shadowMaterial);
    const shooterShadow = this.mesh(
      new THREE.PlaneGeometry(1.15, 0.72),
      shadowMaterial,
    );
    shooterShadow.rotation.x = -Math.PI / 2;
    shooterShadow.position.set(-0.78, 0.021, -0.38);
    shooterShadow.renderOrder = 2;
    shooterShadow.name = "ShooterGeneratedContactShadow";
    this.scene.add(shooterShadow);

    const goalkeeperShadow = this.mesh(
      new THREE.PlaneGeometry(1.28, 0.66),
      shadowMaterial,
    );
    goalkeeperShadow.rotation.x = -Math.PI / 2;
    goalkeeperShadow.position.set(0, 0.021, GOAL_Z - 0.08);
    goalkeeperShadow.renderOrder = 2;
    goalkeeperShadow.name = "GoalkeeperGeneratedContactShadow";
    this.scene.add(goalkeeperShadow);

    const goalShadow = this.mesh(
      new THREE.PlaneGeometry(3.6, 0.82),
      shadowMaterial,
    );
    goalShadow.rotation.x = -Math.PI / 2;
    goalShadow.position.set(0, 0.02, GOAL_Z + 0.18);
    goalShadow.scale.y = 0.74;
    goalShadow.renderOrder = 2;
    goalShadow.name = "GoalGeneratedContactShadow";
    this.scene.add(goalShadow);
    return goalkeeperShadow;
  }

  private addFloorRectangle(
    width: number,
    depth: number,
    x: number,
    z: number,
    material: THREE.Material,
    name: string,
  ): void {
    const marking = this.mesh(
      new THREE.PlaneGeometry(width, depth),
      material,
    );
    marking.rotation.x = -Math.PI / 2;
    marking.position.set(x, 0.018, z);
    marking.name = name;
    this.scene.add(marking);
  }

  private shaderProgramCount(): number {
    return this.renderer.info.programs?.length ?? 0;
  }

  private rendererDiagnostics(): Readonly<{
    acceleration: "hardware" | "software" | "unknown";
    renderer: string;
    vendor: string;
    version: string;
  }> {
    const context = this.renderer.getContext();
    const debugInfo = context.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      debugInfo === null
        ? context.getParameter(context.RENDERER)
        : context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    );
    const vendor = String(
      debugInfo === null
        ? context.getParameter(context.VENDOR)
        : context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
    );
    const version = String(context.getParameter(context.VERSION));
    const normalized = `${renderer} ${vendor}`.toLowerCase();
    const softwarePatterns = [
      "swiftshader",
      "llvmpipe",
      "softpipe",
      "software rasterizer",
      "microsoft basic render",
    ];
    const maskedRendererPatterns = [
      "webkit webgl",
      "mozilla",
      "generic renderer",
    ];
    const acceleration = softwarePatterns.some((pattern) =>
      normalized.includes(pattern)
    )
      ? "software"
      : renderer.trim().length === 0 ||
          renderer.toLowerCase() === "unknown" ||
          maskedRendererPatterns.some((pattern) =>
            normalized.includes(pattern)
          )
        ? "unknown"
        : "hardware";
    return Object.freeze({ acceleration, renderer, vendor, version });
  }

  private mesh<Geometry extends THREE.BufferGeometry, Material extends THREE.Material>(
    geometry: Geometry,
    material: Material,
  ): THREE.Mesh<Geometry, Material> {
    this.trackDisposables(geometry, material);
    return new THREE.Mesh(geometry, material);
  }

  private trackDisposables(
    ...resources: Array<THREE.BufferGeometry | THREE.Material>
  ): void {
    for (const resource of resources) {
      this.disposables.add(resource);
    }
  }
}
