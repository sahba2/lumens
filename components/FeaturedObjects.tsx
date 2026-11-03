"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { models3d, toPersianDigits } from "@/lib/data";
import { BLUR_DATA_URL, imageOf } from "@/lib/images";
import type { Model3D } from "@/lib/types";
import { IconCheck, IconDownload } from "./Icons";
import Modal from "./Modal";
import ObjectCard from "./ObjectCard";
import Stars from "./Stars";

/** Landing-page preview of the most downloaded 3D objects (interactive). */
export default function FeaturedObjects({ count = 3 }: { count?: number }) {
  const [active, setActive] = useState<Model3D | null>(null);
  const [toast, setToast] = useState("");

  const models = useMemo(
    () => [...models3d].sort((a, b) => b.downloads - a.downloads).slice(0, count),
    [count],
  );

  const handleDownload = (model: Model3D) => {
    setToast(`دانلود «${model.title}» آغاز شد`);
    window.setTimeout(() => setToast(""), 2600);

    const anchor = document.createElement("a");
    anchor.href = imageOf(model.id);
    anchor.download = `lumens-${model.id}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model, index) => (
          <ObjectCard
            key={model.id}
            model={model}
            onView={setActive}
            onDownload={handleDownload}
            priority={index === 0}
          />
        ))}
      </div>

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
                sizes="(max-width: 640px) 100vw, 40vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Stars rating={active.rating} />
                <span className="text-xs text-zinc-500">{toPersianDigits(active.downloads)} دانلود</span>
              </div>

              <ul className="mt-5 space-y-3 text-xs text-zinc-300">
                <li className="glass flex items-center justify-between rounded-2xl px-4 py-3">
                  <span className="text-zinc-500">فرمت‌ها</span>
                  <span className="font-semibold">{active.format}</span>
                </li>
                <li className="glass flex items-center justify-between rounded-2xl px-4 py-3">
                  <span className="text-zinc-500">حجم و پالیگان</span>
                  <span className="font-semibold">
                    {active.size} / {active.polygons}
                  </span>
                </li>
                <li className="glass flex items-center justify-between rounded-2xl px-4 py-3">
                  <span className="text-zinc-500">نرم‌افزار</span>
                  <span className="font-semibold">{active.software.join("، ")}</span>
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={() => handleDownload(active)} className="btn-primary">
                  <IconDownload className="h-4 w-4" />
                  دانلود رایگان
                </button>
                <Link href="/objects" className="btn-ghost">
                  همه آبجکت‌ها
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
