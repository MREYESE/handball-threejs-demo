import type { GestureConfig } from "../config/types";
import { analyzeStandardGesture } from "../domain/gesture/features";
import {
  recognizeFeintAction,
  validateFeintConfig,
} from "../domain/gesture/feint";
import type {
  FeintAction,
  GestureRejectionReason,
  GestureSample,
  StandardShotGesture,
  Viewport,
} from "../domain/gesture/model";
import {
  isIntermediateSampleFarEnough,
  preprocessGesture,
} from "../domain/gesture/preprocess";
import type { Vec2 } from "../domain/math";
import type { GoalkeeperObservation } from "../domain/goalkeeper/commitment";
import type { Disposable } from "../core/ResourceTracker";

import type { GestureTraceObserver, TraceSample } from "../dev/GestureTrace";

export interface AcceptedPointerGesture {
  readonly gesture: StandardShotGesture;
  readonly pointerType: string;
}

export interface PointerGestureCallbacks {
  readonly onAccepted: (result: AcceptedPointerGesture) => void;
  readonly onFeintCompleted?: (result: AcceptedPointerGesture) => void;
  readonly onRejected: (reason: GestureRejectionReason) => void;
  readonly onFeintChanged?: (feint: FeintAction | null) => void;
  readonly onGestureStarted?: () => void;
  readonly onGoalkeeperObservation?: (
    observation: GoalkeeperObservation,
  ) => void;
  readonly onTrailChanged: (
    points: readonly Vec2[],
    viewport: Viewport,
  ) => void;
}

