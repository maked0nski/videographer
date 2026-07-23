import { test, expect } from "@playwright/test";

/**
 * The homepage showreel button opens VideoModal, and no request to
 * youtube-nocookie.com fires until clicked.
 */
test.describe("Showreel modal", () => {
  test("showreel modal defers the YouTube request until opened, then closes via control and Escape", async ({
    page,
  }) => {
    const youtubeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("youtube-nocookie.com")) youtubeRequests.push(request.url());
    });

    await page.goto("/en");
    expect(youtubeRequests).toHaveLength(0);

    await page.getByRole("button", { name: "Watch Showreel" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("iframe")).toHaveAttribute("src", /youtube-nocookie\.com/);
    expect(youtubeRequests.length).toBeGreaterThan(0);

    await dialog.getByRole("button", { name: /close/i }).click();
    await expect(dialog).not.toBeVisible();

    await page.getByRole("button", { name: "Watch Showreel" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
