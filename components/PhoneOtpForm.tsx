"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { IRANIAN_PHONE_ERROR, isValidIranianPhone, normalizeIranianPhone } from "@/lib/phone";

import { IconCheck } from "./Icons";

interface PhoneOtpValues {
  phone: string;
  code: string;
}

interface RequestCodeResponse {
  ok?: boolean;
  error?: string;
  retryAfterSeconds?: number;
}

const NETWORK_ERROR_MESSAGE =
  "ارتباط با سرور برقرار نشد؛ اتصال اینترنت را بررسی کرده و دوباره تلاش کنید.";

/**
 * Passwordless sign-in / account recovery with a one-time SMS code.
 * Step 1 asks the SMS gateway for a code, step 2 exchanges it for a NextAuth
 * session through the `phone-otp` credentials provider.
 */
export default function PhoneOtpForm() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [cooldown, setCooldown] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PhoneOtpValues>({
    defaultValues: { phone: "", code: "" },
    mode: "onTouched",
  });

  const phone = watch("phone");

  // Simple countdown for the resend cooldown.
  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const requestCode = async (rawPhone: string): Promise<boolean> => {
    const normalized = normalizeIranianPhone(rawPhone);
    if (!normalized) {
      setError("phone", { message: IRANIAN_PHONE_ERROR });
      return false;
    }

    setFormError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/auth/phone/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalized }),
      });

      const payload = (await response.json().catch(() => null)) as RequestCodeResponse | null;

      if (!response.ok || !payload?.ok) {
        setFormError(payload?.error ?? "ارسال کد تأیید انجام نشد؛ دوباره تلاش کنید.");
        if (typeof payload?.retryAfterSeconds === "number") {
          setCooldown(payload.retryAfterSeconds);
        }
        return false;
      }

      setValue("phone", normalized);
      setValue("code", "");
      setStep("verify");
      setCooldown(payload.retryAfterSeconds ?? 60);
      setNotice("کد تأیید به شماره شما پیامک شد.");
      return true;
    } catch {
      setFormError(NETWORK_ERROR_MESSAGE);
      return false;
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (step === "request") {
      await requestCode(values.phone);
      return;
    }

    const normalized = normalizeIranianPhone(values.phone);
    if (!normalized) {
      setError("phone", { message: IRANIAN_PHONE_ERROR });
      return;
    }

    setFormError(null);
    setNotice(null);

    try {
      const result = await signIn("phone-otp", {
        phone: normalized,
        code: values.code.trim(),
        redirect: false,
      });

      if (result?.error) {
        setFormError("کد تأیید نادرست یا منقضی شده است؛ دوباره تلاش کنید.");
        return;
      }

      setNotice("ورود با موفقیت انجام شد؛ در حال انتقال به داشبورد…");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError(NETWORK_ERROR_MESSAGE);
    }
  });

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <p className="text-[11px] leading-6 text-zinc-500">
        با شماره موبایل ثبت‌شده وارد شوید؛ همین کد یکبارمصرف برای بازیابی حساب (فراموشی رمز
        عبور) هم استفاده می‌شود.
      </p>

      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold text-zinc-400">شماره موبایل</span>
        <input
          type="tel"
          inputMode="tel"
          dir="ltr"
          placeholder="09123456789"
          autoComplete="tel"
          readOnly={step === "verify"}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? "otp-phone-error" : undefined}
          className={`field text-left ${step === "verify" ? "opacity-70" : ""}`}
          {...register("phone", {
            required: "شماره موبایل را وارد کنید.",
            validate: (value) => isValidIranianPhone(value) || IRANIAN_PHONE_ERROR,
          })}
        />
        {errors.phone?.message ? (
          <p id="otp-phone-error" role="alert" className="mt-1.5 text-[11px] leading-5 text-rose-400">
            {errors.phone.message}
          </p>
        ) : null}
      </label>

      {step === "verify" ? (
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold text-zinc-400">
            کد تأیید ۶ رقمی
          </span>
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            placeholder="——————"
            autoComplete="one-time-code"
            aria-invalid={errors.code ? true : undefined}
            aria-describedby={errors.code ? "otp-code-error" : undefined}
            className="field text-center tracking-[0.6em]"
            {...register("code", {
              required: "کد تأیید را وارد کنید.",
              pattern: { value: /^\d{4,8}$/, message: "کد تأیید باید فقط شامل عدد باشد." },
            })}
          />
          {errors.code?.message ? (
            <p id="otp-code-error" role="alert" className="mt-1.5 text-[11px] leading-5 text-rose-400">
              {errors.code.message}
            </p>
          ) : null}
        </label>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "در حال پردازش…"
          : step === "request"
            ? "ارسال کد تأیید"
            : "ورود با کد تأیید"}
      </button>

      {step === "verify" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setValue("code", "");
              setFormError(null);
              setNotice(null);
            }}
            className="text-zinc-400 transition-colors hover:text-white"
          >
            تغییر شماره
          </button>
          <button
            type="button"
            disabled={cooldown > 0 || isSubmitting}
            onClick={() => requestCode(getValues("phone"))}
            className="font-semibold text-gold-light transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {cooldown > 0 ? `ارسال مجدد در ${cooldown} ثانیه` : "ارسال مجدد کد"}
          </button>
        </div>
      ) : null}

      <p className="min-h-5 text-xs leading-6" aria-live="polite">
        {formError ? <span className="text-rose-400">{formError}</span> : null}
        {notice ? (
          <span className="inline-flex items-start gap-1.5 text-emerald-400">
            <IconCheck className="mt-1 h-3.5 w-3.5 shrink-0" />
            {notice}
          </span>
        ) : null}
      </p>

      {step === "verify" && phone ? (
        <p dir="ltr" className="text-left text-[11px] text-zinc-600">
          {phone}
        </p>
      ) : null}
    </form>
  );
}
