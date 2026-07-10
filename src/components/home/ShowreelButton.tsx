"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { VideoModal } from "@/components/media/VideoModal";

export function ShowreelButton({
  showreelUrl,
  label,
  closeLabel,
}: {
  showreelUrl: string;
  label: string;
  closeLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        {label}
      </Button>
      <VideoModal
        youtubeUrl={showreelUrl}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        closeLabel={closeLabel}
      />
    </>
  );
}
