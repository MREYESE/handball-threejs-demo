import type { Disposable } from "../core/ResourceTracker";
import type { ShotOutcome } from "../domain/shot/outcome";

export interface AudioCueCounts {
  readonly ambience: number;
  readonly crowd: number;
  readonly throw: number;
  readonly flight: number;
  readonly goal: number;
  readonly save: number;
  readonly miss: number;
  readonly ui: number;
}

export interface SynthAudioDiagnostics {
  readonly enabled: boolean;
  readonly outputEnabled: boolean;
  readonly outputAvailable: boolean;
  readonly state:
    | "armed"
    | "running"
    | "suspended"
    | "muted"
    | "capture-muted"
    | "unavailable"
    | "disposed";
  readonly contextState: AudioContextState | "not-created";
  readonly requestedCues: AudioCueCounts;
  readonly scheduledCues: AudioCueCounts;
  readonly ambienceStarted: boolean;
  readonly synthesizedOnly: true;
}

type MutableAudioCueCounts = {
  -readonly [Key in keyof AudioCueCounts]: number;
};

type AudioContextConstructor = new (
  contextOptions?: AudioContextOptions,
) => AudioContext;

const EMPTY_CUE_COUNTS = (): MutableAudioCueCounts => ({
  ambience: 0,
  crowd: 0,
  throw: 0,
  flight: 0,
  goal: 0,
  save: 0,
  miss: 0,
  ui: 0,
});

export class SynthAudio implements Disposable {
  private readonly requestedCues = EMPTY_CUE_COUNTS();
  private readonly scheduledCues = EMPTY_CUE_COUNTS();
  private readonly outputEnabled: boolean;
  private enabled: boolean;
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambienceStarted = false;
  private ambienceNodes: OscillatorNode[] = [];
  private noiseBuffer: AudioBuffer | null = null;
  private disposed = false;
  private outputAvailable: boolean;

  public constructor(options: {
    readonly enabled: boolean;
    readonly outputEnabled: boolean;
  }) {
    this.enabled = options.enabled;
    this.outputEnabled = options.outputEnabled;
    this.outputAvailable = this.resolveConstructor() !== null;
  }

  public setEnabled(enabled: boolean): void {
    if (this.disposed || this.enabled === enabled) {
      return;
    }
    this.enabled = enabled;
    if (!enabled) {
      if (this.context?.state === "running") {
        void this.context.suspend().catch(() => undefined);
      }
      return;
    }
    this.requestedCues.ui += 1;
    void this.withContext((context, output) => {
      this.scheduledCues.ui += 1;
      this.scheduleTone(context, output, {
        frequency: 620,
        endFrequency: 880,
        durationSeconds: 0.08,
        gain: 0.05,
        type: "sine",
      });
    });
  }

  public shotReleased(power: number, durationSeconds: number): void {
    if (this.disposed || !this.enabled) {
      return;
    }
    this.requestedCues.throw += 1;
    this.requestedCues.flight += 1;
    void this.withContext((context, output) => {
      this.scheduledCues.throw += 1;
      this.scheduledCues.flight += 1;
      const normalizedPower = Math.max(0, Math.min(1, power));
      this.scheduleNoiseBurst(context, output, {
        durationSeconds: 0.16,
        gain: 0.075 + normalizedPower * 0.035,
        filterFrequency: 1_250 + normalizedPower * 650,
        filterType: "bandpass",
      });
      this.scheduleTone(context, output, {
        frequency: 105 + normalizedPower * 45,
        endFrequency: 68,
        durationSeconds: 0.14,
        gain: 0.07,
        type: "triangle",
      });
      this.scheduleTone(context, output, {
        frequency: 175 + normalizedPower * 70,
        endFrequency: 360 + normalizedPower * 110,
        durationSeconds: Math.max(0.12, durationSeconds),
        gain: 0.022 + normalizedPower * 0.018,
        type: "sine",
      });
    });
  }

