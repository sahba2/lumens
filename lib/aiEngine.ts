/**
 * LUMENS - موتور ایده‌پرداز معماری (Lumens AI Architecture Engine)
 * -----------------------------------------------------------------
 * Mock backend of the LUMENS idea engine. It receives a free-form Persian
 * architectural brief, reads its typology / location / geometry signals and
 * returns a structured four-phase design proposal:
 *
 *   1. کانسپت و تحلیل اقلیم
 *   2. استراتژی پلان و لکه‌گذاری
 *   3. پالت متریال اختصاصی لومنز
 *   4. مسیر یادگیری و دوره‌های مرتبط
 *
 * Everything runs locally with deterministic rules, so the UI can demo the
 * full journey without an API key. `processArchitecturalIdea` mirrors a real
 * streaming endpoint: it resolves after ~3 seconds and reports progress
 * phase-by-phase through an optional callback.
 */

import { toPersianDigits } from "./data";

/* ------------------------------------------------------------------ */
/*  Public constants & shared types                                   */
/* ------------------------------------------------------------------ */

export const ENGINE_RUNTIME_MS = 3000;
export const ENGINE_PHASE_COUNT = 4;

/** Ready-made briefs shown in the hero dock and the engine dialog. */
export const IDEA_PRESETS = [
  "ویلای معلق کردان با بتن اکسپوز",
  "کافه کتاب بیونیک اصفهان",
  "پاویون کورتن در حاشیه کویر",
  "گالری شیشه‌ای در جنگل هیرکانی",
] as const;

export type MaterialId =
  | "silk-concrete"
  | "structural-glass"
  | "corten-bronze"
  | "shou-sugi-ban";

export type ProjectTypology =
  | "villa"
  | "cafe-library"
  | "gallery"
  | "office"
  | "pavilion"
  | "adaptive";

export interface EnginePhaseStep {
  id: "concept" | "plan" | "materials" | "courses";
  index: number;
  label: string;
  title: string;
  subtitle: string;
  description: string;
}

export const PHASE_STEPS: readonly EnginePhaseStep[] = [
  {
    id: "concept",
    index: 0,
    label: `فاز ${toPersianDigits("01")}`,
    title: "کانسپت و تحلیل اقلیم",
    subtitle: "Concept & Climate",
    description: "خوانش بریف، تثبیت ایده و استخراج راهبرد اقلیمی سایت",
  },
  {
    id: "plan",
    index: 1,
    label: `فاز ${toPersianDigits("02")}`,
    title: "استراتژی پلان و لکه‌گذاری",
    subtitle: "Plan & Program",
    description: "لکه‌گذاری فضاها، ارتباط افقی و عمودی و منطق سازه",
  },
  {
    id: "materials",
    index: 2,
    label: `فاز ${toPersianDigits("03")}`,
    title: "پالت متریال اختصاصی",
    subtitle: "LUMENS Material Palette",
    description: "ترکیب بتن اکسپوز، شیشه ساختاری، کورتن و برنز مات",
  },
  {
    id: "courses",
    index: 3,
    label: `فاز ${toPersianDigits("04")}`,
    title: "مسیر یادگیری لومنز",
    subtitle: "Learning Path",
    description: "پیشنهاد دوره‌های مکس، رویت و هوش مصنوعی برای اجرای ایده",
  },
];

export interface LumensMaterial {
  id: MaterialId;
  nameFa: string;
  nameEn: string;
  role: string;
  finish: string;
  tone: string;
  keywords: string[];
}

/**
 * The exclusive LUMENS material palette. The four entries are intentionally
 * fixed: every proposal combines them with project-specific proportions.
 */
export const LUMENS_MATERIALS: readonly LumensMaterial[] = [
  {
    id: "silk-concrete",
    nameFa: "بتن اکسپوز ابریشمی",
    nameEn: "Silk Fair-faced Concrete",
    role: "جرم، سایه و اینرسی حرارتی",
    finish: "قالب تخته‌ای، درز ۱۲ میلی‌متری، پرداخت مات ابریشمی",
    tone: "#b9b4a9",
    keywords: ["بتن", "اکسپوز", "سیمان", "خاکستری", "مونولیت"],
  },
  {
    id: "structural-glass",
    nameFa: "شیشه ساختاری سرتاسری",
    nameEn: "Ultra-Clear Structural Glass",
    role: "شفافیت، قاب و اتصال چشم‌انداز",
    finish: "سه‌لایه Low-E، لبه پولیش‌خورده، مولیون پنهان",
    tone: "#8fc7c9",
    keywords: ["شیشه", "سرتاسری", "شفاف", "لوله‌ای", "نور"],
  },
  {
    id: "corten-bronze",
    nameFa: "فولاد کورتن و برنز تیره",
    nameEn: "Corten Steel & Dark Bronze",
    role: "جزئیات، سایه‌انداز و پتینه زمان",
    finish: "پتینه طبیعی کورتن، برنز مات با روغن سرد",
    tone: "#a3653f",
    keywords: ["کورتن", "برنز", "فلز", "آهن", "پتینه", "مس"],
  },
  {
    id: "shou-sugi-ban",
    nameFa: "چوب سوخته ژاپنی",
    nameEn: "Shou Sugi Ban Wood",
    role: "گرما، بافت انسانی و آکوستیک",
    finish: "سطح ذغالی برس‌خورده، سه لایه روغن مات",
    tone: "#5a4636",
    keywords: ["چوب", "سوخته", "چوبی", "گرم", "شوجی"],
  },
];

export interface ClimateMetric {
  label: string;
  value: string;
}

export interface ConceptMove {
  title: string;
  detail: string;
}

export interface ConceptPhase {
  eyebrow: string;
  headline: string;
  narrative: string;
  keywords: string[];
  climate: {
    site: string;
    climate: string;
    altitude: string;
    orientation: string;
    strategies: string[];
    metrics: ClimateMetric[];
  };
  moves: ConceptMove[];
}

export interface PlanZone {
  id: string;
  name: string;
  area: number;
  share: number;
  level: string;
  note: string;
}

export interface PlanPhase {
  eyebrow: string;
  headline: string;
  strategy: string;
  zones: PlanZone[];
  totalArea: number;
  circulation: {
    horizontal: string;
    vertical: string;
    service: string;
  };
  levels: string[];
  structuralNote: string;
}

export interface MaterialSelection extends LumensMaterial {
  share: number;
  application: string;
  emphasis: string;
}

export interface MaterialsPhase {
  eyebrow: string;
  headline: string;
  rationale: string;
  composition: MaterialSelection[];
  detailing: string[];
  renderPrompt: string;
  negativePrompt: string;
}

export interface CourseRecommendation {
  id: string;
  title: string;
  href: string;
  level: string;
  hours: number;
  role: string;
  reason: string;
}

export interface CoursesPhase {
  eyebrow: string;
  headline: string;
  summary: string;
  courses: CourseRecommendation[];
}

export interface ArchitecturalIdeaResult {
  id: string;
  prompt: string;
  projectName: string;
  typologyLabel: string;
  locationLabel: string;
  createdAt: string;
  runtimeMs: number;
  tags: string[];
  phases: {
    concept: ConceptPhase;
    plan: PlanPhase;
    materials: MaterialsPhase;
    courses: CoursesPhase;
  };
}

export interface ProcessArchitecturalIdeaOptions {
  /** Lets the dialog cancel a run when it closes or a new idea is submitted. */
  signal?: AbortSignal;
  /** Called as soon as each phase starts; phase 0 fires synchronously. */
  onPhase?: (phaseIndex: number) => void;
  /** Override for tests/previews; defaults to 750ms (4 × 750 = 3s). */
  phaseDurationMs?: number;
}

/* ------------------------------------------------------------------ */
/*  Internal knowledge base                                           */
/* ------------------------------------------------------------------ */

interface ZoneSeed {
  name: string;
  area: number;
  level: string;
  note: string;
}

interface ProgramTemplate {
  id: ProjectTypology;
  label: string;
  en: string;
  summary: string;
  planStrategy: string;
  zones: ZoneSeed[];
}

