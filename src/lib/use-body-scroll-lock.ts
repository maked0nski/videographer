"use client";

import { useEffect } from "react";

/** Locks page scroll while `locked` is true — shared by VideoModal and Lightbox. */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}
