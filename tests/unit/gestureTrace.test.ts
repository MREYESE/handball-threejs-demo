import { describe, expect, it } from "vitest";
import { STANDARD_GESTURE_CONFIG } from "../../src/config/defaults";
import { GestureTrace, replayGestureTrace, type TraceContext } from "../../src/dev/GestureTrace";
const context: TraceContext = { pointerType: "touch", bounds: { left: 0, top: 0, width: 960, height: 540 },
  viewport: { widthPixels: 960, heightPixels: 540 }, browserViewport: { width: 960, height: 540 },
  backingStore: { width: 1920, height: 1080 }, dpr: 2 };

describe("bounded local gesture history", () => {
  it("marks unfinished and truncated attempts and reports evictions", () => {
    const trace = new GestureTrace(STANDARD_GESTURE_CONFIG, {}, 2, 2);
    for (let index = 0; index < 3; index++) {
      trace.start(context);
      for (let n = 0; n < 3; n++) trace.sample({ sample: { positionPixels: { x: 400, y: 450 }, timeSeconds: n },
        source: "parent", retained: true, parentTimeSeconds: n, viewport: context.viewport });
    }
    const exported = trace.export();
    expect(exported.droppedAttempts).toBe(1);
    expect(exported.attempts).toHaveLength(2);
    expect(exported.attempts[0]!.samples).toHaveLength(2);
    expect(exported.attempts.every((a) => a.truncated && !a.replayable && !a.lifecycleComplete)).toBe(true);
    expect(() => replayGestureTrace(exported.attempts[0]!, exported.config)).toThrow("Incomplete");
  });
  it("keeps collection labels independent and preserves actual cancellation", () => {
    const trace = new GestureTrace(STANDARD_GESTURE_CONFIG, {});
    trace.metadata = { intendedTechnique: "ROSCA_LEFT", partition: "HELD_OUT" };
    trace.start(context);
    trace.metadata.intendedTechnique = "LOB";
    trace.finish(context.viewport, null, "INTERRUPTED");
    const attempt = trace.export().attempts[0]!;
    expect(attempt.metadata.intendedTechnique).toBe("ROSCA_LEFT");
    expect(attempt.gesture).toBeNull();
    expect(replayGestureTrace(attempt, trace.config)).toEqual({ accepted: false, reason: "INTERRUPTED" });
  });
});
