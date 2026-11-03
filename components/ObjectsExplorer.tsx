"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { models3d, objectTabs, toPersianDigits } from "@/lib/data";
import { BLUR_DATA_URL, imageOf } from "@/lib/images";
import { getAiKeyword, matchesAiKeyword } from "@/lib/keywords";
import type { FilterOption, Model3D, ObjectCategory } from "@/lib/types";
import { IconCheck, IconCube, IconDownload, IconSearch, IconSliders, IconSparkles } from "./Icons";
import Modal from "./Modal";
import ObjectCard from "./ObjectCard";
import Pagination from "./Pagination";
import Stars from "./Stars";

type TabId = "all" | ObjectCategory;
type SortId = "popular" | "newest" | "cheap" | "expensive";

const sortOptions: FilterOption<SortId>[] = [
  { id: "popular", label: "محبوب‌ترین" },
  { id: "newest", label: "جدیدترین" },
  { id: "cheap", label: "ارزان‌ترین" },
  { id: "expensive", label: "گران‌ترین" },
];

const PER_PAGE = 6;

interface ObjectsExplorerProps {
  /** Active AI keyword (`?tag=`) resolved by the server page. */
  tag?: string | null;
}

/** Interactive 3D-object marketplace: tabs, live search, sorting, pager, modal. */
export default function ObjectsExplorer({ tag = null }: ObjectsExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const keyword = getAiKeyword(tag);
  const [tab, setTab] = useState<TabId>("all");
  const [sort, setSort] = useState<SortId>("popular");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Model3D | null>(null);
  const [downloaded, setDownloaded] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [tag]);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  };

  const counts = useMemo(() => {
    const map: Record<TabId, number> = { all: models3d.length, interior: 0, exterior: 0, furniture: 0 };
    models3d.forEach((model) => {
      map[model.category] += 1;
    });
    return map;
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const list = models3d.filter((model) => {
      const matchesTab = tab === "all" || model.category === tab;
      if (!matchesTab) return false;

      const haystack = [
        model.title,
        model.description,
        model.category,
        model.categoryLabel,
        ...model.tags,
        ...model.software,
      ]
        .join(" ")
        .toLowerCase();

      if (!matchesAiKeyword(tag, haystack)) return false;
      if (!needle) return true;

      return haystack.includes(needle);
    });

    const sorted = [...list];
    switch (sort) {
      case "newest":
        sorted.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "cheap":
        sorted.sort((a, b) => a.price - b.price || b.rating - a.rating);
        break;
      case "expensive":
        sorted.sort((a, b) => b.price - a.price || b.rating - a.rating);
        break;
      default:
        sorted.sort((a, b) => b.downloads - a.downloads || b.rating - a.rating);
    }
    return sorted;
  }, [tab, query, sort, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const resetPage = () => setPage(1);

  const clearTag = () => {
    if (!tag) return;
    router.replace(pathname, { scroll: false });
  };

  const handleDownload = (model: Model3D) => {
    setDownloaded((previous) => (previous.includes(model.id) ? previous : [...previous, model.id]));
    notify(`دانلود «${model.title}» آغاز شد (${model.format})`);

    const anchor = document.createElement("a");
    anchor.href = imageOf(model.id);
    anchor.download = `lumens-${model.id}.svg`;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div>
      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {objectTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setTab(item.id);
                  resetPage();
                }}
                className={`tab ${tab === item.id ? "tab-active" : ""}`}
                aria-pressed={tab === item.id}
              >
                {item.label}
                <span className="mr-2 text-[10px] opacity-70 tabular-nums">
                  {toPersianDigits(counts[item.id])}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block w-full sm:w-64">
              <span className="sr-only">جستجو در آبجکت‌ها</span>
              <IconSearch className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder="جستجو: مبل، ویلا، نما..."
                className="field pr-11"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">مرتب‌سازی آبجکت‌ها</span>
              <IconSliders className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortId);
                  resetPage();
                }}
                className="field appearance-none pl-8 pr-11 text-xs"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id} className="bg-ink-card text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
          <p>
            {keyword ? (
              <>
                کلیدواژه: <span className="font-semibold text-gold-light">{keyword.title}</span> —{" "}
              </>
            ) : null}
            <span className="font-bold text-gold-light">{toPersianDigits(filtered.length)}</span> آبجکت در این
            نمایش یافت شد.
          </p>
          {query || tab !== "all" || Boolean(tag) ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setTab("all");
                setSort("popular");
                resetPage();
                clearTag();
              }}
              className="btn-quiet"
            >
              حذف فیلترها
            </button>
          ) : null}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((model, index) => (
            <ObjectCard
              key={model.id}
              model={model}
              onView={setActive}
              onDownload={handleDownload}
              priority={index < 3}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card mt-8 flex flex-col items-center gap-3 p-14 text-center">
          <IconCube className="h-8 w-8 text-gold/70" />
          <p className="text-sm font-bold text-white">
            {keyword
              ? `آبجکتی برای کلیدواژه «${keyword.title}» پیدا نشد`
              : "آبجکتی با این مشخصات پیدا نشد"}
          </p>
          <p className="text-xs leading-6 text-zinc-400">
            {keyword
              ? "کتابخانه سه‌بعدی هنوز برای این کلیدواژه تکمیل نشده است؛ در این فاصله دوره‌ها و مقالات مرتبط را ببینید."
              : "عبارت جستجو را کوتاه‌تر کنید یا تب دیگری را انتخاب کنید."}
          </p>
          {keyword ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Link href={`/courses?tag=${keyword.query}`} className="btn-ghost px-4 py-2 text-xs">
                دوره‌های مرتبط
              </Link>
              <Link href={`/articles?tag=${keyword.query}`} className="btn-ghost px-4 py-2 text-xs">
                مقالات مرتبط
              </Link>
              <Link href={keyword.href} className="btn-primary px-4 py-2 text-xs">
                صفحه {keyword.title}
              </Link>
            </div>
          ) : null}
        </div>
      )}

      <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} total={filtered.length} />

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={active ? active.title : ""}
        subtitle={active ? active.description : undefined}
      >
        {active ? (
          <div className="grid gap-6">
            <div className="render-frame aspect-[4/3]">
              <Image
                src={imageOf(active.id)}
                alt={`رندر ${active.title}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>

            <div>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "دسته‌بندی", value: active.categoryLabel },
                  { label: "فرمت فایل", value: active.format },
                  { label: "پالیگان", value: active.polygons },
                  { label: "حجم فایل", value: active.size },
                  { label: "نرم‌افزار", value: active.software.join("، ") },
                  { label: "آخرین به‌روزرسانی", value: active.updated },
                ].map((row) => (
                  <div key={`${active.id}-${row.label}`} className="glass rounded-2xl p-3">
                    <dt className="text-[10px] text-zinc-500">{row.label}</dt>
                    <dd className="mt-1.5 font-semibold text-zinc-100">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex items-center justify-between">
                <Stars rating={active.rating} />
                <span className="text-xs text-zinc-500">
                  {toPersianDigits(active.downloads)} دانلود تا امروز
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {active.tags.map((tag) => (
                  <span key={`modal-${active.id}-${tag}`} className="chip">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => handleDownload(active)} className="btn-primary">
                  {downloaded.includes(active.id) ? (
                    <IconCheck className="h-4 w-4" />
                  ) : (
                    <IconDownload className="h-4 w-4" />
                  )}
                  دانلود فایل سه‌بعدی
                </button>
                <Link href="/courses" className="btn-ghost">
                  <IconSparkles className="h-4 w-4 text-gold" />
                  آموزش استفاده در پروژه
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <div
        aria-live="polite"
        className={`glass-strong pointer-events-none fixed bottom-6 right-1/2 z-[80] translate-x-1/2 rounded-full px-5 py-3 text-xs font-semibold text-white transition-all duration-500 ease-cinema ${
          toast ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {toast ? (
          <span className="inline-flex items-center gap-2">
            <IconCheck className="h-4 w-4 text-emerald-400" />
            {toast}
          </span>
        ) : null}
      </div>
    </div>
  );
}
