"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/types";
import { CloseButton } from "@/components/ui/CloseButton";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

/**
 * Full-size image view with next/previous navigation and two ways to close
 * (control + Escape) — FR-015, FR-027.
 */
export function Lightbox({
  images,
  index,
  onClose,
  onNext,
  onPrevious,
  labels,
}: {
  images: ImageAsset[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  labels: { close: string; next: string; previous: string };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, onClose);
  useBodyScrollLock(true);

  useEffect(() => {
    if (images.length <= 1) return;
    const handleArrowKeys = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrevious();
    };
    document.addEventListener("keydown", handleArrowKeys);
    return () => document.removeEventListener("keydown", handleArrowKeys);
  }, [images.length, onNext, onPrevious]);

  const image = images[index];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className="bg-bg/95 fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute top-4 right-4 z-10">
        <CloseButton onClick={onClose} label={labels.close} />
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={onPrevious}
          className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full p-2 text-4xl leading-none"
        >
          <VisuallyHidden>{labels.previous}</VisuallyHidden>
          <span aria-hidden="true">‹</span>
        </button>
      )}

      <div className="relative h-[80vh] w-full max-w-4xl">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="90vw"
          className="object-contain"
          priority
        />
      </div>

      {images.length > 1 && (
        <button
          type="button"
          onClick={onNext}
          className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full p-2 text-4xl leading-none"
        >
          <VisuallyHidden>{labels.next}</VisuallyHidden>
          <span aria-hidden="true">›</span>
        </button>
      )}
    </div>
  );
}