const PROGRAM_TEMPLATES: Record<ProjectTypology, ProgramTemplate> = {
  villa: {
    id: "villa",
    label: "ویلای مسکونی",
    en: "cantilevered private villa",
    summary: "سکونت تک‌خانواده با فضاهای باز و پیوند مستقیم با منظر",
    planStrategy:
      "پلان آزاد حول یک هسته بتنی شکل می‌گیرد؛ نشیمن و آشپزخانه در تراز منظر و اتاق‌های خصوصی در تراز بالاتر قرار می‌گیرند تا حریم و چشم‌انداز هم‌زمان حفظ شود.",
    zones: [
      { name: "پلازای ورودی و پل معلق", area: 48, level: "همکف", note: "عبور از آستانه بدون لمس زمین" },
      { name: "نشیمن اصلی و شومینه بتنی", area: 86, level: "همکف", note: "قاب شیشه‌ای سرتاسری رو به دره" },
      { name: "آشپزخانه و میز یکپارچه", area: 36, level: "همکف", note: "جزیره بتنی با رویه برنز مات" },
      { name: "سوئیت خواب اصلی", area: 52, level: "طبقه اول", note: "بالکن شفاف با جان‌پناه شیشه سازه‌ای" },
      { name: "اسپا و حمام نورگیر", area: 30, level: "طبقه اول", note: "نورگیر سقفی و دیوار چوب سوخته" },
      { name: "استودیو و اتلیه", area: 34, level: "طبقه اول", note: "دسترسی مستقل از پله بیرونی" },
      { name: "تراس و استخر بازتابنده", area: 74, level: "بام", note: "لبه بی‌نهایت با پوشش کورتن" },
    ],
  },
  "cafe-library": {
    id: "cafe-library",
    label: "کافه کتاب",
    en: "book cafe and reading pavilion",
    summary: "فضای فرهنگی-اجتماعی با کتابخانه باز، کافه و سناریوی ماندن طولانی",
    planStrategy:
      "یک پلان پیوسته با سه لنگرگاه «کتاب، قهوه، مکث» شکل می‌گیرد؛ قفسه‌ها نقش دیوار و راهنما را هم‌زمان بازی می‌کنند و نور شمالی روی میزهای مطالعه می‌نشیند.",
    zones: [
      { name: "فویه و کتاب‌فروشی", area: 58, level: "همکف", note: "ویترین شیشه‌ای و میز کورتن" },
      { name: "سالن مطالعه اصلی", area: 120, level: "همکف", note: "نور شمالی و قفسه‌های تا سقف" },
      { name: "کافه و بارista", area: 64, level: "همکف", note: "کانتر یکپارچه بتن و برنز" },
      { name: "گالری کتاب و رویداد", area: 46, level: "همکف", note: "قابل تبدیل به فضای گفت‌وگو" },
      { name: "تراس مطالعه", area: 52, level: "طبقه اول", note: "سایه‌بان کورتن و کف چوبی" },
      { name: "بایگانی و خدمات", area: 34, level: "پشت صحنه", note: "دسترسی سرویس مستقل" },
    ],
  },
  gallery: {
    id: "gallery",
    label: "گالری هنری",
    en: "contemporary art gallery",
    summary: "مسیر نمایشگاهی پیوسته با نور کنترل‌شده و دیوارهای خنثی",
    planStrategy:
      "مسیر بازدید به‌صورت حلقه‌ای بسته می‌شود؛ دیوارهای بتنی خنثی، نورگیرهای سقفی و یک گالری شیشه‌ای برای آثار حجیم، تجربه‌ای بی‌وقفه می‌سازند.",
    zones: [
      { name: "فویه و کنترل بلیت", area: 56, level: "همکف", note: "قاب شیشه‌ای و دیوار بتنی" },
      { name: "گالری اصلی", area: 210, level: "همکف", note: "دیوار خنثی با نور سقفی قابل تنظیم" },
      { name: "گالری آثار حجیم", area: 120, level: "همکف", note: "شیشه سرتاسری و سکوی بتنی" },
      { name: "اتاق پروژه و ویدیو", area: 42, level: "همکف", note: "آکوستیک با چوب سوخته" },
      { name: "فروشگاه و کافه", area: 58, level: "همکف", note: "کانتر برنز و نور گرم" },
      { name: "انبار و آماده‌سازی آثار", area: 64, level: "پشت صحنه", note: "دسترسی بار و کنترل اقلیم" },
    ],
  },
  office: {
    id: "office",
    label: "مجموعه اداری",
    en: "creative office headquarters",
    summary: "محیط کار خلاق با هسته خدمات متمرکز و پلان منعطف",
    planStrategy:
      "هسته خدمات در مرکز و میزهای کاری در پیرامون شیشه‌ای قرار می‌گیرند؛ پلان مدولار امکان تبدیل اتاق‌ها به فضای تیمی و بالعکس را فراهم می‌کند.",
    zones: [
      { name: "لابی و پلازای عمومی", area: 96, level: "همکف", note: "سقف بتنی و میز پذیرش برنز" },
      { name: "فضای کار باز", area: 260, level: "طبقات", note: "نور روز از سه جبهه" },
      { name: "اتاق جلسات شیشه‌ای", area: 84, level: "طبقات", note: "پارتیشن شیشه‌ای آکوستیک" },
      { name: "استودیو و اتاق فکر", area: 62, level: "طبقات", note: "دیوار چوب سوخته و تخته‌سیاه" },
      { name: "کافه و تراس کارکنان", area: 78, level: "بام", note: "سایه‌بان کورتن و بام سبز" },
      { name: "هسته خدمات و بایگانی", area: 110, level: "مرکزی", note: "کنترل دسترسی و تاسیسات" },
    ],
  },
  pavilion: {
    id: "pavilion",
    label: "پاویون",
    en: "landscape pavilion",
    summary: "حجم کوچک و نمادین با حداقل دخالت در زمین",
    planStrategy:
      "یک سکوی بتنی معلق، فضای اصلی را از زمین جدا می‌کند؛ پلان تک‌فضا با یک هسته خدماتی فشرده، بیشترین سطح را به منظر و مکث می‌دهد.",
    zones: [
      { name: "سکوی ورودی", area: 24, level: "همکف", note: "پل بتنی روی شیب طبیعی" },
      { name: "فضای اصلی پاویون", area: 64, level: "همکف", note: "قاب شیشه‌ای سرتاسری" },
      { name: "هسته خدماتی", area: 14, level: "همکف", note: "کورتن و درز پنهان" },
      { name: "تراس منظر", area: 38, level: "همکف", note: "کف چوب سوخته و نور خطی" },
    ],
  },
  adaptive: {
    id: "adaptive",
    label: "پروژه معاصر",
    en: "contemporary architecture project",
    summary: "برنامه فیزیکی منعطف بر اساس بریف کاربر",
    planStrategy:
      "سه لایه «عمومی، نیمه‌خصوصی و خصوصی» از ورودی تا منظر مرتب می‌شوند؛ دیوارهای بتنی ثابت و پارتیشن‌های شیشه‌ای، پلانی منعطف و قابل بازآرایی می‌سازند.",
    zones: [
      { name: "فویه و آستانه ورود", area: 46, level: "همکف", note: "قاب شیشه‌ای و نیمکت بتنی" },
      { name: "فضای اصلی و گردهمایی", area: 120, level: "همکف", note: "دهانه بزرگ و نور جنوبی" },
      { name: "فضای کار و تمرکز", area: 58, level: "همکف", note: "پارتیشن شیشه‌ای آکوستیک" },
      { name: "سرویس و پشتیبانی", area: 30, level: "همکف", note: "دسترسی مستقل از مسیر عمومی" },
      { name: "تراس و منظر", area: 46, level: "بام", note: "سایه‌بان کورتن و کف چوبی" },
    ],
  },
};

interface LocationProfile {
  id: string;
  short: string;
  label: string;
  site: string;
  climate: string;
  altitude: string;
  orientation: string;
  strategies: string[];
  metrics: ClimateMetric[];
  lightEn: string;
}

const DEFAULT_LOCATION: LocationProfile = {
  id: "kordan",
  short: "کردان",
  label: "کردان، البرز",
  site: "دامنه جنوبی البرز، شیب ۱۲٪ رو به دره",
  climate: "سرد و نیمه‌خشک کوهپایه‌ای (BSk)",
  altitude: "۱٬۸۵۰ متر از سطح دریا",
  orientation: "چرخش ۱۸ درجه از شمال به سمت دره",
  strategies: [
    "چرخش حجم به سمت دره برای گرفتن آفتاب زمستانی و کنترل باد غربی",
    "بام سبز و پوسته بتنی ضخیم برای اینرسی حرارتی و تأخیر حرارتی",
    "شیشه سه‌لایه Low-E با فریم برنز مات و سایه‌بان متحرک کورتن",
    "قطع پل حرارتی در محل اتصال کنسول به هسته بتنی",
  ],
  metrics: [
    { label: "ارتفاع سایت", value: "۱٬۸۵۰ م" },
    { label: "تابش سالانه", value: "۲٬۴۰۰ ساعت" },
    { label: "اختلاف دما", value: "۲۲ درجه" },
    { label: "باد غالب", value: "غرب" },
  ],
  lightEn: "crisp highland light with long shadows over the Alborz valley",
};

