"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import EngineModal from "@/components/EngineModal";
import {
  IconArrowLeft,
  IconBolt,
  IconClose,
  IconImage,
  IconSparkles,
  IconUpload,
} from "@/components/Icons";
import { toPersianDigits } from "@/lib/data";
import {
  SKETCH_ACCEPT_ATTRIBUTE,
  buildSketchBrief,
  describeSketchRatio,
  formatSketchSize,
  unreadableSketchError,
  validateSketchFile,
} from "@/lib/sketch-upload";

interface SketchDropzoneProps {
  /** Extra classes for the outer wrapper (layout only, never colours). */
  className?: string;
}

/** A sketch that is currently staged in the drop zone. */
interface StagedSketch {
  /** Object URL for a user file, static path for the bundled sample. */
  url: string;
  name: string;
  /** `null` for the bundled sample (no real upload happened). */
  size: number | null;
  width: number | null;
  height: number | null;
  sample: boolean;
}

/**
 * The bundled example so a first-time visitor can try the flow without
 * uploading anything. It is a local SVG (`public/ai-engine`), never a remote
 * asset, which keeps the "no external images" rule of the design standard.
 */
const SAMPLE_SKETCH = {
  url: "/ai-engine/villa-sketch.svg",
  name: "اسکچ نمونه · ویلای کردان",
} as const;

