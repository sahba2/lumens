"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  formatSheetTimestamp,
  type ArchitectureSheet,
  type RenderKind,
} from "@/lib/architectureEngine";
import {
  aspectRatioLabel,
  type ImageProviderId,
  type RenderAspectRatio,
} from "@/lib/engine-contract";
import { toPersianDigits } from "@/lib/data";

import { IconBolt, IconClose, IconDownload, IconSearch, IconSparkles } from "../Icons";

export interface BoardRender {
  /** Prompt that produced this image (renders the sheet card in place of text). */
  promptId: RenderKind;
  imageUrl: string;
  downloadUrl: string;
  promptTitleFa: string;
  promptTitleEn: string;
  aspectRatio: RenderAspectRatio;
  generatedAt: string;
  elapsedMs: number;
  provider: ImageProviderId;
}

interface ArchitecturalBoardProps {
  sheet: ArchitectureSheet;
  render: BoardRender;
  remainingCredits: number;
  canRegenerate: boolean;
  onRegenerate: () => void;
  onNewBrief: () => void;
}

const PROVIDER_LABEL: Record<ImageProviderId, string> = {
  openai: "FLUX · OpenAI-compatible",
  fal: "FLUX · fal.ai",
  replicate: "FLUX · Replicate",
  huggingface: "FLUX · Hugging Face",
  demo: "نمونه · Unsplash",
  none: "—",
};

/**
 * Dark-mode architectural board: frameless render + metadata overlay, zoom
 * lightbox and a real download link (served through `/api/render/proxy` so
 * cross-origin provider URLs never reach the browser).
 */
