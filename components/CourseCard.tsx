import Link from "next/link";
import Image from "next/image";

import { formatPrice, softwareLabels, toPersianDigits } from "@/lib/data";
import { BLUR_DATA_URL, imageOf } from "@/lib/images";
import type { Course } from "@/lib/types";
import { IconBook, IconClock, IconUsers } from "./Icons";
import Stars from "./Stars";

interface CourseCardProps {
  course: Course;
  /** Optional interactive footer (e.g. a client-side enroll button). */
  footer?: React.ReactNode;
  priority?: boolean;
}

/** Glassmorphic course card with a light-up border on hover. */
export default function CourseCard({ course, footer, priority = false }: CourseCardProps) {
  const image = imageOf(course.id);

  return (
    <article className="glow-card group flex h-full flex-col overflow-hidden">
      <Link href={`/courses#${course.id}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={`کاور دوره ${course.title}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-cinema group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

        <span className="absolute right-4 top-4 flex flex-wrap gap-2">
          <span className="chip border-gold/30 bg-ink/70 text-gold-light">{course.categoryLabel}</span>
          {course.isFree ? (
            <span className="chip border-emerald-400/30 bg-emerald-400/10 text-emerald-300">رایگان</span>
          ) : null}
        </span>

        <span className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          <span className="chip bg-ink/75 text-zinc-300">{course.level}</span>
          {course.software.slice(0, 2).map((item) => (
            <span key={`${course.id}-${item}`} className="chip bg-ink/75 text-gold-light">
              {softwareLabels[item]}
            </span>
          ))}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-7 text-white transition-colors duration-300 group-hover:text-gold-light">
          <Link href={`/courses#${course.id}`}>{course.title}</Link>
        </h3>

        <p className="mt-3 line-clamp-3 text-xs leading-6 text-zinc-400">{course.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <IconClock className="h-3.5 w-3.5 text-gold/70" />
            {toPersianDigits(course.hours)} ساعت
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconBook className="h-3.5 w-3.5 text-gold/70" />
            {toPersianDigits(course.lessonCount)} درس
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconUsers className="h-3.5 w-3.5 text-gold/70" />
            {toPersianDigits(course.students)} دانشجو
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Stars rating={course.rating} />
          <span className="text-xs text-zinc-500">{course.instructor}</span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span className={`text-sm font-bold ${course.isFree ? "text-emerald-400" : "text-gold-light"}`}>
            {formatPrice(course.price)}
          </span>
          {footer ?? (
            <Link href={`/courses#${course.id}`} className="btn-ghost px-4 py-2 text-xs">
              مشاهده و ثبت‌نام
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
