"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  allCourses,
  courseCategories,
  courseSoftwareTabs,
  formatPrice,
  levels,
  softwareLabels,
  toPersianDigits,
} from "@/lib/data";
import { getAiKeyword, matchesAiKeyword } from "@/lib/keywords";
import type { Course, CourseCategory, CourseSoftware, Level } from "@/lib/types";
import CourseCard from "./CourseCard";
import { IconCheck, IconPlay, IconSearch, IconSparkles } from "./Icons";
import Modal from "./Modal";
import Pagination from "./Pagination";
import Stars from "./Stars";

type CategoryId = "all" | CourseCategory;
type SoftwareId = "all" | CourseSoftware;
type LevelId = "all" | Level;
type SortId = "popular" | "rating" | "cheap" | "expensive" | "longest";

const sortOptions: { id: SortId; label: string }[] = [
  { id: "popular", label: "پرطرفدارترین" },
  { id: "rating", label: "بیشترین امتیاز" },
  { id: "cheap", label: "ارزان‌ترین" },
  { id: "expensive", label: "گران‌ترین" },
  { id: "longest", label: "کامل‌ترین دوره" },
];

const PER_PAGE = 6;

/** Number of courses published for a software track (drives the tab badge). */
function countCourses(software: SoftwareId): number {
  if (software === "all") return allCourses.length;
  return allCourses.filter((course) => course.software.includes(software)).length;
}

interface CoursesExplorerProps {
  /** Active AI keyword (`?tag=`) resolved by the server page. */
  tag?: string | null;
}