export default function ArchitecturalBoard({
  sheet,
  render,
  remainingCredits,
  canRegenerate,
  onRegenerate,
  onNewBrief,
}: ArchitecturalBoardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeLightbox();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen, closeLightbox]);

  const { metadata, presentation } = sheet;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-lumens-border bg-lumens-surface">
        {/* ------------------------------------------------- frameless image */}
        <div className="relative bg-[#1B1E23]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={render.imageUrl}
            alt={`${sheet.projectName} — ${render.promptTitleFa}`}
            className="block h-auto w-full select-none"
            draggable={false}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/85 via-black/40 to-transparent px-4 pb-12 pt-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-semibold tracking-widest2 text-gold/80">
                  LUMENS · ARCHITECTURAL BOARD
                </p>
                <h3 className="mt-1 font-display text-lg font-black leading-6 text-white sm:text-2xl">
                  {sheet.projectName}
                </h3>
                <p className="mt-0.5 text-[10px] text-zinc-400" dir="ltr">
                  {render.promptTitleEn} · {aspectRatioLabel(render.aspectRatio)}
                </p>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="بزرگ‌نمایی رندر"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#171A1E]/70 text-zinc-200 backdrop-blur transition-colors hover:border-gold/50 hover:text-gold-light"
                >
                  <IconSearch className="h-4 w-4" />
                </button>
                <a
                  href={render.downloadUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  aria-label="دانلود رندر"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-[#171A1E]/70 text-zinc-200 backdrop-blur transition-colors hover:border-gold/50 hover:text-gold-light"
                >
                  <IconDownload className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-16">
            <p className="max-w-2xl text-[10px] leading-5 text-zinc-300">
              {presentation.statementFa}
            </p>
            <p
              dir="ltr"
              className="mt-1.5 max-w-2xl text-left text-[9px] leading-5 text-zinc-500"
            >
              {presentation.statementEn}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] text-zinc-400">
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-gold-light">
                {metadata.scale}
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">
                {metadata.climateFa}
              </span>
              <span className="rounded-full border border-white/15 px-2 py-0.5">
                {PROVIDER_LABEL[render.provider]}
              </span>
              <span className="font-mono">{formatSheetTimestamp(render.generatedAt)}</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------- metadata strip */}
        <div className="grid gap-4 border-t border-lumens-border p-4 sm:grid-cols-2">
          <div>
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">
              ZONING · ۲۵ / ۳۵ / ۴۰
            </p>
            <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="h-full bg-gold/80" style={{ width: "25%" }} />
              <span className="h-full bg-gold/45" style={{ width: "35%" }} />
              <span className="h-full bg-white/25" style={{ width: "40%" }} />
            </div>
            <dl className="mt-2 space-y-1 text-[10px]">
              {metadata.zoning.map((tier) => (
                <div key={tier.label} className="flex items-center justify-between gap-2">
                  <dt className="text-zinc-400">
                    {tier.label}
                    <span className="ms-1 font-mono text-[8px] text-zinc-600">{tier.labelEn}</span>
                  </dt>
                  <dd className="font-mono text-zinc-300">{toPersianDigits(tier.percent)}٪</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">MATERIALS</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {metadata.materials.map((material) => (
                <span
                  key={material}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] text-zinc-300"
                >
                  {material}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[9px] leading-5 text-zinc-500">
              {toPersianDigits(metadata.area)} م² ناخالص · {metadata.levels}
            </p>
          </div>
        </div>

        {render.provider === "demo" ? (
          <p className="border-t border-lumens-border bg-gold/[0.04] px-4 py-2 text-[10px] leading-5 text-gold-light/90">
            این تصویر یک نمونهٔ واقعی از آرشیو معماری <span className="font-semibold">Unsplash</span> است
            تا شیت از ابتدا حرفه‌ای دیده شود؛ برای رندر اختصاصی همین پرامپت، کلید Fal.ai یا Hugging
            Face را در <span dir="ltr" className="font-mono">.env.local</span> قرار دهید.
          </p>
        ) : null}

        {/* ------------------------------------------------------- actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-lumens-border bg-white/[0.02] px-4 py-3">
          <p className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
            <IconBolt className="h-3.5 w-3.5 text-gold" />
            {remainingCredits > 0
              ? `${toPersianDigits(remainingCredits)} رندر رایگان باقی مانده`
              : "سهمیه رندر رایگان تمام شد"}
            <span className="mx-1 h-1 w-1 rounded-full bg-zinc-700" />
            {toPersianDigits(Math.max(1, Math.round(render.elapsedMs / 1000)))} ثانیه رندر
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onNewBrief} className="btn-ghost px-4 py-2 text-xs">
              <IconSparkles className="h-3.5 w-3.5 text-gold" />
              بریف جدید
            </button>
            <button
              type="button"
              onClick={onRegenerate}
              disabled={!canRegenerate}
              className="btn-primary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              <IconBolt className="h-3.5 w-3.5" />
              رندر مجدد
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- lightbox */}
      {mounted && lightboxOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[70] flex flex-col bg-[#14161A]/95 backdrop-blur-md"
              role="dialog"
              aria-modal="true"
              aria-label="نمایش تمام‌صفحه رندر"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">{sheet.projectName}</p>
                  <p className="truncate text-[10px] text-zinc-500">{render.promptTitleFa}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setZoomed((current) => !current)}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[10px] text-zinc-200 transition-colors hover:border-gold/50 hover:text-gold-light"
                  >
                    <IconSearch className="h-3.5 w-3.5" />
                    {zoomed ? "نمایش کامل" : "بزرگ‌نمایی ۲×"}
                  </button>
                  <a
                    href={render.downloadUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-[10px] text-zinc-200 transition-colors hover:border-gold/50 hover:text-gold-light"
                  >
                    <IconDownload className="h-3.5 w-3.5" />
                    دانلود
                  </a>
                  <button
                    type="button"
                    onClick={closeLightbox}
                    aria-label="بستن نمایش"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-zinc-200 transition-colors hover:border-rose-400/50 hover:text-white"
                  >
                    <IconClose className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className={`flex-1 ${zoomed ? "overflow-auto" : "overflow-hidden"} p-2 sm:p-4`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={render.imageUrl}
                  alt={sheet.projectName}
                  onClick={() => setZoomed((current) => !current)}
                  className={`mx-auto block cursor-zoom-in ${
                    zoomed
                      ? "w-[190%] max-w-none sm:w-[150%]"
                      : "max-h-[calc(100vh-120px)] w-auto max-w-full"
                  }`}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

