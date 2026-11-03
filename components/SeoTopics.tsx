import Link from "next/link";

import { IconArrowLeft, IconSparkles } from "./Icons";

const topics = [
  { href: "/ai-architecture", label: "هوش مصنوعی در معماری" },
  { href: "/ai-prompts", label: "پرامپت‌نویسی معماری" },
  { href: "/realtime-rendering", label: "رندرینگ لحظه‌ای" },
  { href: "/objects", label: "آبجکت سه‌بعدی معماری" },
  { href: "/courses", label: "دوره هوش مصنوعی معماری" },
  { href: "/articles#a-07", label: "سئو استودیو معماری" },
];

/** Internal-link strip that reinforces the landing page's SEO topic cluster. */
export default function SeoTopics() {
  return (
    <div className="glass-card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-l from-transparent via-gold/55 to-transparent" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="inline-flex shrink-0 items-center gap-2 text-xs font-bold text-white">
          <IconSparkles className="h-4 w-4 text-gold" />
          مسیرهای پرجستجوی معماری
        </p>

        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium text-zinc-400 transition-all duration-300 hover:border-gold/40 hover:bg-gold/[0.07] hover:text-gold-light"
            >
              {topic.label}
              <IconArrowLeft className="h-3 w-3 text-zinc-600 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-gold" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
