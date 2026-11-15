/**
 * LUMENS - POST /api/render/generate
 * ---------------------------------
 * Mode 2 production flow for the image phase.
 *
 *   POST { prompt, aspectRatio?, projectId?, negativePrompt? }
 *   200  { success: true, imageUrl, downloadUrl, remainingCredits, ... }
 *   400/401/402/429/502/503/504 { success: false, code, error, remainingCredits }
 *
 * Flow
 *   1. validate the payload,
 *   2. require a NextAuth session (text phases stay free, images do not),
 *   3. reserve one free credit *before* calling the provider,
 *   4. refund the credit whenever the provider fails (timeout, 429, bad key),
 *   5. return a same-origin `imageUrl` so the API key never leaves the server.
 */

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import {
  RENDER_ERROR_MESSAGES,
  RENDER_ERROR_STATUS,
  isRenderAspectRatio,
  type RenderAspectRatio,
  type RenderErrorCode,
  type RenderGenerateFailure,
  type RenderGenerateSuccess,
} from "@/lib/engine-contract";
import { generateArchitecturalImage } from "@/lib/image-provider";
import { consumeRenderCredit, getRenderQuota, refundRenderCredit } from "@/lib/render-quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** FLUX on a cold worker can take a while; keep the serverless budget explicit. */
export const maxDuration = 60;

const MIN_PROMPT_LENGTH = 10;
const MAX_PROMPT_LENGTH = 1_400;
const MAX_NEGATIVE_LENGTH = 700;
const MAX_PROJECT_ID_LENGTH = 64;

function failure(
  code: RenderErrorCode,
  remainingCredits: number,
  authenticated: boolean,
  overrideMessage?: string,
): NextResponse<RenderGenerateFailure> {
  return NextResponse.json<RenderGenerateFailure>(
    {
      success: false,
      code,
      error: overrideMessage?.trim() || RENDER_ERROR_MESSAGES[code],
      remainingCredits,
      authenticated,
    },
    { status: RENDER_ERROR_STATUS[code] },
  );
}

/**
 * Remote images are streamed through `/api/render/proxy` so the browser never
 * touches a provider host (no CORS, no hotlink protection, no leaked signed
 * URLs in mixed-content contexts). Local demo art and data URLs are used
 * as-is.
 */
function toDisplayUrl(upstream: string): { imageUrl: string; downloadUrl: string } {
  if (upstream.startsWith("data:") || upstream.startsWith("/")) {
    return { imageUrl: upstream, downloadUrl: upstream };
  }

  const proxied = `/api/render/proxy?url=${encodeURIComponent(upstream)}`;
  return { imageUrl: proxied, downloadUrl: `${proxied}&download=1` };
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return failure("invalid-request", 0, false);
  }

  if (!payload || typeof payload !== "object") {
    return failure("invalid-request", 0, false);
  }

  const body = payload as Record<string, unknown>;
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const negativePrompt =
    typeof body.negativePrompt === "string" ? body.negativePrompt.trim() : undefined;
  const aspectRatio: RenderAspectRatio = isRenderAspectRatio(body.aspectRatio)
    ? body.aspectRatio
    : "16:9";
  const projectId =
    typeof body.projectId === "string" && body.projectId.trim().length > 0
      ? body.projectId.trim().slice(0, MAX_PROJECT_ID_LENGTH)
      : null;

  if (prompt.length < MIN_PROMPT_LENGTH || prompt.length > MAX_PROMPT_LENGTH) {
    return failure("invalid-request", 0, true);
  }

  if (negativePrompt && negativePrompt.length > MAX_NEGATIVE_LENGTH) {
    return failure("invalid-request", 0, true);
  }

  let userId: string | undefined;

  try {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id;
  } catch (error) {
    console.error("[render/generate] session lookup failed", error);
    return failure("upstream", 0, false);
  }

  if (!userId) {
    return failure("unauthenticated", 0, false);
  }

  try {
    const quota = await getRenderQuota(userId);
    if (quota.remaining <= 0) {
      return failure("quota-exhausted", 0, true);
    }

    // Reserve first: two parallel clicks can never overspend the quota.
    const consumption = await consumeRenderCredit(userId);
    if (!consumption.ok) {
      return failure("quota-exhausted", consumption.quota.remaining, true);
    }

    const generation = await generateArchitecturalImage({
      prompt,
      negativePrompt,
      aspectRatio,
    });

    if (!generation.ok || !generation.imageUrl) {
      const refunded = await refundRenderCredit(userId);
      const code: RenderErrorCode = generation.code === "ok" ? "upstream" : generation.code;

      return failure(code, refunded.remaining, true, generation.message);
    }

    const { imageUrl, downloadUrl } = toDisplayUrl(generation.imageUrl);

    const response: RenderGenerateSuccess = {
      success: true,
      imageUrl,
      downloadUrl,
      remainingCredits: consumption.quota.remaining,
      aspectRatio,
      provider: generation.provider,
      generatedAt: new Date().toISOString(),
      projectId,
    };

    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[render/generate] render failed", error);

    // Best effort refund so a storage hiccup never eats a free render.
    let remaining = 0;
    try {
      remaining = (await refundRenderCredit(userId)).remaining;
    } catch {
      /* ignore - the failure response is more important than the quota read */
    }

    return failure("upstream", remaining, true);
  }
}
