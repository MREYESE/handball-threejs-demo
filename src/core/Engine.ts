import { FixedClock } from "./FixedClock";
import type { Disposable } from "./ResourceTracker";

interface FrameScheduler {
  request(callback: FrameRequestCallback): number;
  cancel(handle: number): void;
}

export interface EngineOptions {
  readonly fixedStepSeconds: number;
  readonly onFixedUpdate: (
    stepSeconds: number,
    simulationSeconds: number,
  ) => void;
  readonly onPresent?: (interpolationAlpha: number) => void;
  readonly scheduler?: FrameScheduler;
  readonly manualPumping?: boolean;
}

function createBrowserScheduler(): FrameScheduler {
  return {
    request: (callback) => window.requestAnimationFrame(callback),
    cancel: (handle) => window.cancelAnimationFrame(handle),
  };
}

export class Engine implements Disposable {
  private readonly clock: FixedClock;
  private readonly scheduler: FrameScheduler;
  private animationFrame: number | undefined;
  private previousTimestampMilliseconds: number | undefined;
  private running = false;

  public constructor(private readonly options: EngineOptions) {
    this.clock = new FixedClock({ stepSeconds: options.fixedStepSeconds });
    this.scheduler = options.scheduler ?? createBrowserScheduler();
  }

  public get simulationSeconds(): number {
    return this.clock.simulationSeconds;
  }

  public start(): void {
    if (this.running) {
      return;
    }
    this.running = true;
    this.previousTimestampMilliseconds = undefined;
    this.options.onPresent?.(0);
    if (this.options.manualPumping === true) {
      // Capture mode keeps simulation fixed, while presentation still follows RAF
      // so active browser gestures observe real WebGL frame delivery.
      this.animationFrame = this.scheduler.request(this.presentationFrame);
      return;
    }
    this.animationFrame = this.scheduler.request(this.frame);
  }

  public pumpFrames(frameCount: number): void {
    if (!this.running || this.options.manualPumping !== true) {
      throw new Error("Manual frame pumping is only available in running manual mode.");
    }
    if (!Number.isInteger(frameCount) || frameCount < 0) {
      throw new RangeError("Manual frame count must be a non-negative integer.");
    }

    for (let index = 0; index < frameCount; index += 1) {
      const result = this.clock.advance(
        this.options.fixedStepSeconds,
        this.options.onFixedUpdate,
      );
      this.options.onPresent?.(result.interpolationAlpha);
    }
  }

  public presentFrames(frameCount: number): void {
    if (!this.running || this.options.manualPumping !== true) {
      throw new Error("Manual presentation is only available in running manual mode.");
    }
    if (!Number.isInteger(frameCount) || frameCount < 0) {
      throw new RangeError("Presentation frame count must be a non-negative integer.");
    }
    for (let index = 0; index < frameCount; index += 1) {
      this.options.onPresent?.(0);
    }
  }

  public stop(): void {
    if (!this.running) {
      return;
    }
    this.running = false;
    if (this.animationFrame !== undefined) {
      this.scheduler.cancel(this.animationFrame);
      this.animationFrame = undefined;
    }
    this.previousTimestampMilliseconds = undefined;
  }

  public dispose(): void {
    this.stop();
  }

  private readonly frame = (timestampMilliseconds: number): void => {
    if (!this.running) {
      return;
    }

    const previous = this.previousTimestampMilliseconds ?? timestampMilliseconds;
    const frameSeconds = (timestampMilliseconds - previous) / 1000;
    this.previousTimestampMilliseconds = timestampMilliseconds;
    const result = this.clock.advance(frameSeconds, this.options.onFixedUpdate);
    this.options.onPresent?.(result.interpolationAlpha);
    this.animationFrame = this.scheduler.request(this.frame);
  };

  private readonly presentationFrame = (): void => {
    if (!this.running) {
      return;
    }
    this.options.onPresent?.(0);
    this.animationFrame = this.scheduler.request(this.presentationFrame);
  };
}
