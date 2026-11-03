/**
 * LUMENS - AI keyword hub
 * -----------------------
 * The four golden architectural AI keywords of the platform. Every keyword has
 * a double duty:
 *
 *   1. a `?tag=` slug consumed by the articles / courses / objects explorers,
 *   2. a ready-made prompt that is pushed to the «معمار من» chat widget through
 *      the `lumens:open-chat` window event.
 *
 * Keeping the data here means the landing page and the archive pages always
 * stay in sync (same labels, same prompts, same filter slugs).
 */

export type AiKeywordIcon = "brain" | "sparkles" | "bolt" | "route";

export interface AiKeyword {
  id: string;
  title: string;
  /** Value stored in `?tag=` and read by the listing filters. */
  query: string;
  /** Pre-filled prompt for the «معمار من» chatbot. */
  prompt: string;
  /** Dedicated landing page of the keyword. */
  href: string;
  icon: AiKeywordIcon;
  /** Two accent colours used by the keyword cards. */
  accent: [string, string];
  /**
   * Normalised tokens used to match a course/article/object. Non-Latin tokens
   * are matched as substrings (Persian suffixes), short Latin tokens require
   * word boundaries so "ai" never matches inside another word.
   */
  match: string[];
}

/** Name of the custom window event consumed by the «معمار من» chat widget. */
export const AI_CHAT_EVENT = "lumens:open-chat";

export interface AiChatEventDetail {
  /** The prompt to pre-fill in the chat composer. */
  prompt: string;
  /** The keyword slug that triggered the request. */
  query: string;
}

export const aiKeywords: AiKeyword[] = [
  {
    id: "ai-arch",
    title: "هوش مصنوعی در معماری",
    query: "ai-architecture",
    prompt: "لطفاً درباره کاربردهای هوش مصنوعی در معماری مدرن و طراحی سازه‌ها توضیح بده.",
    href: "/ai-architecture",
    icon: "brain",
    accent: ["#f4dfa4", "#8f6f22"],
    match: [
      "هوش مصنوعی",
      "معماری هوشمند",
      "طراحی مولد",
      "مدل مولد",
      "کانسپت",
      "ai-design",
      "concept",
    ],
  },
  {
    id: "prompt",
    title: "پرامپت‌نویسی معماری",
    query: "architectural-prompting",
    prompt:
      "چطور می‌توانم بهترین پرامپت‌ها را برای رندرینگ نمای ساختمان در Midjourney بنویسم؟",
    href: "/ai-prompts",
    icon: "sparkles",
    accent: ["#f2e2a8", "#b58a2b"],
    match: [
      "پرامپت",
      "پرامپت نویسی",
      "negative prompt",
      "prompt",
      "controlnet",
      "midjourney",
      "chatgpt",
      "stable diffusion",
    ],
  },
  {
    id: "realtime",
    title: "رندرینگ لحظه‌ای",
    query: "realtime-rendering",
    prompt: "بهترین ابزارهای هوش مصنوعی برای رندرینگ لحظه‌ای و انیمیشن معماری کدامند؟",
    href: "/realtime-rendering",
    icon: "bolt",
    accent: ["#ffe3a3", "#a9681a"],
    match: [
      "رندر",
      "رندر لحظه ای",
      "نورپردازی",
      "render",
      "lighting",
      "comfyui",
      "stable diffusion",
      "sdxl",
      "v-ray",
      "corona",
      "lumion",
      "enscape",
    ],
  },
  {
    id: "workflow",
    title: "گردش کار AI",
    query: "ai-workflow",
    prompt: "گردش کار استاندارد استفاده از هوش مصنوعی از اسکچ آپ تا رندر نهایی چگونه است؟",
    href: "/ai-workflow",
    icon: "route",
    accent: ["#f6e8b4", "#7d6320"],
    match: [
      "گردش کار",
      "فرآیند طراحی",
      "workflow",
      "pipeline",
      "comfyui",
      "version control",
      "نسخه بندی",
    ],
  },
];

/** Persian/Arabic-aware normalisation (ZWNJ, Arabic Yeh/Kaf, diacritics). */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[يى]/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u064b-\u065f\u0670]/g, "")
    .replace(/\u200c/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenMatches(haystack: string, token: string): boolean {
  const needle = normalize(token);
  if (!needle) return false;

  // Persian words are matched as substrings so "رندر" finds "رندرینگ".
  if (!/^[\x20-\x7e]+$/.test(needle)) return haystack.includes(needle);

  if (needle.length > 4) return haystack.includes(needle);

  // Short Latin tokens ("ai", "pbr") must stand on their own.
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle)}([^a-z0-9]|$)`, "i").test(
    haystack,
  );
}

/** Finds a keyword by its `?tag=` slug (or by its id). */
export function getAiKeyword(value: string | null | undefined): AiKeyword | undefined {
  if (!value) return undefined;
  const needle = value.trim().toLowerCase();
  return aiKeywords.find(
    (keyword) => keyword.query === needle || keyword.id === needle,
  );
}

/**
 * Returns `true` when the haystack belongs to the keyword behind `value`.
 * Unknown or empty tags never filter anything out.
 */
export function matchesAiKeyword(
  value: string | null | undefined,
  haystack: string,
): boolean {
  const keyword = getAiKeyword(value);
  if (!keyword) return true;

  const text = normalize(haystack);
  return keyword.match.some((token) => tokenMatches(text, token));
}

/**
 * Opens the «معمار من» chat with a pre-filled prompt. Safe to call on the
 * server (no-op) and harmless when no chat widget is mounted yet - widgets
 * simply listen for `AI_CHAT_EVENT`.
 */
export function requestAiChat(detail: AiChatEventDetail): void {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AiChatEventDetail>(AI_CHAT_EVENT, { detail }),
  );
}
