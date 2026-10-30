import { describe, expect, it } from "vitest";
import { validatePointerTrace, type PointerTraceEvent } from "../e2e/pointerGestures";

describe("native gesture render evidence", () => {
  const trace: PointerTraceEvent[] = ["pointerdown", "pointermove", "pointerup"].map((type, i) => ({
    type, timeStamp: 100 + i * 50, clientX: 480, clientY: 450 - i * 50,
    pointerId: 2, pointerType: "touch", isPrimary: true, presentedFrames: 17, coalescedEvents: [],
  }));
  const bounds = { x: 0, y: 0, width: 960, height: 540 };
  it("counts a complete native-interval render despite batched handler delivery", () => {
    const evidence = validatePointerTrace(trace, null, true, bounds, [[120, 125]]);
    expect(evidence.renderFramesDuringGesture).toBe(1);
    expect(evidence.renderFramesDuringHandlerInterval).toBe(0);
  });
  it("counts an in-progress real render returning after native pointerdown", () => {
    expect(validatePointerTrace(trace, null, true, bounds, [[90, 110]])
      .renderFramesDuringGesture).toBe(1);
  });
  it.each([
    [], [[80, 90]], [[210, 220]], [[190, 210]],
    [[120, Number.NaN]], [[125, 120]], [[120, Number.POSITIVE_INFINITY]],
  ])("rejects absent, outside, incomplete or invalid renders: %j", (...intervals) => {
    // A moving handler counter cannot substitute for native-interval evidence.
    const movingCounter = trace.map((event, i) => ({ ...event, presentedFrames: 17 + i }));
    expect(() => validatePointerTrace(movingCounter, null, true, bounds,
      intervals as [number, number][])).toThrow("timing or presentation");
  });
});
