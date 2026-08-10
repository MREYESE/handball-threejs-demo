import { expect, test, type Page } from "@playwright/test";
import { dispatchMouseSwipe } from "./pointerGestures";

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
  const response = await page.goto("./?playtest&seed=1");
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
