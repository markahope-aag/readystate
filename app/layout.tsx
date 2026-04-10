import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// ─── Typography ────────────────────────────────────────────────────────────
//
// Display: Fraunces — variable serif with opsz, SOFT, WONK axes. Killer
// italic, scales cleanly from body size to hero. Used sparingly for
// display headlines, pull quotes, and the KESTRALIS wordmark.
//
// Body: Geist Sans — refined, characterful sans. Used for all body copy,
// UI chrome, and navigation.
//
// Mono: Geist Mono — used for question IDs, score numerics, and metadata.

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://readystate.now"),
  title: "ReadyState — SB 553 Compliance Assessment",
  description:
    "Score your workplace violence prevention program against California SB 553 and the ASIS professional standard. Free, no sign-up required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            classNames: {
              toast:
                "font-sans border border-sand bg-paper text-ink shadow-none",
              title: "font-sans font-medium text-ink",
              description: "text-warm-muted",
            },
          }}
        />
      </body>
    </html>
  );
}
