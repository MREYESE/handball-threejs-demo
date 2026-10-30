import type { GoalkeeperConfig } from "../../config/types";
import type { SeededRng } from "../../core/SeededRng";
import type { FeintAction } from "../gesture/model";
import type { Vec2, Vec3 } from "../math";
import { goalkeeperZonePosition } from "./zones";
import type { GoalkeeperZone } from "./zones";

const THRESHOLD_EPSILON = 1e-9;
const CENTERED_HOLD_DESTINATION: GoalkeeperZone = "mid-center";

export type GoalkeeperCommitmentPhase = "READY" | "READ" | "HOLD" | "COMMIT" | "RECOVER";

export interface GoalkeeperObservation {
  readonly apparentDirection: Vec2;
  readonly elapsedGestureSeconds: number;
  readonly confidence: number;
  readonly feint: FeintAction | null;
}

export interface GoalkeeperCommitmentDiagnostics {
  readonly phase: GoalkeeperCommitmentPhase;
  readonly feintAgeSeconds: number | null;
  readonly positionOffset: Vec2;
  readonly observedCue: GoalkeeperObservation | null;
  readonly seededTendency: Vec2 | null;
  readonly commitmentTimeSeconds: number | null;
  readonly committedDestination: GoalkeeperZone | null;
  readonly releaseDestination: GoalkeeperZone | null;
  readonly gestureElapsedSeconds: number;
  readonly stableCueSamples: number;
  readonly conflictingCue: boolean;
}

type QueuedEvent =
  | Readonly<{ type: "START" }>
  | Readonly<{ type: "OBSERVATION"; observation: GoalkeeperObservation }>;

export function validateGoalkeeperCommitmentConfig(
  config: GoalkeeperConfig,
): void {
  const finiteValues = [
    config.feintHoldSeconds,
    config.feintRecoverySeconds,
    config.feintMaximumSpeedMetersPerSecond,
    config.minimumReadSeconds,
    config.maximumReadSeconds,
    config.minimumCueConfidence,
    config.minimumCueAgreementDot,
    config.horizontalCommitThreshold,
    config.verticalCommitThreshold,
    config.maximumTendency,
  ];
  if (!finiteValues.every(Number.isFinite)) {
    throw new RangeError("Goalkeeper commitment configuration must be finite.");
  }
  if (config.feintHoldSeconds <= 0 || config.feintRecoverySeconds <= 0 ||
      config.feintMaximumSpeedMetersPerSecond <= 0) throw new RangeError("Invalid FEINT recovery bounds");
  if (
    config.minimumReadSeconds <= 0 ||
    config.maximumReadSeconds < config.minimumReadSeconds
  ) {
    throw new RangeError(
      "Goalkeeper read bounds must be positive and ordered.",
    );
  }
  if (config.minimumCueConfidence <= 0 || config.minimumCueConfidence > 1) {
    throw new RangeError("Goalkeeper cue confidence must be within (0, 1].");
  }
  if (
    config.minimumCueAgreementDot < -1 ||
    config.minimumCueAgreementDot >= 1
  ) {
    throw new RangeError("Goalkeeper cue agreement must be within [-1, 1).");
  }
  if (
    !Number.isInteger(config.minimumStableCueSamples) ||
    config.minimumStableCueSamples < 1
  ) {
    throw new RangeError(
      "Goalkeeper stable cue sample count must be a positive integer.",
    );
  }
  if (
    config.horizontalCommitThreshold < 0 ||
    config.horizontalCommitThreshold >= 1 ||
    config.verticalCommitThreshold < 0 ||
    config.verticalCommitThreshold >= 1
  ) {
    throw new RangeError(
      "Goalkeeper commitment thresholds must be within [0, 1).",
    );
  }
  if (config.maximumTendency < 0 || config.maximumTendency > 0.25) {
    throw new RangeError("Goalkeeper tendency must be within [0, 0.25].");
  }
}

export class GoalkeeperCommitmentController {
  private feintAgeSeconds: number | null = null;
  private offset = { x: 0, y: 0 };
  private recoveringGesture = false;
  private phase: GoalkeeperCommitmentPhase = "READY";
  private observedCue: GoalkeeperObservation | null = null;
  private seededTendency: Vec2 | null = null;
  private commitmentTimeSeconds: number | null = null;
  private committedDestination: GoalkeeperZone | null = null;
  private releaseDestination: GoalkeeperZone | null = null;
  private gestureElapsedSeconds = 0;
  private stableCueSamples = 0;
  private conflictingCue = false;
  private referenceDirection: Vec2 | null = null;
  private gestureQueuedOrActive = false;
  private readingClosed = false;
  private readonly queuedEvents: QueuedEvent[] = [];

  public constructor(
    private readonly config: GoalkeeperConfig,
    private readonly rng: SeededRng,
  ) {
    validateGoalkeeperCommitmentConfig(config);
  }