const LOCATION_RULES: Array<{ keywords: string[]; location: LocationProfile }> = [
  {
    keywords: ["کردان", "کرج", "البرز", "کوهپایه", "کوه"],
    location: DEFAULT_LOCATION,
  },
  {
    keywords: ["اصفهان", "نصف‌جهان", "زاینده"],
    location: {
      id: "isfahan",
      short: "اصفهان",
      label: "اصفهان، حاشیه زاینده‌رود",
      site: "بافت فرهنگی اصفهان، زمین هموار با محور شمالی-جنوبی",
      climate: "گرم و خشک بیابانی با تابستان‌های شدید (BWh)",
      altitude: "۱٬۵۷۵ متر از سطح دریا",
      orientation: "محور اصلی شرقی-غربی با حیاط مرکزی",
      strategies: [
        "بازطراحی حیاط مرکزی و بادگیر برای خنک‌سازی تبخیری",
        "پوسته مشبک کورتن با سایه‌اندازی متغیر در ساعات اوج تابش",
        "دیوار بتنی ضخیم با اینرسی حرارتی بالا و بازشوهای کوچک جنوبی",
        "بازشوهای شمالی برای نور یکنواخت و غیرمستقیم گالری و مطالعه",
      ],
      metrics: [
        { label: "ارتفاع سایت", value: "۱٬۵۷۵ م" },
        { label: "تابش سالانه", value: "۳٬۲۰۰ ساعت" },
        { label: "دمای اوج", value: "۴۱ درجه" },
        { label: "باد غالب", value: "شرق" },
      ],
      lightEn: "warm Isfahan afternoon light filtered through a corten mashrabiya",
    },
  },
];

const LOCATION_RULES_MORE: Array<{ keywords: string[]; location: LocationProfile }> = [
  {
    keywords: ["کویر", "یزد", "کاشان", "قم", "سمنان", "بیابان"],
    location: {
      id: "desert",
      short: "کویر",
      label: "حاشیه کویر مرکزی",
      site: "زمین شور و هموار، افق باز و تابش بی‌واسطه",
      climate: "فراخشک با اختلاف دمای شبانه‌روزی بالا (BWh)",
      altitude: "۹۰۰ متر از سطح دریا",
      orientation: "حجم بسته با حیاط درون‌گرا و محور شمال-جنوب",
      strategies: [
        "حجم فشرده و درون‌گرا با حیاط مرکزی به‌عنوان میکرواقلیم",
        "پوسته دوجداره با حفره هوا و پرداخت مات برای کاهش تابش",
        "سایه‌بان‌های عمودی کورتن با زاویه محاسبه‌شده برای تابستان",
        "آب در محور حیاط و کانال خنک‌سازی تبخیری زیر سکو",
      ],
      metrics: [
        { label: "ارتفاع سایت", value: "۹۰۰ م" },
        { label: "تابش سالانه", value: "۳٬۵۰۰ ساعت" },
        { label: "اختلاف شبانه‌روز", value: "۲۵ درجه" },
        { label: "باد غالب", value: "شمال" },
      ],
      lightEn: "harsh desert light softened by deep corten shadows at dusk",
    },
  },
  {
    keywords: ["جنگل", "شمال", "مازندران", "گیلان", "هیرکانی", "کلاردشت"],
    location: {
      id: "forest",
      short: "جنگل",
      label: "جنگل هیرکانی، شمال ایران",
      site: "شیب جنگلی با درختان بلند و رطوبت بالا",
      climate: "معتدل و مرطوب خزری (Cfa)",
      altitude: "۴۰۰ متر از سطح دریا",
      orientation: "حجم کشیده در امتداد خطوط توپوگرافی",
      strategies: [
        "کنسول سبک روی شمع‌های بتنی برای حداقل دخالت در ریشه‌ها",
        "بام سبز، زهکشی طبیعی و جمع‌آوری آب باران",
        "شیشه سرتاسری با بازتاب جنگل و مولیون‌های نازک برنز",
        "چوب سوخته شوجی‌بان برای مقاومت در برابر رطوبت و قارچ",
      ],
      metrics: [
        { label: "ارتفاع سایت", value: "۴۰۰ م" },
        { label: "بارندگی", value: "۱٬۲۰۰ م‌م" },
        { label: "رطوبت نسبی", value: "۸۰٪" },
        { label: "باد غالب", value: "شمال" },
      ],
      lightEn: "misty forest light with deep green reflections on glass",
    },
  },
  {
    keywords: ["تهران", "پایتخت"],
    location: {
      id: "tehran",
      short: "تهران",
      label: "تهران، دامنه جنوبی البرز",
      site: "زمین شهری با آلودگی، دید به ارتفاعات شمالی",
      climate: "نیمه‌خشک معتدل با وارونگی دمایی زمستانه (BSk)",
      altitude: "۱٬۴۰۰ متر از سطح دریا",
      orientation: "چرخش ۱۵ درجه به سمت شمال برای دید به البرز",
      strategies: [
        "فیلتر هوای ورودی و بافر گیاهی در نمای خیابان",
        "پوسته دوجداره با دریچه‌های قابل تنظیم برای هوای پاک‌تر",
        "بام سبز و سایه‌بان کورتن برای کاهش جزیره حرارتی",
        "هسته خدمات در جبهه پرصدا‌تر و فضاهای اصلی رو به شمال",
      ],
      metrics: [
        { label: "ارتفاع سایت", value: "۱٬۴۰۰ م" },
        { label: "تابش سالانه", value: "۲٬۸۰۰ ساعت" },
        { label: "روزهای وارونگی", value: "۴۵ روز" },
        { label: "باد غالب", value: "غرب" },
      ],
      lightEn: "urban dusk light with layered city haze and warm interior glow",
    },
  },
  {
    keywords: ["ساحل", "دریا", "جزیره", "کیش", "قشم", "چابهار", "دریایی"],
    location: {
      id: "coast",
      short: "ساحل",
      label: "نوار ساحلی جنوب",
      site: "خط ساحلی کم‌شیب با نسیم دریا و خاک شور",
      climate: "گرم و مرطوب ساحلی (BSh)",
      altitude: "۵ متر از سطح دریا",
      orientation: "محور طولی موازی ساحل با تراس‌های رو به دریا",
      strategies: [
        "پوسته مقاوم به نمک با بتن پرمقاومت و پوشش محافظ",
        "کورتن با پتینه طبیعی و شیشه لمینت‌شده در برابر طوفان",
        "سایه‌بان عمیق و تراس شناور برای کنترل تابش و نسیم",
        "استخر بازتابنده و کانال باد برای خنک‌سازی محیط",
      ],
      metrics: [
        { label: "ارتفاع سایت", value: "۵ م" },
        { label: "تابش سالانه", value: "۳٬۰۰۰ ساعت" },
        { label: "رطوبت نسبی", value: "۷۵٪" },
        { label: "باد غالب", value: "جنوب" },
      ],
      lightEn: "golden coastal light reflecting off an infinity pool",
    },
  },
];

const ALL_LOCATION_RULES = [...LOCATION_RULES, ...LOCATION_RULES_MORE];

interface GeometryProfile {
  id: "suspended" | "organic" | "courtyard" | "monolith" | "parametric" | "framed";
  label: string;
  adjective: string;
  enForm: string;
  headline: string;
  narrativeLead: string;
  moves: ConceptMove[];
  planHint: string;
  structuralNote: string;
}

