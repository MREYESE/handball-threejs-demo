import * as THREE from "three";
import type { QualityConfig, QualityPreset } from "../../core/Quality";
import type { Disposable } from "../../core/ResourceTracker";
import type { Vec3 } from "../../domain/math";
import type { ShotOutcome } from "../../domain/shot/outcome";

export interface ArcadeFxFrame {
  readonly ballPosition: Vec3;
  readonly shotProgress: number;
  readonly resultProgress: number;
  readonly simulationSeconds: number;
}

export interface ArcadeFxLimits {
  readonly ribbonPoints: number;
  readonly speedLines: number;
  readonly particles: number;
}

export interface OutcomeColorLanguage {
  readonly label: string;
  readonly colorHex: string;
  readonly threeColor: number;
}

export interface ArcadeFxDiagnostics {
  readonly limits: ArcadeFxLimits;
  readonly reducedMotion: boolean;
  readonly phase: "READY" | "FLIGHT" | "RESULT";
  readonly activeRibbonPoints: number;
  readonly activeSpeedLines: number;
  readonly activeParticles: number;
  readonly releaseBursts: number;
  readonly impactBursts: number;
  readonly outcomeBursts: Readonly<Record<ShotOutcome, number>>;
  readonly currentOutcome: ShotOutcome | null;
  readonly currentOutcomeColor: string | null;
  readonly resultEffectsStartedAfterOutcome: boolean;
  readonly cameraImpulsePixels: Readonly<{ x: number; y: number }>;
}

export const ARCADE_FX_LIMITS: Readonly<
  Record<QualityPreset, ArcadeFxLimits>
> = Object.freeze({
  balanced: Object.freeze({
    ribbonPoints: 18,
    speedLines: 6,
    particles: 24,
  }),
  high: Object.freeze({
    ribbonPoints: 24,
    speedLines: 10,
    particles: 36,
  }),
  capture: Object.freeze({
    ribbonPoints: 28,
    speedLines: 12,
    particles: 48,
  }),
});

export const OUTCOME_COLOR_LANGUAGE: Readonly<
  Record<ShotOutcome, OutcomeColorLanguage>
> = Object.freeze({
  GOAL: Object.freeze({
    label: "Goal surge",
    colorHex: "#4dff87",
    threeColor: 0x4dff87,
  }),
  SAVED: Object.freeze({
    label: "Keeper shield",
    colorHex: "#4ed8ff",
    threeColor: 0x4ed8ff,
  }),
  MISS: Object.freeze({
    label: "Miss warning",
    colorHex: "#ff725f",
    threeColor: 0xff725f,
  }),
});

export const ARCADE_RIBBON_STYLE = Object.freeze({
  tailHalfWidthMeters: 0.006,
  headHalfWidthMeters: 0.038,
  opacity: 0.56,
});

const GOLD_COLOR = 0xffb43b;
const RELEASE_DURATION_SECONDS = 0.22;
const IMPACT_DURATION_SECONDS = 0.48;
const RELEASE_IMPULSE_SECONDS = 0.14;
const RESULT_IMPULSE_SECONDS = 0.24;
const SHOT_BOUNDS = new THREE.Sphere(
  new THREE.Vector3(0, 1.4, 3.5),
  6,
);

type FxPhase = "READY" | "FLIGHT" | "RESULT";
type ParticleMode = "RELEASE" | "IMPACT" | null;

