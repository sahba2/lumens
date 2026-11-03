import Image from "next/image";
import Link from "next/link";

import { toPersianDigits } from "@/lib/data";
import { BLUR_DATA_URL, imageOf } from "@/lib/images";
import type { Article } from "@/lib/types";
import { IconArrowLeft, IconClock, IconUsers } from "./Icons";

interface ArticleCardProps {
  article: Article;
  /** Wide layout used for the featured article slot. */
  variant?: "default" | "wide";
  priority?: boolean;
}

/** Editorial card used on the articles archive and the home page. */
export default function ArticleCard({ article, variant = "default", priority = false }: ArticleCardProps) {
  const image = imageOf(article.id);
  const wide = variant === "wide";

  return (
    <article className={`glow-card group overflow-hidden ${wide ? "lg:grid lg:grid-cols-2" : "flex flex-col"}`}>
      <Link
        href={`/articles#${article.id}`}
        className={`relative block overflow-hidden ${wide ? "aspect-[16/10] lg:h-full lg:aspect-auto" : "aspect-[16/9]"}`}
      >
        <Image
          src={image}
          alt={`تصویر مقاله ${article.title}`}
          fill
          sizes={wide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-cinema group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
        <span className="absolute right-4 top-4 chip border-gold/30 bg-ink/75 text-gold-light">
          {article.category}
        </span>
      </Link>

      <div className={`flex flex-1 flex-col p-6 ${wide ? "lg:justify-center lg:p-9" : ""}`}>
        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
          <span>{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-gold/60" />
          <span>{article.date}</span>
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="h-3.5 w-3.5 text-gold/70" />
            {toPersianDigits(article.readTime)} دقیقه مطالعه
          </span>
        </div>

        <h3
          className={`mt-4 font-bold leading-8 text-white transition-colors duration-300 group-hover:text-gold-light ${
            wide ? "text-xl sm:text-2xl" : "text-base"
          }`}
        >
          <Link href={`/articles#${article.id}`}>{article.title}</Link>
        </h3>

        <p className={`mt-3 text-xs leading-6 text-zinc-400 ${wide ? "sm:text-sm sm:leading-7" : "line-clamp-3"}`}>
          {article.excerpt}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-1.5">
          {article.tags.map((tag) => (
            <span key={`${article.id}-${tag}`} className="chip">
              #{tag}
            </span>
          ))}
        </div>

        <Link
          href={`/articles#${article.id}`}
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-gold transition-all duration-300 hover:gap-3 hover:text-gold-light"
        >
          مطالعه کامل مقاله
          <IconArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
