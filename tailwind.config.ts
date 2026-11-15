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
        // Legacy keys remapped to the warm dark-taupe scale.
        ink: {
          DEFAULT: "#212429",
          soft: "#1C1E23",
          card: "#2C3038",
          line: "#48433A",
        },
        gold: {
          DEFAULT: "#C7A85B",
          light: "#E3CD9A",
          deep: "#8F7738",
        },
        sand: {
          DEFAULT: "#C5B49E",
          dim: "#8A8375",
        },

        // Official LUMENS design tokens (prefer these in new components).
        lumens: {
          bg: "#212429",
          bgDeep: "#1C1E23",
          surface: "#2C3038",
          elevated: "#343841",
          border: "#48433A",
          borderSoft: "#3A372F",
          sand: "#C7A85B",
          bone: "#F7F4EE",
          muted: "#B0AAA0",
          dim: "#8A857B",
        },

        // Sharper type contrast without editing every component.
        zinc: {
          300: "#D6D1C7",
          400: "#B3ADA2",
          500: "#8C877D",
          600: "#716C63",
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
        glow: "0 0 0 1px rgba(199,168,91,0.35), 0 24px 70px -28px rgba(199,168,91,0.55)",
        "glow-sm":
          "0 0 0 1px rgba(199,168,91,0.22), 0 14px 40px -22px rgba(199,168,91,0.5)",
        card: "0 32px 72px -46px rgba(9,8,6,0.94)",
        "card-warm":
          "inset 0 1px 0 rgba(247,244,238,0.055), 0 28px 60px -44px rgba(9,8,6,0.96)",
        "inner-glow":
          "inset 0 1px 0 rgba(247,244,238,0.06), inset 0 0 0 1px rgba(199,168,91,0.08)",
        inset: "inset 0 1px 0 0 rgba(247,244,238,0.06)",
      },
      backgroundImage: {
        "radial-gold":
          "radial-gradient(60% 60% at 50% 0%, rgba(199,168,91,0.20) 0%, rgba(199,168,91,0) 70%)",
        "hero-aurora":
          "radial-gradient(52% 62% at 20% 100%, rgba(199,168,91,0.30), transparent 72%), radial-gradient(44% 56% at 86% 92%, rgba(199,168,91,0.18), transparent 74%)",
        "radial-fade":
          "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)",
        "band-warm":
          "linear-gradient(180deg, rgba(48,51,58,0.5) 0%, rgba(36,38,42,0.12) 44%, rgba(33,36,41,0) 100%)",
        sheen:
          "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)",
        "gold-line":
          "linear-gradient(90deg, transparent, rgba(199,168,91,0.7), transparent)",
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
        card: "12px",
        button: "8px",
        badge: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
