import { test, expect } from "@playwright/test";

/**
 * No page has horizontal overflow or broken navigation, on mobile and
 * desktop viewports (this file runs under both the `desktop-chromium` and
 * `mobile-chromium` Playwright projects — see playwright.config.ts), for
 * every page and both locales.
 */
const PAGES = ["/", "/work", "/work/the-withshaw-case", "/work/scales-photoshoot", "/about"];
const LOCALES = ["en", "uk"] as const;

for (const locale of LOCALES) {
  for (const path of PAGES) {
    test(`no horizontal overflow at /${locale}${path}`, async ({ page }) => {
      await page.goto(`/${locale}${path}`);

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(hasOverflow).toBe(false);

      await expect(page.getByRole("banner").getByRole("link").first()).toBeVisible();
    });
  }
}
