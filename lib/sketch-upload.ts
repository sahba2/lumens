/**
 * LUMENS - sketch upload contract
 * -------------------------------
 * Single source of truth for everything the landing drop zone needs to know
 * about a raw architectural sketch / plan:
 *
 *   - the accepted formats and the size ceiling,
 *   - the ready-to-render Persian error copy,
 *   - the deterministic brief that is handed to the idea engine.
 *
 * Deliberately free of React and of browser globals, so the same rules can be
 * reused by the client drop zone, a future `/api/sketch` upload route and any
 * server-side validation without copying a single string.
 */

import { MAX_BRIEF_LENGTH } from "./architectureEngine";
import { toPersianDigits } from "./data";

/** Largest sketch the drop zone accepts (8 MB). */
export const SKETCH_MAX_BYTES = 8 * 1024 * 1024;

/** Raster formats every browser can decode and every provider accepts. */
export const SKETCH_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type SketchMimeType = (typeof SKETCH_ACCEPTED_TYPES)[number];

/** Value for the `<input type="file" accept="…">` attribute. */
export const SKETCH_ACCEPT_ATTRIBUTE = SKETCH_ACCEPTED_TYPES.join(",");

export type SketchRejectionCode = "no-file" | "unsupported-type" | "too-large";

/** The minimum a dropped file must expose to be validated. */
export interface SketchFileDescriptor {
  name: string;
  size: number;
  type: string;
}

export type SketchValidation =
  | { ok: true; mime: SketchMimeType }
  | { ok: false; code: SketchRejectionCode; error: string };

/** Persian copy for every rejection path (shown verbatim by the drop zone). */
export const SKETCH_ERROR_MESSAGES: Record<SketchRejectionCode, string> = {
  "no-file": "فایلی برای بررسی پیدا نشد؛ دوباره تلاش کنید.",
  "unsupported-type": "فقط تصویر PNG، JPG یا WebP قابل استفاده است.",
  "too-large": "حجم فایل بیشتر از ۸ مگابایت است؛ نسخه سبک‌تری از اسکچ بارگذاری کنید.",
};

const UNREADABLE_IMAGE_ERROR = "تصویر خوانده نشد؛ فایل ممکن است آسیب‌دیده یا ناقص باشد.";

/** Persian copy for a file the browser could not decode into an image. */
export function unreadableSketchError(): string {
  return UNREADABLE_IMAGE_ERROR;
}

export function isAcceptedSketchType(type: string): type is SketchMimeType {
  return (SKETCH_ACCEPTED_TYPES as readonly string[]).includes(type);
}

/**
 * Validates a dropped / picked file. Returns the narrowing result so callers
 * never have to re-check `type` before using the MIME value.
 */
export function validateSketchFile(file: SketchFileDescriptor | null | undefined): SketchValidation {
  if (!file) {
    return { ok: false, code: "no-file", error: SKETCH_ERROR_MESSAGES["no-file"] };
  }

  if (!isAcceptedSketchType(file.type)) {
    return { ok: false, code: "unsupported-type", error: SKETCH_ERROR_MESSAGES["unsupported-type"] };
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, code: "no-file", error: SKETCH_ERROR_MESSAGES["no-file"] };
  }

  if (file.size > SKETCH_MAX_BYTES) {
    return { ok: false, code: "too-large", error: SKETCH_ERROR_MESSAGES["too-large"] };
  }

  return { ok: true, mime: file.type };
}

/** `1.4` -> `۱٫۴` (Persian digits with the Persian decimal separator). */
function toPersianDecimal(value: number, fractionDigits: number): string {
  return toPersianDigits(value.toFixed(fractionDigits)).replace(".", "٫");
}

/** Human readable file size with Persian digits: `۲٫۴ مگابایت`. */
export function formatSketchSize(bytes: number | null | undefined): string {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "—";
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${toPersianDigits(Math.max(1, Math.round(kilobytes)))} کیلوبایت`;
  }

  const megabytes = kilobytes / 1024;
  return megabytes >= 10
    ? `${toPersianDigits(Math.round(megabytes))} مگابایت`
    : `${toPersianDecimal(megabytes, 1)} مگابایت`;
}

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);

  while (y) {
    const rest = x % y;
    x = y;
    y = rest;
  }

  return x || 1;
}

/**
 * Friendly aspect label for the preview chips: `۴:۳` for clean ratios and
 * `۱٫۷۸:۱` for everything else (never a long `1920:1080`).
 */
export function describeSketchRatio(width: number | null, height: number | null): string {
  if (!width || !height || width <= 0 || height <= 0) {
    return "—";
  }

  const divisor = greatestCommonDivisor(width, height);
  const ratioWidth = Math.round(width / divisor);
  const ratioHeight = Math.round(height / divisor);

  if (ratioWidth <= 32 && ratioHeight <= 32) {
    return `${toPersianDigits(ratioWidth)}:${toPersianDigits(ratioHeight)}`;
  }

  const ratio = width / height;
  return ratio >= 1
    ? `${toPersianDecimal(ratio, 2)}:۱`
    : `۱:${toPersianDecimal(1 / ratio, 2)}`;
}

export interface SketchBriefInput {
  /** File name or a human label (e.g. the bundled sample). */
  name: string;
  width?: number | null;
  height?: number | null;
}

/**
 * Deterministic brief handed to the idea engine when a sketch is dropped.
 *
 * The visual reference itself never leaves the browser: the engine receives a
 * precise textual description of the sketch, so the request stays small,
 * cacheable and free of personal uploads. Length is clamped to the engine
 * contract (`MAX_BRIEF_LENGTH`).
 */
export function buildSketchBrief(input: SketchBriefInput): string {
  const name = input.name.trim() || "اسکچ دستی";
  const dimensions =
    input.width && input.height
      ? `${toPersianDigits(input.width)}×${toPersianDigits(input.height)} پیکسل (نسبت ${describeSketchRatio(input.width, input.height)})`
      : "ابعاد نامشخص";

  const brief = `بازطراحی معماری بر اساس اسکچ ارسالی «${name}» با ابعاد ${dimensions}؛ خطوط، تناسبات و پلان اسکچ حفظ شود و خروجی شامل کانسپت، تکتونیک متریال، شیت پنج‌فازی و پرامپت رندر سینمایی باشد.`;

  return brief.slice(0, MAX_BRIEF_LENGTH);
}