  public outcome(outcome: ShotOutcome): void {
    if (this.disposed || !this.enabled) {
      return;
    }
    const outcomeKey =
      outcome === "GOAL" ? "goal" : outcome === "SAVED" ? "save" : "miss";
    this.requestedCues[outcomeKey] += 1;
    this.requestedCues.crowd += 1;
    this.requestedCues.ui += 1;
    void this.withContext((context, output) => {
      this.scheduledCues[outcomeKey] += 1;
      this.scheduledCues.crowd += 1;
      this.scheduledCues.ui += 1;
      this.scheduleOutcomeTones(context, output, outcome);
      this.scheduleCrowdReaction(context, output, outcome);
    });
  }

  public uiConfirm(): void {
    if (this.disposed || !this.enabled) {
      return;
    }
    this.requestedCues.ui += 1;
    void this.withContext((context, output) => {
      this.scheduledCues.ui += 1;
      this.scheduleTone(context, output, {
        frequency: 520,
        endFrequency: 720,
        durationSeconds: 0.07,
        gain: 0.045,
        type: "sine",
      });
    });
  }

  public diagnostics(): SynthAudioDiagnostics {
    return Object.freeze({
      enabled: this.enabled,
      outputEnabled: this.outputEnabled,
      outputAvailable: this.outputAvailable,
      state: this.state(),
      contextState: this.context?.state ?? "not-created",
      requestedCues: Object.freeze({ ...this.requestedCues }),
      scheduledCues: Object.freeze({ ...this.scheduledCues }),
      ambienceStarted: this.ambienceStarted,
      synthesizedOnly: true,
    });
  }

  public dispose(): void {
    if (this.disposed) {
      return;
    }
    this.disposed = true;
    for (const node of this.ambienceNodes) {
      try {
        node.stop();
      } catch {
        // A stopped generated oscillator is already released.
      }
      node.disconnect();
    }
    this.ambienceNodes = [];
    this.masterGain?.disconnect();
    this.masterGain = null;
    this.noiseBuffer = null;
    const context = this.context;
    this.context = null;
    if (context !== null && context.state !== "closed") {
      void context.close().catch(() => undefined);
    }
  }

  private state(): SynthAudioDiagnostics["state"] {
    if (this.disposed) {
      return "disposed";
    }
    if (!this.outputEnabled) {
      return "capture-muted";
    }
    if (!this.outputAvailable) {
      return "unavailable";
    }
    if (!this.enabled) {
      return "muted";
    }
    if (this.context === null) {
      return "armed";
    }
    return this.context.state === "running" ? "running" : "suspended";
  }

  private resolveConstructor(): AudioContextConstructor | null {
    const audioGlobal = globalThis as typeof globalThis & {
      AudioContext?: AudioContextConstructor;
      webkitAudioContext?: AudioContextConstructor;
    };
    return audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext ?? null;
  }

  private async withContext(
    schedule: (context: AudioContext, output: AudioNode) => void,
  ): Promise<void> {
    if (
      this.disposed ||
      !this.enabled ||
      !this.outputEnabled ||
      !this.outputAvailable
    ) {
      return;
    }
    const context = this.ensureContext();
    if (context === null) {
      return;
    }
    try {
      if (context.state === "suspended") {
        await context.resume();
      }
      if (this.disposed || !this.enabled || context.state !== "running") {
        return;
      }
      this.startAmbience(context);
      const output = this.masterGain;
      if (output !== null) {
        schedule(context, output);
      }
    } catch {
      this.outputAvailable = false;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.context !== null) {
      return this.context;
    }
    const Constructor = this.resolveConstructor();
    if (Constructor === null) {
      this.outputAvailable = false;
      return null;
    }
    try {
      const context = new Constructor({ latencyHint: "interactive" });
      const master = context.createGain();
      master.gain.setValueAtTime(0.42, context.currentTime);
      master.connect(context.destination);
      this.context = context;
      this.masterGain = master;
      this.noiseBuffer = this.createGeneratedNoise(context);
      return context;
    } catch {
      this.outputAvailable = false;
      return null;
    }
  }

