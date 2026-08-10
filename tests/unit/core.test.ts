import { describe, expect, it, vi } from "vitest";
import { Engine } from "../../src/core/Engine";
import { EventBus } from "../../src/core/EventBus";
import { FixedClock } from "../../src/core/FixedClock";
import {
  getQualityConfig,
  resolveQualityPreset,
} from "../../src/core/Quality";
import { ResourceTracker } from "../../src/core/ResourceTracker";
import { SeededRng } from "../../src/core/SeededRng";

describe("fixed-step core", () => {
  it("advances deterministic steps and reports interpolation", () => {
    const clock = new FixedClock({
      stepSeconds: 0.1,
      maximumFrameSeconds: 1,
      maximumStepsPerFrame: 10,
    });
    const updates: number[] = [];

    const first = clock.advance(0.25, (_step, elapsed) => updates.push(elapsed));
    const second = clock.advance(0.05, (_step, elapsed) => updates.push(elapsed));

    expect(first.steps).toBe(2);
    expect(first.interpolationAlpha).toBeCloseTo(0.5);
    expect(second.steps).toBe(1);
    expect(updates).toEqual([0.1, 0.2, 0.30000000000000004]);
  });

  it("bounds catch-up and reports discarded time", () => {
    const clock = new FixedClock({
      stepSeconds: 0.1,
      maximumFrameSeconds: 0.25,
      maximumStepsPerFrame: 2,
    });
    const result = clock.advance(2, () => undefined);

    expect(result.steps).toBe(2);
    expect(result.droppedSeconds).toBeCloseTo(1.75);
  });

  it("supports deterministic manual engine pumping without a scheduler", () => {
    const updates: number[] = [];
    let presentations = 0;
    const scheduler = {
      request: vi.fn(() => 1),
      cancel: vi.fn(),
    };
    const engine = new Engine({
      fixedStepSeconds: 0.1,
      manualPumping: true,
      scheduler,
      onFixedUpdate: (_step, elapsed) => updates.push(elapsed),
      onPresent: () => {
        presentations += 1;
      },
    });

    engine.start();
    engine.pumpFrames(3);
    engine.presentFrames(2);

    expect(updates).toEqual([0.1, 0.2, 0.30000000000000004]);
    expect(presentations).toBe(6);
    engine.dispose();
    expect(scheduler.request).toHaveBeenCalledOnce();
    expect(scheduler.cancel).toHaveBeenCalledWith(1);
  });
});

describe("deterministic services", () => {
  it("keeps seeded and forked random streams reproducible", () => {
    const first = new SeededRng(1234);
    const second = new SeededRng(1234);

    expect(Array.from({ length: 4 }, () => first.nextUint32())).toEqual(
      Array.from({ length: 4 }, () => second.nextUint32()),
    );
    expect(new SeededRng(10).fork("keeper").nextUint32()).toBe(
      new SeededRng(10).fork("keeper").nextUint32(),
    );
    expect(new SeededRng(10).fork("keeper").nextUint32()).not.toBe(
      new SeededRng(10).fork("crowd").nextUint32(),
    );
  });

  it("delivers typed events and supports unsubscription", () => {
    const events = new EventBus<{ score: Readonly<{ goals: number }> }>();
    const handler = vi.fn();
    const unsubscribe = events.on("score", handler);

    events.emit("score", { goals: 1 });
    unsubscribe();
    events.emit("score", { goals: 2 });

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith({ goals: 1 });
  });

  it("disposes tracked resources once in reverse order", () => {
    const tracker = new ResourceTracker();
    const order: number[] = [];
    tracker.add(() => order.push(1));
    tracker.add(() => order.push(2));

    tracker.dispose();
    tracker.dispose();

    expect(order).toEqual([2, 1]);
  });

  it("exposes bounded immutable balanced, high, and capture presets", () => {
    expect(getQualityConfig("balanced")).toMatchObject({
      name: "balanced",
      runtimeRole: "default_gameplay",
      maximumPixelRatio: 1.25,
      shadowMapSizeMaximum: 1024,
      crowdInstances: 160,
      crowdInstancesMaximum: 240,
      animatedCrowdInstances: 0,
      animatedCrowdInstancesMaximum: 48,
      crowdAnimationMaximumHz: 0,
      proceduralTextureResolutionMaximum: 128,
      environmentMapSizeMaximum: 96,
      shadowCastingLightsMaximum: 1,
      shadowCastingKeyLight: false,
      antialias: false,
      postProcessing: false,
      frustumCullingRequired: true,
    });
    expect(getQualityConfig("high")).toMatchObject({
      runtimeRole: "explicit_opt_in_gameplay",
      maximumPixelRatio: 1.5,
      crowdInstances: 256,
      crowdInstancesMaximum: 480,
      animatedCrowdInstances: 0,
      animatedCrowdInstancesMaximum: 96,
      crowdAnimationMaximumHz: 0,
      proceduralTextureResolutionMaximum: 192,
      environmentMapSizeMaximum: 128,
      shadowCastingKeyLight: false,
      antialias: false,
    });
    expect(getQualityConfig("capture")).toMatchObject({
      runtimeRole: "offline_capture_only",
      maximumPixelRatio: 1,
      shadowMapSizeMaximum: 2048,
      crowdInstances: 480,
      crowdInstancesMaximum: 960,
      animatedCrowdInstances: 0,
      animatedCrowdInstancesMaximum: 0,
      crowdAnimationMaximumHz: 0,
      proceduralTextureResolutionMaximum: 256,
      environmentMapSizeMaximum: 256,
      postProcessingAllowed: true,
    });
    expect(Object.isFrozen(getQualityConfig("high"))).toBe(true);
  });

  it("uses balanced normally, keeps high explicit, and never makes capture interactive", () => {
    expect(resolveQualityPreset(null, "gameplay")).toBe("balanced");
    expect(resolveQualityPreset("medium", "gameplay")).toBe("balanced");
    expect(resolveQualityPreset("low", "gameplay")).toBe("balanced");
    expect(resolveQualityPreset("high", "gameplay")).toBe("high");
    expect(resolveQualityPreset("capture", "gameplay")).toBe("balanced");
    expect(resolveQualityPreset(null, "capture")).toBe("capture");
    expect(resolveQualityPreset("balanced", "capture")).toBe("balanced");
    expect(resolveQualityPreset("medium", "capture")).toBe("balanced");
    expect(resolveQualityPreset("high", "capture")).toBe("high");
  });
});
