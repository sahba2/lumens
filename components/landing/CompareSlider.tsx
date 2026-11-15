"use client";

import Image from "next/image";
import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { IconSparkles } from "@/components/Icons";
import { toPersianDigits } from "@/lib/data";

/** One side of the comparison (a local SVG artwork, never a remote asset). */
export interface CompareImage {
  src: string;
  alt: string;
}

/** Material row of the glass panel that floats over the render. */
export interface CompareMaterial {
  label: string;
  code: string;
}

/** Bundled villa-Kordan sketch: the "before" state of the landing page. */
export const VILLA_SKETCH: CompareImage = {
  src: "/ai-engine/villa-sketch.svg",
  alt: "کروکی خطی ویلای کنسولی؛ مرحله پیش از رندر در موتور ایده‌پرداز لومنز",
};

/** Bundled villa-Kordan render: the "after" state of the landing page. */
export const VILLA_RENDER: CompareImage = {
  src: "/ai-engine/villa-render.svg",
  alt: "رندر سینمایی ویلای کنسولی در نور طلایی غروب؛ خروجی موتور ایده‌پرداز لومنز",
};

const DEFAULT_MATERIALS: readonly CompareMaterial[] = [
  { label: "SILK FAIR-FACED CONCRETE", code: "01" },
  { label: "ULTRA-CLEAR GLASS", code: "02" },
];

interface CompareSliderProps {
  /** Sketch / raw image (revealed from the right side). */
  before?: CompareImage;
  /** Final cinematic render (always visible underneath). */
  after?: CompareImage;
  /** Initial divider position in percent: 0 = full render, 100 = full sketch. */
  initialPosition?: number;
  /** `sizes` hint handed to `next/image`. */
  sizes?: string;
  /** Preloads the render; used by the hero. */
  priority?: boolean;
  /** Caption of the card header, next to the live percentage chip. */
  caption?: string;
  /** Accessible name of the drag handle. */
  sliderLabel?: string;
  /** Material rows of the floating glass panel; pass `[]` to hide it. */
  materials?: readonly CompareMaterial[];
  /** Layout-only classes for the outer glass card. */
  className?: string;
}

/**
 * Draggable "before / after" comparison used by the hero and the engine
 * showcase.
 *
 * The handle is fully accessible: it is a real `role="slider"` button moved by
 * pointer drag as well as by the arrow / Home / End keys. Every piece of state
 * starts from a deterministic value, so the server markup and the first client
 * render always match.
 */
export default function CompareSlider({
  before = VILLA_SKETCH,
  after = VILLA_RENDER,
  initialPosition = 58,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  priority = false,
  caption = "SKETCH → RENDER",
  sliderLabel = "مقایسه کروکی و رندر نهایی",
  materials = DEFAULT_MATERIALS,
  className = "",
}: CompareSliderProps) {
  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
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

  return (
    <div className={`glass-card relative p-2.5 sm:p-3 ${className || ""}`}>
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gold-line opacity-70" />

      <div className="flex items-center justify-between gap-2 px-1.5 pb-2.5">
        <span className="inline-flex items-center gap-2 text-[9px] font-semibold tracking-widest2 text-zinc-500">
          <IconSparkles className="h-3 w-3 text-gold" />
          {caption}
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
        className={`relative aspect-[3/2] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-[#212429] ${
          dragging ? "cursor-ew-resize" : "cursor-col-resize"
        }`}
      >
        {/* AFTER — cinematic render stage */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#212429]">
          <Image
            src={after.src}
            alt={after.alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
          <span className="absolute -left-20 top-2 h-56 w-72 rounded-full bg-amber-400/40 blur-3xl mix-blend-screen" />
          <span className="absolute bottom-0 left-1/4 h-44 w-64 rounded-full bg-orange-500/30 blur-3xl mix-blend-screen" />
          <span className="absolute inset-0 bg-gradient-to-t from-[#212429] via-[#212429]/15 to-[#212429]/40" />
          <span className="absolute inset-0 bg-gradient-to-l from-[#212429]/55 via-transparent to-[#212429]/25" />
        </div>

        {/* BEFORE — sketch overlay, revealed from the right */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          <Image
            src={before.src}
            alt={before.alt}
            fill
            sizes={sizes}
            className="object-cover"
          />
          <span className="absolute inset-0 bg-[#212429]/25" />
          <span className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#212429]/85 to-transparent" />
        </div>

        {/* AFTER badge */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-amber-200/25 bg-[#212429]/65 px-3 py-1.5 backdrop-blur-xl">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
          </span>
          <span className="whitespace-nowrap text-[8px] font-semibold tracking-[0.16em] text-amber-100/90">
            AFTER • LUMENS CINEMATIC RENDER
          </span>
        </div>

        {/* BEFORE badge */}
        <span className="pointer-events-none absolute right-3 top-3 whitespace-nowrap rounded-full border border-white/15 bg-[#212429]/60 px-3 py-1.5 text-[8px] font-semibold tracking-[0.16em] text-zinc-300 backdrop-blur-xl">
          BEFORE • SKETCH
        </span>

        {/* Material glass panel */}
        {materials.length > 0 ? (
          <div className="pointer-events-none absolute bottom-3 left-3 w-[min(62%,14rem)] overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-2.5 backdrop-blur-xl">
            <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-amber-200/45 to-transparent" />
            <p className="text-[7px] font-semibold tracking-[0.24em] text-zinc-400">
              MATERIAL PALETTE
            </p>
            <ul className="mt-1.5 space-y-1">
              {materials.map((material) => (
                <li key={material.code} className="flex items-center justify-between gap-2">
                  <span className="truncate text-[8px] font-medium tracking-[0.1em] text-white/85">
                    {material.label}
                  </span>
                  <span className="font-mono text-[7px] text-gold-light/80">{material.code}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${position}%` }}>
          <span className="absolute inset-y-0 -ml-px w-0.5 bg-gradient-to-b from-transparent via-gold-light to-transparent shadow-[0_0_18px_rgba(212,175,55,0.65)]" />
          <button
            type="button"
            role="slider"
            aria-label={sliderLabel}
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
        <span className="font-mono text-[9px] tracking-wider text-zinc-600">BEFORE / AFTER</span>
      </div>
    </div>
  );
}
