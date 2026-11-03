"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { heroCollage } from "@/lib/images";
import { BLUR_DATA_URL } from "@/lib/images";
import { IconBolt, IconSparkles } from "./Icons";

const promptSample =
  "monolithic concrete villa, perforated lattice facade, golden hour, 35mm lens, ultra realistic, 8k --ar 16:9";

const frames = ["رندر پایه", "واریاسیون نور", "واریاسیون متریال", "خروجی ۴K"];

/**
 * Cinematic hero visual: rotating render collage, a live-typed prompt line
 * and a fake realtime-render progress bar. All state is client-side and
 * starts from a deterministic value, so SSR and hydration always match.
 */
export default function HeroVisual() {
  const [active, setActive] = useState(0);
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const rotate = window.setInterval(() => {
      setActive((current) => (current + 1) % heroCollage.length);
    }, 3600);
    return () => window.clearInterval(rotate);
  }, []);

  useEffect(() => {
    let index = 0;
    const typing = window.setInterval(() => {
      index += 1;
      if (index > promptSample.length) {
        index = 0;
      }
      setTyped(promptSample.slice(0, index));
    }, 55);
    return () => window.clearInterval(typing);
  }, []);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setProgress((current) => (current >= 100 ? 0 : current + 4));
    }, 90);
    return () => window.clearInterval(tick);
  }, []);

  const main = heroCollage[active];
  const thumbs = heroCollage.filter((_, index) => index !== active).slice(0, 3);

  return (
    <div className="relative">
      <div className="orb -right-10 -top-10 h-64 w-64 bg-gold/15" />
      <div className="orb -bottom-16 -left-10 h-64 w-64 bg-indigo-500/15" />

      <div className="glass-card relative overflow-hidden p-4 sm:p-5">
        <div className="render-frame relative aspect-[16/11] w-full">
          <Image
            key={main}
            src={main}
            alt="نمونه رندر هوش مصنوعی معماری در LUMENS"
            fill
            sizes="(max-width: 1024px) 100vw, 46vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority
            className="animate-fade-up object-cover"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />

          <span className="absolute right-4 top-4 chip border-gold/30 bg-ink/75 text-gold-light">
            <IconSparkles className="h-3.5 w-3.5" />
            {frames[active]}
          </span>

          <div className="absolute inset-x-4 bottom-4">
            <div className="glass-strong flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[11px] text-zinc-300">
                <IconBolt className="h-4 w-4 text-gold" />
                رندر بلادرنگ
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-l from-gold-light via-gold to-gold-deep transition-[width] duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="text-[11px] font-bold text-gold-light tabular-nums">
                {progress === 100 ? "آماده" : "در حال پردازش"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {thumbs.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(heroCollage.indexOf(image))}
              aria-label={`نمایش رندر ${index + 1}`}
              className="render-frame aspect-[4/3] transition-all duration-500 ease-cinema hover:-translate-y-1 hover:border-gold/40"
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="20vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/45 p-4">
          <p className="mb-2 text-[10px] font-semibold tracking-widest2 text-zinc-500">PROMPT LIVE</p>
          <p dir="ltr" className="text-left font-mono text-[11px] leading-6 text-emerald-200">
            {typed}
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse-glow bg-gold align-middle" />
          </p>
        </div>
      </div>

      <div className="glass-strong absolute -left-4 top-1/2 hidden -translate-y-1/2 rounded-2xl px-4 py-3 text-center shadow-card lg:block">
        <p className="font-display text-lg font-black text-gradient-gold">۸s</p>
        <p className="mt-1 text-[10px] text-zinc-400">میانگین رندر</p>
      </div>
    </div>
  );
}
