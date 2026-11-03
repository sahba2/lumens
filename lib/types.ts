/**
 * LUMENS - domain types
 * Shared type definitions for courses, 3D objects, articles, prompts
 * and workflow content used across the platform.
 */

export type ObjectCategory = "interior" | "exterior" | "furniture";

export type CourseCategory =
  | "ai-design"
  | "prompt"
  | "render"
  | "workflow"
  | "modeling"
  | "business";

/**
 * Specialist software tracks of the course catalog. The ids are used as
 * filter slugs on `/courses` (e.g. `software === "3ds-max"`).
 */
export type CourseSoftware =
  | "3ds-max"
  | "revit"
  | "rhino"
  | "grasshopper"
  | "lumion"
  | "blender"
  | "sketchup"
  | "ai-architecture";

/** A single session (episode) of a course with its own video embed. */
export interface CourseLesson {
  /** Unique inside the course, e.g. `c-10-l-01`. */
  id: string;
  title: string;
  /** Human readable duration with Persian digits, e.g. `۲۱ دقیقه`. */
  duration: string;
  /** Embeddable player URL (YouTube/Aparat `/embed/...`), opened in-place. */
  embedUrl: string;
  /** Optional one-line description of the session. */
  summary?: string;
  /** Marked sessions are free to watch without enrollment. */
  isPreview?: boolean;
}

export type Level = "مبتدی" | "متوسط" | "پیشرفته";

export interface FilterOption<T extends string> {
  id: T;
  label: string;
}

/** Deterministic two-color palette used by the generated render previews. */
export type Palette = [string, string];

export interface Model3D {
  id: string;
  title: string;
  category: ObjectCategory;
  categoryLabel: string;
  format: string;
  polygons: string;
  size: string;
  software: string[];
  rating: number;
  downloads: number;
  price: number;
  isFree: boolean;
  tags: string[];
  palette: Palette;
  description: string;
  updated: string;
}

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  categoryLabel: string;
  /** Software tracks the course belongs to (drives the `/courses` tabs). */
  software: CourseSoftware[];
  level: Level;
  hours: number;
  /** Total number of sessions; may be larger than the detailed `lessons` list. */
  lessonCount: number;
  price: number;
  isFree: boolean;
  rating: number;
  students: number;
  instructor: string;
  summary: string;
  highlights: string[];
  tags: string[];
  palette: Palette;
  popular: boolean;
  /**
   * Optional intro/preview video for the course (mp4 file in /public or an
   * external link such as YouTube/Aparat). When set, the course dialog shows a
   * "تماشای پیش‌نمایش دوره" button that opens it in a new tab.
   */
  videoUrl?: string;
  /**
   * Optional curriculum preview: the ordered sessions shown in the course
   * dialog with an in-place video player for every `embedUrl`.
   */
  lessons?: CourseLesson[];
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
  featured: boolean;
  palette: Palette;
}

export interface PromptItem {
  id: string;
  title: string;
  category: string;
  model: string;
  difficulty: Level;
  text: string;
  negative: string;
  tags: string[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  tools: string[];
  tips: string[];
}

export interface KeywordFeature {
  id: string;
  title: string;
  short: string;
  description: string;
  href: string;
  accent: Palette;
  icon: string;
  bullets: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  initials: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}
