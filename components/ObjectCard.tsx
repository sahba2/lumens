import Image from "next/image";

import { formatCount, formatPrice } from "@/lib/data";
import { BLUR_DATA_URL, imageOf } from "@/lib/images";
import type { Model3D } from "@/lib/types";
import { IconCube, IconDownload, IconEye } from "./Icons";
import Stars from "./Stars";

interface ObjectCardProps {
  model: Model3D;
  onView: (model: Model3D) => void;
  onDownload: (model: Model3D) => void;
  priority?: boolean;
}

/** Render-quality preview card for a 3D object, inspired by 3d4dl listings. */
export default function ObjectCard({ model, onView, onDownload, priority = false }: ObjectCardProps) {
  const image = imageOf(model.id);

  return (
    <article className="glow-card group flex h-full flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onView(model)}
        aria-label={`مشاهده جزئیات ${model.title}`}
        className="relative block aspect-[4/3] w-full overflow-hidden text-right"
      >
        <Image
          src={image}
          alt={`رندر آبجکت سه‌بعدی ${model.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-cinema group-hover:scale-105"
        />

        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent opacity-90" />

        <span className="absolute right-4 top-4 flex flex-wrap gap-2">
          <span className="chip border-teal-300/35 bg-teal-400/10 text-teal-200 shadow-[0_0_20px_-6px_rgba(45,212,191,0.75)]">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
            AI READY
          </span>
          <span className="chip border-white/15 bg-ink/70 text-zinc-200">{model.categoryLabel}</span>
          {model.isFree ? (
            <span className="chip border-emerald-400/30 bg-emerald-400/10 text-emerald-300">رایگان</span>
          ) : null}
        </span>

        <span className="absolute inset-x-4 bottom-4 flex items-center justify-between text-[11px] text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <IconCube className="h-3.5 w-3.5 text-gold/80" />
            {model.polygons} پالیگان
          </span>
          <span className="chip bg-ink/75">{model.size}</span>
        </span>
      </button>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-7 text-white transition-colors duration-300 group-hover:text-gold-light">
          {model.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-xs leading-6 text-zinc-400">{model.description}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {model.tags.slice(0, 3).map((tag) => (
            <span key={`${model.id}-${tag}`} className="chip">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-zinc-500">
          <Stars rating={model.rating} />
          <span className="inline-flex items-center gap-1.5">
            <IconDownload className="h-3.5 w-3.5 text-gold/70" />
            {formatCount(model.downloads)} دانلود
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-white/10 pt-5">
          <span className={`text-sm font-bold ${model.isFree ? "text-emerald-400" : "text-gold-light"}`}>
            {formatPrice(model.price)}
          </span>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onView(model)}
              className="btn-quiet inline-flex items-center gap-1.5"
            >
              <IconEye className="h-3.5 w-3.5" />
              مشاهده
            </button>
            <button
              type="button"
              onClick={() => onDownload(model)}
              className="btn-primary px-4 py-2 text-xs"
            >
              <IconDownload className="h-3.5 w-3.5" />
              دانلود
            </button>
          </span>
        </div>
      </div>
    </article>
  );
}
