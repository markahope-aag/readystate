import Image from "next/image";
import Link from "next/link";

/**
 * ReadyState brand lockup. Two variants to match the background of the
 * container they sit in:
 *
 *   <BrandLogo variant="light" />  for paper / cream backgrounds
 *   <BrandLogo variant="dark" />   for ink / navy backgrounds
 *
 * Source assets in /public are 1680×360 PNGs (14:3 aspect). The `height`
 * prop controls the rendered height; width is derived from the aspect.
 * Default height is 36px, which lines up with the existing editorial
 * header chrome and reads cleanly even on small screens.
 */
export function BrandLogo({
  variant = "light",
  height = 36,
  asLink = true,
  className,
}: {
  variant?: "light" | "dark";
  height?: number;
  asLink?: boolean;
  className?: string;
}) {
  const src =
    variant === "light"
      ? "/readystate-logo-light.png"
      : "/readystate-logo-dark.png";

  // 1680x360 — 14:3 aspect
  const width = Math.round(height * (1680 / 360));

  const img = (
    <Image
      src={src}
      alt="ReadyState — a product of Kestralis"
      width={width}
      height={height}
      priority
      className={className}
    />
  );

  if (!asLink) return img;

  return (
    <Link href="/" aria-label="ReadyState home" className="inline-flex">
      {img}
    </Link>
  );
}
