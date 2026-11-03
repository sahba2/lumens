"use client";

import { useEffect } from "react";

import "./globals.css";

/**
 * Global error boundary.
 * Replaces the root layout when an error escapes every nested boundary, so it
 * has to render its own <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LUMENS] Global error:", error);
  }, [error]);

  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="dark min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <main className="container-x flex min-h-screen flex-col items-center justify-center py-20 text-center">
          <span className="eyebrow">LUMENS</span>
          <h1 className="section-title mt-6">خطای غیرمنتظره در بارگذاری برنامه</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
            برنامه نتوانست به‌درستی بارگذاری شود. صفحه را دوباره بارگذاری کنید؛ اگر مشکل ادامه داشت
            کش مرورگر و سرور توسعه را پاک کنید.
          </p>

          {error?.message ? (
            <p
              dir="ltr"
              className="mt-5 max-w-xl overflow-x-auto rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-left text-[11px] leading-6 text-zinc-500"
            >
              {error.message}
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => reset()} className="btn-primary">
              تلاش دوباره
            </button>
            {/* A hard reload is the only reliable escape from a broken root layout. */}
            <button type="button" onClick={() => window.location.reload()} className="btn-ghost">
              بارگذاری مجدد صفحه
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
