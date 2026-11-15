"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  SHEET_PHASE_STEPS,
  formatSheetTimestamp,
  type ArchitectureSheet,
  type RenderKind,
  type RenderPrompt,
  type SheetPhaseStep,
} from "@/lib/architectureEngine";
import { aspectRatioLabel } from "@/lib/engine-contract";
import { toPersianDigits } from "@/lib/data";

import {
  IconBolt,
  IconBook,
  IconBrain,
  IconCheck,
  IconCopy,
  IconCube,
  IconDownload,
  IconEye,
  IconLayers,
  IconRoute,
  IconSliders,
  IconSparkles,
} from "../Icons";
import type { BoardRender } from "./ArchitecturalBoard";
import RenderImageButton from "./RenderImageButton";

interface ArchitectureSheetViewProps {
  sheet: ArchitectureSheet;
  /** Prompt the user will send to the render endpoint. */
  selectedPromptId: RenderKind;
  onSelectPrompt: (id: RenderKind) => void;
  /** True while a render request is in flight. */
  disabled?: boolean;
  /** Image returned by `/api/render/generate`; replaces the prompt text. */
  renderPreview?: BoardRender | null;
  /** Prompt whose render request is currently in flight. */
  renderingPromptId?: RenderKind | null;
  /** True while the free-render quota is being read before POSTing. */
  checkingCredits?: boolean;
  /** Prompt whose last render failed (shows the message under its button). */
  renderErrorPromptId?: RenderKind | null;
  /** Persian error message returned by the render pipeline. */
  renderError?: string | null;
  /** Fires a real POST /api/render/generate for the chosen prompt. */
  onRenderPrompt?: (prompt: RenderPrompt) => void;
}

const phaseIcons: Record<string, typeof IconBrain> = {
  concept: IconBrain,
  tectonics: IconLayers,
  prompts: IconSparkles,
  technical: IconSliders,
  presentation: IconBook,
};

/**
 * Presentation of the 5-phase project sheet: zoning matrix, tectonics,
 * calibrated prompts, technical section and the bilingual board statement.
 * Pure presentation - every action is delegated back to `EngineModal`.
 */
