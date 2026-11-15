import { readFileSync, writeFileSync } from "node:fs";

function load(f) { return readFileSync(f, "utf8").replace(/\r\n/g, "\n"); }
function save(f, s) { writeFileSync(f, s.replace(/\n/g, "\r\n"), "utf8"); console.log("updated " + f); }
function rep(s, from, to, expected) {
  const count = s.split(from).length - 1;
  if (expected != null && count !== expected) throw new Error("expected " + expected + ", found " + count + " :: " + from.slice(0, 80));
  if (count === 0) throw new Error("missing :: " + from.slice(0, 80));
  return s.split(from).join(to);
}

let f = "app/layout.tsx";
let s = load(f);
s = rep(s, `themeColor: "#0a0a0a",`, `themeColor: "#212429",`, 1);
s = rep(s, `bg-neutral-950 text-neutral-100 antialiased`, `bg-lumens-bg text-lumens-muted antialiased`, 1);
save(f, s);

f = "app/global-error.tsx";
s = load(f);
s = rep(s, `bg-neutral-950 text-neutral-100 antialiased`, `bg-lumens-bg text-lumens-muted antialiased`, 1);
s = rep(s, `border-white/10 bg-black/40 px-4 py-3 text-left text-[11px] leading-6 text-zinc-500`, `border-lumens-border bg-[#171A1E]/70 px-4 py-3 text-left text-[11px] leading-6 text-lumens-dim`, 1);
save(f, s);

f = "app/error.tsx";
s = load(f);
s = rep(s, `border-white/10 bg-black/40 px-4 py-3 text-left text-[11px] leading-6 text-zinc-500`, `border-lumens-border bg-[#171A1E]/70 px-4 py-3 text-left text-[11px] leading-6 text-lumens-dim`, 1);
save(f, s);

f = "app/(lumens)/page.tsx";
s = load(f);
s = rep(s, `        <CinematicBackdrop />
`, `        <CinematicBackdrop />
        <div className="hero-aurora" aria-hidden="true" />
`, 1);
s = rep(s, `text-[1.9rem] font-black leading-[1.45] text-white`, `text-[1.9rem] font-black leading-[1.45] text-lumens-bone`, 1);
s = rep(s, `text-[0.52em] font-extrabold leading-[1.7] text-zinc-300`, `text-[0.52em] font-extrabold leading-[1.7] text-lumens-bone/85`, 1);
save(f, s);

f = "components/CinematicBackdrop.tsx";
s = load(f);
s = rep(s, `rgba(212,175,55,0.24)`, `rgba(199,168,91,0.24)`);
s = rep(s, `rgba(104,116,196,0.18)`, `rgba(120,130,150,0.16)`);
s = rep(s, `linear-gradient(180deg,#0a0a0a_0%,#0b0a09_46%,#070708_100%)`, `linear-gradient(180deg,#24272D_0%,#212429_46%,#1B1E23_100%)`);
for (const [from, to] of [[`#f2e2a8`, `#E3CD9A`], [`#d4af37`, `#C7A85B`], [`#0c0c11`, `#1E2126`], [`#050507`, `#171A1E`]]) {
  const c = s.split(from).length - 1;
  s = s.split(from).join(to);
  console.log(c + " x " + from + " -> " + to + " (CinematicBackdrop)");
}
save(f, s);

f = "components/engine/ArchitecturalBoard.tsx";
s = load(f);
s = rep(s, `border-[#262626] bg-[#0a0a0a]`, `border-lumens-border bg-lumens-surface`, 1);
s = rep(s, `"relative bg-black"`, `"relative bg-[#1B1E23]"`, 1);
s = rep(s, `bg-black/60`, `bg-[#171A1E]/70`, 2);
s = rep(s, `border-[#262626]`, `border-lumens-border`, 3);
s = rep(s, `bg-black/95`, `bg-[#14161A]/95`, 1);
save(f, s);

f = "components/landing/CompareSlider.tsx";
s = load(f);
console.log("CompareSlider #0d0d12 count = " + (s.split("#0d0d12").length - 1));
s = s.split("#0d0d12").join("#212429");
save(f, s);
