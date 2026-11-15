/**
 * LUMENS - render API client
 * --------------------------
 * The single place that talks to the image backend from the browser:
 *
 *   `fetchRenderQuota()`    -> GET  /api/render/quota   (render-credits.json)
 *   `postRenderRequest()`   -> POST /api/render/generate (FLUX / SDXL)
 *
 * Used by both the card button (`RenderImageButton`) and the render panel so
 * there is exactly one fetch implementation, one payload shape and one set of
 * Persian error messages.
 */

import {
  RENDER_ERROR_MESSAGES,
  type ImageProviderId,
  type RenderAspectRatio,
  type RenderErrorCode,
  type RenderGenerateResponse,
  type RenderQuotaResponse,
} from "./engine-contract";

/** Network-level failure (server unreachable, JSON broken, aborted, ...). */
export const RENDER_NETWORK_ERROR =
  "ارتباط با سرور برقرار نشد؛ اتصال خود را بررسی و دوباره تلاش کنید.";

export interface RenderQuotaSnapshot {
  authenticated: boolean;
  remainingCredits: number;
  limit: number;
  used: number;
  providerReady: boolean;
}

/** `GET /api/render/quota` - `null` when the request itself failed. */
export async function fetchRenderQuota(): Promise<RenderQuotaSnapshot | null> {
  try {
    const response = await fetch("/api/render/quota", { cache: "no-store" });
    if (!response.ok) return null;

    const data = (await response.json()) as RenderQuotaResponse;
    if (!data.success) return null;

    return {
      authenticated: data.authenticated,
      remainingCredits: data.remainingCredits,
      limit: data.limit,
      used: data.used,
      providerReady: data.providerReady ?? true,
    };
  } catch {
    return null;
  }
}

export interface RenderRequestInput {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: RenderAspectRatio;
  projectId?: string;
  signal?: AbortSignal;
}

export type RenderRequestResult =
  | {
      ok: true;
      /** HTTP status of the successful POST (200). */
      status: number;
      imageUrl: string;
      downloadUrl: string;
      remainingCredits: number;
      aspectRatio: RenderAspectRatio;
      provider: ImageProviderId;
      generatedAt: string;
    }
  | {
      ok: false;
      /** HTTP status returned by the route (0 when the fetch never happened). */
      status: number;
      code: RenderErrorCode;
      error: string;
      remainingCredits: number;
      authenticated: boolean;
      /** Set when the request never reached the route (fetch threw). */
      network: boolean;
    };

/**
 * `POST /api/render/generate` with the architectural prompt. Never throws:
 * a failed fetch is folded into `{ ok: false, code: "upstream", network: true }`.
 */
export async function postRenderRequest(
  input: RenderRequestInput,
): Promise<RenderRequestResult> {
  let response: Response;

  try {
    response = await fetch("/api/render/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        aspectRatio: input.aspectRatio,
        projectId: input.projectId,
      }),
      signal: input.signal,
    });
  } catch (error) {
    // Let the caller handle an explicit cancel (AbortController).
    if (error instanceof DOMException && error.name === "AbortError") throw error;

    return {
      ok: false,
      status: 0,
      code: "upstream",
      error: RENDER_NETWORK_ERROR,
      remainingCredits: 0,
      authenticated: true,
      network: true,
    };
  }

  const data = (await response.json().catch(() => null)) as RenderGenerateResponse | null;

  if (!response.ok || !data || !data.success) {
    const failure = data && !data.success ? data : null;

    return {
      ok: false,
      status: response.status,
      code: failure?.code ?? (response.status === 401 ? "unauthenticated" : "upstream"),
      error:
        failure?.error ??
        (response.status === 401
          ? RENDER_ERROR_MESSAGES.unauthenticated
          : RENDER_ERROR_MESSAGES.upstream),
      remainingCredits: failure?.remainingCredits ?? 0,
      authenticated: failure?.authenticated ?? response.status !== 401,
      network: false,
    };
  }

  return {
    ok: true,
    status: response.status,
    imageUrl: data.imageUrl,
    downloadUrl: data.downloadUrl,
    remainingCredits: data.remainingCredits,
    aspectRatio: data.aspectRatio,
    provider: data.provider,
    generatedAt: data.generatedAt,
  };
}
