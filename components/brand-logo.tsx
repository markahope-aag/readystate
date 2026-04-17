import Link from "next/link";

/**
 * ReadyState brand lockup — K-mark + "ReadyState" wordmark.
 * Signals "a Kestralis product" without cloning the marketing site.
 */
export function BrandLogo({
  variant = "onLight",
  height = 24,
  asLink = true,
  className,
  ariaLabel = "ReadyState — a Kestralis product",
}: {
  variant?: "onLight" | "onDark";
  height?: number;
  asLink?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const isDark = variant === "onDark";
  const navyColor = isDark ? "#FFFFFF" : "#172D99";
  const kmarkOpacity = isDark ? 0.7 : 0.6;

  const logo = (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      {/* Kestralis K-mark — small, subtle family signal */}
      <svg
        width={Math.round(height * 0.42)}
        height={Math.round(height * 0.44)}
        viewBox="0 0 391.657 408.262"
        fill={navyColor}
        opacity={kmarkOpacity}
        aria-hidden="true"
      >
        <g>
          <path
            transform="matrix(1,0,0,-1,92.0961,223.357)"
            d="M0 0C-7.853 1.986-14.236-2.793-14.236-10.893L-14.237-33.62V-107.045H41.32V-45.635-41.598C41.32-31.845 37.013-22.538 29.485-16.337 20.386-8.842 11.879-3.005 0 0"
          />
          <path
            transform="matrix(1,0,0,-1,77.8595,77.8591)"
            d="M0 0V-89.453C0-97.866 8.909-103.227 16.381-99.36 24.592-95.109 34.466-88.223 47.011-77.712 52.405-73.192 55.556-66.538 55.556-59.501V-56.382 0Z"
          />
          <path
            transform="matrix(1,0,0,-1,254.8265,258.6704)"
            d="M0 0C-.001 .001-.001 .002-.002 .003L-32.36 39.363C-42.363 49.403-55.962 56.652-67.63 56.652-58.979 56.652-39.647 73.031-23.179 91.885L50.593 180.811H-4.696C-15.424 180.811-25.536 175.803-32.039 167.271L-43.419 152.337C-61.975 127.995-102.084 83.123-130.853 64.785-135.048 61.978-141.562 59.486-141.562 57.436-141.562 55.308-134.401 54.243-127.026 50.589-126.865 50.509-126.719 50.431-126.57 50.353-107.738 41.114-90.714 23.177-77.105 6.596L-26.131-58.649C-19.68-66.906-9.786-71.732 .692-71.732H58.971Z"
          />
        </g>
      </svg>
      {/* ReadyState wordmark */}
      <span
        style={{
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          fontWeight: 700,
          fontSize: `${height * 0.67}px`,
          letterSpacing: "-0.01em",
          color: navyColor,
          lineHeight: 1,
        }}
      >
        ReadyState
      </span>
    </div>
  );

  if (!asLink) return logo;

  return (
    <Link
      href="/"
      aria-label={ariaLabel}
      className="inline-flex items-center"
    >
      {logo}
    </Link>
  );
}
