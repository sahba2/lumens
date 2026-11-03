"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { searchContent, searchSuggestions, type SearchEntry, type SearchKind } from "@/lib/search";
import { IconArrowLeft, IconBook, IconClose, IconCube, IconSearch, IconSparkles } from "../Icons";

interface AiSearchProps {
  /** `dock` renders the landing-page search stage, `compact` fits inside a dialog. */
  variant?: "dock" | "compact";
  autoFocus?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
  className?: string;
}

const kindIcon: Record<SearchKind, typeof IconBook> = {
  course: IconBook,
  object: IconCube,
  article: IconSparkles,
};

/**
 * The shared LUMENS search experience: Persian-aware matching, popular
 * suggestions, keyboard navigation and instant routing to the matching
 * course, 3D object or article. Used by both the landing search dock and the
 * global Ctrl/Cmd + K dialog.
 */
export default function AiSearch({
  variant = "dock",
  autoFocus = false,
  onNavigate,
  placeholder = "جستجو در دوره‌ها، آبجکت‌ها و مقالات…",
  className = "",
}: AiSearchProps) {
  const router = useRouter();
  const listId = useId();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const results = useMemo(
    () => searchContent(query, variant === "compact" ? 8 : 5),
    [query, variant],
  );
  const suggestions = useMemo(
    () => searchSuggestions.slice(0, variant === "compact" ? 4 : 6),
    [variant],
  );
  const dock = variant === "dock";

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const goTo = (entry: SearchEntry) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(entry.href);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = results[activeIndex] ?? results[0];
    if (target) {
      goTo(target);
      return;
    }
    if (query.trim().length > 0) {
      onNavigate?.();
      router.push("/courses");
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (results.length === 0 ? 0 : (index + 1) % results.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        results.length === 0 ? 0 : (index - 1 + results.length) % results.length,
      );
    } else if (event.key === "Enter") {
      if (open && results[activeIndex]) {
        event.preventDefault();
        goTo(results[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={boxRef} className={`relative ${className}`.trim()}>
      <form
        role="search"
        onSubmit={onSubmit}
        className={`glass-strong relative flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-500 focus-within:border-gold/45 focus-within:shadow-glow-sm ${
          dock ? "sm:p-2" : ""
        }`}
      >
        <span className="pointer-events-none flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/[0.08] text-gold">
          <IconSearch className="h-[18px] w-[18px]" />
        </span>

        <label className="min-w-0 flex-1">
          <span className="sr-only">جستجوی هوشمند در LUMENS</span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            dir="auto"
            autoComplete="off"
            spellCheck={false}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            className="w-full bg-transparent px-1 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
          />
        </label>

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(true);
              inputRef.current?.focus();
            }}
            aria-label="پاک کردن جستجو"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition-colors duration-300 hover:bg-white/[0.06] hover:text-white"
          >
            <IconClose className="h-4 w-4" />
          </button>
        ) : (
          <kbd
            dir="ltr"
            className="hidden shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-zinc-500 sm:inline-block"
          >
            Ctrl K
          </kbd>
        )}

        <button type="submit" className="btn-primary shrink-0 px-4 py-2.5 text-xs sm:px-5">
          <IconSparkles className="h-4 w-4" />
          <span className="hidden sm:inline">جستجوی هوشمند</span>
          <span className="sm:hidden">جستجو</span>
        </button>
      </form>

      {open ? (
        <div
          className={
            dock
              ? "absolute inset-x-0 top-[calc(100%_+_0.7rem)] z-50"
              : "relative z-10 mt-4"
          }
        >
          <div
            id={listId}
            role="listbox"
            aria-label="نتایج جستجو"
            className="glass-strong overflow-hidden rounded-2xl shadow-card"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-gold-light">
                <IconSparkles className="h-3.5 w-3.5" />
                {query.trim() ? "نتایج جستجو" : "پیشنهادهای پرطرفدار"}
              </span>
              <span className="text-[10px] text-zinc-500">
                {query.trim() ? `${results.length} نتیجه` : "AI RANKED"}
              </span>
            </div>

            {results.length > 0 ? (
              <div className={`overflow-y-auto p-2 ${dock ? "max-h-[21rem]" : "max-h-[44vh]"}`}>
                {results.map((entry, index) => {
                  const Icon = kindIcon[entry.kind];
                  return (
                    <button
                      key={`${entry.kind}-${entry.id}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goTo(entry)}
                      className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-right transition-colors duration-200 ${
                        index === activeIndex
                          ? "bg-gold/[0.09] text-white"
                          : "text-zinc-300 hover:bg-white/[0.05]"
                      }`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-ink/60 text-gold/80">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold leading-5 text-white">
                          {entry.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[10px] text-zinc-500">
                          {entry.kindLabel} · {entry.meta}
                        </span>
                      </span>
                      <IconArrowLeft className="h-3.5 w-3.5 shrink-0 text-zinc-600 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-gold" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-bold text-white">نتیجه‌ای پیدا نشد</p>
                <p className="mt-2 text-[11px] leading-6 text-zinc-500">
                  عبارت دیگری را امتحان کنید؛ مثلاً «ویلای بتنی» یا «رندر لحظه‌ای».
                </p>
              </div>
            )}

            <div className="border-t border-white/10 px-4 py-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="me-1 text-[10px] text-zinc-500">جستجوهای داغ:</span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      setOpen(true);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400 transition-colors duration-300 hover:border-gold/35 hover:text-gold-light"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