const GEOMETRIES: Record<GeometryProfile["id"], GeometryProfile> = {
  suspended: {
    id: "suspended",
    label: "حجم معلق و کنسولی",
    adjective: "معلق",
    enForm: "dramatic cantilevered volume floating above the slope",
    headline: "حجم معلق؛ آستانه‌ای میان زمین و آسمان",
    narrativeLead:
      "حجم اصلی روی یک هسته بتنی می‌نشیند و با کنسولی کنترل‌شده از شیب جدا می‌شود؛ زمین زیر ساختمان جریان پیدا می‌کند و منظر بدون واسطه به داخل می‌رسد.",
    moves: [
      { title: "فرم", detail: "کنسول ۶٫۴ متری با تیر عمیق بتنی و لبه نازک‌شده" },
      { title: "منظر", detail: "قاب شیشه‌ای بدون ستون که دره را به داخل می‌آورد" },
      { title: "سایه", detail: "زیرحجم بتنی سایه‌انداز و تراس معلق رو به غرب" },
    ],
    planHint: "هسته ثابت در پشت و پلان آزاد رو به منظر",
    structuralNote:
      "کنسول با تیر عمیق بتنی مسلح و پس‌تنش کنترل می‌شود؛ هسته پله به‌عنوان لنگر سازه‌ای عمل می‌کند.",
  },
  organic: {
    id: "organic",
    label: "فرم بیونیک و سیال",
    adjective: "بیونیک",
    enForm: "biomorphic fluid shell inspired by natural topology",
    headline: "پوسته بیونیک؛ فرمی که از طبیعت الگو می‌گیرد",
    narrativeLead:
      "هندسه از الگوی رشد طبیعی و خطوط توپوگرافی الهام می‌گیرد؛ سطوح بتنی سیال و شیشه منحنی، مرز درون و بیرون را نرم می‌کنند.",
    moves: [
      { title: "فرم", detail: "پوسته دولایه با انحنای پیوسته و اتصال بدون گوشه" },
      { title: "ساخت", detail: "پنل‌های بتنی پیش‌ساخته با قالب CNC و درز پنهان" },
      { title: "نور", detail: "شکاف‌های نورگیری منحنی و بازتاب گرم روی بتن" },
    ],
    planHint: "مسیر ارگانیک پیوسته و حذف راهروهای بن‌بست",
    structuralNote:
      "پوسته با شبکه فضایی و پنل‌های بتنی پیش‌ساخته مدولار می‌شود؛ اتصالات فولادی در ضخامت پوسته پنهان می‌مانند.",
  },
  courtyard: {
    id: "courtyard",
    label: "حیاط مرکزی درون‌گرا",
    adjective: "حیاط‌محور",
    enForm: "inward-looking courtyard architecture with filtered light",
    headline: "حیاط مرکزی؛ قلب اقلیمی و اجتماعی پروژه",
    narrativeLead:
      "حیاط به‌عنوان هسته اقلیمی و اجتماعی، فضاهای پیرامون را سازمان می‌دهد؛ پوسته بیرونی بسته است و رویدادها درون حیاط رخ می‌دهند.",
    moves: [
      { title: "فرم", detail: "حجم پیرامونی با حیاط مرکزی و آب در محور اصلی" },
      { title: "اقلیم", detail: "بادگیر و سایه‌انداز کورتن برای خنک‌سازی تبخیری" },
      { title: "حریم", detail: "پوسته بسته بیرونی و دهانه‌های کنترل‌شده به حیاط" },
    ],
    planHint: "اتاق‌ها پیرامون حیاط و مسیر دور زدن پیوسته",
    structuralNote:
      "دیوارهای بتنی باربر پیرامون حیاط پایداری را تأمین می‌کنند؛ دهانه‌های بزرگ با تیرهای فولادی پنهان مهار می‌شوند.",
  },
  monolith: {
    id: "monolith",
    label: "حجم یکپارچه مونولیت",
    adjective: "یکپارچه",
    enForm: "monolithic exposed concrete volume with precise shadow gaps",
    headline: "مونولیت بتنی؛ سکوت، جرم و نور",
    narrativeLead:
      "یک حجم بتنی یکپارچه با برش‌های دقیق نور، فضایی آرام و معاصر می‌سازد؛ متریال تنها با پتینه برنز و شیشه شکسته می‌شود.",
    moves: [
      { title: "فرم", detail: "حجم ساده با برش‌های عمودی نور و بازشوی افقی" },
      { title: "بافت", detail: "قالب‌بندی تخته‌ای و درز ۱۲ میلی‌متری در نمای بتن" },
      { title: "جزئیات", detail: "نشستن شیشه در عمق دیوار و حذف قرنیز" },
    ],
    planHint: "پلان مستطیلی با هسته خدماتی فشرده و دهانه‌های بزرگ",
    structuralNote:
      "دیوار و سقف بتنی مسلح یکپارچه‌اند؛ بازشوها با تیر عمیق بتنی و تقویت لبه، یکپارچگی حجم را حفظ می‌کنند.",
  },
  parametric: {
    id: "parametric",
    label: "پوسته پارامتریک مشبک",
    adjective: "پارامتریک",
    enForm: "parametric perforated facade with algorithmic solar control",
    headline: "پوسته پارامتریک؛ نور، داده و سایه",
    narrativeLead:
      "پوسته بر اساس زاویه تابش، دید و حریم پارامتریک می‌شود؛ کورتن و برنز مات الگوی مشبک را با دقت میلی‌متری می‌سازند.",
    moves: [
      { title: "فرم", detail: "شبکه مشبک با بازشدگی متغیر بر اساس جهت آفتاب" },
      { title: "داده", detail: "کنترل خیرگی و حریم بدون از دست دادن منظر" },
      { title: "اجرا", detail: "پنل‌های تکرارشونده با اتصال خشک و نصب مدولار" },
    ],
    planHint: "مدول شبکه‌ای منطبق بر سازه و پلان آزاد داخلی",
    structuralNote:
      "پوسته غیرباربر به قاب اصلی فولادی متصل می‌شود؛ مدول ۱٫۸ متری، تولید و نصب پنل‌های کورتن را اقتصادی می‌کند.",
  },
  framed: {
    id: "framed",
    label: "قاب‌بندی معاصر",
    adjective: "قاب‌بندی‌شده",
    enForm: "contemporary framed volumes with deep thresholds",
    headline: "قاب‌های معاصر؛ نظم، آستانه و منظر",
    narrativeLead:
      "حجم‌ها در قالب قاب‌های بتنی و شیشه‌ای سازمان می‌یابند؛ هر قاب یک منظره و یک آستانه می‌سازد.",
    moves: [
      { title: "فرم", detail: "ترکیب مکعب‌های بتنی با قاب‌های شیشه‌ای سرتاسری" },
      { title: "آستانه", detail: "بالکن‌های عمیق و سایه‌بان برنز به‌عنوان فضای بینابین" },
      { title: "نور", detail: "بازشوهای افقی برای نور یکنواخت و کنترل‌شده" },
    ],
    planHint: "پلان خطی با قاب‌های تکرارشونده و هسته خدمات میانی",
    structuralNote:
      "قاب بتنی با دهانه‌های منظم، امکان شیشه سرتاسری و تغییر کاربری آینده را فراهم می‌کند.",
  },
};

interface CourseSeed {
  id: string;
  title: string;
  level: string;
  hours: number;
}

/**
 * Real LUMENS catalog entries (see `lib/data.ts`). Only ids that exist in the
 * catalog are listed here, so every generated link lands on a live card at
 * `/courses#<id>`.
 */
const COURSE_CATALOG: Record<string, CourseSeed> = {
  "c-01": { id: "c-01", title: "هوش مصنوعی در معماری؛ از ایده تا فرم", level: "مقدماتی", hours: 8 },
  "c-02": { id: "c-02", title: "پرامپت‌نویسی حرفه‌ای معماری", level: "متوسط", hours: 6 },
  "c-04": { id: "c-04", title: "گردش کار AI: از کروکی تا ارائه نهایی", level: "متوسط", hours: 10 },
  "c-06": { id: "c-06", title: "نورپردازی و متریال‌سازی حرفه‌ای با AI", level: "پیشرفته", hours: 9 },
  "c-07": { id: "c-07", title: "پلان، دیاگرام و اینفوگرافیک هوشمند", level: "مقدماتی", hours: 7 },
  "c-09": { id: "c-09", title: "طراحی نما و پوستهٔ ساختمان با هوش مصنوعی", level: "متوسط", hours: 11 },
  "c-10": { id: "c-10", title: "دوره جامع تری‌دی‌مکس و مدل‌سازی معماری", level: "مقدماتی", hours: 24 },
  "c-11": { id: "c-11", title: "آموزش مدل‌سازی BIM و فاز ۲ با رویت", level: "متوسط", hours: 20 },
  "c-12": { id: "c-12", title: "مدل‌سازی فرم‌های پیچیده و ارگانیک در راینو", level: "پیشرفته", hours: 18 },
  "c-13": { id: "c-13", title: "طراحی پارامتریک و الگوریتمیک با گرس‌هاپر", level: "پیشرفته", hours: 22 },
  "c-14": { id: "c-14", title: "رندرینگ سریع و انیمیشن معماری با لومیون", level: "متوسط", hours: 15 },
};

interface CourseReason {
  courseId: string;
  role: string;
  reason: string;
}

