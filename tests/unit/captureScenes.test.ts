import { describe, expect, it } from "vitest";
import {
  CAPTURE_SCENES,
  captureSceneDefinition,
} from "../../src/dev/CaptureScenes";

describe("deterministic capture scene catalog", () => {
  it("publishes the required real-application capture scenes once", () => {
    const names = CAPTURE_SCENES.map((scene) => scene.name);

    expect(names).toEqual([
      "hero-ready",
      "hero-release",
      "hero-ball-flight",
      "hero-promo",
      "hero-goal",
      "hero-save-high",
      "hero-miss",
      "mobile-ready",
      "round-complete",
    ]);
    expect(new Set(names).size).toBe(names.length);
  });

  it("locks the primary flight scene to a known viewport, seed, quality, and shot frame", () => {
    expect(captureSceneDefinition("hero-ball-flight")).toEqual({
      name: "hero-ball-flight",
      viewport: { width: 1920, height: 1080 },
      quality: "balanced",
      seed: 1,
      requirement: "ACTIVE_SHOT",
      targetShotFrame: 12,
      expectedOutcome: null,
      expectedKeeperZone: null,
    });
    expect(captureSceneDefinition("hero-promo")).toEqual({
      name: "hero-promo",
      viewport: { width: 1920, height: 1080 },
      quality: "capture",
      seed: 1,
      requirement: "ACTIVE_SHOT",
      targetShotFrame: 12,
      expectedOutcome: null,
      expectedKeeperZone: null,
    });
  });

  it("locks character-focused release and high-save scenes to real shot state", () => {
    expect(captureSceneDefinition("hero-release")).toMatchObject({
      seed: 1,
      requirement: "ACTIVE_SHOT",
      targetShotFrame: 8,
    });
    expect(captureSceneDefinition("hero-save-high")).toEqual({
      name: "hero-save-high",
      viewport: { width: 1920, height: 1080 },
      quality: "balanced",
      seed: 3,
      requirement: "RESULT",
      targetShotFrame: null,
      expectedOutcome: "SAVED",
      expectedKeeperZone: "high-center",
    });
  });

  it("keeps mobile landscape framing explicit", () => {
    expect(captureSceneDefinition("mobile-ready")).toMatchObject({
      viewport: { width: 844, height: 390 },
      quality: "balanced",
      requirement: "READY",
    });
  });
});
