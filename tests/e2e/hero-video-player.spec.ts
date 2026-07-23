import { test, expect } from "@playwright/test";

/**
 * A video project's hero player defers the YouTube request until Play is
 * clicked, then plays inline — no dialog, the iframe appears directly on the
 * page.
 */
test.describe("Hero video player", () => {
  test("a video project's player defers the YouTube request until clicked, then plays inline with no dialog", async ({
    page,
  }) => {
    const youtubeRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("youtube-nocookie.com")) youtubeRequests.push(request.url());
    });

    await page.goto("/en/work/first-glimpse");
    expect(youtubeRequests).toHaveLength(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("button", { name: /play video/i }).click();

    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toBeVisible();
    expect(youtubeRequests.length).toBeGreaterThan(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});
