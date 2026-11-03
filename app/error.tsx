"use client";

import { useEffect } from "react";
import Link from "next/link";

import { IconArrowLeft, IconBolt, IconSparkles } from "@/components/Icons";

/**
 * Route-level error boundary.
 * Next.js requires this file to exist at the root of the app directory so that
 * runtime errors in any segment render a styled recovery screen instead of the
 * dev overlay's "missing required error components" refresh loop.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the real cause in the browser console / dev terminal.
    console.error("[LUMENS] Unhandled route error:", error);
  }, [error]);

  return (
    <section className="container-x relative flex min-h-[70vh] items-center justify-center py-20">
      <div className="pointer-events-none absolute inset-0 grid-layer opacity-20" />
      <div className="orb -right-24 -top-10 h-72 w-72 bg-gold/15" />
      <div className="orb -left-24 bottom-10 h-72 w-72 bg-indigo-500/10" />

      <div className="glass-card relative w-full max-w-2xl overflow-hidden p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-white/[0.04]">
          <IconBolt className="h-7 w-7 text-gold" />
        </span>

        <p className="mt-7 font-display text-5xl font-black text-gradient-gold sm:text-6xl">خطا</p>
        <h1 className="section-title mt-4">مشکلی در بارگذاری این بخش پیش آمد</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">
          ممکن است اتصال شبکه یا داده‌های این صفحه موقتاً در دسترس نباشد. می‌توانید دوباره تلاش کنید
          یا به صفحه اصلی بازگردید.
        </p>

        {error?.message ? (
          <p
            dir="ltr"
            className="mx-auto mt-5 max-w-lg overflow-x-auto rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left text-[11px] leading-6 text-zinc-500"
          >
            {error.message}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-primary">
            <IconSparkles className="h-4 w-4" />
            تلاش دوباره
          </button>
          <Link href="/" className="btn-ghost">
            بازگشت به خانه
            <IconArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