/** Reads real pixel dimensions so the preview can show an honest ratio. */
function readImageSize(url: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

/**
 * Hero drop zone of the landing page: the single, unambiguous entry point of
 * the product.
 *
 *   idle    -> "طرح خام یا اسکچ را رها کنید" (drop, click or paste)
 *   staged  -> live preview + name / size / ratio, replace or remove
 *   action  -> builds a deterministic brief and opens the real AI engine
 *
 * Everything heavy (validation, copy, brief) lives in `lib/sketch-upload.ts`,
 * so this component stays a thin, reusable island: the same drop zone can be
 * mounted on `/realtime-rendering` later without touching the rules.
 *
 * Object URLs are always revoked (replace, remove, unmount) so a long landing
 * session never leaks the uploaded blobs.
 */
export default function SketchDropzone({ className = "" }: SketchDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragDepthRef = useRef(0);
  const requestRef = useRef(0);

  const [sketch, setSketch] = useState<StagedSketch | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [engineOpen, setEngineOpen] = useState(false);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Never leave a blob alive when the hero unmounts (route change, hot reload).
  useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

  const acceptFile = useCallback(
    async (file: File) => {
      const validation = validateSketchFile({ name: file.name, size: file.size, type: file.type });

      if (!validation.ok) {
        setError(validation.error);
        return;
      }

      const url = URL.createObjectURL(file);
      const ticket = requestRef.current + 1;
      requestRef.current = ticket;

      setReading(true);
      setError(null);

      const size = await readImageSize(url);

      // A newer file was dropped while this one was still decoding.
      if (requestRef.current !== ticket) {
        URL.revokeObjectURL(url);
        return;
      }

      setReading(false);

      if (!size || size.width === 0 || size.height === 0) {
        URL.revokeObjectURL(url);
        setError(unreadableSketchError());
        return;
      }

      releaseObjectUrl();
      objectUrlRef.current = url;
      setSketch({
        url,
        name: file.name,
        size: file.size,
        width: size.width,
        height: size.height,
        sample: false,
      });
    },
    [releaseObjectUrl],
  );

  const stageSample = useCallback(() => {
    requestRef.current += 1;
    releaseObjectUrl();
    setReading(false);
    setError(null);
    setSketch({
      url: SAMPLE_SKETCH.url,
      name: SAMPLE_SKETCH.name,
      size: null,
      width: null,
      height: null,
      sample: true,
    });
  }, [releaseObjectUrl]);

  const clearSketch = useCallback(() => {
    requestRef.current += 1;
    releaseObjectUrl();
    setReading(false);
    setError(null);
    setSketch(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [releaseObjectUrl]);

  const openPicker = useCallback(() => {
    setError(null);
    inputRef.current?.click();
  }, []);

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    // Required, otherwise the browser ignores the drop and opens the file.
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setDragging(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) void acceptFile(file);
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const file = event.clipboardData?.files?.[0];
    if (!file) return;
    event.preventDefault();
    void acceptFile(file);
  };

  /** Deterministic engine brief for the staged sketch. */
  const brief = useMemo(
    () =>
      sketch
        ? buildSketchBrief({ name: sketch.name, width: sketch.width, height: sketch.height })
        : "",
    [sketch],
  );

  const zoneClass = [
    "relative overflow-hidden rounded-xl2 border-2 border-dashed p-4 transition-all duration-300 ease-cinema sm:p-5",
    dragging
      ? "border-gold bg-gold/[0.10] shadow-glow"
      : "border-white/15 bg-white/[0.03] hover:border-gold/40 hover:bg-white/[0.05]",
    error ? "border-rose-400/50" : "",
    className,
  ]
    .join(" ")
    .trim();

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={SKETCH_ACCEPT_ATTRIBUTE}
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0] ?? null;
          // Reset so picking the same file twice still fires `change`.
          event.currentTarget.value = "";
          if (file) void acceptFile(file);
        }}
      />

      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest2 text-gold/80">
          <IconBolt className="h-3.5 w-3.5" />
          RENDER BOX · تست رندر رایگان
        </p>
        <span className="chip border-gold/25 bg-gold/[0.08] text-gold-light tabular-nums">
          بدون کارت بانکی
        </span>
      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
        onClick={(event) => {
          // Clicking the empty dashed area opens the picker; the real buttons
          // keep their own behaviour.
          if (!sketch && !(event.target as HTMLElement).closest("button")) openPicker();
        }}
        className={zoneClass}
        data-state={sketch ? "staged" : "idle"}
      >
        <div className="orb -left-14 -top-16 h-40 w-40 bg-gold/10" />
        <div className="orb -bottom-16 right-0 h-36 w-36 bg-teal-400/[0.07]" />

        {sketch ? (
          <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center">
            <div className="render-frame aspect-[4/3] w-full bg-ink-soft">
              {/* Object URLs cannot be optimized by next/image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sketch.url}
                alt={`پیش‌نمایش اسکچ: ${sketch.name}`}
                className="h-full w-full object-contain"
              />
              <span className="chip absolute start-2 top-2 border-gold/30 bg-ink/80 text-gold-light">
                <IconImage className="h-3 w-3" />
                {sketch.sample ? "SAMPLE SKETCH" : "SKETCH READY"}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-semibold tracking-widest2 text-gold/75">
                اسکچ آماده رندر
              </p>
              <p className="mt-1.5 truncate text-sm font-bold text-white" title={sketch.name}>
                {sketch.name}
              </p>

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {sketch.width && sketch.height ? (
                  <span className="chip border-white/10 bg-white/[0.04] text-zinc-300">
                    {toPersianDigits(sketch.width)}×{toPersianDigits(sketch.height)}
                  </span>
                ) : null}
                <span className="chip border-white/10 bg-white/[0.04] text-zinc-300">
                  نسبت {describeSketchRatio(sketch.width, sketch.height)}
                </span>
                <span className="chip border-white/10 bg-white/[0.04] text-zinc-300">
                  {sketch.sample ? "فایل نمونه" : formatSketchSize(sketch.size)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEngineOpen(true)}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  <IconBolt className="h-3.5 w-3.5" />
                  تست رندر رایگان
                  <IconArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={openPicker} className="btn-ghost px-3.5 py-2 text-xs">
                  <IconUpload className="h-3.5 w-3.5" />
                  تعویض اسکچ
                </button>
                <button
                  type="button"
                  onClick={clearSketch}
                  aria-label="حذف اسکچ انتخاب‌شده"
                  className="btn-quiet px-3 py-2 text-xs"
                >
                  <IconClose className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>

              <p className="mt-2.5 text-[10px] leading-5 text-zinc-600">
                اسکچ فقط در مرورگر شما پیش‌نمایش می‌شود؛ موتور AI بریف متنی این اسکچ را بررسی
                می‌کند و شیت پنج‌فازی را می‌سازد.
              </p>
            </div>
          </div>
        ) : (
          <IdleZone dragging={dragging} reading={reading} onPick={openPicker} onSample={stageSample} />
        )}
      </div>

      <p
        role={error ? "alert" : undefined}
        className={`mt-2 min-h-[1.25rem] px-1 text-[10px] leading-5 ${
          error ? "text-rose-300" : "text-zinc-600"
        }`}
      >
        {error ??
          "خروجی مرحله اول (شیت کانسپت و پرامپت‌ها) رایگان و نامحدود است؛ رندر تصویر سهمیه رایگان دارد."}
      </p>

      <EngineModal open={engineOpen} initialPrompt={brief} onClose={() => setEngineOpen(false)} />
    </div>
  );
}

interface IdleZoneProps {
  dragging: boolean;
  reading: boolean;
  onPick: () => void;
  onSample: () => void;
}

/**
 * Empty state of the drop zone. Extracted so the staged/idle markup stays
 * readable and the two states never share accidental styles.
 */
function IdleZone({ dragging, reading, onPick, onSample }: IdleZoneProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/[0.09] text-gold sm:h-14 sm:w-14">
        <IconUpload className="h-5 w-5 sm:h-6 sm:w-6" />
        {dragging ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-2xl border border-gold/50"
          />
        ) : null}
      </span>

      <p className="mt-3.5 font-display text-base font-extrabold leading-7 text-white sm:text-lg">
        {dragging ? "رها کنید تا اسکچ بارگذاری شود" : "کروکی یا تصویر خام را اینجا رها کنید"}
      </p>
      <p className="mt-1.5 max-w-md text-[11px] leading-6 text-zinc-400">
        پلان دستی، کروکی، اسکرین‌شات ویوپورت یا هر تصویر خام معماری؛ PNG، JPG یا WebP تا{" "}
        {toPersianDigits(8)} مگابایت — یا تصویر را همین‌جا{" "}
        <span className="font-semibold text-gold-light">Paste</span> کنید.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onPick}
          disabled={reading}
          className="btn-primary px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {reading ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-ink/40 border-t-ink" />
          ) : (
            <IconBolt className="h-3.5 w-3.5" />
          )}
          {reading ? "در حال خواندن تصویر…" : "تست رندر رایگان"}
        </button>
        <button
          type="button"
          onClick={onSample}
          disabled={reading}
          className="btn-ghost px-3.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconSparkles className="h-3.5 w-3.5 text-gold" />
          امتحان با اسکچ نمونه
        </button>
      </div>
    </div>
  );
}