/** Course catalog with live search, category/level filters, sorting and enrollment. */
export default function CoursesExplorer({ tag = null }: CoursesExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const keyword = getAiKeyword(tag);
  const [query, setQuery] = useState("");
  const [software, setSoftware] = useState<SoftwareId>("all");
  const [category, setCategory] = useState<CategoryId>("all");
  const [level, setLevel] = useState<LevelId>("all");
  const [onlyFree, setOnlyFree] = useState(false);
  const [sort, setSort] = useState<SortId>("popular");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Course | null>(null);
  const [playingLesson, setPlayingLesson] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [enrolled, setEnrolled] = useState<string[]>([]);
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
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const list = allCourses.filter((course) => {
      if (software !== "all" && !course.software.includes(software)) return false;
      if (category !== "all" && course.category !== category) return false;
      if (level !== "all" && course.level !== level) return false;
      if (onlyFree && !course.isFree) return false;

      const haystack = [
        course.title,
        course.summary,
        course.instructor,
        course.category,
        course.categoryLabel,
        ...course.software.map((item) => softwareLabels[item]),
        ...course.tags,
        ...course.highlights,
      ]
        .join(" ")
        .toLowerCase();

      if (!matchesAiKeyword(tag, haystack)) return false;
      if (!needle) return true;

      return haystack.includes(needle);
    });

    const sorted = [...list];
    switch (sort) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating || b.students - a.students);
        break;
      case "cheap":
        sorted.sort((a, b) => a.price - b.price || b.rating - a.rating);
        break;
      case "expensive":
        sorted.sort((a, b) => b.price - a.price || b.rating - a.rating);
        break;
      case "longest":
        sorted.sort((a, b) => b.hours - a.hours || b.lessonCount - a.lessonCount);
        break;
      default:
        sorted.sort(
          (a, b) => Number(b.popular) - Number(a.popular) || b.students - a.students,
        );
    }
    return sorted;
  }, [query, software, category, level, onlyFree, sort, tag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const resetPage = () => setPage(1);

  const clearTag = () => {
    if (!tag) return;
    router.replace(pathname, { scroll: false });
  };

  const activeFilters =
    Boolean(query) ||
    software !== "all" ||
    category !== "all" ||
    level !== "all" ||
    onlyFree ||
    Boolean(tag);

  const clearFilters = () => {
    setQuery("");
    setSoftware("all");
    setCategory("all");
    setLevel("all");
    setOnlyFree(false);
    setSort("popular");
    resetPage();
    clearTag();
  };

  const openCourse = (course: Course) => {
    setSelected(course);
    setPlayingLesson(null);
    setForm({ name: "", email: "" });
    setErrors({});
  };

  const submitEnrollment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;

    const nextErrors: { name?: string; email?: string } = {};
    if (form.name.trim().length < 3) nextErrors.name = "نام و نام خانوادگی را کامل وارد کنید.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) nextErrors.email = "ایمیل معتبر وارد کنید.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setEnrolled((previous) =>
      previous.includes(selected.id) ? previous : [...previous, selected.id],
    );
    notify(`ثبت‌نام شما در «${selected.title}» با موفقیت انجام شد.`);
    setSelected(null);
  };

  return (
    <div>
      <div className="glass-card p-5 sm:p-7">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <label className="relative block">
            <span className="sr-only">جستجوی دوره‌ها</span>
            <IconSearch className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="جستجوی آنی: پرامپت، رندر، ComfyUI، مدل‌سازی..."
              className="field pr-11"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative block flex-1">
              <span className="sr-only">مرتب‌سازی دوره‌ها</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as SortId);
                  resetPage();
                }}
                className="field appearance-none text-xs"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id} className="bg-ink-card text-white">
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => {
                setOnlyFree((value) => !value);
                resetPage();
              }}
              aria-pressed={onlyFree}
              className={`btn shrink-0 border ${
                onlyFree
                  ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-300"
                  : "border-white/15 bg-white/[0.04] text-zinc-300 hover:border-gold/40 hover:text-white"
              }`}
            >
              {onlyFree ? <IconCheck className="h-4 w-4" /> : <IconSparkles className="h-4 w-4" />}
              فقط رایگان
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-semibold tracking-widest2 text-zinc-500">نرم‌افزار تخصصی</p>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {courseSoftwareTabs.map((item) => {
              const active = software === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSoftware(item.id);
                    resetPage();
                  }}
                  className={`tab ${active ? "tab-active" : ""}`}
                  aria-pressed={active}
                >
                  <span className="inline-flex items-baseline gap-2">
                    <span className={item.id === "all" ? undefined : "font-mono tracking-tight"}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-zinc-500">{toPersianDigits(countCourses(item.id))}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-semibold tracking-widest2 text-zinc-500">دسته‌بندی دوره</p>
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            {courseCategories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCategory(item.id);
                  resetPage();
                }}
                className={`tab ${category === item.id ? "tab-active" : ""}`}
                aria-pressed={category === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-[11px] font-semibold tracking-widest2 text-zinc-500">سطح دوره</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {levels.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setLevel(item.id);
                  resetPage();
                }}
                className={`chip transition-all duration-300 ${
                  level === item.id
                    ? "border-gold/50 bg-gold/15 text-gold-light"
                    : "hover:border-gold/35 hover:text-white"
                }`}
                aria-pressed={level === item.id}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-zinc-500">
          <p>
            {keyword ? (
              <>
                کلیدواژه: <span className="font-semibold text-gold-light">{keyword.title}</span> —{" "}
              </>
            ) : null}
            <span className="font-bold text-gold-light">{toPersianDigits(filtered.length)}</span> دوره با
            فیلترهای فعلی پیدا شد.
          </p>
          {activeFilters ? (
            <button type="button" onClick={clearFilters} className="btn-quiet">
              حذف همه فیلترها
            </button>
          ) : null}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              priority={index < 3}
              footer={
                <button
                  type="button"
                  onClick={() => openCourse(course)}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  {enrolled.includes(course.id) ? "ثبت‌نام‌شده" : "مشاهده و ثبت‌نام"}
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <div className="glass-card mt-8 flex flex-col items-center gap-3 p-14 text-center">
          <IconSearch className="h-8 w-8 text-gold/70" />
          <p className="text-sm font-bold text-white">
            {keyword
              ? `دوره‌ای برای کلیدواژه «${keyword.title}» پیدا نشد`
              : "دوره‌ای با این مشخصات پیدا نشد"}
          </p>
          <p className="text-xs leading-6 text-zinc-400">
            {keyword
              ? "فیلترهای دسته‌بندی و سطح را بردارید یا صفحه اختصاصی کلیدواژه را ببینید."
              : "عبارت دیگری را جستجو کنید یا با دکمه «حذف همه فیلترها» فهرست کامل را ببینید."}
          </p>
          {keyword ? (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Link href={keyword.href} className="btn-primary px-4 py-2 text-xs">
                صفحه {keyword.title}
              </Link>
              <Link href={`/articles?tag=${keyword.query}`} className="btn-ghost px-4 py-2 text-xs">
                مقالات مرتبط
              </Link>
            </div>
          ) : null}
        </div>
      )}

      <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} total={filtered.length} />

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? selected.title : ""}
        subtitle={selected ? selected.summary : undefined}
      >
        {selected ? (
          <div className="grid gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                <span className="chip border-gold/30 text-gold-light">{selected.categoryLabel}</span>
                {selected.software.map((item) => (
                  <span
                    key={`${selected.id}-software-${item}`}
                    className="chip border-white/15 bg-white/[0.05] text-zinc-300"
                  >
                    {softwareLabels[item]}
                  </span>
                ))}
                <span className="chip">{selected.level}</span>
                <span className="chip">{toPersianDigits(selected.hours)} ساعت آموزش</span>
                <span className="chip">{toPersianDigits(selected.lessonCount)} درس</span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <Stars rating={selected.rating} />
                <span className="text-xs text-zinc-500">{selected.instructor}</span>
              </div>

              <h3 className="mt-6 text-sm font-bold text-white">در این دوره یاد می‌گیرید:</h3>
              <ul className="mt-3 space-y-2.5">
                {selected.highlights.map((item) => (
                  <li key={`${selected.id}-${item}`} className="flex items-start gap-2.5 text-xs leading-6 text-zinc-300">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {selected.tags.map((tag) => (
                  <span key={`course-tag-${selected.id}-${tag}`} className="chip">
                    {tag}
                  </span>
                ))}
              </div>

              {selected.videoUrl ? (
                <a
                  href={selected.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-6 px-4 py-2 text-xs"
                >
                  <IconPlay className="h-4 w-4" />
                  تماشای پیش‌نمایش دوره
                </a>
              ) : null}

              {selected.lessons && selected.lessons.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">سرفصل جلسات دوره</p>
                    <span className="chip border-gold/30 text-gold-light">
                      {toPersianDigits(selected.lessons.length)} جلسه نمونه
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {selected.lessons.map((lesson, index) => {
                      const isPlaying = playingLesson === lesson.id;
                      return (
                        <li
                          key={lesson.id}
                          className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
                        >
                          <button
                            type="button"
                            onClick={() => setPlayingLesson(isPlaying ? null : lesson.id)}
                            aria-expanded={isPlaying}
                            className="flex w-full flex-wrap items-center justify-between gap-3 px-3.5 py-3 text-right transition-colors duration-300 hover:bg-white/[0.05]"
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/30 text-[10px] font-bold text-gold-light">
                                {toPersianDigits(index + 1)}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-white">
                                  {lesson.title}
                                </span>
                                {lesson.summary ? (
                                  <span className="mt-1 block truncate text-[10px] text-zinc-500">
                                    {lesson.summary}
                                  </span>
                                ) : null}
                              </span>
                            </span>

                            <span className="flex shrink-0 items-center gap-2 text-[10px] text-zinc-400">
                              {lesson.isPreview ? (
                                <span className="chip border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                                  پیش‌نمایش رایگان
                                </span>
                              ) : null}
                              <span>{lesson.duration}</span>
                              <IconPlay className="h-3.5 w-3.5 text-gold/80" />
                            </span>
                          </button>

                          {isPlaying ? (
                            <div className="aspect-video w-full border-t border-white/10 bg-black">
                              <iframe
                                src={lesson.embedUrl}
                                title={lesson.title}
                                className="h-full w-full"
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </div>

            <form onSubmit={submitEnrollment} className="glass-card h-fit p-5" noValidate>
              <p className="text-sm font-bold text-white">ثبت‌نام در دوره</p>
              <p className="mt-2 text-[11px] leading-6 text-zinc-400">
                پس از تکمیل فرم، لینک ورود به کلاس و فاکتور برای شما ارسال می‌شود.
              </p>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-gold/25 bg-gold/10 px-4 py-3">
                <span className="text-xs text-gold-light">مبلغ دوره</span>
                <span className="text-sm font-bold text-gold-light">{formatPrice(selected.price)}</span>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-[11px] text-zinc-400">نام و نام خانوادگی</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="مثلاً نگار سلطانی"
                  className="field"
                />
                {errors.name ? <span className="mt-2 block text-[11px] text-rose-400">{errors.name}</span> : null}
              </label>

              <label className="mt-4 block">
                <span className="mb-2 block text-[11px] text-zinc-400">ایمیل</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                  placeholder="you@studio.com"
                  className="field dir-ltr text-left"
                />
                {errors.email ? <span className="mt-2 block text-[11px] text-rose-400">{errors.email}</span> : null}
              </label>

              <button type="submit" className="btn-primary mt-5 w-full">
                <IconSparkles className="h-4 w-4" />
                تکمیل ثبت‌نام
              </button>

              <p className="mt-3 text-center text-[10px] text-zinc-500">
                پرداخت امن • دسترسی دائمی • پشتیبانی انجمن تخصصی
              </p>
            </form>
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
