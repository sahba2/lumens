import Image from "next/image";
import Link from "next/link";

import { keywordFeatures } from "@/lib/data";
import { BLUR_DATA_URL, imageOf } from "@/lib/images";
import { IconArrowLeft, IconBolt, IconBrain, IconRoute, IconSparkles } from "./Icons";

const iconMap = {
  brain: IconBrain,
  sparkles: IconSparkles,
  bolt: IconBolt,
  route: IconRoute,
} as const;

/**
 * The four golden keyword cards of the landing page. Every card links to its
 * dedicated AI sub-page and lights up its border on hover.
 */
export default function KeywordCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {keywordFeatures.map((feature) => {
        const Icon = iconMap[feature.icon as keyof typeof iconMap] ?? IconSparkles;
        const [from, to] = feature.accent;

        return (
          <Link
            key={feature.id}
            href={feature.href}
            className="glow-card group flex h-full flex-col p-6"
            aria-label={feature.title}
          >
            <div
              className="relative h-28 w-full overflow-hidden rounded-2xl border border-white/10"
              style={{ background: `linear-gradient(140deg, ${from}33, ${to}55)` }}
            >
              <Image
                src={imageOf(feature.id)}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover opacity-70 transition-transform duration-700 ease-cinema group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <span
                className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 backdrop-blur-xl"
                style={{ background: `linear-gradient(140deg, ${from}2e, ${to}4d)` }}
              >
                <Icon className="h-5 w-5 text-white" />
              </span>
            </div>

            <p className="mt-5 text-[10px] font-semibold tracking-widest2 text-gold/80">{feature.short}</p>
            <h3 className="mt-2 text-base font-bold leading-7 text-white transition-colors duration-300 group-hover:text-gold-light">
              {feature.title}
            </h3>
            <p className="mt-3 flex-1 text-xs leading-6 text-zinc-400">{feature.description}</p>

            <ul className="mt-4 space-y-2">
              {feature.bullets.map((bullet) => (
                <li key={`${feature.id}-${bullet}`} className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="h-1 w-1 rounded-full bg-gold" />
                  {bullet}
                </li>
              ))}
            </ul>

            <span className="mt-5 inline-flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-gold transition-all duration-300 group-hover:gap-3 group-hover:text-gold-light">
              ورود به این بخش
              <IconArrowLeft className="h-4 w-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
