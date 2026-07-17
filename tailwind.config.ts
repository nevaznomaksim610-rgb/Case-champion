import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#EF3124",
          hover: "#D7281E",
          soft: "#FDE8E6",
        },
        ink: {
          DEFAULT: "#0B0B0B",
          graphite: "#242424",
        },
        bg: {
          DEFAULT: "#F4F4F5",
          surface: "#FFFFFF",
          muted: "#E8E8EA",
        },
        secondary: "#6B6B73",
        success: "#1E9E61",
        warning: "#F2A100",
        danger: "#D92D20",
      },
      borderRadius: {
        "2xl": "22px",
        "3xl": "28px",
        "4xl": "32px",
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(11, 11, 11, 0.12)",
        card: "0 6px 20px -8px rgba(11, 11, 11, 0.10)",
        glow: "0 12px 40px -8px rgba(239, 49, 36, 0.40)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
