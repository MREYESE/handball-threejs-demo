import { describe, expect, it } from "vitest";
import { STANDARD_GOALKEEPER_CONFIG } from "../../src/config/defaults";
import type { GoalkeeperConfig } from "../../src/config/types";
import { SeededRng } from "../../src/core/SeededRng";
import type { FeintAction } from "../../src/domain/gesture/model";
import {
  GoalkeeperCommitmentController,
  type GoalkeeperObservation,
} from "../../src/domain/goalkeeper/commitment";

const STEP = 1 / 60;

function observation(
  x: number,
  y: number,
  confidence = 0.2,
  elapsedGestureSeconds = 0.1,
  feint: FeintAction | null = null,
): GoalkeeperObservation {
  const length = Math.hypot(x, y);
  return Object.freeze({
    apparentDirection: Object.freeze({ x: x / length, y: y / length }),
    elapsedGestureSeconds,
    confidence,
    feint,
  });
}

function controller(
  seed = 17,
  config: GoalkeeperConfig = STANDARD_GOALKEEPER_CONFIG,
): GoalkeeperCommitmentController {
  return new GoalkeeperCommitmentController(
    config,
    new SeededRng(seed).fork("keeper"),
  );
}

function advanceToReadBoundary(
  keeper: GoalkeeperCommitmentController,
): void {
  const steps = Math.ceil(
    STANDARD_GOALKEEPER_CONFIG.minimumReadSeconds / STEP,
  );
  for (let index = 0; index < steps; index += 1) {
    keeper.advance(STEP);
  }
}

describe("pre-release goalkeeper commitment", () => {
  it("advances READY to READ and commits once from a stable meaningful cue", () => {
    const keeper = controller();
    keeper.queueGestureStart();
    keeper.advance(STEP);
    expect(keeper.diagnostics().phase).toBe("READ");

    keeper.queueObservation(observation(0.9, 0.4, 0.2, 0.05));
    keeper.queueObservation(observation(0.88, 0.42, 0.21, 0.09));
    advanceToReadBoundary(keeper);
    const committed = keeper.diagnostics();
    expect(committed.phase).toBe("COMMIT");
    expect(committed.committedDestination).toBe("high-right");
    expect(committed.commitmentTimeSeconds).not.toBeNull();
    expect(committed.seededTendency).toEqual(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    );

    keeper.queueObservation(observation(-1, 0.1, 1, 0.2));
    keeper.advance(STEP);
    expect(keeper.releaseGesture()).toBe("high-right");
    expect(keeper.diagnostics().committedDestination).toBe("high-right");
  });

  it("holds center for early release, threshold equality, ambiguity, and conflict", () => {
    const early = controller();
    early.queueGestureStart();
    early.queueObservation(observation(1, 0, 1));
    early.advance(STEP);
    expect(early.releaseGesture()).toBe("mid-center");
    expect(early.diagnostics()).toMatchObject({
      phase: "HOLD",
      committedDestination: null,
      releaseDestination: "mid-center",
    });

    const equality = controller();
    equality.queueGestureStart();
    equality.queueObservation(
      observation(
        1,
        0,
        STANDARD_GOALKEEPER_CONFIG.minimumCueConfidence,
      ),
    );
    equality.queueObservation(
      observation(
        1,
        0,
        STANDARD_GOALKEEPER_CONFIG.minimumCueConfidence,
      ),
    );
    advanceToReadBoundary(equality);
    expect(equality.diagnostics().phase).toBe("HOLD");

    const conflicting = controller();
    conflicting.queueGestureStart();
    conflicting.queueObservation(observation(1, 0));
    conflicting.queueObservation(observation(-1, 0));
    advanceToReadBoundary(conflicting);
    expect(conflicting.diagnostics()).toMatchObject({
      phase: "HOLD",
      conflictingCue: true,
      committedDestination: null,
    });
  });

  it("uses a FEINT's initial apparent direction and ignores its reversed release aim", () => {
    const feint: FeintAction = Object.freeze({
      type: "FEINT",
      apparentDirection: Object.freeze({ x: 1, y: 0 }),
      recognizedAtSeconds: 0.14,
      initialImpulseSafeFraction: 0.1,
      brakeSafeFraction: 0.05,
      secondImpulseSafeFraction: 0.17,
    });
    const keeper = controller(29);
    keeper.queueGestureStart();
    keeper.queueObservation(observation(-1, 0, 0.2, 0.14, feint));
    advanceToReadBoundary(keeper);

    expect(keeper.diagnostics()).toMatchObject({
      phase: "COMMIT",
      committedDestination: "mid-right",
      observedCue: {
        apparentDirection: { x: 1, y: 0 },
        feint: { apparentDirection: { x: 1, y: 0 } },
      },
    });
    expect(keeper.releaseGesture()).toBe("mid-right");
  });

  it("replays mirrored bounded commitments and seeded diagnostics deterministically", () => {
    const replay = (x: number) => {
      const keeper = controller(71);
      keeper.queueGestureStart();
      keeper.queueObservation(observation(x, 0.1));
      keeper.queueObservation(observation(x, 0.11));
      advanceToReadBoundary(keeper);
      return keeper.diagnostics();
    };
    const first = replay(0.94);
    const identical = replay(0.94);
    const mirrored = replay(-0.94);
    expect(identical).toEqual(first);
    expect(first.committedDestination).toBe("mid-right");
    expect(mirrored.committedDestination).toBe("mid-left");
    expect(first.seededTendency).toEqual(mirrored.seededTendency);
  });

  it("clears transient state on cancellation and reset", () => {
    const keeper = controller();
    keeper.queueGestureStart();
    keeper.queueObservation(observation(1, 0));
    keeper.advance(STEP);
    keeper.cancelGesture();
    expect(keeper.diagnostics()).toMatchObject({
      phase: "READY",
      observedCue: null,
      seededTendency: null,
      committedDestination: null,
      releaseDestination: null,
    });

    keeper.queueGestureStart();
    keeper.advance(STEP);
    keeper.reset();
    expect(keeper.diagnostics().phase).toBe("READY");
  });

  it.each([
    { minimumReadSeconds: Number.NaN },
    { maximumReadSeconds: 0.01 },
    { minimumCueConfidence: Number.POSITIVE_INFINITY },
    { minimumStableCueSamples: 0 },
    { maximumTendency: 0.5 },
  ] satisfies readonly Partial<GoalkeeperConfig>[])(
    "rejects invalid or non-finite configuration %#",
    (override) => {
      expect(
        () =>
          controller(1, {
            ...STANDARD_GOALKEEPER_CONFIG,
            ...override,
          }),
      ).toThrow(RangeError);
    },
  );
});
