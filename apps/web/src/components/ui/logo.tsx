import { cn } from "@/lib/utils";

interface LogoProps {
  /** Pixel size — applied to width + height since the artwork is square. */
  size?: number;
  /** Optional className appended to the root <svg>. */
  className?: string;
  /** When true, the decorative map-line layer is hidden — useful in tight UI like the topbar. */
  flat?: boolean;
  /** Accessible name. Defaults to "Notifio". Pass `""` for purely decorative use (paired with `aria-hidden`). */
  title?: string;
}

/**
 * Brand mark — square `N` over a navy rounded rectangle with faint orange
 * map lines. Single source of truth for the logo across the app; the
 * matching raster/asset versions live in:
 *   - `public/logo.svg`        — raw asset, OG image, anywhere a URL is needed
 *   - `src/app/icon.svg`       — Next.js App Router favicon convention
 *
 * Keep the artwork in sync across all three when the design changes.
 */
export function Logo({ size = 32, className, flat = false, title = "Notifio" }: LogoProps) {
  const labelled = title.length > 0;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : true}
      aria-label={labelled ? title : undefined}
      className={cn("shrink-0", className)}
    >
      {labelled ? <title>{title}</title> : null}
      <rect width="1024" height="1024" rx="220" fill="#0E223F" />
      {!flat && (
        <g stroke="#FF7A2F" strokeWidth="6" opacity="0.1" fill="none">
          <path d="M100 300 L900 300" />
          <path d="M200 100 L800 900" />
          <path d="M100 700 L900 500" />
          <path d="M300 100 L300 900" />
          <path d="M700 100 L700 900" />
          <path d="M100 500 L900 800" />
        </g>
      )}
      <path
        d="M300 750 V250 L750 750 V250"
        stroke="#FF7A2F"
        strokeWidth="140"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
