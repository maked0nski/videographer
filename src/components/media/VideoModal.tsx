"use client";

import { useRef } from "react";
import { CloseButton } from "@/components/ui/CloseButton";
import { useFocusTrap } from "@/lib/use-focus-trap";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

function toYoutubeNoCookieEmbedUrl(youtubeUrl: string): string | null {
  try {
    const url = new URL(youtubeUrl);
    let videoId = url.searchParams.get("v");
    if (!videoId && url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    }
    if (!videoId) return null;
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
  } catch {
    return null;
  }
}

/**
 * The iframe element is only created while `isOpen` is true, and only ever
 * mounted after the visitor's click opened it — no request to
 * youtube-nocookie.com fires before that (FR-003, FR-004, FR-014).
 */
export function VideoModal({
  youtubeUrl,
  isOpen,
  onClose,
  closeLabel,
}: {
  youtubeUrl: string;
  isOpen: boolean;
  onClose: () => void;
  closeLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, onClose);
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const embedUrl = toYoutubeNoCookieEmbedUrl(youtubeUrl);

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      className="bg-bg/95 fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute top-4 right-4 z-10">
        <CloseButton onClick={onClose} label={closeLabel} />
      </div>
      <div className="aspect-video w-full max-w-5xl">
        {embedUrl && (
          <iframe
            src={embedUrl}
            title="YouTube video player"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
