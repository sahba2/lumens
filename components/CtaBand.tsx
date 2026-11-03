import Link from "next/link";

import { IconArrowLeft, IconSparkles } from "./Icons";

interface CtaBandProps {
  eyebrow?: string;
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
}

/** Reusable glass call-to-action band used at the end of every page. */
export default function CtaBand({ eyebrow, title, description, primary, secondary }: CtaBandProps) {
  return (
    <div className="glass-card relative overflow-hidden p-8 text-center sm:p-12">
      <div className="pointer-events-none absolute inset-0 grid-layer opacity-40" />
      <div className="orb -right-16 -top-16 h-64 w-64 bg-gold/15" />
      <div className="orb -bottom-20 -left-10 h-64 w-64 bg-indigo-500/10" />

      <div className="relative mx-auto max-w-3xl">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 className="section-title mt-5">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">{description}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={primary.href} className="btn-primary">
            <IconSparkles className="h-4 w-4" />
            {primary.label}
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="btn-ghost">
              {secondary.label}
              <IconArrowLeft className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
