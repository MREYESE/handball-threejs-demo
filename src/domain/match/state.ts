import type { MatchConfig } from "../../config/types";
import type { ShotOutcome } from "../shot/outcome";

export type MatchPhase = "READY" | "SHOT_ACTIVE" | "RESULT" | "ROUND_COMPLETE";

export interface MatchState {
  readonly phase: MatchPhase;
  readonly shotsTaken: number;
  readonly goals: number;
  readonly saves: number;
  readonly misses: number;
  readonly lastOutcome: ShotOutcome | null;
}

export function createMatchState(): MatchState {
  return Object.freeze({
    phase: "READY",
    shotsTaken: 0,
    goals: 0,
    saves: 0,
    misses: 0,
    lastOutcome: null,
  });
}

export function beginShot(state: MatchState): MatchState {
  if (state.phase !== "READY") {
    throw new Error(`Cannot begin a shot while match is '${state.phase}'.`);
  }
  return Object.freeze({ ...state, phase: "SHOT_ACTIVE", lastOutcome: null });
}

export function resolveMatchShot(
  state: MatchState,
  outcome: ShotOutcome,
  config: MatchConfig,
): MatchState {
  if (state.phase !== "SHOT_ACTIVE") {
    throw new Error(`Cannot resolve a shot while match is '${state.phase}'.`);
  }
  const shotsTaken = state.shotsTaken + 1;
  return Object.freeze({
    phase: shotsTaken >= config.shotsPerRound ? "ROUND_COMPLETE" : "RESULT",
    shotsTaken,
    goals: state.goals + (outcome === "GOAL" ? 1 : 0),
    saves: state.saves + (outcome === "SAVED" ? 1 : 0),
    misses: state.misses + (outcome === "MISS" ? 1 : 0),
    lastOutcome: outcome,
  });
}

export function prepareNextShot(state: MatchState): MatchState {
  if (state.phase !== "RESULT") {
    throw new Error(`Cannot prepare next shot while match is '${state.phase}'.`);
  }
  return Object.freeze({ ...state, phase: "READY" });
}

export function restartMatch(): MatchState {
  return createMatchState();
}
