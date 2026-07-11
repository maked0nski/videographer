/**
 * True document root — required because `/studio` lives outside the
 * `[locale]` segment, so it can't rely on `[locale]/layout.tsx` supplying
 * `<html>`/`<body>` the way every other route can (Next.js needs exactly one
 * such root reachable from every route). Deliberately minimal: no design
 * tokens or global CSS here, so Tailwind's reset never reaches the embedded
 * Sanity Studio, which manages its own styling.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
