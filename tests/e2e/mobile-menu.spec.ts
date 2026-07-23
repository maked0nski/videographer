import { test, expect } from "@playwright/test";

/**
 * The mobile nav toggle only renders below the `md` breakpoint, so these
 * assertions only apply to the `mobile-chromium` Playwright project.
 */
test.describe("Mobile nav menu", () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(!isMobile, "mobile menu toggle only renders on mobile viewports");
  });

  test("opens as a dropdown card with a dialog role and both nav links", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByTestId("mobile-menu-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const dialog = page.getByRole("dialog", { name: "Menu" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link")).toHaveCount(2);
  });

  test("closes via the header toggle, the scrim, and Escape", async ({ page }) => {
    await page.goto("/en");
    const toggle = page.getByTestId("mobile-menu-toggle");

    await toggle.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await toggle.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    // Click near the bottom-left of the viewport — definitely below both
    // the header (z-40, ~80px tall) and the short two-link card, so this
    // point can only be the scrim (anything nearer the top risks landing
    // on the header, which paints above the scrim).
    const viewport = page.viewportSize();
    await page
      .getByTestId("menu-scrim")
      .click({ position: { x: 5, y: (viewport?.height ?? 800) - 20 } });
    await expect(page.getByRole("dialog")).not.toBeVisible();

    await toggle.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking a nav link navigates and closes the menu", async ({ page }) => {
    await page.goto("/en");
    await page.getByTestId("mobile-menu-toggle").click();

    const dialog = page.getByRole("dialog");
    const firstLink = dialog.getByRole("link").first();
    const href = await firstLink.getAttribute("href");
    await firstLink.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
