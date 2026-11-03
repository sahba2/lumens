/**
 * LUMENS - static image asset generator
 * -------------------------------------
 * Produces the abstract "architectural render" artwork used across the site.
 * Assets are plain SVG files written to /public so that every <Image /> from
 * next/image can optimise, lazy-load and size them properly.
 *
 * Run:  node scripts/generate-assets.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const W = 1200;
const H = 800;

["public/renders", "public/covers", "public/articles", "public/og"].forEach((dir) =>
  mkdirSync(join(ROOT, dir), { recursive: true }),
);

/* ------------------------------------------------------------------ */
/*  Deterministic pseudo random generator (stable output every run)    */
/* ------------------------------------------------------------------ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = (r, min, max) => min + r() * (max - min);
const rint = (r, min, max) => Math.floor(rnd(r, min, max + 1));
const round = (n) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ */
/*  Shared SVG building blocks                                         */
/* ------------------------------------------------------------------ */
const grain = `
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" />
    <feColorMatrix type="saturate" values="0" />
  </filter>`;

const vignette = `
  <radialGradient id="vignette" cx="50%" cy="45%" r="75%">
    <stop offset="0%" stop-color="#000" stop-opacity="0" />
    <stop offset="70%" stop-color="#000" stop-opacity="0.25" />
    <stop offset="100%" stop-color="#000" stop-opacity="0.72" />
  </radialGradient>`;

