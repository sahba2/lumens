/**
 * LUMENS - GET /api/notifications/status
 * --------------------------------------
 * Development-only diagnostics for the welcome e-mail / SMS setup.
 * Returns whether each channel is configured, without exposing any secret, so
 * a "nothing is being sent" report can be diagnosed in one request:
 *
 *   curl http://localhost:3000/api/notifications/status
 *
 * Disabled in production (404) because configuration details never belong on
 * a public origin.
 */

import { NextResponse } from "next/server";

import { describeNotificationConfig, logNotificationConfigOnce } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  }

  logNotificationConfigOnce();

  const config = describeNotificationConfig();

  return NextResponse.json({
    ok: true,
    ready: {
      email: config.email.configured,
      sms: config.sms.configured,
      both: config.email.configured && config.sms.configured,
    },
    email: config.email,
    sms: config.sms,
  });
}
