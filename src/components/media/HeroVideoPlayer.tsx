"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ImageAsset } from "@/types";
import { cn } from "@/lib/cn";
import { toYoutubeNoCookieEmbedUrl } from "@/lib/youtube";
import { VisuallyHidden } from "@/components/ui/VisuallyHidden";

/**
 * Inline hero video: a muted looping preview (or the cover image, when no
 * preview clip is set) with a Play overlay that crossfades into a live
 * YouTube embed on click — no dialog, no page jump. The preview layer is
 * never unmounted on click; it fades to opacity-0 so the iframe underneath
 * (already mounted, already loading) is revealed without a black flash,
 * then the local video is paused once the fade finishes.
 */
export function HeroVideoPlayer({
  youtubeUrl,
  coverImage,
  previewClipUrl,
  playLabel,
}: {
  youtubeUrl: string;
  coverImage: ImageAsset;
  previewClipUrl?: string;
  playLabel: string;
}) {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const embedUrl = toYoutubeNoCookieEmbedUrl(youtubeUrl);

  return (
    <div className="bg-bg-secondary relative aspect-video w-full overflow-hidden">
      {isActive && embedUrl && (
        <iframe
          src={embedUrl}
          title="YouTube video player"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isActive && "pointer-events-none opacity-0",
        )}
        onTransitionEnd={(event) => {
          if (isActive && event.propertyName === "opacity" && event.target === event.currentTarget) {
            videoRef.current?.pause();
          }
        }}
      >
        {previewClipUrl ? (
          <video
            ref={videoRef}
            src={previewClipUrl}
            poster={coverImage.url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={coverImage.url}
            alt={coverImage.alt}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}

        <button
          type="button"
          onClick={() => setIsActive(true)}
          className="group absolute inset-0 flex items-center justify-center bg-bg/40"
        >
          <VisuallyHidden>{playLabel}</VisuallyHidden>
          <span
            aria-hidden="true"
            className="border-accent bg-bg/70 flex h-16 w-16 items-center justify-center rounded-full border transition-transform group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          >
            <svg viewBox="0 0 24 24" className="text-accent h-6 w-6" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          {previewClipUrl && (
            <span
              aria-hidden="true"
              className="bg-bg/70 absolute right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full"
            >
              <svg viewBox="0 0 24 24" className="text-text h-4 w-4" fill="none">
                <path d="M4 9v6h4l5 5V4L8 9H4z" fill="currentColor" />
                <path
                  d="M17 8l4 8M21 8l-4 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
