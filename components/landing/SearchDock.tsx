"use client";

import Link from "next/link";

import { aiToolShortcuts } from "@/lib/search";

import { IconArrowLeft, IconBolt, IconBrain, IconCube, IconSparkles } from "../Icons";
import AiSearch from "./AiSearch";

const toolIcons = {
  brain: IconBrain,
  sparkles: IconSparkles,
  bolt: IconBolt,
  cube: IconCube,
};

const toolHints: Record<string, string> = {
  "/ai-architecture": "کانسپت، حجم و دیاگرام",
  "/ai-prompts": "پرامپت آماده + منفی‌پرامپت",
  "/realtime-rendering": "واریاسیون رندر در ۸ ثانیه",
  "/objects": "دانلود آبجکت‌های PBR",
};

/**
 * Landing-page search dock: the advanced search field plus the four AI
 * tool shortcuts. Sits directly under the hero so visitors can jump into the
 * exact course, object or article they need without scrolling.
 */
export default function SearchDock() {
  return (
    <section
      aria-labelledby="ai-search-title"
      className="container-x relative z-30 -mt-6 pb-4 sm:-mt-10"
    >
      <div className="glass-card relative p-4 sm:p-6">
        <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-l from-transparent via-gold/55 to-transparent" />
        <div className="orb -left-16 -top-16 h-44 w-44 bg-gold/10" />
        <div className="orb -bottom-20 right-10 h-40 w-40 bg-teal-400/[0.07]" />

        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:items-center">
          <div>
            <span className="eyebrow">
              <IconSparkles className="h-3.5 w-3.5" />
              جستجوی هوشمند LUMENS
            </span>
            <h2
              id="ai-search-title"
              className="mt-4 font-display text-lg font-black leading-8 text-white sm:text-2xl sm:leading-10"
            >
              هر چه برای <span className="text-gradient-gold">هوش مصنوعی در معماری</span> لازم
              دارید، از همین‌جا پیدا کنید
            </h2>
            <p className="mt-2 max-w-md text-xs leading-6 text-zinc-400">
              جستجوی یکپارچه در دوره‌های تخصصی، آبجکت‌های سه‌بعدی آماده رندر و مقالات سئو؛ با
              رتبه‌بندی هوشمند و پیشنهادهای پرطرفدار.
            </p>
          </div>

          <AiSearch variant="dock" />
        </div>

        <div className="relative mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {aiToolShortcuts.map((tool) => {
            const Icon = toolIcons[tool.icon];
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-3.5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/35 hover:bg-gold/[0.06]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.08] text-gold transition-colors duration-300 group-hover:text-gold-light">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-bold text-white">
                    {tool.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
                    {toolHints[tool.href] ?? "ابزار تخصصی AI"}
                  </span>
                </span>
                <IconArrowLeft className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-gold" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
