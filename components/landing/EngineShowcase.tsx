"use client";

import { useState } from "react";

import EngineModal from "@/components/EngineModal";
import CompareSlider from "@/components/landing/CompareSlider";
import { IconArrowLeft, IconBolt, IconBrain, IconCheck, IconSparkles } from "@/components/Icons";
import {
  BRIEF_PRESETS,
  SHEET_PHASE_COUNT,
  SHEET_PHASE_STEPS,
} from "@/lib/architectureEngine";
import { toPersianDigits } from "@/lib/data";

/**
 * Landing showcase for the LUMENS idea engine: a preset dock that opens
 * `EngineModal` with a ready-made brief, next to the shared sketch → render
 * comparison (`CompareSlider`), which the hero also uses.
 */
export default function EngineShowcase() {
  const [engineOpen, setEngineOpen] = useState(false);
  const [seed, setSeed] = useState<string>(BRIEF_PRESETS[0]);

  const openEngine = (brief: string) => {
    setSeed(brief);
    setEngineOpen(true);
  };

  return (
    <section
      id="engine"
      aria-labelledby="engine-showcase-title"
      className="relative scroll-mt-[88px] overflow-hidden border-y border-white/10 bg-white/[0.015] py-20 sm:py-24"
    >
      <div className="orb -right-24 top-10 h-72 w-72 bg-gold/10" />
      <div className="orb -left-20 bottom-0 h-64 w-64 bg-teal-400/[0.06]" />

      <div className="container-x relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-14">
          <div className="relative">
            <span className="eyebrow">
              <IconBrain className="h-3.5 w-3.5" />
              موتور ایده‌پرداز LUMENS
            </span>

            <h2 id="engine-showcase-title" className="section-title mt-5">
              از کروکی دستی تا رندر سینمایی، در یک گفت‌وگو
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
              بریف پروژه را بنویسید؛ موتور لومنز شیت پنج‌فازی شامل کانسپت و پهنه‌بندی ۲۵/۳۵/۴۰، فرم
              و تکتونیک، سه پرامپت رندر کالیبره‌شده، جزئیات اجرایی و بیانیه دوزبانه ارائه را می‌سازد
              و تصویر نهایی را با موتور FLUX رندر می‌کند.
            </p>

            <dl className="mt-7 grid grid-cols-3 gap-2">
              {[
                { value: `${toPersianDigits(SHEET_PHASE_COUNT)} فاز`, label: "شیت پروژه ساختاریافته" },
                { value: `${toPersianDigits(3)} پرامپت`, label: "رندر کالیبره‌شده FLUX" },
                { value: `${toPersianDigits(5)} متریال`, label: "پالت اختصاصی لومنز" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl px-3 py-3 text-center">
                  <dt className="font-display text-sm font-black text-gradient-gold">{stat.value}</dt>
                  <dd className="mt-1.5 text-[9px] leading-4 text-zinc-500">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-7 space-y-2.5">
              {SHEET_PHASE_STEPS.map((step) => (
                <li key={step.id} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/[0.09] text-[10px] font-bold text-gold-light">
                    {toPersianDigits(step.index + 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-zinc-200">
                      {step.title}
                      <span className="ms-2 font-mono text-[9px] font-medium text-zinc-600">
                        {step.subtitle}
                      </span>
                    </p>
                    <p className="mt-0.5 text-[10px] leading-5 text-zinc-500">{step.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-widest2 text-gold/80">
                <IconSparkles className="h-3.5 w-3.5" />
                اجرای سریع با بریف آماده
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {BRIEF_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => openEngine(preset)}
                    className="chip text-right transition-colors duration-300 hover:border-gold/40 hover:text-white"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openEngine(BRIEF_PRESETS[0])}
                className="btn-primary group"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/45 to-transparent transition-transform duration-700 ease-cinema group-hover:translate-x-full"
                />
                <IconBolt className="h-4 w-4" />
                اجرای موتور ایده‌پرداز
              </button>
              <a href="/ai-architecture" className="btn-ghost group">
                هوش مصنوعی در معماری
                <IconArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              </a>
            </div>

            <p className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
              <IconCheck className="h-3.5 w-3.5 text-gold" />
              شیت قابل کپی و دانلود است و رندر نهایی با FLUX در بک‌اند ساخته می‌شود.
            </p>
          </div>

          <div className="relative">
            <CompareSlider />

            <div className="glass relative mt-3 overflow-hidden rounded-2xl p-4">
              <div className="orb -right-10 -top-10 h-28 w-28 bg-gold/[0.08]" />
              <div className="relative flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/[0.08] text-gold">
                  <IconBrain className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-semibold tracking-widest2 text-gold/75">
                    بریف نمونه · ویلای معلق کردان
                  </p>
                  <p className="mt-1.5 text-[11px] leading-6 text-zinc-400">
                    حجم کنسولی روی شیب، بتن اکسپوز و شیشه ساختاری؛ خروجی شامل شیت پنج‌فازی،
                    پرامپت‌های رندر کالیبره‌شده و تصویر نهایی FLUX است.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openEngine(BRIEF_PRESETS[0])}
                className="group relative mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-gold/25 bg-gold/[0.07] px-3 py-2.5 text-right transition-colors duration-300 hover:border-gold/45 hover:bg-gold/[0.12]"
              >
                <span className="text-[10px] font-bold text-gold-light">
                  همین بریف را در موتور اجرا کنید
                </span>
                <IconArrowLeft className="h-3.5 w-3.5 text-gold transition-transform duration-300 group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <EngineModal open={engineOpen} initialPrompt={seed} onClose={() => setEngineOpen(false)} />
    </section>
  );
}
