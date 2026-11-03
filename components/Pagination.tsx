"use client";

import { toPersianDigits } from "@/lib/data";
import { IconArrowLeft } from "./Icons";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** Total filtered results, shown next to the pager. */
  total?: number;
}

/** Numbered pager with previous/next controls (1-based page index). */
export default function Pagination({ page, totalPages, onChange, total }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="mt-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
      {typeof total === "number" ? (
        <p className="text-xs text-zinc-500">
          نمایش صفحه <span className="font-bold text-gold-light">{toPersianDigits(page)}</span> از{" "}
          <span className="font-bold text-zinc-300">{toPersianDigits(totalPages)}</span> — مجموع{" "}
          <span className="font-bold text-zinc-300">{toPersianDigits(total)}</span> مورد
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="btn-quiet disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconArrowLeft className="h-3.5 w-3.5 rotate-180" />
          قبلی
        </button>

        <div className="flex items-center gap-1.5">
          {pages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={`h-9 w-9 rounded-xl border text-xs font-bold transition-all duration-300 tabular-nums ${
                item === page
                  ? "border-gold/60 bg-gold/15 text-gold-light shadow-glow-sm"
                  : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-gold/40 hover:text-white"
              }`}
            >
              {toPersianDigits(item)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="btn-quiet disabled:cursor-not-allowed disabled:opacity-40"
        >
          بعدی
          <IconArrowLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
