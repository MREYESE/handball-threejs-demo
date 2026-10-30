import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { dispatchNativePath } from "./pointerGestures";
import { replayGestureSession } from "../../src/dev/GestureTrace";

const shots = [
  { name: "DIRECT", category: "DIRECT", path: [[.5,.84],[.43,.73],[.36,.62]], spin: 0 },
  { name: "LOB", category: "LOB", path: [[.5,.85],[.55,.45],[.6,.62]], spin: 0 },
  { name: "BOUNCE", category: "BOUNCE", path: [[.5,.62],[.47,.84],[.4,.48]], spin: 0 },
  { name: "ROSCA_LEFT", category: "DIRECT", path: [[.5,.85],[.5,.77],[.4,.7],[.5,.62]], spin: -1 },
  { name: "ROSCA_RIGHT", category: "DIRECT", path: [[.5,.85],[.5,.77],[.6,.7],[.5,.62]], spin: 1 },
] as const;
const fake = [[.5,.84],[.61,.8],[.55,.79],[.4,.76]] as const;

for (const pointer of ["mouse","touch"] as const) for (const viewport of [
  { width:960,height:540 }, { width:1440,height:900 }, { width:1920,height:1080 },
]) {
  test(`v3 ${pointer} ${viewport.width}: five separate fakes and all five shots preserve physical match loop`, async ({ browser }) => {
    test.setTimeout(180_000);
    const context=await browser.newContext({ viewport, hasTouch:pointer==="touch", isMobile:pointer==="touch" });
    const page=await context.newPage();
    const errors:string[]=[]; page.on("pageerror",e=>errors.push(e.message));
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
    try {
      await page.goto("/?playtest&trace&seed=71&quality=balanced");
      await page.waitForFunction(()=>window.__READY__===true);
      // Capture production state immediately after each adapter callback.
      await page.evaluate(()=>{
        const states: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>[]=[];
        (window as typeof window & { __V3_UP__: typeof states }).__V3_UP__=states;
        document.querySelector("canvas")!.addEventListener("pointerup",()=>states.push(window.__DEMO__!.snapshot()));
      });
      const snapshotAtUp=()=>page.evaluate(()=>(window as typeof window & { __V3_UP__: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>[] }).__V3_UP__.at(-1)!);
      const evidence=[];
      for(const [i,shot] of shots.entries()) {
        const fakePointer=await dispatchNativePath(page,pointer,fake,260);
        const held=await snapshotAtUp();
        expect(held.acceptedShots).toBe(i); expect(held.resolvedShots).toBe(i);
        expect(held.match.shotsTaken).toBe(i); expect(held.activeShot).toBeNull();
        expect(held.inputEnabled).toBe(true); expect(held.completedFeints).toBe(i+1);
        expect(held.outcomes).toHaveLength(i); expect(held.lastGestureRejectionReason).toBeNull();
        expect(held.feedback.audio.requestedCues.throw).toBe(i);
        const ballHeld=held.scene.ballWorldPosition, hand=held.scene.shooterHandWorldPosition;
        expect(Math.hypot(ballHeld.x-hand.x,ballHeld.y-hand.y,ballHeld.z-hand.z)).toBeLessThan(0.001);
        const cues=held.feedback.audio.requestedCues;
        expect(cues.goal+cues.save+cues.miss).toBe(i);
        await page.waitForFunction(()=>{
          const s=window.__DEMO__!.snapshot();
          return s.scene.shooterPoseName.startsWith("shooter-feint") && s.scene.ballProjection.visible;
        });
        const pointerEvidence=await dispatchNativePath(page,pointer,shot.path,i%2===0?180:340);
        const released=await snapshotAtUp();
        expect(released.acceptedShots).toBe(i+1); expect(released.resolvedShots).toBe(i);
        expect(released.activeShot!.category).toBe(shot.category);
        expect(released.activeShot!.feint).toBeNull();
        expect(released.activeShot!.ball.contactHistory).toEqual([]);
        expect(released.activeShot!.ball.terminalState).toBeNull();
        expect(released.feedback.audio.requestedCues.throw).toBe(i+1);
        if(shot.spin!==0) expect(Math.sign(released.activeShot!.ball.releaseSideSpin)).toBe(shot.spin);
        await page.waitForFunction(n=>window.__DEMO__!.snapshot().resolvedShots===n,i+1);
        const terminal=await page.evaluate(()=>window.__DEMO__!.snapshot());
        const contacts=terminal.activeShot!.ball.contactHistory;
        expect(contacts.filter(c=>c.outcome!==null)).toHaveLength(1);
        if(terminal.outcomes.at(-1)==="SAVED") expect(contacts.some(c=>c.kind==="KEEPER")).toBe(true);
        if(shot.name==="BOUNCE") expect(contacts.some(c=>c.kind==="GROUND"&&c.position.z<7)).toBe(true);
        expect(terminal.scene.finiteTransforms).toBe(true);
        await page.waitForFunction(()=>{
          const s=window.__DEMO__!.snapshot(); return s.activeShot===null && (s.inputEnabled||s.match.phase==="ROUND_COMPLETE");
        });
        evidence.push({ name:shot.name,fakePointer,held,pointerEvidence,released,terminal });
      }
      const final=await page.evaluate(()=>window.__DEMO__!.snapshot());
      expect(final.match.phase).toBe("ROUND_COMPLETE"); expect(final.match.shotsTaken).toBe(5);
      const trace=await page.evaluate(()=>window.__DEMO__!.exportGestureTrace());
      const replay=replayGestureSession(trace!);
      expect(replayGestureSession(trace!)).toEqual(replay);
      expect(replay.actions.map(a=>a.action)).toEqual(Array.from({length:5},()=>["FEINT","SHOT"]).flat());
      expect(replay.shots).toHaveLength(5);
      expect(replay.keeperSteps).toEqual(trace!.attempts.flatMap(a=>a.events.filter(e=>e.type==="KEEPER_STEP")
        .map(e=>({simulationSeconds:e.simulationSeconds,keeper:e.keeper}))));
      for(const [i,s] of replay.shots.entries()) {
        expect(s.ball.contactHistory).toEqual(evidence[i]!.terminal.activeShot!.ball.contactHistory);
        expect(s.steps).toEqual(trace!.attempts.filter(a=>a.action==="SHOT")[i]!.events.filter(e=>e.type==="FLIGHT_STEP").map(e=>e.keeper));
        expect(s.ball.terminalState).toBe(final.outcomes[i]);
      }
      await page.screenshot({path:test.info().outputPath("round.png")});
      const path=test.info().outputPath("native-actions-and-replay.json");
      await writeFile(path,JSON.stringify({pointer,viewport,evidence,trace,replay},null,2));
      await test.info().attach("native-v3",{path,contentType:"application/json"});
      await page.evaluate(()=>window.__DEMO__!.restart());
      const reset=await page.evaluate(()=>window.__DEMO__!.snapshot());
      expect(reset.acceptedShots).toBe(0); expect(reset.completedFeints).toBe(0);
      expect(reset.goalkeeper.phase).toBe("READY"); expect(reset.inputEnabled).toBe(true);
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test("v3 portrait touch: closed fake alone expires and a fresh ordinary shot remains available", async ({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const page=await context.newPage();
  try {
    await page.goto("/?playtest&trace&seed=19&quality=balanced");
    await page.waitForFunction(()=>window.__READY__===true);
    await dispatchNativePath(page,"touch",[[.5,.84],[.68,.8],[.6,.79],[.5,.84]],320);
    expect((await page.evaluate(()=>window.__DEMO__!.snapshot())).acceptedShots).toBe(0);
    await page.waitForFunction(()=>window.__DEMO__!.snapshot().goalkeeper.phase==="READY");
    const trace=await page.evaluate(()=>window.__DEMO__!.exportGestureTrace());
    expect(replayGestureSession(trace!).shots).toHaveLength(0);
    expect(trace!.attempts[0]!.action).toBe("FEINT");
    await dispatchNativePath(page,"touch",[[.5,.84],[.5,.7],[.5,.6]]);
    await page.waitForFunction(()=>window.__DEMO__!.snapshot().resolvedShots===1);
    expect((await page.evaluate(()=>window.__DEMO__!.snapshot())).acceptedShots).toBe(1);
  } finally {await context.close();}
});
