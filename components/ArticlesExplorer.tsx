"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { articleCategories, articles, toPersianDigits } from "@/lib/data";
import { getAiKeyword, matchesAiKeyword } from "@/lib/keywords";
import ArticleCard from "./ArticleCard";
import { IconBook, IconSearch } from "./Icons";

const STEP = 3;

interface ArticlesExplorerProps {
  /** Active AI keyword (`?tag=`) resolved by the server page. */
  tag?: string | null;
}

/** Articles archive: live search, category filter and lazy "load more" paging. */
export default function ArticlesExplorer({ tag = null }: ArticlesExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const keyword = getAiKeyword(tag);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(articleCategories[0]);
  const [visibleCount, setVisibleCount] = useState(STEP);

  useEffect(() => {
    setVisibleCount(STEP);
  }, [tag]);

  const clearTag = () => {
    if (!tag) return;
    router.replace(pathname, { scroll: false });
  };

  const featured = useMemo(() => articles.find((article) => article.featured) ?? articles[0], []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return articles.filter((article) => {
      if (category !== articleCategories[0] && article.category !== category) return false;

      const haystack = [
        article.title,
        article.excerpt,
        article.author,
        article.category,
        ...article.tags,
      ]
        .join(" ")
        .toLowerCase();

      if (!matchesAiKeyword(tag, haystack)) return false;
      if (!needle) return true;

      return haystack.includes(needle);
    });
  }, [query, category, tag]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const filtersActive = Boolean(query) || category !== articleCategories[0] || Boolean(tag);

  return (
    <div>
      {!filtersActive && featured ? (
        <div className="mb-10">
          <p className="eyebrow">مقاله منتخب سردبیر</p>
          <div className="mt-5">
            <ArticleCard article={featured} variant="wide" priority />
          </div>
        </div>
      ) : null}

      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">جستجو در مقالات</span>
            <IconSearch className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(STEP);
              }}
              placeholder="جستجو: ControlNet، نورپردازی، سئو معماری..."
              className="field pr-11"
            />
          </label>

          <p className="inline-flex items-center gap-2 text-[11px] text-zinc-500">
            <IconBook className="h-4 w-4 text-gold/70" />
            <span className="font-bold text-gold-light">{toPersianDigits(filtered.length)}</span>
            مقاله در آرشیو LUMENS
          </p>
        </div>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          {articleCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCategory(item);
                setVisibleCount(STEP);
              }}
              className={`tab ${category === item ? "tab-active" : ""}`}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        {filtersActive ? (
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-[11px] text-zinc-500">
              {keyword ? (
                <>
                  کلیدواژه:{" "}
                  <span className="font-semibold text-gold-light">{keyword.title}</span>
                </>
              ) : (
                "نمایش نتایج فیلترشده"
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory(articleCategories[0]);
                setVisibleCount(STEP);
                clearTag();
              }}
              className="btn-quiet"
            >
              حذف فیلترها
            </button>
          </div>
        ) : null}
      </div>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="glass-card mt-8 flex flex-col items-center gap-3 p-14 text-center">
          <IconSearch className="h-8 w-8 text-gold/70" />
          <p className="text-sm font-bold text-white">
            {keyword
              ? `مقاله‌ای برای کلیدواژه «${keyword.title}» پیدا نشد`
              : "مقاله‌ای با این عبارت پیدا نشد"}
          </p>
          <p className="text-xs leading-6 text-zinc-400">
            {keyword
              ? "دسته‌بندی «همه» را انتخاب کنید یا توضیحات صفحه اختصاصی کلیدواژه را ببینید."
              : "عبارت دیگری را امتحان کنید یا دسته‌بندی را تغییر دهید."}
          </p>
          {keyword ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Link href={keyword.href} className="btn-primary px-4 py-2 text-xs">
                صفحه {keyword.title}
              </Link>
              <Link href={`/courses?tag=${keyword.query}`} className="btn-ghost px-4 py-2 text-xs">
                دوره‌های مرتبط
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {hasMore ? (
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + STEP)}
            className="btn-ghost px-8"
          >
            بارگذاری مقالات بیشتر
          </button>
          <div className="h-1 w-56 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full bg-gradient-to-l from-gold-light via-gold to-gold-deep transition-[width] duration-700 ease-cinema"
              style={{ width: `${Math.round((visible.length / filtered.length) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-zinc-500">
            {toPersianDigits(visible.length)} از {toPersianDigits(filtered.length)} مقاله نمایش داده شده است.
          </p>
        </div>
      ) : (
        <p className="mt-10 text-center text-[11px] text-zinc-500">
          همه مقالات این دسته‌بندی نمایش داده شد.
        </p>
      )}
    </div>
  );
}