export class PointerGestureInput implements Disposable {
  private activePointerId: number | null = null;
  private activePointerType = "unknown";
  private samples: GestureSample[] = [];
  private pendingFeint: FeintAction | null = null;
  private enabled = true;
  private captureLossTimer: ReturnType<typeof setTimeout> | undefined;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GestureConfig,
    private readonly callbacks: PointerGestureCallbacks,
    private readonly trace?: GestureTraceObserver,
  ) {
    validateFeintConfig(config);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
    canvas.addEventListener("lostpointercapture", this.onLostCapture);
    // lostpointercapture is also emitted after an ordinary pointerup. The
    // terminal PointerEvent, not capture-loss notification ordering, decides
    // whether this gesture completed or was interrupted.
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled && this.activePointerId !== null) {
      this.cancelActive("INTERRUPTED");
    }
  }

  public dispose(): void {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerCancel);
    this.canvas.removeEventListener("lostpointercapture", this.onLostCapture);
    if (this.captureLossTimer !== undefined) clearTimeout(this.captureLossTimer);
    this.releaseActiveCapture();
    this.callbacks.onFeintChanged?.(null);
  }

  public diagnostics(): Readonly<{
    captureActive: boolean;
    pointerType: string | null;
    sampleCount: number;
    pendingFeint: FeintAction | null;
  }> {
    return Object.freeze({
      captureActive: this.activePointerId !== null,
      pointerType:
        this.activePointerId === null ? null : this.activePointerType,
      sampleCount: this.samples.length,
      pendingFeint: this.pendingFeint,
    });
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!this.enabled || this.activePointerId !== null || !event.isPrimary) {
      return;
    }

    const { point, viewport } = this.localPoint(event);
    this.startTrace(event, viewport);
    const inputZoneTop =
      viewport.heightPixels * (1 - this.config.startZoneFraction);
    if (
      point.x < 0 ||
      point.x > viewport.widthPixels ||
      point.y < inputZoneTop ||
      point.y > viewport.heightPixels
    ) {
      this.traceSample(event, "down", false, event, viewport, point);
      this.trace?.finish(viewport, null, "START_OUTSIDE_INPUT_ZONE");
      this.callbacks.onRejected("START_OUTSIDE_INPUT_ZONE");
      return;
    }

    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.activePointerType = event.pointerType || "unknown";
    this.samples = [this.sample(event, point)];
    this.traceSample(event, "down", true, event, viewport, point);
    this.canvas.setPointerCapture(event.pointerId);
    this.callbacks.onGestureStarted?.();
    this.publishTrail(viewport);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    event.preventDefault();

    // Browsers may merge several hardware samples into one pointermove when
    // presentation is expensive. Consume either the un-coalesced samples or
    // the parent event, never both.
    const coalesced =
      typeof event.getCoalescedEvents === "function"
        ? event.getCoalescedEvents()
        : [];
    const movementEvents =
      coalesced.length > 0 ? coalesced : [event];
    const viewport = this.viewport();
    let changed = false;
    if (coalesced.length > 0) this.traceSample(event, "parent", false, event, viewport);

    for (const movementEvent of movementEvents) {
      if (movementEvent.pointerId !== this.activePointerId) {
        continue;
      }
      const point = this.localPointInViewport(movementEvent);
      const previous = this.samples.at(-1);
      const retained =
        previous !== undefined &&
        isIntermediateSampleFarEnough(
          previous.positionPixels,
          point,
          {
            xPixels: 0,
            yPixels: 0,
            widthPixels: viewport.widthPixels,
            heightPixels: viewport.heightPixels,
          },
          this.config,
        );
      this.traceSample(movementEvent, coalesced.length > 0 ? "coalesced" : "parent", retained, event, viewport, point);
      if (retained) {
        this.samples.push(this.sample(movementEvent, point));
        // Browser batching must not erase observable cue history. Recognize
        // each retained prefix in order, just as for separate pointermoves.
        this.trace?.movement();
        this.tryRecognizeFeint(viewport);
        this.publishGoalkeeperObservation(viewport);
        changed = true;
      }
    }

    if (changed) {
      this.publishTrail(viewport);
    }
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    event.preventDefault();
    const { point, viewport } = this.localPoint(event);
    this.samples.push(this.sample(event, point));
    this.traceSample(event, "up", true, event, viewport, point);
    const pointerType = this.activePointerType;
    const samples = this.samples;
    this.trace?.movement();
    this.tryRecognizeFeint(viewport);
    const feint = this.pendingFeint;
    this.releaseCapture(event.pointerId);

    const result = preprocessGesture(samples, viewport, this.config, {
      inputEnabled: this.enabled,
      nonShootingFeint: feint !== null,
    });
    if (!result.accepted) {
      this.trace?.finish(viewport, null, result.reason);
      this.callbacks.onFeintChanged?.(null);
      this.callbacks.onRejected(result.reason);
      this.callbacks.onTrailChanged(Object.freeze([]), viewport);
      return;
    }

    const gesture = analyzeStandardGesture(result.points, viewport, this.config, feint);
    this.trace?.finish(viewport, gesture, null);
    if (feint !== null) {
      this.callbacks.onFeintCompleted?.({ gesture, pointerType });
      this.callbacks.onTrailChanged(Object.freeze([]), viewport);
    } else {
      this.callbacks.onAccepted({ gesture, pointerType });
    }
    this.callbacks.onFeintChanged?.(null);
  };

  private readonly onLostCapture = (event: PointerEvent): void => {
    if (event.pointerId !== this.activePointerId) return;
    const pointerId = event.pointerId;
    this.captureLossTimer = setTimeout(() => {
      if (this.activePointerId === pointerId) this.cancelActive("INTERRUPTED");
    }, 0);
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId === this.activePointerId) {
      this.traceSample(event, "cancel", false, event, this.viewport());
      this.cancelActive("INTERRUPTED");
    }
  };

  private cancelActive(reason: GestureRejectionReason): void {
    const viewport = this.viewport();
    this.trace?.finish(viewport, null, reason);
    this.releaseActiveCapture();
    this.callbacks.onFeintChanged?.(null);
    this.callbacks.onTrailChanged(Object.freeze([]), viewport);
    this.callbacks.onRejected(reason);
  }

  private releaseCapture(pointerId: number): void {
    this.clearActiveState();
    this.releaseHeldCapture(pointerId);
  }

  private releaseActiveCapture(): void {
    const pointerId = this.activePointerId;
    this.clearActiveState();
    if (pointerId !== null) {
      this.releaseHeldCapture(pointerId);
    }
  }

  private clearActiveState(): void {
    if (this.captureLossTimer !== undefined) clearTimeout(this.captureLossTimer);
    this.activePointerId = null;
    this.activePointerType = "unknown";
    this.samples = [];
    this.pendingFeint = null;
  }

  private releaseHeldCapture(pointerId: number): void {
    if (this.canvas.hasPointerCapture(pointerId)) {
      this.canvas.releasePointerCapture(pointerId);
    }
  }

  private startTrace(event: PointerEvent, viewport: Viewport): void {
    if (!this.trace) return;
    const rect = this.canvas.getBoundingClientRect();
    this.trace.start({ pointerType: event.pointerType || "unknown", viewport,
      bounds: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      browserViewport: { width: window.innerWidth, height: window.innerHeight },
      backingStore: { width: this.canvas.width, height: this.canvas.height }, dpr: window.devicePixelRatio });
  }

  private traceSample(event: PointerEvent, source: TraceSample["source"], retained: boolean,
    parent: PointerEvent, viewport: Viewport, point?: Vec2): void {
    this.trace?.sample({ sample: this.sample(event, point ?? this.localPointInViewport(event)), source,
      retained, parentTimeSeconds: parent.timeStamp / 1000, viewport });
  }

  private localPoint(event: PointerEvent): {
    readonly point: Vec2;
    readonly viewport: Viewport;
  } {
    const rect = this.canvas.getBoundingClientRect();
    const viewport = Object.freeze({
      widthPixels: rect.width,
      heightPixels: rect.height,
    });
    return {
      point: Object.freeze({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }),
      viewport,
    };
  }

  private localPointInViewport(event: PointerEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return Object.freeze({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  private sample(event: PointerEvent, point: Vec2): GestureSample {
    return Object.freeze({
      positionPixels: point,
      timeSeconds: event.timeStamp / 1000,
    });
  }

  private viewport(): Viewport {
    const rect = this.canvas.getBoundingClientRect();
    return Object.freeze({
      widthPixels: rect.width,
      heightPixels: rect.height,
    });
  }

  private publishTrail(viewport: Viewport): void {
    this.callbacks.onTrailChanged(
      Object.freeze(this.samples.map((sample) => sample.positionPixels)),
      viewport,
    );
  }

  private tryRecognizeFeint(viewport: Viewport): void {
    if (this.pendingFeint !== null || this.samples.length < 3) {
      return;
    }
    const first = this.samples[0];
    if (first === undefined) {
      return;
    }
    const points = this.samples.map((sample) =>
      Object.freeze({
        positionPixels: sample.positionPixels,
        safeAreaPosition01: Object.freeze({
          x: sample.positionPixels.x / viewport.widthPixels,
          y: sample.positionPixels.y / viewport.heightPixels,
        }),
        timeSeconds: sample.timeSeconds - first.timeSeconds,
      }),
    );
    const recognized = recognizeFeintAction(points, this.config);
    if (recognized !== null) {
      this.pendingFeint = recognized;
      this.callbacks.onFeintChanged?.(recognized);
    }
  }

  private publishGoalkeeperObservation(viewport: Viewport): void {
    const start = this.samples[0];
    const latest = this.samples.at(-1);
    if (
      start === undefined ||
      latest === undefined ||
      viewport.widthPixels <= 0 ||
      viewport.heightPixels <= 0
    ) {
      return;
    }
    const displacement = {
      x:
        (latest.positionPixels.x - start.positionPixels.x) /
        viewport.widthPixels,
      y:
        (start.positionPixels.y - latest.positionPixels.y) /
        viewport.heightPixels,
    };
    const displacementLength = Math.hypot(displacement.x, displacement.y);
    if (!Number.isFinite(displacementLength) || displacementLength <= 1e-9) {
      return;
    }
    const feint = this.pendingFeint;
    const apparentDirection = feint?.apparentDirection ??
      Object.freeze({
        x: displacement.x / displacementLength,
        y: displacement.y / displacementLength,
      });
    this.callbacks.onGoalkeeperObservation?.(
      Object.freeze({
        apparentDirection,
        elapsedGestureSeconds: Math.max(
          0,
          latest.timeSeconds - start.timeSeconds,
        ),
        confidence: Math.min(1, displacementLength),
        feint,
      }),
    );
  }
}
