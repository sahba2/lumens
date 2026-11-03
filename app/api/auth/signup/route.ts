/**
 * LUMENS - POST /api/auth/signup
 * ------------------------------
 * Creates a local account:
 *   1. validates name / e-mail / mobile number / password / role,
 *   2. hashes the password with bcryptjs,
 *   3. stores the user in `.data/users.json` (never the plain password),
 *   4. sends the Persian welcome e-mail and welcome SMS (best effort).
 *
 * The client then signs in through NextAuth with the same credentials, so a
 * successful sign-up ends on the dashboard with an active session.
 *
 * Notifications (welcome e-mail + welcome SMS) are dispatched by
 * `lib/notifications.ts`, which never throws, runs both channels in parallel
 * and logs one clear outcome line per sign-up. Missing or broken SMTP/SMS
 * configuration only changes the `email` / `sms` flags of the JSON response.
 */

import { NextResponse } from "next/server";

import {
  sendSignupNotifications,
  toNotificationFlags,
} from "@/lib/notifications";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, hashPassword } from "@/lib/password";
import { IRANIAN_PHONE_ERROR, normalizeIranianPhone } from "@/lib/phone";
import {
  DuplicateUserError,
  createUser,
  isUserRole,
  normalizeEmail,
  toPublicUser,
} from "@/lib/user-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 80;

interface SignupBody {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  password?: unknown;
  role?: unknown;
}

function failure(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: SignupBody;

  try {
    body = (await request.json()) as SignupBody;
  } catch {
    return failure("داده‌های ارسالی معتبر نیست؛ دوباره تلاش کنید.", 400);
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim().replace(/\s+/g, " ") : "";
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  const phone = normalizeIranianPhone(typeof body.phone === "string" ? body.phone : "");
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role;

  if (fullName.length < MIN_NAME_LENGTH || fullName.length > MAX_NAME_LENGTH) {
    return failure("نام و نام خانوادگی را کامل وارد کنید.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return failure("ایمیل وارد شده معتبر نیست.", 400);
  }

  if (!phone) {
    return failure(IRANIAN_PHONE_ERROR, 400);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return failure(`رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`, 400);
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return failure(`رمز عبور نباید بیشتر از ${MAX_PASSWORD_LENGTH} کاراکتر باشد.`, 400);
  }

  if (!isUserRole(role)) {
    return failure("نقش انتخابی معتبر نیست؛ دانشجو/معمار یا مدرس را انتخاب کنید.", 400);
  }

  try {
    const user = await createUser({
      fullName,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role,
    });

    // Welcome e-mail + welcome SMS are dispatched in parallel. The dispatcher
    // never throws, guarantees both channels are attempted and prints one
    // clear outcome line per sign-up in the terminal.
    const notifications = await sendSignupNotifications({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      siteUrl: new URL(request.url).origin,
    });

    return NextResponse.json(
      {
        ok: true,
        user: toPublicUser(user),
        ...toNotificationFlags(notifications),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof DuplicateUserError) {
      return failure(
        error.field === "phone"
          ? "این شماره موبایل قبلاً ثبت شده است. وارد شوید یا با کد پیامکی وارد شوید."
          : "این ایمیل قبلاً ثبت شده است. وارد شوید یا رمز عبور را بازیابی کنید.",
        409,
      );
    }

    console.error("[signup] failed to create user", error);
    return failure("ثبت‌نام انجام نشد؛ چند لحظه بعد دوباره تلاش کنید.", 500);
  }
}
