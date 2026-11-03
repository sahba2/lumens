import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#0d0d10",
          card: "#111116",
          line: "#1d1d24",
        },
        gold: {
          DEFAULT: "#d4af37",
          light: "#f2e2a8",
          deep: "#8a6b18",
        },
        sand: {
          DEFAULT: "#c8bda3",
          dim: "#8a8375",
        },
      },
      fontFamily: {
        sans: [
          "Vazirmatn",
          "IRANSansX",
          "IRANSans",
          "system-ui",
          "Segoe UI",
          "Tahoma",
          "sans-serif",
        ],
        display: [
          "Vazirmatn",
          "IRANSansX",
          "system-ui",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(212,175,55,0.35), 0 24px 70px -28px rgba(212,175,55,0.55)",
        "glow-sm":
          "0 0 0 1px rgba(212,175,55,0.22), 0 14px 40px -22px rgba(212,175,55,0.5)",
        card: "0 30px 70px -40px rgba(0,0,0,0.95)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "radial-gold":
          "radial-gradient(60% 60% at 50% 0%, rgba(216,180,90,0.18) 0%, rgba(216,180,90,0) 70%)",
        "radial-fade":
          "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)",
        sheen:
          "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(216,180,90,0.7), transparent)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(3deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-28px,0) scale(1.06)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-120%)" },
          "100%": { transform: "translateX(220%)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.08)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "grid-drift": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "80px 80px" },
        },
      },
      animation: {
        float: "float 9s ease-in-out infinite",
        "float-slow": "float-slow 14s ease-in-out infinite",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 6s ease-in-out infinite",
        "spin-slow": "spin-slow 26s linear infinite",
        marquee: "marquee 38s linear infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "grid-drift": "grid-drift 24s linear infinite",
      },
      transitionTimingFunction: {
        cinema: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
