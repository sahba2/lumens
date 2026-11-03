import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import AuthPanel from "@/components/AuthPanel";
import { IconCheck, IconSparkles } from "@/components/Icons";
import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "ورود و ثبت‌نام",
  description:
    "ورود به حساب کاربری LUMENS برای دسترسی به دوره‌های هوش مصنوعی در معماری، کتابخانه آبجکت‌های سه‌بعدی و پرامپت‌های ذخیره‌شده.",
  alternates: { canonical: "/auth/login" },
  robots: { index: false, follow: true },
};

const benefits = [
  "دسترسی به دوره‌های خریداری‌شده و ادامه یادگیری از همان جلسه",
  "دانلود آبجکت‌های سه‌بعدی با لایسنس اختصاصی حساب شما",
  "ذخیره پرامپت‌های معماری و کتابخانه شخصی پرامپت",
  "دریافت خروجی رندر و فایل‌های تمرین پروژه‌ها",
];

export default async function LoginPage() {
  // Signed-in visitors do not need the form; send them straight to their panel.
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 grid-layer opacity-30" />
      <div className="orb -right-24 -top-24 h-80 w-80 bg-gold/15" />
      <div className="orb -left-24 top-24 h-72 w-72 bg-indigo-500/10" />

      <div className="container-x relative grid items-start gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <nav className="mb-6 flex items-center gap-2 text-[11px] text-zinc-500">
            <Link href="/" className="transition-colors hover:text-gold-light">
              خانه
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400">ورود و ثبت‌نام</span>
          </nav>

          <span className="eyebrow">
            <IconSparkles className="h-3.5 w-3.5" />
            حساب کاربری LUMENS
          </span>
          <h1 className="mt-6 font-display text-3xl font-black leading-[1.35] text-white sm:text-4xl">
            وارد شوید و مسیر یادگیری هوش مصنوعی در معماری را ادامه دهید
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
            با یک حساب کاربری به دوره‌های تخصصی، کتابخانه آبجکت‌های سه‌بعدی و پرامپت‌های آماده دسترسی
            دارید؛ پیشرفت هر دوره ذخیره می‌شود و می‌توانید از هر دستگاهی ادامه دهید.
          </p>

          <ul className="mt-8 space-y-3">
            {benefits.map((item) => (
              <li
                key={item}
                className="glass flex items-start gap-3 rounded-2xl px-4 py-3 text-xs leading-6 text-zinc-300"
              >
                <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <AuthPanel />
      </div>
    </section>
  );
}