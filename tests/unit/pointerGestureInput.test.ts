import { describe, expect, it, vi } from "vitest";
import { STANDARD_GESTURE_CONFIG } from "../../src/config/defaults";
import type { GestureRejectionReason } from "../../src/domain/gesture/model";
import {
  PointerGestureInput,
  type AcceptedPointerGesture,
} from "../../src/input/PointerGestureInput";

interface PointerDispatch {
  readonly pointerId?: number;
  readonly pointerType?: string;
  readonly isPrimary?: boolean;
  readonly clientX?: number;
  readonly clientY?: number;
  readonly timeStamp?: number;
  readonly coalesced?: readonly PointerEvent[];
}

class FakeCanvas {
  private readonly listeners = new Map<
    string,
    Set<EventListenerOrEventListenerObject>
  >();
  private readonly capturedPointers = new Set<number>();

  public addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
  ): void {
    if (listener === null) {
      return;
    }
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  public removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
  ): void {
    if (listener !== null) {
      this.listeners.get(type)?.delete(listener);
    }
  }

  public setPointerCapture(pointerId: number): void {
    this.capturedPointers.add(pointerId);
  }

  public hasPointerCapture(pointerId: number): boolean {
    return this.capturedPointers.has(pointerId);
  }

  public releasePointerCapture(pointerId: number): void {
    this.capturedPointers.delete(pointerId);
  }

  public getBoundingClientRect(): DOMRect {
    return {
      x: 0,
      y: 0,
      width: 960,
      height: 540,
      top: 0,
      right: 960,
      bottom: 540,
      left: 0,
      toJSON: () => ({}),
    } as DOMRect;
  }

  public dispatchPointer(type: string, dispatch: PointerDispatch = {}): void {
    const pointerId = dispatch.pointerId ?? 1;
    if (type === "lostpointercapture") {
      this.capturedPointers.delete(pointerId);
    }
    const event = {
      type,
      pointerId,
      pointerType: dispatch.pointerType ?? "mouse",
      isPrimary: dispatch.isPrimary ?? true,
      clientX: dispatch.clientX ?? 480,
      clientY: dispatch.clientY ?? 454,
      timeStamp: dispatch.timeStamp ?? 1_000,
      preventDefault: vi.fn(),
      getCoalescedEvents: () => dispatch.coalesced ?? [],
    } as unknown as PointerEvent;
    for (const listener of this.listeners.get(type) ?? []) {
      if (typeof listener === "function") {
        listener(event);
      } else {
        listener.handleEvent(event);
      }
    }
  }
}

function pointerEvent(dispatch: PointerDispatch): PointerEvent {
  return {
    pointerId: dispatch.pointerId ?? 1,
    pointerType: dispatch.pointerType ?? "mouse",
    isPrimary: dispatch.isPrimary ?? true,
    clientX: dispatch.clientX ?? 480,
    clientY: dispatch.clientY ?? 454,
    timeStamp: dispatch.timeStamp ?? 1_000,
  } as PointerEvent;
}

function createInput(canvas: FakeCanvas): {
  readonly input: PointerGestureInput;
  readonly accepted: AcceptedPointerGesture[];
  readonly rejected: GestureRejectionReason[];
} {
  const accepted: AcceptedPointerGesture[] = [];
  const rejected: GestureRejectionReason[] = [];
  const input = new PointerGestureInput(
    canvas as unknown as HTMLCanvasElement,
    STANDARD_GESTURE_CONFIG,
    {
      onAccepted: (result) => accepted.push(result),
      onRejected: (reason) => rejected.push(reason),
      onTrailChanged: vi.fn(),
    },
  );
  return { input, accepted, rejected };
}

describe("PointerGestureInput browser lifecycle", () => {
  it("accepts a valid terminal pointerup when normal capture loss is observed first", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown", {
      clientY: 454,
      timeStamp: 1_000,
    });
    canvas.dispatchPointer("pointermove", {
      clientY: 350,
      timeStamp: 1_080,
    });
    canvas.dispatchPointer("lostpointercapture", {
      clientY: 350,
      timeStamp: 1_085,
    });
    canvas.dispatchPointer("pointerup", {
      clientY: 350,
      timeStamp: 1_100,
    });

    expect(rejected).toEqual([]);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.pointerType).toBe("mouse");
    input.dispose();
  });

  it("uses coalesced movement samples without also processing the parent event", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown", {
      clientY: 454,
      timeStamp: 1_000,
    });
    canvas.dispatchPointer("pointermove", {
      clientX: 620,
      clientY: 260,
      timeStamp: 1_300,
      coalesced: [
        pointerEvent({ clientX: 490, clientY: 400, timeStamp: 1_060 }),
        pointerEvent({ clientX: 500, clientY: 350, timeStamp: 1_080 }),
      ],
    });
    canvas.dispatchPointer("pointerup", {
      clientX: 500,
      clientY: 350,
      timeStamp: 1_100,
    });

    expect(rejected).toEqual([]);
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.gesture.rawPoints).toHaveLength(4);
    input.dispose();
  });

  it("still treats pointercancel as the interruption terminal", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown");
    canvas.dispatchPointer("pointercancel", { timeStamp: 1_050 });

    expect(accepted).toEqual([]);
    expect(rejected).toEqual(["INTERRUPTED"]);
    expect(canvas.hasPointerCapture(1)).toBe(false);
    input.dispose();
  });

  it("releases active capture and removes listeners during disposal", () => {
    const canvas = new FakeCanvas();
    const { input, accepted, rejected } = createInput(canvas);

    canvas.dispatchPointer("pointerdown");
    expect(canvas.hasPointerCapture(1)).toBe(true);
    input.dispose();
    expect(canvas.hasPointerCapture(1)).toBe(false);

    canvas.dispatchPointer("pointermove", {
      clientY: 350,
      timeStamp: 1_080,
    });
    canvas.dispatchPointer("pointerup", {
      clientY: 350,
      timeStamp: 1_100,
    });
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([]);
  });
});
