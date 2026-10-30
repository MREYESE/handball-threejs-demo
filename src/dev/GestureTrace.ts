import { SeededRng } from "../core/SeededRng";
import { GoalkeeperCommitmentController, type GoalkeeperObservation } from "../domain/goalkeeper/commitment";
import { goalkeeperPositionDuringShot } from "../domain/goalkeeper/zones";
import { mapAimToGoalTarget } from "../domain/shot/target";
import { createBaselineBallFlight, advanceBallFlight } from "../domain/shot/ballFlight";
import type { GestureConfig } from "../config/types";
import type { FeintAction, GestureRejectionReason, GestureSample, StandardShotGesture, Viewport } from "../domain/gesture/model";
import { preprocessGesture } from "../domain/gesture/preprocess";
import { analyzeStandardGesture } from "../domain/gesture/features";
import { recognizeFeintAction } from "../domain/gesture/feint";

export interface TraceSample {
  sample: GestureSample;
  source: "down" | "parent" | "coalesced" | "up" | "cancel";
  retained: boolean;
  parentTimeSeconds: number;
  viewport: Viewport;
  feintCheck?: boolean;
}
export interface TraceContext {
  pointerType: string;
  bounds: { left: number; top: number; width: number; height: number };
  viewport: Viewport;
  browserViewport: { width: number; height: number };
  backingStore: { width: number; height: number };
  dpr: number;
}
export interface GestureTraceObserver {
  start(context: TraceContext): void;
  sample(sample: TraceSample): void;
  movement(): void;
  finish(viewport: Viewport, gesture: StandardShotGesture | null, reason: GestureRejectionReason | null): void;
}
export interface TraceAttempt {
  id: number;
  metadata: { intendedTechnique: string; partition: string };
  context: TraceContext;
  samples: TraceSample[];
  truncated: boolean;
  inputComplete: boolean;
  viewport: Viewport;
  gesture: StandardShotGesture | null;
  reason: GestureRejectionReason | null;
  release: unknown;
  result: unknown;
  reset: unknown;
  action: "FEINT" | "SHOT" | null;
  events: { type: string; simulationSeconds: number; keeper: unknown }[];
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Optional bounded observer. It never supplies data back to gameplay. */
export class GestureTrace implements GestureTraceObserver {
  public metadata = { intendedTechnique: "UNLABELLED", partition: "UNASSIGNED" };
  private attempts: TraceAttempt[] = [];
  private current: TraceAttempt | null = null;
  private shot: TraceAttempt | null = null;
  private nextId = 1;
  private droppedAttempts = 0;
  public constructor(public readonly config: GestureConfig, private readonly session: unknown,
    private readonly maxAttempts = 40, private readonly maxSamples = 2048) {}