function frame(inner, defs, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${label}">
  <defs>${defs}${grain}${vignette}</defs>
  <rect width="${W}" height="${H}" fill="#0a0a0a" />
${inner}
  <rect width="${W}" height="${H}" fill="url(#vignette)" />
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.05" />
  <g opacity="0.5">
    <rect x="48" y="48" width="34" height="2" fill="#d4af37" opacity="0.7" />
    <text x="94" y="55" font-family="Verdana, sans-serif" font-size="17" letter-spacing="6" fill="#d4af37" opacity="0.85">LUMENS</text>
  </g>
</svg>
`;
}

/** Randomised window grid used for building facades. */
function windowGrid(r, x, y, w, h, cols, rows, tone, lit = 0.35) {
  const cw = w / cols;
  const ch = h / rows;
  let out = "";
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      const on = r() < lit;
      const op = on ? round(rnd(r, 0.35, 0.85)) : round(rnd(r, 0.04, 0.1));
      const fill = on ? tone : "#ffffff";
      out += `<rect x="${round(x + i * cw + cw * 0.18)}" y="${round(y + j * ch + ch * 0.22)}" width="${round(cw * 0.64)}" height="${round(ch * 0.5)}" fill="${fill}" opacity="${op}" />`;
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Archetype 1 - exterior / urban scene                               */
/* ------------------------------------------------------------------ */
function exteriorArt(seed, accent) {
  const r = mulberry32(seed);
  const horizon = rnd(r, 520, 590);
  const sunX = rnd(r, 700, 1050);

  const defs = `
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#06080f" />
    <stop offset="42%" stop-color="#101728" />
    <stop offset="76%" stop-color="#33271a" />
    <stop offset="100%" stop-color="#6b4b20" />
  </linearGradient>
  <radialGradient id="sun" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#f2e2a8" stop-opacity="0.9" />
    <stop offset="30%" stop-color="${accent}" stop-opacity="0.35" />
    <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
  </radialGradient>
  <linearGradient id="bldA" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#1b1e27" />
    <stop offset="100%" stop-color="#0b0c11" />
  </linearGradient>
  <linearGradient id="bldB" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#242833" />
    <stop offset="100%" stop-color="#0e0f14" />
  </linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#15161c" />
    <stop offset="100%" stop-color="#05060a" />
  </linearGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#f2e2a8" stop-opacity="0.18" />
    <stop offset="100%" stop-color="#f2e2a8" stop-opacity="0" />
  </linearGradient>`;

  let body = `  <rect width="${W}" height="${H}" fill="url(#sky)" />
  <ellipse cx="${round(sunX)}" cy="${round(horizon - 60)}" rx="380" ry="300" fill="url(#sun)" />`;

  let x = -40;
  while (x < W + 40) {
    const w = rnd(r, 90, 190);
    const h = rnd(r, 90, 230);
    body += `  <rect x="${round(x)}" y="${round(horizon - h)}" width="${round(w)}" height="${round(h + 40)}" fill="url(#bldA)" opacity="0.75" />\n`;
    x += w + rnd(r, 6, 26);
  }

  const masses = rint(r, 3, 4);
  let mx = rnd(r, 60, 180);
  for (let i = 0; i < masses; i += 1) {
    const w = rnd(r, 170, 300);
    const h = rnd(r, 200, 420);
    const top = horizon - h;
    const tilt = rnd(r, -14, 14);
    body += `  <g transform="translate(${round(mx)} ${round(top)}) rotate(${round(tilt)} 20 40)">
    <rect width="${round(w)}" height="${round(h + 30)}" fill="url(#bldB)" />
    <rect x="0" y="0" width="${round(w)}" height="3" fill="${accent}" opacity="0.5" />
${windowGrid(r, 14, 18, w - 28, h - 46, rint(r, 4, 7), rint(r, 6, 12), "#f2e2a8", rnd(r, 0.25, 0.5))}
  </g>\n`;
    mx += w + rnd(r, 40, 130);
    if (mx > W - 120) break;
  }

  body += `  <rect x="0" y="${round(horizon)}" width="${W}" height="${round(H - horizon)}" fill="url(#ground)" />
  <rect x="0" y="${round(horizon - 2)}" width="${W}" height="2" fill="${accent}" opacity="0.35" />
  <rect x="${round(rnd(r, 40, 200))}" y="${round(horizon - 90)}" width="${round(rnd(r, 240, 420))}" height="90" fill="#101218" opacity="0.95" />
  <rect x="${round(rnd(r, 620, 900))}" y="${round(horizon - 60)}" width="${round(rnd(r, 200, 340))}" height="60" fill="#0d0f14" opacity="0.95" />
  <ellipse cx="${round(sunX)}" cy="${round(horizon + 90)}" rx="300" ry="70" fill="${accent}" opacity="0.1" />
  <rect x="0" y="${round(horizon)}" width="${W}" height="90" fill="url(#haze)" />
  <path d="M0 ${round(horizon + 30)} L${W} ${round(horizon + 12)}" stroke="#ffffff" stroke-opacity="0.06" stroke-width="1" />`;

  return frame(body, defs, "LUMENS exterior architectural render");
}

/* ------------------------------------------------------------------ */
/*  Archetype 2 - interior scene                                       */
/* ------------------------------------------------------------------ */
function interiorArt(seed, accent) {
  const r = mulberry32(seed);
  const floorY = rnd(r, 500, 560);
  const winX = rnd(r, 620, 760);
  const winW = rnd(r, 300, 400);

  const defs = `
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#14151b" />
    <stop offset="100%" stop-color="#0b0c10" />
  </linearGradient>
  <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#191410" />
    <stop offset="100%" stop-color="#07070a" />
  </linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#f2e2a8" stop-opacity="0.4" />
    <stop offset="100%" stop-color="#f2e2a8" stop-opacity="0" />
  </linearGradient>
  <linearGradient id="warm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.5" />
    <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
  </linearGradient>`;

  let body = `  <rect width="${W}" height="${H}" fill="url(#wall)" />
  <rect x="0" y="${round(floorY)}" width="${W}" height="${round(H - floorY)}" fill="url(#floor)" />`;

  for (let i = 0; i < 14; i += 1) {
    const y = 70 + i * rnd(r, 12, 18);
    body += `  <rect x="0" y="${round(y)}" width="${W}" height="1.5" fill="#ffffff" opacity="${round(rnd(r, 0.02, 0.07))}" />\n`;
  }

  body += `  <rect x="${round(winX)}" y="150" width="${round(winW)}" height="${round(floorY - 150)}" fill="#f2e2a8" opacity="0.14" />
  <rect x="${round(winX)}" y="150" width="${round(winW)}" height="${round(floorY - 150)}" fill="none" stroke="#f2e2a8" stroke-opacity="0.45" stroke-width="2" />
  <rect x="${round(winX + winW / 2 - 1)}" y="150" width="2" height="${round(floorY - 150)}" fill="#0a0a0a" opacity="0.6" />
  <polygon points="${round(winX)} ${round(floorY)} ${round(winX + winW)} ${round(floorY)} ${round(winX + winW - 210)} ${round(H - 30)} ${round(winX - 260)} ${round(H - 30)}" fill="url(#beam)" />
  <ellipse cx="${round(winX + winW / 2 - 60)}" cy="${round(floorY + 90)}" rx="300" ry="60" fill="url(#warm)" opacity="0.7" />`;

  const sofaX = rnd(r, 120, 300);
  const sofaW = rnd(r, 320, 420);
  body += `  <rect x="${round(sofaX)}" y="${round(floorY - 96)}" width="${round(sofaW)}" height="86" rx="16" fill="#16171d" />
  <rect x="${round(sofaX + 16)}" y="${round(floorY - 132)}" width="${round(sofaW - 32)}" height="44" rx="14" fill="#1d1f27" />
  <rect x="${round(sofaX)}" y="${round(floorY - 12)}" width="${round(sofaW)}" height="8" rx="4" fill="#0d0e12" />
  <rect x="${round(sofaX + 40)}" y="${round(floorY - 150)}" width="70" height="70" rx="10" fill="${accent}" opacity="0.16" />
  <ellipse cx="${round(sofaX + sofaW / 2 + 40)}" cy="${round(floorY + 130)}" rx="220" ry="42" fill="#ffffff" opacity="0.045" />
  <rect x="${round(sofaX + sofaW / 2 - 90)}" y="${round(floorY + 40)}" width="190" height="14" rx="7" fill="#22242c" />
  <rect x="${round(sofaX + sofaW / 2 - 70)}" y="${round(floorY + 54)}" width="10" height="34" fill="#171921" />
  <rect x="${round(sofaX + sofaW / 2 + 40)}" y="${round(floorY + 54)}" width="10" height="34" fill="#171921" />
  <rect x="${round(sofaX + 470)}" y="${round(floorY - 210)}" width="4" height="210" fill="${accent}" opacity="0.35" />
  <circle cx="${round(sofaX + 472)}" cy="${round(floorY - 214)}" r="18" fill="${accent}" opacity="0.28" />`;

  return frame(body, defs, "LUMENS interior architectural render");
}

/* ------------------------------------------------------------------ */
/*  Archetype 3 - furniture / object studio shot                       */
/* ------------------------------------------------------------------ */
function furnitureArt(seed, accent, variant = 0) {
  const r = mulberry32(seed);
  const baseY = rnd(r, 540, 600);
  const cx = rnd(r, 520, 680);
  const scale = rnd(r, 0.92, 1.12);

  const defs = `
  <radialGradient id="studio" cx="50%" cy="35%" r="70%">
    <stop offset="0%" stop-color="#23252e" />
    <stop offset="55%" stop-color="#121319" />
    <stop offset="100%" stop-color="#07070a" />
  </radialGradient>
  <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2a2d37" />
    <stop offset="100%" stop-color="#101116" />
  </linearGradient>
  <linearGradient id="cushion" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#3a3e4a" />
    <stop offset="100%" stop-color="#181a21" />
  </linearGradient>
  <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#15161c" />
    <stop offset="100%" stop-color="#08080b" />
  </linearGradient>
  <radialGradient id="spot" cx="50%" cy="20%" r="55%">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.22" />
    <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
  </radialGradient>`;

  let body = `  <rect width="${W}" height="${H}" fill="url(#studio)" />
  <ellipse cx="${W / 2}" cy="200" rx="620" ry="330" fill="url(#spot)" />
  <rect x="0" y="${round(baseY + 40)}" width="${W}" height="${round(H - baseY - 40)}" fill="url(#floorG)" />
  <ellipse cx="${round(cx)}" cy="${round(baseY + 46)}" rx="${round(300 * scale)}" ry="34" fill="#000000" opacity="0.55" />`;

  if (variant % 3 === 0) {
    // sofa
    const w = 460 * scale;
    const h = 130 * scale;
    const x = cx - w / 2;
    body += `  <g transform="translate(${round(x)} ${round(baseY - h)})">
    <rect width="${round(w)}" height="${round(h * 0.62)}" rx="22" fill="url(#cushion)" />
    <rect x="${round(w * 0.06)}" y="${round(-h * 0.5)}" width="${round(w * 0.88)}" height="${round(h * 0.5)}" rx="18" fill="url(#body)" />
    <rect x="${round(w * 0.12)}" y="${round(h * 0.12)}" width="${round(w * 0.34)}" height="${round(h * 0.34)}" rx="12" fill="#22252e" />
    <rect x="${round(w * 0.54)}" y="${round(h * 0.12)}" width="${round(w * 0.34)}" height="${round(h * 0.34)}" rx="12" fill="#22252e" />
    <rect x="0" y="${round(h * 0.62)}" width="${round(w)}" height="9" rx="4" fill="#0c0d11" />
    <rect x="${round(w * 0.08)}" y="${round(-h * 0.46)}" width="${round(w * 0.84)}" height="3" fill="${accent}" opacity="0.5" />
  </g>`;
  } else if (variant % 3 === 1) {
    // chair
    const w = 240 * scale;
    const h = 330 * scale;
    const x = cx - w / 2;
    body += `  <g transform="translate(${round(x)} ${round(baseY - h)})">
    <path d="M0 ${round(h)} L${round(w)} ${round(h)} L${round(w * 0.86)} ${round(h * 0.42)} L${round(w * 0.14)} ${round(h * 0.42)} Z" fill="url(#body)" />
    <rect x="${round(w * 0.08)}" y="${round(h * 0.24)}" width="${round(w * 0.84)}" height="${round(h * 0.22)}" rx="10" fill="url(#cushion)" />
    <path d="M${round(w * 0.12)} ${round(h * 0.2)} L${round(w * 0.2)} 0 L${round(w * 0.8)} 0 L${round(w * 0.88)} ${round(h * 0.2)} Z" fill="url(#cushion)" />
    <rect x="${round(w * 0.16)}" y="${round(h)}" width="12" height="0" fill="none" />
    <path d="M${round(w * 0.2)} ${round(h)} L${round(w * 0.26)} ${round(h * 0.1)}" stroke="#0c0d11" stroke-width="10" />
    <path d="M${round(w * 0.8)} ${round(h)} L${round(w * 0.74)} ${round(h * 0.1)}" stroke="#0c0d11" stroke-width="10" />
    <rect x="${round(w * 0.16)}" y="2" width="${round(w * 0.68)}" height="3" fill="${accent}" opacity="0.55" />
  </g>`;
  } else {
    // table + lamp
    const w = 420 * scale;
    const h = 150 * scale;
    const x = cx - w / 2;
    body += `  <g transform="translate(${round(x)} ${round(baseY - h)})">
    <rect width="${round(w)}" height="14" rx="7" fill="url(#cushion)" />
    <rect x="${round(w * 0.5 - 6)}" y="14" width="12" height="${round(h - 14)}" fill="#1b1d24" />
    <ellipse cx="${round(w * 0.5)}" cy="${round(h)}" rx="${round(w * 0.34)}" ry="12" fill="#15171d" />
    <rect x="${round(w * 0.18)}" y="${round(-h * 0.72)}" width="6" height="${round(h * 0.7)}" fill="${accent}" opacity="0.4" />
    <path d="M${round(w * 0.18 - 34)} ${round(-h * 0.72)} L${round(w * 0.18 + 40)} ${round(-h * 0.72)} L${round(w * 0.18 + 22)} ${round(-h * 0.72 - 46)} L${round(w * 0.18 - 16)} ${round(-h * 0.72 - 46)} Z" fill="#2b2f39" />
    <ellipse cx="${round(w * 0.18 + 3)}" cy="${round(-h * 0.72 - 44)}" rx="26" ry="10" fill="${accent}" opacity="0.35" />
    <rect x="0" y="0" width="${round(w)}" height="3" fill="${accent}" opacity="0.45" />
  </g>`;
  }

  body += `  <rect x="0" y="${round(baseY + 40)}" width="${W}" height="1.5" fill="${accent}" opacity="0.28" />
  <rect x="70" y="${round(baseY + 40)}" width="${W - 140}" height="${round(H - baseY - 40)}" fill="#000000" opacity="0.25" />`;

  return frame(body, defs, "LUMENS 3D object studio render");
}

/* ------------------------------------------------------------------ */
/*  Archetype 4 - abstract editorial composition (articles/covers)     */
/* ------------------------------------------------------------------ */
function abstractArt(seed, accent) {
  const r = mulberry32(seed);
  const cx = rnd(r, 420, 800);
  const cy = rnd(r, 320, 460);

  const defs = `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0c0d12" />
    <stop offset="60%" stop-color="#0a0a0e" />
    <stop offset="100%" stop-color="#05050a" />
  </linearGradient>
  <radialGradient id="halo" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
    <stop offset="100%" stop-color="${accent}" stop-opacity="0" />
  </radialGradient>`;

  let body = `  <rect width="${W}" height="${H}" fill="url(#bg)" />
  <ellipse cx="${round(cx)}" cy="${round(cy)}" rx="420" ry="330" fill="url(#halo)" />`;

  // thin technical grid
  for (let i = 0; i <= 12; i += 1) {
    const x = (W / 12) * i;
    body += `  <path d="M${round(x)} 0 V${H}" stroke="#ffffff" stroke-opacity="0.04" />\n`;
  }
  for (let j = 0; j <= 8; j += 1) {
    const y = (H / 8) * j;
    body += `  <path d="M0 ${round(y)} H${W}" stroke="#ffffff" stroke-opacity="0.04" />\n`;
  }

  // concentric rings
  const rings = rint(r, 4, 7);
  for (let i = 0; i < rings; i += 1) {
    const rad = rnd(r, 60, 300);
    body += `  <circle cx="${round(cx)}" cy="${round(cy)}" r="${round(rad)}" fill="none" stroke="${i % 2 === 0 ? accent : "#ffffff"}" stroke-opacity="${round(rnd(r, 0.08, 0.3))}" stroke-width="${round(rnd(r, 0.8, 2.2))}" />\n`;
  }

  // arcs
  const arcs = rint(r, 2, 4);
  for (let i = 0; i < arcs; i += 1) {
    const rad = rnd(r, 180, 420);
    const s = rnd(r, 0, Math.PI * 1.4);
    const e = s + rnd(r, 0.6, 2.2);
    const x1 = cx + rad * Math.cos(s);
    const y1 = cy + rad * Math.sin(s);
    const x2 = cx + rad * Math.cos(e);
    const y2 = cy + rad * Math.sin(e);
    body += `  <path d="M${round(x1)} ${round(y1)} A${round(rad)} ${round(rad)} 0 0 1 ${round(x2)} ${round(y2)}" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="2" />\n`;
  }

  // diagonal bars
  const bars = rint(r, 3, 6);
  for (let i = 0; i < bars; i += 1) {
    const x = rnd(r, 60, W - 200);
    const y = rnd(r, 80, H - 160);
    const w = rnd(r, 60, 260);
    const h = rnd(r, 3, 10);
    body += `  <rect x="${round(x)}" y="${round(y)}" width="${round(w)}" height="${round(h)}" fill="#ffffff" opacity="${round(rnd(r, 0.05, 0.16))}" />\n`;
  }

  // dot matrix
  const cols = rint(r, 6, 12);
  const rows = rint(r, 3, 6);
  const ox = rnd(r, 80, 320);
  const oy = rnd(r, 420, 620);
  for (let i = 0; i < cols; i += 1) {
    for (let j = 0; j < rows; j += 1) {
      body += `  <circle cx="${round(ox + i * 26)}" cy="${round(oy + j * 26)}" r="2.2" fill="${accent}" opacity="${round(rnd(r, 0.15, 0.7))}" />\n`;
    }
  }

  // solid plate
  body += `  <rect x="${round(rnd(r, 700, 860))}" y="${round(rnd(r, 120, 220))}" width="${round(rnd(r, 150, 240))}" height="${round(rnd(r, 150, 240))}" rx="18" fill="${accent}" opacity="0.12" stroke="${accent}" stroke-opacity="0.4" />`;

  return frame(body, defs, "LUMENS editorial artwork");
}

