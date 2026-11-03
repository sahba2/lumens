"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import EngineModal from "@/components/EngineModal";
import { IconArrowLeft, IconBolt, IconBrain, IconCheck, IconSparkles } from "@/components/Icons";
import {
  ENGINE_PHASE_COUNT,
  ENGINE_RUNTIME_MS,
  IDEA_PRESETS,
  PHASE_STEPS,
} from "@/lib/aiEngine";
import { toPersianDigits } from "@/lib/data";

const SKETCH_SRC = "/ai-engine/villa-sketch.svg";
const RENDER_SRC = "/ai-engine/villa-render.svg";

/**
 * Landing showcase for the LUMENS idea engine: a draggable sketch → render
 * comparison built from the two local SVG artworks plus a preset dock that
 * opens `EngineModal` with a ready-made brief.
 */
export default function EngineShowcase() {
  const [position, setPosition] = useState(58);
  const [dragging, setDragging] = useState(false);
  const [engineOpen, setEngineOpen] = useState(false);
  const [seed, setSeed] = useState<string>(IDEA_PRESETS[0]);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const moveTo = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, Math.round(ratio))));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setDragging(true);
    moveTo(event.clientX);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    moveTo(event.clientX);
  };

  const stopDragging = () => setDragging(false);

  const handleSliderKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 12 : 4;
    const clamp = (value: number) => Math.min(100, Math.max(0, value));

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setPosition((current) => clamp(current + step));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      setPosition((current) => clamp(current - step));
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(100);
    }
  };

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
              بریف پروژه را بنویسید؛ موتور لومنز کانسپت و اقلیم، استراتژی پلان، پالت چهار
              متریال اختصاصی و مسیر یادگیری اجرای ایده را در چند ثانیه به شما تحویل می‌دهد.
            </p>

            <dl className="mt-7 grid grid-cols-3 gap-2">
              {[
                { value: `${toPersianDigits(ENGINE_PHASE_COUNT)} فاز`, label: "پردازش ساختاریافته" },
                {
                  value: `${toPersianDigits(ENGINE_RUNTIME_MS / 1000)} ثانیه`,
                  label: "زمان اجرای نمونه",
                },
                { value: `${toPersianDigits(4)} متریال`, label: "پالت اختصاصی لومنز" },
              ].map((stat) => (
                <div key={stat.label} className="glass rounded-2xl px-3 py-3 text-center">
                  <dt className="font-display text-sm font-black text-gradient-gold">{stat.value}</dt>
                  <dd className="mt-1.5 text-[9px] leading-4 text-zinc-500">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-7 space-y-2.5">
              {PHASE_STEPS.map((step) => (
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
                {IDEA_PRESETS.map((preset) => (
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
                onClick={() => openEngine(IDEA_PRESETS[0])}
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
              خروجی هر اجرا قابل کپی و دانلود به‌صورت بریف متنی است.
            </p>
          </div>

          <div className="relative">
            <div className="glass-card relative p-2.5 sm:p-3">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gold-line opacity-70" />

              <div className="flex items-center justify-between gap-2 px-1.5 pb-2.5">
                <span className="inline-flex items-center gap-2 text-[9px] font-semibold tracking-widest2 text-zinc-500">
                  <IconSparkles className="h-3 w-3 text-gold" />
                  SKETCH → RENDER
                </span>
                <span className="chip border-gold/25 text-gold-light tabular-nums">
                  {toPersianDigits(position)}٪ رندر
                </span>
              </div>

              <div
                ref={frameRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopDragging}
                onPointerLeave={stopDragging}
                onPointerCancel={stopDragging}
                className={`relative aspect-[3/2] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] ${
                  dragging ? "cursor-ew-resize" : "cursor-col-resize"
                }`}
              >
                {/* AFTER — cinematic render stage */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#0d0d12]">
                  <Image
                    src={RENDER_SRC}
                    alt="رندر سینمایی ویلای کنسولی در نور طلایی غروب؛ خروجی موتور ایده‌پرداز لومنز"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute -left-20 top-2 h-56 w-72 rounded-full bg-amber-400/40 blur-3xl mix-blend-screen" />
                  <span className="absolute bottom-0 left-1/4 h-44 w-64 rounded-full bg-orange-500/30 blur-3xl mix-blend-screen" />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/15 to-[#0d0d12]/40" />
                  <span className="absolute inset-0 bg-gradient-to-l from-[#0d0d12]/55 via-transparent to-[#0d0d12]/25" />
                </div>

                {/* BEFORE — sketch overlay, revealed from the right */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ clipPath: `inset(0 0 0 ${position}%)` }}
                >
                  <Image
                    src={SKETCH_SRC}
                    alt="کروکی خطی ویلای کنسولی؛ مرحله پیش از رندر در موتور ایده‌پرداز لومنز"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <span className="absolute inset-0 bg-[#0d0d12]/25" />
                  <span className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0d0d12]/85 to-transparent" />
                </div>

                {/* AFTER badge */}
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-amber-200/25 bg-[#0d0d12]/65 px-3 py-1.5 backdrop-blur-xl">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
                  </span>
                  <span className="whitespace-nowrap text-[8px] font-semibold tracking-[0.16em] text-amber-100/90">
                    AFTER • LUMENS CINEMATIC RENDER
                  </span>
                </div>

                {/* BEFORE badge */}
                <span className="pointer-events-none absolute right-3 top-3 whitespace-nowrap rounded-full border border-white/15 bg-[#0d0d12]/60 px-3 py-1.5 text-[8px] font-semibold tracking-[0.16em] text-zinc-300 backdrop-blur-xl">
                  BEFORE • SKETCH
                </span>

                {/* Material glass panel */}
                <div className="pointer-events-none absolute bottom-3 left-3 w-[min(62%,14rem)] overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-2.5 backdrop-blur-xl">
                  <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-amber-200/45 to-transparent" />
                  <p className="text-[7px] font-semibold tracking-[0.24em] text-zinc-400">
                    MATERIAL PALETTE
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {[
                      { label: "SILK FAIR-FACED CONCRETE", code: "01" },
                      { label: "ULTRA-CLEAR GLASS", code: "02" },
                    ].map((material) => (
                      <li key={material.code} className="flex items-center justify-between gap-2">
                        <span className="truncate text-[8px] font-medium tracking-[0.1em] text-white/85">
                          {material.label}
                        </span>
                        <span className="font-mono text-[7px] text-gold-light/80">
                          {material.code}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className="pointer-events-none absolute inset-y-0"
                  style={{ left: `${position}%` }}
                >
                  <span className="absolute inset-y-0 -ml-px w-0.5 bg-gradient-to-b from-transparent via-gold-light to-transparent shadow-[0_0_18px_rgba(212,175,55,0.65)]" />
                  <button
                    type="button"
                    role="slider"
                    aria-label="مقایسه کروکی و رندر نهایی"
                    aria-orientation="horizontal"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={position}
                    aria-valuetext={`${toPersianDigits(position)} درصد رندر`}
                    onKeyDown={handleSliderKeyDown}
                    className="pointer-events-auto absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-gold/60 bg-ink/90 text-gold-light shadow-glow-sm backdrop-blur transition-transform duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <span className="text-[10px] tracking-[-0.12em]">◀▶</span>
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1.5">
                <p className="text-[10px] leading-5 text-zinc-500">
                  دستگیره را بکشید یا با کلیدهای جهت‌دار مقایسه کنید.
                </p>
                <span className="font-mono text-[9px] tracking-wider text-zinc-600">
                  BEFORE / AFTER
                </span>
              </div>
            </div>

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
                    حجم کنسولی روی شیب، بتن اکسپوز و شیشه ساختاری؛ خروجی شامل کانسپت، پلان،
                    پالت متریال و مسیر یادگیری است.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openEngine(IDEA_PRESETS[0])}
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
