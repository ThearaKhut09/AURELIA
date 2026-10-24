import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F3EE",
        ink: "#1C1F26",
        "ink-soft": "#4A4F5A",
        sage: "#A8B5A2",
        "sage-deep": "#7C8B76",
        rose: "#C9A9A0",
        "rose-deep": "#B08A80",
        gold: "#B99A5F",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "var(--font-khmer)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "var(--font-khmer)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(28, 31, 38, 0.10)",
        card: "0 2px 12px rgba(28, 31, 38, 0.07)",
        lift: "0 14px 40px rgba(28, 31, 38, 0.14)",
      },
      borderRadius: {
        glass: "18px",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      maxWidth: {
        site: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;
