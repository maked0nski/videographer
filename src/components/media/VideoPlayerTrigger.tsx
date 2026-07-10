"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/types";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";
import { VideoModal } from "./VideoModal";

/**
 * Poster + play button; the YouTube iframe is only created after the click
 * that opens `VideoModal` (FR-011, FR-014).
 */
export function VideoPlayerTrigger({
  youtubeUrl,
  poster,
  playLabel,
  closeLabel,
}: {
  youtubeUrl: string;
  poster: ImageAsset;
  playLabel: string;
  closeLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group bg-bg-secondary relative block aspect-video w-full overflow-hidden"
      >
        <Image
          src={poster.url}
          alt={poster.alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <span className="bg-bg/40 absolute inset-0 flex items-center justify-center">
          <VisuallyHidden>{playLabel}</VisuallyHidden>
          <span
            aria-hidden="true"
            className="border-accent bg-bg/70 flex h-16 w-16 items-center justify-center rounded-full border transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <svg viewBox="0 0 24 24" className="text-accent h-6 w-6" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
      </button>
      <VideoModal
        youtubeUrl={youtubeUrl}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        closeLabel={closeLabel}
      />
    </>
  );
}