interface TypologyCourseRule {
  /** Extra courses prioritised for this typology, in order. */
  focus: CourseReason[];
  /** One extra sentence appended to the learning-path summary. */
  summaryNote: string;
}

const TYPOLOGY_COURSES: Record<ProjectTypology, TypologyCourseRule> = {
  villa: {
    focus: [
      { courseId: "c-06", role: "متریال و نورپردازی", reason: "برای رسیدن به پرداخت ابریشمی بتن و نور گرم شب، بخش متریال و نور همان دوره را اجرا کنید." },
      { courseId: "c-10", role: "مدل‌سازی دقیق", reason: "هندسه کنسول و جزئیات نما در تری‌دی‌مکس بدون خطای اتصال مدل می‌شود." },
      { courseId: "c-11", role: "مستندسازی اجرایی", reason: "پلان‌های اجرایی، جزئیات دیوار بتنی و جدول مقادیر را در رویت تکمیل کنید." },
    ],
    summaryNote: "این مسیر شما را از اسکیس ویلای معلق تا شیت اجرایی نما و پلان هدایت می‌کند.",
  },
  "cafe-library": {
    focus: [
      { courseId: "c-07", role: "پلان و دیاگرام", reason: "دیاگرام مسیر مطالعه و لکه‌گذاری «کتاب، قهوه، مکث» در این دوره تمرین می‌شود." },
      { courseId: "c-09", role: "پوسته فرهنگی", reason: "پوسته مشبک و ویترین شیشه‌ای با همان گردش کار نما در دوره طراحی می‌شود." },
      { courseId: "c-11", role: "BIM و فاز ۲", reason: "مدل اطلاعاتی برای قفسه‌بندی، تاسیسات و کنترل تداخل کافه ضروری است." },
    ],
    summaryNote: "تمرکز این مسیر روی پلان تجربه‌محور، نور شمالی مطالعه و پوسته فرهنگی است.",
  },
  gallery: {
    focus: [
      { courseId: "c-09", role: "پوسته نمایشگاهی", reason: "قاب شیشه‌ای و نورگیر سقفی بدون خیرگی، سرفصل اصلی طراحی نما است." },
      { courseId: "c-06", role: "نور و متریال", reason: "دیوار خنثی بتنی و نور صحنه‌ای گالری، خروجی همین دوره است." },
      { courseId: "c-12", role: "فرم‌های حجیم", reason: "برای حجم‌های سیال و سکوی بتنی، مدل‌سازی راینو کنترل هندسه را ممکن می‌کند." },
    ],
    summaryNote: "مسیر پیشنهادی روی کنترل نور، دیوار خنثی و پوسته شیشه‌ای متمرکز است.",
  },
  office: {
    focus: [
      { courseId: "c-11", role: "BIM و مدول", reason: "مدول سازه، هسته خدمات و کنترل تداخل تاسیسات در رویت مدیریت می‌شود." },
      { courseId: "c-04", role: "گردش کار استودیو", reason: "از کروکی تا ارائه نهایی برای جلسه با کارفرما، در یک گردش کار یکپارچه." },
      { courseId: "c-14", role: "انیمیشن ارائه", reason: "انیمیشن کوتاه لابی و تراس بام برای تأیید کارفرما در لومیون ساخته می‌شود." },
    ],
    summaryNote: "این مسیر بر مدولار بودن، مستندسازی BIM و ارائه سریع به کارفرما تمرکز دارد.",
  },
  pavilion: {
    focus: [
      { courseId: "c-13", role: "پوسته پارامتریک", reason: "الگوی مشبک و بازشدگی متغیر با گرس‌هاپر و کنترل داده ساخته می‌شود." },
      { courseId: "c-12", role: "هندسه سبک", reason: "کنسول سبک و اتصالات نازک، در مدل‌سازی راینو دقیق‌تر اجرا می‌شود." },
      { courseId: "c-14", role: "ارائه منظر", reason: "رندر و انیمیشن پاویون در بستر طبیعی، سریع‌ترین راه تأیید طرح است." },
    ],
    summaryNote: "پاویون کوچک است، اما مسیر یادگیری آن دقیق‌ترین کنترل هندسه و ارائه را می‌خواهد.",
  },
  adaptive: {
    focus: [
      { courseId: "c-01", role: "کانسپت", reason: "چارچوب تبدیل بریف به کانسپت معمارانه، پایه همه تصمیم‌های بعدی است." },
      { courseId: "c-04", role: "گردش کار کامل", reason: "از اسکیس خام تا برد ارائه نهایی، همان زنجیره‌ای که موتور طی کرد." },
      { courseId: "c-10", role: "مدل‌سازی پایه", reason: "مدل تمیز و بهینه، پیش‌نیاز رندر و شیت نهایی است." },
    ],
    summaryNote: "این مسیر عمومی، شما را از بریف تا شیت ارائه همراهی می‌کند.",
  },
};

/** Concepts always recommended, in order, after the typology-specific ones. */
const CORE_COURSE_IDS = ["c-01", "c-02", "c-07", "c-14"] as const;

const GEOMETRY_COURSE: Record<GeometryProfile["id"], CourseReason> = {
  suspended: { courseId: "c-10", role: "مدل‌سازی کنسول", reason: "کنترل کنسول و اتصال آن به هسته، در تری‌دی‌مکس گام‌به‌گام تمرین می‌شود." },
  organic: { courseId: "c-12", role: "فرم ارگانیک", reason: "سطوح سیال و پوسته منحنی بدون خطای نرمال، در راینو ساخته می‌شود." },
  courtyard: { courseId: "c-07", role: "دیاگرام حیاط", reason: "دیاگرام اقلیمی حیاط و مسیر دور زدن، در دوره پلان و دیاگرام تمرین می‌شود." },
  monolith: { courseId: "c-06", role: "بافت بتن", reason: "قالب‌بندی تخته‌ای و پرداخت ابریشمی بتن، در بخش متریال همین دوره آموزش داده می‌شود." },
  parametric: { courseId: "c-13", role: "پوسته مشبک", reason: "الگوی پارامتریک نما و خروجی تولید پنل، در گرس‌هاپر اجرا می‌شود." },
  framed: { courseId: "c-11", role: "مدول قاب", reason: "مدول قاب بتنی و اتصال شیشه سرتاسری در رویت مستند می‌شود." },
};

/* ------------------------------------------------------------------ */
/*  Text analysis helpers                                             */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set([
  "با",
  "در",
  "از",
  "به",
  "برای",
  "یک",
  "و",
  "که",
  "را",
  "این",
  "آن",
  "روی",
  "بر",
  "تا",
  "هم",
  "شامل",
  "حدود",
  "متر",
  "متری",
  "مترمربع",
  "طبقه",
  "پروژه",
]);

/** Persian/Arabic-normalised lowercase text, safe for keyword matching. */
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

function includesAny(haystack: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => haystack.includes(normalize(keyword)));
}

const TYPOLOGY_RULES: Array<{ id: ProjectTypology; keywords: string[] }> = [
  { id: "cafe-library", keywords: ["کافه", "کتاب", "کتابخانه", "مطالعه", "بوک"] },
  { id: "villa", keywords: ["ویلا", "ویلایی", "خانه", "مسکونی", "اقامتگاه", "سوئیت"] },
  { id: "gallery", keywords: ["گالری", "نمایشگاه", "موزه", "نگارخانه", "آرت"] },
  { id: "office", keywords: ["اداری", "دفتر", "شرکت", "استارتاپ", "کارگاه", "محیط کار"] },
  { id: "pavilion", keywords: ["پاویون", "غرفه", "آلاچیق", "کیوسک", "سازه سبک"] },
];

const GEOMETRY_RULES: Array<{ id: GeometryProfile["id"]; keywords: string[] }> = [
  { id: "suspended", keywords: ["معلق", "کنسول", "شناور", "آویزان", "پل"] },
  { id: "organic", keywords: ["بیونیک", "ارگانیک", "سیال", "منحنی", "موج", "پوسته سیال"] },
  { id: "courtyard", keywords: ["حیاط", "درون‌گرا", "بادگیر", "حوض"] },
  { id: "parametric", keywords: ["پارامتریک", "الگوریتم", "مشبک", "توری", "شبکه"] },
  { id: "monolith", keywords: ["مونولیت", "یکپارچه", "حجیم", "مکعب", "بتنی"] },
  { id: "framed", keywords: ["قاب", "مدول", "خطی", "پوسته قاب"] },
];

const DEFAULT_GEOMETRY: Record<ProjectTypology, GeometryProfile["id"]> = {
  villa: "suspended",
  "cafe-library": "framed",
  gallery: "framed",
  office: "parametric",
  pavilion: "suspended",
  adaptive: "monolith",
};

