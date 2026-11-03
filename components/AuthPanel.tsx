"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { IRANIAN_PHONE_ERROR, isValidIranianPhone, normalizeIranianPhone } from "@/lib/phone";

import { IconCheck } from "./Icons";
import PhoneOtpForm from "./PhoneOtpForm";

/** Which tab the visitor is on. */
type Mode = "signin" | "signup" | "otp";

/** Roles that can be chosen at sign-up (mirrors `lib/user-store.ts`). */
type Role = "student" | "instructor";

interface AuthFormValues {
  fullName: string;
  email: string;
  phone: string;
  /** E-mail or mobile number used to sign in. */
  identifier: string;
  password: string;
  role: Role;
}

/** Per-channel delivery outcome returned by `/api/auth/signup`. */
interface NotificationFlag {
  sent: boolean;
  skipped: boolean;
}

interface SignupResponse {
  ok?: boolean;
  error?: string;
  user?: { id: string; fullName: string; email: string; phone?: string; role: Role };
  /** Welcome e-mail / welcome SMS are best effort, so they report their own flag. */
  email?: NotificationFlag;
  sms?: NotificationFlag;
}

/** Where a successfully authenticated user is sent. */
const afterAuthHref = "/dashboard";

/** Client guards mirror the server checks in `app/api/auth/signup/route.ts`. */
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const roleOptions: { id: Role; label: string; hint: string }[] = [
  { id: "student", label: "دانشجو / معمار", hint: "دسترسی به دوره‌ها، آبجکت‌های سه‌بعدی و پرامپت‌ها" },
  { id: "instructor", label: "مدرس", hint: "ساخت و مدیریت دوره‌های تخصصی LUMENS" },
];

const NETWORK_ERROR_MESSAGE =
  "ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کرده و دوباره تلاش کنید.";

/** Small helper so every input renders its validation message consistently. */
function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className="mt-1.5 text-[11px] leading-5 text-rose-400">
      {message}
    </p>
  );
}

/**
 * Login / sign-up form.
 * - sign-in goes through NextAuth (`signIn("credentials")`),
 * - sign-up posts to `/api/auth/signup` (bcrypt hash + JSON store) and then
 *   signs the user in automatically and redirects to the dashboard.
 */
