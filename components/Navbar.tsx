"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconClose, IconMenu } from "./Icons";
import AuthModal from "./AuthModal";

/**
 * Main navigation menu.
 * `emoji` is purely decorative (`aria-hidden`) and is hidden on narrow desktop
 * widths so the five labels keep fitting on a single line.
 */
const menuItems = [
  { href: "/", label: "خانه", emoji: null },
  { href: "/ai-architecture", label: "موتور هوش مصنوعی", emoji: "⚡" },
  { href: "/courses", label: "دوره‌های تخصصی", emoji: "🎓" },
  { href: "/objects", label: "آبجکت‌های سه‌بعدی", emoji: "📦" },
  { href: "/articles", label: "مقالات سئو", emoji: "✍️" },
] as const;

const startIdeaHref = "/ai-architecture";

/** Fixed, glassmorphic navigation bar with scroll progress + mobile menu. */
export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name?.trim().split(/\s+/)[0] || "حساب من";

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(top > 14);
      setProgress(height > 0 ? Math.min(100, Math.max(0, (top / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      dir="rtl"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-cinema ${
        scrolled
          ? "border-b border-white/10 bg-ink/70 backdrop-blur-2xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label="LUMENS - خانه">
          <span className="relative flex h-12 w-12 max-h-16 max-w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gold/35 bg-white/[0.04] backdrop-blur-xl transition-shadow duration-500 group-hover:shadow-glow-sm">
            <span className="font-display text-xl font-black leading-none text-gradient-gold">L</span>
            <span className="absolute left-0.5 top-0.5 h-1.5 w-1.5 animate-pulse-glow rounded-full bg-gold" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="flex items-center gap-1.5">
              <span className="font-display text-base font-black tracking-widest2 text-white">LUMENS</span>
              <span
                aria-hidden="true"
                className="text-sm transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
              >
                ✨
              </span>
            </span>
            <span className="mt-1 text-[10px] font-medium text-zinc-500">هوش مصنوعی در معماری</span>
          </span>
        </Link>

        <nav
          aria-label="ناوبری اصلی"
          className="hidden flex-1 items-center justify-start gap-1 ps-4 lg:flex xl:ps-6"
        >
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-semibold transition-all duration-300 xl:px-4 xl:text-sm ${
                isActive(item.href)
                  ? "bg-gold/15 text-gold-light"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {item.emoji ? (
                <span aria-hidden="true" className="hidden text-sm xl:inline">
                  {item.emoji}
                </span>
              ) : null}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/10 px-4 py-2.5 text-xs font-semibold text-gold-light transition-all duration-300 hover:border-gold/60 hover:text-white"
              >
                <span aria-hidden="true">👤</span>
                {firstName}
              </Link>
              <button
                type="button"
                onClick={() => {
                  void signOut({ callbackUrl: "/" });
                }}
                aria-label="خروج از حساب"
                className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-2.5 text-xs font-semibold text-zinc-300 transition-all duration-300 hover:border-rose-400/50 hover:text-white"
              >
                خروج
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              aria-haspopup="dialog"
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-all duration-300 hover:border-gold/45 hover:text-white"
            >
              <span aria-hidden="true">👤</span>
              ورود / ثبت‌نام
            </button>
          )}
          <Link href={startIdeaHref} className="btn-primary px-5 py-2.5 text-xs">
            <span aria-hidden="true">🚀</span>
            شروع ایده رایگان
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link href={startIdeaHref} className="btn-primary hidden px-4 py-2 text-[11px] sm:inline-flex">
            <span aria-hidden="true">🚀</span>
            شروع ایده رایگان
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? "بستن منو" : "باز کردن منو"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="glass-strong flex h-10 w-10 items-center justify-center rounded-2xl text-zinc-200 transition-colors duration-300 hover:text-gold"
          >
            {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Scroll progress bar */}
      <div className="relative h-px w-full bg-white/5">
        <span
          className="absolute inset-y-0 right-0 block bg-gradient-to-l from-gold-light via-gold to-gold-deep transition-[width] duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!mobileOpen}
      >
        <div
          className={`fixed inset-0 top-[81px] z-40 bg-ink/80 backdrop-blur-xl transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />
        <nav
          id="mobile-navigation"
          aria-label="ناوبری موبایل"
          className={`absolute inset-x-0 top-full z-50 mx-3 mt-3 origin-top rounded-xl2 border border-white/10 bg-ink-card/95 p-4 shadow-card backdrop-blur-2xl transition-all duration-500 ease-cinema ${
            mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-300 ${
                  isActive(item.href)
                    ? "bg-gold/15 text-gold-light"
                    : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item.emoji ? <span aria-hidden="true">{item.emoji}</span> : null}
                {item.label}
              </Link>
            ))}
          </div>

          <div className="my-4 hairline" />

          {user ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gold/35 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold-light transition-colors duration-300 hover:border-gold/60 hover:text-white"
              >
                <span aria-hidden="true">👤</span>
                داشبورد {firstName}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors duration-300 hover:border-rose-400/50 hover:text-white"
              >
                خروج از حساب
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setAuthOpen(true);
              }}
              aria-haspopup="dialog"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-200 transition-colors duration-300 hover:border-gold/45 hover:text-white"
            >
              <span aria-hidden="true">👤</span>
              ورود / ثبت‌نام
            </button>
          )}

          <Link href={startIdeaHref} className="btn-primary mt-2 w-full">
            <span aria-hidden="true">🚀</span>
            شروع ایده رایگان
          </Link>
        </nav>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}