/* ------------------------------------------------------------------ */
/*  Social share image (1200x630)                                      */
/* ------------------------------------------------------------------ */
function ogArt() {
  const r = mulberry32(4242);
  const inner = `  <rect width="1200" height="630" fill="#0a0a0a" />
  <ellipse cx="900" cy="120" rx="520" ry="360" fill="#d4af37" opacity="0.14" />
  <ellipse cx="180" cy="560" rx="420" ry="280" fill="#ffffff" opacity="0.04" />
  <g opacity="0.5">
${Array.from({ length: 15 }, (_, i) => `    <path d="M${i * 80} 0 V630" stroke="#ffffff" stroke-opacity="0.05" />`).join("\n")}
${Array.from({ length: 8 }, (_, j) => `    <path d="M0 ${j * 80} H1200" stroke="#ffffff" stroke-opacity="0.05" />`).join("\n")}
  </g>
  <g transform="translate(84 96)">
    <rect x="0" y="0" width="64" height="64" rx="18" fill="#0a0a0a" stroke="#d4af37" stroke-opacity="0.6" />
    <path d="M20 46V18h6v22.4h19.6V46H20z" fill="#d4af37" />
    <circle cx="45" cy="24" r="6" fill="none" stroke="#f2e2a8" stroke-width="2.4" />
  </g>
  <text x="168" y="140" font-family="Verdana, sans-serif" font-size="30" letter-spacing="14" fill="#d4af37">LUMENS</text>
  <text x="84" y="268" font-family="Tahoma, Verdana, sans-serif" font-size="54" font-weight="bold" fill="#ffffff">معماری، فراتر از تخیل</text>
  <text x="84" y="342" font-family="Tahoma, Verdana, sans-serif" font-size="54" font-weight="bold" fill="#d4af37">با هوش مصنوعی</text>
  <rect x="84" y="392" width="220" height="3" fill="#d4af37" opacity="0.8" />
  <text x="84" y="452" font-family="Tahoma, Verdana, sans-serif" font-size="26" fill="#a1a1aa">رندرینگ لحظه‌ای · پرامپت‌نویسی معماری · آبجکت‌های سه‌بعدی</text>
  <g transform="translate(84 508)">
    <rect width="250" height="58" rx="29" fill="#d4af37" />
    <text x="125" y="37" text-anchor="middle" font-family="Tahoma, Verdana, sans-serif" font-size="21" font-weight="bold" fill="#0a0a0a">شروع یادگیری</text>
    <rect x="274" y="0" width="250" height="58" rx="29" fill="none" stroke="#ffffff" stroke-opacity="0.25" />
    <text x="399" y="37" text-anchor="middle" font-family="Tahoma, Verdana, sans-serif" font-size="21" fill="#ffffff">مشاهده آبجکت‌ها</text>
  </g>
  <g opacity="${round(rnd(r, 0.7, 0.9))}">
    <rect x="820" y="250" width="300" height="300" rx="26" fill="#d4af37" opacity="0.1" stroke="#d4af37" stroke-opacity="0.35" />
    <rect x="860" y="290" width="220" height="4" fill="#d4af37" opacity="0.5" />
    <circle cx="970" cy="400" r="76" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="2" />
    <circle cx="970" cy="400" r="44" fill="none" stroke="#d4af37" stroke-opacity="0.5" stroke-width="2" />
  </g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="LUMENS - معماری با هوش مصنوعی">
  <defs>${grain}</defs>
${inner}
  <rect width="1200" height="630" filter="url(#grain)" opacity="0.05" />
</svg>
`;
}

