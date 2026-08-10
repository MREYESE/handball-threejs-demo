import {
  STANDARD_GESTURE_CONFIG,
  STANDARD_GOAL_CONFIG,
  STANDARD_GOALKEEPER_CONFIG,
  STANDARD_MATCH_CONFIG,
  STANDARD_RELEASE_POSITION,
  STANDARD_TRAJECTORY_CONFIG,
} from "../config/defaults";
import { SynthAudio } from "../audio/SynthAudio";
import { Engine } from "../core/Engine";
import { EventBus } from "../core/EventBus";
import {
  getQualityConfig,
  type QualityConfig,
  type QualityPreset,
  type RuntimeMode,
} from "../core/Quality";
import { ResourceTracker } from "../core/ResourceTracker";
import { SeededRng } from "../core/SeededRng";
import {
  captureSceneDefinition,
  type CaptureSceneName,
} from "../dev/CaptureScenes";
import type {
  GestureRejectionReason,
  StandardShotGesture,
} from "../domain/gesture/model";
import {
  chooseGoalkeeperZone,
  goalkeeperDiveProgress,
  goalkeeperPositionDuringShot,
  goalkeeperReturnPosition,
  type GoalkeeperZone,
} from "../domain/goalkeeper/zones";
import {
  beginShot,
  createMatchState,
  prepareNextShot,
  resolveMatchShot,
  restartMatch,
  type MatchState,
} from "../domain/match/state";
import type { Vec3 } from "../domain/math";
import { resolveShotOutcome, type ShotOutcome } from "../domain/shot/outcome";
import { mapAimToGoalTarget } from "../domain/shot/target";
import {
  evaluateStandardTrajectory,
  standardShotDuration,
} from "../domain/shot/trajectory";
import {
  PointerGestureInput,
  type AcceptedPointerGesture,
} from "../input/PointerGestureInput";
import {
  GameplayScene,
  type KeeperVisualPhase,
  type ShooterVisualPhase,
} from "../presentation/GameplayScene";
import { GameHud } from "../ui/GameHud";

interface AppEvents {
  lifecycle: Readonly<{ state: AppState }>;
  shotReleased: Readonly<{
    power: number;
    durationSeconds: number;
    shotNumber: number;
    simulationSeconds: number;
  }>;
  outcome: Readonly<{
    outcome: ShotOutcome;
    shotNumber: number;
    target: Vec3;
    simulationSeconds: number;
  }>;
}

export type AppState = "created" | "running" | "disposed";

export interface HandballDemoOptions {
  readonly quality?: QualityPreset;
  readonly seed?: number;
  readonly manualTime?: boolean;
}

interface ActiveShot {
  readonly power: number;
  readonly target: Vec3;
  readonly durationSeconds: number;
  readonly keeperZone: GoalkeeperZone;
  readonly keeperArrivalPosition: Vec3;
  readonly plannedOutcome: ShotOutcome;
  elapsedSeconds: number;
  resultElapsedSeconds: number;
  resolved: boolean;
}

export interface AppSnapshot {
  readonly state: AppState;
  readonly quality: QualityPreset;
  readonly simulationSeconds: number;
  readonly sessionSeed: number;
  readonly inputEnabled: boolean;
  readonly acceptedShots: number;
  readonly resolvedShots: number;
  readonly rejectedGestures: number;
  readonly lastGestureRejectionReason: GestureRejectionReason | null;
  readonly resizeListenerCount: number;
  readonly outcomes: readonly ShotOutcome[];
  readonly lastPointerType: string | null;
  readonly match: MatchState;
  readonly activeShot: Readonly<{
    target: Vec3;
    power: number;
    elapsedSeconds: number;
    durationSeconds: number;
    keeperZone: GoalkeeperZone;
    plannedOutcome: ShotOutcome;
    resolved: boolean;
  }> | null;
  readonly feedback: Readonly<{
    audio: ReturnType<SynthAudio["diagnostics"]>;
    hud: ReturnType<GameHud["diagnostics"]>;
  }>;
  readonly scene: ReturnType<GameplayScene["diagnostics"]>;
}

