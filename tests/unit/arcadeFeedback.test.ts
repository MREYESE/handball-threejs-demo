import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { SynthAudio } from "../../src/audio/SynthAudio";
import { getQualityConfig } from "../../src/core/Quality";
import {
  ARCADE_FX_LIMITS,
  ARCADE_RIBBON_STYLE,
  ArcadeEffects,
  OUTCOME_COLOR_LANGUAGE,
} from "../../src/presentation/fx/ArcadeEffects";

describe("bounded arcade effects", () => {
  it("keeps the sampled ball ribbon narrow, tapered, and translucent", () => {
    expect(ARCADE_RIBBON_STYLE).toEqual({
      tailHalfWidthMeters: 0.006,
      headHalfWidthMeters: 0.038,
      opacity: 0.56,
    });
    expect(ARCADE_RIBBON_STYLE.headHalfWidthMeters).toBeLessThan(0.04);
    expect(ARCADE_RIBBON_STYLE.tailHalfWidthMeters).toBeLessThan(
      ARCADE_RIBBON_STYLE.headHalfWidthMeters,
    );
    expect(ARCADE_RIBBON_STYLE.opacity).toBeLessThan(0.6);
  });

  it("uses preset-bounded ribbon, speed-line, and particle pools", () => {
    expect(ARCADE_FX_LIMITS).toEqual({
      balanced: {
        ribbonPoints: 18,
        speedLines: 6,
        particles: 24,
      },
      high: {
        ribbonPoints: 24,
        speedLines: 10,
        particles: 36,
      },
      capture: {
        ribbonPoints: 28,
        speedLines: 12,
        particles: 48,
      },
    });
    expect(ARCADE_FX_LIMITS.balanced.ribbonPoints).toBeLessThan(
      ARCADE_FX_LIMITS.capture.ribbonPoints,
    );
    expect(ARCADE_FX_LIMITS.balanced.speedLines).toBeLessThan(
      ARCADE_FX_LIMITS.capture.speedLines,
    );
    expect(ARCADE_FX_LIMITS.balanced.particles).toBeLessThan(
      ARCADE_FX_LIMITS.capture.particles,
    );
  });

  it("starts release energy on the shot event and outcome energy only after resolution", () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(-2.75, 2.3, -3.15);
    const effects = new ArcadeEffects(
      getQualityConfig("balanced"),
      camera,
    );
    expect(effects.root.visible).toBe(true);
    expect(effects.root.children).toHaveLength(3);
    expect(
      effects.root.children.map((child) => child.type),
    ).toEqual(["Mesh", "LineSegments", "LineSegments"]);
    effects.resetVisuals();
    expect(effects.root.visible).toBe(false);

    effects.beginShot({ x: 0, y: 1, z: 0 }, 0.86, 1);
    expect(effects.root.visible).toBe(true);
    effects.update({
      ballPosition: { x: 0.1, y: 1.35, z: 1.1 },
      shotProgress: 0.16,
      resultProgress: 0,
      simulationSeconds: 1.05,
    });
    expect(effects.diagnostics()).toMatchObject({
      phase: "FLIGHT",
      activeRibbonPoints: 2,
      activeSpeedLines: 6,
      activeParticles: 24,
      releaseBursts: 1,
      impactBursts: 0,
      outcomeBursts: { GOAL: 0, SAVED: 0, MISS: 0 },
      currentOutcome: null,
      currentOutcomeColor: null,
      resultEffectsStartedAfterOutcome: true,
    });

    effects.resolveOutcome("GOAL", { x: 0.6, y: 1.5, z: 7 }, 1.4);
    effects.update({
      ballPosition: { x: 0.6, y: 1.5, z: 7 },
      shotProgress: 1,
      resultProgress: 0.1,
      simulationSeconds: 1.42,
    });
    expect(effects.diagnostics()).toMatchObject({
      phase: "RESULT",
      activeSpeedLines: 0,
      activeParticles: 24,
      releaseBursts: 1,
      impactBursts: 1,
      outcomeBursts: { GOAL: 1, SAVED: 0, MISS: 0 },
      currentOutcome: "GOAL",
      currentOutcomeColor: OUTCOME_COLOR_LANGUAGE.GOAL.colorHex,
      resultEffectsStartedAfterOutcome: true,
    });

    effects.resolveOutcome("SAVED", { x: 0, y: 1, z: 7 }, 1.43);
    expect(effects.diagnostics().impactBursts).toBe(1);
    effects.resetVisuals();
    expect(effects.root.visible).toBe(false);
    expect(effects.diagnostics()).toMatchObject({
      phase: "READY",
      activeRibbonPoints: 0,
      activeSpeedLines: 0,
      activeParticles: 0,
      releaseBursts: 1,
      impactBursts: 1,
    });
    effects.dispose();
  });

  it("keeps the readable ribbon but suppresses shake, particles, and speed lines in reduced motion", () => {
    const camera = new THREE.PerspectiveCamera();
    camera.position.set(-2.75, 2.3, -3.15);
    const effects = new ArcadeEffects(getQualityConfig("high"), camera);
    effects.setReducedMotion(true);
    effects.beginShot({ x: 0, y: 1, z: 0 }, 1, 2);
    effects.update({
      ballPosition: { x: 0.2, y: 1.5, z: 1.4 },
      shotProgress: 0.2,
      resultProgress: 0,
      simulationSeconds: 2.05,
    });

    expect(effects.diagnostics()).toMatchObject({
      reducedMotion: true,
      activeRibbonPoints: 2,
      activeSpeedLines: 0,
      activeParticles: 0,
      cameraImpulsePixels: { x: 0, y: 0 },
    });
    effects.dispose();
  });
});

describe("synthesized event audio", () => {
  it("records throw, flight, all outcomes, crowd, ambience-capable UI, and mute state without media assets", () => {
    const audio = new SynthAudio({
      enabled: true,
      outputEnabled: false,
    });

    audio.shotReleased(0.86, 0.42);
    expect(audio.diagnostics()).toMatchObject({
      enabled: true,
      outputEnabled: false,
      state: "capture-muted",
      contextState: "not-created",
      requestedCues: {
        ambience: 0,
        crowd: 0,
        throw: 1,
        flight: 1,
        goal: 0,
        save: 0,
        miss: 0,
        ui: 0,
      },
      scheduledCues: {
        ambience: 0,
        crowd: 0,
        throw: 0,
        flight: 0,
        goal: 0,
        save: 0,
        miss: 0,
        ui: 0,
      },
      synthesizedOnly: true,
    });

    audio.outcome("GOAL");
    audio.outcome("SAVED");
    audio.outcome("MISS");
    expect(audio.diagnostics().requestedCues).toEqual({
      ambience: 0,
      crowd: 3,
      throw: 1,
      flight: 1,
      goal: 1,
      save: 1,
      miss: 1,
      ui: 3,
    });

    audio.setEnabled(false);
    audio.shotReleased(1, 0.35);
    expect(audio.diagnostics().requestedCues.throw).toBe(1);
    expect(audio.diagnostics().state).toBe("capture-muted");
    audio.dispose();
    expect(audio.diagnostics().state).toBe("disposed");
  });
});