/* ------------------------------------------------------------------ */
/*  Build all assets                                                   */
/* ------------------------------------------------------------------ */
const GOLD = "#d4af37";
const pad = (n) => String(n).padStart(2, "0");
const written = [];

const objectPlan = [
  { kind: "furniture", seed: 1101, variant: 0 },
  { kind: "furniture", seed: 1102, variant: 1 },
  { kind: "furniture", seed: 1103, variant: 2 },
  { kind: "furniture", seed: 1104, variant: 0 },
  { kind: "interior", seed: 2101 },
  { kind: "interior", seed: 2102 },
  { kind: "interior", seed: 2103 },
  { kind: "interior", seed: 2104 },
  { kind: "exterior", seed: 3101 },
  { kind: "exterior", seed: 3102 },
  { kind: "exterior", seed: 3103 },
  { kind: "exterior", seed: 3104 },
];

const coursePlan = [
  { kind: "exterior", seed: 4101 },
  { kind: "interior", seed: 4102 },
  { kind: "exterior", seed: 4103 },
  { kind: "abstract", seed: 4104 },
  { kind: "furniture", seed: 4105, variant: 0 },
  { kind: "interior", seed: 4106 },
  { kind: "abstract", seed: 4107 },
  { kind: "exterior", seed: 4108 },
  { kind: "interior", seed: 4109 },
  { kind: "abstract", seed: 4110 },
  { kind: "exterior", seed: 4111 },
  { kind: "abstract", seed: 4112 },
  { kind: "interior", seed: 4113 },
  { kind: "exterior", seed: 4114 },
  { kind: "exterior", seed: 4115 },
  { kind: "interior", seed: 4116 },
];

