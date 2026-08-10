import type { GoalConfig, GoalkeeperConfig } from "../../config/types";
import { distance3, type Vec3 } from "../math";
import { isInsideValidGoalTarget } from "./target";

export type ShotOutcome = "GOAL" | "SAVED" | "MISS";

export function resolveShotOutcome(
  target: Vec3,
  goalkeeperPositionAtArrival: Vec3,
  goalConfig: GoalConfig,
  goalkeeperConfig: GoalkeeperConfig,
): ShotOutcome {
  if (
    distance3(target, goalkeeperPositionAtArrival) <=
    goalkeeperConfig.saveRadiusMeters
  ) {
    return "SAVED";
  }
  return isInsideValidGoalTarget(target, goalConfig) ? "GOAL" : "MISS";
}
