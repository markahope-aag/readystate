import Link from "next/link";

/**
 * ReadyState brand lockup — inline SVG for crisp rendering at any size
 * and transparent backgrounds that work on any surface.
 *
 *   <BrandLogo variant="onLight" />  for paper / cream backgrounds
 *   <BrandLogo variant="onDark" />   for ink / navy backgrounds
 *
 * The badge on the left is the navy square with amber shield + checkmark.
 * On dark backgrounds, the badge becomes a translucent glass inset since
 * a solid navy box would disappear against the navy backdrop.
 *
 * Wordmark uses the site's sans variable (Geist) so it reads cohesively
 * with the editorial body typography.
 */
export function BrandLogo({
  variant = "onLight",
  height = 44,
  asLink = true,
  className,
  ariaLabel = "ReadyState — a product of Kestralis",
}: {
  variant?: "onLight" | "onDark";
  height?: number;
  asLink?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const isDark = variant === "onDark";
  const wordmarkColor = isDark ? "#FFFFFF" : "#0D1B2E";
  const dotColor = isDark ? "rgba(255,255,255,0.55)" : "#6B7A8D";

  // 1680x360 original proportions; we render at viewBox 0 0 560 120.
  // Width is proportional to height at the 14:3 ratio.
  const width = Math.round(height * (560 / 120));

  const svg = (
    <svg
      width={width}
      height={height}
      viewBox="0 0 560 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      {/* ── Badge ─────────────────────────────────────────── */}
      {isDark ? (
        <rect
          x="20"
          y="20"
          width="80"
          height="80"
          rx="14"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1.5"
        />
      ) : (
        <rect
          x="20"
          y="20"
          width="80"
          height="80"
          rx="14"
          fill="#0D1B2E"
        />
      )}

      {/* ── Shield outline (amber) ────────────────────────── */}
      {/* Stroke widths are intentionally heavy so the amber reads at
          small header sizes. The original asset was designed to be
          shown at 120px tall; we render at 44px so strokes need to be
          ~2.7× wider to remain visible. */}
      <path
        d="M 39 38 L 81 38 Q 86.6 38 86.6 43.6 L 86.6 71.88 L 60 99.6 L 33.4 71.88 L 33.4 43.6 Q 33.4 38 39 38"
        fill="none"
        stroke="#F5A623"
        strokeWidth="5"
        strokeLinejoin="round"
        opacity={0.85}
      />

      {/* ── Checkmark (amber, bold) ───────────────────────── */}
      <path
        d="M 46 70.2 L 57.2 81.4 L 75.4 57.6"
        fill="none"
        stroke="#F5A623"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Wordmark ──────────────────────────────────────── */}
      <text
        x="120"
        y="62"
        fontFamily="var(--font-geist-sans), 'Helvetica Neue', Arial, sans-serif"
        fontSize="34"
        fontWeight="600"
        fill={wordmarkColor}
        letterSpacing="-0.8"
      >
        ReadyState
      </text>

      {/* ── .now suffix ───────────────────────────────────── */}
      <text
        x="122"
        y="89"
        fontFamily="var(--font-geist-sans), 'Helvetica Neue', Arial, sans-serif"
        fontSize="18"
        fontWeight="400"
        fill={dotColor}
        letterSpacing="0.5"
      >
        .now
      </text>
    </svg>
  );

  if (!asLink) return svg;

  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className="inline-flex items-center"
    >
      {svg}
    </Link>
  );
}
