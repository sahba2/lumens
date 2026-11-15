import { readFileSync, writeFileSync } from "node:fs";

const file = "tailwind.config.ts";
let s = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
const before = s;

function rep(from, to) {
  const count = s.split(from).length - 1;
  if (count !== 1) throw new Error("expected 1 match, found " + count + " for: " + from.slice(0, 70));
  s = s.split(from).join(to);
}

rep(`      colors: {
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
      },`, `      colors: {
        // Legacy keys remapped to the warm dark-taupe scale.
        ink: {
          DEFAULT: "#212429",
          soft: "#1B1E23",
          card: "#2C3038",
          line: "#404652",
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
          surface: "#2C3038",
          elevated: "#343841",
          border: "#404652",
          sand: "#C7A85B",
          bone: "#F7F4EE",
          muted: "#A8ADB8",
          dim: "#7C8592",
        },

        // Sharper type contrast without editing every component.
        zinc: {
          300: "#C9CDD4",
          400: "#A8ADB8",
          500: "#7C8592",
        },
      },`);

rep(`      boxShadow: {
        glow: "0 0 0 1px rgba(212,175,55,0.35), 0 24px 70px -28px rgba(212,175,55,0.55)",
        "glow-sm":
          "0 0 0 1px rgba(212,175,55,0.22), 0 14px 40px -22px rgba(212,175,55,0.5)",
        card: "0 30px 70px -40px rgba(0,0,0,0.95)",
        inset: "inset 0 1px 0 0 rgba(255,255,255,0.06)",
      },`, `      boxShadow: {
        glow: "0 0 0 1px rgba(199,168,91,0.35), 0 24px 70px -28px rgba(199,168,91,0.55)",
        "glow-sm":
          "0 0 0 1px rgba(199,168,91,0.22), 0 14px 40px -22px rgba(199,168,91,0.5)",
        card: "0 30px 70px -40px rgba(0,0,0,0.85)",
        "inner-glow":
          "inset 0 1px 0 rgba(247,244,238,0.06), inset 0 0 0 1px rgba(199,168,91,0.08)",
        inset: "inset 0 1px 0 0 rgba(247,244,238,0.06)",
      },`);

rep(`      backgroundImage: {
        "radial-gold":
          "radial-gradient(60% 60% at 50% 0%, rgba(216,180,90,0.18) 0%, rgba(216,180,90,0) 70%)",`, `      backgroundImage: {
        "radial-gold":
          "radial-gradient(60% 60% at 50% 0%, rgba(199,168,91,0.20) 0%, rgba(199,168,91,0) 70%)",
        "hero-aurora":
          "radial-gradient(52% 62% at 20% 100%, rgba(199,168,91,0.30), transparent 72%), radial-gradient(44% 56% at 86% 92%, rgba(199,168,91,0.18), transparent 74%)",`);

rep(`        "gold-line":
          "linear-gradient(90deg, transparent, rgba(216,180,90,0.7), transparent)",`, `        "gold-line":
          "linear-gradient(90deg, transparent, rgba(199,168,91,0.7), transparent)",`);

rep(`      borderRadius: {
        xl2: "1.75rem",
      },`, `      borderRadius: {
        xl2: "1.75rem",
        card: "12px",
        button: "8px",
        badge: "6px",
      },`);

if (s === before) throw new Error("no changes applied");
writeFileSync(file, s.replace(/\n/g, "\r\n"), "utf8");
console.log("tailwind.config.ts updated");
