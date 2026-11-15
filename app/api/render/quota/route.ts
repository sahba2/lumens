/**
 * LUMENS - GET /api/render/quota
 * ------------------------------
 * Returns the free render credits of the signed-in account. Guests get
 * `authenticated: false` with 200 so the dialog can show a login call-to-
 * action instead of treating it as an error.
 */

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import type { RenderQuotaResponse } from "@/lib/engine-contract";
import { isImageProviderConfigured } from "@/lib/image-provider";
import { freeRenderLimit, getRenderQuota } from "@/lib/render-quota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      const response: RenderQuotaResponse = {
        success: true,
        authenticated: false,
        remainingCredits: 0,
        limit: freeRenderLimit(),
        used: 0,
        providerReady: isImageProviderConfigured(),
      };

      return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
    }

    const quota = await getRenderQuota(userId);

    const response: RenderQuotaResponse = {
      success: true,
      authenticated: true,
      remainingCredits: quota.remaining,
      limit: quota.limit,
      used: quota.used,
      providerReady: isImageProviderConfigured(),
    };

    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[render/quota] failed to read quota", error);

    return NextResponse.json(
      { success: false, error: "خواندن سهمیه رندر ممکن نشد؛ دوباره تلاش کنید." },
      { status: 500 },
    );
  }
}
