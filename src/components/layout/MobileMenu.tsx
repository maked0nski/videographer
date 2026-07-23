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
    if (!header) {
      console.warn("MobileMenu: no ancestor <header> found — card will use its default position.");
      return;
    }

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
