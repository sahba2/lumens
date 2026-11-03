"use client";

import { useEffect, useState } from "react";

import { toPersianDigits } from "@/lib/data";

import { IconBolt, IconSparkles } from "../Icons";
import ArchitecturalLoop, { type ArchitecturalMode } from "./ArchitecturalLoop";

const promptSample =
  "monolithic concrete pavilion, perforated brass screen, reflecting pool, golden hour, 35mm lens, cinematic, ultra realistic --ar 16:9";

const modes: Array<{ id: ArchitecturalMode; label: string; hint: string }> = [
  { id: "gold", label: "نور طلایی", hint: "Golden hour" },
  { id: "night", label: "شب", hint: "Blue hour" },
  { id: "studio", label: "استودیو", hint: "Clay render" },
];

/**
 * Cinematic hero stage: a live 3D architectural loop, a typewriter prompt and
 * a render-progress HUD. All timers start from deterministic values, so the
 * server markup and the first client render always match.
 */
export default function HeroShowcase() {
  const [mode, setMode] = useState<ArchitecturalMode>("gold");
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let index = 0;
    const typing = window.setInterval(() => {
      index = index > promptSample.length ? 0 : index + 1;
      setTyped(promptSample.slice(0, index));
    }, 48);
    return () => window.clearInterval(typing);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 5));
    }, 120);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <div id="showcase" className="relative scroll-mt-[100px]">
      <div className="orb -right-12 -top-12 h-64 w-64 bg-gold/15" />
      <div className="orb -bottom-16 -left-10 h-64 w-64 bg-teal-400/10" />

      <div className="glass-card relative overflow-hidden p-3 sm:p-4">
        <div className="arch-frame relative overflow-hidden rounded-[1.35rem] border border-white/10">
          <ArchitecturalLoop mode={mode} className="aspect-[4/3.1] w-full" />

          {/* Live status chips */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-center justify-between gap-2">
            <span className="chip border-teal-300/35 bg-ink/75 text-teal-200 shadow-[0_0_24px_-8px_rgba(45,212,191,0.8)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-300" />
              </span>
              LIVE 3D LOOP
            </span>
            <span className="chip border-gold/25 bg-ink/75 text-gold-light">
              <IconSparkles className="h-3 w-3" />
              SCENE AI
            </span>
          </div>

          {/* Prompt + render HUD */}
          <div className="absolute inset-x-3 bottom-3 z-20">
            <div className="mb-2 flex flex-wrap items-center justify-end gap-1.5">
              {modes.map((item) => {
                const active = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    aria-pressed={active}
                    title={item.hint}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all duration-300 ${
                      active
                        ? "border-gold/55 bg-gold/15 text-gold-light shadow-glow-sm"
                        : "border-white/10 bg-ink/65 text-zinc-400 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                        active ? "bg-gold" : "bg-white/30"
                      }`}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="glass-strong rounded-2xl px-3 py-3 sm:px-4">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-widest2 text-zinc-400">
                  <IconBolt className="h-3.5 w-3.5 text-gold" />
                  PROMPT · LIVE
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gold-light tabular-nums">
                  {toPersianDigits(8)}s
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  SDXL TURBO
                </span>
              </div>

              <p
                dir="ltr"
                className="mt-2 h-10 overflow-hidden text-left font-mono text-[10px] leading-5 text-emerald-200/90 sm:text-[11px]"
              >
                {typed}
                <span className="ml-0.5 inline-block h-3 w-1 animate-pulse-glow bg-gold align-middle" />
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] text-zinc-500">رندر بلادرنگ</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full bg-gradient-to-l from-gold-light via-gold to-gold-deep transition-[width] duration-150 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </span>
                <span className="min-w-[3.5rem] text-left text-[10px] font-bold text-gold-light tabular-nums">
                  {progress === 100 ? "آماده" : `${toPersianDigits(Math.round(progress))}٪`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
