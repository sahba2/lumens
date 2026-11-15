/**
 * LUMENS - AI Architecture Engine contract
 * ----------------------------------------
 * Types and Persian copy shared by the API routes (server) and the engine
 * dialog (client). Kept free of `server-only` imports so both sides can use
 * exactly the same vocabulary - one place to change an error message or a
 * progressive status label.
 */

import type { ArchitectureSheet } from "./architectureEngine";

/* ------------------------------------------------------------------ */
/*  Image rendering vocabulary                                        */
/* ------------------------------------------------------------------ */

/** Aspect ratios accepted by `/api/render/generate`. */
export type RenderAspectRatio = "16:9" | "1:1" | "4:3";

export interface AspectRatioOption {
  id: RenderAspectRatio;
  /** Persian label shown in the dialog. */
  label: string;
  /** Human readable ratio, e.g. `۱۶:۹`. */
  ratio: string;
  hint: string;
}

export const ASPECT_RATIO_OPTIONS: readonly AspectRatioOption[] = [
  { id: "16:9", label: "نمای سینمایی", ratio: "۱۶:۹", hint: "هیرو شات بیرونی و پرسپکتیو وسیع" },
  { id: "4:3", label: "نمای متوسط", ratio: "۴:۳", hint: "پرسپکتیو متعادل برای شیت ارائه" },
  { id: "1:1", label: "مربع", ratio: "۱:۱", hint: "پست شبکه‌های اجتماعی و اینفوگرافیک" },
];

/** Safe narrowing helper for request payloads and query strings. */
export function isRenderAspectRatio(value: unknown): value is RenderAspectRatio {
  return value === "16:9" || value === "1:1" || value === "4:3";
}

export function aspectRatioLabel(value: RenderAspectRatio): string {
  return ASPECT_RATIO_OPTIONS.find((option) => option.id === value)?.ratio ?? value;
}

/* ------------------------------------------------------------------ */
/*  Engine sheet endpoint                                             */
/* ------------------------------------------------------------------ */

export interface EngineSheetRequest {
  brief: string;
  /** Optional client-side project reference, echoed for traceability. */
  projectId?: string;
}

export interface EngineSheetSuccess {
  success: true;
  /** Text phases 1, 2, 4 and 5 are 100% free and unlimited. */
  free: true;
  projectId: string | null;
  sheet: ArchitectureSheet;
}

export interface EngineSheetFailure {
  success: false;
  code: EngineErrorCode;
  error: string;
}

export type EngineErrorCode = "invalid-request" | "engine-error";

/* ------------------------------------------------------------------ */
/*  Render quota endpoint                                             */
/* ------------------------------------------------------------------ */

export interface RenderQuotaResponse {
  success: true;
  authenticated: boolean;
  /** Free renders available to this account (0 for guests). */
  remainingCredits: number;
  /** Free renders granted per registered account. */
  limit: number;
  used: number;
  /** True when the provider answered "ready" during the last check. */
  providerReady?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Render generate endpoint                                          */
/* ------------------------------------------------------------------ */

export interface RenderGenerateRequest {
  prompt: string;
  aspectRatio?: RenderAspectRatio;
  projectId?: string;
}

export interface RenderGenerateSuccess {
  success: true;
  /** Same-origin URL (proxy) or data URL the browser can display directly. */
  imageUrl: string;
  /** URL that forces a file download through the proxy / anchor. */
  downloadUrl: string;
  remainingCredits: number;
  aspectRatio: RenderAspectRatio;
  provider: ImageProviderId;
  generatedAt: string;
  projectId: string | null;
}
export type RenderErrorCode =
  | "unauthenticated"
  | "quota-exhausted"
  | "invalid-request"
  | "unconfigured"
  | "unauthorized"
  | "rate-limited"
  | "timeout"
  | "pending"
  | "upstream"
  | "empty-response";

/**
 * Persian copy for every failure path. Rendered verbatim by the dialog so the
 * API never leaks provider wording (or a raw stack trace) to the user.
 */
export const RENDER_ERROR_MESSAGES: Record<RenderErrorCode, string> = {
  unauthenticated: "برای رندر تصویر ابتدا وارد حساب کاربری خود شوید.",
  "quota-exhausted":
    "سهمیه رندر رایگان شما به پایان رسیده است. فازهای متنی موتور همچنان رایگان و نامحدود است.",
  "invalid-request": "پرامپت یا نسبت تصویر معتبر نیست؛ لطفاً ورودی را بازبینی کنید.",
  unconfigured:
    "سرویس رندر تصویر هنوز روی سرور پیکربندی نشده است. کلید IMAGE_GEN_API_KEY را در فایل .env.local قرار دهید.",
  unauthorized: "کلید سرویس رندر تصویر معتبر نیست یا دسترسی آن لغو شده است.",
  "rate-limited": "سرویس رندر تصویر شلوغ است؛ چند لحظه بعد دوباره تلاش کنید.",
  timeout: "زمان پاسخ سرویس رندر بیش از حد طول کشید؛ لطفاً دوباره تلاش کنید.",
  pending: "رندر در صف سرویس باقی مانده است؛ چند لحظه بعد دوباره تلاش کنید.",
  upstream: "سرویس رندر تصویر با خطا مواجه شد؛ دوباره تلاش کنید.",
  "empty-response": "سرویس رندر تصویری برنگرداند؛ پرامپت را اصلاح و دوباره تلاش کنید.",
};

/** HTTP status per failure code (keeps every route consistent). */
export const RENDER_ERROR_STATUS: Record<RenderErrorCode, number> = {
  unauthenticated: 401,
  "quota-exhausted": 402,
  "invalid-request": 400,
  unconfigured: 503,
  unauthorized: 502,
  "rate-limited": 429,
  timeout: 504,
  pending: 409,
  upstream: 502,
  "empty-response": 502,
};

export function renderErrorCopy(code: RenderErrorCode): string {
  return RENDER_ERROR_MESSAGES[code];
}

/* ------------------------------------------------------------------ */
/*  Progressive render status (real state, never a timer)             */
/* ------------------------------------------------------------------ */

/**
 * The four progressive statuses required by the engine. Each one is bound to
 * a real lifecycle event in `EngineModal`:
 *
 *   0. POST /api/engine/sheet is in flight (concept + zoning)
 *   1. sheet received, calibrated prompt being chosen / edited
 *   2. POST /api/render/generate is in flight (FLUX runs server-side)
 *   3. image received, the browser decodes it to compose the final board
 */
export const RENDER_PROGRESS_STEPS = [
  "تحلیل برنامه فیزیکی و تولید کانسپت...",
  "مهندسی پرامپت متریال و نورپردازی...",
  "در حال رندر تصویر با موتور FLUX در بک‌اند...",
  "تدوین شیت نهایی معماری...",
] as const;

export type RenderProgressStep = (typeof RENDER_PROGRESS_STEPS)[number];


export interface RenderGenerateFailure {
  success: false;
  code: RenderErrorCode;
  /** Ready-to-render Persian message; never contains provider credentials. */
  error: string;
  remainingCredits: number;
  authenticated: boolean;
}

export type RenderGenerateResponse = RenderGenerateSuccess | RenderGenerateFailure;

export type ImageProviderId = "openai" | "fal" | "replicate" | "huggingface" | "demo" | "none";