  public completeFeint(): void {
    // Consume pending real observations before closing the gesture, without
    // inventing elapsed time. A repeated fake cannot extend an existing window.
    this.consumeQueuedEvents();
    this.recoveringGesture = false;
    if (this.feintAgeSeconds === null) this.feintAgeSeconds = 0;
  }

  public preReleasePosition(center: Vec3): Vec3 {
    return { x: center.x + this.offset.x, y: center.y + this.offset.y, z: center.z };
  }

  public queueGestureStart(): void {
    if (this.feintAgeSeconds !== null) {
      this.recoveringGesture = true;
      return;
    }
    if (this.gestureQueuedOrActive) {
      return;
    }
    this.clearState();
    this.gestureQueuedOrActive = true;
    this.queuedEvents.push(Object.freeze({ type: "START" }));
  }

  public queueObservation(observation: GoalkeeperObservation): void {
    if (!this.gestureQueuedOrActive) {
      return;
    }
    this.validateObservation(observation);
    this.queuedEvents.push(
      Object.freeze({
        type: "OBSERVATION",
        observation: copyObservation(observation),
      }),
    );
  }

  public advance(stepSeconds: number): void {
    if (!Number.isFinite(stepSeconds) || stepSeconds <= 0) {
      throw new RangeError("Goalkeeper fixed step must be finite and positive.");
    }
    this.consumeQueuedEvents();
    if (this.feintAgeSeconds !== null) {
      if (this.feintAgeSeconds < this.config.feintHoldSeconds && this.phase !== "COMMIT") {
        this.advanceReading(stepSeconds);
      }
      this.feintAgeSeconds += stepSeconds;
      const recovering = this.feintAgeSeconds >= this.config.feintHoldSeconds;
      if (recovering) this.phase = "RECOVER";
      const target = !recovering && this.committedDestination !== null
        ? goalkeeperZonePosition(this.committedDestination, { x: 0, y: 0, z: 0 }, this.config)
        : { x: 0, y: 0 };
      const dx = target.x * (recovering ? 1 : 0.35) - this.offset.x;
      const dy = target.y * (recovering ? 1 : 0.35) - this.offset.y;
      const distance = Math.hypot(dx, dy);
      const fraction = distance === 0 ? 0 : Math.min(1,
        this.config.feintMaximumSpeedMetersPerSecond * stepSeconds / distance);
      this.offset.x += dx * fraction;
      this.offset.y += dy * fraction;
      if (recovering && distance <= this.config.feintMaximumSpeedMetersPerSecond * stepSeconds &&
          this.feintAgeSeconds >= this.config.feintHoldSeconds + this.config.feintRecoverySeconds) {
        const resume = this.recoveringGesture;
        this.clearState();
        if (resume) this.queueGestureStart();
      }
      return;
    }
    this.advanceReading(stepSeconds);
  }

  private consumeQueuedEvents(): void {
    for (let index = 0; index < this.queuedEvents.length; index += 1) {
      const event = this.queuedEvents[index]!;
      if (event.type === "START") {
        this.phase = "READ";
        this.seededTendency = Object.freeze({
          x: (this.rng.nextFloat() * 2 - 1) * this.config.maximumTendency,
          y: (this.rng.nextFloat() * 2 - 1) * this.config.maximumTendency,
        });
      } else if (this.phase !== "COMMIT" && !this.readingClosed) {
        this.consumeObservation(event.observation);
      }
    }
    this.queuedEvents.length = 0;
  }

  private advanceReading(stepSeconds: number): void {
    if (!this.gestureQueuedOrActive || this.phase === "READY") {
      return;
    }

    this.gestureElapsedSeconds += stepSeconds;
    if (this.phase === "COMMIT") {
      return;
    }
    if (
      this.gestureElapsedSeconds + THRESHOLD_EPSILON >=
      this.config.maximumReadSeconds
    ) {
      this.phase = "HOLD";
      this.readingClosed = true;
      return;
    }
    if (
      this.gestureElapsedSeconds + THRESHOLD_EPSILON <
      this.config.minimumReadSeconds
    ) {
      this.phase = "READ";
      return;
    }
    if (
      this.observedCue !== null &&
      !this.conflictingCue &&
      this.stableCueSamples >= this.config.minimumStableCueSamples &&
      this.observedCue.confidence >
        this.config.minimumCueConfidence + THRESHOLD_EPSILON
    ) {
      this.commit(this.observedCue.apparentDirection);
    } else {
      this.phase = "HOLD";
    }
  }

  public releaseGesture(): GoalkeeperZone {
    this.consumeQueuedEvents();
    this.feintAgeSeconds = null;
    this.recoveringGesture = false;
    this.gestureQueuedOrActive = false;
    if (this.phase !== "COMMIT" || this.committedDestination === null) {
      this.phase = "HOLD";
      this.committedDestination = null;
      this.commitmentTimeSeconds = null;
      this.releaseDestination = CENTERED_HOLD_DESTINATION;
      return CENTERED_HOLD_DESTINATION;
    }
    this.releaseDestination = this.committedDestination;
    return this.committedDestination;
  }

