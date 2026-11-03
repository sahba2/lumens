/**
 * LUMENS - POST /api/auth/phone/request
 * -------------------------------------
 * Issues a one-time login / account-recovery code for an existing mobile
 * number and delivers it via SMS. The `phone-otp` NextAuth provider consumes it.
 *
 * Security notes:
 *  - the code is stored only as an HMAC digest with a 5 minute TTL,
 *  - one active code per phone, 60 second resend cooldown, 5 attempts,
 *  - the response never contains the code,
 *  - delivery problems degrade to a Persian error message, never a crash.
 */

import { NextResponse } from "next/server";

import { OTP_RESEND_COOLDOWN_SECONDS, OTP_TTL_SECONDS, issueOtp } from "@/lib/otp-store";
import { IRANIAN_PHONE_ERROR, normalizeIranianPhone } from "@/lib/phone";
import { SMS_SETUP_HINT, isSmsConfigured, sendOtpSms } from "@/lib/sms";
import { findUserByPhone } from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  phone?: unknown;
}

function failure(error: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return failure("داده‌های ارسالی معتبر نیست؛ دوباره تلاش کنید.", 400);
  }

  const phone = normalizeIranianPhone(typeof body.phone === "string" ? body.phone : "");
  if (!phone) {
    return failure(IRANIAN_PHONE_ERROR, 400);
  }

  const user = await findUserByPhone(phone);
  if (!user) {
    // Recovery for a number that never signed up: ask them to register first.
    return failure("حسابی با این شماره موبایل ثبت نشده است. ابتدا ثبت‌نام کنید.", 404);
  }

  // Fail before issuing a code nobody can receive.
  if (!isSmsConfigured()) {
    return failure(SMS_SETUP_HINT, 503);
  }

  const issued = await issueOtp(phone);
  if (!issued.ok) {
    return failure("کد قبلی هنوز معتبر است؛ کمی بعد دوباره درخواست دهید.", 429, {
      retryAfterSeconds: issued.retryAfterSeconds,
    });
  }

  const delivery = await sendOtpSms({
    phone,
    code: issued.code,
    ttlSeconds: OTP_TTL_SECONDS,
  });

  if (!delivery.ok) {
    return failure("ارسال پیامک انجام نشد؛ چند لحظه بعد دوباره تلاش کنید.", 502);
  }

  return NextResponse.json({
    ok: true,
    expiresInSeconds: OTP_TTL_SECONDS,
    retryAfterSeconds: OTP_RESEND_COOLDOWN_SECONDS,
    delivery: delivery.skipped ? "skipped" : "sent",
  });
}