interface IdeaSignals {
  prompt: string;
  normalized: string;
  typology: ProjectTypology;
  geometry: GeometryProfile;
  location: LocationProfile;
  locationDetected: boolean;
  materialKeywords: Record<MaterialId, number>;
  keywords: string[];
}

function detectTypology(haystack: string): ProjectTypology {
  const match = TYPOLOGY_RULES.find((rule) => includesAny(haystack, rule.keywords));
  return match ? match.id : "adaptive";
}

function detectGeometry(haystack: string): GeometryProfile["id"] | null {
  const match = GEOMETRY_RULES.find((rule) => includesAny(haystack, rule.keywords));
  return match ? match.id : null;
}

function detectLocation(haystack: string): { location: LocationProfile; detected: boolean } {
  const match = ALL_LOCATION_RULES.find((rule) => includesAny(haystack, rule.keywords));
  return match ? { location: match.location, detected: true } : { location: DEFAULT_LOCATION, detected: false };
}

/** Counts how strongly each palette material is requested by the brief. */
function scoreMaterialKeywords(haystack: string): Record<MaterialId, number> {
  const scores: Record<MaterialId, number> = {
    "silk-concrete": 0,
    "structural-glass": 0,
    "corten-bronze": 0,
    "shou-sugi-ban": 0,
  };

  LUMENS_MATERIALS.forEach((material) => {
    material.keywords.forEach((keyword) => {
      if (haystack.includes(normalize(keyword))) scores[material.id] += 1;
    });
  });

  return scores;
}

/** Meaningful nouns of the brief, used as concept keywords in the UI. */
function extractKeywords(prompt: string, limit = 5): string[] {
  const seen = new Set<string>();
  const words = normalize(prompt)
    .split(" ")
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word) && !/^\d+$/.test(word));

  const keywords: string[] = [];
  words.forEach((word) => {
    if (seen.has(word)) return;
    seen.add(word);
    keywords.push(word);
  });

  return keywords.slice(0, limit);
}

function analyzeIdea(prompt: string): IdeaSignals {
  const normalized = normalize(prompt);
  const typology = detectTypology(normalized);
  const geometryId = detectGeometry(normalized);
  const { location, detected } = detectLocation(normalized);

  return {
    prompt,
    normalized,
    typology,
    geometry: GEOMETRIES[geometryId ?? DEFAULT_GEOMETRY[typology]],
    location,
    locationDetected: detected,
    materialKeywords: scoreMaterialKeywords(normalized),
    keywords: extractKeywords(prompt),
  };
}

/* ------------------------------------------------------------------ */
/*  Proposal builders                                                 */
/* ------------------------------------------------------------------ */

/** Converts weights to integer percentages that always add up to 100. */
function distributeShares(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const exact = values.map((value) => (value / total) * 100);
  const result = exact.map(Math.floor);
  const remainder = 100 - result.reduce((sum, value) => sum + value, 0);

  exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, remainder)
    .forEach(({ index }) => {
      result[index] += 1;
    });

  return result;
}

const MATERIAL_BASE: Record<ProjectTypology, Record<MaterialId, number>> = {
  villa: { "silk-concrete": 38, "structural-glass": 26, "corten-bronze": 20, "shou-sugi-ban": 16 },
  "cafe-library": { "silk-concrete": 24, "structural-glass": 26, "corten-bronze": 20, "shou-sugi-ban": 30 },
  gallery: { "silk-concrete": 36, "structural-glass": 34, "corten-bronze": 14, "shou-sugi-ban": 16 },
  office: { "silk-concrete": 30, "structural-glass": 36, "corten-bronze": 22, "shou-sugi-ban": 12 },
  pavilion: { "silk-concrete": 26, "structural-glass": 30, "corten-bronze": 28, "shou-sugi-ban": 16 },
  adaptive: { "silk-concrete": 32, "structural-glass": 28, "corten-bronze": 22, "shou-sugi-ban": 18 },
};

const CLIMATE_MATERIAL_BIAS: Record<string, Partial<Record<MaterialId, number>>> = {
  kordan: { "structural-glass": 4 },
  isfahan: { "corten-bronze": 10, "shou-sugi-ban": 2 },
  desert: { "corten-bronze": 8, "silk-concrete": 4, "structural-glass": -4 },
  forest: { "shou-sugi-ban": 10, "structural-glass": 4 },
  tehran: { "structural-glass": 6 },
  coast: { "structural-glass": 8, "corten-bronze": 4, "shou-sugi-ban": -4 },
};

const GEOMETRY_MATERIAL_BIAS: Record<GeometryProfile["id"], Partial<Record<MaterialId, number>>> = {
  suspended: { "silk-concrete": 6, "structural-glass": 4 },
  organic: { "shou-sugi-ban": 4, "structural-glass": 4 },
  courtyard: { "silk-concrete": 6, "corten-bronze": 6 },
  monolith: { "silk-concrete": 10, "structural-glass": 2 },
  parametric: { "corten-bronze": 10, "structural-glass": 2 },
  framed: { "structural-glass": 8 },
};

const MATERIAL_APPLICATION: Record<MaterialId, (primaryZone: string, socialZone: string) => string> = {
  "silk-concrete": (primaryZone, socialZone) =>
    `سازه و بدنه ${primaryZone}، سقف بتنی ${socialZone} و نیمکت‌های یکپارچه؛ قالب‌بندی تخته‌ای با درز ۱۲ میلی‌متری`,
  "structural-glass": (primaryZone, socialZone) =>
    `قاب سرتاسری ${primaryZone}، نورگیر ${socialZone} و جان‌پناه شفاف بالکن با مولیون پنهان برنز`,
  "corten-bronze": (primaryZone, socialZone) =>
    `سایه‌بان ${socialZone}، نرده و اتصالات ${primaryZone}؛ پتینه طبیعی کورتن و برنز مات بدون رنگ`,
  "shou-sugi-ban": (primaryZone, socialZone) =>
    `دیواره داخلی ${socialZone}، کف تراس و آکوستیک سقف ${primaryZone} با سطح ذغالی برس‌خورده`,
};

const MATERIAL_EMPHASIS: Record<MaterialId, string> = {
  "silk-concrete":
    "قالب‌بندی را در امتداد افق سایت بچینید؛ بتن بدون پوشش و تنها با آب‌بند مات، پتینه طبیعی می‌گیرد.",
  "structural-glass":
    "حداقل ۷۰٪ سطح نما را شیشه یکپارچه بگیرید و فریم را در عمق دیوار پنهان کنید تا قاب دیده نشود.",
  "corten-bronze":
    "کورتن را در تماس مستقیم با بتن بگذارید؛ لکه‌های پتینه و آب‌گرفتگی بخشی از زبان طراحی لومنز است.",
  "shou-sugi-ban":
    "چوب سوخته را فقط در فضای محافظت‌شده و بالای ۱۵ سانتی‌متر از تراز آب به کار ببرید؛ تضاد گرمی آن با بتن، کلید فضاست.",
};

const DETAIL_TIPS: Record<MaterialId, string> = {
  "silk-concrete": "روکار و قرنیز حذف شود؛ درز بتن و شیشه با نوار EPDM هم‌سطح شود.",
  "structural-glass": "لبه شیشه پولیش و گوشه‌ها با فاصله ۱۰ میلی‌متری از بتن اجرا شود.",
  "corten-bronze": "پتینه فقط با روغن سرد تثبیت شود؛ رنگ اضافه روی کورتن ممنوع است.",
  "shou-sugi-ban": "روغن مات سه لایه با فاصله ۸ میلی‌متری از سطح بتن برای تهویه چوب.",
};

function buildProjectName(signals: IdeaSignals): string {
  const noun: Record<ProjectTypology, string> = {
    villa: "ویلای",
    "cafe-library": "کافه کتاب",
    gallery: "گالری",
    office: "مجموعه اداری",
    pavilion: "پاویون",
    adaptive: "پروژه",
  };

  return `${noun[signals.typology]} ${signals.geometry.adjective} ${signals.location.short}`
    .replace(/\s+/g, " ")
    .trim();
}

function pickZones(template: ProgramTemplate): { primaryZone: string; socialZone: string } {
  const sorted = [...template.zones].sort((a, b) => b.area - a.area);
  return {
    primaryZone: sorted[0]?.name ?? "فضای اصلی",
    socialZone: sorted[1]?.name ?? sorted[0]?.name ?? "فضای عمومی",
  };
}