export interface AppPerformanceSnapshot {
  readonly quality: QualityPreset;
  readonly runtimeMode: RuntimeMode;
  readonly selectedQuality: QualityConfig;
  readonly bootTimeMilliseconds: number;
  readonly inputActivatedAfterPrewarm: boolean;
  readonly prewarmComplete: boolean;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly shaderPrograms: number;
  readonly prewarmedShaderPrograms: number;
  readonly shaderProgramsStableSincePrewarm: boolean;
  readonly appliedPixelRatio: number;
  readonly maximumPixelRatio: number;
  readonly crowdInstances: number;
  readonly animatedCrowdInstances: number;
  readonly renderer: ReturnType<GameplayScene["diagnostics"]>["renderer"];
  readonly measuredShot: ReturnType<GameplayScene["diagnostics"]>["performance"];
}

const FIXED_STEP_SECONDS = 1 / 60;
const READY_PRESENTATION_STEP_SECONDS = 1 / 20;

export class HandballDemoApp {
  private readonly bootStartedAtMilliseconds = performance.now();
  private readonly events = new EventBus<AppEvents>();
  private readonly resources = new ResourceTracker();
  private readonly quality: QualityPreset;
  private readonly qualityConfig: QualityConfig;
  private readonly sessionSeed: number;
  private readonly manualTime: boolean;
  private readonly audio: SynthAudio;
  private readonly hud: GameHud;
  private readonly scene: GameplayScene;
  private readonly input: PointerGestureInput;
  private readonly engine: Engine;
  private keeperRng: SeededRng;
  private match: MatchState = createMatchState();
  private activeShot: ActiveShot | null = null;
  private outcomeHistory: ShotOutcome[] = [];
  private state: AppState = "created";
  private acceptedShots = 0;
  private resolvedShots = 0;
  private rejectedGestures = 0;
  private lastGestureRejectionReason: GestureRejectionReason | null = null;
  private lastPointerType: string | null = null;
  private displayedPower = 0;
  private resizeListenerAttached = false;
  private bootTimeMilliseconds = 0;
  private inputActivatedAfterPrewarm = false;
  private audioEnabled = true;
  private reducedMotion = false;
  private roundSummaryVisible = false;
  private nextReadyPresentationSeconds = 0;

  public constructor(
    private readonly root: HTMLElement,
    options: HandballDemoOptions = {},
  ) {
    this.quality = options.quality ?? "balanced";
    this.sessionSeed = (options.seed ?? 0x7a11ce) >>> 0;
    this.manualTime = options.manualTime ?? false;
    if (this.quality === "capture" && !this.manualTime) {
      throw new Error(
        "The capture quality preset is restricted to fixed-frame capture mode.",
      );
    }
    this.qualityConfig = getQualityConfig(this.quality);
    this.keeperRng = new SeededRng(this.sessionSeed).fork("keeper");
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    this.audio = this.resources.track(
      new SynthAudio({
        enabled: this.audioEnabled,
        outputEnabled: !this.manualTime,
      }),
    );
    this.hud = new GameHud(root, {
      onRestart: () => this.restart(),
      onAudioChanged: (enabled) => this.setAudioEnabled(enabled),
      onReducedMotionChanged: (reducedMotion) =>
        this.setReducedMotion(reducedMotion),
      audioEnabled: this.audioEnabled,
      reducedMotion: this.reducedMotion,
    });
    this.scene = this.resources.track(
      new GameplayScene(this.hud.canvas, this.qualityConfig),
    );
    this.scene.setReducedMotion(this.reducedMotion);
    this.input = this.resources.track(
      new PointerGestureInput(
        this.hud.canvas,
        STANDARD_GESTURE_CONFIG,
        {
          onAccepted: (result) => this.acceptGesture(result),
          onRejected: (reason) => {
            this.rejectedGestures += 1;
            this.lastGestureRejectionReason = reason;
            this.hud.presentRejectedGesture(reason);
          },
          onTrailChanged: (points, viewport) => {
            this.hud.setTrail(points, viewport);
          },
        },
      ),
    );
    this.input.setEnabled(false);

    this.engine = this.resources.track(
      new Engine({
        fixedStepSeconds: FIXED_STEP_SECONDS,
        manualPumping: this.manualTime,
        onFixedUpdate: (stepSeconds, simulationSeconds) => {
          this.fixedUpdate(stepSeconds, simulationSeconds);
        },
        onPresent: () => {
          this.scene.render();
        },
      }),
    );

    this.resources.add(
      this.events.on("shotReleased", (event) => {
        this.scene.beginShotFeedback(
          STANDARD_RELEASE_POSITION,
          event.power,
          event.simulationSeconds,
        );
        this.hud.presentShot(event.power);
        this.audio.shotReleased(event.power, event.durationSeconds);
      }),
    );
    this.resources.add(
      this.events.on("outcome", (event) => {
        this.scene.resolveShotFeedback(
          event.outcome,
          event.target,
          event.simulationSeconds,
        );
        this.hud.presentOutcome(event.outcome);
        this.audio.outcome(event.outcome);
      }),
    );

    this.bindResizeListener();
    this.resources.add(() => this.unbindResizeListener());
    this.resources.add(() => {
      this.events.clear();
    });

    root.dataset.quality = this.quality;
    root.dataset.runtimeMode = this.manualTime ? "capture" : "gameplay";
    root.dataset.appState = this.state;
    root.dataset.acceptedShots = "0";
    root.dataset.resolvedShots = "0";
    this.resize();
    this.forceReadyVisuals(0);
    this.updateHud();
  }

