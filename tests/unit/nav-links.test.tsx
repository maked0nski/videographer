import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavLinks } from "@/components/layout/NavLinks";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en/work",
}));

describe("NavLinks", () => {
  it("gives each link a block display and vertical padding for a >=44px tap target", () => {
    render(
      <NavLinks
        links={[
          { href: "/en/work", label: "Work" },
          { href: "/en/about", label: "About & Contact" },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Work" });
    expect(link.className).toContain("block");
    expect(link.className).toContain("py-2");
  });
});
