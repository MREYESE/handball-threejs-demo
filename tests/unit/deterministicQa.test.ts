import { describe, expect, it } from "vitest";
import {
  compareExactPng,
  shouldWritePngBaseline,
} from "../e2e/imageDiff";
import { STANDARD_GESTURE_CONFIG } from "../../src/config/defaults";
import { analyzeStandardGesture } from "../../src/domain/gesture/features";
import {
  resolveNeutralSideSpinPowerWaypoints,
  resolvePowerSaturationAnchor,
} from "../e2e/pointerGestures";
import { auditProductionRequests } from "../e2e/runtimeObservation";

function pngHeader(width: number, height: number, suffix = 0): Buffer {
  const value = Buffer.alloc(25);
  Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]).copy(value);
  value.writeUInt32BE(13, 8);
  value.write("IHDR", 12, "ascii");
  value.writeUInt32BE(width, 16);
  value.writeUInt32BE(height, 20);
  value[24] = suffix;
  return value;
}

describe("deterministic QA tooling", () => {
  it("reports exact lossless PNG equality and byte differences", () => {
    const baseline = pngHeader(1920, 1080);

    expect(compareExactPng(baseline, Buffer.from(baseline))).toMatchObject({
      matches: true,
      differingBytes: 0,
      firstDifferingByte: null,
      width: 1920,
      height: 1080,
    });
    expect(compareExactPng(baseline, pngHeader(1920, 1080, 1))).toMatchObject({
      matches: false,
      differingBytes: 1,
      firstDifferingByte: 24,
    });
    expect(
      compareExactPng(baseline, Buffer.concat([baseline, Buffer.from([1])])),
    ).toMatchObject({
      matches: false,
      differingBytes: 1,
      firstDifferingByte: baseline.length,
    });
  });

  it("rejects dimension mismatches and non-PNG inputs", () => {
    expect(() =>
      compareExactPng(pngHeader(1920, 1080), pngHeader(844, 390)),
    ).toThrow(/dimensions differ/);
    expect(() =>
      compareExactPng(Buffer.from("not png"), Buffer.from("not png")),
    ).toThrow(/valid PNG header/);
  });

  it("writes only repeat-proven baselines and recovers failed initial creation", () => {
    expect(
      shouldWritePngBaseline({
        baselineExists: false,
        explicitUpdate: false,
        currentRepeatMatches: false,
        priorBaselineCreatedByFailedRepeat: false,
        baselineRequiresHarnessMigration: false,
      }),
    ).toBe(false);
    expect(
      shouldWritePngBaseline({
        baselineExists: false,
        explicitUpdate: false,
        currentRepeatMatches: true,
        priorBaselineCreatedByFailedRepeat: false,
        baselineRequiresHarnessMigration: false,
      }),
    ).toBe(true);
    expect(
      shouldWritePngBaseline({
        baselineExists: true,
        explicitUpdate: false,
        currentRepeatMatches: true,
        priorBaselineCreatedByFailedRepeat: true,
        baselineRequiresHarnessMigration: false,
      }),
    ).toBe(true);
    expect(
      shouldWritePngBaseline({
        baselineExists: true,
        explicitUpdate: false,
        currentRepeatMatches: true,
        priorBaselineCreatedByFailedRepeat: false,
        baselineRequiresHarnessMigration: false,
      }),
    ).toBe(false);
    expect(
      shouldWritePngBaseline({
        baselineExists: true,
        explicitUpdate: true,
        currentRepeatMatches: false,
        priorBaselineCreatedByFailedRepeat: false,
        baselineRequiresHarnessMigration: false,
      }),
    ).toBe(false);
    expect(
      shouldWritePngBaseline({
        baselineExists: true,
        explicitUpdate: false,
        currentRepeatMatches: true,
        priorBaselineCreatedByFailedRepeat: false,
        baselineRequiresHarnessMigration: true,
      }),
    ).toBe(true);
  });

  it("accepts only the production document and local JS/CSS bundle requests", () => {
    expect(
      auditProductionRequests([
        "http://127.0.0.1:4173/?playtest",
        "http://127.0.0.1:4173/assets/index.js",
        "http://127.0.0.1:4173/assets/index.css",
      ]),
    ).toEqual(["/", "/assets/index.css", "/assets/index.js"]);
    expect(() =>
      auditProductionRequests([
        "http://127.0.0.1:4173/",
        "http://cdn.example.invalid/arena.png",
      ]),
    ).toThrow(/External runtime request/);
    expect(() =>
      auditProductionRequests([
        "http://127.0.0.1:4173/",
        "http://127.0.0.1:4173/arena.png",
      ]),
    ).toThrow(/Runtime media\/data request/);
  });

  it("keeps capture power segments saturated at the maximum allowed sample gap", () => {
    const bounds = { x: 0, y: 0, width: 960, height: 540 } as const;
    const start = { x: bounds.width * 0.5, y: bounds.height * 0.84 };
    const maximumGapSeconds = 0.25;
    const releaseSpeedFullPower = 2.4;
    const maximumSpeedFullPower = 3;

    for (const [horizontalAim, verticalAim] of [
      [-0.7, 0],
      [0, 0],
      [1, 0],
      [0.7, 0],
      [0, 0.72],
      [0.42, 0.45],
    ] as const) {
      const end = {
        x: start.x + horizontalAim * bounds.width * 0.22,
        y:
          start.y -
          ((verticalAim + 1) / 2) * bounds.height * 0.28,
      };
      const anchor = resolvePowerSaturationAnchor(bounds, end.x);
      const firstSpeed =
        normalizedDistance(start, anchor, bounds) / maximumGapSeconds;
      const releaseSpeed =
        normalizedDistance(anchor, end, bounds) / maximumGapSeconds;

      expect(firstSpeed).toBeGreaterThan(maximumSpeedFullPower);
      expect((firstSpeed + releaseSpeed) / 2).toBeGreaterThan(
        releaseSpeedFullPower,
      );
      expect(anchor.x).toBeGreaterThan(bounds.x);
      expect(anchor.x).toBeLessThan(bounds.x + bounds.width);
      expect(anchor.y).toBeGreaterThan(bounds.y);
      expect(anchor.y).toBeLessThan(bounds.y + bounds.height);
    }
  });

  it("keeps legacy full-power contact traces neutral for side-spin and loft", () => {
    const bounds = { x: 0, y: 0, width: 960, height: 540 } as const;

    for (const [horizontalAim, verticalAim] of [
      [-0.7, 0],
      [0, 0],
      [0.9, 0],
      [1, 0],
      [0, 1],
    ] as const) {
      const start = { x: bounds.width * 0.5, y: bounds.height * 0.84 };
      const end = {
        x: start.x + horizontalAim * bounds.width * 0.22,
        y:
          start.y -
          ((verticalAim + 1) / 2) * bounds.height * 0.28,
      };
      const waypoints = resolveNeutralSideSpinPowerWaypoints(
        bounds,
        end.x,
        end.y,
      );
      const pixels = [start, ...waypoints, end];
      const points = pixels.map((positionPixels, index) => ({
        positionPixels,
        safeAreaPosition01: {
          x: positionPixels.x / bounds.width,
          y: positionPixels.y / bounds.height,
        },
        timeSeconds: (index * 0.08) / (pixels.length - 1),
      }));
      const gesture = analyzeStandardGesture(
        points,
        { widthPixels: bounds.width, heightPixels: bounds.height },
        STANDARD_GESTURE_CONFIG,
      );

      expect(gesture.sideSpin).toBeCloseTo(0, 12);
      // The old saturation fixture draws a V; v3 bounds its top-spin.
      expect(gesture.topSpin).toBeCloseTo(0.14, 12);
      expect(gesture.loft).toBeCloseTo(0, 12);
      expect(gesture.power).toBe(1);
    }
  });
});

function normalizedDistance(
  left: Readonly<{ x: number; y: number }>,
  right: Readonly<{ x: number; y: number }>,
  bounds: Readonly<{ width: number; height: number }>,
): number {
  return Math.hypot(
    (right.x - left.x) / bounds.width,
    (right.y - left.y) / bounds.height,
  );
}
