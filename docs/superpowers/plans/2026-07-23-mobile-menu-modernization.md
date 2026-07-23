# Mobile nav menu modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mobile nav's full-screen solid overlay with a compact dropdown card anchored under the header, over a semi-transparent blurred scrim.

**Architecture:** `MobileMenu.tsx` keeps portalling into `document.body` (existing fix for the `backdrop-filter` containing-block bug) but now renders two elements inside the portal — a full-viewport scrim and a content-sized card positioned under the header — instead of one full-screen solid panel. The header's own hamburger button becomes a hamburger/X toggle; there is no second close control. Card position is measured from the real `<header>` element at runtime (no hard-coded pixel offsets) so it stays correct across the `uk`/`en` label-length difference.

**Tech Stack:** Next.js 16 (App Router) Client Component, React 19, Tailwind v4 utility classes, Playwright (e2e), Vitest + Testing Library (unit).

## Global Constraints

- No new i18n keys — reuse the existing `t.nav.menu` / `t.nav.close` strings ("Menu" / "Close") threaded through `Header` as `openLabel`/`closeLabel`.
- No new colors/tokens — use only the existing `bg-bg`, `bg-bg-secondary`, `border-border` design tokens from `src/styles/globals.css`.
- No exit/close animation — the menu closes instantly, matching `VideoModal`/`Lightbox`'s existing convention.
- `Header.tsx` stays a Server Component — do not add `"use client"` or a ref there. `MobileMenu` must locate its own ancestor `<header>` itself.
- `CloseButton.tsx` and all i18n message files (`src/messages/*.json`) are untouched.
- `prefers-reduced-motion` is already handled globally in `src/styles/globals.css` (forces near-zero transition/animation durations) — do not add component-level reduced-motion handling.

---

### Task 1: Tap-target padding on `NavLinks`

**Files:**
- Modify: `src/components/layout/NavLinks.tsx:28-31`
- Test: Create `tests/unit/nav-links.test.tsx`

**Interfaces:**
- Consumes: nothing new — `NavLinks({ links, className, onNavigate })`, unchanged signature.
- Produces: each rendered `<a>` now has `block` and `py-2` in its class list — Task 2's card layout (`gap-2` between items) assumes this padding is what makes each link meet a ≥44px tap target, not extra gap.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/nav-links.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/nav-links.test.tsx`
Expected: FAIL — `expect(link.className).toContain("block")` fails because the current class list is `"hover:text-accent text-sm font-medium tracking-wide uppercase transition-colors"` (no `block`, no `py-2`).

- [ ] **Step 3: Write minimal implementation**

In `src/components/layout/NavLinks.tsx`, change the `Link` className (currently spread across two lines around line 28-31):

```tsx
              className={cn(
                "hover:text-accent block py-2 text-sm font-medium tracking-wide uppercase transition-colors",
                isActive ? "text-accent" : "text-text",
              )}
```

(Only the first string literal changes — insert `block py-2 ` before `text-sm`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/nav-links.test.tsx`
Expected: PASS

- [ ] **Step 5: Run the full unit suite to check for regressions**

Run: `npm run test:unit`
Expected: all test files pass (45 tests: the 44 that existed before, plus the 1 new one).

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/NavLinks.tsx tests/unit/nav-links.test.tsx
git commit -m "fix: give nav links a real tap target (block + vertical padding)"
```

---

### Task 2: Modernized `MobileMenu` overlay

**Files:**
- Modify: `src/components/layout/MobileMenu.tsx` (full rewrite)
- Test: Create `tests/e2e/mobile-menu.spec.ts`

**Interfaces:**
- Consumes: `NavLinks` (from Task 1, now with `block py-2` links), `useFocusTrap(containerRef, onEscape)` from `src/lib/use-focus-trap.ts` (unchanged signature — traps Tab, calls `onEscape` on Escape, focuses first focusable child on mount, restores focus to the previously-focused element on unmount), `useBodyScrollLock(locked: boolean)` from `src/lib/use-body-scroll-lock.ts` (unchanged).
- Produces: `MobileMenu({ links, openLabel, closeLabel })` — same public props as today, no signature change, so `Header.tsx` needs zero edits. Internally exposes two stable hooks for e2e targeting: `data-testid="mobile-menu-toggle"` on the header button, `data-testid="menu-scrim"` on the backdrop.

- [ ] **Step 1: Write the failing e2e test**

Create `tests/e2e/mobile-menu.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/mobile-menu.spec.ts --project=mobile-chromium`
Expected: FAIL on the first test — `page.getByTestId("mobile-menu-toggle")` finds no element (the current `MobileMenu.tsx` has no `data-testid` and no `role="dialog"` on its overlay).

- [ ] **Step 3: Write the implementation**

Replace the full contents of `src/components/layout/MobileMenu.tsx`:

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLinks } from "./NavLinks";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const CARD_GAP_PX = 8;