export default function ArchitectureSheetView({
  sheet,
  selectedPromptId,
  onSelectPrompt,
  disabled = false,
  renderPreview = null,
  renderingPromptId = null,
  checkingCredits = false,
  renderErrorPromptId = null,
  renderError = null,
  onRenderPrompt,
}: ArchitectureSheetViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promptShownId, setPromptShownId] = useState<RenderKind | null>(null);
  const { concept, tectonics, prompts, technical, presentation, metadata } = sheet;

  useEffect(() => {
    if (!copiedId) return;
    const timer = window.setTimeout(() => setCopiedId(null), 2200);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const copyPrompt = useCallback(async (id: string, text: string) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard-unavailable");
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.top = "-1000px";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } finally {
        document.body.removeChild(area);
      }
    }

    setCopiedId(id);
  }, []);

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------- summary */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-bl from-gold/[0.13] via-white/[0.02] to-transparent p-4 sm:p-5">
        <div className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/80">
              PROJECT SHEET · ۵ فاز
            </p>
            <h3 className="mt-1.5 font-display text-lg font-black text-white sm:text-xl">
              {sheet.projectName}
            </h3>
            <p className="mt-1 text-[10px] leading-5 text-zinc-400" dir="ltr">
              {sheet.projectNameEn}
            </p>
            <p className="mt-2 text-[11px] leading-6 text-zinc-400">«{sheet.brief}»</p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="chip border-gold/30 text-gold-light">{sheet.typology.labelFa}</span>
            <span className="chip border-white/10 text-zinc-300">{metadata.scale}</span>
            <span className="chip border-white/10 text-zinc-400">
              {toPersianDigits(metadata.area)} م² ناخالص
            </span>
          </div>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          <span className="chip border-white/10 text-zinc-300">{sheet.location.labelFa}</span>
          {!sheet.location.detected ? (
            <span className="chip border-amber-300/30 text-amber-200/90">سایت فرضی</span>
          ) : null}
          {concept.keywords.slice(2).map((keyword) => (
            <span key={keyword} className="chip border-white/10 text-zinc-400">
              {keyword}
            </span>
          ))}
          <span className="chip border-white/10 text-zinc-500">
            {formatSheetTimestamp(sheet.createdAt)}
          </span>
        </div>

        {/* zoning bar: 25 / 35 / 40 */}
        <div className="relative mt-4">
          <div className="flex h-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
            <span className="h-full bg-gold/80" style={{ width: "25%" }} />
            <span className="h-full bg-gold/45" style={{ width: "35%" }} />
            <span className="h-full bg-white/20" style={{ width: "40%" }} />
          </div>
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-[9px] text-zinc-500">
            {metadata.zoning.map((tier) => (
              <span key={tier.label}>
                {tier.label} · {toPersianDigits(tier.percent)}٪
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- phase 1 */}
      <PhaseBlock step={SHEET_PHASE_STEPS[0]} icon={<phaseIcons.concept className="h-4 w-4" />}>
        <p className="text-xs leading-7 text-zinc-300">{concept.statement}</p>

        <div className="grid gap-2 sm:grid-cols-3">
          {concept.zoning.map((tier) => (
            <div key={tier.id} className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-bold text-white">{tier.titleFa}</p>
                <span className="font-mono text-[10px] font-bold text-gold-light">
                  {toPersianDigits(tier.share)}٪
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[8px] tracking-wider text-zinc-600">
                {tier.titleEn}
              </p>
              <ul className="mt-2 space-y-1">
                {tier.zones.map((zone) => (
                  <li key={zone.name} className="flex items-start justify-between gap-2 text-[10px]">
                    <span className="min-w-0 leading-5 text-zinc-300">{zone.name}</span>
                    <span className="shrink-0 font-mono text-[9px] text-zinc-500">
                      {toPersianDigits(zone.area)} م²
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <InfoTile
            icon={<IconRoute className="h-3.5 w-3.5" />}
            label="گردش عمومی"
            value={concept.circulation.publicRoute}
          />
          <InfoTile
            icon={<IconLayers className="h-3.5 w-3.5" />}
            label="گردش عمودی"
            value={concept.circulation.vertical}
          />
          <InfoTile
            icon={<IconBolt className="h-3.5 w-3.5" />}
            label="مسیر سرویس"
            value={concept.circulation.service}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">
            راهبرد اقلیمی · {concept.climate.climateFa}
          </p>
          <ul className="mt-2 space-y-1.5">
            {concept.climate.strategies.map((strategy) => (
              <li
                key={strategy}
                className="flex items-start gap-2 text-[10px] leading-5 text-zinc-400"
              >
                <IconCheck className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                {strategy}
              </li>
            ))}
          </ul>
        </div>
      </PhaseBlock>

      {/* ------------------------------------------------------- phase 2 */}
      <PhaseBlock
        step={SHEET_PHASE_STEPS[1]}
        icon={<phaseIcons.tectonics className="h-4 w-4" />}
      >
        <p className="text-xs leading-7 text-zinc-300">{tectonics.massing}</p>
        <p className="text-[10px] leading-6 text-zinc-500">{tectonics.volumetricRule}</p>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-bold text-white">{tectonics.courtyard.titleFa}</p>
            <span className="font-mono text-[8px] tracking-wider text-zinc-600">
              {tectonics.courtyard.titleEn}
            </span>
          </div>
          <p className="mt-1 text-[10px] text-zinc-400">
            {tectonics.courtyard.dimensions} · عمق {tectonics.courtyard.depth}
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {tectonics.courtyard.roles.map((role) => (
              <li
                key={role}
                className="flex items-start gap-2 rounded-lg bg-white/[0.02] px-2 py-1.5 text-[10px] leading-5 text-zinc-400"
              >
                <IconCheck className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                {role}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <InfoTile
            icon={<IconLayers className="h-3.5 w-3.5" />}
            label="شبکه سازه"
            value={tectonics.structure.grid}
          />
          <InfoTile
            icon={<IconBolt className="h-3.5 w-3.5" />}
            label="دهانه و کنسول"
            value={tectonics.structure.span}
          />
          <InfoTile
            icon={<IconCube className="h-3.5 w-3.5" />}
            label="ارتفاع طبقه"
            value={tectonics.structure.floorHeight}
          />
          <InfoTile
            icon={<IconCheck className="h-3.5 w-3.5" />}
            label="مشخصات بتن"
            value={tectonics.structure.material}
          />
        </div>

        <div className="grid gap-2">
          {tectonics.envelope.map((layer) => (
            <div key={layer.titleFa} className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <p className="text-[11px] font-bold text-white">{layer.titleFa}</p>
              <p className="mt-1 text-[10px] leading-6 text-zinc-400">{layer.description}</p>
            </div>
          ))}
        </div>
      </PhaseBlock>

      {/* ------------------------------------------------------- phase 3 */}
      <PhaseBlock step={SHEET_PHASE_STEPS[2]} icon={<phaseIcons.prompts className="h-4 w-4" />}>
        <p className="text-[10px] leading-6 text-zinc-500">
          یکی از سه پرامپت زیر را انتخاب کنید؛ همان پرامپت (به‌همراه منفی‌پرامپت) به‌صورت
          سرور‌به‌سرور به موتور رندر فرستاده می‌شود.
        </p>

        <div className="grid gap-2">
          {prompts.map((prompt) => {
            const active = prompt.id === selectedPromptId;
            const copied = copiedId === prompt.id;
            const rendered = renderPreview?.promptId === prompt.id;
            const rendering = renderingPromptId === prompt.id;
            const showPrompt = !rendered || promptShownId === prompt.id;

            return (
              <div
                key={prompt.id}
                className={`overflow-hidden rounded-xl border transition-colors duration-300 ${
                  active ? "border-gold/45 bg-gold/[0.06]" : "border-white/10 bg-ink/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectPrompt(prompt.id)}
                  disabled={disabled}
                  aria-pressed={active}
                  className="flex w-full items-start justify-between gap-3 p-3 text-right disabled:cursor-not-allowed"
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        active ? "border-gold bg-gold text-ink" : "border-white/25 text-transparent"
                      }`}
                    >
                      <IconCheck className="h-3 w-3" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white">{prompt.titleFa}</p>
                      <p className="mt-0.5 font-mono text-[8px] tracking-wider text-zinc-600">
                        {prompt.titleEn}
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-zinc-400">{prompt.purposeFa}</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="chip border-white/10 text-zinc-300">
                      {aspectRatioLabel(prompt.aspectRatio)}
                    </span>
                    <span className="text-[9px] text-zinc-600">{prompt.cameraFa.slice(0, 34)}…</span>
                  </div>
                </button>

                <div className="border-t border-white/10 bg-black/30 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-[8px] font-semibold tracking-widest2 ${
                        rendered ? "text-emerald-200/80" : "text-gold/70"
                      }`}
                    >
                      {rendered
                        ? "RENDER READY · /api/render/generate"
                        : rendering
                          ? checkingCredits
                            ? "CHECKING CREDITS · render-credits.json"
                            : "RENDERING · /api/render/generate"
                          : "FLUX · SDXL · MJ"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {rendered ? (
                        <button
                          type="button"
                          onClick={() => setPromptShownId(showPrompt ? null : prompt.id)}
                          className="inline-flex items-center gap-1 text-[9px] text-zinc-400 transition-colors hover:text-gold-light"
                        >
                          <IconEye className="h-3 w-3" />
                          {showPrompt ? "نمایش تصویر" : "نمایش پرامپت"}
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => void copyPrompt(prompt.id, prompt.prompt)}
                        className="inline-flex items-center gap-1 text-[9px] text-zinc-400 transition-colors hover:text-gold-light"
                      >
                        {copied ? (
                          <IconCheck className="h-3 w-3 text-emerald-300" />
                        ) : (
                          <IconCopy className="h-3 w-3" />
                        )}
                        {copied ? "کپی شد" : "کپی پرامپت"}
                      </button>

                      <RenderImageButton
                        prompt={prompt}
                        busy={rendering}
                        checkingCredits={checkingCredits}
                        rendered={rendered}
                        disabled={disabled}
                        error={renderErrorPromptId === prompt.id ? renderError : null}
                        onRender={(next) => onRenderPrompt?.(next)}
                      />
                    </div>
                  </div>

                  {rendering ? (
                    <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/50">
                      <div
                        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent ${
                          prompt.aspectRatio === "1:1"
                            ? "aspect-square"
                            : prompt.aspectRatio === "4:3"
                              ? "aspect-[4/3]"
                              : "aspect-video"
                        }`}
                      >
                        <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-l from-transparent via-gold/10 to-transparent" />
                        <div className="relative px-3 text-center">
                          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                          </span>
                          <p className="mt-2 text-[10px] font-semibold text-white">
                            {checkingCredits ? "بررسی سهمیه رندر رایگان…" : "در حال رندر تصویر…"}
                          </p>
                          <p className="mt-0.5 font-mono text-[8px] tracking-wider text-zinc-500" dir="ltr">
                            {checkingCredits ? "GET /api/render/quota" : "POST /api/render/generate"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : rendered && !showPrompt && renderPreview ? (
                    <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={renderPreview.imageUrl}
                        alt={`${sheet.projectName} — ${prompt.titleFa}`}
                        className="block h-auto w-full"
                        draggable={false}
                      />
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-black/60 px-2.5 py-1.5">
                        <span className="text-[9px] text-emerald-200/80">
                          تصویر واقعی تولیدشده توسط موتور رندر
                        </span>
                        <a
                          href={renderPreview.downloadUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[9px] text-gold-light hover:text-gold"
                        >
                          <IconDownload className="h-3 w-3" />
                          دانلود تصویر
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p
                      dir="ltr"
                      className="mt-1.5 max-h-28 overflow-y-auto font-mono text-[9px] leading-5 text-left text-zinc-400"
                    >
                      {prompt.prompt}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-[9px] font-semibold tracking-widest2 text-zinc-500">LUMENS MATERIAL DNA</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sheet.metadata.materials.map((material) => (
              <span key={material} className="chip border-white/10 text-[9px] text-zinc-400">
                {material}
              </span>
            ))}
          </div>
        </div>
      </PhaseBlock>

      {/* ------------------------------------------------------- phase 4 */}
      <PhaseBlock
        step={SHEET_PHASE_STEPS[3]}
        icon={<phaseIcons.technical className="h-4 w-4" />}
      >
        <p className="text-xs leading-7 text-zinc-300">{technical.section}</p>

        <ol className="relative space-y-2 border-r border-white/10 pr-4">
          {technical.transitions.map((transition) => (
            <li key={transition.level} className="relative">
              <span className="absolute -right-[21px] top-3 h-1.5 w-1.5 rounded-full bg-gold" />
              <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold text-white">{transition.titleFa}</p>
                  <span className="font-mono text-[10px] font-bold text-gold-light" dir="ltr">
                    {transition.level}
                  </span>
                </div>
                <p className="mt-1 text-[10px] leading-5 text-zinc-400">{transition.note}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="grid gap-2">
          {technical.details.map((detail) => (
            <div key={detail.titleEn} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[11px] font-bold text-white">{detail.titleFa}</p>
                <span className="font-mono text-[8px] tracking-wider text-zinc-600" dir="ltr">
                  {detail.titleEn}
                </span>
              </div>
              <p className="mt-1 text-[10px] leading-6 text-zinc-400">{detail.description}</p>
              <p
                dir="ltr"
                className="mt-1.5 rounded-lg bg-black/40 px-2 py-1.5 text-left font-mono text-[9px] leading-5 text-emerald-200/70"
              >
                {detail.specEn}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.04] p-3">
          <p className="text-[9px] font-semibold tracking-widest2 text-amber-200/80">
            LINEAR STORMWATER · زهکشی
          </p>
          <p className="mt-1.5 text-[10px] leading-6 text-zinc-300">{technical.drainage}</p>
        </div>
      </PhaseBlock>

      {/* ------------------------------------------------------- phase 5 */}
      <PhaseBlock
        step={SHEET_PHASE_STEPS[4]}
        icon={<phaseIcons.presentation className="h-4 w-4" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">بیانیه فارسی</p>
            <p className="mt-2 text-[11px] leading-7 text-zinc-300">{presentation.statementFa}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">EN STATEMENT</p>
            <p dir="ltr" className="mt-2 text-left text-[11px] leading-7 text-zinc-300">
              {presentation.statementEn}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <p className="text-[9px] font-semibold tracking-widest2 text-zinc-500">پیچ ارائه</p>
          <p className="mt-1.5 text-[10px] leading-6 text-zinc-400">{presentation.pitchFa}</p>
          <p dir="ltr" className="mt-1.5 text-left text-[10px] leading-6 text-zinc-500">
            {presentation.pitchEn}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">تحویل‌دادنی‌ها</p>
            <ul className="mt-2 space-y-1">
              {presentation.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[10px] leading-5 text-zinc-400">
                  <IconCheck className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-white/10 bg-ink/60 p-3">
            <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">متادیتای شیت</p>
            <dl className="mt-2 space-y-1.5 text-[10px]">
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">مقیاس</dt>
                <dd className="text-zinc-300">{metadata.scale}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">ترازها</dt>
                <dd className="text-zinc-300">{metadata.levels}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">اقلیم</dt>
                <dd className="text-left text-zinc-300">{metadata.climateFa}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500">پهنه‌بندی</dt>
                <dd className="text-zinc-300">
                  {metadata.zoning.map((tier) => `${toPersianDigits(tier.percent)}٪`).join(" · ")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </PhaseBlock>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="flex items-center gap-1.5 text-[9px] font-semibold tracking-widest2 text-gold/70">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-[10px] leading-5 text-zinc-400">{value}</p>
    </div>
  );
}

function PhaseBlock({
  step,
  icon,
  children,
}: {
  step: SheetPhaseStep;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <header className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">
            {step.label} · {step.subtitle}
          </p>
          <h3 className="mt-1 text-sm font-black leading-6 text-white sm:text-base">{step.title}</h3>
        </div>
      </header>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}





