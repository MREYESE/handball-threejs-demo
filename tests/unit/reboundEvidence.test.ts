import { describe, expect, it } from "vitest";
import { verifyHighReboundArc } from "../e2e/reboundEvidence";
import { STANDARD_RELEASE_POSITION, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG,
  STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG } from "../../src/config/defaults";
import { createBaselineBallFlight, advanceBallFlight } from "../../src/domain/shot/ballFlight";
import { mapAimToGoalTarget } from "../../src/domain/shot/target";
import { goalkeeperPositionDuringShot } from "../../src/domain/goalkeeper/zones";

describe("physical high-rebound evidence", () => {
  const contact = { elapsedSeconds: 0.3, position: { y: 1.58 }, outgoingVelocity: { y: 5.8 } };
  const gravity = -9.81;
  const samples = Array.from({ length: 14 }, (_, i) => {
    const dt = i * 0.1;
    return { time: contact.elapsedSeconds + dt,
      height: contact.position.y + contact.outgoingVelocity.y * dt + gravity * dt * dt / 2 };
  });
  it("verifies a real high arc below four metres from velocity and gravity", () => {
    const result = verifyHighReboundArc(contact, gravity, samples, 2.094, samples.at(-1)!.time);
    expect(result.predictedApex).toBeLessThan(4);
    expect(result.observedPeak).toBeGreaterThan(3);
    expect(result.predictedApex - result.observedPeak).toBeLessThanOrEqual(result.maximumSamplingLoss);
  });
  it("rejects frozen height, fabricated peaks, wrong velocity and missing apex coverage", () => {
    for (const invalid of [samples.map(s => ({ ...s, height: 4.1 })),
      samples.map((s, i) => i === 6 ? { ...s, height: 4.5 } : s), samples.slice(0, 3)]) {
      expect(() => verifyHighReboundArc(contact, gravity, invalid, 2.094, samples.at(-1)!.time)).toThrow();
    }
    expect(() => verifyHighReboundArc({ ...contact, outgoingVelocity: { y: 4 } }, gravity, samples, 2.094, samples.at(-1)!.time)).toThrow();
    expect(() => verifyHighReboundArc(contact, 0, samples, 2.094, samples.at(-1)!.time)).toThrow();
  });
  it.each([0.73, 0.76, 0.9])("checks the emergent high-center save at release power %s", power => {
    const ball = createBaselineBallFlight(STANDARD_RELEASE_POSITION,
      mapAimToGoalTarget(0, 0.72, STANDARD_GOAL_CONFIG), power,
      STANDARD_TRAJECTORY_CONFIG, STANDARD_BALL_FLIGHT_CONFIG);
    const observed: { time: number; height: number }[] = [];
    for (let step = 0; step < 180 && ball.terminalState === null; step++) {
      advanceBallFlight(ball, 1 / 60, STANDARD_GOAL_CONFIG, STANDARD_GOALKEEPER_CONFIG, {
        previousPosition: goalkeeperPositionDuringShot("high-center", STANDARD_GOAL_CONFIG.center,
          STANDARD_GOALKEEPER_CONFIG, ball.elapsedSeconds),
        currentPosition: goalkeeperPositionDuringShot("high-center", STANDARD_GOAL_CONFIG.center,
          STANDARD_GOALKEEPER_CONFIG, ball.elapsedSeconds + 1 / 60),
      });
      if (ball.contactHistory.length > 0) observed.push({ time: ball.elapsedSeconds, height: ball.position.y });
    }
    expect(ball.contactHistory.map(c => c.kind)).toEqual(["KEEPER", power === 0.73 ? "GROUND" : "PLAY_VOLUME"]);
    expect(ball.terminalState).toBe("SAVED");
    const arc = verifyHighReboundArc(ball.contactHistory[0]!, ball.gravityMetersPerSecondSquared, observed, 2.094, ball.elapsedSeconds);
    if (power === 0.73) expect(arc.predictedApex).toBeLessThan(4);
    else expect(arc.predictedApex).toBeGreaterThan(4);
  });
});
