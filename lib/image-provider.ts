/**
 * LUMENS - image generation provider
 * ----------------------------------
 * Server-only adapter for the Mode 2 production flow. One contract, several
 * FLUX.1 / SDXL hosts:
 *
 *   IMAGE_GEN_PROVIDER = openai | fal | replicate | huggingface | demo
 *
 *   openai      any OpenAI-compatible `POST {base}/images/generations`
 *               (OpenAI, Together AI, AvalAI, DeepInfra, ...)
 *   fal         fal.run synchronous endpoint (default `fal-ai/flux/dev`)
 *   replicate   api.replicate.com predictions (default flux-schnell)
 *   huggingface router.huggingface.co/hf-inference (default FLUX.1-schnell)
 *   demo        curated Unsplash architectural renders - used automatically
 *               when no key is configured, so the sheet never looks mocked
 *
 * `IMAGE_GEN_API_KEY` is read here and nowhere else; it is never logged, never
 * returned by an API route and never imported by a client component.
 */

import "server-only";

import type {
  ImageProviderId,
  RenderAspectRatio,
  RenderErrorCode,
} from "./engine-contract";
import { RENDER_ERROR_MESSAGES } from "./engine-contract";

const DEFAULT_TIMEOUT_MS = 60_000;
const FALLBACK_BASE_URLS: Record<Exclude<ImageProviderId, "demo" | "none">, string> = {
  openai: "https://api.openai.com/v1",
  fal: "https://fal.run",
  replicate: "https://api.replicate.com/v1",
  huggingface: "https://router.huggingface.co/hf-inference/models",
};

const FALLBACK_MODELS: Record<Exclude<ImageProviderId, "demo" | "none">, string> = {
  openai: "black-forest-labs/flux-schnell",
  fal: "fal-ai/flux/dev",
  replicate: "black-forest-labs/flux-schnell",
  huggingface: "black-forest-labs/FLUX.1-schnell",
};

/** Pixel size sent to OpenAI-compatible endpoints. */
const OPENAI_SIZE: Record<RenderAspectRatio, string> = {
  "16:9": "1792x1024",
  "1:1": "1024x1024",
  "4:3": "1344x1024",
};

/** fal image_size presets. */
const FAL_SIZE: Record<RenderAspectRatio, string> = {
  "16:9": "landscape_16_9",
  "1:1": "square_hd",
  "4:3": "landscape_4_3",
};

/** Replicate aspect_ratio values understood by the FLUX family. */
const REPLICATE_ASPECT: Record<RenderAspectRatio, string> = {
  "16:9": "16:9",
  "1:1": "1:1",
  "4:3": "4:3",
};

/** Hugging Face needs explicit pixels; FLUX works with multiples of 16. */
const HF_SIZE: Record<RenderAspectRatio, { width: number; height: number }> = {
  "16:9": { width: 1024, height: 576 },
  "4:3": { width: 1024, height: 768 },
  "1:1": { width: 1024, height: 1024 },
};

interface SampleRender {
  id: string;
  url: string;
  ratio: RenderAspectRatio;
  credit: string;
}

/**
 * Curated, real architectural renders bundled in `public/renders/samples`
 * (originally shot/curated on Unsplash). Used as the **sample** output until a
 * real provider key is configured, so the sheet always looks like a finished
 * board - offline, without a CDN dependency and without placeholder art.
 *
 * Override with `IMAGE_SAMPLE_RENDERS="https://…,https://…"` (comma separated).
 */
const SAMPLE_RENDERS: readonly SampleRender[] = [
  {
    id: "concrete-facade",
    url: "/renders/samples/sample-facade-16x9.jpg",
    ratio: "16:9",
    credit: "Unsplash · fair-faced concrete facade",
  },
  {
    id: "modern-villa",
    url: "/renders/samples/sample-villa-16x9.jpg",
    ratio: "16:9",
    credit: "Unsplash · cantilevered villa at dusk",
  },
  {
    id: "villa-terrace",
    url: "/renders/samples/sample-terrace-4x3.jpg",
    ratio: "4:3",
    credit: "Unsplash · villa terrace and water",
  },
  {
    id: "concrete-interior",
    url: "/renders/samples/sample-interior-4x3.jpg",
    ratio: "4:3",
    credit: "Unsplash · microcement interior",
  },
  {
    id: "portal-frame",
    url: "/renders/samples/sample-square-frame.jpg",
    ratio: "1:1",
    credit: "Unsplash · concrete portal frame",
  },
  {
    id: "monolithic-stairs",
    url: "/renders/samples/sample-square-stair.jpg",
    ratio: "1:1",
    credit: "Unsplash · monolithic concrete stair",
  },
];

