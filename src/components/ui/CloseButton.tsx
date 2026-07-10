import { cn } from "@/lib/cn";
import { VisuallyHidden } from "./VisuallyHidden";

export function CloseButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "border-border text-text hover:border-accent hover:text-accent flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
        className,
      )}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
