"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  PHASE_STEPS,
  formatIdeaTimestamp,
  type ArchitecturalIdeaResult,
  type EnginePhaseStep,
} from "@/lib/aiEngine";
import { toPersianDigits } from "@/lib/data";

import {
  IconArrowLeft,
  IconBolt,
  IconBook,
  IconBrain,
  IconCheck,
  IconClock,
  IconCube,
  IconLayers,
  IconRoute,
  IconSparkles,
} from "../Icons";

/**
 * Structured output of the LUMENS idea engine: concept, plan, material
 * palette and learning path. Rendered inside `EngineModal` once the mock
 * pipeline resolves, and kept presentation-only so the engine stays testable.
 */
export default function EngineResults({ result }: { result: ArchitecturalIdeaResult }) {
  const { concept, plan, materials, courses } = result.phases;

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------- summary */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-bl from-gold/[0.14] via-white/[0.02] to-transparent p-5">
        <div className="pointer-events-none absolute -left-10 -top-14 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">PROPOSAL READY</p>
            <h3 className="mt-2 font-display text-xl font-black text-white sm:text-2xl">{result.projectName}</h3>
            <p className="mt-2 text-[11px] leading-6 text-zinc-400">«{result.prompt}»</p>
          </div>
          <span className="chip border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
            <IconCheck className="h-3.5 w-3.5" />
            {toPersianDigits(result.runtimeMs / 1000)} ثانیه پردازش
          </span>
        </div>

        <div className="relative mt-4 flex flex-wrap gap-1.5">
          <span className="chip border-gold/30 text-gold-light">{result.typologyLabel}</span>
          <span className="chip border-white/10 text-zinc-300">{result.locationLabel}</span>
          {result.tags.slice(1).map((tag) => (
            <span key={tag} className="chip border-white/10 text-zinc-400">
              {tag}
            </span>
          ))}
        </div>

        <p className="relative mt-4 inline-flex items-center gap-1.5 text-[10px] text-zinc-500">
          <IconClock className="h-3 w-3" />
          {formatIdeaTimestamp(result.createdAt)}
          <span className="mx-1 h-1 w-1 rounded-full bg-zinc-700" />
          {result.id}
        </p>
      </div>

      {/* ------------------------------------------------------- concept */}
      <PhaseBlock
        step={PHASE_STEPS[0]}
        headline={concept.headline}
        eyebrow={concept.eyebrow}
        icon={<IconBrain className="h-4 w-4" />}
      >
        <p className="text-xs leading-7 text-zinc-300">{concept.narrative}</p>

        <div className="flex flex-wrap gap-1.5">
          {concept.keywords.map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-300"
            >
              #{keyword}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {concept.climate.metrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <p className="text-[9px] tracking-wider text-zinc-500">{metric.label}</p>
              <p className="mt-1 text-[11px] font-bold leading-5 text-white">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-ink/50 p-4">
          <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">CLIMATE STRATEGY</p>
          <ul className="mt-3 space-y-2">
            {concept.climate.strategies.map((strategy) => (
              <li key={strategy} className="flex items-start gap-2 text-[11px] leading-6 text-zinc-300">
                <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                {strategy}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-white/10 pt-3 text-[10px] leading-6 text-zinc-500">
            {concept.climate.site} · {concept.climate.climate} · {concept.climate.altitude} · جهت‌گیری{" "}
            {concept.climate.orientation}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {concept.moves.map((move, index) => (
            <div key={move.title} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <span className="text-[10px] font-bold text-gold/70">{toPersianDigits(index + 1)}</span>
              <p className="mt-1 text-[11px] font-bold text-white">{move.title}</p>
              <p className="mt-1.5 text-[10px] leading-5 text-zinc-400">{move.detail}</p>
            </div>
          ))}
        </div>
      </PhaseBlock>

      {/* ---------------------------------------------------------- plan */}
      <PhaseBlock
        step={PHASE_STEPS[1]}
        headline={plan.headline}
        eyebrow={plan.eyebrow}
        icon={<IconRoute className="h-4 w-4" />}
      >
        <p className="text-xs leading-7 text-zinc-300">{plan.strategy}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip border-gold/30 text-gold-light">
            <IconCube className="h-3.5 w-3.5" />
            {toPersianDigits(plan.totalArea)} مترمربع
          </span>
          {plan.levels.map((level) => (
            <span key={level} className="chip border-white/10 text-zinc-300">
              {level}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {plan.zones.map((zone) => (
            <div key={zone.id} className="rounded-xl border border-white/10 bg-ink/50 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-bold text-white">{zone.name}</p>
                <p className="shrink-0 text-[10px] text-gold/80 tabular-nums">
                  {toPersianDigits(zone.area)} م²
                </p>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-l from-gold-light via-gold to-gold-deep transition-[width] duration-700 ease-cinema"
                  style={{ width: `${Math.max(zone.share, 4)}%` }}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-zinc-500">
                <span>{zone.level}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span>{toPersianDigits(zone.share)}٪ برنامه</span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span className="text-zinc-400">{zone.note}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { label: "ارتباط افقی", value: plan.circulation.horizontal },
            { label: "ارتباط عمودی", value: plan.circulation.vertical },
            { label: "سرویس و پشتیبان", value: plan.circulation.service },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="text-[9px] tracking-wider text-zinc-500">{item.label}</p>
              <p className="mt-1.5 text-[10px] leading-5 text-zinc-300">{item.value}</p>
            </div>
          ))}
        </div>

        <p className="rounded-xl border border-gold/20 bg-gold/[0.05] p-3 text-[10px] leading-6 text-sand">
          <span className="font-bold text-gold-light">منطق سازه: </span>
          {plan.structuralNote}
        </p>
      </PhaseBlock>

      {/* ------------------------------------------------------- materials */}
      <PhaseBlock
        step={PHASE_STEPS[2]}
        headline={materials.headline}
        eyebrow={materials.eyebrow}
        icon={<IconLayers className="h-4 w-4" />}
      >
        <p className="text-xs leading-7 text-zinc-300">{materials.rationale}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          {materials.composition.map((material) => (
            <div key={material.id} className="rounded-xl border border-white/10 bg-ink/60 p-3">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 h-10 w-10 shrink-0 rounded-lg border border-white/15 shadow-inset"
                  style={{ backgroundColor: material.tone }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[11px] font-bold text-white">{material.nameFa}</p>
                    <span className="shrink-0 text-[10px] font-bold text-gold-light tabular-nums">
                      {toPersianDigits(material.share)}٪
                    </span>
                  </div>
                  <p dir="ltr" className="truncate text-left text-[9px] tracking-wide text-zinc-500">
                    {material.nameEn}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${material.share}%`, backgroundColor: material.tone }}
                    />
                  </div>
                </div>
              </div>
              <p className="mt-2.5 text-[10px] leading-5 text-zinc-400">{material.application}</p>
              <p className="mt-1 text-[9px] leading-5 text-zinc-500">
                {material.finish} · {material.emphasis}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-ink/50 p-4">
          <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">DETAILING NOTES</p>
          <ul className="mt-3 space-y-2">
            {materials.detailing.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-[10px] leading-6 text-zinc-300">
                <IconLayers className="mt-0.5 h-3 w-3 shrink-0 text-gold/70" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div dir="ltr" className="space-y-2 rounded-xl border border-white/10 bg-black/60 p-4 text-left">
          <p className="flex items-center gap-1.5 text-[9px] tracking-widest2 text-zinc-500">
            <IconBolt className="h-3 w-3 text-gold" />
            LUMENS RENDER PROMPT
          </p>
          <p className="font-mono text-[10px] leading-6 text-emerald-200/90">{materials.renderPrompt}</p>
          <p className="flex items-center gap-1.5 border-t border-white/10 pt-2 text-[9px] tracking-widest2 text-zinc-500">
            <IconSparkles className="h-3 w-3 text-rose-300/70" />
            NEGATIVE PROMPT
          </p>
          <p className="font-mono text-[10px] leading-6 text-rose-200/60">{materials.negativePrompt}</p>
        </div>
      </PhaseBlock>

      {/* --------------------------------------------------------- courses */}
      <PhaseBlock
        step={PHASE_STEPS[3]}
        headline={courses.headline}
        eyebrow={courses.eyebrow}
        icon={<IconBook className="h-4 w-4" />}
      >
        <p className="text-xs leading-7 text-zinc-300">{courses.summary}</p>

        <div className="grid gap-2">
          {courses.courses.map((course) => (
            <Link
              key={course.id}
              href={course.href}
              className="group rounded-xl border border-white/10 bg-ink/60 p-3.5 transition-colors duration-300 hover:border-gold/40 hover:bg-gold/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-white transition-colors duration-300 group-hover:text-gold-light">
                    {course.title}
                  </p>
                  <p className="mt-1 text-[10px] leading-5 text-zinc-400">{course.reason}</p>
                </div>
                <IconArrowLeft className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-gold" />
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[9px] text-zinc-500">
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-zinc-300">
                  {course.level}
                </span>
                <span className="inline-flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {toPersianDigits(course.hours)} ساعت
                </span>
                <span className="h-1 w-1 rounded-full bg-zinc-700" />
                <span>{course.role}</span>
              </div>
            </Link>
          ))}
        </div>
      </PhaseBlock>
    </div>
  );
}

function PhaseBlock({
  step,
  headline,
  eyebrow,
  icon,
  children,
}: {
  step: EnginePhaseStep;
  headline: string;
  eyebrow: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <header className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">
            {step.label} · {step.subtitle}
          </p>
          <h3 className="mt-1 text-sm font-black leading-6 text-white sm:text-base">{headline}</h3>
          <p className="mt-1 text-[10px] text-zinc-500">{eyebrow}</p>
        </div>
      </header>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
