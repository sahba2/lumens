"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import {
  BRIEF_PRESETS,
  SHEET_PHASE_COUNT,
  SHEET_PHASE_STEPS,
  buildSheetFilename,
  formatSheetBrief,
  type ArchitectureSheet,
  type RenderKind,
  type RenderPrompt,
} from "@/lib/architectureEngine";
import {
  ASPECT_RATIO_OPTIONS,
  RENDER_ERROR_MESSAGES,
  RENDER_PROGRESS_STEPS,
  aspectRatioLabel,
  type EngineSheetFailure,
  type EngineSheetSuccess,
  type RenderAspectRatio,
} from "@/lib/engine-contract";
import { toPersianDigits } from "@/lib/data";
import { fetchRenderQuota, postRenderRequest } from "@/lib/render-client";

import ArchitecturalBoard, { type BoardRender } from "./engine/ArchitecturalBoard";
import ArchitectureSheetView from "./engine/ArchitectureSheetView";
import {
  IconBolt,
  IconBrain,
  IconCheck,
  IconClose,
  IconCopy,
  IconDownload,
  IconSparkles,
} from "./Icons";

type EngineStatus = "idle" | "planning" | "ready" | "rendering" | "done" | "error";

type RenderStage = 0 | 1 | 2 | 3;

interface EngineModalProps {
  open: boolean;
  /** Pre-filled brief; when it is valid the engine starts automatically. */
  initialPrompt?: string;
  onClose: () => void;
}

interface QuotaState {
  authenticated: boolean;
  remaining: number;
  limit: number;
  providerReady: boolean;
}

/** Live proof of the wire: the last real call the dialog performed. */
interface RequestTrace {
  path: string;
  status: number | null;
  ms: number;
  at: string;
}

const MAX_BRIEF_LENGTH = 600;

const STATUS_LABEL: Record<EngineStatus, string> = {
  idle: "STANDBY",
  planning: "ANALYZING",
  ready: "SHEET READY",
  rendering: "RENDERING",
  done: "COMPLETE",
  error: "INTERRUPTED",
};

const NETWORK_ERROR = "ارتباط با سرور برقرار نشد؛ اتصال خود را بررسی و دوباره تلاش کنید.";

/** Waits until the browser can paint the render (real decode, no fake delay). */
async function decodeImage(url: string): Promise<void> {
  if (typeof window === "undefined") return;

  const image = new window.Image();
  image.src = url;

  if (typeof image.decode === "function") {
    try {
      await image.decode();
      return;
    } catch {
      /* fall through to the onload promise */
    }
  }

  await new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => resolve();
    if (image.complete) resolve();
  });
}

/**
 * LUMENS AI Architecture Engine dialog.
 *
 * Real pipeline, no mock timers:
 *   POST /api/engine/sheet     -> 5-phase sheet (free and unlimited)
 *   POST /api/render/generate  -> FLUX render (3 free credits per account)
 *
 * The four progressive statuses map to those real lifecycle events; credits
 * are read from `/api/render/quota` and refreshed after every render.
 */