  public async start(): Promise<void> {
    if (this.state !== "created") {
      throw new Error(`Cannot start app from '${this.state}' state.`);
    }

    this.state = "running";
    this.root.dataset.appState = "warming";
    this.events.emit("lifecycle", { state: this.state });
    this.hud.setStatus("Preparing arena materials and lights…");
    await this.scene.prewarm();
    if (this.hasBeenDisposed()) {
      return;
    }
    this.engine.start();
    this.bootTimeMilliseconds =
      performance.now() - this.bootStartedAtMilliseconds;
    this.inputActivatedAfterPrewarm = true;
    this.root.dataset.appState = "ready";
    this.setInputEnabled(true);
    this.hud.setStatus("Court ready. Swipe upward to shoot.");
  }

  public snapshot(): AppSnapshot {
    const activeShot =
      this.activeShot === null
        ? null
        : Object.freeze({
            target: this.activeShot.target,
            power: this.activeShot.power,
            elapsedSeconds: this.activeShot.elapsedSeconds,
            durationSeconds: this.activeShot.durationSeconds,
            keeperZone: this.activeShot.keeperZone,
            plannedOutcome: this.activeShot.plannedOutcome,
            resolved: this.activeShot.resolved,
          });
    return Object.freeze({
      state: this.state,
      quality: this.quality,
      simulationSeconds: this.engine.simulationSeconds,
      sessionSeed: this.sessionSeed,
      inputEnabled: this.isInputEnabled(),
      acceptedShots: this.acceptedShots,
      resolvedShots: this.resolvedShots,
      rejectedGestures: this.rejectedGestures,
      lastGestureRejectionReason: this.lastGestureRejectionReason,
      resizeListenerCount: this.resizeListenerAttached ? 1 : 0,
      outcomes: Object.freeze([...this.outcomeHistory]),
      lastPointerType: this.lastPointerType,
      match: this.match,
      activeShot,
      feedback: Object.freeze({
        audio: this.audio.diagnostics(),
        hud: this.hud.diagnostics(),
      }),
      scene: this.scene.diagnostics(),
    });
  }

