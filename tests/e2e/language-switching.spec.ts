import { test, expect } from "@playwright/test";

/**
 * SC-002/FR-020: language switching preserves the current project across
 * /uk <-> /en, and the bare "/" redirects per Accept-Language (falling back
 * to /en) — research.md §3.
 */
test.describe("Language switching", () => {
  test("switching language on a project page stays on the same project", async ({ page }) => {
    await page.goto("/en/work/the-withshaw-case");

    await page.getByTestId("language-switcher").getByRole("link", { name: "uk" }).click();

    await expect(page).toHaveURL(/\/uk\/work\/the-withshaw-case$/);

    await page.getByTestId("language-switcher").getByRole("link", { name: "en" }).click();

    await expect(page).toHaveURL(/\/en\/work\/the-withshaw-case$/);
  });

  test("bare root redirects to /uk when Accept-Language prefers Ukrainian", async ({ browser }) => {
    const context = await browser.newContext({ locale: "uk-UA" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/uk$/);
    await context.close();
  });

  test("bare root falls back to /en when Accept-Language has no uk/en overlap", async ({
    browser,
  }) => {
    const context = await browser.newContext({ locale: "fr-FR" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await context.close();
  });
});