function samplePool(aspectRatio: RenderAspectRatio): SampleRender[] {
  const overrides = (process.env.IMAGE_SAMPLE_RENDERS ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (overrides.length > 0) {
    return overrides.map((url, index) => ({
      id: `custom-${index}`,
      url,
      ratio: aspectRatio,
      credit: "Sample · IMAGE_SAMPLE_RENDERS",
    }));
  }

  const matching = SAMPLE_RENDERS.filter((item) => item.ratio === aspectRatio);
  return matching.length > 0 ? matching : [...SAMPLE_RENDERS];
}

/** Deterministic sample pick, keeps the same brief on the same image. */
function pickSample(aspectRatio: RenderAspectRatio, seed: string): SampleRender {
  const pool = samplePool(aspectRatio);
  let hash = 0;
  const seedText = `${aspectRatio}:${seed}`;
  for (let index = 0; index < seedText.length; index += 1) {
    hash = (hash * 31 + seedText.charCodeAt(index)) >>> 0;
  }

  return pool[hash % pool.length];
}

export interface ImageProviderConfig {
  provider: ImageProviderId;
  configured: boolean;
  model: string | null;
  /** Host of the upstream endpoint (never includes the key). */
  baseUrlHost: string | null;
  timeoutMs: number;
}

function apiKey(): string {
  return (process.env.IMAGE_GEN_API_KEY ?? "").trim();
}

function baseUrl(): string {
  return (process.env.IMAGE_GEN_BASE_URL ?? "").trim().replace(/\/+$/, "");
}

function timeoutMs(): number {
  const raw = Number.parseInt(process.env.IMAGE_GEN_TIMEOUT_MS ?? "", 10);
  return Number.isFinite(raw) && raw >= 5_000 ? raw : DEFAULT_TIMEOUT_MS;
}

function detectProvider(): ImageProviderId {
  const explicit = (process.env.IMAGE_GEN_PROVIDER ?? "").trim().toLowerCase();

  if (
    explicit === "openai" ||
    explicit === "fal" ||
    explicit === "replicate" ||
    explicit === "huggingface" ||
    explicit === "demo"
  ) {
    return explicit;
  }

  // Friendly aliases.
  if (explicit === "hf" || explicit === "hugging-face" || explicit === "huggingface-inference") {
    return "huggingface";
  }

  if (explicit === "none") {
    return "none";
  }

  // Infer the provider from whatever credentials/URL are present.
  const key = apiKey();
  const host = baseUrl();

  if (/huggingface\.co/i.test(host) || key.startsWith("hf_")) return "huggingface";
  if (/fal\.(run|ai)/i.test(host)) return "fal";
  if (/replicate\.com/i.test(host)) return "replicate";

  // No key yet -> high-quality Unsplash samples instead of an error, so the
  // sheet looks finished while the studio is still wiring its provider.
  if (!key) return "demo";

  return "openai";
}

export const imageProviderConfig: ImageProviderConfig = (() => {
  const provider = detectProvider();
  const host = baseUrl();

  const baseUrlHost =
    provider === "demo" || provider === "none"
      ? null
      : host
        ? safeHost(host)
        : safeHost(FALLBACK_BASE_URLS[provider]);

  return {
    provider,
    configured: provider === "demo" || (provider !== "none" && apiKey().length > 0),
    model:
      provider === "demo" || provider === "none"
        ? null
        : (process.env.IMAGE_GEN_MODEL ?? "").trim() || FALLBACK_MODELS[provider],
    baseUrlHost,
    timeoutMs: timeoutMs(),
  };
})();

function safeHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}

/** True when the provider has everything it needs (key or demo mode). */
export function isImageProviderConfigured(): boolean {
  return imageProviderConfig.configured;
}

/* ------------------------------------------------------------------ */
/*  Generation contract                                               */
/* ------------------------------------------------------------------ */