  private startAmbience(context: AudioContext): void {
    if (this.ambienceStarted || this.masterGain === null) {
      return;
    }
    this.ambienceStarted = true;
    this.requestedCues.ambience += 1;
    this.scheduledCues.ambience += 1;
    const ambienceBus = context.createGain();
    ambienceBus.gain.setValueAtTime(0.018, context.currentTime);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(520, context.currentTime);
    ambienceBus.connect(filter);
    filter.connect(this.masterGain);

    for (const [frequency, type] of [
      [82, "sine"],
      [123, "triangle"],
    ] as const) {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.detune.setValueAtTime(
        frequency === 82 ? -4 : 5,
        context.currentTime,
      );
      oscillator.connect(ambienceBus);
      oscillator.start();
      this.ambienceNodes.push(oscillator);
    }
  }

  private scheduleOutcomeTones(
    context: AudioContext,
    output: AudioNode,
    outcome: ShotOutcome,
  ): void {
    if (outcome === "GOAL") {
      this.scheduleTone(context, output, {
        frequency: 392,
        endFrequency: 784,
        durationSeconds: 0.32,
        gain: 0.095,
        type: "sawtooth",
      });
      this.scheduleTone(context, output, {
        frequency: 523.25,
        endFrequency: 659.25,
        durationSeconds: 0.38,
        gain: 0.06,
        type: "triangle",
        delaySeconds: 0.05,
      });
      return;
    }
    if (outcome === "SAVED") {
      this.scheduleTone(context, output, {
        frequency: 168,
        endFrequency: 92,
        durationSeconds: 0.26,
        gain: 0.11,
        type: "square",
      });
      this.scheduleNoiseBurst(context, output, {
        durationSeconds: 0.2,
        gain: 0.08,
        filterFrequency: 720,
        filterType: "lowpass",
      });
      return;
    }
    this.scheduleTone(context, output, {
      frequency: 260,
      endFrequency: 128,
      durationSeconds: 0.34,
      gain: 0.07,
      type: "triangle",
    });
  }

  private scheduleCrowdReaction(
    context: AudioContext,
    output: AudioNode,
    outcome: ShotOutcome,
  ): void {
    this.scheduleNoiseBurst(context, output, {
      durationSeconds: outcome === "GOAL" ? 0.62 : 0.42,
      gain: outcome === "GOAL" ? 0.11 : outcome === "SAVED" ? 0.085 : 0.05,
      filterFrequency:
        outcome === "GOAL" ? 1_450 : outcome === "SAVED" ? 980 : 620,
      filterType: "bandpass",
      delaySeconds: outcome === "MISS" ? 0.04 : 0,
    });
  }

  private scheduleTone(
    context: AudioContext,
    output: AudioNode,
    options: {
      readonly frequency: number;
      readonly endFrequency: number;
      readonly durationSeconds: number;
      readonly gain: number;
      readonly type: OscillatorType;
      readonly delaySeconds?: number;
    },
  ): void {
    const start = context.currentTime + (options.delaySeconds ?? 0);
    const end = start + options.durationSeconds;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type;
    oscillator.frequency.setValueAtTime(options.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, options.endFrequency),
      end,
    );
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gain, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(output);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }

  private scheduleNoiseBurst(
    context: AudioContext,
    output: AudioNode,
    options: {
      readonly durationSeconds: number;
      readonly gain: number;
      readonly filterFrequency: number;
      readonly filterType: BiquadFilterType;
      readonly delaySeconds?: number;
    },
  ): void {
    const buffer = this.noiseBuffer;
    if (buffer === null) {
      return;
    }
    const start = context.currentTime + (options.delaySeconds ?? 0);
    const end = start + options.durationSeconds;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    filter.type = options.filterType;
    filter.frequency.setValueAtTime(options.filterFrequency, start);
    filter.Q.setValueAtTime(0.7, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gain, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);
    source.start(start);
    source.stop(end + 0.02);
  }

  private createGeneratedNoise(context: AudioContext): AudioBuffer {
    const length = Math.max(1, Math.floor(context.sampleRate * 0.72));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let state = 0x7a11ce;
    for (let index = 0; index < samples.length; index += 1) {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
      samples[index] = (state / 0xffff_ffff) * 2 - 1;
    }
    return buffer;
  }
}
