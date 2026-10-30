import { describe, expect, it } from "vitest";
import * as C from "../../src/config/defaults";
import { analyzeStandardGesture } from "../../src/domain/gesture/features";
import { recognizeFeintPrefix } from "../../src/domain/gesture/feint";
import { GoalkeeperCommitmentController } from "../../src/domain/goalkeeper/commitment";
import { SeededRng } from "../../src/core/SeededRng";
import { goalkeeperPositionDuringShot } from "../../src/domain/goalkeeper/zones";
import { createBaselineBallFlight, advanceBallFlight } from "../../src/domain/shot/ballFlight";
import { mapAimToGoalTarget } from "../../src/domain/shot/target";
import { shooterPoseAt } from "../../src/presentation/characters/CharacterAnimation";

const paths = {
  DIRECT: [[.5,.84],[.5,.7],[.5,.6]],
  LOB: [[.5,.85],[.5,.45],[.5,.62]],
  BOUNCE: [[.5,.62],[.5,.84],[.5,.48]],
  ROSCA_LEFT: [[.5,.85],[.5,.77],[.4,.7],[.5,.62]],
  ROSCA_RIGHT: [[.5,.85],[.5,.77],[.6,.7],[.5,.62]],
  FEINT: [[.5,.84],[.61,.8],[.55,.79],[.4,.76]],
} satisfies Record<string, number[][]>;
function points(path: number[][], density = 1, duration = .3, aim = 0, noise = 0) {
  const dense = path.flatMap((p, i) => i === 0 ? [p] : Array.from({ length: density }, (_, j) =>
    [path[i-1]![0]! + (p[0]! - path[i-1]![0]!) * (j+1)/density,
     path[i-1]![1]! + (p[1]! - path[i-1]![1]!) * (j+1)/density]));
  return dense.map((p,i) => {
    const progress = i/(dense.length-1);
    const x = p[0]! + aim*progress + (i>0 && i<dense.length-1 ? Math.sin(i*2)*noise : 0);
    const y = p[1]! + (i>0 && i<dense.length-1 ? Math.sin(i)*noise : 0);
    return { safeAreaPosition01: { x,y }, positionPixels: { x:x*960,y:y*540 }, timeSeconds: progress*duration };
  });
}
const analyze = (path: number[][], density=1, duration=.3, aim=0, noise=0) =>
  analyzeStandardGesture(points(path,density,duration,aim,noise), { widthPixels:960,heightPixels:540 }, C.STANDARD_GESTURE_CONFIG);
const keeper = () => new GoalkeeperCommitmentController(C.STANDARD_GOALKEEPER_CONFIG, new SeededRng(71).fork("keeper"));
function stageFake(k: ReturnType<typeof keeper>) {
  k.queueGestureStart();
  for (let i=0;i<2;i++) k.queueObservation({ apparentDirection:{x:1,y:0}, elapsedGestureSeconds:.06*(i+1), confidence:.15, feint:null });
  for(let i=0;i<6;i++) k.advance(1/60);
  expect(k.currentPhase).toBe("COMMIT");
  k.completeFeint();
}

