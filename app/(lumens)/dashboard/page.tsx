import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import SignOutButton from "@/components/SignOutButton";
import {
  IconArrowLeft,
  IconBook,
  IconCheck,
  IconCube,
  IconSparkles,
} from "@/components/Icons";
import { authOptions } from "@/lib/auth-options";
import { formatIranianPhone } from "@/lib/phone";
import { findUserById } from "@/lib/user-store";

export const metadata: Metadata = {
  title: "داشبورد کاربری",
  description: "پنل شخصی اعضای LUMENS؛ وضعیت حساب، نقش کاربری و دسترسی‌های شما.",
  robots: { index: false, follow: false },
};

// The page reads the session cookie, so it must render per request.
export const dynamic = "force-dynamic";

const quickLinks = [
  {
    href: "/courses",
    title: "دوره‌های تخصصی",
    description: "مسیرهای یادگیری هوش مصنوعی در معماری",
    icon: IconBook,
  },
  {
    href: "/objects",
    title: "آبجکت‌های سه‌بعدی",
    description: "کتابخانه مدل‌های آماده رندر",
    icon: IconCube,
  },
  {
    href: "/ai-architecture",
    title: "موتور هوش مصنوعی",
    description: "اسکچ به رندر و تولید ایده",
    icon: IconSparkles,
  },
  {
    href: "/ai-prompts",
    title: "کتابخانه پرامپت",
    description: "پرامپت‌های آماده معماری",
    icon: IconArrowLeft,
  },
] as const;

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  const storedUser = await findUserById(session.user.id);
  const fullName = storedUser?.fullName ?? session.user.name ?? "کاربر LUMENS";
  const email = storedUser?.email ?? session.user.email ?? "";
  const phone = storedUser?.phone ?? session.user.phone ?? null;
  const role = storedUser?.role ?? session.user.role;
  const isInstructor = role === "instructor";
  const initial = fullName.trim().charAt(0) || "L";
  const joinedAt = storedUser?.createdAt
    ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(storedUser.createdAt))
    : null;

  const capabilities = isInstructor
    ? [
        "ساخت دوره جدید و بارگذاری سرفصل‌ها",
        "بازبینی تمرین‌ها و پروژه‌های دانشجویان",
        "انتشار آبجکت و پرامپت اختصاصی برای اعضا",
      ]
    : [
        "ادامه یادگیری دوره‌های خریداری‌شده",
        "دانلود آبجکت‌های سه‌بعدی با لایسنس حساب شما",
        "ذخیره پرامپت‌های معماری در کتابخانه شخصی",
      ];

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 grid-layer opacity-30" />
      <div className="orb -right-24 -top-24 h-80 w-80 bg-gold/15" />
      <div className="orb -left-24 top-32 h-72 w-72 bg-indigo-500/10" />

      <div className="container-x relative py-16 lg:py-20">
        <nav className="mb-6 flex items-center gap-2 text-[11px] text-zinc-500">
          <Link href="/" className="transition-colors hover:text-gold-light">
            خانه
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400">داشبورد</span>
        </nav>

        <div className="glass-card overflow-hidden">
          <div className="flex flex-col gap-6 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/35 bg-gold/10 font-display text-xl font-black text-gold-light">
                {initial}
              </span>
              <div>
                <h1 className="font-display text-xl font-black text-white sm:text-2xl">{fullName}</h1>
                <p dir="ltr" className="mt-1 text-left text-xs text-zinc-400">
                  {email}
                </p>
                {phone ? (
                  <p dir="ltr" className="mt-0.5 text-left text-xs text-zinc-500">
                    {formatIranianPhone(phone)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-[11px] font-semibold text-gold-light">
                {isInstructor ? "مدرس" : "دانشجو / معمار"}
              </span>
              {joinedAt ? (
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-zinc-400">
                  عضویت از {joinedAt}
                </span>
              ) : null}
              <SignOutButton className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-zinc-300 transition-colors duration-300 hover:border-rose-400/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60" />
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="eyebrow">
                <IconSparkles className="h-3.5 w-3.5" />
                {isInstructor ? "پنل مدرس" : "مسیر یادگیری شما"}
              </span>
              <h2 className="mt-4 font-display text-lg font-black text-white">
                {isInstructor
                  ? "دوره‌ها و محتوای خود را مدیریت کنید"
                  : "از همان‌جایی که متوقف شدید ادامه دهید"}
              </h2>
              <ul className="mt-5 space-y-2.5">
                {capabilities.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-6 text-zinc-300"
                  >
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-300 hover:border-gold/45 hover:bg-white/[0.06]"
                  >
                    <Icon className="h-5 w-5 text-gold" />
                    <p className="mt-3 text-xs font-bold text-white">{link.title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-zinc-500">{link.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