export function MobileMenu({
  links,
  openLabel,
  closeLabel,
}: {
  links: { href: string; label: string }[];
  openLabel: string;
  closeLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useFocusTrap(cardRef, () => setIsOpen(false));
  useBodyScrollLock(isOpen);

  // Positions the card under the real header height, measured at runtime
  // (uk/en label lengths differ) — runs before paint so there's no flash
  // at the wrong position, and stays correct across the open menu's
  // lifetime via ResizeObserver (no scroll listener needed: this header
  // is `sticky top-0` and the first element on the page, so its `top` is
  // always 0 — only its height/bottom can change).
  useLayoutEffect(() => {
    if (!isOpen) return;

    const header = triggerRef.current?.closest("header");
    if (!header) return;

    const positionCard = () => {
      if (!cardRef.current) return;
      cardRef.current.style.top = `${header.getBoundingClientRect().bottom + CARD_GAP_PX}px`;
    };
    positionCard();

    const observer = new ResizeObserver(positionCard);
    observer.observe(header);
    return () => observer.disconnect();
  }, [isOpen]);

  // Fade + slide-in on open. Imperative (refs + classList), not React
  // state, so this doesn't cause a second render while the menu is open —
  // a second render here would re-run useFocusTrap's effect (it takes an
  // inline callback) and briefly bounce focus. No exit animation (closes
  // instantly), matching VideoModal/Lightbox.
  useEffect(() => {
    if (!isOpen) return;

    const raf = requestAnimationFrame(() => {
      cardRef.current?.classList.remove("opacity-0", "-translate-y-2");
      cardRef.current?.classList.add("opacity-100", "translate-y-0");
      scrimRef.current?.classList.remove("opacity-0");
      scrimRef.current?.classList.add("opacity-100");
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        data-testid="mobile-menu-toggle"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center"
      >
        <VisuallyHidden>{isOpen ? closeLabel : openLabel}</VisuallyHidden>
        {isOpen ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              ref={scrimRef}
              data-testid="menu-scrim"
              aria-hidden="true"
              onClick={() => setIsOpen(false)}
              className="bg-bg/70 fixed inset-0 z-30 opacity-0 backdrop-blur-sm transition-opacity duration-200"
            />
            <div
              ref={cardRef}
              role="dialog"
              aria-modal="true"
              aria-label={openLabel}
              className="bg-bg-secondary border-border fixed right-6 left-6 z-30 -translate-y-2 rounded-2xl border p-6 opacity-0 shadow-xl transition-all duration-200 ease-out"
            >
              <NavLinks
                links={links}
                onNavigate={() => setIsOpen(false)}
                className="flex flex-col gap-2 text-lg"
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/mobile-menu.spec.ts --project=mobile-chromium`
Expected: PASS (3 tests).

- [ ] **Step 5: Run the desktop project too, to confirm nothing broke there**

Run: `npx playwright test tests/e2e/responsive-layout.spec.ts tests/e2e/language-switching.spec.ts`
Expected: PASS — these exercise the header on both `desktop-chromium` and `mobile-chromium` and don't touch the mobile menu itself, so they confirm the desktop nav (still plain `NavLinks`, untouched) and language switcher still work.

- [ ] **Step 6: Run full verification suite**

Run: `npm run typecheck && npx eslint src/components/layout/MobileMenu.tsx src/components/layout/NavLinks.tsx && npm run test:unit`
Expected: all three pass with no errors (typecheck: 0 errors; eslint on the two changed files: 0 errors; unit: 45 tests pass, unchanged from Task 1). Note: plain `npm run lint` (no path) also reports pre-existing errors inside the Next.js-generated `.next/dev/types/` folder unrelated to this change — that's a known pre-existing condition, not something this task introduces, so lint the changed files directly instead of relying on the full `npm run lint` output.

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/MobileMenu.tsx tests/e2e/mobile-menu.spec.ts
git commit -m "feat: modernize mobile nav menu into a dropdown card over a blurred scrim"
```

---

## Self-Review Notes

- **Spec coverage:** hamburger↔X toggle (Task 2 button), scrim + blur (Task 2 scrim div), card under header with runtime-measured offset (Task 2 `useLayoutEffect`), reused `useFocusTrap`/`useBodyScrollLock` (Task 2), enter-only fade+slide animation (Task 2 imperative effect), tap targets (Task 1), close-on-toggle/scrim/Escape/link-click (Task 2, all covered by the e2e test), no i18n/token/`Header.tsx`/`CloseButton.tsx` changes (verified — neither file is touched by either task) — every spec section maps to a task.
- **Type consistency:** `MobileMenu`'s public prop shape (`links`, `openLabel`, `closeLabel`) is identical before and after, so `Header.tsx`'s existing call site (`<MobileMenu links={links} openLabel={menuLabels.open} closeLabel={menuLabels.close} />`) needs no change — confirmed by re-reading `Header.tsx` during planning.
- **No placeholders:** every step has complete, copy-pasteable code and exact commands.