  public start(context: TraceContext): void {
    if (this.attempts.length >= this.maxAttempts) {
      this.attempts.shift();
      this.droppedAttempts++;
    }
    this.current = { id: this.nextId++, metadata: copy(this.metadata), context: copy(context),
      samples: [], truncated: false, inputComplete: false, viewport: copy(context.viewport),
      gesture: null, reason: null, release: null, result: null, reset: null, action: null, events: [] };
    this.attempts.push(this.current);
  }
  public sample(sample: TraceSample): void {
    if (!this.current) return;
    if (this.current.samples.length >= this.maxSamples) { this.current.truncated = true; return; }
    this.current.samples.push(copy(sample));
  }
  public movement(): void {
    const last = this.current?.samples.at(-1);
    if (last) last.feintCheck = true;
  }
  public finish(viewport: Viewport, gesture: StandardShotGesture | null, reason: GestureRejectionReason | null): void {
    if (!this.current) return;
    Object.assign(this.current, { viewport: copy(viewport), gesture: copy(gesture && this.current.truncated ? { ...gesture, rawPoints: [], smoothedPoints: [], resampledPoints: [] } : gesture), reason, inputComplete: true });
    if (gesture) {
      this.current.action = gesture.feint !== null ? "FEINT" : "SHOT";
      if (gesture.feint === null) this.shot = this.current;
    }
    this.current = null;
  }
  public actionEvent(type: string, simulationSeconds: number, keeper: unknown): void {
    const attempt = this.current ?? this.attempts.at(-1);
    if (attempt) {
      if (attempt.events.length < 4096) attempt.events.push(copy({ type, simulationSeconds, keeper }));
      else attempt.truncated = true;
    }
  }
  public keeperStep(simulationSeconds: number, keeper: unknown): void {
    this.actionEvent("KEEPER_STEP", simulationSeconds, keeper);
  }
  public release(value: unknown): void { if (this.shot) this.shot.release = copy(value); }
  public result(value: unknown): void { if (this.shot) this.shot.result = copy(value); }
  public reset(value: unknown): void {
    this.actionEvent("RESET", (value as { simulationSeconds: number }).simulationSeconds, null);
    if (this.shot) this.shot.reset = copy(value);
    this.shot = null;
  }
  public export() {
    return { schema: "handball-gesture-trace-v2", confidence: "No calibrated classifier confidence is exposed",
      sourceBinding: "Supervisor candidate manifest; runtime does not assert Git identity",
      config: copy(this.config), session: copy(this.session), limits: { maxAttempts: this.maxAttempts, maxSamples: this.maxSamples },
      droppedAttempts: this.droppedAttempts, attempts: this.attempts.map((attempt) => {
        const origin = attempt.samples[0]?.sample.timeSeconds ?? 0;
        return { ...copy(attempt), timestampOriginSeconds: origin,
          replayable: attempt.inputComplete && !attempt.truncated,
          lifecycleComplete: attempt.reason !== null || attempt.action === "FEINT" || (attempt.result !== null && attempt.reset !== null),
          samples: attempt.samples.map((entry) => ({ ...copy(entry),
            sample: { ...copy(entry.sample), timeSeconds: entry.sample.timeSeconds - origin },
            parentTimeSeconds: entry.parentTimeSeconds - origin })) };
      }) };
  }
}

/** Replays exported consumed samples, including incremental production FEINT recognition. */
export function replayGestureTrace(attempt: ReturnType<GestureTrace["export"]>["attempts"][number], config: GestureConfig) {
  if (!attempt.replayable) throw new Error("Incomplete or truncated input cannot be replayed");
  if (attempt.reason === "INTERRUPTED" || attempt.reason === "START_OUTSIDE_INPUT_ZONE") {
    return { accepted: false as const, reason: attempt.reason };
  }
  const samples: GestureSample[] = [];
  let feint: FeintAction | null = null;
  for (const entry of attempt.samples) {
    if (entry.retained) samples.push(entry.sample);
    if (entry.feintCheck && samples.length >= 3 && !feint) {
      const first = samples[0]!.timeSeconds;
      feint = recognizeFeintAction(samples.map((sample) => ({ ...sample,
        timeSeconds: sample.timeSeconds - first,
        safeAreaPosition01: { x: sample.positionPixels.x / entry.viewport.widthPixels,
          y: sample.positionPixels.y / entry.viewport.heightPixels } })), config);
    }
  }
  const result = preprocessGesture(samples, attempt.viewport, config, { nonShootingFeint: feint !== null });
  return result.accepted ? { accepted: true as const, gesture: analyzeStandardGesture(result.points, attempt.viewport, config, feint) } : result;
}

/** Replays actual recorded input/step ordering; never creates events or timestamps. */
export function replayGestureSession(trace: ReturnType<GestureTrace["export"]>) {
  const session = trace.session as {
    seed: number; fixedStepSeconds: number;
    goal: import("../config/types").GoalConfig;
    goalkeeper: import("../config/types").GoalkeeperConfig;
    trajectory: import("../config/types").StandardTrajectoryConfig;
    flight: import("../config/types").BallFlightConfig;
    releasePosition: import("../domain/math").Vec3;
  };
  if (!session || !Number.isFinite(session.seed) || !Number.isFinite(session.fixedStepSeconds)) {
    throw new Error("Replay requires recorded session configuration");
  }
  if (trace.droppedAttempts > 0) throw new Error("Evicted sessions cannot reproduce keeper RNG history");
  let keeper = new GoalkeeperCommitmentController(session.goalkeeper, new SeededRng(session.seed).fork("keeper"));
  const actions = [], keeperSteps = [], shots = [];
  for (const attempt of trace.attempts) {
    if (!attempt.replayable) throw new Error("Incomplete action history cannot be replayed");
    const input = replayGestureTrace(attempt, trace.config);
    actions.push({ action: attempt.action, input, timestampOriginSeconds: attempt.timestampOriginSeconds });
    for (const event of attempt.events) {
      switch (event.type) {
        case "GESTURE_START": keeper.queueGestureStart(); break;
        case "OBSERVATION": keeper.queueObservation(event.keeper as GoalkeeperObservation); break;
        case "CANCEL": keeper.cancelGesture(); break;
        case "FEINT_COMPLETED": keeper.completeFeint(); break;
        case "RESET": keeper.reset(); break;
        case "ROUND_RESTART": keeper = new GoalkeeperCommitmentController(session.goalkeeper, new SeededRng(session.seed).fork("keeper")); break;
        case "KEEPER_STEP":
          keeper.advance(session.fixedStepSeconds);
          keeperSteps.push({ simulationSeconds: event.simulationSeconds, keeper: keeper.diagnostics() });
          break;
        case "SHOT_RELEASED": {
          if (!input.accepted || attempt.action !== "SHOT") throw new Error("Release without a shooting action");
          const from = keeper.preReleasePosition(session.goal.center);
          const zone = keeper.releaseGesture();
          const gesture = input.gesture;
          const target = mapAimToGoalTarget(gesture.aim.horizontalAim, gesture.aim.verticalAim, session.goal);
          const ball = createBaselineBallFlight(session.releasePosition, target, gesture.power,
            session.trajectory, session.flight, gesture.loft, gesture.sideSpin, gesture.topSpin, gesture.bounceIntent);
          const releaseKeeper = keeper.diagnostics();
          const steps = [];
          for (let step = 0; step < 3600 && ball.terminalState === null; step++) {
            advanceBallFlight(ball, session.fixedStepSeconds, session.goal, session.goalkeeper, {
              previousPosition: goalkeeperPositionDuringShot(zone, session.goal.center, session.goalkeeper, ball.elapsedSeconds, from),
              currentPosition: goalkeeperPositionDuringShot(zone, session.goal.center, session.goalkeeper, ball.elapsedSeconds + session.fixedStepSeconds, from),
            });
            steps.push({ position: { ...ball.position }, velocity: { ...ball.velocity },
              elapsedSeconds: ball.elapsedSeconds, contacts: ball.contactHistory.length,
              terminalState: ball.terminalState });
          }
          if (ball.terminalState === null) throw new Error("Replay flight did not physically terminate");
          shots.push({ keeper: releaseKeeper, from, zone, target, ball, steps });
          break;
        }
      }
    }
  }
  return { actions, keeperSteps, shots, keeper: keeper.diagnostics() };
}
