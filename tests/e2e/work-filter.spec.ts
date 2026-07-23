import { test, expect } from "@playwright/test";

/**
 * The Work page's All/Films/Photography filters always show a project count
 * and set that exactly matches each project's `type`, with zero mismatched
 * or miscategorized items.
 */
test.describe("Work filter", () => {
  test("All/Films/Photography counts match project types", async ({ page }) => {
    await page.goto("/en/work");

    const cards = page.locator('main a[href*="/work/"]');
    const allCount = await cards.count();
    expect(allCount).toBeGreaterThan(0);

    await page.getByRole("tab", { name: "Films" }).click();
    const filmsCards = page.locator('main a[href*="/work/"]');
    const filmsCount = await filmsCards.count();
    for (const type of await filmsCards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-project-type")),
    )) {
      expect(type).toBe("video");
    }

    await page.getByRole("tab", { name: "Photography" }).click();
    const photoCards = page.locator('main a[href*="/work/"]');
    const photoCount = await photoCards.count();
    for (const type of await photoCards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-project-type")),
    )) {
      expect(type).toBe("photo");
    }

    expect(filmsCount + photoCount).toBe(allCount);

    await page.getByRole("tab", { name: "All" }).click();
    await expect(page.locator('main a[href*="/work/"]')).toHaveCount(allCount);
  });
});
