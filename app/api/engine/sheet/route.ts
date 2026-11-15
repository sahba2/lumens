/**
 * LUMENS - POST /api/engine/sheet
 * -------------------------------
 * Runs the 5-phase architecture engine and returns the structured project
 * sheet. Text phases (1, 2, 4 and 5) are **free and unlimited**; the render
 * phase is triggered separately through `/api/render/generate`.
 *
 *   POST { brief: string }
 *   200  { success: true, free: true, projectId, sheet }
 *   400  { success: false, code, error }
 */

import { NextResponse } from "next/server";

import {
  MAX_BRIEF_LENGTH,
  SHEET_PHASE_COUNT,
  buildArchitectureSheet,
} from "@/lib/architectureEngine";
import type { EngineSheetFailure, EngineSheetSuccess } from "@/lib/engine-contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function invalid(error: string): NextResponse<EngineSheetFailure> {
  return NextResponse.json({ success: false, code: "invalid-request", error }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return invalid("بدنه درخواست معتبر نیست؛ بریف پروژه را دوباره ارسال کنید.");
  }

  if (!payload || typeof payload !== "object") {
    return invalid("بریف پروژه را ارسال کنید.");
  }

  const body = payload as Record<string, unknown>;
  const brief = typeof body.brief === "string" ? body.brief.trim() : "";
  const projectId =
    typeof body.projectId === "string" && body.projectId.trim().length > 0
      ? body.projectId.trim().slice(0, 64)
      : null;

  if (brief.length < 3) {
    return invalid("بریف پروژه را با حداقل سه حرف بنویسید تا موتور بتواند آن را تحلیل کند.");
  }

  if (brief.length > MAX_BRIEF_LENGTH) {
    return invalid(`بریف بیش از حد طولانی است؛ حداکثر ${MAX_BRIEF_LENGTH} کاراکتر مجاز است.`);
  }

  try {
    const sheet = buildArchitectureSheet(brief);

    const response: EngineSheetSuccess = {
      success: true,
      free: true,
      projectId,
      sheet,
    };

    return NextResponse.json(response, {
      headers: {
        // The sheet is deterministic for a given brief, so it can be cached
        // briefly by the browser without ever going stale in a harmful way.
        "Cache-Control": "private, max-age=60",
        "X-Lumens-Phases": String(SHEET_PHASE_COUNT),
      },
    });
  } catch (error) {
    console.error("[engine/sheet] failed to build sheet", error);

    return NextResponse.json<EngineSheetFailure>(
      {
        success: false,
        code: "engine-error",
        error: "موتور در تولید شیت با خطا مواجه شد؛ دوباره تلاش کنید.",
      },
      { status: 500 },
    );
  }
}
