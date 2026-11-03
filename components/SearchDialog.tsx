"use client";

import { useEffect, useState } from "react";

import AiSearch from "./landing/AiSearch";
import { IconSearch } from "./Icons";
import Modal from "./Modal";

/**
 * Global search entry point for the navigation bar.
 * Ctrl/Cmd + K opens the dialog from anywhere on the site.
 */
export default function SearchDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="جستجوی هوشمند در LUMENS (Ctrl+K)"
        className="glass flex h-10 items-center gap-2 rounded-2xl px-3 text-zinc-400 transition-all duration-300 hover:border-gold/40 hover:text-gold-light"
      >
        <IconSearch className="h-4 w-4" />
        <span className="hidden text-xs font-semibold xl:inline">جستجو</span>
        <kbd
          dir="ltr"
          className="hidden rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500 2xl:inline-block"
        >
          Ctrl K
        </kbd>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="جستجوی هوشمند LUMENS"
        subtitle="در دوره‌ها، آبجکت‌های سه‌بعدی و مقالات تخصصی معماری جستجو کنید."
      >
        <AiSearch variant="compact" autoFocus onNavigate={() => setOpen(false)} />
      </Modal>
    </>
  );
}
