# Design: Mobile nav menu modernization

Date: 2026-07-23

Replaces the mobile nav's full-screen solid overlay (`src/components/layout/MobileMenu.tsx`)
with a compact dropdown card anchored under the header, over a semi-transparent
blurred scrim — a more modern pattern than the current opaque, screen-filling panel.

## Why

The current overlay (`bg-bg fixed inset-0`) paints a single solid color across
the entire viewport behind two short nav links, which reads as heavy and
dated on a small screen. It was also the fix target of a separate bug (the
overlay was clipped to the header's height because `backdrop-filter` on
`<header>` creates a containing block for `position: fixed` descendants) —
that bug's fix (portalling into `document.body`) stays; this spec changes
what gets rendered inside the portal.

## Interaction & layout

- The header's hamburger button becomes a single toggle: hamburger icon when
  closed, X icon when open (`aria-expanded`, and the `VisuallyHidden` label
  swaps between the existing `openLabel`/`closeLabel` — no new i18n keys).
  There is no second, separate close button on the card.
- Opening it renders, via the existing `createPortal(..., document.body)`:
  1. **Scrim** — `fixed inset-0`, `bg-bg/70` + `backdrop-blur-sm`, `z-30`
     (below the header's existing `z-40`, so the header stays crisp and its
     toggle button stays clickable). Clicking the scrim closes the menu.
  2. **Card** — `fixed`, `z-30` (same as the scrim; it paints above the scrim
     simply by being the later sibling in the portaled JSX — no `z-index`
     ordering needed between the two), inset horizontally at `left-6 right-6` (matching the
     header's own `px-6` edge padding on mobile widths), positioned a small
     gap below the header's actual bottom edge, sized only to its content
     (no fixed height). Style: `bg-bg-secondary`, `border border-border`,
     `rounded-2xl`, `shadow-xl`, `p-6` — an elevated surface against the
     blurred scrim, using only existing design tokens (no new colors).
     `role="dialog"` `aria-modal="true"` `aria-label={openLabel}`.
  3. `NavLinks` inside the card at `text-lg` (down from the old `text-2xl`,
     proportionate to a compact card rather than a full-screen menu),
     `flex flex-col gap-2`. `NavLinks.tsx`'s shared link className gains
     `block py-2` (it currently has no vertical padding at all) so each link
     reaches a ≥44px tap target; this is shared with the desktop nav too,
     where the extra 8px of vertical padding on an already-taller header row
     is not visually noticeable.
- Closing happens on: the header toggle (X), a scrim click, `Escape`, or
  clicking any nav link (existing `onNavigate` behavior, unchanged).

## Positioning the card under the header

The header's rendered height differs slightly between `uk`/`en` (different
label lengths) and can reflow, so the card's `top` offset is measured at
runtime rather than hard-coded:

`Header.tsx` is currently a Server Component (no `"use client"`) — `MobileMenu`
is the client boundary rendered inside it, matching the codebase's existing
pattern of small leaf client components (`NavLinks`, `LanguageSwitcher`)
inside a server-rendered `Header`. Rather than adding a ref in `Header.tsx`
(which would force it to become a Client Component), `MobileMenu` finds its
own ancestor header directly:

- The toggle `<button>` already needs a ref for focus restoration; reuse that
  ref (`triggerRef`) and call `triggerRef.current.closest("header")` once the
  menu opens to get the header element — no new prop, no change to
  `Header.tsx` at all.
- Only while `isOpen`, observe that header element with a `ResizeObserver` to
  read `getBoundingClientRect().bottom` into state, adding a small fixed gap
  (8px) for the card's `top` style. The observer is created on open and
  disconnected on close — never running while the menu is closed. (The
  header is the first element on the page and `sticky top-0`, so its `top`
  is always `0`; only its `bottom` — i.e. its height — can change, which
  `ResizeObserver` covers without needing a scroll listener.)

## Reused accessibility primitives

No new hooks — reuse what `VideoModal`/`Lightbox` already use:

- `useFocusTrap(containerRef, onEscape)` on the card: traps Tab/Shift+Tab,
  closes on `Escape`, moves focus into the card on open and restores it to
  the toggle button on close.
- `useBodyScrollLock(isOpen)`: locks page scroll while the menu is open,
  matching the modal/lightbox convention.

## Animation

Enter-only transition (no exit animation — matches the existing convention:
`VideoModal`/`Lightbox` also close instantly with no fade-out; adding one
here would be new complexity, not parity):

- On open, the card mounts at `opacity-0 -translate-y-2` and the scrim at
  `opacity-0`; a `requestAnimationFrame` flips both to `opacity-100`
  (`translate-y-0` for the card), animated by `transition-all duration-200
  ease-out` (card) / `transition-opacity duration-200` (scrim).
- No extra reduced-motion handling needed — `globals.css` already forces all
  transition/animation durations to near-zero under `prefers-reduced-motion:
  reduce` globally.

## Component/prop changes

- `MobileMenu.tsx`: drops the `CloseButton` import (no longer used here —
  it's untouched in `VideoModal`/`Lightbox`/elsewhere); adds the
  `ResizeObserver`-backed offset state and the `closest("header")` lookup;
  restructures the portaled JSX into scrim + card as described above. No
  new props on the component itself.
- `Header.tsx`: **unchanged** — stays a Server Component.
- `NavLinks.tsx`: the shared link `className` gains `block py-2` (tap-target
  fix above). No prop or behavior changes.
- No changes to `CloseButton.tsx` or any i18n message file.

## Test changes

Add `tests/e2e/mobile-menu.spec.ts` (new — no existing test currently covers
this component), modeled on `showreel-modal.spec.ts`'s open/close pattern:

- Skip on the `desktop-chromium` project (`test.skip(!isMobile, ...)` via
  Playwright's `isMobile` fixture) — the toggle button only renders below
  the `md` breakpoint, so these assertions are only meaningful on
  `mobile-chromium`.
- Opens via the header toggle; asserts the `dialog` role card is visible
  with both nav links.
- Closes via: the toggle (now showing X), a click on the scrim (a point
  outside the card's bounding box), and `Escape` — each re-opened between
  assertions.
- Clicking a nav link inside the card navigates to that link's href and the
  menu is gone.

## Out of scope

- Exit/close animation — instant close, matching `VideoModal`/`Lightbox`.
- Any i18n copy changes — reuses `t.nav.menu`/`t.nav.close` as-is.
- Desktop nav (`NavLinks` rendered directly in the header above `md`) —
  untouched.
