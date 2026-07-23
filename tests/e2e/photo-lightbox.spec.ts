import { test, expect } from "@playwright/test";

/** FR-015: the photo lightbox opens, navigates next/previous, and closes via both a close control and Escape. */
test.describe("Photo lightbox", () => {
  test("opens from the gallery, navigates next/previous, and closes both ways", async ({
    page,
  }) => {
    await page.goto("/en/work/scales-photoshoot");

    const thumbnails = page.locator("main button").filter({ has: page.locator("img") });
    await thumbnails.first().click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const firstImageAlt = await dialog.locator("img").getAttribute("alt");

    await dialog.getByRole("button", { name: /next image/i }).click();
    const secondImageAlt = await dialog.locator("img").getAttribute("alt");
    expect(secondImageAlt).not.toBe(firstImageAlt);

    await dialog.getByRole("button", { name: /previous image/i }).click();
    const backToFirstAlt = await dialog.locator("img").getAttribute("alt");
    expect(backToFirstAlt).toBe(firstImageAlt);

    await dialog.getByRole("button", { name: /close/i }).click();
    await expect(dialog).not.toBeVisible();

    await thumbnails.first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
