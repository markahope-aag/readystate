import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        // ─── Kestralis brand palette ─────────────────────────────
        navy: {
          DEFAULT: "#172D99",
          900: "#0E1E6B",
        },
        blue: {
          DEFAULT: "#0B5ED6",
          light: "#C5E6F9",
        },
        paper: "#FFFFFF",
        ink: "#000000",
        body: "#1F242B",
        "gray-light": "#EAEBEC",
        "warm-muted": "#6B7280",

        // Legacy aliases for components using old names
        forest: {
          DEFAULT: "#172D99",
          deep: "#0E1E6B",
          soft: "#0B5ED6",
        },
        amber: {
          DEFAULT: "#0B5ED6",
          soft: "#C5E6F9",
          deep: "#0E1E6B",
        },
        sand: {
          DEFAULT: "#D8DADC",
          soft: "#EAEBEC",
          deep: "#6B7280",
        },
        "risk-red": "#DC2626",
        "risk-red-soft": "#FEE2E2",
        "warm-muted-soft": "#9CA3AF",

        // ─── shadcn tokens ─────────────────
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 1px)",
        sm: "1px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "draw-rule": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up":
          "fade-in-up 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 600ms ease-out forwards",
        "draw-rule":
          "draw-rule 900ms cubic-bezier(0.65, 0, 0.35, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