export default function EngineModal({ open, initialPrompt = "", onClose }: EngineModalProps) {
  const [mounted, setMounted] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [status, setStatus] = useState<EngineStatus>("idle");
  const [stage, setStage] = useState<RenderStage>(0);
  const [sheet, setSheet] = useState<ArchitectureSheet | null>(null);
  const [render, setRender] = useState<BoardRender | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<RenderKind>("exterior-hero");
  const [renderingPromptId, setRenderingPromptId] = useState<RenderKind | null>(null);
  const [renderErrorPromptId, setRenderErrorPromptId] = useState<RenderKind | null>(null);
  const [checkingCredits, setCheckingCredits] = useState(false);
  const [lastRequest, setLastRequest] = useState<RequestTrace | null>(null);
  const [aspectRatio, setAspectRatio] = useState<RenderAspectRatio>("16:9");
  const [quota, setQuota] = useState<QuotaState | null>(null);
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

  /**
   * Reads the free-render credits of the signed-in account. Server-side the
   * same numbers come from `.data/render-credits.json` (see `lib/render-quota`),
   * so this is the source of truth the dialog checks *before* POSTing.
   */
  const readQuota = useCallback(async (): Promise<QuotaState | null> => {
    const snapshot = await fetchRenderQuota();
    if (!snapshot) return null;

    const next: QuotaState = {
      authenticated: snapshot.authenticated,
      remaining: snapshot.remainingCredits,
      limit: snapshot.limit,
      providerReady: snapshot.providerReady,
    };

    setQuota(next);
    return next;
  }, []);

  const refreshQuota = useCallback(async () => {
    await readQuota();
  }, [readQuota]);

  const requestSheet = useCallback(
    async (raw: string) => {
      const brief = raw.trim().replace(/\s+/g, " ");

      if (brief.length < 3) {
        setFormError("ایده خود را با حداقل سه حرف بنویسید تا موتور بتواند آن را تحلیل کند.");
        setStatus("idle");
        setStage(0);
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
      setSheet(null);
      setRender(null);
      setCopied(false);
      setStatus("planning");
      setStage(0);

      try {
        const response = await fetch("/api/engine/sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief }),
          signal: controller.signal,
        });
        const data = (await response.json()) as EngineSheetSuccess | EngineSheetFailure;

        if (runIdRef.current !== runId) return;

        if (!response.ok || !data.success) {
          setError(
            data.success ? RENDER_ERROR_MESSAGES.upstream : data.error || "تولید شیت ناموفق بود.",
          );
          setStatus("error");
          return;
        }

        const next = data.sheet;
        const firstPrompt = next.prompts[0];
        setSheet(next);
        setSelectedPromptId(firstPrompt?.id ?? "exterior-hero");
        setAspectRatio(firstPrompt?.aspectRatio ?? "16:9");
        // Stage 1 = the calibrated prompt is on screen and selectable.
        setStage(1);
        setStatus("ready");
        void refreshQuota();
      } catch (caught) {
        if (runIdRef.current !== runId) return;
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setError(NETWORK_ERROR);
        setStatus("error");
      }
    },
    [refreshQuota],
  );

  const selectedPrompt =
    sheet?.prompts.find((item) => item.id === selectedPromptId) ?? sheet?.prompts[0] ?? null;

  const requestRender = useCallback(
    async (targetPrompt?: RenderPrompt) => {
      // The card buttons pass their own prompt; the footer button uses the
      // currently selected one. Either way this is a real POST below.
      const target = targetPrompt ?? selectedPrompt;
      if (!sheet || !target) return;

      const ratio = targetPrompt ? targetPrompt.aspectRatio : aspectRatio;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      const startedAt = Date.now();

      setError(null);
      setRender(null);
      setRenderingPromptId(target.id);
      setRenderErrorPromptId(null);
      setStatus("rendering");
      setStage(2);
      setCheckingCredits(true);

      // 1) Free renders are checked first: GET /api/render/quota reads
      //    .data/render-credits.json server-side. No POST happens below when
      //    the visitor is a guest or the quota is already exhausted.
      const quotaStartedAt = Date.now();
      const preflight = await readQuota();
      setCheckingCredits(false);
      setLastRequest({
        path: "GET /api/render/quota",
        status: preflight ? 200 : null,
        ms: Date.now() - quotaStartedAt,
        at: new Date().toISOString(),
      });

      if (runIdRef.current !== runId) return;

      if (!preflight) {
        setRenderingPromptId(null);
        setRenderErrorPromptId(target.id);
        setError("بررسی سهمیه رندر ممکن نشد؛ اتصال خود را بررسی و دوباره تلاش کنید.");
        setStatus("error");
        setStage(1);
        return;
      }

      if (!preflight.authenticated) {
        setRenderingPromptId(null);
        setRenderErrorPromptId(target.id);
        setError(RENDER_ERROR_MESSAGES.unauthenticated);
        setStatus("error");
        setStage(1);
        return;
      }

      if (preflight.remaining <= 0) {
        setRenderingPromptId(null);
        setRenderErrorPromptId(target.id);
        setError(RENDER_ERROR_MESSAGES["quota-exhausted"]);
        setStatus("error");
        setStage(1);
        return;
      }

      // 2) Quota is available -> send the real generation request.
      try {
        const result = await postRenderRequest({
          prompt: target.prompt,
          negativePrompt: target.negativePrompt,
          aspectRatio: ratio,
          projectId: sheet.id,
          signal: controller.signal,
        });

        if (runIdRef.current !== runId) return;

        setLastRequest({
          path: "POST /api/render/generate",
          status: result.status || null,
          ms: Date.now() - startedAt,
          at: new Date().toISOString(),
        });

        if (!result.ok) {
          setRenderingPromptId(null);
          setRenderErrorPromptId(target.id);
          setQuota((current) =>
            current
              ? {
                  ...current,
                  authenticated: result.authenticated,
                  remaining: result.remainingCredits,
                }
              : current,
          );
          setError(result.error);
          setStatus("error");
          setStage(1);
          return;
        }

        // Stage 3 = the browser decodes the final image to compose the board.
        setStage(3);
        await decodeImage(result.imageUrl);
        if (runIdRef.current !== runId) return;

        setRender({
          promptId: target.id,
          imageUrl: result.imageUrl,
          downloadUrl: result.downloadUrl,
          promptTitleFa: target.titleFa,
          promptTitleEn: target.titleEn,
          aspectRatio: result.aspectRatio,
          generatedAt: result.generatedAt,
          elapsedMs: Date.now() - startedAt,
          provider: result.provider,
        });
        setQuota((current) => ({
          authenticated: true,
          remaining: result.remainingCredits,
          limit: current?.limit ?? 0,
          providerReady: current?.providerReady ?? true,
        }));
        setRenderingPromptId(null);
        setRenderErrorPromptId(null);
        setStatus("done");
        void refreshQuota();
      } catch (caught) {
        if (runIdRef.current !== runId) return;
        if (caught instanceof DOMException && caught.name === "AbortError") return;
        setRenderingPromptId(null);
        setRenderErrorPromptId(target.id);
        setLastRequest({
          path: "POST /api/render/generate",
          status: null,
          ms: Date.now() - startedAt,
          at: new Date().toISOString(),
        });
        setError(NETWORK_ERROR);
        setStatus("error");
        setStage(1);
      }
    },
    [sheet, selectedPrompt, aspectRatio, readQuota, refreshQuota],
  );

  const handleClose = useCallback(() => {
    abortRef.current?.abort();
    onCloseRef.current();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void requestSheet(prompt);
  };

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    runIdRef.current += 1;
    setRenderingPromptId(null);
    setRenderErrorPromptId(null);
    setCheckingCredits(false);
    setStatus(sheet ? "ready" : "idle");
    setStage(sheet ? 1 : 0);
  }, [sheet]);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    runIdRef.current += 1;
    setStatus("idle");
    setStage(0);
    setSheet(null);
    setRender(null);
    setRenderingPromptId(null);
    setCheckingCredits(false);
    setRenderErrorPromptId(null);
    setLastRequest(null);
    setError(null);
    setFormError(null);
    setCopied(false);
    window.setTimeout(() => textareaRef.current?.focus(), 60);
  }, []);

  const handleCopySheet = async () => {
    if (!sheet) return;
    const text = formatSheetBrief(sheet);

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

    setCopied(true);
  };

  const handleDownloadSheet = () => {
    if (!sheet) return;
    const blob = new Blob([formatSheetBrief(sheet)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildSheetFilename(sheet);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Open / close lifecycle: seed the brief, auto-plan valid prompts, abort the
  // in-flight request on close and lock background scrolling.
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
    setStage(0);
    setSheet(null);
    setRender(null);
    setRenderingPromptId(null);
    setRenderErrorPromptId(null);
    setError(null);
    setFormError(null);
    setCopied(false);
    void refreshQuota();

    if (seed.length >= 3) {
      void requestSheet(seed);
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
    if (status === "done" || status === "ready") {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [status]);

  const progress =
    status === "done"
      ? 100
      : status === "rendering"
        ? stage === 3
          ? 94
          : 58
        : status === "ready"
          ? 38
          : status === "planning"
            ? 14
            : 0;

  const canRender = Boolean(
    sheet && quota?.authenticated && quota.remaining > 0 && quota.providerReady !== false,
  );

  const gateMessage = !quota
    ? "در حال بررسی سهمیه رندر…"
    : !quota.authenticated
      ? "برای رندر تصویر ابتدا وارد حساب کاربری خود شوید."
      : quota.providerReady === false
        ? "سرویس رندر تصویر روی سرور پیکربندی نشده است."
        : quota.remaining <= 0
          ? "سهمیه رندر رایگان شما به پایان رسیده است؛ فازهای متنی نامحدود باقی می‌مانند."
          : null;

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
          className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl2 border border-white/10 bg-[#08080b] shadow-card outline-none animate-fade-up"
        >
          <header className="relative shrink-0 border-b border-white/10 bg-gradient-to-l from-gold/[0.09] via-transparent to-transparent px-4 pb-3.5 pt-4 sm:px-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-line opacity-60" />

            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="inline-flex flex-wrap items-center gap-2 text-[9px] font-semibold tracking-widest2 text-gold/80">
                  <IconBrain className="h-3.5 w-3.5" />
                  LUMENS AI ARCHITECTURE ENGINE
                  <span
                    className={`rounded-full px-2 py-0.5 text-[8px] tracking-wider ${
                      status === "planning" || status === "rendering"
                        ? "bg-gold/15 text-gold-light"
                        : status === "done" || status === "ready"
                          ? "bg-emerald-400/10 text-emerald-200"
                          : status === "error"
                            ? "bg-rose-400/10 text-rose-200"
                            : "bg-white/[0.06] text-zinc-400"
                    }`}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </span>

                <h2
                  id="engine-dialog-title"
                  className="mt-2 truncate font-display text-base font-black text-white sm:text-xl"
                >
                  {sheet
                    ? sheet.projectName
                    : status === "planning"
                      ? "در حال تحلیل بریف…"
                      : "موتور معماری لومنز"}
                </h2>

                <p className="mt-1 truncate text-[10px] text-zinc-500">
                  {sheet
                    ? `${sheet.typology.labelFa} · ${sheet.location.labelFa} · ${toPersianDigits(
                        SHEET_PHASE_COUNT,
                      )} فاز`
                    : prompt.trim()
                      ? `«${prompt.trim()}»`
                      : "بریف پروژه را وارد کنید تا شیت پنج‌فازی و پرامپت‌های رندر ساخته شود."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {quota ? (
                  <span
                    className={`chip text-[9px] ${
                      quota.authenticated && quota.remaining > 0
                        ? "border-gold/25 text-gold-light"
                        : "border-white/10 text-zinc-500"
                    }`}
                  >
                    <IconSparkles className="h-3 w-3" />
                    {quota.authenticated
                      ? `${toPersianDigits(quota.remaining)} رندر رایگان`
                      : "مهمان"}
                  </span>
                ) : null}

                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="بستن پنجره"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-rose-400/40 hover:text-white"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex h-0.5 overflow-hidden rounded-full bg-white/10">
              <span
                className="h-full bg-gradient-to-l from-gold-deep via-gold to-gold-light transition-[width] duration-700 ease-cinema"
                style={{ width: `${progress}%` }}
              />
            </div>
          </header>

          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            {error ? (
              <p
                role="alert"
                className="mb-4 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-[11px] leading-6 text-rose-200"
              >
                {error}
              </p>
            ) : null}

            {!sheet ? (
              <form
                id="engine-brief-form"
                onSubmit={handleSubmit}
                className="grid gap-4 lg:grid-cols-[1.15fr_1fr]"
              >
                <div className="space-y-3">
                  <div className="glass rounded-2xl p-4">
                    <label
                      htmlFor="engine-brief"
                      className="text-[10px] font-semibold tracking-widest2 text-gold/80"
                    >
                      بریف پروژه
                    </label>
                    <textarea
                      id="engine-brief"
                      ref={textareaRef}
                      value={prompt}
                      onChange={(event) => {
                        setPrompt(event.target.value);
                        setFormError(null);
                      }}
                      rows={5}
                      maxLength={MAX_BRIEF_LENGTH}
                      disabled={status === "planning"}
                      placeholder="مثال: مرکز پژوهش معماری با حیاط فرورفته در اصفهان، بتن اکسپوز و شیشه ساختاری..."
                      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs leading-6 text-zinc-200 outline-none transition-colors placeholder:text-zinc-600 focus:border-gold/50 disabled:opacity-60"
                    />
                    <div className="mt-2 flex items-center justify-between gap-2 text-[9px] text-zinc-600">
                      <span>خروجی متنی (فاز ۱، ۲، ۴، ۵) رایگان و نامحدود است.</span>
                      <span className="font-mono">
                        {toPersianDigits(prompt.trim().length)}/{toPersianDigits(MAX_BRIEF_LENGTH)}
                      </span>
                    </div>

                    {formError ? (
                      <p
                        role="alert"
                        className="mt-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-[10px] leading-5 text-rose-200"
                      >
                        {formError}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={prompt.trim().length < 3 || status === "planning"}
                      className="btn-primary mt-3 w-full justify-center px-4 py-2.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      <IconBolt className="h-3.5 w-3.5" />
                      {status === "planning" ? "در حال تحلیل…" : "تولید شیت پنج‌فازی"}
                    </button>
                  </div>

                  <div className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">
                      بریف‌های آماده
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {BRIEF_PRESETS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          disabled={status === "planning"}
                          onClick={() => {
                            setPrompt(preset);
                            setFormError(null);
                            void requestSheet(preset);
                          }}
                          className="chip text-right transition-colors duration-300 hover:border-gold/35 hover:text-white disabled:opacity-50"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">
                      خروجی شیت
                    </p>
                    <ul className="mt-3 space-y-2">
                      {SHEET_PHASE_STEPS.map((step) => (
                        <li key={step.id} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-[8px] font-bold text-gold-light">
                            {toPersianDigits(step.index + 1)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-zinc-200">{step.title}</p>
                            <p className="mt-0.5 text-[10px] leading-5 text-zinc-500">
                              {step.description}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass rounded-2xl p-4">
                    <p className="text-[10px] font-semibold tracking-widest2 text-gold/80">
                      سهمیه رندر تصویر
                    </p>
                    <p className="mt-2 text-[10px] leading-6 text-zinc-400">
                      هر حساب کاربری {toPersianDigits(quota?.limit ?? 3)} رندر رایگان دارد؛ کلید
                      سرویس رندر تنها روی سرور نگهداری می‌شود و به مرورگر نمی‌رسد.
                    </p>
                    {quota && !quota.authenticated ? (
                      <a
                        href="/auth/login"
                        className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-gold-light hover:text-gold"
                      >
                        ورود به حساب برای رندر
                        <IconSparkles className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </form>
            ) : null}

            {status === "planning" ? <ProgressRail stage={0} /> : null}

            {sheet ? (
              <div className="space-y-4">
                {/* ------------------------------------------- render controls */}
                <div className="rounded-2xl border border-gold/25 bg-gold/[0.05] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold tracking-widest2 text-gold/80">
                        PHASE 3 · RENDER
                      </p>
                      <p className="mt-1 text-xs font-bold text-white">
                        {selectedPrompt
                          ? `${selectedPrompt.titleFa} · ${selectedPrompt.titleEn}`
                          : "پرامپت رندر"}
                      </p>
                      <p className="mt-1 text-[10px] leading-5 text-zinc-400">
                        نسبت تصویر {aspectRatioLabel(aspectRatio)}
                        {selectedPrompt ? ` · ${selectedPrompt.cameraFa}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {ASPECT_RATIO_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAspectRatio(option.id)}
                          disabled={status === "rendering"}
                          title={option.hint}
                          className={`chip transition-colors duration-300 disabled:opacity-50 ${
                            aspectRatio === option.id
                              ? "border-gold/50 bg-gold/15 text-gold-light"
                              : "hover:border-gold/35 hover:text-white"
                          }`}
                        >
                          {option.ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <p className="max-w-md text-[10px] leading-5 text-zinc-500">
                      {gateMessage ??
                        (quota
                          ? `${toPersianDigits(quota.remaining)} رندر از ${toPersianDigits(
                              quota.limit,
                            )} سهمیه رایگان باقی مانده است.`
                          : "سهمیه رندر در حال بررسی است…")}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={status === "rendering"}
                        className="btn-ghost px-3 py-2 text-[11px] disabled:opacity-50"
                      >
                        <IconSparkles className="h-3.5 w-3.5 text-gold" />
                        بریف جدید
                      </button>
                      <button
                        type="button"
                        onClick={() => void requestRender()}
                        disabled={status === "rendering"}
                        title={gateMessage ?? "ارسال پرامپت به موتور رندر FLUX"}
                        data-gated={canRender ? undefined : "true"}
                        className="btn-primary px-4 py-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none data-[gated=true]:opacity-90"
                      >
                        <IconBolt className="h-3.5 w-3.5" />
                        {checkingCredits
                          ? "بررسی سهمیه…"
                          : status === "rendering"
                            ? "در حال رندر…"
                            : "رندر تصویر با FLUX"}
                      </button>
                    </div>
                  </div>

                  {lastRequest ? (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-2">
                      <p
                        dir="ltr"
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[9px] text-zinc-400"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            lastRequest.status !== null && lastRequest.status < 400
                              ? "bg-emerald-400"
                              : "bg-rose-400"
                          }`}
                        />
                        {lastRequest.path} · {lastRequest.status ?? "network-error"} ·{" "}
                        {(lastRequest.ms / 1000).toFixed(1)}s
                      </p>
                      <p className="text-[9px] text-zinc-600">
                        آخرین درخواست واقعی این گفت‌وگو با بک‌اند
                      </p>
                    </div>
                  ) : null}
                </div>

                {status === "ready" ? (
                  <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <IconCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                    <p className="text-[11px] leading-5 text-zinc-300">
                      {RENDER_PROGRESS_STEPS[1]}
                      <span className="ms-2 text-[10px] text-zinc-500">
                        پرامپت آماده است؛ یکی از سه پرامپت را انتخاب و رندر کنید.
                      </span>
                    </p>
                  </div>
                ) : null}

                {status === "rendering" ? <ProgressRail stage={stage === 3 ? 3 : 2} /> : null}

                {status === "rendering" ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
                    <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent">
                      <span className="pointer-events-none absolute inset-0 animate-shimmer bg-gradient-to-l from-transparent via-gold/10 to-transparent" />
                      <div className="relative px-4 text-center">
                        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                        </span>
                        <p className="mt-3 text-[11px] font-bold text-white">
                          {checkingCredits
                            ? "بررسی سهمیه رندر رایگان…"
                            : "در حال رندر تصویر با FLUX…"}
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-zinc-500">
                          {checkingCredits
                            ? "خواندن render-credits.json روی سرور و تأیید اعتبار حساب"
                            : "پرامپت به /api/render/generate ارسال شد و منتظر پاسخ سرویس هستیم"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {status === "done" && render ? (
                  <ArchitecturalBoard
                    sheet={sheet}
                    render={render}
                    remainingCredits={quota?.remaining ?? 0}
                    canRegenerate
                    onRegenerate={() => void requestRender()}
                    onNewBrief={handleReset}
                  />
                ) : null}

                <div className="flex items-center justify-between gap-2 px-1">
                  <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">
                    SHEET · {toPersianDigits(SHEET_PHASE_COUNT)} PHASES
                  </p>
                  <p className="text-[9px] text-zinc-600">
                    {sheet.presentation.titleFa} · {sheet.metadata.scale}
                  </p>
                </div>

                <ArchitectureSheetView
                  sheet={sheet}
                  selectedPromptId={selectedPromptId}
                  onSelectPrompt={setSelectedPromptId}
                  disabled={status === "rendering"}
                  renderPreview={render}
                  renderingPromptId={renderingPromptId}
                  checkingCredits={checkingCredits}
                  renderErrorPromptId={renderErrorPromptId}
                  renderError={error}
                  onRenderPrompt={(next) => {
                    // The clicked card's own prompt is what gets POSTed.
                    setSelectedPromptId(next.id);
                    setAspectRatio(next.aspectRatio);
                    void requestRender(next);
                  }}
                />
              </div>
            ) : null}
          </div>

          <footer className="relative shrink-0 border-t border-white/10 bg-white/[0.025] px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="hidden max-w-md text-[10px] leading-5 text-zinc-500 sm:block">
                {status === "done"
                  ? "شیت و رندر نهایی آماده‌اند؛ می‌توانید رندر را دانلود یا بریف جدیدی بسازید."
                  : status === "rendering"
                    ? "رندر روی سرور در حال انجام است؛ لغو پیش از پاسخ، سهمیه را مصرف نمی‌کند."
                    : status === "ready"
                      ? "فازهای متنی رایگان‌اند؛ رندر تصویر از سهمیه حساب شما کم می‌کند."
                      : status === "error"
                        ? "پردازش ناتمام ماند؛ بریف را دوباره ارسال کنید."
                        : "خروجی هر اجرا قابل کپی و دانلود به‌صورت فایل متنی است."}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {status === "planning" || status === "rendering" ? (
                  <>
                    <span className="chip border-gold/25 text-gold-light">
                      <IconBolt className="h-3.5 w-3.5" />
                      {toPersianDigits(progress)}٪
                    </span>
                    <button type="button" onClick={handleCancel} className="btn-ghost px-4 py-2 text-xs">
                      <IconClose className="h-3.5 w-3.5" />
                      {status === "rendering" ? "لغو رندر" : "لغو پردازش"}
                    </button>
                  </>
                ) : sheet ? (
                  <>
                    <button type="button" onClick={handleReset} className="btn-ghost px-4 py-2 text-xs">
                      <IconSparkles className="h-3.5 w-3.5 text-gold" />
                      ایده جدید
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCopySheet()}
                      className="btn-ghost px-4 py-2 text-xs"
                    >
                      {copied ? (
                        <IconCheck className="h-3.5 w-3.5 text-emerald-300" />
                      ) : (
                        <IconCopy className="h-3.5 w-3.5" />
                      )}
                      {copied ? "کپی شد" : "کپی شیت"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadSheet}
                      className="btn-primary px-4 py-2 text-xs"
                    >
                      <IconDownload className="h-3.5 w-3.5" />
                      دانلود شیت
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={handleClose} className="btn-ghost px-4 py-2 text-xs">
                      بستن
                    </button>
                    <button
                      type="submit"
                      form="engine-brief-form"
                      disabled={prompt.trim().length < 3}
                      className="btn-primary px-5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                    >
                      <IconBolt className="h-3.5 w-3.5" />
                      {status === "error" ? "تلاش دوباره" : "شروع پردازش"}
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
 * Four-step progressive status required by the engine. The highlighted step is
 * bound to real request state (`stage`), never to a timer.
 */
function ProgressRail({ stage }: { stage: RenderStage }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[9px] font-semibold tracking-widest2 text-gold/70">ENGINE PIPELINE</p>
        <span className="text-[9px] text-zinc-600">
          مرحله {toPersianDigits(stage + 1)} از {toPersianDigits(RENDER_PROGRESS_STEPS.length)}
        </span>
      </div>

      <ol className="mt-3 grid gap-2">
        {RENDER_PROGRESS_STEPS.map((step, index) => {
          const done = index < stage;
          const active = index === stage;

          return (
            <li
              key={step}
              aria-current={active ? "step" : undefined}
              className={`relative overflow-hidden rounded-xl border px-3 py-2 transition-colors duration-500 ${
                active
                  ? "border-gold/45 bg-gold/[0.08]"
                  : done
                    ? "border-emerald-300/20 bg-emerald-400/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${
                    active
                      ? "border-gold/50 bg-gold/15 text-gold-light"
                      : done
                        ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                        : "border-white/15 text-zinc-600"
                  }`}
                >
                  {done ? <IconCheck className="h-3 w-3" /> : toPersianDigits(index + 1)}
                </span>
                <p
                  className={`text-[11px] leading-5 ${
                    active ? "font-semibold text-white" : done ? "text-emerald-100/80" : "text-zinc-500"
                  }`}
                >
                  {step}
                </p>
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


