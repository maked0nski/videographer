"use client";

import { useState } from "react";
import { NavLinks } from "./NavLinks";
import { CloseButton } from "@/components/ui/CloseButton";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

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

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center"
      >
        <VisuallyHidden>{openLabel}</VisuallyHidden>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="bg-bg fixed inset-0 z-50 flex flex-col p-6">
          <div className="flex justify-end">
            <CloseButton onClick={() => setIsOpen(false)} label={closeLabel} />
          </div>
          <NavLinks
            links={links}
            onNavigate={() => setIsOpen(false)}
            className="mt-12 flex flex-col gap-8 text-2xl"
          />
        </div>
      )}
    </div>
  );
}