describe("v3 conservative geometry and continuous physical mapping", () => {
  it.each(["DIRECT","LOB","BOUNCE","ROSCA_LEFT","ROSCA_RIGHT"] as const)("recognizes %s across density, aim and noise", name => {
    for (const density of [1,4,12]) for (const aim of [-.12,0,.12]) {
      const g=analyze(paths[name],density,.3,aim,.0004);
      expect(g.category).toBe(name === "LOB" || name === "BOUNCE" ? name : "DIRECT");
      expect(recognizeFeintPrefix(points(paths[name],density,.3,aim,.0004),C.STANDARD_GESTURE_CONFIG)).toBeNull();
      expect(g.aim.horizontalAim).toBeCloseTo(aim/.22,8);
      if(name.startsWith("ROSCA")) expect(Math.sign(g.sideSpin)).toBe(name==="ROSCA_LEFT"?-1:1);
      if(name==="BOUNCE") { expect(g.loft).toBe(0); expect(g.topSpin).toBeLessThanOrEqual(.25); }
    }
  });
  it.each([
    [[.5,.84],[.53,.72],[.56,.6]], // diagonal
    [[.5,.84],[.5,.82],[.5,.78]], // low direct
    [[.5,.84],[.501,.75],[.499,.7],[.5,.6]],
    [[.5,.84],[.5,.72],[.5,.76]], // partial hook
    [[.5,.62],[.5,.65],[.5,.48]], // partial V
    [[.5,.62],[.5,.48],[.5,.84]], // reversed V, net down
  ])("keeps negative control %j DIRECT", (...path) => {
    expect(analyze(path as number[][]).category).toBe("DIRECT");
  });
  it("recognizes small and large hooks, independent of final downward tangent speed", () => {
    for(const path of [[[.5,.85],[.5,.62],[.5,.68]],paths.LOB]) {
      const slow=analyze(path,4,.7),fast=analyze(path,4,.14);
      expect(slow.category).toBe("LOB"); expect(fast.category).toBe("LOB");
      expect(fast.power).toBeGreaterThan(slow.power);
      const launch=(g:typeof fast)=>createBaselineBallFlight(C.STANDARD_RELEASE_POSITION,mapAimToGoalTarget(g.aim.horizontalAim,g.aim.verticalAim,C.STANDARD_GOAL_CONFIG),g.power,C.STANDARD_TRAJECTORY_CONFIG,C.STANDARD_BALL_FLIGHT_CONFIG,g.loft);
      expect(launch(slow).initialVelocity.y).toBeGreaterThan(0);
      expect(launch(fast).initialVelocity.y).toBeGreaterThan(0);
    }
  });
  it("V produces a real floor contact before goal with finite bounded rebound", () => {
    const g=analyze(paths.BOUNCE,4,.22,.12);
    const ball=createBaselineBallFlight(C.STANDARD_RELEASE_POSITION,mapAimToGoalTarget(g.aim.horizontalAim,g.aim.verticalAim,C.STANDARD_GOAL_CONFIG),g.power,C.STANDARD_TRAJECTORY_CONFIG,C.STANDARD_BALL_FLIGHT_CONFIG,g.loft,g.sideSpin,g.topSpin,g.bounceIntent);
    const distant={x:100,y:100,z:7};
    for(let i=0;i<600&&ball.terminalState===null;i++) advanceBallFlight(ball,1/60,C.STANDARD_GOAL_CONFIG,C.STANDARD_GOALKEEPER_CONFIG,{previousPosition:distant,currentPosition:distant});
    const ground=ball.contactHistory.find(c=>c.kind==="GROUND")!;
    expect(ground).toBeDefined(); expect(ground.position.z).toBeLessThan(7);
    expect(ground.incomingVelocity!.y).toBeLessThan(0);
    expect(ground.outgoingVelocity!.y).toBeGreaterThan(0);
    expect(ground.outgoingVelocity!.y).toBeLessThan(-ground.incomingVelocity!.y);
    expect(ball.contactHistory.filter(c=>c.outcome!==null)).toHaveLength(1);
  });
});

