"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { aiKeywords, requestAiChat, type AiKeyword } from "@/lib/keywords";
import { IconBolt, IconBrain, IconRoute, IconSparkles } from "./Icons";

const iconMap = {
  brain: IconBrain,
  sparkles: IconSparkles,
  bolt: IconBolt,
  route: IconRoute,
} as const;

interface AiKeywordsSectionProps {
  className?: string;
  /** Hides the helper line under the chips. */
  showHint?: boolean;
}

/**
 * The four golden AI keywords. A click does two things at once:
 *
 *   1. writes `?tag=<keyword>` to the current URL so the articles / courses /
 *      objects explorers filter themselves, and
 *   2. dispatches `lumens:open-chat` with a ready-made prompt for the
 *      «معمار من» chat widget.
 *
 * Must be rendered inside a `<Suspense>` boundary because it reads
 * `useSearchParams()`.
 */
export default function AiKeywordsSection({
  className = "",
  showHint = true,
}: AiKeywordsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeQuery = searchParams.get("tag");
  const activeKeyword = aiKeywords.find((keyword) => keyword.query === activeQuery);

  const handleClick = (keyword: AiKeyword) => {
    // 1. Update the URL query params: the explorers read this `tag`.
    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", keyword.query);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });

    // 2. Trigger the «معمار من» chatbot with a pre-filled prompt.
    requestAiChat({ prompt: keyword.prompt, query: keyword.query });
  };

  return (
    <section aria-label="کلیدواژه‌های هوش مصنوعی" className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {aiKeywords.map((keyword) => {
          const Icon = iconMap[keyword.icon];
          const isActive = activeQuery === keyword.query;

          return (
            <button
              key={keyword.id}
              type="button"
              onClick={() => handleClick(keyword)}
              aria-pressed={isActive}
              aria-label={keyword.title}
              title={keyword.prompt}
              className={`group flex items-center gap-3 rounded-2xl border p-4 text-right transition-all duration-300 ease-cinema ${
                isActive
                  ? "border-gold/55 bg-gradient-to-br from-gold/20 to-ink-card text-gold-light shadow-glow-sm"
                  : "border-white/10 bg-ink-card/80 text-zinc-300 hover:-translate-y-0.5 hover:border-gold/40 hover:text-white"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${
                  isActive
                    ? "border-gold/40 bg-gold/15 text-gold-light"
                    : "border-white/10 bg-white/[0.04] text-gold/80 group-hover:text-gold-light"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="text-[10px] font-normal text-zinc-500">کلیک کنید و بپرسید</span>
                <span className="mt-0.5 text-sm font-semibold leading-6">{keyword.title}</span>
              </span>
            </button>
          );
        })}
      </div>

      {showHint ? (
        <p aria-live="polite" className="mt-3 text-[11px] leading-6 text-zinc-500">
          {activeKeyword ? (
            <>
              فیلتر فعال: <span className="font-semibold text-gold-light">{activeKeyword.title}</span>
            </>
          ) : (
            "هر کلیدواژه هم آرشیو را فیلتر می‌کند و هم پرسش آماده را به چت «معمار من» می‌فرستد."
          )}
        </p>
      ) : null}
    </section>
  );
}
