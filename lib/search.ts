/**
 * LUMENS - unified search index
 * -----------------------------
 * A tiny, dependency-free search layer over courses, 3D objects and articles.
 * It powers both the landing-page search dock and the global search dialog.
 */

import { allCourses, articles, models3d, toPersianDigits } from "./data";
import { imageOf } from "./images";

export type SearchKind = "course" | "object" | "article";

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  kindLabel: string;
  title: string;
  description: string;
  href: string;
  image: string;
  meta: string;
  tags: string[];
  /** Normalised text used for matching (not rendered). */
  haystack: string;
  /** Popularity used as a tie-breaker when the query is empty. */
  weight: number;
}

export interface AiToolShortcut {
  label: string;
  href: string;
  icon: "brain" | "sparkles" | "bolt" | "cube";
}

export const aiToolShortcuts: AiToolShortcut[] = [
  { label: "هوش مصنوعی در معماری", href: "/ai-architecture", icon: "brain" },
  { label: "پرامپت‌نویسی معماری", href: "/ai-prompts", icon: "sparkles" },
  { label: "رندرینگ لحظه‌ای", href: "/realtime-rendering", icon: "bolt" },
  { label: "کتابخانه آبجکت", href: "/objects", icon: "cube" },
];

export const searchSuggestions = [
  "ویلای بتنی",
  "نورپردازی شب",
  "ControlNet",
  "دیاگرام مفهومی",
  "رندر لحظه‌ای",
  "آبجکت رایگان",
];

/** Persian/Arabic-aware normalisation: ZWNJ, Arabic Yeh/Kaf, diacritics. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/\u200c/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const entries: SearchEntry[] = [
  ...allCourses.map((course) => ({
    id: course.id,
    kind: "course" as const,
    kindLabel: "دوره",
    title: course.title,
    description: course.summary,
    href: `/courses#${course.id}`,
    image: imageOf(course.id),
    meta: `${course.categoryLabel} · ${course.level} · ${toPersianDigits(course.hours)} ساعت`,
    tags: course.tags,
    haystack: normalize(
      [
        course.title,
        course.summary,
        course.categoryLabel,
        course.level,
        course.instructor,
        ...course.tags,
        ...course.highlights,
      ].join(" "),
    ),
    weight: course.students + course.rating * 100,
  })),
  ...models3d.map((model) => ({
    id: model.id,
    kind: "object" as const,
    kindLabel: "آبجکت سه‌بعدی",
    title: model.title,
    description: model.description,
    href: `/objects#${model.id}`,
    image: imageOf(model.id),
    meta: `${model.categoryLabel} · ${model.format} · ${model.size}`,
    tags: model.tags,
    haystack: normalize(
      [
        model.title,
        model.description,
        model.categoryLabel,
        model.format,
        model.polygons,
        ...model.tags,
        ...model.software,
      ].join(" "),
    ),
    weight: model.downloads + model.rating * 100,
  })),
  ...articles.map((article) => ({
    id: article.id,
    kind: "article" as const,
    kindLabel: "مقاله",
    title: article.title,
    description: article.excerpt,
    href: `/articles#${article.id}`,
    image: imageOf(article.id),
    meta: `${article.category} · ${toPersianDigits(article.readTime)} دقیقه مطالعه`,
    tags: article.tags,
    haystack: normalize(
      [article.title, article.excerpt, article.category, article.author, ...article.tags].join(" "),
    ),
    weight: (article.featured ? 500 : 0) + article.readTime * 20,
  })),
];

export const searchIndex: SearchEntry[] = entries;

/**
 * Returns ranked results. An empty query yields the most relevant shortcuts
 * (popular courses, the most downloaded object and the featured article).
 */
export function searchContent(query: string, limit = 8): SearchEntry[] {
  const tokens = normalize(query).split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return [...entries].sort((a, b) => b.weight - a.weight).slice(0, limit);
  }

  const scored: Array<{ entry: SearchEntry; score: number }> = [];

  entries.forEach((entry) => {
    const title = normalize(entry.title);
    const tags = normalize(entry.tags.join(" "));

    if (!tokens.every((token) => entry.haystack.includes(token))) return;

    let score = 0;
    tokens.forEach((token) => {
      if (title.startsWith(token)) score += 6;
      else if (title.includes(token)) score += 4;
      if (tags.includes(token)) score += 2;
      score += 1;
    });

    // Slight boost so design-related searches do not bury objects.
    if (entry.kind === "object") score += 0.4;
    if (entry.kind === "course") score += 0.2;

    scored.push({ entry, score: score + Math.min(entry.weight / 100000, 0.4) });
  });

  return scored
    .sort((a, b) => b.score - a.score || b.entry.weight - a.entry.weight)
    .slice(0, limit)
    .map((item) => item.entry);
}