function buildConcept(signals: IdeaSignals): ConceptPhase {
  const template = PROGRAM_TEMPLATES[signals.typology];
  const { geometry, location } = signals;

  const siteSentence = signals.locationDetected
    ? `سایت در ${location.label} با ${location.site} و اقلیم ${location.climate} شناخته می‌شود.`
    : `تا زمانی که داده دقیق سایت ارائه نشود، اقلیم ${location.label} به‌عنوان سایت مبنا در نظر گرفته شده است.`;

  const materialSentence =
    "جرم اصلی از بتن اکسپوز ابریشمی ساخته می‌شود، شیشه ساختاری سرتاسری منظر را به داخل می‌آورد و کورتن/برنز مات سایه و جزئیات را کنترل می‌کند.";

  const climateStrategies = [...location.strategies];
  if (signals.materialKeywords["structural-glass"] > 0) {
    climateStrategies.push("افزایش سطح شیشه با شیشه Low-E سه‌لایه و سایه‌بان بیرونی برای کنترل تابش");
  }
  if (signals.materialKeywords["shou-sugi-ban"] > 0) {
    climateStrategies.push("لایه چوب سوخته در فضای داخلی برای تعادل رطوبت و آکوستیک");
  }

  const topMaterial = [...LUMENS_MATERIALS].sort(
    (a, b) => signals.materialKeywords[b.id] - signals.materialKeywords[a.id],
  )[0];

  const keywords = [
    template.label,
    geometry.label,
    location.short,
    topMaterial.nameFa,
    ...signals.keywords,
  ]
    .filter((keyword, index, list) => Boolean(keyword) && list.indexOf(keyword) === index)
    .slice(0, 6);

  return {
    eyebrow: `${template.label} · ${location.short} · ${geometry.label}`,
    headline: geometry.headline,
    narrative: `${geometry.narrativeLead} این حجم، برنامه «${template.summary}» را در خود جای می‌دهد. ${siteSentence} ${materialSentence}`,
    keywords,
    climate: {
      site: location.site,
      climate: location.climate,
      altitude: location.altitude,
      orientation: location.orientation,
      strategies: climateStrategies,
      metrics: location.metrics,
    },
    moves: geometry.moves,
  };
}

function buildPlan(signals: IdeaSignals): PlanPhase {
  const template = PROGRAM_TEMPLATES[signals.typology];
  const { geometry } = signals;
  const areas = template.zones.map((zone) => zone.area);
  const shares = distributeShares(areas);
  const totalArea = areas.reduce((sum, area) => sum + area, 0);

  const zones: PlanZone[] = template.zones.map((zone, index) => ({
    id: `zone-${index + 1}`,
    name: zone.name,
    area: zone.area,
    share: shares[index],
    level: zone.level,
    note: zone.note,
  }));

  const levels = zones
    .map((zone) => zone.level)
    .filter((level, index, list) => list.indexOf(level) === index);

  const horizontalByGeometry: Record<GeometryProfile["id"], string> = {
    suspended:
      "مسیر افقی از پل ورودی شروع می‌شود و در یک خط پیوسته تا قاب شیشه‌ای منظر ادامه دارد؛ هیچ راهرو بن‌بستی وجود ندارد.",
    organic:
      "مسیر به‌صورت سیال و بدون گوشه تیز از ورودی تا قلب پروژه می‌پیچد و در هر انحنا یک مکث منظر می‌سازد.",
    courtyard:
      "مسیر به‌صورت حلقه‌ای دور حیاط می‌چرخد؛ هر فضا از دو جبهه به حیاط و به فضای مجاور متصل است.",
    monolith:
      "مسیر خطی و مستقیم در امتداد محور طولی حجم پیش می‌رود و با برش‌های نور، ریتم بصری می‌سازد.",
    parametric:
      "مسیر منطبق بر مدول شبکه است؛ گره‌های سازه‌ای به نقاط تصمیم و توقف تبدیل می‌شوند.",
    framed:
      "مسیر از قاب ورودی به قاب‌های متوالی می‌رسد؛ هر قاب یک آستانه و یک تجربه فضایی مستقل است.",
  };

  const vertical =
    levels.length > 1
      ? "پله بتنی معلق در هسته مرکزی، ارتباط عمودی را با نورگیر سقفی برقرار می‌کند؛ رمپ دسترسی در جبهه شرقی برای دسترسی بدون پله."
      : "پروژه تک‌تراز است؛ اختلاف سطح‌های جزئی با یک پله بتنی و شیب ۱:۲۰ در تراس حل می‌شود.";

  const service =
    "سرویس‌ها، تأسیسات و انبار در نوار پشتی و دور از دید اصلی قرار می‌گیرند و با مسیر سرویس مستقل به بیرون وصل می‌شوند.";

  return {
    eyebrow: `دیاگرام فضایی · ${PROGRAM_TEMPLATES[signals.typology].label}`,
    headline: geometry.planHint,
    strategy: `${template.planStrategy} ${geometry.planHint} به‌عنوان قاعده لکه‌گذاری انتخاب شده است.`,
    zones,
    totalArea,
    circulation: { horizontal: horizontalByGeometry[geometry.id], vertical, service },
    levels,
    structuralNote: geometry.structuralNote,
  };
}

function scoreMaterials(signals: IdeaSignals): MaterialSelection[] {
  const base = MATERIAL_BASE[signals.typology];
  const climateBias = CLIMATE_MATERIAL_BIAS[signals.location.id] ?? {};
  const geometryBias = GEOMETRY_MATERIAL_BIAS[signals.geometry.id];
  const template = PROGRAM_TEMPLATES[signals.typology];
  const { primaryZone, socialZone } = pickZones(template);

  const raw = LUMENS_MATERIALS.map((material) => {
    const weight = Math.max(
      6,
      base[material.id] +
        signals.materialKeywords[material.id] * 7 +
        (climateBias[material.id] ?? 0) +
        (geometryBias[material.id] ?? 0),
    );

    return {
      material,
      weight,
      requested: signals.materialKeywords[material.id] > 0,
    };
  });

  const shares = distributeShares(raw.map((item) => item.weight));

  return raw
    .map((item, index) => ({
      ...item.material,
      share: shares[index],
      application: MATERIAL_APPLICATION[item.material.id](primaryZone, socialZone),
      emphasis: item.requested
        ? `بر اساس بریف شما، ${item.material.nameFa} به‌عنوان یکی از متریال‌های کلیدی تثبیت شد. ${MATERIAL_EMPHASIS[item.material.id]}`
        : MATERIAL_EMPHASIS[item.material.id],
    }))
    .sort((a, b) => b.share - a.share);
}

function buildMaterials(signals: IdeaSignals): MaterialsPhase {
  const composition = scoreMaterials(signals);
  const [lead, second, third, fourth] = composition;

  const rationale = `ترکیب ${toPersianDigits(lead.share)}٪ ${lead.nameFa}، ${toPersianDigits(second.share)}٪ ${second.nameFa}، ${toPersianDigits(third.share)}٪ ${third.nameFa} و ${toPersianDigits(fourth.share)}٪ ${fourth.nameFa} بر پایه اقلیم ${signals.location.short}، برنامه ${PROGRAM_TEMPLATES[signals.typology].label} و هندسه ${signals.geometry.label} پیشنهاد می‌شود. نسبت‌ها قابل بازتنظیم‌اند، اما سلسله‌مراتب جرم، شفافیت و جزئیات حفظ می‌شود.`;

  const detailing = [
    `درز اجرایی ۱۲ میلی‌متری بین ${lead.nameFa} و ${second.nameFa} با نوار EPDM و بدون روکار اجرا شود.`,
    DETAIL_TIPS["silk-concrete"],
    DETAIL_TIPS["corten-bronze"],
    `لبه ${signalEdgeLabel(signals)} با ضخامت نازک‌شده و بدون قرنیز؛ اتصال شیشه در عمق ۴۰ میلی‌متری دیوار.`,
    DETAIL_TIPS["shou-sugi-ban"],
  ];

  return {
    eyebrow: "پالت اختصاصی لومنز",
    headline: `${lead.nameFa}؛ جرم اصلی، ${second.nameFa}؛ لایه شفافیت`,
    rationale,
    composition,
    detailing,
    renderPrompt: [
      PROGRAM_TEMPLATES[signals.typology].en,
      signals.geometry.enForm,
      signals.location.lightEn,
      "silk fair-faced concrete with board-formed texture",
      "ultra-clear structural glass curtain wall with hidden bronze mullions",
      "corten steel sunshades with natural patina",
      "charred shou sugi ban wood soffit",
      "cinematic architectural photography, 35mm tilt-shift, soft volumetric light",
      "photoreal, ultra detailed, 8k",
    ].join(", "),
    negativePrompt:
      "text, watermark, logo, distorted perspective, oversaturated colors, cartoon, illustration, blurry, low contrast, cluttered background, duplicated geometry, warped reflections",
  };
}

