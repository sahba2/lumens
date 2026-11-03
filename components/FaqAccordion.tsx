"use client";

import { useState } from "react";

import { faqs } from "@/lib/data";
import { IconChevronDown } from "./Icons";

/** Single-open accordion for the FAQ section. */
export default function FaqAccordion() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <div className="grid gap-3">
      {faqs.map((item) => {
        const open = openId === item.id;

        return (
          <div
            key={item.id}
            className={`glass overflow-hidden rounded-2xl transition-colors duration-300 ${
              open ? "border-gold/30 bg-white/[0.05]" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
            >
              <span className={`text-sm font-bold ${open ? "text-gold-light" : "text-white"}`}>
                {item.question}
              </span>
              <IconChevronDown
                className={`h-4 w-4 shrink-0 text-gold transition-transform duration-500 ease-cinema ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`grid transition-all duration-500 ease-cinema ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-xs leading-7 text-zinc-400">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
