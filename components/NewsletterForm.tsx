"use client";

import { useState, type FormEvent } from "react";
import { IconCheck, IconSparkles } from "./Icons";

/** Newsletter opt-in used in the footer. Fully client-side + validated. */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    if (!valid) {
      setStatus("error");
      return;
    }
    setStatus("done");
    setEmail("");
  };

  return (
    <div className="glass-card p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-white">
        <IconSparkles className="h-4 w-4 text-gold" />
        خبرنامه هفتگی LUMENS
      </p>
      <p className="mt-2 text-xs leading-6 text-zinc-400">
        هر هفته یک پرامپت آماده، یک ترفند رندر لحظه‌ای و معرفی جدیدترین آبجکت‌ها.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row" noValidate>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder="ایمیل شما"
          aria-label="ایمیل برای عضویت در خبرنامه"
          className="field dir-ltr text-left"
        />
        <button type="submit" className="btn-primary shrink-0 px-5 py-3 text-xs">
          عضویت
        </button>
      </form>

      <p className="mt-3 h-5 text-xs" aria-live="polite">
        {status === "error" ? (
          <span className="text-rose-400">ایمیل وارد‌شده معتبر نیست. دوباره تلاش کنید.</span>
        ) : null}
        {status === "done" ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-400">
            <IconCheck className="h-3.5 w-3.5" />
            ثبت شد! اولین شماره فردا برای شما ارسال می‌شود.
          </span>
        ) : null}
      </p>
    </div>
  );
}