export interface ImageGenerationInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: RenderAspectRatio;
}

export interface ImageGenerationResult {
  ok: boolean;
  provider: ImageProviderId;
  /** Upstream image URL or `data:` payload when `ok` is true. */
  imageUrl?: string;
  code: RenderErrorCode | "ok";
  /** Persian message ready for the client (empty on success). */
  message: string;
}

type ProviderResponse = { imageUrl: string } | { error: string };

const NEGATIVE_HINT_MAX = 420;

/** FLUX/SDXL hosts without a negative prompt field get an English "Avoid" note. */
function composePrompt(prompt: string, negativePrompt?: string): string {
  const trimmed = prompt.trim();
  const negative = (negativePrompt ?? "").trim();

  if (!negative) return trimmed;

  const clipped =
    negative.length > NEGATIVE_HINT_MAX ? `${negative.slice(0, NEGATIVE_HINT_MAX)}...` : negative;

  return `${trimmed}\n\nAvoid: ${clipped}`;
}

function failure(code: RenderErrorCode): ImageGenerationResult {
  return {
    ok: false,
    provider: imageProviderConfig.provider,
    code,
    message: RENDER_ERROR_MESSAGES[code],
  };
}

function failureForStatus(status: number): ImageGenerationResult {
  if (status === 401 || status === 403) return failure("unauthorized");
  if (status === 429) return failure("rate-limited");
  if (status === 400 || status === 422) return failure("invalid-request");
  return failure("upstream");
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

/** Reads the first image URL out of the many shapes hosts return. */
function firstImageUrl(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;

  const candidates: unknown[] = [
    data.url,
    data.imageUrl,
    Array.isArray(data.images) ? data.images[0] : undefined,
    Array.isArray(data.output) ? data.output[0] : data.output,
    Array.isArray(data.data) ? data.data[0] : data.data,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      const nested = candidate as Record<string, unknown>;
      const url = nested.url ?? nested.image ?? nested.output;
      if (typeof url === "string" && url.length > 0) return url;
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Provider adapters                                                 */
/* ------------------------------------------------------------------ */

async function callOpenAI(
  input: ImageGenerationInput,
  signal: AbortSignal,
): Promise<ProviderResponse> {
  const endpoint = `${baseUrl() || FALLBACK_BASE_URLS.openai}/images/generations`;
  const size = (process.env.IMAGE_GEN_SIZE ?? "").trim() || OPENAI_SIZE[input.aspectRatio];
  const model = imageProviderConfig.model || FALLBACK_MODELS.openai;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model,
      prompt: composePrompt(input.prompt, input.negativePrompt),
      n: 1,
      size,
      // Most FLUX hosts accept "url"; `b64_json` is parsed below as a fallback.
      response_format: (process.env.IMAGE_GEN_RESPONSE_FORMAT ?? "url").trim() || "url",
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: `status:${response.status}` };
  }

  const payload = (await response.json()) as {
    data?: Array<{ url?: string; b64_json?: string }>;
  };
  const first = payload.data?.[0];

  if (first?.url) return { imageUrl: first.url };
  if (first?.b64_json) return { imageUrl: `data:image/png;base64,${first.b64_json}` };
  return { error: "empty" };
}

async function callFal(
  input: ImageGenerationInput,
  signal: AbortSignal,
): Promise<ProviderResponse> {
  const model = imageProviderConfig.model || FALLBACK_MODELS.fal;
  const endpoint = `${baseUrl() || FALLBACK_BASE_URLS.fal}/${model}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey()}`,
    },
    body: JSON.stringify({
      prompt: composePrompt(input.prompt, input.negativePrompt),
      image_size: FAL_SIZE[input.aspectRatio],
      num_images: 1,
      enable_safety_checker: false,
      sync_mode: true,
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: `status:${response.status}` };
  }

  const payload: unknown = await response.json();
  const url = firstImageUrl(payload);
  return url ? { imageUrl: url } : { error: "empty" };
}

