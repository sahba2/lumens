"use client";

import { useEffect, useState } from "react";
import { IconChevronDown } from "./Icons";

/** Floating "back to top" button that appears after the first viewport. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="بازگشت به بالای صفحه"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`glass-strong fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full text-gold transition-all duration-500 ease-cinema hover:border-gold/50 hover:shadow-glow ${
        visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <IconChevronDown className="h-5 w-5 rotate-180" />
    </button>
  );
}