  public performanceSnapshot(): AppPerformanceSnapshot {
    const scene = this.scene.diagnostics();
    return Object.freeze({
      quality: this.quality,
      runtimeMode: this.manualTime ? "capture" : "gameplay",
      selectedQuality: this.qualityConfig,
      bootTimeMilliseconds: this.bootTimeMilliseconds,
      inputActivatedAfterPrewarm: this.inputActivatedAfterPrewarm,
      prewarmComplete: scene.prewarmComplete,
      drawCalls: scene.renderCalls,
      triangles: scene.renderedTriangles,
      shaderPrograms: scene.shaderPrograms,
      prewarmedShaderPrograms: scene.prewarmedShaderPrograms,
      shaderProgramsStableSincePrewarm:
        scene.shaderProgramsStableSincePrewarm,
      appliedPixelRatio: scene.appliedPixelRatio,
      maximumPixelRatio: scene.maximumPixelRatio,
      crowdInstances: scene.crowd.totalInstances,
      animatedCrowdInstances: scene.crowd.animatedInstances,
      renderer: scene.renderer,
      measuredShot: scene.performance,
    });
  }

  public restart(): void {
    if (this.match.phase !== "ROUND_COMPLETE") {
      return;
    }
    this.match = restartMatch();
    this.keeperRng = new SeededRng(this.sessionSeed).fork("keeper");
    this.activeShot = null;
    this.acceptedShots = 0;
    this.resolvedShots = 0;
    this.rejectedGestures = 0;
    this.lastGestureRejectionReason = null;
    this.outcomeHistory = [];
    this.lastPointerType = null;
    this.displayedPower = 0;
    this.roundSummaryVisible = false;
    this.hud.clearTrail();
    this.hud.resetRoundFeedback();
    this.scene.resetFeedback();
    this.forceReadyVisuals(this.engine.simulationSeconds);
    this.setInputEnabled(true);
    this.audio.uiConfirm();
    this.hud.setStatus("New round ready.");
  }

  public pumpFrames(frameCount: number): void {
    this.engine.pumpFrames(frameCount);
  }

  public presentFrames(frameCount: number): void {
    this.engine.presentFrames(frameCount);
  }