  public cancelGesture(): void {
    if (this.feintAgeSeconds !== null) { this.recoveringGesture = false; return; }
    this.clearState();
  }

  public reset(): void {
    this.clearState();
  }

  public get currentPhase(): GoalkeeperCommitmentPhase {
    return this.phase;
  }

  public get currentDestination(): GoalkeeperZone | null {
    return this.committedDestination;
  }

  public diagnostics(): GoalkeeperCommitmentDiagnostics {
    return Object.freeze({
      phase: this.phase,
      feintAgeSeconds: this.feintAgeSeconds,
      positionOffset: Object.freeze({ ...this.offset }),
      observedCue: this.observedCue,
      seededTendency: this.seededTendency,
      commitmentTimeSeconds: this.commitmentTimeSeconds,
      committedDestination: this.committedDestination,
      releaseDestination: this.releaseDestination,
      gestureElapsedSeconds: this.gestureElapsedSeconds,
      stableCueSamples: this.stableCueSamples,
      conflictingCue: this.conflictingCue,
    });
  }

  private consumeObservation(observation: GoalkeeperObservation): void {
    const cue =
      observation.feint === null
        ? copyObservation(observation)
        : copyObservation({
            ...observation,
            apparentDirection: observation.feint.apparentDirection,
          });
    this.observedCue = cue;
    if (
      cue.confidence <= this.config.minimumCueConfidence + THRESHOLD_EPSILON
    ) {
      return;
    }

    if (cue.feint !== null) {
      this.referenceDirection = cue.apparentDirection;
      this.conflictingCue = false;
      this.stableCueSamples = Math.max(
        this.stableCueSamples,
        this.config.minimumStableCueSamples,
      );
      return;
    }
    if (this.referenceDirection === null) {
      this.referenceDirection = cue.apparentDirection;
      this.stableCueSamples = 1;
      return;
    }
    const agreement =
      this.referenceDirection.x * cue.apparentDirection.x +
      this.referenceDirection.y * cue.apparentDirection.y;
    if (
      agreement <= this.config.minimumCueAgreementDot + THRESHOLD_EPSILON
    ) {
      this.conflictingCue = true;
      this.stableCueSamples = 0;
      return;
    }
    if (!this.conflictingCue) {
      this.stableCueSamples += 1;
    }
  }

  private commit(direction: Vec2): void {
    const tendency = this.seededTendency ?? Object.freeze({ x: 0, y: 0 });
    const x = direction.x + tendency.x;
    const y = direction.y + tendency.y;
    const horizontal =
      x < -this.config.horizontalCommitThreshold
        ? "left"
        : x > this.config.horizontalCommitThreshold
          ? "right"
          : "center";
    const vertical =
      y < -this.config.verticalCommitThreshold
        ? "low"
        : y > this.config.verticalCommitThreshold
          ? "high"
          : "mid";
    this.committedDestination = `${vertical}-${horizontal}` as GoalkeeperZone;
    this.commitmentTimeSeconds = this.gestureElapsedSeconds;
    this.phase = "COMMIT";
    this.readingClosed = true;
  }

  private validateObservation(observation: GoalkeeperObservation): void {
    const values = [
      observation.apparentDirection.x,
      observation.apparentDirection.y,
      observation.elapsedGestureSeconds,
      observation.confidence,
    ];
    if (!values.every(Number.isFinite)) {
      throw new RangeError("Goalkeeper observations must contain finite values.");
    }
    const directionLength = Math.hypot(
      observation.apparentDirection.x,
      observation.apparentDirection.y,
    );
    if (
      Math.abs(directionLength - 1) > 1e-6 ||
      observation.elapsedGestureSeconds < 0 ||
      observation.confidence < 0 ||
      observation.confidence > 1
    ) {
      throw new RangeError(
        "Goalkeeper observations require a unit direction, non-negative time, and normalized confidence.",
      );
    }
  }

  private clearState(): void {
    this.feintAgeSeconds = null;
    this.offset = { x: 0, y: 0 };
    this.recoveringGesture = false;
    this.phase = "READY";
    this.observedCue = null;
    this.seededTendency = null;
    this.commitmentTimeSeconds = null;
    this.committedDestination = null;
    this.releaseDestination = null;
    this.gestureElapsedSeconds = 0;
    this.stableCueSamples = 0;
    this.conflictingCue = false;
    this.referenceDirection = null;
    this.gestureQueuedOrActive = false;
    this.readingClosed = false;
    this.queuedEvents.length = 0;
  }
}

function copyObservation(
  observation: GoalkeeperObservation,
): GoalkeeperObservation {
  return Object.freeze({
    apparentDirection: Object.freeze({ ...observation.apparentDirection }),
    elapsedGestureSeconds: observation.elapsedGestureSeconds,
    confidence: observation.confidence,
    feint: observation.feint,
  });
}
