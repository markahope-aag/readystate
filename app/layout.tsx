import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://readystate.now"),
  title: "ReadyState — SB 553 Compliance Assessment",
  description:
    "Score your workplace violence prevention program against California SB 553 and the ASIS professional standard. Free, no sign-up required.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/readystate-icon-light.png",
  },
  openGraph: {
    title: "ReadyState — SB 553 Compliance Assessment",
    description:
      "Score your workplace violence prevention program against California SB 553 and the ASIS professional standard.",
    url: "https://readystate.now",
    siteName: "ReadyState",
    images: [
      {
        url: "/readystate-logo-light.png",
        width: 1680,
        height: 360,
        alt: "ReadyState by Kestralis",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} antialiased`}>
        {children}
        <Toaster
          richColors
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast:
                "font-sans border border-[color:var(--color-border)] bg-[color:var(--color-navy)] text-white shadow-none",
              title: "font-sans font-medium text-white",
              description: "text-white/70",
            },
          }}
        />
      </body>
    </html>
  );
}
