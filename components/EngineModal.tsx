"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import {
  ENGINE_PHASE_COUNT,
  ENGINE_RUNTIME_MS,
  IDEA_PRESETS,
  PHASE_STEPS,
  buildIdeaFilename,
  formatIdeaBrief,
  isAbortError,
  processArchitecturalIdea,
  type ArchitecturalIdeaResult,
} from "@/lib/aiEngine";
import { toPersianDigits } from "@/lib/data";

import EngineResults from "./engine/EngineResults";
import {
  IconBolt,
  IconBook,
  IconBrain,
  IconCheck,
  IconClose,
  IconCopy,
  IconCube,
  IconDownload,
  IconLayers,
  IconSparkles,
} from "./Icons";

type EngineStatus = "idle" | "running" | "done" | "error";

interface EngineModalProps {
  open: boolean;
  /** Pre-filled brief; when it is valid the engine starts automatically. */
  initialPrompt?: string;
  onClose: () => void;
}

const statusLabel: Record<EngineStatus, string> = {
  idle: "STANDBY",
  running: "PROCESSING",
  done: "COMPLETE",
  error: "INTERRUPTED",
};

/** Keeps the brief short enough for the mock engine to analyse precisely. */
const MAX_BRIEF_LENGTH = 280;

const phaseIcons = {
  concept: IconBrain,
  plan: IconLayers,
  materials: IconCube,
  courses: IconBook,
} as const;

/**
 * Full-screen idea-processing dialog: brief form, four-phase tracker,
 * progressive progress bar and the structured proposal with copy/download
 * export. Cancels in-flight runs on close through an AbortController.
 */
