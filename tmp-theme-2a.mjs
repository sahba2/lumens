import { readFileSync, writeFileSync } from "node:fs";

const file = "app/globals.css";
let s = readFileSync(file, "utf8").replace(/\r\n/g, "\n");

function rep(from, to) {
  const count = s.split(from).length - 1;
  if (count !== 1) throw new Error("expected 1, found " + count + " :: " + from.slice(0, 80).replace(/\n/g, "\\n"));
  s = s.split(from).join(to);
}

rep(`  :root {
    color-scheme: dark;
    --lumens-gold: 212 175 55;
    --lumens-ink: 10 10 10;
  }`, `  :root {
    color-scheme: dark;
    --lumens-gold: 199 168 91;
    --lumens-ink: 33 36 41;
    --lumens-surface: 44 48 56;
    --lumens-elevated: 52 56 65;
    --lumens-border: 64 70 82;
    --lumens-bone: 247 244 238;
    --lumens-muted: 168 173 184;
  }`);

rep(`  body {
    @apply bg-ink text-zinc-300 antialiased;
    background-image:
      radial-gradient(900px 520px at 78% -8%, rgba(212, 175, 55, 0.1), transparent 65%),
      radial-gradient(760px 460px at 12% 6%, rgba(120, 150, 255, 0.06), transparent 62%),
      linear-gradient(180deg, #0a0a0a 0%, #0a0a0a 55%, #08080a 100%);`, `  body {
    @apply bg-lumens-bg text-lumens-muted antialiased;
    background-image:
      radial-gradient(1100px 620px at 85% -10%, rgba(199, 168, 91, 0.14), transparent 65%),
      radial-gradient(900px 540px at 8% 104%, rgba(199, 168, 91, 0.1), transparent 70%),
      linear-gradient(180deg, #24272D 0%, #212429 55%, #1B1E23 100%);`);

rep(`  html {
    background-color: #0a0a0a;
  }`, `  html {
    background-color: #212429;
  }`);

rep(`    @apply font-display text-white;`, `    @apply font-display text-lumens-bone;`);

rep(`    background: rgba(212, 175, 55, 0.28);
    color: #fff;`, `    background: rgba(199, 168, 91, 0.3);
    color: #F7F4EE;`);

rep(`    scrollbar-color: rgba(212, 175, 55, 0.35) transparent;`, `    scrollbar-color: rgba(199, 168, 91, 0.35) transparent;`);

rep(`  ::-webkit-scrollbar-track {
    background: #0a0a0a;
  }`, `  ::-webkit-scrollbar-track {
    background: #1B1E23;
  }`);

rep(`    background: linear-gradient(180deg, rgba(212, 175, 55, 0.55), rgba(138, 107, 24, 0.55));
    border-radius: 999px;
    border: 2px solid #0a0a0a;`, `    background: linear-gradient(180deg, rgba(199, 168, 91, 0.55), rgba(143, 119, 56, 0.55));
    border-radius: 999px;
    border: 2px solid #1B1E23;`);

rep(`    background: linear-gradient(180deg, rgba(242, 226, 168, 0.8), rgba(212, 175, 55, 0.8));`, `    background: linear-gradient(180deg, rgba(227, 205, 154, 0.8), rgba(199, 168, 91, 0.8));`);

rep(`    outline: 2px solid rgba(212, 175, 55, 0.75);`, `    outline: 2px solid rgba(199, 168, 91, 0.8);`);

rep(`  .glass {
    @apply border border-white/10 bg-white/[0.035] backdrop-blur-xl;
  }

  .glass-strong {
    @apply border border-white/15 bg-white/[0.06] backdrop-blur-2xl;
  }`, `  .glass {
    @apply border border-lumens-border/80 bg-lumens-surface/60 backdrop-blur-xl;
    box-shadow: inset 0 1px 0 rgba(247, 244, 238, 0.05);
  }

  .glass-strong {
    @apply border border-lumens-border bg-lumens-elevated/85 backdrop-blur-2xl;
  }`);

rep(`    @apply rounded-xl2 border border-white/10 bg-white/[0.03] backdrop-blur-xl;
    transition:
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.4s ease,
      box-shadow 0.55s ease,
      background-color 0.4s ease;`, `    @apply rounded-xl2 border border-lumens-border bg-lumens-surface/65 backdrop-blur-xl;
    box-shadow: inset 0 1px 0 rgba(247, 244, 238, 0.05);
    transition:
      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
      border-color 0.4s ease,
      box-shadow 0.55s ease,
      background-color 0.4s ease;`);

rep(`  .glow-card:hover {
    @apply -translate-y-1.5 border-gold/30;
    box-shadow: 0 30px 80px -40px rgba(212, 175, 55, 0.75);
  }`, `  .glow-card:hover {
    @apply -translate-y-1.5 border-lumens-sand/60;
    box-shadow:
      0 30px 80px -40px rgba(199, 168, 91, 0.55),
      inset 0 0 0 1px rgba(199, 168, 91, 0.14),
      inset 0 1px 0 rgba(247, 244, 238, 0.08);
  }`);

rep(`  .btn-ghost {
    @apply btn border border-white/15 bg-white/[0.04] text-zinc-100 backdrop-blur-xl hover:border-gold/45 hover:bg-white/[0.08] hover:text-white;
  }`, `  .btn-ghost {
    @apply btn border border-lumens-border bg-lumens-elevated/60 text-lumens-bone backdrop-blur-xl hover:border-gold/45 hover:bg-lumens-elevated/90 hover:text-lumens-bone;
  }`);

rep(`  .chip {
    @apply inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400 backdrop-blur-md;
  }`, `  .chip {
    @apply inline-flex items-center gap-1.5 rounded-full border border-lumens-border bg-lumens-elevated/60 px-3 py-1 text-[11px] font-medium text-lumens-muted backdrop-blur-md;
  }`);

rep(`    @apply relative shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-xs font-semibold text-zinc-400 transition-all duration-300 hover:border-gold/40 hover:text-white sm:text-sm;`, `    @apply relative shrink-0 rounded-full border border-lumens-border bg-lumens-elevated/55 px-5 py-2.5 text-xs font-semibold text-lumens-muted transition-all duration-300 hover:border-gold/40 hover:text-lumens-bone sm:text-sm;`);

rep(`    @apply w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-500 backdrop-blur-xl transition-colors duration-300 focus:border-gold/50 focus:bg-white/[0.06] focus:outline-none;`, `    @apply w-full rounded-2xl border border-lumens-border bg-lumens-elevated/60 px-4 py-3 text-sm text-lumens-bone placeholder:text-lumens-dim backdrop-blur-xl transition-colors duration-300 focus:border-gold/50 focus:bg-lumens-elevated/90 focus:outline-none;`);

rep(`  .section-title {
    @apply text-3xl font-extrabold leading-[1.4] sm:text-4xl lg:text-[2.6rem];
  }`, `  .section-title {
    @apply text-3xl font-extrabold leading-[1.4] text-lumens-bone sm:text-4xl lg:text-[2.6rem];
  }`);

rep(`    @apply h-px w-full bg-gradient-to-l from-transparent via-white/15 to-transparent;`, `    @apply h-px w-full bg-gradient-to-l from-transparent via-lumens-border to-transparent;`);

rep(`  .render-frame {
    @apply relative overflow-hidden rounded-2xl border border-white/10 bg-ink-soft;
  }`, `  .render-frame {
    @apply relative overflow-hidden rounded-2xl border border-lumens-border bg-lumens-bg;
  }`);

writeFileSync(file, s.replace(/\n/g, "\r\n"), "utf8");
console.log("globals.css pass 2a done");
