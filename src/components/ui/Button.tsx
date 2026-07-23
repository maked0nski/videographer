import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "outline";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:bg-accent/90",
  ghost: "text-text hover:text-accent",
  outline: "border border-border text-text hover:border-accent hover:text-accent",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium uppercase tracking-wide transition-colors";

interface ButtonOwnProps {
  variant?: Variant;
  children: ReactNode;
}

type ButtonProps = ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, children, ...props },
  ref,
) {
  return (
    <button ref={ref} className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)} {...props}>
      {children}
    </button>
  );
});

type ButtonLinkProps = ButtonOwnProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)} {...props}>
      {children}
    </Link>
  );
}