export default function EngineModal({ open, initialPrompt = "", onClose }: EngineModalProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [result, setResult] = useState<ArchitecturalIdeaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const start = useCallback(async (raw: string) => {
    const brief = raw.trim();

    if (brief.length < 3) {
      setFormError("ایده خود را با حداقل سه حرف بنویسید تا موتور بتواند آن را تحلیل کند.");
      setStatus("idle");
      setPhaseIndex(-1);
      setResult(null);
      textareaRef.current?.focus();
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;

    setPrompt(brief);
    setFormError(null);
    setError(null);
    setResult(null);
    setCopied(false);
    setStatus("running");
    setPhaseIndex(0);

    try {
      const next = await processArchitecturalIdea(brief, {
        signal: controller.signal,
        onPhase: (index) => {
          if (runIdRef.current === runId) setPhaseIndex(index);
        },
      });
      if (runIdRef.current !== runId) return;
      setResult(next);
      setPhaseIndex(ENGINE_PHASE_COUNT - 1);
      setStatus("done");
    } catch (caught) {
      if (runIdRef.current !== runId || isAbortError(caught)) return;
      setError(caught instanceof Error ? caught.message : "پردازش ایده با خطا مواجه شد؛ دوباره تلاش کنید.");
      setStatus("error");
    }
  }, []);

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    onCloseRef.current();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void start(prompt);
  };

  const handleReset = () => {
    abortRef.current?.abort();
    runIdRef.current += 1;
    setStatus("idle");
    setPhaseIndex(-1);
    setResult(null);
    setError(null);
    setFormError(null);
    setCopied(false);
    textareaRef.current?.focus();
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = formatIdeaBrief(result);

    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
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

    setCopied(true);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([formatIdeaBrief(result)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildIdeaFilename(result);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Open / close lifecycle: seed the brief, auto-run valid prompts, abort the
  // current run when the dialog closes and lock background scrolling.
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }

    const seed = initialPrompt.trim();
    setPrompt(initialPrompt);
    runIdRef.current += 1;
    abortRef.current?.abort();
    setStatus("idle");
    setPhaseIndex(-1);
    setResult(null);
    setError(null);
    setFormError(null);
    setCopied(false);

    if (seed.length >= 3) {
      void start(seed);
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);

    const focusTimer = window.setTimeout(() => {
      if (seed.length === 0) textareaRef.current?.focus();
      else panelRef.current?.focus();
    }, 90);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialPrompt]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (status === "done") {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [status]);

  const progress =
    status === "done"
      ? 100
      : phaseIndex < 0
        ? 0
        : Math.min(96, Math.round(((phaseIndex + 0.6) / ENGINE_PHASE_COUNT) * 100));

  if (!open || !mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="engine-dialog-title"
      >
        <div className="absolute inset-0 cursor-pointer" onClick={handleClose} aria-hidden="true" />

        <div
          ref={panelRef}
          tabIndex={-1}
          className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl2 border border-white/10 bg-[#08080b] shadow-card outline-none animate-fade-up"
        >
          <header className="relative shrink-0 border-b border-white/10 bg-gradient-to-l from-gold/[0.09] via-transparent to-transparent px-4 pb-4 pt-4 sm:px-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-line opacity-60" />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex flex-wrap items-center gap-2 text-[9px] font-semibold tracking-widest2 text-gold/80">
                  <IconBrain className="h-3.5 w-3.5" />
                  LUMENS AI ARCHITECTURE ENGINE
                  <span
                    className={`rounded-full px-2 py-0.5 text-[8px] tracking-wider ${
                      status === "running"
                        ? "bg-gold/15 text-gold-light"
                        : status === "done"
                          ? "bg-emerald-400/10 text-emerald-200"
                          : status === "error"
                            ? "bg-rose-400/10 text-rose-200"
                            : "bg-white/[0.06] text-zinc-400"
                    }`}
                  >
                    {statusLabel[status]}
                  </span>
                </span>

                <h2
                  id="engine-dialog-title"
                  className="mt-2 truncate font-display text-base font-black text-white sm:text-xl"
                >
                  {result
                    ? result.projectName
                    : status === "running"
                      ? "در حال پردازش ایده…"
                      : "موتور ایده‌پرداز لومنز"}
                </h2>

                <p className="mt-1 truncate text-[10px] text-zinc-500">
                  {result
                    ? `${result.typologyLabel} · ${result.locationLabel}`
                    : prompt.trim()
                      ? `«${prompt.trim()}»`
                      : `بریف خود را بنویسید؛ ${toPersianDigits(ENGINE_PHASE_COUNT)} فاز پردازش در ${toPersianDigits(
                          ENGINE_RUNTIME_MS / 1000,
                        )} ثانیه`}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="بستن موتور ایده‌پرداز"
                className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-zinc-300 transition-colors duration-300 hover:border-gold/45 hover:text-gold"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-[8px] font-bold tracking-widest2 text-zinc-500">{statusLabel[status]}</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="block h-full rounded-full bg-gradient-to-l from-gold-light via-gold to-gold-deep transition-[width] duration-700 ease-linear"
                  style={{ width: `${progress}%` }}
                />
                {status === "running" ? (
                  <span className="pointer-events-none absolute inset-0 bg-sheen animate-shimmer" />
                ) : null}
              </span>
              <span className="w-9 text-left text-[10px] font-bold text-gold-light tabular-nums">
                {toPersianDigits(progress)}٪
              </span>
            </div>
          </header>
          <div
            ref={bodyRef}
            className="no-scrollbar relative flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"
          >
            {status === "done" && result ? (
              <EngineResults result={result} />
            ) : status === "running" ? (
              <div className="space-y-5">
                <div className="glass-card relative overflow-hidden p-4 sm:p-5">
                  <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />
                  <div className="relative flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">
                        LUMENS PIPELINE · IN PROGRESS
                      </p>
                      <p className="mt-2 text-xs leading-6 text-zinc-300">«{prompt}»</p>
                    </div>
                    <span className="chip border-gold/30 text-gold-light">
                      <IconBolt className="h-3.5 w-3.5" />
                      فاز {toPersianDigits(Math.max(phaseIndex + 1, 1))} از{" "}
                      {toPersianDigits(ENGINE_PHASE_COUNT)}
                    </span>
                  </div>

                  <div className="relative mt-4 grid gap-2 sm:grid-cols-3">
                    {["تحلیل بریف", "پالت متریال", "مسیر یادگیری"].map((label, index) => {
                      const reached = phaseIndex >= index;
                      return (
                        <div
                          key={label}
                          className={`rounded-2xl border px-3 py-2.5 transition-colors duration-500 ${
                            reached
                              ? "border-gold/30 bg-gold/[0.07]"
                              : "border-white/10 bg-white/[0.03]"
                          }`}
                        >
                          <p className="text-[9px] tracking-widest2 text-zinc-500">{label}</p>
                          <p
                            className={`mt-1 font-mono text-[10px] font-bold ${
                              reached ? "text-gold-light" : "text-zinc-600"
                            }`}
                          >
                            {reached ? "READY" : "WAITING"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <PhaseTracker phaseIndex={phaseIndex} />
              </div>
            ) : (
              <form
                id="engine-brief-form"
                onSubmit={handleSubmit}
                className="grid gap-4 lg:grid-cols-[1.35fr_1fr]"
              >
                <div className="glass-card p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="engine-brief"
                      className="inline-flex items-center gap-2 text-xs font-bold text-white"
                    >
                      <IconSparkles className="h-4 w-4 text-gold" />
                      بریف معماری شما
                    </label>
                    <span className="text-[10px] font-medium text-zinc-500 tabular-nums">
                      {toPersianDigits(prompt.trim().length)} / {toPersianDigits(MAX_BRIEF_LENGTH)}
                    </span>
                  </div>

                  <textarea
                    id="engine-brief"
                    ref={textareaRef}
                    value={prompt}
                    onChange={(event) => {
                      setPrompt(event.target.value);
                      if (formError) setFormError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                        event.preventDefault();
                        void start(prompt);
                      }
                    }}
                    rows={4}
                    maxLength={MAX_BRIEF_LENGTH}
                    spellCheck={false}
                    placeholder="مثلاً: ویلای کنسولی در کردان با بتن اکسپوز، حیاط مرکزی و نور طلایی غروب…"
                    aria-invalid={Boolean(formError)}
                    aria-describedby={formError ? "engine-brief-error" : undefined}
                    className="field mt-3 min-h-[132px] resize-none leading-7"
                  />

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] leading-5 text-zinc-500">
                      اشاره به کاربری، سایت، متریال و نور؛ خروجی دقیق‌تر می‌شود.
                    </span>
                    {prompt.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPrompt("");
                          setFormError(null);
                          textareaRef.current?.focus();
                        }}
                        className="text-[10px] font-semibold text-zinc-400 transition-colors duration-300 hover:text-gold"
                      >
                        پاک کردن
                      </button>
                    ) : null}
                  </div>

                  {formError ? (
                    <p
                      id="engine-brief-error"
                      role="alert"
                      className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-[11px] leading-6 text-rose-200"
                    >
                      {formError}
                    </p>
                  ) : null}

                  {error ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-[11px] leading-6 text-rose-200"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">
                      بریف‌های آماده
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {IDEA_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setPrompt(preset);
                            setFormError(null);
                            textareaRef.current?.focus();
                          }}
                          className={`chip text-right transition-colors duration-300 ${
                            prompt === preset
                              ? "border-gold/50 bg-gold/15 text-gold-light"
                              : "hover:border-gold/35 hover:text-white"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">
                      خروجی این اجرا
                    </p>
                    <ul className="mt-3 space-y-2">
                      {PHASE_STEPS.map((step) => {
                        const Icon = phaseIcons[step.id];
                        return (
                          <li key={step.id} className="flex items-start gap-2.5">
                            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-zinc-200">{step.title}</p>
                              <p className="mt-0.5 text-[10px] leading-5 text-zinc-500">
                                {step.description}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-3 border-t border-white/10 pt-3 text-[10px] leading-5 text-zinc-500">
                      کل پردازش حدود {toPersianDigits(ENGINE_RUNTIME_MS / 1000)} ثانیه؛ خروجی‌ها
                      قابل کپی و دانلود هستند.
                    </p>
                  </div>
                </div>
              </form>
            )}
          </div>
          <footer className="relative shrink-0 border-t border-white/10 bg-white/[0.025] px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="hidden max-w-md text-[10px] leading-5 text-zinc-500 sm:block">
                {status === "done"
                  ? "بریف آماده است؛ می‌توانید آن را کپی یا به‌صورت فایل متنی دانلود کنید."
                  : status === "running"
                    ? "پردازش در مرورگر شبیه‌سازی می‌شود و با بستن پنجره یا لغو، متوقف خواهد شد."
                    : status === "error"
                      ? "پردازش ناتمام ماند؛ بریف را دوباره ارسال کنید."
                      : `هر اجرا ${toPersianDigits(ENGINE_PHASE_COUNT)} فاز را در ${toPersianDigits(
                          ENGINE_RUNTIME_MS / 1000,
                        )} ثانیه طی می‌کند.`}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {status === "done" && result ? (
                  <>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-ghost px-4 py-2 text-xs"
                    >
                      <IconSparkles className="h-3.5 w-3.5 text-gold" />
                      ایده جدید
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopy()}
                      className="btn-ghost px-4 py-2 text-xs"
                    >
                      {copied ? (
                        <IconCheck className="h-3.5 w-3.5 text-emerald-300" />
                      ) : (
                        <IconCopy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "کپی شد" : "کپی بریف"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      <IconDownload className="h-3.5 w-3.5" />
                      دانلود بریف
                    </button>
                  </>
                ) : status === "running" ? (
                  <>
                    <span className="chip border-gold/25 text-gold-light">
                      <IconBolt className="h-3.5 w-3.5" />
                      {toPersianDigits(progress)}٪
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-ghost px-4 py-2 text-xs"
                    >
                      <IconClose className="h-3.5 w-3.5" />
                      لغو پردازش
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-ghost px-4 py-2 text-xs"
                    >
                      بستن
                    </button>
                    <button
                      type="submit"
                      form="engine-brief-form"
                      disabled={prompt.trim().length < 3}
                      className="btn-primary px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      <IconBolt className="h-3.5 w-3.5" />
                      {status === "error" ? "تلاش دوباره" : "شروع پردازش ایده"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>,
    document.body,
  );
}

/**
 * Four-step pipeline tracker. Each step reports its own state so the modal can
 * show progress without duplicating the phase copy from `lib/aiEngine`.
 */
function PhaseTracker({ phaseIndex }: { phaseIndex: number }) {
  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">PHASE TRACKER</p>
        <span className="text-[10px] text-zinc-500">
          فاز {toPersianDigits(Math.max(phaseIndex + 1, 1))} از {toPersianDigits(ENGINE_PHASE_COUNT)}
        </span>
      </div>

      <ol className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {PHASE_STEPS.map((step) => {
          const done = step.index < phaseIndex;
          const active = step.index === phaseIndex;
          const Icon = phaseIcons[step.id];
          const stateLabel = done ? "DONE" : active ? "RUNNING" : "QUEUED";

          return (
            <li
              key={step.id}
              aria-current={active ? "step" : undefined}
              className={`relative overflow-hidden rounded-2xl border p-3 transition-colors duration-500 ${
                active
                  ? "border-gold/45 bg-gold/[0.08] shadow-glow-sm"
                  : done
                    ? "border-emerald-300/20 bg-emerald-400/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                    active
                      ? "border-gold/50 bg-gold/15 text-gold-light"
                      : done
                        ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-white/[0.04] text-zinc-500"
                  }`}
                >
                  {done ? <IconCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-semibold tracking-widest2 text-gold/70">
                      {step.label}
                    </span>
                    <span
                      className={`font-mono text-[8px] font-bold tracking-wider ${
                        active
                          ? "text-gold-light"
                          : done
                            ? "text-emerald-200/80"
                            : "text-zinc-600"
                      }`}
                    >
                      {stateLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-bold text-white">{step.title}</p>
                  <p className="mt-1 text-[10px] leading-5 text-zinc-500">{step.description}</p>
                </div>
              </div>

              {active ? (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/10">
                  <span className="block h-full w-1/2 animate-shimmer bg-gradient-to-l from-transparent via-gold to-transparent" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
