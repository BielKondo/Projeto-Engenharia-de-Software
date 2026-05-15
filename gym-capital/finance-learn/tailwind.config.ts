import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./contexts/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds via CSS vars (mudam por tema)
        "navy-950": "var(--bg-base)",
        "navy-900": "var(--bg-main)",
        "navy-850": "var(--bg-elev1)",
        "navy-800": "var(--bg-elev2)",
        "navy-700": "var(--bg-elev3)",
        "navy-600": "var(--bg-elev4)",
        sidebar: "var(--bg-sidebar)",

        // Borders
        rule: "var(--rule)",
        "rule-soft": "var(--rule-soft)",

        // Text
        ink: "var(--text-primary)",
        "ink-muted": "var(--text-muted)",
        "ink-dim": "var(--text-dim)",

        // Cores semânticas (iguais em ambos os temas)
        brand: "#3B82F6",
        "brand-hover": "#2563EB",
        "brand-soft": "#1E3A8A",

        buy: "#3B82F6",
        "buy-hover": "#2563EB",
        sell: "#F97316",
        "sell-hover": "#EA580C",

        up: "#10B981",
        "up-soft": "#064E3B",
        down: "#EF4444",
        "down-soft": "#7F1D1D",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.2s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
