import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { isValidSignatureMock, revalidatePathMock } = vi.hoisted(() => ({
  isValidSignatureMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@sanity/webhook", () => ({
  isValidSignature: isValidSignatureMock,
  SIGNATURE_HEADER_NAME: "sanity-webhook-signature",
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

async function callRoute(body: unknown, signature: string | null) {
  const { POST } = await import("@/app/api/revalidate/route");
  const request = new NextRequest("http://localhost/api/revalidate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: signature ? { "sanity-webhook-signature": signature } : undefined,
  });
  return POST(request);
}

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    isValidSignatureMock.mockReset();
    revalidatePathMock.mockReset();
    process.env.SANITY_REVALIDATE_SECRET = "test-secret";
  });

  it("returns 401 when the signature is invalid", async () => {
    isValidSignatureMock.mockResolvedValue(false);

    const response = await callRoute({ _type: "project" }, "bad-signature");

    expect(response.status).toBe(401);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns 401 when the signature header is missing", async () => {
    const response = await callRoute({ _type: "project" }, null);

    expect(response.status).toBe(401);
  });

  it("revalidates locale + work + slug paths for a project", async () => {
    isValidSignatureMock.mockResolvedValue(true);

    const response = await callRoute(
      { _type: "project", _id: "abc123", slug: { current: "the-withshaw-case" } },
      "good-signature",
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.revalidated).toBe(true);
    expect(json.paths).toEqual(
      expect.arrayContaining([
        "/uk",
        "/en",
        "/uk/work",
        "/en/work",
        "/uk/work/the-withshaw-case",
        "/en/work/the-withshaw-case",
      ]),
    );
  });

  it("revalidates about + home paths for a profile change", async () => {
    isValidSignatureMock.mockResolvedValue(true);

    const response = await callRoute({ _type: "profile", _id: "profile" }, "good-signature");
    const json = await response.json();

    expect(json.paths).toEqual(expect.arrayContaining(["/uk/about", "/en/about", "/uk", "/en"]));
  });

  it("revalidates only home paths for a siteSettings change", async () => {
    isValidSignatureMock.mockResolvedValue(true);

    const response = await callRoute(
      { _type: "siteSettings", _id: "siteSettings" },
      "good-signature",
    );
    const json = await response.json();

    expect(json.paths.sort()).toEqual(["/en", "/uk"]);
  });

  it("responds 200 with revalidated:false for an unrecognized type", async () => {
    isValidSignatureMock.mockResolvedValue(true);

    const response = await callRoute({ _type: "somethingElse", _id: "x" }, "good-signature");
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.revalidated).toBe(false);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
