"use client";

import { useMemo, useState } from "react";

import { promptCategories, prompts, toPersianDigits } from "@/lib/data";
import type { Level } from "@/lib/types";
import { IconCheck, IconCopy, IconSearch, IconSparkles } from "./Icons";

type Difficulty = "all" | Level;

const difficulties: Difficulty[] = ["all", "مبتدی", "متوسط", "پیشرفته"];

/** Prompt library: filter by category/difficulty, search and one-click copy. */
export default function PromptsExplorer() {
  const [category, setCategory] = useState<string>(promptCategories[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>("all");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [openNegative, setOpenNegative] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return prompts.filter((prompt) => {
      if (category !== promptCategories[0] && prompt.category !== category) return false;
      if (difficulty !== "all" && prompt.difficulty !== difficulty) return false;
      if (!needle) return true;

      return [prompt.title, prompt.text, prompt.negative, prompt.model, ...prompt.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [category, difficulty, query]);

  const copyPrompt = async (id: string, text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 2200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div>
      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-md">
            <span className="sr-only">جستجو در پرامپت‌ها</span>
            <IconSearch className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جستجو: بتنی، شب، 35mm، travertine..."
              className="field pr-11"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {difficulties.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDifficulty(item)}
                className={`chip transition-all duration-300 ${
                  difficulty === item
                    ? "border-gold/50 bg-gold/15 text-gold-light"
                    : "hover:border-gold/35 hover:text-white"
                }`}
                aria-pressed={difficulty === item}
              >
                {item === "all" ? "همه سطوح" : item}
              </button>
            ))}
          </div>
        </div>

        <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
          {promptCategories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`tab ${category === item ? "tab-active" : ""}`}
              aria-pressed={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mt-5 border-t border-white/10 pt-5 text-[11px] text-zinc-500">
          <span className="font-bold text-gold-light">{toPersianDigits(filtered.length)}</span> پرامپت آماده
          پیدا شد؛ کافی است روی «کپی» بزنید و در Midjourney یا Stable Diffusion استفاده کنید.
        </p>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {filtered.map((prompt) => (
            <article key={prompt.id} className="glow-card flex flex-col p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold leading-7 text-white">{prompt.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span className="chip border-gold/25 text-gold-light">{prompt.category}</span>
                    <span className="chip">{prompt.model}</span>
                    <span className="chip">{prompt.difficulty}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyPrompt(prompt.id, prompt.text)}
                  className="btn-quiet inline-flex items-center gap-1.5"
                >
                  {copied === prompt.id ? (
                    <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <IconCopy className="h-3.5 w-3.5" />
                  )}
                  {copied === prompt.id ? "کپی شد" : "کپی"}
                </button>
              </div>

              <pre
                dir="ltr"
                className="mt-5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/50 p-4 text-left font-mono text-[11px] leading-6 text-zinc-300"
              >
                {prompt.text}
              </pre>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setOpenNegative((current) => (current === prompt.id ? null : prompt.id))}
                  aria-expanded={openNegative === prompt.id}
                  className="inline-flex items-center gap-2 text-[11px] font-semibold text-zinc-400 transition-colors duration-300 hover:text-gold-light"
                >
                  <IconSparkles className="h-3.5 w-3.5 text-gold/70" />
                  منفی‌پرامپت پیشنهادی LUMENS
                </button>
                {openNegative === prompt.id ? (
                  <p
                    dir="ltr"
                    className="mt-3 rounded-2xl border border-rose-400/20 bg-rose-500/[0.06] p-3 text-left font-mono text-[11px] leading-6 text-rose-200"
                  >
                    {prompt.negative}
                  </p>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-5">
                {prompt.tags.map((tag) => (
                  <span key={`${prompt.id}-${tag}`} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="glass-card mt-8 flex flex-col items-center gap-3 p-14 text-center">
          <IconSearch className="h-8 w-8 text-gold/70" />
          <p className="text-sm font-bold text-white">پرامپتی با این مشخصات پیدا نشد</p>
          <p className="text-xs text-zinc-400">دسته‌بندی یا سطح دشواری دیگری را انتخاب کنید.</p>
        </div>
      )}
    </div>
  );
}