describe("independent fake and keeper lifecycle", () => {
  it("retains actual commitment and bounded movement across a new pointerdown; repeated fakes cannot extend expiry", () => {
    const k=keeper(); stageFake(k);
    for(let i=0;i<12;i++) k.advance(1/60);
    const before=k.diagnostics(); const position=k.preReleasePosition(C.STANDARD_GOAL_CONFIG.center);
    expect(position.x).toBeGreaterThan(0);
    k.queueGestureStart(); k.completeFeint();
    expect(k.diagnostics()).toEqual(before);
    expect(k.preReleasePosition(C.STANDARD_GOAL_CONFIG.center)).toEqual(position);
    const zone=k.releaseGesture();
    expect(zone).toBe(before.committedDestination);
    expect(goalkeeperPositionDuringShot(zone,C.STANDARD_GOAL_CONFIG.center,C.STANDARD_GOALKEEPER_CONFIG,0,position)).toEqual(position);
  });
  it("recovers without a shot and cancellation of a new gesture preserves previous fake recovery", () => {
    const run=()=>{
      const k=keeper(); stageFake(k); k.queueGestureStart(); k.cancelGesture();
      const history=[]; let previous=k.preReleasePosition(C.STANDARD_GOAL_CONFIG.center);
      for(let i=0;i<100;i++) {
        k.advance(1/60); const current=k.preReleasePosition(C.STANDARD_GOAL_CONFIG.center);
        expect(Math.hypot(current.x-previous.x,current.y-previous.y)).toBeLessThanOrEqual(C.STANDARD_GOALKEEPER_CONFIG.feintMaximumSpeedMetersPerSecond/60+1e-10);
        history.push(k.diagnostics()); previous=current;
      }
      expect(history.some(h=>h.phase==="RECOVER")).toBe(true); expect(k.currentPhase).toBe("READY");
      expect(previous).toEqual(C.STANDARD_GOAL_CONFIG.center); return history;
    };
    expect(run()).toEqual(run());
  });
  it("reset clears fake and position, and FEINT pose never releases", () => {
    const k=keeper(); stageFake(k); k.advance(.1); k.reset();
    expect(k.diagnostics().feintAgeSeconds).toBeNull(); expect(k.currentPhase).toBe("READY");
    for(const direction of [-1,1]) {
      const fake=shooterPoseAt("FEINT",0,0,.2,direction,1);
      expect(fake.stage).toBe("FEINT"); expect(fake.releaseAmount).toBe(0);
      expect(fake.pose.rightHand.y).toBeGreaterThan(shooterPoseAt("READY",0,0,.2).pose.rightHand.y);
    }
  });
});

it.each(["DIRECT","LOB","BOUNCE","ROSCA_LEFT","ROSCA_RIGHT"] as const)("%s power and flight are sampling invariant for equivalent timed geometry", name=>{
  const sparse=analyze(paths[name],1,.42), dense=analyze(paths[name],12,.42);
  expect(dense.power).toBeCloseTo(sparse.power,12);
  expect(dense.loft).toBeCloseTo(sparse.loft,12);
  expect(dense.sideSpin).toBeCloseTo(sparse.sideSpin,12);
  expect(dense.topSpin).toBeCloseTo(sparse.topSpin,12);
  expect(dense.bounceIntent).toBeCloseTo(sparse.bounceIntent,12);
});

it("an early pointerup with batched real cues can still provoke a finite delayed keeper read",()=>{
  const k=keeper(); k.queueGestureStart();
  k.queueObservation({apparentDirection:{x:-1,y:0},elapsedGestureSeconds:.08,confidence:.2,feint:null});
  k.queueObservation({apparentDirection:{x:-1,y:0},elapsedGestureSeconds:.14,confidence:.2,feint:null});
  k.completeFeint();
  for(let i=0;i<6;i++)k.advance(1/60);
  expect(k.currentPhase).toBe("COMMIT"); expect(k.currentDestination).toBe("mid-left");
});

it("completed repeated fakes expire to READY rather than leaving a phantom active gesture",()=>{
  const k=keeper();stageFake(k);
  for(let i=0;i<20;i++){k.advance(1/60);k.queueGestureStart();k.completeFeint();}
  expect(k.diagnostics().feintAgeSeconds).toBeCloseTo(20/60,12);
  for(let i=0;i<100;i++)k.advance(1/60);
  expect(k.currentPhase).toBe("READY");expect(k.diagnostics().positionOffset).toEqual({x:0,y:0});
});

it("a simple monotone-up lateral bow remains shooting ambiguity, never a two-leg fake",async()=>{
  const {recognizeFeintAction}=await import("../../src/domain/gesture/feint");
  for(const direction of [-1,1])for(const width of [.1,.15,.22])for(const density of [1,4,12]) {
    const trace=points([[.5,.84],[.5+direction*width,.77],[.5,.7]],density,.3);
    expect(recognizeFeintAction(trace,C.STANDARD_GESTURE_CONFIG)).toBeNull();
  }
});