function signalEdgeLabel(signals: IdeaSignals): string {
  const labelByGeometry: Record<GeometryProfile["id"], string> = {
    suspended: "کنسول معلق",
    organic: "پوسته سیال",
    courtyard: "حیاط مرکزی",
    monolith: "حجم بتنی",
    parametric: "پوسته مشبک",
    framed: "قاب نما",
  };

  return labelByGeometry[signals.geometry.id];
}

const CORE_COURSE_REASONS: Record<string, CourseReason> = {
  "c-01": {
    courseId: "c-01",
    role: "پایه کانسپت",
    reason: "برای تثبیت زبان طراحی و تبدیل بریف به فرم، این دوره نقطه شروع پیشنهادی است.",
  },
  "c-02": {
    courseId: "c-02",
    role: "پرامپت‌نویسی",
    reason: "برای بازتولید همین خروجی با پرامپت‌های دقیق‌تر و کنترل‌شده در ابزارهای تصویری.",
  },
  "c-07": {
    courseId: "c-07",
    role: "پلان و دیاگرام",
    reason: "دیاگرام لکه‌گذاری و اینفوگرافیک ارائه را در همین دوره تمرین می‌کنید.",
  },
  "c-14": {
    courseId: "c-14",
    role: "رندر و انیمیشن",
    reason: "برای تبدیل مدل به تصویر و انیمیشن سریع، لومیون کوتاه‌ترین مسیر است.",
  },
};

function buildCourses(signals: IdeaSignals): CoursesPhase {
  const rule = TYPOLOGY_COURSES[signals.typology];
  const candidates: CourseReason[] = [
    rule.focus[0],
    GEOMETRY_COURSE[signals.geometry.id],
    ...rule.focus.slice(1),
    ...CORE_COURSE_IDS.map((courseId) => CORE_COURSE_REASONS[courseId]),
  ];

  const seen = new Set<string>();
  const courses: CourseRecommendation[] = [];

  candidates.forEach((candidate) => {
    if (!candidate || seen.has(candidate.courseId)) return;
    const seed = COURSE_CATALOG[candidate.courseId];
    if (!seed) return;

    seen.add(candidate.courseId);
    courses.push({
      id: seed.id,
      title: seed.title,
      href: `/courses#${seed.id}`,
      level: seed.level,
      hours: seed.hours,
      role: candidate.role,
      reason: candidate.reason,
    });
  });

  const selected = courses.slice(0, 5);
  const totalHours = selected.reduce((sum, course) => sum + course.hours, 0);

  return {
    eyebrow: "مسیر یادگیری لومنز",
    headline: `${toPersianDigits(selected.length)} دوره برای اجرای این ایده`,
    summary: `${rule.summaryNote} مجموع زمان پیشنهادی ${toPersianDigits(totalHours)} ساعت است و با پروژه واقعی همین بریف تمرین می‌شود.`,
    courses: selected,
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Synchronous core of the engine. Deterministic for a given prompt, which
 * makes it easy to preview or unit-test without waiting for the mock delay.
 */
export function buildArchitecturalIdea(prompt: string): ArchitecturalIdeaResult {
  const trimmed = prompt.trim();
  const signals = analyzeIdea(trimmed);
  const concept = buildConcept(signals);
  const plan = buildPlan(signals);
  const materials = buildMaterials(signals);
  const courses = buildCourses(signals);

  return {
    id: `idea-${Date.now().toString(36)}`,
    prompt: trimmed,
    projectName: buildProjectName(signals),
    typologyLabel: PROGRAM_TEMPLATES[signals.typology].label,
    locationLabel: signals.locationDetected
      ? signals.location.label
      : `${signals.location.label} (سایت فرضی)`,
    createdAt: new Date().toISOString(),
    runtimeMs: ENGINE_RUNTIME_MS,
    tags: [
      PROGRAM_TEMPLATES[signals.typology].label,
      signals.geometry.label,
      signals.location.short,
      materials.composition[0].nameFa,
    ],
    phases: { concept, plan, materials, courses },
  };
}

function createAbortError(): Error {
  const error = new Error("پردازش ایده لغو شد.");
  error.name = "AbortError";
  return error;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }

    const handleAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

/**
 * Mock AI endpoint: analyses the brief, waits ~3 seconds in four loading
 * steps and resolves with the structured architectural proposal.
 *
 * @throws Error when the brief is shorter than 3 characters.
 * @throws AbortError when `options.signal` is aborted mid-run.
 */
export async function processArchitecturalIdea(
  prompt: string,
  options: ProcessArchitecturalIdeaOptions = {},
): Promise<ArchitecturalIdeaResult> {
  const trimmed = prompt.trim();

  if (trimmed.length < 3) {
    throw new Error("ایده خود را با حداقل سه حرف بنویسید تا موتور بتواند آن را تحلیل کند.");
  }

  const { signal, onPhase, phaseDurationMs = ENGINE_RUNTIME_MS / ENGINE_PHASE_COUNT } = options;
  const result = buildArchitecturalIdea(trimmed);

  for (let phase = 0; phase < ENGINE_PHASE_COUNT; phase += 1) {
    if (signal?.aborted) throw createAbortError();
    onPhase?.(phase);
    await wait(phaseDurationMs, signal);
  }

  return result;
}

/** Localised, ICU-safe timestamp used in the engine dialog header. */
export function formatIdeaTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return toPersianDigits(iso.slice(0, 16).replace("T", " · "));
  }
}

/**
 * Plain-text export of a proposal (copy button + `.txt` download).
 * Kept dependency-free and readable in any editor or chat window.
 */
export function formatIdeaBrief(result: ArchitecturalIdeaResult): string {
  const { concept, plan, materials, courses } = result.phases;
  const lines: string[] = [
    "LUMENS — موتور ایده‌پرداز معماری",
    "=".repeat(42),
    `پروژه: ${result.projectName}`,
    `تایپولوژی: ${result.typologyLabel} | سایت: ${result.locationLabel}`,
    `بریف کاربر: ${result.prompt}`,
    "",
    `فاز ۱ — ${concept.headline}`,
    concept.narrative,
    `اقلیم: ${concept.climate.climate} | ${concept.climate.altitude} | جهت‌گیری: ${concept.climate.orientation}`,
    "راهبرد اقلیمی:",
    ...concept.climate.strategies.map((strategy) => `  - ${strategy}`),
    "",
    `فاز ۲ — ${plan.headline}`,
    plan.strategy,
    `مساحت ناخالص پیشنهادی: ${toPersianDigits(plan.totalArea)} مترمربع`,
    "لکه‌گذاری فضاها:",
    ...plan.zones.map(
      (zone) =>
        `  - ${zone.name} | ${toPersianDigits(zone.area)} م² (${toPersianDigits(zone.share)}٪) | ${zone.level} | ${zone.note}`,
    ),
    `ارتباط افقی: ${plan.circulation.horizontal}`,
    `ارتباط عمودی: ${plan.circulation.vertical}`,
    `سرویس: ${plan.circulation.service}`,
    `سازه: ${plan.structuralNote}`,
    "",
    `فاز ۳ — ${materials.headline}`,
    materials.rationale,
    "ترکیب متریال:",
    ...materials.composition.map(
      (material) =>
        `  - ${material.nameFa} (${material.nameEn}) ${toPersianDigits(material.share)}٪ — ${material.application}`,
    ),
    "جزئیات اجرایی:",
    ...materials.detailing.map((tip) => `  - ${tip}`),
    `پرامپت رندر: ${materials.renderPrompt}`,
    `منفی‌پرامپت: ${materials.negativePrompt}`,
    "",
    `فاز ۴ — ${courses.headline}`,
    courses.summary,
    ...courses.courses.map(
      (course) =>
        `  - ${course.title} | ${course.level} | ${toPersianDigits(course.hours)} ساعت | https://lumens.archi${course.href} | ${course.reason}`,
    ),
    "",
    `تولیدشده توسط LUMENS AI Engine در ${formatIdeaTimestamp(result.createdAt)}`,
  ];

  return lines.join("\n");
}

/** Safe filename for the exported `.txt` brief. */
export function buildIdeaFilename(result: ArchitecturalIdeaResult): string {
  return `lumens-idea-${result.id.replace(/[^a-z0-9-]/gi, "")}.txt`;
}

