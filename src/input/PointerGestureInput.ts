import type { GestureConfig } from "../config/types";
import { analyzeStandardGesture } from "../domain/gesture/features";
import type {
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
import type { Disposable } from "../core/ResourceTracker";

export interface AcceptedPointerGesture {
  readonly gesture: StandardShotGesture;
  readonly pointerType: string;
}

export interface PointerGestureCallbacks {
  readonly onAccepted: (result: AcceptedPointerGesture) => void;
  readonly onRejected: (reason: GestureRejectionReason) => void;
  readonly onTrailChanged: (
    points: readonly Vec2[],
    viewport: Viewport,
  ) => void;
}

export class PointerGestureInput implements Disposable {
  private activePointerId: number | null = null;
  private activePointerType = "unknown";
  private samples: GestureSample[] = [];
  private enabled = true;

  public constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly config: GestureConfig,
    private readonly callbacks: PointerGestureCallbacks,
  ) {
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.onPointerUp);
    canvas.addEventListener("pointercancel", this.onPointerCancel);
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
    this.releaseActiveCapture();
  }

  private readonly onPointerDown = (event: PointerEvent): void => {
    if (!this.enabled || this.activePointerId !== null || !event.isPrimary) {
      return;
    }

    const { point, viewport } = this.localPoint(event);
    const inputZoneTop =
      viewport.heightPixels * (1 - this.config.startZoneFraction);
    if (
      point.x < 0 ||
      point.x > viewport.widthPixels ||
      point.y < inputZoneTop ||
      point.y > viewport.heightPixels
    ) {
      this.callbacks.onRejected("START_OUTSIDE_INPUT_ZONE");
      return;
    }

    event.preventDefault();
    this.activePointerId = event.pointerId;
    this.activePointerType = event.pointerType || "unknown";
    this.samples = [this.sample(event, point)];
    this.canvas.setPointerCapture(event.pointerId);
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

    for (const movementEvent of movementEvents) {
      if (movementEvent.pointerId !== this.activePointerId) {
        continue;
      }
      const point = this.localPointInViewport(movementEvent);
      const previous = this.samples.at(-1);
      if (
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
        )
      ) {
        this.samples.push(this.sample(movementEvent, point));
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
    const pointerType = this.activePointerType;
    const samples = this.samples;
    this.releaseCapture(event.pointerId);

    const result = preprocessGesture(samples, viewport, this.config, {
      inputEnabled: this.enabled,
    });
    if (!result.accepted) {
      this.callbacks.onRejected(result.reason);
      this.callbacks.onTrailChanged(Object.freeze([]), viewport);
      return;
    }

    this.callbacks.onAccepted({
      gesture: analyzeStandardGesture(result.points, viewport, this.config),
      pointerType,
    });
  };

  private readonly onPointerCancel = (event: PointerEvent): void => {
    if (event.pointerId === this.activePointerId) {
      this.cancelActive("INTERRUPTED");
    }
  };

  private cancelActive(reason: GestureRejectionReason): void {
    const viewport = this.viewport();
    this.releaseActiveCapture();
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
    this.activePointerId = null;
    this.activePointerType = "unknown";
    this.samples = [];
  }

  private releaseHeldCapture(pointerId: number): void {
    if (this.canvas.hasPointerCapture(pointerId)) {
      this.canvas.releasePointerCapture(pointerId);
    }
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
}