export class ArcadeEffects implements Disposable {
  public readonly root = new THREE.Group();
  private readonly limits: ArcadeFxLimits;
  private readonly camera: THREE.Camera;
  private readonly ribbonHistory: Float32Array;
  private readonly ribbonPositions: Float32Array;
  private readonly ribbonGeometry = new THREE.BufferGeometry();
  private readonly ribbonMaterial = new THREE.MeshBasicMaterial({
    color: GOLD_COLOR,
    transparent: true,
    opacity: ARCADE_RIBBON_STYLE.opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false,
  });
  private readonly speedLinePositions: Float32Array;
  private readonly speedLineGeometry = new THREE.BufferGeometry();
  private readonly speedLineMaterial = new THREE.LineBasicMaterial({
    color: 0xffd477,
    transparent: true,
    opacity: 0.46,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  private readonly particlePositions: Float32Array;
  private readonly particleGeometry = new THREE.BufferGeometry();
  private readonly particleMaterial = new THREE.LineBasicMaterial({
    color: GOLD_COLOR,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  private readonly tempPrevious = new THREE.Vector3();
  private readonly tempNext = new THREE.Vector3();
  private readonly tempPoint = new THREE.Vector3();
  private readonly tempDirection = new THREE.Vector3();
  private readonly tempView = new THREE.Vector3();
  private readonly tempSide = new THREE.Vector3();
  private readonly releaseOrigin = new THREE.Vector3();
  private readonly impactOrigin = new THREE.Vector3();
  private readonly cameraImpulsePixels = { x: 0, y: 0 };
  private phase: FxPhase = "READY";
  private particleMode: ParticleMode = null;
  private currentOutcome: ShotOutcome | null = null;
  private reducedMotion = false;
  private ribbonPointCount = 0;
  private activeSpeedLines = 0;
  private activeParticles = 0;
  private previousShotProgress = 0;
  private releaseAtSeconds = Number.NEGATIVE_INFINITY;
  private impactAtSeconds = Number.NEGATIVE_INFINITY;
  private releasePower = 0;
  private releaseBursts = 0;
  private impactBursts = 0;
  private readonly outcomeBursts: Record<ShotOutcome, number> = {
    GOAL: 0,
    SAVED: 0,
    MISS: 0,
  };

  public constructor(quality: QualityConfig, camera: THREE.Camera) {
    this.limits = ARCADE_FX_LIMITS[quality.name];
    this.camera = camera;
    this.root.name = "BoundedArcadeEffects";
    this.root.userData["qualityPreset"] = quality.name;
    this.root.userData["ownsScoring"] = false;
    // Keep the pool visible until renderer pre-warm has compiled its material
    // variants. GameplayScene hides it before the first live frame.
    this.root.visible = true;

    this.ribbonHistory = new Float32Array(this.limits.ribbonPoints * 3);
    this.ribbonPositions = new Float32Array(
      this.limits.ribbonPoints * 2 * 3,
    );
    const ribbonIndices = new Uint16Array(
      Math.max(0, this.limits.ribbonPoints - 1) * 6,
    );
    for (let index = 0; index < this.limits.ribbonPoints - 1; index += 1) {
      const vertex = index * 2;
      const offset = index * 6;
      ribbonIndices[offset] = vertex;
      ribbonIndices[offset + 1] = vertex + 1;
      ribbonIndices[offset + 2] = vertex + 2;
      ribbonIndices[offset + 3] = vertex + 1;
      ribbonIndices[offset + 4] = vertex + 3;
      ribbonIndices[offset + 5] = vertex + 2;
    }
    this.ribbonGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.ribbonPositions, 3),
    );
    this.ribbonGeometry.setIndex(
      new THREE.BufferAttribute(ribbonIndices, 1),
    );
    this.ribbonGeometry.setDrawRange(0, 0);
    this.ribbonGeometry.boundingSphere = SHOT_BOUNDS.clone();
    const ribbon = new THREE.Mesh(
      this.ribbonGeometry,
      this.ribbonMaterial,
    );
    ribbon.name = "WarmGoldBallRibbon";
    ribbon.renderOrder = 4;
    this.root.add(ribbon);

    this.speedLinePositions = new Float32Array(
      this.limits.speedLines * 2 * 3,
    );
    this.speedLineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.speedLinePositions, 3),
    );
    this.speedLineGeometry.setDrawRange(0, 0);
    this.speedLineGeometry.boundingSphere = SHOT_BOUNDS.clone();
    const speedLines = new THREE.LineSegments(
      this.speedLineGeometry,
      this.speedLineMaterial,
    );
    speedLines.name = "RestrainedBallSpeedLines";
    speedLines.renderOrder = 3;
    this.root.add(speedLines);

    // Short generated spark segments reuse the warmed line shader instead of
    // adding a PointsMaterial program to the live balanced path.
    this.particlePositions = new Float32Array(
      this.limits.particles * 2 * 3,
    );
    this.particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.particlePositions, 3),
    );
    this.particleGeometry.setDrawRange(0, 0);
    this.particleGeometry.boundingSphere = SHOT_BOUNDS.clone();
    const particles = new THREE.LineSegments(
      this.particleGeometry,
      this.particleMaterial,
    );
    particles.name = "BoundedReleaseImpactParticles";
    particles.renderOrder = 6;
    this.root.add(particles);
  }

  public setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    if (reducedMotion) {
      this.speedLineGeometry.setDrawRange(0, 0);
      this.particleGeometry.setDrawRange(0, 0);
      this.activeSpeedLines = 0;
      this.activeParticles = 0;
      this.cameraImpulsePixels.x = 0;
      this.cameraImpulsePixels.y = 0;
    }
  }

  public beginShot(
    origin: Vec3,
    power: number,
    simulationSeconds: number,
  ): void {
    this.root.visible = true;
    this.phase = "FLIGHT";
    this.currentOutcome = null;
    this.releasePower = THREE.MathUtils.clamp(power, 0, 1);
    this.releaseAtSeconds = simulationSeconds;
    this.impactAtSeconds = Number.NEGATIVE_INFINITY;
    this.releaseOrigin.set(origin.x, origin.y, origin.z);
    this.particleMode = "RELEASE";
    this.releaseBursts += 1;
    this.previousShotProgress = 0;
    this.clearRibbon();
    this.appendRibbonPoint(origin);
    this.configureParticleColor(GOLD_COLOR);
  }

  public resolveOutcome(
    outcome: ShotOutcome,
    impactPosition: Vec3,
    simulationSeconds: number,
  ): void {
    if (this.phase !== "FLIGHT" || this.currentOutcome !== null) {
      return;
    }
    this.phase = "RESULT";
    this.currentOutcome = outcome;
    this.impactAtSeconds = simulationSeconds;
    this.impactOrigin.set(
      impactPosition.x,
      impactPosition.y,
      impactPosition.z,
    );
    this.particleMode = "IMPACT";
    this.impactBursts += 1;
    this.outcomeBursts[outcome] += 1;
    const language = OUTCOME_COLOR_LANGUAGE[outcome];
    this.configureParticleColor(language.threeColor);
  }

  public resetVisuals(): void {
    this.root.visible = false;
    this.phase = "READY";
    this.currentOutcome = null;
    this.particleMode = null;
    this.previousShotProgress = 0;
    this.clearRibbon();
    this.speedLineGeometry.setDrawRange(0, 0);
    this.particleGeometry.setDrawRange(0, 0);
    this.activeSpeedLines = 0;
    this.activeParticles = 0;
    this.cameraImpulsePixels.x = 0;
    this.cameraImpulsePixels.y = 0;
  }

  public update(frame: ArcadeFxFrame): void {
    if (this.phase === "READY") {
      return;
    }

    if (
      this.phase === "FLIGHT" &&
      frame.shotProgress > this.previousShotProgress + Number.EPSILON
    ) {
      this.appendRibbonPoint(frame.ballPosition);
      this.previousShotProgress = frame.shotProgress;
    }

    const ribbonFade =
      this.phase === "RESULT"
        ? Math.max(0, 1 - frame.resultProgress * 1.35)
        : 1;
    this.ribbonMaterial.opacity = ARCADE_RIBBON_STYLE.opacity * ribbonFade;
    this.updateSpeedLines(frame);
    this.updateParticles(frame.simulationSeconds);
    this.updateCameraImpulse(frame.simulationSeconds);
  }

  public screenImpulse(): Readonly<{ x: number; y: number }> {
    return this.cameraImpulsePixels;
  }

  public diagnostics(): ArcadeFxDiagnostics {
    return Object.freeze({
      limits: this.limits,
      reducedMotion: this.reducedMotion,
      phase: this.phase,
      activeRibbonPoints: this.ribbonPointCount,
      activeSpeedLines: this.activeSpeedLines,
      activeParticles: this.activeParticles,
      releaseBursts: this.releaseBursts,
      impactBursts: this.impactBursts,
      outcomeBursts: Object.freeze({ ...this.outcomeBursts }),
      currentOutcome: this.currentOutcome,
      currentOutcomeColor:
        this.currentOutcome === null
          ? null
          : OUTCOME_COLOR_LANGUAGE[this.currentOutcome].colorHex,
      resultEffectsStartedAfterOutcome:
        this.impactBursts ===
        this.outcomeBursts.GOAL +
          this.outcomeBursts.SAVED +
          this.outcomeBursts.MISS,
      cameraImpulsePixels: Object.freeze({
        x: this.cameraImpulsePixels.x,
        y: this.cameraImpulsePixels.y,
      }),
    });
  }

  public dispose(): void {
    this.ribbonGeometry.dispose();
    this.ribbonMaterial.dispose();
    this.speedLineGeometry.dispose();
    this.speedLineMaterial.dispose();
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
  }

  private clearRibbon(): void {
    this.ribbonPointCount = 0;
    this.ribbonGeometry.setDrawRange(0, 0);
  }

  private appendRibbonPoint(point: Vec3): void {
    if (this.ribbonPointCount >= this.limits.ribbonPoints) {
      this.ribbonHistory.copyWithin(0, 3);
      this.ribbonPointCount = this.limits.ribbonPoints - 1;
    }
    const offset = this.ribbonPointCount * 3;
    this.ribbonHistory[offset] = point.x;
    this.ribbonHistory[offset + 1] = point.y;
    this.ribbonHistory[offset + 2] = point.z;
    this.ribbonPointCount += 1;
    this.rebuildRibbon();
  }

  private rebuildRibbon(): void {
    const pointCount = this.ribbonPointCount;
    for (let index = 0; index < pointCount; index += 1) {
      const previousIndex = Math.max(0, index - 1) * 3;
      const nextIndex = Math.min(pointCount - 1, index + 1) * 3;
      const pointIndex = index * 3;
      this.tempPrevious.fromArray(this.ribbonHistory, previousIndex);
      this.tempNext.fromArray(this.ribbonHistory, nextIndex);
      this.tempPoint.fromArray(this.ribbonHistory, pointIndex);
      this.tempDirection.subVectors(this.tempNext, this.tempPrevious);
      if (this.tempDirection.lengthSq() < 0.000001) {
        this.tempDirection.set(0, 0, 1);
      } else {
        this.tempDirection.normalize();
      }
      this.tempView.subVectors(this.camera.position, this.tempPoint);
      if (this.tempView.lengthSq() < 0.000001) {
        this.tempView.set(0, 1, 0);
      } else {
        this.tempView.normalize();
      }
      this.tempSide.crossVectors(this.tempDirection, this.tempView);
      if (this.tempSide.lengthSq() < 0.000001) {
        this.tempSide.set(1, 0, 0);
      } else {
        this.tempSide.normalize();
      }
      const age = pointCount <= 1 ? 1 : index / (pointCount - 1);
      const width = THREE.MathUtils.lerp(
        ARCADE_RIBBON_STYLE.tailHalfWidthMeters,
        ARCADE_RIBBON_STYLE.headHalfWidthMeters,
        age,
      );
      const vertexOffset = index * 6;
      this.ribbonPositions[vertexOffset] =
        this.tempPoint.x + this.tempSide.x * width;
      this.ribbonPositions[vertexOffset + 1] =
        this.tempPoint.y + this.tempSide.y * width;
      this.ribbonPositions[vertexOffset + 2] =
        this.tempPoint.z + this.tempSide.z * width;
      this.ribbonPositions[vertexOffset + 3] =
        this.tempPoint.x - this.tempSide.x * width;
      this.ribbonPositions[vertexOffset + 4] =
        this.tempPoint.y - this.tempSide.y * width;
      this.ribbonPositions[vertexOffset + 5] =
        this.tempPoint.z - this.tempSide.z * width;

    }
    this.ribbonGeometry.getAttribute("position").needsUpdate = true;
    this.ribbonGeometry.setDrawRange(0, Math.max(0, pointCount - 1) * 6);
  }

  private updateSpeedLines(frame: ArcadeFxFrame): void {
    if (
      this.reducedMotion ||
      this.phase !== "FLIGHT" ||
      frame.shotProgress < 0.08 ||
      frame.shotProgress > 0.94
    ) {
      if (this.activeSpeedLines !== 0) {
        this.speedLineGeometry.setDrawRange(0, 0);
      }
      this.activeSpeedLines = 0;
      return;
    }

    const active = this.limits.speedLines;
    const length = 0.18 + this.releasePower * 0.26;
    for (let index = 0; index < active; index += 1) {
      const angle =
        index * 2.399963229728653 +
        frame.simulationSeconds * (index % 2 === 0 ? 0.7 : -0.5);
      const radius = 0.2 + (index % 3) * 0.095;
      const x = frame.ballPosition.x + Math.cos(angle) * radius;
      const y = frame.ballPosition.y + Math.sin(angle) * radius * 0.7;
      const z = frame.ballPosition.z - 0.22 - (index % 4) * 0.09;
      const offset = index * 6;
      this.speedLinePositions[offset] = x;
      this.speedLinePositions[offset + 1] = y;
      this.speedLinePositions[offset + 2] = z;
      this.speedLinePositions[offset + 3] = x * 0.998;
      this.speedLinePositions[offset + 4] = y - 0.015;
      this.speedLinePositions[offset + 5] = z - length;
    }
    this.speedLineGeometry.getAttribute("position").needsUpdate = true;
    this.speedLineGeometry.setDrawRange(0, active * 2);
    this.activeSpeedLines = active;
  }

  private updateParticles(simulationSeconds: number): void {
    if (this.reducedMotion || this.particleMode === null) {
      if (this.activeParticles !== 0) {
        this.particleGeometry.setDrawRange(0, 0);
      }
      this.activeParticles = 0;
      return;
    }

    const startedAt =
      this.particleMode === "RELEASE"
        ? this.releaseAtSeconds
        : this.impactAtSeconds;
    const duration =
      this.particleMode === "RELEASE"
        ? RELEASE_DURATION_SECONDS
        : IMPACT_DURATION_SECONDS;
    const elapsed = Math.max(0, simulationSeconds - startedAt);
    if (elapsed >= duration) {
      this.particleGeometry.setDrawRange(0, 0);
      this.activeParticles = 0;
      this.particleMode = null;
      return;
    }

    const origin =
      this.particleMode === "RELEASE"
        ? this.releaseOrigin
        : this.impactOrigin;
    const progress = elapsed / duration;
    const active = this.limits.particles;
    for (let index = 0; index < active; index += 1) {
      const angle = index * 2.399963229728653;
      const band = 0.45 + (index % 5) * 0.11;
      const spread =
        this.particleMode === "RELEASE"
          ? progress * (0.18 + this.releasePower * 0.34)
          : progress * 0.78;
      const verticalBias =
        this.particleMode === "RELEASE" ? 0.04 : 0.18 * progress;
      const startOffset = index * 6;
      const endOffset = startOffset + 3;
      const x = origin.x + Math.cos(angle) * spread * band;
      const y =
        origin.y +
        Math.sin(angle) * spread * band +
        verticalBias -
        progress * progress * 0.12;
      const z =
        origin.z +
        Math.sin(angle * 0.63) * spread * 0.45 -
        (this.particleMode === "RELEASE" ? progress * 0.12 : 0);
      const sparkLength =
        (this.particleMode === "RELEASE" ? 0.035 : 0.065) *
        (1 - progress);
      this.particlePositions[startOffset] = x;
      this.particlePositions[startOffset + 1] = y;
      this.particlePositions[startOffset + 2] = z;
      this.particlePositions[endOffset] =
        x + Math.cos(angle) * sparkLength;
      this.particlePositions[endOffset + 1] =
        y + Math.sin(angle) * sparkLength;
      this.particlePositions[endOffset + 2] =
        z + Math.sin(angle * 0.63) * sparkLength;
    }
    this.particleMaterial.opacity = Math.max(0, 1 - progress);
    this.particleGeometry.getAttribute("position").needsUpdate = true;
    this.particleGeometry.setDrawRange(0, active * 2);
    this.activeParticles = active;
  }

  private configureParticleColor(colorHex: number): void {
    this.particleMaterial.color.setHex(colorHex);
  }

  private updateCameraImpulse(simulationSeconds: number): void {
    if (this.reducedMotion) {
      this.cameraImpulsePixels.x = 0;
      this.cameraImpulsePixels.y = 0;
      return;
    }

    if (this.phase === "FLIGHT") {
      const elapsed = simulationSeconds - this.releaseAtSeconds;
      if (elapsed >= 0 && elapsed < RELEASE_IMPULSE_SECONDS) {
        const envelope = Math.sin(
          (elapsed / RELEASE_IMPULSE_SECONDS) * Math.PI,
        );
        const amplitude = 2.2 + this.releasePower * 1.8;
        this.cameraImpulsePixels.x = -amplitude * envelope;
        this.cameraImpulsePixels.y = amplitude * 0.32 * envelope;
        return;
      }
    }

    if (this.phase === "RESULT" && this.currentOutcome !== null) {
      const elapsed = simulationSeconds - this.impactAtSeconds;
      if (elapsed >= 0 && elapsed < RESULT_IMPULSE_SECONDS) {
        const envelope = 1 - elapsed / RESULT_IMPULSE_SECONDS;
        const outcomeAmplitude =
          this.currentOutcome === "SAVED"
            ? 4
            : this.currentOutcome === "GOAL"
              ? 3.2
              : 2.2;
        this.cameraImpulsePixels.x =
          Math.sin(elapsed * 155) * outcomeAmplitude * envelope;
        this.cameraImpulsePixels.y =
          Math.sin(elapsed * 119 + 0.7) *
          outcomeAmplitude *
          0.55 *
          envelope;
        return;
      }
    }

    this.cameraImpulsePixels.x = 0;
    this.cameraImpulsePixels.y = 0;
  }
}