const articlePlan = [
  { kind: "abstract", seed: 5101 },
  { kind: "abstract", seed: 5102 },
  { kind: "interior", seed: 5103 },
  { kind: "abstract", seed: 5104 },
  { kind: "exterior", seed: 5105 },
  { kind: "furniture", seed: 5106, variant: 1 },
  { kind: "abstract", seed: 5107 },
  { kind: "abstract", seed: 5108 },
  { kind: "exterior", seed: 5109 },
];

function renderJob(job) {
  if (job.kind === "furniture") return furnitureArt(job.seed, GOLD, job.variant ?? 0);
  if (job.kind === "interior") return interiorArt(job.seed, GOLD);
  if (job.kind === "exterior") return exteriorArt(job.seed, GOLD);
  return abstractArt(job.seed, GOLD);
}

objectPlan.forEach((job, i) => {
  const file = `object-${pad(i + 1)}.svg`;
  writeFileSync(join(ROOT, "public", "renders", file), renderJob(job));
  written.push(`renders/${file}`);
});

coursePlan.forEach((job, i) => {
  const file = `course-${pad(i + 1)}.svg`;
  writeFileSync(join(ROOT, "public", "covers", file), renderJob(job));
  written.push(`covers/${file}`);
});

articlePlan.forEach((job, i) => {
  const file = `article-${pad(i + 1)}.svg`;
  writeFileSync(join(ROOT, "public", "articles", file), renderJob(job));
  written.push(`articles/${file}`);
});

writeFileSync(join(ROOT, "public", "og", "lumens-og.svg"), ogArt());
written.push("og/lumens-og.svg");

console.log(`LUMENS assets generated: ${written.length} files`);
written.forEach((f) => console.log(`  - public/${f}`));
