export interface FixedClockResult {
  readonly steps: number;
  readonly interpolationAlpha: number;
  readonly droppedSeconds: number;
}

export interface FixedClockOptions {
  readonly stepSeconds?: number;
  readonly maximumFrameSeconds?: number;
  readonly maximumStepsPerFrame?: number;
}

const EPSILON_SECONDS = 1e-9;

export class FixedClock {
  public readonly stepSeconds: number;
  private readonly maximumFrameSeconds: number;
  private readonly maximumStepsPerFrame: number;
  private accumulatorSeconds = 0;
  private elapsedSimulationSeconds = 0;

  public constructor(options: FixedClockOptions = {}) {
    this.stepSeconds = options.stepSeconds ?? 1 / 60;
    this.maximumFrameSeconds = options.maximumFrameSeconds ?? 0.25;
    this.maximumStepsPerFrame = options.maximumStepsPerFrame ?? 8;

    if (!Number.isFinite(this.stepSeconds) || this.stepSeconds <= 0) {
      throw new RangeError("Fixed clock step must be a positive finite number.");
    }
    if (!Number.isFinite(this.maximumFrameSeconds) || this.maximumFrameSeconds <= 0) {
      throw new RangeError("Maximum frame duration must be a positive finite number.");
    }
    if (!Number.isInteger(this.maximumStepsPerFrame) || this.maximumStepsPerFrame < 1) {
      throw new RangeError("Maximum steps per frame must be a positive integer.");
    }
  }

  public get simulationSeconds(): number {
    return this.elapsedSimulationSeconds;
  }

  public advance(
    frameSeconds: number,
    update: (stepSeconds: number, simulationSeconds: number) => void,
  ): FixedClockResult {
    const safeFrameSeconds = Number.isFinite(frameSeconds)
      ? Math.max(0, frameSeconds)
      : 0;
    const acceptedSeconds = Math.min(safeFrameSeconds, this.maximumFrameSeconds);
    let droppedSeconds = safeFrameSeconds - acceptedSeconds;
    this.accumulatorSeconds += acceptedSeconds;

    let steps = 0;
    while (
      this.accumulatorSeconds + EPSILON_SECONDS >= this.stepSeconds &&
      steps < this.maximumStepsPerFrame
    ) {
      this.accumulatorSeconds -= this.stepSeconds;
      this.elapsedSimulationSeconds += this.stepSeconds;
      steps += 1;
      update(this.stepSeconds, this.elapsedSimulationSeconds);
    }

    if (this.accumulatorSeconds + EPSILON_SECONDS >= this.stepSeconds) {
      const retainedSeconds = this.accumulatorSeconds % this.stepSeconds;
      droppedSeconds += this.accumulatorSeconds - retainedSeconds;
      this.accumulatorSeconds = retainedSeconds;
    }

    return Object.freeze({
      steps,
      interpolationAlpha: this.accumulatorSeconds / this.stepSeconds,
      droppedSeconds,
    });
  }

  public reset(): void {
    this.accumulatorSeconds = 0;
    this.elapsedSimulationSeconds = 0;
  }
}

