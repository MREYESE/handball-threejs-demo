export interface PerformanceProbeSnapshot {
  readonly measurementActive: boolean;
  readonly sampleCount: number;
  readonly maximumRenderCpuMilliseconds: number;
  readonly meanRenderCpuMilliseconds: number;
  readonly medianFrameMilliseconds: number;
  readonly p50FrameMilliseconds: number;
  readonly p95FrameMilliseconds: number;
  readonly p99FrameMilliseconds: number;
  readonly worstFrameMilliseconds: number;
  readonly maximumDrawCalls: number;
  readonly maximumTriangles: number;
  readonly shaderProgramsAtShotStart: number;
  readonly shaderProgramsCurrent: number;
  readonly shaderProgramDelta: number;
  readonly shaderProgramsStable: boolean;
}

const MAXIMUM_SAMPLES = 360;

export class PerformanceProbe {
  private readonly renderCpuMilliseconds = new Float32Array(MAXIMUM_SAMPLES);
  private readonly frameMilliseconds = new Float32Array(MAXIMUM_SAMPLES);
  private sampleCount = 0;
  private renderCpuSum = 0;
  private maximumRenderCpuMilliseconds = 0;
  private maximumDrawCalls = 0;
  private maximumTriangles = 0;
  private shaderProgramsAtShotStart = 0;
  private shaderProgramsCurrent = 0;
  private measurementActive = false;

  public beginShot(shaderProgramCount: number): void {
    this.sampleCount = 0;
    this.renderCpuSum = 0;
    this.maximumRenderCpuMilliseconds = 0;
    this.maximumDrawCalls = 0;
    this.maximumTriangles = 0;
    this.shaderProgramsAtShotStart = shaderProgramCount;
    this.shaderProgramsCurrent = shaderProgramCount;
    this.measurementActive = true;
  }

  public recordRender(
    renderCpuMilliseconds: number,
    frameMilliseconds: number,
    drawCalls: number,
    triangles: number,
    shaderProgramCount: number,
  ): void {
    if (!this.measurementActive) {
      return;
    }
    const safeRenderTime = Number.isFinite(renderCpuMilliseconds)
      ? Math.max(0, renderCpuMilliseconds)
      : 0;
    const safeFrameTime = Number.isFinite(frameMilliseconds)
      ? Math.max(0, frameMilliseconds)
      : 0;
    if (this.sampleCount < MAXIMUM_SAMPLES) {
      this.renderCpuMilliseconds[this.sampleCount] = safeRenderTime;
      this.frameMilliseconds[this.sampleCount] = safeFrameTime;
      this.sampleCount += 1;
      this.renderCpuSum += safeRenderTime;
    }
    this.maximumRenderCpuMilliseconds = Math.max(
      this.maximumRenderCpuMilliseconds,
      safeRenderTime,
    );
    this.maximumDrawCalls = Math.max(this.maximumDrawCalls, drawCalls);
    this.maximumTriangles = Math.max(this.maximumTriangles, triangles);
    this.shaderProgramsCurrent = shaderProgramCount;
  }

  public finishShot(shaderProgramCount: number): void {
    this.shaderProgramsCurrent = shaderProgramCount;
    this.measurementActive = false;
  }

  public snapshot(): PerformanceProbeSnapshot {
    const shaderProgramDelta =
      this.shaderProgramsCurrent - this.shaderProgramsAtShotStart;
    const sortedFrameTimes = Array.from(
      this.frameMilliseconds.subarray(0, this.sampleCount),
    ).sort((left, right) => left - right);
    const p50FrameMilliseconds = percentile(sortedFrameTimes, 0.5);
    return Object.freeze({
      measurementActive: this.measurementActive,
      sampleCount: this.sampleCount,
      maximumRenderCpuMilliseconds: this.maximumRenderCpuMilliseconds,
      meanRenderCpuMilliseconds:
        this.sampleCount === 0 ? 0 : this.renderCpuSum / this.sampleCount,
      medianFrameMilliseconds: p50FrameMilliseconds,
      p50FrameMilliseconds,
      p95FrameMilliseconds: percentile(sortedFrameTimes, 0.95),
      p99FrameMilliseconds: percentile(sortedFrameTimes, 0.99),
      worstFrameMilliseconds:
        sortedFrameTimes.at(-1) ?? 0,
      maximumDrawCalls: this.maximumDrawCalls,
      maximumTriangles: this.maximumTriangles,
      shaderProgramsAtShotStart: this.shaderProgramsAtShotStart,
      shaderProgramsCurrent: this.shaderProgramsCurrent,
      shaderProgramDelta,
      shaderProgramsStable: shaderProgramDelta === 0,
    });
  }
}

function percentile(sortedValues: readonly number[], percentile01: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = Math.min(
    sortedValues.length - 1,
    Math.max(0, Math.ceil(sortedValues.length * percentile01) - 1),
  );
  return sortedValues[index] ?? 0;
}