export default function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      identifier: "",
      password: "",
      role: "student",
    },
    mode: "onTouched",
  });

  const role = watch("role");
  const isSignup = mode === "signup";
  const activeRole = roleOptions.find((option) => option.id === role) ?? roleOptions[0];

  const switchMode = (next: Mode) => {
    if (next === mode || isSubmitting) {
      return;
    }

    const current = getValues();
    setMode(next);
    setFormError(null);
    setNotice(null);
    // Keep the e-mail + role so switching tabs does not lose the input.
    reset({ ...current, password: "" });
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);

    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      if (mode === "signin") {
        // One field accepts either the e-mail address or the mobile number.
        const result = await signIn("credentials", {
          identifier: values.identifier.trim(),
          password,
          redirect: false,
        });

        if (result?.error) {
          setFormError(
            result.error === "CredentialsSignin"
              ? "ایمیل/شماره موبایل یا رمز عبور اشتباه است."
              : "ورود انجام نشد؛ سرویس احراز هویت را بررسی کنید.",
          );
          return;
        }

        setNotice("ورود با موفقیت انجام شد؛ در حال انتقال به داشبورد…");
        router.push(afterAuthHref);
        router.refresh();
        return;
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email,
          phone: normalizeIranianPhone(values.phone) ?? values.phone.trim(),
          password,
          role: values.role,
        }),
      });

      const payload = (await response.json().catch(() => null)) as SignupResponse | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.error ?? "ثبت‌نام انجام نشد؛ چند لحظه بعد دوباره تلاش کنید.");
        return;
      }

      // Registration succeeded either way; only the welcome SMS is best effort.
      setNotice(
        payload.sms?.sent
          ? "حساب شما ساخته شد؛ پیامک خوش‌آمد ارسال شد و در حال ورود خودکار…"
          : "حساب شما ساخته شد؛ اما پیامک خوش‌آمد ارسال نشد. در حال ورود خودکار…",
      );

      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        // The account exists, only the automatic login failed: fall back to sign-in.
        setMode("signin");
        setNotice("حساب شما ساخته شد؛ اکنون با ایمیل و رمز عبور وارد شوید.");
        reset({ ...values, password: "" });
        return;
      }

      router.push(afterAuthHref);
      router.refresh();
    } catch {
      setFormError(NETWORK_ERROR_MESSAGE);
    }
  });

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
        {(
          [
            { id: "signin", label: "ورود" },
            { id: "signup", label: "ثبت‌نام" },
            { id: "otp", label: "کد پیامکی" },
          ] as { id: Mode; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchMode(tab.id)}
            aria-pressed={mode === tab.id}
            className={`flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-300 ${
              mode === tab.id ? "bg-gold/15 text-gold-light" : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "otp" ? (
        <PhoneOtpForm />
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {isSignup ? (
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
              نام و نام خانوادگی
            </span>
            <input
              type="text"
              placeholder="مثلاً سارا احمدی"
              autoComplete="name"
              aria-invalid={errors.fullName ? true : undefined}
              aria-describedby={errors.fullName ? "signup-fullName-error" : undefined}
              className="field"
              {...register("fullName", {
                required: "نام و نام خانوادگی را وارد کنید.",
                validate: (value) =>
                  value.trim().replace(/\s+/g, " ").length >= 3 ||
                  "نام و نام خانوادگی را کامل وارد کنید.",
                maxLength: { value: 80, message: "نام و نام خانوادگی بیش از حد طولانی است." },
              })}
            />
            <FieldError id="signup-fullName-error" message={errors.fullName?.message} />
          </label>
        ) : null}

        {isSignup ? (
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-zinc-400">ایمیل</span>
          <input
            type="email"
            dir="ltr"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            className="field text-left"
            {...register("email", {
              required: "ایمیل را وارد کنید.",
              pattern: { value: EMAIL_PATTERN, message: "ایمیل وارد شده معتبر نیست." },
            })}
          />
          <FieldError id="signup-email-error" message={errors.email?.message} />
        </label>
        ) : (
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
            ایمیل یا شماره موبایل
          </span>
          <input
            type="text"
            dir="ltr"
            placeholder="you@example.com یا 09123456789"
            autoComplete="username"
            aria-invalid={errors.identifier ? true : undefined}
            aria-describedby={errors.identifier ? "signin-identifier-error" : undefined}
            className="field text-left"
            {...register("identifier", {
              required: "ایمیل یا شماره موبایل را وارد کنید.",
              validate: (value) => {
                const trimmed = value.trim();
                if (!trimmed) {
                  return "ایمیل یا شماره موبایل را وارد کنید.";
                }
                if (trimmed.includes("@")) {
                  return EMAIL_PATTERN.test(trimmed) || "ایمیل وارد شده معتبر نیست.";
                }
                return isValidIranianPhone(trimmed) || IRANIAN_PHONE_ERROR;
              },
            })}
          />
          <FieldError id="signin-identifier-error" message={errors.identifier?.message} />
        </label>
        )}

        {isSignup ? (
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
              شماره موبایل
            </span>
            <input
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="09123456789"
              autoComplete="tel"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "signup-phone-error" : undefined}
              className="field text-left"
              {...register("phone", {
                required: "شماره موبایل را وارد کنید.",
                validate: (value) => isValidIranianPhone(value) || IRANIAN_PHONE_ERROR,
              })}
            />
            <FieldError id="signup-phone-error" message={errors.phone?.message} />
            <p className="mt-1.5 text-[10px] leading-5 text-zinc-600">
              با همین شماره می‌توانید بدون رمز عبور وارد شوید یا حساب را بازیابی کنید.
            </p>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
            رمز عبور{isSignup ? ` (حداقل ${MIN_PASSWORD_LENGTH} کاراکتر)` : null}
          </span>
          <input
            type="password"
            dir="ltr"
            placeholder="••••••••"
            autoComplete={isSignup ? "new-password" : "current-password"}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "signup-password-error" : undefined}
            className="field text-left"
            {...register("password", {
              required: "رمز عبور را وارد کنید.",
              minLength: {
                value: MIN_PASSWORD_LENGTH,
                message: `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`,
              },
              maxLength: {
                value: MAX_PASSWORD_LENGTH,
                message: `رمز عبور نباید بیشتر از ${MAX_PASSWORD_LENGTH} کاراکتر باشد.`,
              },
            })}
          />
          <FieldError id="signup-password-error" message={errors.password?.message} />
        </label>

        {!isSignup ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="leading-5 text-zinc-600">
              رمز عبور را فراموش کرده‌اید؟ با کد پیامکی وارد شوید.
            </span>
            <button
              type="button"
              onClick={() => switchMode("otp")}
              className="shrink-0 font-semibold text-gold-light transition-colors hover:text-white"
            >
              بازیابی با پیامک
            </button>
          </div>
        ) : null}

        {isSignup ? (
          <div>
            <span className="mb-2 block text-[11px] font-semibold text-zinc-400">نقش شما</span>
            {/* Kept in the form state so `handleSubmit` always posts the role. */}
            <input
              type="hidden"
              {...register("role", {
                validate: (value) =>
                  value === "student" || value === "instructor" || "نقش انتخابی معتبر نیست.",
              })}
            />
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setValue("role", option.id, { shouldDirty: true, shouldValidate: true })
                  }
                  aria-pressed={role === option.id}
                  className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors duration-300 ${
                    role === option.id
                      ? "border-gold/50 bg-gold/15 text-gold-light"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-500">{activeRole.hint}</p>
            <FieldError id="signup-role-error" message={errors.role?.message} />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "در حال پردازش…" : isSignup ? "ساخت حساب کاربری" : "ورود به حساب"}
        </button>
        </form>
      )}

      <p className="mt-4 min-h-5 text-xs leading-6" aria-live="polite">
        {formError ? <span className="text-rose-400">{formError}</span> : null}
        {notice ? (
          <span className="inline-flex items-start gap-1.5 text-emerald-400">
            <IconCheck className="mt-1 h-3.5 w-3.5 shrink-0" />
            {notice}
          </span>
        ) : null}
      </p>

      <p className="mt-1 text-[11px] leading-6 text-zinc-500">
        {isSignup
          ? "با ساخت حساب، قوانین استفاده و سیاست حفظ حریم خصوصی LUMENS را می‌پذیرید."
          : "با ورود، به دوره‌های خریداری‌شده، آبجکت‌های لایسنس‌دار و پرامپت‌های ذخیره‌شده دسترسی دارید."}
      </p>
    </div>
  );
}
