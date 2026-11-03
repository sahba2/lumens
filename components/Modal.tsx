"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { IconClose } from "./Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /**
   * Optional replacement for the panel classes. Callers that need a custom
   * surface (e.g. the `#121212` auth dialog with its gold rim) can pass the
   * complete class list without losing the portal / focus behaviour.
   */
  panelClassName?: string;
}

const defaultPanelClassName =
  "relative z-10 max-h-full w-full max-w-lg overflow-y-auto rounded-xl2 border border-neutral-800 bg-neutral-900 p-5 text-right shadow-card outline-none animate-fade-up sm:p-7";

/**
 * Accessible centered dialog: Esc to close, backdrop click, scroll lock.
 *
 * The dialog is rendered through a portal on `document.body`. Ancestors that
 * use `backdrop-filter` or `will-change: transform` (`.reveal`, `.glass-card`,
 * the fixed navbar, …) create a containing block for `position: fixed`, which
 * used to pull the modal out of the viewport centre and clip it. Portalling to
 * the body keeps the backdrop and the panel centred on every page.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  panelClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keep the latest callback without re-running the dialog effect on every
  // parent render (parents pass inline `() => setSelected(null)` handlers).
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !mounted) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    window.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the panel unless an inner field (e.g. the search input)
    // already grabbed it.
    if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
      panelRef.current.focus();
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop: sits below the panel and closes the dialog on click. */}
      <div
        className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={panelClassName ?? defaultPanelClassName}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
            {subtitle ? <p className="mt-2 text-xs leading-6 text-zinc-400">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن پنجره"
            className="glass flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-zinc-300 transition-colors duration-300 hover:border-gold/45 hover:text-gold"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

