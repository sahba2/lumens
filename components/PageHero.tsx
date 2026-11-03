import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BLUR_DATA_URL } from "@/lib/images";
import { IconArrowLeft } from "./Icons";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Decorative render shown next to the copy (optional). */
  image?: string;
  /** Extra badges / stat chips rendered under the description. */
  badges?: string[];
  actions?: ReactNode;
  breadcrumb?: { href: string; label: string };
}

/** Shared inner-page hero: golden eyebrow, big title, copy and artwork. */
export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  badges,
  actions,
  breadcrumb,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="pointer-events-none absolute inset-0 grid-layer opacity-30" />
      <div className="orb -right-24 -top-24 h-80 w-80 bg-gold/15" />
      <div className="orb -left-24 top-24 h-72 w-72 bg-indigo-500/10" />

      <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-20">
        <div>
          {breadcrumb ? (
            <nav className="mb-6 flex items-center gap-2 text-[11px] text-zinc-500">
              <Link href="/" className="transition-colors hover:text-gold-light">
                خانه
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400">{breadcrumb.label}</span>
            </nav>
          ) : null}

          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-6 font-display text-3xl font-black leading-[1.35] text-white sm:text-4xl lg:text-[2.9rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
            {description}
          </p>

          {badges && badges.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span key={badge} className="chip border-gold/25 text-gold-light">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {actions ?? (
              <>
                <Link href="/courses" className="btn-primary">
                  شروع یادگیری
                  <IconArrowLeft className="h-4 w-4" />
                </Link>
                <Link href="/objects" className="btn-ghost">
                  کتابخانه آبجکت‌ها
                </Link>
              </>
            )}
          </div>
        </div>

        {image ? (
          <div className="relative">
            <div className="glass-card overflow-hidden p-3">
              <div className="render-frame relative aspect-[16/11] w-full">
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 44vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  priority
                  className="object-cover"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              </div>
            </div>
            <div className="glass-strong absolute -bottom-5 right-6 hidden rounded-2xl px-5 py-3 shadow-card sm:block">
              <p className="text-[10px] tracking-widest2 text-zinc-500">LUMENS LAB</p>
              <p className="mt-1 text-xs font-bold text-gold-light">AI × ARCHITECTURE</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