async function callReplicate(
  input: ImageGenerationInput,
  signal: AbortSignal,
): Promise<ProviderResponse> {
  const model = imageProviderConfig.model || FALLBACK_MODELS.replicate;
  const endpoint = `${baseUrl() || FALLBACK_BASE_URLS.replicate}/models/${model}/predictions`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
      // Ask Replicate to hold the request until the prediction finishes.
      Prefer: "wait=60",
    },
    body: JSON.stringify({
      input: {
        prompt: composePrompt(input.prompt, input.negativePrompt),
        aspect_ratio: REPLICATE_ASPECT[input.aspectRatio],
        output_format: "webp",
        output_quality: 90,
        num_outputs: 1,
      },
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: `status:${response.status}` };
  }

  const payload = (await response.json()) as { status?: string; output?: unknown };
  if (payload.status && payload.status !== "succeeded") {
    return { error: "pending" };
  }

  const url = firstImageUrl(payload);
  return url ? { imageUrl: url } : { error: "empty" };
}

/**
 * Hugging Face Inference API (FLUX.1-schnell, SDXL, ...).
 * Success is a binary image response; JSON means "model loading" or an error.
 */
async function callHuggingFace(
  input: ImageGenerationInput,
  signal: AbortSignal,
): Promise<ProviderResponse> {
  const model = imageProviderConfig.model || FALLBACK_MODELS.huggingface;
  const endpoint = `${baseUrl() || FALLBACK_BASE_URLS.huggingface}/${model}`;
  const size = HF_SIZE[input.aspectRatio];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "image/png",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      inputs: composePrompt(input.prompt, input.negativePrompt),
      parameters: { width: size.width, height: size.height },
    }),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    return { error: `status:${response.status}` };
  }

  const contentType = response.headers.get("content-type") ?? "";

  // Success: the model streams raw image bytes back.
  if (contentType.startsWith("image/")) {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0) return { error: "empty" };

    const mime = contentType.split(";")[0] || "image/png";
    return { imageUrl: `data:${mime};base64,${buffer.toString("base64")}` };
  }

  // Otherwise Hugging Face answered JSON: "loading" (202/503) or an error.
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; estimated_time?: number }
    | null;
  const message = payload?.error ?? "";

  if (payload?.estimated_time || /loading|estimated_time/i.test(message)) {
    return { error: "pending" };
  }

  return { error: "empty" };
}

/**
 * Sample render used while no provider key exists: a curated, real
 * architectural photo from the Unsplash CDN (never a placeholder SVG).
 */
function callSample(input: ImageGenerationInput): ProviderResponse {
  const sample = pickSample(input.aspectRatio, input.prompt);
  return { imageUrl: sample.url };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Generates one architectural image. **Never throws** - every failure is
 * translated into a Persian message + a stable error code so the route can
 * answer with the right HTTP status and refund the credit.
 */
export async function generateArchitecturalImage(
  input: ImageGenerationInput,
): Promise<ImageGenerationResult> {
  const provider = imageProviderConfig.provider;

  if (!isImageProviderConfigured() || provider === "none") {
    return failure("unconfigured");
  }

  if (provider === "demo") {
    const sample = callSample(input);
    return "imageUrl" in sample
      ? {
          ok: true,
          provider,
          imageUrl: sample.imageUrl,
          code: "ok",
          message: "",
        }
      : failure("empty-response");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), imageProviderConfig.timeoutMs);

  try {
    const response =
      provider === "fal"
        ? await callFal(input, controller.signal)
        : provider === "replicate"
          ? await callReplicate(input, controller.signal)
          : provider === "huggingface"
            ? await callHuggingFace(input, controller.signal)
            : await callOpenAI(input, controller.signal);

    if ("imageUrl" in response) {
      return {
        ok: true,
        provider,
        imageUrl: response.imageUrl,
        code: "ok",
        message: "",
      };
    }

    if (response.error === "pending") return failure("pending");
    if (response.error === "empty") return failure("empty-response");
    if (response.error.startsWith("status:")) {
      const status = Number.parseInt(response.error.slice("status:".length), 10);
      return failureForStatus(Number.isFinite(status) ? status : 0);
    }

    return failure("upstream");
  } catch (error) {
    if (isAbortError(error)) return failure("timeout");
    console.error("[image-provider] upstream call failed", error);
    return failure("upstream");
  } finally {
    clearTimeout(timer);
  }
}

/** Secret-free snapshot used by the quota route and the startup log. */
export function describeImageProvider(): ImageProviderConfig {
  return { ...imageProviderConfig };
}

