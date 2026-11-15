"use client";

import type { RenderKind, RenderPrompt } from "@/lib/architectureEngine";

import { IconBolt } from "../Icons";

interface RenderImageButtonProps {
  /** The exact prompt of this card - it is what gets POSTed. */
  prompt: RenderPrompt;
  /** True while this card's prompt is being rendered. */
  busy?: boolean;
  /** True while the free-render quota is being read (before the POST). */
  checkingCredits?: boolean;
  /** True when an image already exists for this prompt. */
  rendered?: boolean;
  /** Disable interactions while another render is in flight. */
  disabled?: boolean;
  /** Persian error that belongs to this prompt (shown under the button). */
  error?: string | null;
  /** onclick -> parent pipeline -> POST /api/render/generate. */
  onRender: (prompt: RenderPrompt, renderKind: RenderKind) => void;
  className?: string;
}

/**
 * The "رندر تصویر" button of a prompt card. Its only job is to fire the real
 * render pipeline for **this card's prompt**; the request itself
 * (`GET /api/render/quota` then `POST /api/render/generate`) is executed by
 * `EngineModal` through `lib/render-client.ts`, which then feeds the returned
 * image back into the card and the architectural board.
 */
export default function RenderImageButton({
  prompt,
  busy = false,
  checkingCredits = false,
  rendered = false,
  disabled = false,
  error = null,
  onRender,
  className = "",
}: RenderImageButtonProps) {
  const label = busy
    ? checkingCredits
      ? "بررسی سهمیه…"
      : "در حال رندر…"
    : rendered
      ? "رندر مجدد"
      : "رندر تصویر";

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => onRender(prompt, prompt.id)}
        disabled={disabled || busy}
        aria-busy={busy}
        aria-label={`${label} — ${prompt.titleFa}`}
        data-endpoint="/api/render/generate"
        data-prompt-id={prompt.id}
        title="ارسال پرامپت این کارت با POST به /api/render/generate"
        className={`inline-flex items-center gap-1 rounded-full border border-gold/35 bg-gold/10 px-2.5 py-1 text-[9px] font-semibold text-gold-light transition-colors hover:border-gold/60 hover:bg-gold/15 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {busy ? (
          <span className="h-3 w-3 animate-spin rounded-full border border-gold/40 border-t-gold" />
        ) : (
          <IconBolt className="h-3 w-3" />
        )}
        {label}
      </button>

      {error ? (
        <p className="max-w-[220px] text-right text-[9px] leading-4 text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
