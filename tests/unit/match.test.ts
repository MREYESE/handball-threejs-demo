import { describe, expect, it } from "vitest";
import { STANDARD_MATCH_CONFIG } from "../../src/config/defaults";
import {
  beginShot,
  createMatchState,
  prepareNextShot,
  resolveMatchShot,
  restartMatch,
  type MatchState,
} from "../../src/domain/match/state";
import type { ShotOutcome } from "../../src/domain/shot/outcome";

function playShot(state: MatchState, outcome: ShotOutcome): MatchState {
  return resolveMatchShot(beginShot(state), outcome, STANDARD_MATCH_CONFIG);
}

describe("five-shot match state", () => {
  it("counts exactly one bucket per accepted shot and completes shot five", () => {
    const outcomes: readonly ShotOutcome[] = [
      "GOAL",
      "SAVED",
      "MISS",
      "GOAL",
      "SAVED",
    ];
    let state = createMatchState();
    for (const [index, outcome] of outcomes.entries()) {
      state = playShot(state, outcome);
      if (index < outcomes.length - 1) {
        expect(state.phase).toBe("RESULT");
        state = prepareNextShot(state);
      }
    }

    expect(state).toEqual({
      phase: "ROUND_COMPLETE",
      shotsTaken: 5,
      goals: 2,
      saves: 2,
      misses: 1,
      lastOutcome: "SAVED",
    });
  });

  it("rejects duplicate resolution while result feedback is active", () => {
    const result = playShot(createMatchState(), "GOAL");

    expect(() =>
      resolveMatchShot(result, "MISS", STANDARD_MATCH_CONFIG),
    ).toThrow(/Cannot resolve/);
  });

  it("restart clears every counter and unlocks ready state", () => {
    const result = playShot(createMatchState(), "MISS");
    expect(result.shotsTaken).toBe(1);
    expect(restartMatch()).toEqual(createMatchState());
  });
});