  public applyCaptureScene(name: CaptureSceneName): AppSnapshot {
    if (!this.manualTime) {
      throw new Error("Capture scenes require the manual capture clock.");
    }
    const definition = captureSceneDefinition(name);
    if (definition.seed !== this.sessionSeed) {
      throw new Error(
        `Capture scene '${name}' requires seed ${definition.seed}, received ${this.sessionSeed}.`,
      );
    }
    if (definition.quality !== this.quality) {
      throw new Error(
        `Capture scene '${name}' requires '${definition.quality}' quality, received '${this.quality}'.`,
      );
    }
    const rect = this.hud.canvas.getBoundingClientRect();
    if (
      Math.round(rect.width) !== definition.viewport.width ||
      Math.round(rect.height) !== definition.viewport.height
    ) {
      throw new Error(
        `Capture scene '${name}' requires ${definition.viewport.width}x${definition.viewport.height}, ` +
          `received ${Math.round(rect.width)}x${Math.round(rect.height)}.`,
      );
    }

    if (definition.requirement === "READY" && this.match.phase !== "READY") {
      throw new Error(`Capture scene '${name}' requires a ready match.`);
    }
    if (definition.requirement === "ACTIVE_SHOT") {
      const shot = this.activeShot;
      if (shot === null || shot.resolved) {
        throw new Error(
          `Capture scene '${name}' requires a real accepted active shot.`,
        );
      }
      const targetFrame = definition.targetShotFrame;
      if (targetFrame === null) {
        throw new Error(`Capture scene '${name}' has no target shot frame.`);
      }
      const currentFrame = Math.round(shot.elapsedSeconds / FIXED_STEP_SECONDS);
      if (currentFrame > targetFrame) {
        throw new Error(
          `Capture scene '${name}' passed its deterministic frame ` +
            `(${currentFrame} > ${targetFrame}).`,
        );
      }
      this.pumpFrames(targetFrame - currentFrame);
    }
    if (
      definition.expectedKeeperZone !== null &&
      this.activeShot?.keeperZone !== definition.expectedKeeperZone
    ) {
      throw new Error(
        `Capture scene '${name}' requires goalkeeper zone ` +
          `'${definition.expectedKeeperZone}', received ` +
          `'${this.activeShot?.keeperZone ?? "none"}'.`,
      );
    }
    if (definition.requirement === "RESULT") {
      if (
        this.activeShot === null ||
        !this.activeShot.resolved ||
        this.match.lastOutcome !== definition.expectedOutcome
      ) {
        throw new Error(
          `Capture scene '${name}' requires a real '${definition.expectedOutcome}' result.`,
        );
      }
      // Advance the same resolved application once so impact/recovery presentation
      // consumes the real outcome event before the deterministic screenshot.
      this.pumpFrames(1);
    }
    if (
      definition.requirement === "ROUND_COMPLETE" &&
      this.match.phase !== "ROUND_COMPLETE"
    ) {
      throw new Error(`Capture scene '${name}' requires a completed round.`);
    }
    if (definition.requirement === "ROUND_COMPLETE") {
      for (
        let frame = 0;
        frame < 90 && !this.roundSummaryVisible;
        frame += 1
      ) {
        this.pumpFrames(1);
      }
      if (!this.roundSummaryVisible) {
        throw new Error(
          `Capture scene '${name}' did not reach the real round summary.`,
        );
      }
    }

    this.presentFrames(2);
    const snapshot = this.snapshot();
    if (
      !snapshot.scene.finiteTransforms ||
      snapshot.scene.cameraCount !== 1 ||
      snapshot.resizeListenerCount !== 1 ||
      !snapshot.scene.goalCentered ||
      !snapshot.scene.shooterLeftForeground ||
      snapshot.scene.renderCalls < 1 ||
      snapshot.scene.renderedTriangles < 1
    ) {
      throw new Error(
        `Capture scene '${name}' failed framing diagnostics: ${JSON.stringify(snapshot.scene)}.`,
      );
    }
    if (
      definition.requirement === "ACTIVE_SHOT" &&
      (!snapshot.scene.ballProjection.visible ||
        snapshot.scene.ballPathPointCount < 2)
    ) {
      throw new Error(
        `Capture scene '${name}' does not show the real ball flight path.`,
      );
    }
    return snapshot;
  }

  public dispose(): void {
    if (this.state === "disposed") {
      return;
    }

    this.state = "disposed";
    this.root.dataset.appState = this.state;
    this.events.emit("lifecycle", { state: this.state });
    this.resources.dispose();
    this.hud.dispose();
  }

  private acceptGesture(result: AcceptedPointerGesture): void {
    this.lastGestureRejectionReason = null;
    if (!this.isInputEnabled()) {
      return;
    }
    const gesture: StandardShotGesture = result.gesture;
    const target = mapAimToGoalTarget(
      gesture.aim.horizontalAim,
      gesture.aim.verticalAim,
      STANDARD_GOAL_CONFIG,
    );
    const durationSeconds = standardShotDuration(
      gesture.power,
      STANDARD_TRAJECTORY_CONFIG,
    );
    const keeperZone = chooseGoalkeeperZone(this.keeperRng);
    const keeperArrivalPosition = goalkeeperPositionDuringShot(
      keeperZone,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      durationSeconds,
    );
    const plannedOutcome = resolveShotOutcome(
      target,
      keeperArrivalPosition,
      STANDARD_GOAL_CONFIG,
      STANDARD_GOALKEEPER_CONFIG,
    );

    this.match = beginShot(this.match);
    this.activeShot = {
      power: gesture.power,
      target,
      durationSeconds,
      keeperZone,
      keeperArrivalPosition,
      plannedOutcome,
      elapsedSeconds: 0,
      resultElapsedSeconds: 0,
      resolved: false,
    };
    this.acceptedShots += 1;
    this.scene.beginShotMeasurement();
    this.lastPointerType = result.pointerType;
    this.displayedPower = gesture.power;
    // The pointer trail communicates the live gesture only. Capture power may
    // legitimately use a distant native sample, but that QA path must never
    // remain as a screen-spanning hero-frame graphic after release.
    this.hud.clearTrail();
    this.root.dataset.acceptedShots = String(this.acceptedShots);
    this.setInputEnabled(false);
    this.events.emit("shotReleased", {
      power: gesture.power,
      durationSeconds,
      shotNumber: this.match.shotsTaken + 1,
      simulationSeconds: this.engine.simulationSeconds,
    });
    this.applyShotVisuals(this.activeShot, this.engine.simulationSeconds);
  }

