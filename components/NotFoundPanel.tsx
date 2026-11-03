import Link from "next/link";

import { IconArrowLeft, IconCube, IconSparkles } from "@/components/Icons";

/**
 * Shared 404 panel.
 * Rendered by both `app/not-found.tsx` (global fallback) and
 * `app/(lumens)/not-found.tsx` (route-group 404) so an unknown route never
 * renders as a blank page and the markup stays in one place.
 */
export default function NotFoundPanel() {
  return (
    <section className="container-x relative flex min-h-[70vh] items-center justify-center py-20">
      <div className="pointer-events-none absolute inset-0 grid-layer opacity-20" />
      <div className="orb -right-24 top-10 h-72 w-72 bg-gold/15" />
      <div className="orb -left-24 bottom-10 h-72 w-72 bg-indigo-500/10" />

      <div className="glass-card relative w-full max-w-2xl overflow-hidden p-8 text-center sm:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/35 bg-white/[0.04]">
          <span className="font-display text-2xl font-black text-gradient-gold">L</span>
        </span>

        <p className="mt-7 font-display text-6xl font-black text-gradient-gold sm:text-7xl">۴۰۴</p>
        <h1 className="section-title mt-4">این صفحه در آرشیو LUMENS پیدا نشد</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-zinc-400">
          ممکن است نشانی تغییر کرده باشد یا این مسیر هنوز منتشر نشده است. از مسیرهای زیر ادامه دهید؛
          همه بخش‌های اصلی پلتفرم در دسترس هستند.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-primary">
            <IconSparkles className="h-4 w-4" />
            بازگشت به خانه
          </Link>
          <Link href="/courses" className="btn-ghost">
            دوره‌های آموزشی
            <IconArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/objects" className="btn-ghost">
            <IconCube className="h-4 w-4 text-gold" />
            کتابخانه آبجکت‌ها
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-6 text-[11px] text-zinc-500">
          <span>مسیرهای پیشنهادی:</span>
          <Link href="/articles" className="text-gold-light hover:underline">
            مقالات
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/ai-prompts" className="text-gold-light hover:underline">
            پرامپت‌ها
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/ai-workflow" className="text-gold-light hover:underline">
            گردش کار AI
          </Link>
          <span className="text-zinc-700">•</span>
          <Link href="/realtime-rendering" className="text-gold-light hover:underline">
            رندرینگ لحظه‌ای
          </Link>
        </div>
      </div>
    </section>
  );
}
