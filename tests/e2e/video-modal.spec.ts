import { test, expect } from "@playwright/test";

/**
 * FR-003/FR-004/FR-014, SC-005: the showreel modal opens/closes (close
 * control and Escape key), and no request to youtube-nocookie.com fires
 * until the visitor clicks play.
 */
test.describe("Video modal", () => {
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

  test("a video project's player defers the YouTube request until clicked", async ({ page }) => {
    const youtubeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("youtube-nocookie.com")) youtubeRequests.push(request.url());
    });

    await page.goto("/en/work/the-withshaw-case");
    expect(youtubeRequests).toHaveLength(0);

    await page.getByRole("button", { name: /play video/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(youtubeRequests.length).toBeGreaterThan(0);
  });
});