  private fixedUpdate(stepSeconds: number, simulationSeconds: number): void {
    const shot = this.activeShot;
    if (shot === null) {
      this.updateReadyVisuals(simulationSeconds);
      return;
    }

    if (!shot.resolved) {
      shot.elapsedSeconds = Math.min(
        shot.durationSeconds,
        shot.elapsedSeconds + stepSeconds,
      );
      this.applyShotVisuals(shot, simulationSeconds);
      if (shot.elapsedSeconds + Number.EPSILON >= shot.durationSeconds) {
        this.resolveActiveShot(shot);
      }
      return;
    }

    shot.resultElapsedSeconds += stepSeconds;
    this.applyResultVisuals(shot, simulationSeconds);
    if (
      shot.resultElapsedSeconds + Number.EPSILON <
      STANDARD_TRAJECTORY_CONFIG.resetDelaySeconds
    ) {
      return;
    }

    this.activeShot = null;
    this.scene.finishShotMeasurement();
    this.scene.resetFeedback();
    this.displayedPower = 0;
    this.hud.clearTrail();
    this.forceReadyVisuals(simulationSeconds);
    if (this.match.phase === "RESULT") {
      this.match = prepareNextShot(this.match);
      this.setInputEnabled(true);
      this.hud.setStatus("Ready for the next shot.");
    } else {
      this.roundSummaryVisible = true;
      this.setInputEnabled(false);
      this.hud.setStatus("Round complete. Review the result and restart.");
    }
  }

  private resolveActiveShot(shot: ActiveShot): void {
    if (shot.resolved) {
      return;
    }
    shot.resolved = true;
    shot.resultElapsedSeconds = 0;
    this.match = resolveMatchShot(
      this.match,
      shot.plannedOutcome,
      STANDARD_MATCH_CONFIG,
    );
    this.resolvedShots += 1;
    this.outcomeHistory.push(shot.plannedOutcome);
    this.root.dataset.resolvedShots = String(this.resolvedShots);
    this.updateHud();
    this.events.emit("outcome", {
      outcome: shot.plannedOutcome,
      shotNumber: this.match.shotsTaken,
      target: shot.target,
      simulationSeconds: this.engine.simulationSeconds,
    });
  }

  private applyReadyVisuals(simulationSeconds: number): void {
    this.scene.apply({
      ballPosition: STANDARD_RELEASE_POSITION,
      keeperPosition: STANDARD_GOAL_CONFIG.center,
      keeperZone: null,
      keeperDiveProgress: 0,
      keeperPhase: "READY",
      shooterPhase: "READY",
      shotProgress: 0,
      resultProgress: 0,
      outcome: null,
      simulationSeconds,
    });
  }

  private forceReadyVisuals(simulationSeconds: number): void {
    this.applyReadyVisuals(simulationSeconds);
    this.nextReadyPresentationSeconds =
      simulationSeconds + READY_PRESENTATION_STEP_SECONDS;
  }

  private updateReadyVisuals(simulationSeconds: number): void {
    if (
      simulationSeconds + Number.EPSILON <
      this.nextReadyPresentationSeconds
    ) {
      return;
    }
    this.forceReadyVisuals(simulationSeconds);
  }

