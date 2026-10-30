import { expect, test, type Page } from "@playwright/test";
import { dispatchMouseSwipe, dispatchNativePath } from "./pointerGestures";

function collectRuntimeErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console: ${message.text()}`);
    }
  });
  return errors;
}

test("hosted Pages runtime accepts and resolves a real pointer swipe", async ({
  page,
}) => {
  const errors = collectRuntimeErrors(page);
  const response = await page.goto("./?playtest&seed=71&quality=balanced");
  expect(response?.ok()).toBe(true);
  await page.waitForFunction(() => window.__READY__ === true);
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );

  const before = await page.evaluate(() => window.__DEMO__?.snapshot());
  expect(before).toBeDefined();
  const pointerEvidence = await dispatchMouseSwipe(page);

  await page.waitForFunction(
    (acceptedBefore) =>
      window.__DEMO__?.snapshot().acceptedShots === acceptedBefore + 1,
    before!.acceptedShots,
  );
  await page.waitForFunction(
    (resolvedBefore) =>
      window.__DEMO__?.snapshot().resolvedShots === resolvedBefore + 1,
    before!.resolvedShots,
  );
  await page.waitForFunction(
    () => window.__DEMO__?.snapshot().inputEnabled === true,
  );

  const after = await page.evaluate(() => window.__DEMO__?.snapshot());
  expect(after).toBeDefined();
  expect(after!.acceptedShots).toBe(before!.acceptedShots + 1);
  expect(after!.resolvedShots).toBe(before!.resolvedShots + 1);
  expect(after!.scene.finiteTransforms).toBe(true);
  expect(pointerEvidence.pointerType).toBe("mouse");
  expect(pointerEvidence.productionRejectionReason).toBeNull();
  expect(errors).toEqual([]);
});

for (const mobile of [false, true]) {
  test(`hosted V3 ${mobile ? "mobile" : "desktop"}: FEINT holds ball and fresh shot preserves keeper state`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: mobile ? { width: 844, height: 390 } : { width: 960, height: 540 },
      hasTouch: mobile, isMobile: mobile,
    });
    const page = await context.newPage();
    const errors = collectRuntimeErrors(page);
    const failures: string[] = [];
    page.on("requestfailed", request => failures.push(request.url()));
    page.on("response", response => { if (response.status() >= 400) failures.push(response.url()); });
    try {
      await page.goto("./?playtest&seed=71&quality=balanced");
      await page.waitForFunction(() => window.__READY__ === true && window.__DEMO__?.snapshot().inputEnabled === true);
      const pointer = mobile ? "touch" : "mouse";
      await dispatchNativePath(page, pointer, [[.5,.84],[.61,.8],[.55,.79],[.4,.76]], 260);
      const held = await page.evaluate(() => window.__DEMO__!.snapshot());
      expect(held.acceptedShots).toBe(0);
      expect(held.resolvedShots).toBe(0);
      expect(held.match.shotsTaken).toBe(0);
      expect(held.completedFeints).toBe(1);
      expect(held.activeShot).toBeNull();
      expect(held.feedback.audio.requestedCues.throw).toBe(0);
      await page.waitForFunction(() => {
        const s = window.__DEMO__!.snapshot();
        return s.scene.shooterPoseName.startsWith("shooter-feint") && s.scene.ballProjection.visible;
      });
      // Capture both sides of the real input callback in the same native event.
      await page.evaluate(() => {
        const keeper: unknown[] = [];
        (window as typeof window & { __KEEPER_AT_DOWN__?: unknown[] }).__KEEPER_AT_DOWN__ = keeper;
        document.addEventListener("pointerdown", () => keeper.push(window.__DEMO__!.snapshot().goalkeeper), { capture: true, once: true });
        document.querySelector("canvas")!.addEventListener("pointerdown", () => keeper.push(window.__DEMO__!.snapshot().goalkeeper), { once: true });
      });
      await dispatchNativePath(page, pointer, [[.5,.84],[.43,.73],[.36,.62]], 180);
      await page.waitForFunction(() => window.__DEMO__!.snapshot().resolvedShots === 1);
      const after = await page.evaluate(() => window.__DEMO__!.snapshot());
      expect(after.acceptedShots).toBe(1);
      expect(after.completedFeints).toBe(1);
      expect(after.scene.finiteTransforms).toBe(true);
      expect(after.activeShot!.ball.contactHistory.filter(c => c.outcome !== null)).toHaveLength(1);
      const keeperAtDown = await page.evaluate(() => (window as typeof window & {
        __KEEPER_AT_DOWN__?: ReturnType<NonNullable<typeof window.__DEMO__>["snapshot"]>["goalkeeper"][]
      }).__KEEPER_AT_DOWN__!);
      expect(keeperAtDown).toHaveLength(2);
      expect(keeperAtDown[0]!.feintAgeSeconds).not.toBeNull();
      expect(keeperAtDown[1]).toEqual(keeperAtDown[0]);
      await page.waitForFunction(() => window.__DEMO__!.snapshot().inputEnabled === true);
      expect(errors).toEqual([]);
      expect(failures).toEqual([]);
    } finally { await context.close(); }
  });
}