  private applyShotVisuals(
    shot: ActiveShot,
    simulationSeconds: number,
  ): void {
    const keeperProgress = goalkeeperDiveProgress(
      shot.elapsedSeconds,
      STANDARD_GOALKEEPER_CONFIG,
    );
    const keeperPhase: KeeperVisualPhase =
      shot.elapsedSeconds < STANDARD_GOALKEEPER_CONFIG.reactionDelaySeconds
        ? "PREPARE"
        : keeperProgress < 1
          ? "DIVE"
          : "HOLD";
    this.scene.apply({
      ballPosition: evaluateStandardTrajectory(
        STANDARD_RELEASE_POSITION,
        shot.target,
        shot.elapsedSeconds,
        shot.power,
        STANDARD_TRAJECTORY_CONFIG,
      ),
      keeperPosition: goalkeeperPositionDuringShot(
        shot.keeperZone,
        STANDARD_GOAL_CONFIG.center,
        STANDARD_GOALKEEPER_CONFIG,
        shot.elapsedSeconds,
      ),
      keeperZone: shot.keeperZone,
      keeperDiveProgress: keeperProgress,
      keeperPhase,
      shooterPhase: "RELEASE",
      shotProgress: shot.elapsedSeconds / shot.durationSeconds,
      resultProgress: 0,
      outcome: null,
      simulationSeconds,
    });
  }

  private applyResultVisuals(
    shot: ActiveShot,
    simulationSeconds: number,
  ): void {
    const keeperPosition = goalkeeperReturnPosition(
      shot.keeperArrivalPosition,
      STANDARD_GOAL_CONFIG.center,
      STANDARD_GOALKEEPER_CONFIG,
      shot.resultElapsedSeconds,
    );
    const returnProgress = Math.min(
      1,
      shot.resultElapsedSeconds / STANDARD_GOALKEEPER_CONFIG.returnDurationSeconds,
    );
    const shooterPhase: ShooterVisualPhase = "RECOVER";
    const resultProgress = Math.min(
      1,
      shot.resultElapsedSeconds /
        STANDARD_TRAJECTORY_CONFIG.resetDelaySeconds,
    );
    this.scene.apply({
      ballPosition: shot.target,
      keeperPosition,
      keeperZone: shot.keeperZone,
      keeperDiveProgress: 1 - returnProgress,
      keeperPhase: "RETURN",
      shooterPhase,
      shotProgress: 1,
      resultProgress,
      outcome: shot.plannedOutcome,
      simulationSeconds,
    });
  }

  private isInputEnabled(): boolean {
    return this.state === "running" && this.match.phase === "READY";
  }

  private hasBeenDisposed(): boolean {
    return this.state === "disposed";
  }

  private setInputEnabled(enabled: boolean): void {
    const shouldEnable =
      enabled && this.state === "running" && this.match.phase === "READY";
    this.input.setEnabled(shouldEnable);
    this.updateHud();
  }

  private updateHud(): void {
    const inputEnabled = this.isInputEnabled();
    this.hud.update(
      this.match,
      this.displayedPower,
      inputEnabled,
      this.outcomeHistory,
      this.roundSummaryVisible,
    );
    this.root.dataset.acceptedShots = String(this.acceptedShots);
    this.root.dataset.resolvedShots = String(this.resolvedShots);
  }

  private setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    this.audio.setEnabled(enabled);
    this.hud.setAudioEnabled(enabled);
    this.hud.setStatus(
      enabled ? "Synthesized arena audio enabled." : "Arena audio muted.",
    );
  }

  private setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    this.scene.setReducedMotion(reducedMotion);
    this.hud.setReducedMotion(reducedMotion);
    this.hud.setStatus(
      reducedMotion
        ? "Reduced motion enabled."
        : "Full arcade motion enabled.",
    );
  }

  private bindResizeListener(): void {
    if (this.resizeListenerAttached) {
      throw new Error("Duplicate gameplay resize listener registration.");
    }
    window.addEventListener("resize", this.resize);
    this.resizeListenerAttached = true;
  }

  private unbindResizeListener(): void {
    if (!this.resizeListenerAttached) {
      return;
    }
    window.removeEventListener("resize", this.resize);
    this.resizeListenerAttached = false;
  }

  private readonly resize = (): void => {
    const rect = this.hud.canvas.getBoundingClientRect();
    this.scene.resize(rect.width, rect.height);
  };
}
