/**
 * LUMENS - موتور معماری هوش مصنوعی (Lumens AI Architecture Engine)
 * -----------------------------------------------------------------
 * Deterministic, dependency-free engine that turns a free-form Persian brief
 * into a structured **5-phase architectural project sheet**:
 *
 *   1. کانسپت و پهنه‌بندی فضایی  (بیانیه، ماتریس ۲۵/۳۵/۴۰، گردش)
 *   2. فرم و تکتونیک            (حجم‌گذاری، گودال‌باغچه، شبکه پورتال بتنی)
 *   3. پرامپت‌های رندر کالیبره‌شده (FLUX.1 / SDXL / Midjourney - انگلیسی)
 *   4. برش فنی و جزئیات          (گذار زیرزمین، شیشه فریم‌لس، ناودان خطی)
 *   5. شیت ارائه و پیچ           (بیانیه دوزبانه و متادیتای شیت)
 *
 * The module is pure: no network, no API key, identical output for identical
 * input (apart from the timestamp). It runs inside the `/api/engine/sheet`
 * route so the text phases stay free and unlimited, while the render phase is
 * delegated to `/api/render/generate` (Mode 2 production flow).
 */

import { toPersianDigits } from "./data";
import type { RenderAspectRatio } from "./engine-contract";

/* ------------------------------------------------------------------ */
/*  Public constants                                                  */
/* ------------------------------------------------------------------ */

export const SHEET_PHASE_COUNT = 5;

/** Keeps the brief short enough for deterministic analysis. */
export const MAX_BRIEF_LENGTH = 600;

export type SheetPhaseId = "concept" | "tectonics" | "prompts" | "technical" | "presentation";

export interface SheetPhaseStep {
  id: SheetPhaseId;
  index: number;
  /** `فاز ۰۱` */
  label: string;
  title: string;
  subtitle: string;
  description: string;
}

function phaseLabel(position: number): string {
  return `فاز ${toPersianDigits(String(position).padStart(2, "0"))}`;
}

export const SHEET_PHASE_STEPS: readonly SheetPhaseStep[] = [
  {
    id: "concept",
    index: 0,
    label: phaseLabel(1),
    title: "کانسپت و پهنه‌بندی فضایی",
    subtitle: "Concept & Spatial Zoning",
    description: "بیانیه معماری، ماتریس سه‌سطحی ۲۵/۳۵/۴۰ و منطق گردش",
  },
  {
    id: "tectonics",
    index: 1,
    label: phaseLabel(2),
    title: "فرم و تکتونیک",
    subtitle: "Form & Tectonics",
    description: "حجم‌گذاری، گودال‌باغچه و شبکه پورتال بتنی",
  },
  {
    id: "prompts",
    index: 2,
    label: phaseLabel(3),
    title: "پرامپت‌های رندر کالیبره‌شده",
    subtitle: "Calibrated Render Prompts",
    description: "سه پرامپت انگلیسی فوتورئال برای FLUX.1 / SDXL / Midjourney",
  },
  {
    id: "technical",
    index: 3,
    label: phaseLabel(4),
    title: "برش فنی و جزئیات",
    subtitle: "Technical Section & Detailing",
    description: "گذار زیرزمین، اتصال شیشه فریم‌لس و ناودان خطی",
  },
  {
    id: "presentation",
    index: 4,
    label: phaseLabel(5),
    title: "شیت ارائه و پیچ",
    subtitle: "Presentation Board & Pitch",
    description: "بیانیه دوزبانه شیت، متادیتا و فهرست تحویل",
  },
];

/** Ready-made briefs used by the landing dock and the engine dialog. */
export const BRIEF_PRESETS = [
  "ویلای معلق کردان با بتن اکسپوز",
  "کافه کتاب بیونیک اصفهان",
  "پاویون کورتن در حاشیه کویر",
  "گالری شیشه‌ای در جنگل هیرکانی",
  "مرکز پژوهش معماری با حیاط فرورفته",
] as const;

/* ------------------------------------------------------------------ */
/*  Lumens design DNA                                                 */
/* ------------------------------------------------------------------ */

export type MaterialId =
  | "silk-concrete"
  | "structural-glass"
  | "corten-bronze"
  | "microcement"
  | "shou-sugi-ban";

export interface LumensMaterial {
  id: MaterialId;
  nameFa: string;
  nameEn: string;
  roleFa: string;
  detailFa: string;
  /** Calibrated English fragment injected into every render prompt. */
  promptEn: string;
}

/**
 * The exclusive LUMENS material palette. Every sheet combines all five
 * entries; the typology only changes their proportions and applications.
 */
export const LUMENS_MATERIAL_DNA: readonly LumensMaterial[] = [
  {
    id: "silk-concrete",
    nameFa: "بتن اکسپوز ابریشمی مدولار",
    nameEn: "Silk Fair-Faced Modular Concrete",
    roleFa: "جرم، سایه و اینرسی حرارتی",
    detailFa: "قالب مدولار با سوراخ میلگرد مهار نمایان، درز ۱۲ میلی‌متری و پرداخت مات ابریشمی",
    promptEn:
      "silk fair-faced modular exposed concrete with visible formwork tie-rod holes and 12 mm board joints",
  },
  {
    id: "structural-glass",
    nameFa: "شیشه ساختاری فریم‌لس Low-E",
    nameEn: "Frameless Ultra-Clear Low-E Structural Glass",
    roleFa: "شفافیت و اتصال منظر",
    detailFa: "سه‌لایه Low-E، نشیمن فرورفته ۴۰ میلی‌متری، لبه پولیش و مولیون پنهان برنز",
    promptEn:
      "recessed frameless ultra-clear low-E structural glass with hidden dark bronze mullions",
  },
  {
    id: "corten-bronze",
    nameFa: "لوورهای خورشیدی برنز تیره و کورتن",
    nameEn: "Weathered Dark Bronze / Corten Solar Louvers",
    roleFa: "کنترل تابش و سایه‌سازی",
    detailFa: "لوورهای عمودی کورتن با پتینه طبیعی و اتصالات برنز مات بدون رنگ",
    promptEn:
      "weathered dark bronze and corten steel vertical solar louvers with natural patina",
  },
  {
    id: "microcement",
    nameFa: "میکروسمان کف",
    nameEn: "Seamless Microcement Flooring",
    roleFa: "کف یکپارچه و بازتاب نور",
    detailFa: "میکروسمان بدون درز، مات و ضدلک، هم‌سطح با ناودان خطی",
    promptEn: "seamless matte microcement flooring",
  },
  {
    id: "shou-sugi-ban",
    nameFa: "چوب سوخته شو-سوگی-بان",
    nameEn: "Shou Sugi Ban Charred Timber",
    roleFa: "گرما، بافت انسانی و آکوستیک",
    detailFa: "سطح ذغالی برس‌خورده با سه لایه روغن مات",
    promptEn: "charred shou sugi ban timber accents with brushed matte finish",
  },
];

/** Fixed three-tier zoning matrix of every Lumens project sheet. */
export const ZONING_MATRIX = [
  { id: "public", titleFa: "عمومی", titleEn: "Public", share: 25 },
  {
    id: "semi-public",
    titleFa: "نیمه‌عمومی / پژوهشی",
    titleEn: "Semi-Public / Research",
    share: 35,
  },
  { id: "specialized", titleFa: "تخصصی", titleEn: "Specialized", share: 40 },
] as const;

export type ZoningTierId = (typeof ZONING_MATRIX)[number]["id"];

/* ------------------------------------------------------------------ */
/*  Sheet structure                                                   */
/* ------------------------------------------------------------------ */

export interface ProgramZone {
  name: string;
  /** Square metres, already distributed inside its tier. */
  area: number;
  note: string;
}

export interface ZoningTier {
  id: ZoningTierId;
  titleFa: string;
  titleEn: string;
  /** Fixed percentage of the gross area (25 / 35 / 40). */
  share: number;
  area: number;
  zones: ProgramZone[];
  note: string;
}

export interface ConceptPhase {
  statement: string;
  zoning: ZoningTier[];
  circulation: {
    publicRoute: string;
    vertical: string;
    service: string;
  };
  climate: {
    siteFa: string;
    siteEn: string;
    climateFa: string;
    climateEn: string;
    altitude: string;
    orientation: string;
    strategies: string[];
  };
  keywords: string[];
}

export interface TectonicsPhase {
  massing: string;
  volumetricRule: string;
  courtyard: {
    titleFa: string;
    titleEn: string;
    dimensions: string;
    depth: string;
    roles: string[];
  };
  structure: {
    grid: string;
    span: string;
    floorHeight: string;
    material: string;
  };
  envelope: { titleFa: string; description: string }[];
}

export type RenderKind = "exterior-hero" | "interior-atrium" | "axonometric";

export interface RenderPrompt {
  id: RenderKind;
  titleFa: string;
  titleEn: string;
  purposeFa: string;
  cameraFa: string;
  /** Standalone photorealistic English prompt (FLUX.1 / SDXL / Midjourney). */
  prompt: string;
  negativePrompt: string;
  aspectRatio: RenderAspectRatio;
}

export interface TechnicalTransition {
  level: string;
  titleFa: string;
  note: string;
}

export interface TechnicalDetail {
  titleFa: string;
  titleEn: string;
  description: string;
  specEn: string;
}

export interface TechnicalPhase {
  section: string;
  transitions: TechnicalTransition[];
  details: TechnicalDetail[];
  drainage: string;
}

export interface PresentationPhase {
  titleFa: string;
  titleEn: string;
  statementFa: string;
  statementEn: string;
  pitchFa: string;
  pitchEn: string;
  deliverables: string[];
}

export interface SheetMetadata {
  /** Drawing scale of the presentation board, e.g. `۱:۲۰۰ · شیت A1`. */
  scale: string;
  area: number;
  levels: string;
  materials: string[];
  materialsEn: string[];
  climateFa: string;
  climateEn: string;
  zoning: { label: string; labelEn: string; percent: number }[];
}

export interface ArchitectureSheet {
  id: string;
  createdAt: string;
  brief: string;
  projectName: string;
  projectNameEn: string;
  typology: { id: TypologyId; labelFa: string; labelEn: string };
  location: {
    id: string;
    labelFa: string;
    labelEn: string;
    /** False when the brief carried no site signal and a base site was assumed. */
    detected: boolean;
  };
  concept: ConceptPhase;
  tectonics: TectonicsPhase;
  prompts: RenderPrompt[];
  technical: TechnicalPhase;
  presentation: PresentationPhase;
  metadata: SheetMetadata;
}

/* ------------------------------------------------------------------ */
/*  Typology profiles                                                 */
/* ------------------------------------------------------------------ */

export type TypologyId =
  | "villa"
  | "cafe-library"
  | "gallery"
  | "office"
  | "research"
  | "pavilion"
  | "adaptive";

interface TypologyProfile {
  id: TypologyId;
  labelFa: string;
  labelEn: string;
  nounFa: string;
  /** English noun phrase used inside render prompts. */
  enForm: string;
  /** Gross area used for the zoning matrix, in square metres. */
  totalArea: number;
  statement: string;
  public: string[];
  semiPublic: string[];
  specialized: string[];
  /** Short English summary for the board statement. */
  boardEn: string;
}

const TYPOLOGIES: readonly TypologyProfile[] = [
  {
    id: "villa",
    labelFa: "ویلا",
    labelEn: "Villa",
    nounFa: "ویلای",
    enForm: "monolithic concrete villa",
    totalArea: 420,
    statement:
      "حجم بتنی در دامنه می‌نشیند تا زمین را لمس کند و از آن جدا شود؛ گودال‌باغچه مرکزی، نور و هوای خنک را به قلب خانه می‌کشاند.",
    public: ["فویه و آستانه ورود", "نشیمن اصلی و پذیرایی"],
    semiPublic: ["آشپزخانه و غذاخوری", "استودیو کار", "تراس و گودال‌باغچه"],
    specialized: ["سوئیت خواب مستر", "اتاق‌های خواب خصوصی", "سرویس و رختکن", "تأسیسات و انبار"],
    boardEn: "a monolithic concrete villa stepping down the slope",
  },
  {
    id: "cafe-library",
    labelFa: "کافه کتاب",
    labelEn: "Café Library",
    nounFa: "کافه کتاب",
    enForm: "concrete cafe-library pavilion",
    totalArea: 320,
    statement:
      "کافه کتاب به‌مثابه ایوان شهری: قفسه‌ها در بتن حفر می‌شوند و نور از حیاط فرورفته به سالن مطالعه می‌رسد.",
    public: ["فویه و کافه‌بار", "سالن مطالعه مشترک"],
    semiPublic: ["کتابخانه باز و قفسه‌ها", "اتاق کار گروهی", "حیاط مطالعه"],
    specialized: ["آرشیو و مخزن کتاب", "دفتر مدیریت", "سرویس و آبدارخانه", "تأسیسات"],
    boardEn: "a concrete cafe-library with a reading courtyard",
  },
  {
    id: "gallery",
    labelFa: "گالری",
    labelEn: "Gallery",
    nounFa: "گالری",
    enForm: "structural glass and concrete gallery",
    totalArea: 560,
    statement:
      "گالری، جعبه‌ای خاموش برای هنر است؛ دیوارهای بتنی نور را کنترل می‌کنند و سقف نورگیر، اثر را در سکوت روشن نگه می‌دارد.",
    public: ["فویه و فروشگاه", "گالری اصلی"],
    semiPublic: ["گالری موقت و پروژه", "فضای رویداد و کارگاه"],
    specialized: ["مخزن آثار با کنترل اقلیم", "دفتر کیوریتور", "سرویس و امنیت", "تأسیسات"],
    boardEn: "a top-lit concrete gallery with a glass threshold",
  },
  {
    id: "office",
    labelFa: "مجموعه اداری",
    labelEn: "Office Campus",
    nounFa: "مجموعه اداری",
    enForm: "concrete portal-frame office campus",
    totalArea: 780,
    statement:
      "سازه به‌صورت پورتال‌های بتنی خوانا ظاهر می‌شود؛ فضاهای کار میان این پورتال‌ها و تراس‌های سبز آویخته می‌شوند.",
    public: ["لابی و پذیرش", "کافه کارکنان"],
    semiPublic: ["فضای کار باز", "اتاق جلسات شیشه‌ای", "تراس کار"],
    specialized: ["اتاق مدیران", "اتاق سرور و آرشیو", "سرویس و رختکن", "تأسیسات"],
    boardEn: "a concrete portal-frame office campus with planted terraces",
  },
  {
    id: "research",
    labelFa: "مرکز پژوهش",
    labelEn: "Research Center",
    nounFa: "مرکز پژوهش",
    enForm: "subterranean concrete research center",
    totalArea: 900,
    statement:
      "پژوهش به سکوت و نور یکنواخت نیاز دارد؛ بخش تخصصی در زیرزمین و پیرامون گودال‌باغچه می‌نشیند و لایه عمومی در تراز زمین می‌ماند.",
    public: ["فویه و گالری پژوهش", "سالن سخنرانی"],
    semiPublic: ["آزمایشگاه باز پژوهشی", "اتاق مطالعه مشترک", "حیاط فرورفته"],
    specialized: [
      "آزمایشگاه تخصصی با کنترل اقلیم",
      "اتاق داده و سرور",
      "دفتر پژوهشگران ارشد",
      "تأسیسات",
    ],
    boardEn: "a research center organized around a sunken research courtyard",
  },
  {
    id: "pavilion",
    labelFa: "پاویون",
    labelEn: "Pavilion",
    nounFa: "پاویون",
    enForm: "minimal concrete pavilion",
    totalArea: 160,
    statement:
      "پاویون، یک قاب و یک منظر است؛ سکوی بتنی معلق، زمین را لمس نمی‌کند و تراس چوبی، افق را امتداد می‌دهد.",
    public: ["سکوی ورودی", "فضای اصلی پاویون"],
    semiPublic: ["تراس منظر", "آستانه نیمه‌باز"],
    specialized: ["هسته خدماتی", "انبار تجهیزات"],
    boardEn: "a minimal concrete pavilion floating over the landscape",
  },
  {
    id: "adaptive",
    labelFa: "پروژه معاصر",
    labelEn: "Contemporary Project",
    nounFa: "پروژه",
    enForm: "contemporary concrete architecture project",
    totalArea: 480,
    statement:
      "برنامه فیزیکی بریف در سه لایه عمومی، نیمه‌خصوصی و تخصصی مرتب می‌شود؛ دیوارهای بتنی ثابت، پارتیشن‌های شیشه‌ای و پلان منعطف.",
    public: ["فویه و آستانه", "فضای گردهمایی"],
    semiPublic: ["فضای کار منعطف", "تراس و منظر"],
    specialized: ["هسته خدمات", "انبار و تأسیسات"],
    boardEn: "a flexible contemporary project with a layered program",
  },
];

/* ------------------------------------------------------------------ */
/*  Location profiles                                                 */
/* ------------------------------------------------------------------ */

interface LocationProfile {
  id: string;
  short: string;
  labelFa: string;
  labelEn: string;
  siteFa: string;
  siteEn: string;
  climateFa: string;
  climateEn: string;
  altitude: string;
  orientation: string;
  /** English light description injected into render prompts. */
  lightEn: string;
  strategies: string[];
}

const DEFAULT_LOCATION: LocationProfile = {
  id: "kordan",
  short: "کردان",
  labelFa: "کردان، البرز",
  labelEn: "Kordan, Alborz highlands",
  siteFa: "دامنه جنوبی البرز با شیب ۱۲٪ رو به دره",
  siteEn: "a south-facing Alborz foothill slope looking into the valley",
  climateFa: "سرد و نیمه‌خشک کوهپایه‌ای (BSk)",
  climateEn: "cold semi-arid highland climate (BSk)",
  altitude: "۱٬۸۵۰ متر از سطح دریا",
  orientation: "چرخش ۱۸ درجه از شمال به سمت دره",
  lightEn: "crisp highland light with long raking shadows over the valley",
  strategies: [
    "چرخش حجم به سمت دره برای گرفتن آفتاب زمستانی و کنترل باد غربی",
    "پوسته بتنی ضخیم و بام سبز برای اینرسی و تأخیر حرارتی",
    "گودال‌باغچه جنوبی برای نور زمستانی و خنکای تابستانی",
    "قطع پل حرارتی در محل اتصال کنسول به هسته بتنی",
  ],
};

const LOCATIONS: readonly LocationProfile[] = [
  DEFAULT_LOCATION,
  {
    id: "isfahan",
    short: "اصفهان",
    labelFa: "اصفهان، حاشیه زاینده‌رود",
    labelEn: "Isfahan, Zayandeh-Rud edge",
    siteFa: "زمین هموار در بافت فرهنگی اصفهان با محور شمالی-جنوبی",
    siteEn: "flat terrain inside the cultural fabric of Isfahan",
    climateFa: "بیابانی سرد و خشک (BWk)",
    climateEn: "cold desert climate (BWk)",
    altitude: "۱٬۵۷۵ متر از سطح دریا",
    orientation: "محور اصلی شمالی-جنوبی هم‌راستا با باد مطلوب",
    lightEn: "dry clear sky with intense horizontal light and sharp shadows",
    strategies: [
      "حیاط مرکزی و گودال‌باغچه برای سایه و رطوبت هوا",
      "بادگیر و دودکش حرارتی برای تهویه طبیعی",
      "دیوارهای بتنی ضخیم با بازشوهای کوچک رو به آفتاب تند",
      "ناودان و کانال آب برای نگهداشت آب باران اندک",
    ],
  },
  {
    id: "yazd",
    short: "یزد",
    labelFa: "یزد، حاشیه کویر",
    labelEn: "Yazd, central desert",
    siteFa: "حاشیه کویر با تابش تند و اختلاف دمای شبانه‌روزی بالا",
    siteEn: "desert edge with harsh radiation and a wide day-night swing",
    climateFa: "بیابانی گرم و خشک (BWh)",
    climateEn: "hot desert climate (BWh)",
    altitude: "۱٬۲۰۰ متر از سطح دریا",
    orientation: "پیروی از محور باد شمالی و سایه‌اندازی غربی",
    lightEn: "hard desert sun, dusty warm haze and deep-cut shadows",
    strategies: [
      "فرورفتن حجم در زمین برای استفاده از دمای پایدار خاک",
      "گودال‌باغچه سایه‌دار و کانال آب برای خنکای تبخیری",
      "لوورهای کورتن با فاصله کم برای کنترل تابش غرب",
      "پرده بتنی مشبک به‌جای بازشوی بزرگ",
    ],
  },
  {
    id: "tehran",
    short: "تهران",
    labelFa: "تهران، دامنه شمالی",
    labelEn: "Tehran, northern foothills",
    siteFa: "دامنه شمالی تهران با شیب متوسط و آلودگی هوا",
    siteEn: "a northern Tehran slope with moderate grade and urban smog",
    climateFa: "نیمه‌خشک معتدل (BSk)",
    climateEn: "temperate semi-arid climate (BSk)",
    altitude: "۱٬۶۰۰ متر از سطح دریا",
    orientation: "چرخش ۲۵ درجه برای گرفتن نور جنوب و دوری از باد شرقی",
    lightEn: "soft urban daylight filtered through mountain haze",
    strategies: [
      "گودال‌باغچه و پوسته گیاهی برای فیلتر گرد و غبار",
      "شیشه Low-E با مولیون پنهان و لوور کورتن برای کنترل تابش",
      "بازشوهای رو به شمال برای نور یکنواخت و بدون تابش",
      "دودکش حرارتی برای تخلیه هوای گرم از گودال",
    ],
  },
  {
    id: "hyrcanian",
    short: "هیرکانی",
    labelFa: "جنگل هیرکانی، مازندران",
    labelEn: "Hyrcanian forest, Mazandaran",
    siteFa: "جنگل هیرکانی با رطوبت بالا و شیب تند",
    siteEn: "a steep Hyrcanian forest site with high humidity",
    climateFa: "معتدل مرطوب خزری (Cfa)",
    climateEn: "humid Caspian temperate climate (Cfa)",
    altitude: "۴۵۰ متر از سطح دریا",
    orientation: "چرخش رو به شمال برای نور منتشر و دید به جنگل",
    lightEn: "diffuse green-filtered forest daylight with mist between the trees",
    strategies: [
      "کنسول بتنی برای حداقل دخالت در خاک جنگل",
      "سایه‌بان کورتن و بام سبز برای پوشش بارش ۱٬۲۰۰ میلی‌متری",
      "ناودان خطی و کانال نگهداشت آب در لبه تراس",
      "چوب سوخته برای دوام در رطوبت بالا",
    ],
  },
  {
    id: "south",
    short: "خلیج فارس",
    labelFa: "بندر جنوبی، خلیج فارس",
    labelEn: "southern port, Persian Gulf",
    siteFa: "خط ساحلی جنوب با رطوبت و تابش شدید",
    siteEn: "a southern coastline with high humidity and intense sun",
    climateFa: "بیابانی گرم و مرطوب ساحلی (BWh)",
    climateEn: "hot humid coastal climate (BWh)",
    altitude: "۱۰ متر از سطح دریا",
    orientation: "چرخش رو به دریا و سایه‌اندازی جنوبی",
    lightEn: "glaring coastal light with humid haze and bright water reflections",
    strategies: [
      "سایه‌انداز وسیع و پوسته دوجداره برای کنترل تابش",
      "گودال‌باغچه با سایه دائمی و کانال آب",
      "لوورهای کورتن برای هدایت نسیم دریا",
      "شیشه Low-E سه‌لایه برای کنترل حرارت و رطوبت",
    ],
  },
];

interface LocationRule {
  keywords: string[];
  location: LocationProfile;
}

const LOCATION_RULES: readonly LocationRule[] = [
  {
    keywords: ["کردان", "کرج", "البرز", "کوهپایه", "کوه", "kordan", "alborz"],
    location: DEFAULT_LOCATION,
  },
  { keywords: ["اصفهان", "زاینده", "نصف‌جهان", "isfahan"], location: LOCATIONS[1] },
  { keywords: ["یزد", "کویر", "بیابان", "طبس", "yazd", "desert"], location: LOCATIONS[2] },
  { keywords: ["تهران", "شمیران", "لواسان", "tehran"], location: LOCATIONS[3] },
  { keywords: ["هیرکانی", "جنگل", "مازندران", "hyrcanian", "forest"], location: LOCATIONS[4] },
  { keywords: ["خلیج فارس", "بندر", "ساحل", "کیش", "قشم", "coast", "gulf"], location: LOCATIONS[5] },
];

interface TypologyRule {
  keywords: string[];
  id: TypologyId;
}

const TYPOLOGY_RULES: readonly TypologyRule[] = [
  { keywords: ["ویلا", "خانه", "ویلایی", "villa", "house"], id: "villa" },
  { keywords: ["کافه", "کتاب", "کتابخانه", "cafe", "library"], id: "cafe-library" },
  { keywords: ["گالری", "موزه", "نمایشگاه", "gallery", "museum"], id: "gallery" },
  { keywords: ["اداری", "دفتر", "شرکت", "office", "workplace"], id: "office" },
  { keywords: ["پژوهش", "تحقیق", "آزمایشگاه", "research", "laboratory"], id: "research" },
  { keywords: ["پاویون", "غرفه", "پاویون", "pavilion"], id: "pavilion" },
];

function typologyOf(brief: string): TypologyProfile {
  const text = brief.toLowerCase();
  const match = TYPOLOGY_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return (
    TYPOLOGIES.find((profile) => profile.id === match?.id) ??
    TYPOLOGIES[TYPOLOGIES.length - 1]
  );
}

function locationOf(brief: string): { location: LocationProfile; detected: boolean } {
  const text = brief.toLowerCase();
  const match = LOCATION_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return match
    ? { location: match.location, detected: true }
    : { location: DEFAULT_LOCATION, detected: false };
}

/* ------------------------------------------------------------------ */
/*  Phase 1 - concept & spatial zoning                                */
/* ------------------------------------------------------------------ */

/** Splits a tier area across its zones, keeping the sum exact. */
function splitArea(total: number, count: number): number[] {
  if (count <= 0) return [];
  const each = Math.floor(total / count);
  const areas = Array.from({ length: count }, () => each);
  areas[count - 1] += total - each * count;
  return areas;
}

const TIER_NOTES: Record<ZoningTierId, string> = {
  public:
    "دسترسی آزاد از فویه، بدون کنترل دسترسی؛ نزدیک‌ترین لایه به زمین و منظر، با نور شمالی یکنواخت.",
  "semi-public":
    "لایه میانی پژوهش و همکاری؛ نیم‌باز به گودال‌باغچه، با پارتیشن شیشه‌ای آکوستیک و کنترل نرم دسترسی.",
  specialized:
    "لایه تخصصی و کنترل‌شده؛ در تراز فرورفته، با کنترل اقلیم، دسترسی مستقل و پشتیبانی تأسیسات.",
};

function buildZoning(template: TypologyProfile): ZoningTier[] {
  const programs: Record<ZoningTierId, string[]> = {
    public: template.public,
    "semi-public": template.semiPublic,
    specialized: template.specialized,
  };

  return ZONING_MATRIX.map((tier) => {
    const area = Math.round((template.totalArea * tier.share) / 100);
    const names = programs[tier.id].length > 0 ? programs[tier.id] : ["فضای پشتیبانی"];
    const areas = splitArea(area, names.length);

    return {
      id: tier.id,
      titleFa: tier.titleFa,
      titleEn: tier.titleEn,
      share: tier.share,
      area,
      note: TIER_NOTES[tier.id],
      zones: names.map((name, index) => ({
        name,
        area: areas[index],
        note:
          tier.id === "public"
            ? "تراز همکف · نور شمالی"
            : tier.id === "semi-public"
              ? "تراز همکف/فرورفته · دید به گودال"
              : "تراز فرورفته · کنترل اقلیم",
      })),
    };
  });
}

function buildConcept(
  template: TypologyProfile,
  location: LocationProfile,
  detected: boolean,
): ConceptPhase {
  const siteSentence = detected
    ? `سایت در ${location.labelFa} با ${location.siteFa} و اقلیم ${location.climateFa} شناخته می‌شود.`
    : `تا زمانی که داده دقیق سایت ارائه نشود، ${location.labelFa} به‌عنوان سایت مبنا در نظر گرفته شده است.`;

  const strategies = [
    ...location.strategies,
    "گودال‌باغچه (گودال‌باغچه) به‌عنوان موتور نور و خنکای تبخیری و دودکش حرارتی",
    "کانال نگهداشت آب باران در لبه تراس و تغذیه گیاهان بومی",
  ];

  return {
    statement: `${template.statement} ${siteSentence}`,
    zoning: buildZoning(template),
    circulation: {
      publicRoute:
        "مسیر عمومی از پل/سکوی بتنی ورودی آغاز می‌شود، از فویه می‌گذرد و پس از یک چرخش ملایم به گودال‌باغچه مرکزی می‌رسد؛ دیدها در طول مسیر کوتاه و قاب‌بندی‌شده‌اند.",
      vertical:
        "هسته بتنی پله و آسانسور شیشه‌ای در لبه شمالی حجم، با پاگردهای نورگیر و دید به حیاط فرورفته؛ ارتفاع هر طبقه ۳٫۶۰ متر.",
      service:
        "مسیر سرویس مستقل از پشت حجم با رمپ ۸٪ تا تراز −۳٫۶۰ برای بارگیری، زباله و دسترسی تأسیسات؛ بدون تلاقی با مسیر عمومی.",
    },
    climate: {
      siteFa: location.siteFa,
      siteEn: location.siteEn,
      climateFa: location.climateFa,
      climateEn: location.climateEn,
      altitude: location.altitude,
      orientation: location.orientation,
      strategies,
    },
    keywords: [
      template.labelFa,
      location.short,
      "گودال‌باغچه",
      "بتن اکسپوز ابریشمی",
      "پورتال بتنی",
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Phase 3 - calibrated render prompts                               */
/* ------------------------------------------------------------------ */

const NEGATIVE_PROMPT =
  "text, watermark, logo, signature, people, distorted perspective, warped reflections, oversaturated colors, cartoon, illustration, blurry, low contrast, cluttered background, duplicated geometry, fisheye distortion, plastic-looking materials, low-poly";

const AXONOMETRIC_NEGATIVE_PROMPT =
  "photograph, perspective camera, text, gibberish labels, watermark, logo, oversaturated colors, cluttered background, duplicated geometry, blurry, low contrast";

function lumensDnaSentence(): string {
  return LUMENS_MATERIAL_DNA.map((material) => material.promptEn).join(", ");
}

function buildPrompts(template: TypologyProfile, location: LocationProfile): RenderPrompt[] {
  const context = `${template.enForm} in ${location.siteEn} (${location.climateEn})`;
  const dna = lumensDnaSentence();
  const quality =
    "photorealistic architectural photography, razor sharp focus, natural depth of field, ultra detailed, 8k, magazine quality";

  return [
    {
      id: "exterior-hero",
      titleFa: "هیرو شات بیرونی",
      titleEn: "Exterior Hero Shot",
      purposeFa: "تصویر اصلی شیت و کاور ارائه؛ خوانش هم‌زمان حجم، متریال و اقلیم",
      cameraFa: "پرسپکتیو سه‌چهارم از پایین، ساعت طلایی، لنز ۲۴ میلی‌متر تیلت-شیفت",
      aspectRatio: "16:9",
      prompt: `Photorealistic exterior hero shot of a ${context}. Low-angle three-quarter perspective from the sunken courtyard rim at golden hour, long raking shadows across monolithic concrete portal frames, ${dna}, deep sunken courtyard with a still water retention channel, warm interior glow behind frameless glass, clear sky with light haze over the landscape. ${quality}, 24 mm tilt-shift lens, no people.`,
      negativePrompt: NEGATIVE_PROMPT,
    },
    {
      id: "interior-atrium",
      titleFa: "آتریوم مرکزی و حفره فرورفته",
      titleEn: "Interior Central Atrium / Sunken Void",
      purposeFa: "نمایش تجربه فضایی داخلی، نور منتشر و ارتباط ترازها با گودال‌باغچه",
      cameraFa: "چشم‌سطح در تراز پایین گودال، نور منتشر آسمان، لنز ۲۰ میلی‌متر",
      aspectRatio: "4:3",
      prompt: `Interior architectural photograph inside the central sunken atrium of a ${context}. Natural diffuse daylight falling from an open concrete oculus deep into the void, passive chimney-effect ventilation slots in the board-formed concrete walls, ${dna}, frameless structural glass balustrades with a dark bronze handrail, thin water film on the lower microcement floor, soft bounce light and calm minimal composition, no direct sun, no artificial spotlights. ${quality}, 20 mm lens, eye level at the lower level.`,
      negativePrompt: NEGATIVE_PROMPT,
    },
    {
      id: "axonometric",
      titleFa: "اکسونومتریک مفهومی منفجر",
      titleEn: "Conceptual Exploded Axonometric",
      purposeFa: "دیاگرام ساختار، لایه‌های متریال و حضور گودال‌باغچه برای صفحه تحلیلی",
      cameraFa: "اکسونومتریک منفجر، پروجکشن موازی، نورپردازی استودیوی خنثی",
      aspectRatio: "1:1",
      prompt: `Technical exploded axonometric diagram of a ${template.enForm}, orthographic parallel projection on a warm neutral light grey studio background. Layers float apart in order: monolithic concrete portal frame skeleton, sunken courtyard with water retention channel, frameless structural glass envelope, weathered dark bronze and corten solar louvers, microcement floor plates and charred shou sugi ban timber ceiling slats. Fine bronze annotation lines, minimal clean labels, 1:200 scale architecture presentation drawing, crisp vector-clean rendering, high detail, neutral studio lighting.`,
      negativePrompt: AXONOMETRIC_NEGATIVE_PROMPT,
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Phase 4 - technical section & detailing                           */
/* ------------------------------------------------------------------ */

function buildTechnical(
  template: TypologyProfile,
  location: LocationProfile,
): TechnicalPhase {
  return {
    section:
      `برش طولی شمال-جنوب در محور گودال‌باغچه: از تراز +۰٫۰۰ (${template.public[0] ?? "فویه"}) تا تراز −۳٫۶۰ (گالری فرورفته) و تراز −۷٫۲۰ (تأسیسات و آب‌بندی). مقطع نشان می‌دهد چگونه پورتال بتنی از پی تا بام یکپارچه ادامه می‌یابد، دیوار حائل گودال با پشت‌بند سنگریزه اجرا می‌شود و نور از دهانه بالای گودال تا کف میکروسمان پایین می‌آید. جهت‌گیری سایت: ${location.orientation}.`,
    transitions: [
      {
        level: "+۰٫۰۰",
        titleFa: "همکف / آستانه شیشه‌ای",
        note: "کف میکروسمان هم‌سطح با بیرون؛ شیشه فریم‌لس در نشیمن فرورفته بتنی، بدون آستانه و بدون اختلاف سطح.",
      },
      {
        level: "−۳٫۶۰",
        titleFa: "گالری فرورفته / گودال‌باغچه",
        note: "دیوار حائل بتنی اکسپوز با درز ۱۲ میلی‌متری؛ لایه زهکشی و پشت‌بند سنگریزه شسته در پشت دیوار.",
      },
      {
        level: "−۷٫۲۰",
        titleFa: "تأسیسات، آب‌بندی و نگهداشت آب",
        note: "کف شیب‌دار ۱٪ به سمت ناودان خطی؛ مخزن نگهداشت و پمپ تغذیه گیاهان بومی گودال.",
      },
    ],
    details: [
      {
        titleFa: "اتصال شیشه فریم‌لس در نشیمن فرورفته",
        titleEn: "Recessed Frameless Glass Sub-Frame Joint",
        description:
          "کانال U شکل فولادی گالوانیزه در عمق ۴۰ میلی‌متری نشیمن بتنی مدفون می‌شود؛ واشر EPDM دوگانه، سیلیکون ساختاری و درز حرکت ۱۲ میلی‌متری در هر دهانه. هیچ پروفیل آلومینیومی از نمای بیرونی دیده نمی‌شود.",
        specEn:
          "40 mm recessed U-channel, dual EPDM gasket, structural silicone, 12 mm movement joint per portal bay, no exposed aluminium.",
      },
      {
        titleFa: "دیوار حائل گودال‌باغچه و زهکشی",
        titleEn: "Sunken Courtyard Retaining Wall & Drainage",
        description:
          "دیوار بتنی مسلح با پرداخت اکسپوز در دو طرف؛ لایه تخته زهکشی ناودانی، ژئوتکستایل و سنگریزه شسته ۳۰۰ میلی‌متری، سپس خاک محل. آب جمع‌شده به کانال نگهداشت هدایت می‌شود.",
        specEn:
          "cast-in-place retaining wall, dimpled drainage board, geotextile, 300 mm washed gravel, discharge to retention channel.",
      },
      {
        titleFa: "ناودان خطی آب‌های سطحی",
        titleEn: "Linear Stormwater Gutter",
        description:
          "ناودان خطی استیل ۱۵۰ میلی‌متری با توری قابل برداشت در لبه کف میکروسمان؛ شیب ۱٪ و اتصال به کانال باز، بدون لوله نمایان در نما.",
        specEn:
          "150 mm stainless linear gutter, removable grate, 1% slope, connected to the open retention channel.",
      },
      {
        titleFa: "قطع پل حرارتی دال و کنسول",
        titleEn: "Slab & Cantilever Thermal Break",
        description:
          "بلوک قطع پل حرارتی در لبه دال کنسول و در محل اتصال بال معلق به هسته بتنی؛ نبشی فولادی ضدزنگ با جداکننده الاستومری برای انتقال برش.",
        specEn:
          "structural thermal break block at the slab edge, stainless steel angle with elastomeric separator for shear transfer.",
      },
    ],
    drainage:
      "آب باران از بام سبز و تراس‌ها به ناودان‌های خطی لبه تراس، سپس به کانال باز گودال‌باغچه و مخزن نگهداشت ۱۲ مترمکعبی هدایت می‌شود؛ سرریز به شبکه شهری و مصرف آب ذخیره‌شده برای آبیاری گیاهان بومی.",
  };
}

/* ------------------------------------------------------------------ */
/*  Phase 5 - presentation board & pitch                              */
/* ------------------------------------------------------------------ */

function buildPresentation(
  template: TypologyProfile,
  location: LocationProfile,
  projectNameFa: string,
  projectNameEn: string,
  totalArea: number,
): PresentationPhase {
  return {
    titleFa: `شیت ارائه ${projectNameFa}`,
    titleEn: `${projectNameEn} - Presentation Sheet`,
    statementFa:
      `«${projectNameFa}» در ${location.labelFa} یک ${template.labelFa} با مساحت ناخالص ${toPersianDigits(totalArea)} مترمربع است که برنامه فیزیکی را در سه لایه ۲۵٪ عمومی، ۳۵٪ نیمه‌عمومی/پژوهشی و ۴۰٪ تخصصی سازمان می‌دهد. بتن اکسپوز ابریشمی با سوراخ‌های قالب، سازه و نما را یکی می‌کند؛ شیشه ساختاری فریم‌لس منظر را به داخل می‌آورد؛ گودال‌باغچه، نور و خنکای اقلیم ${location.climateFa} را به عمق زمین می‌برد.`,
    statementEn:
      `"${projectNameEn}" is a ${template.labelEn.toLowerCase()} of ${totalArea} m² gross in ${location.labelEn}, organized as 25% public, 35% semi-public/research and 40% specialized program. Silk fair-faced concrete turns structure into facade, recessed frameless structural glass dissolves the boundary to the landscape, and a deep sunken courtyard (gudāl-bāghcheh) carries daylight and passive cooling into the subterranean level.`,
    pitchFa:
      "این شیت نشان می‌دهد چگونه یک تصمیم واحد - فرورفتن زمین در مرکز - هم نور، هم تهویه و هم سازمان فضایی را حل می‌کند. سه رندر کالیبره‌شده و یک اکسونومتریک منفجر، مسیر از کانسپت تا جزئیات اجرایی را در یک صفحه روایت می‌کنند.",
    pitchEn:
      "One move - sinking the ground at the centre - resolves daylight, ventilation and spatial hierarchy at once. Three calibrated renders and one exploded axonometric carry the story from concept to construction detail on a single board.",
    deliverables: [
      "پلان همکف و تراز فرورفته ۱:۲۰۰",
      "برش طولی و چهار جزئیات اجرایی ۱:۲۰",
      "هیرو شات بیرونی و آتریوم داخلی (رندر FLUX)",
      "اکسونومتریک منفجر لایه‌های متریال",
      "دیاگرام پهنه‌بندی ۲۵/۳۵/۴۰ و اقلیم",
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/** Small FNV-1a hash so identical briefs keep an identical sheet id. */
function hashBrief(brief: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < brief.length; index += 1) {
    hash ^= brief.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

/**
 * Synchronous core of the engine. Deterministic for a given brief, so the API
 * route can answer instantly and tests never need to wait for a timer.
 *
 * @throws Error when the brief is shorter than 3 characters.
 */
export function buildArchitectureSheet(brief: string): ArchitectureSheet {
  const trimmed = brief.trim().replace(/\s+/g, " ");

  if (trimmed.length < 3) {
    throw new Error("بریف پروژه را با حداقل سه حرف بنویسید تا موتور بتواند آن را تحلیل کند.");
  }

  const template = typologyOf(trimmed);
  const { location, detected } = locationOf(trimmed);
  const projectName = `${template.nounFa} ${location.short}`.trim();
  const projectNameEn = `${template.labelEn}, ${location.labelEn}`;
  const totalArea = template.totalArea;

  const concept = buildConcept(template, location, detected);
  const tectonics = buildTectonics(template, location);
  const prompts = buildPrompts(template, location);
  const technical = buildTechnical(template, location);
  const presentation = buildPresentation(
    template,
    location,
    projectName,
    projectNameEn,
    totalArea,
  );

  return {
    id: `sheet-${hashBrief(trimmed)}`,
    createdAt: new Date().toISOString(),
    brief: trimmed,
    projectName,
    projectNameEn,
    typology: { id: template.id, labelFa: template.labelFa, labelEn: template.labelEn },
    location: {
      id: location.id,
      labelFa: location.labelFa,
      labelEn: location.labelEn,
      detected,
    },
    concept,
    tectonics,
    prompts,
    technical,
    presentation,
    metadata: {
      scale: `۱:۲۰۰ · شیت A1`,
      area: totalArea,
      levels: "همکف + گودال‌باغچه + زیرزمین",
      materials: LUMENS_MATERIAL_DNA.map((material) => material.nameFa),
      materialsEn: LUMENS_MATERIAL_DNA.map((material) => material.nameEn),
      climateFa: `${location.climateFa} · ${location.altitude}`,
      climateEn: location.climateEn,
      zoning: ZONING_MATRIX.map((tier) => ({
        label: tier.titleFa,
        labelEn: tier.titleEn,
        percent: tier.share,
      })),
    },
  };
}

/** Localised, ICU-safe timestamp for the sheet header. */
export function formatSheetTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return iso.slice(0, 16).replace("T", " · ");
  }
}

/**
 * Plain-text export of the whole 5-phase sheet (copy button + `.txt` download).
 * Includes the calibrated English prompts so they can be pasted directly into
 * FLUX.1 / SDXL / Midjourney.
 */
export function formatSheetBrief(sheet: ArchitectureSheet): string {
  const { concept, tectonics, prompts, technical, presentation, metadata } = sheet;
  const lines: string[] = [
    "LUMENS — شیت پروژه معماری (۵ فاز)",
    "=".repeat(46),
    `پروژه: ${sheet.projectName}`,
    `Project: ${sheet.projectNameEn}`,
    `تایپولوژی: ${sheet.typology.labelFa} (${sheet.typology.labelEn})`,
    `سایت: ${sheet.location.labelFa}${sheet.location.detected ? "" : " (سایت فرضی)"}`,
    `بریف: ${sheet.brief}`,
    `تاریخ: ${formatSheetTimestamp(sheet.createdAt)}`,
    "",
    "فاز ۱ — کانسپت و پهنه‌بندی فضایی / Concept & Spatial Zoning",
    concept.statement,
    "ماتریس سه‌سطحی:",
    ...concept.zoning.map(
      (tier) =>
        `  - ${tier.titleFa} (${tier.titleEn}) ${toPersianDigits(tier.share)}٪ | ${toPersianDigits(
          tier.area,
        )} م² | ${tier.note}`,
    ),
    ...concept.zoning.flatMap((tier) =>
      tier.zones.map(
        (zone) => `    · ${tier.titleFa} / ${zone.name}: ${toPersianDigits(zone.area)} م² (${zone.note})`,
      ),
    ),
    `گردش عمومی: ${concept.circulation.publicRoute}`,
    `گردش عمودی: ${concept.circulation.vertical}`,
    `سرویس: ${concept.circulation.service}`,
    `اقلیم: ${concept.climate.climateFa} | ${concept.climate.altitude} | ${concept.climate.orientation}`,
    "راهبرد اقلیمی:",
    ...concept.climate.strategies.map((strategy) => `  - ${strategy}`),
    "",
    "فاز ۲ — فرم و تکتونیک / Form & Tectonics",
    `حجم‌گذاری: ${tectonics.massing}`,
    `قاعده حجم: ${tectonics.volumetricRule}`,
    `گودال‌باغچه: ${tectonics.courtyard.titleFa} (${tectonics.courtyard.titleEn}) — ${tectonics.courtyard.dimensions}، عمق ${tectonics.courtyard.depth}`,
    ...tectonics.courtyard.roles.map((role) => `  - ${role}`),
    `سازه: ${tectonics.structure.grid} | ${tectonics.structure.span} | ${tectonics.structure.floorHeight} | ${tectonics.structure.material}`,
    "پوسته:",
    ...tectonics.envelope.map((item) => `  - ${item.titleFa}: ${item.description}`),
    "",
    "فاز ۳ — پرامپت‌های رندر کالیبره‌شده / Calibrated Render Prompts",
    ...prompts.flatMap((prompt) => [
      `[${prompt.titleFa} / ${prompt.titleEn}] نسبت ${prompt.aspectRatio} — ${prompt.cameraFa}`,
      prompt.prompt,
      `NEGATIVE: ${prompt.negativePrompt}`,
      "",
    ]),
    "فاز ۴ — برش فنی و جزئیات / Technical Section & Detailing",
    technical.section,
    ...technical.transitions.map((transition) => `  - ${transition.level}: ${transition.titleFa} — ${transition.note}`),
    "جزئیات:",
    ...technical.details.map(
      (detail) => `  - ${detail.titleFa} (${detail.titleEn}): ${detail.description} [${detail.specEn}]`,
    ),
    `زهکشی: ${technical.drainage}`,
    "",
    "فاز ۵ — شیت ارائه و پیچ / Presentation Board & Pitch",
    `${presentation.titleFa} · ${presentation.titleEn}`,
    presentation.statementFa,
    presentation.statementEn,
    presentation.pitchFa,
    presentation.pitchEn,
    "تحویل‌دادنی‌ها:",
    ...presentation.deliverables.map((item) => `  - ${item}`),
    "",
    `مقیاس: ${metadata.scale} | مساحت: ${toPersianDigits(metadata.area)} م² | ترازها: ${metadata.levels}`,
    `متریال: ${metadata.materials.join("، ")}`,
    `Materials: ${metadata.materialsEn.join(", ")}`,
    `اقلیم: ${metadata.climateFa}`,
    "",
    "تولیدشده توسط LUMENS AI Architecture Engine · lumens.archi",
  ];

  return lines.join("\n");
}

/** Safe filename for the exported `.txt` sheet. */
export function buildSheetFilename(sheet: ArchitectureSheet): string {
  return `lumens-sheet-${sheet.id.replace(/[^a-z0-9-]/gi, "")}.txt`;
}

function buildTectonics(template: TypologyProfile, location: LocationProfile): TectonicsPhase {
  return {
    massing: `یک حجم بتنی مونولیت که از ${location.siteFa} پیروی می‌کند و در میانه به دو بال شکسته می‌شود؛ بال جنوبی در تراز زمین می‌ماند و بال تخصصی در گودال‌باغچه فرومی‌رود تا ارتفاع بصری حجم کم و مقیاس انسانی حفظ شود.`,
    volumetricRule:
      "قاعده حجم: هر بال تنها یک دهانه بزرگ دارد و بقیه نما با بتن یا لوور بسته می‌شود؛ سقف‌ها دال بتنی با لبه نازک ۲۰۰ میلی‌متری و بدون قرنیز اجرا می‌شوند.",
    courtyard: {
      titleFa: "گودال‌باغچه مرکزی",
      titleEn: "Sunken Courtyard",
      dimensions: "۱۸ × ۱۲ متر با لبه‌های نامنظم و پله‌های بتنی یکپارچه",
      depth: "۳٫۶۰ متر فرورفتگی تا تراز گالری زیرزمینی",
      roles: [
        "نور یکنواخت و منتشر برای تراز فرورفته بدون تابش مستقیم",
        "دودکش حرارتی: هوای گرم از بالای گودال تخلیه و هوای خنک از سایه وارد می‌شود",
        "کانال نگهداشت آب باران در لبه پایین و بازتاب نور بر بتن",
        "امتداد منظر: یک درخت بومی و کف میکروسمان تا لبه آب",
      ],
    },
    structure: {
      grid: "شبکه ۶٫۰۰ × ۶٫۰۰ متر از پورتال‌های بتنی مونولیت با دیوار برشی در هسته",
      span: "دهانه آزاد ۶ متر در پورتال‌ها و کنسول ۴٫۵ متری بال معلق",
      floorHeight: "۳٫۶۰ متر خالص با دال ۳۵۰ میلی‌متری و فضای تأسیسات ۴۵۰ میلی‌متری",
      material: "بتن مسلح C35 با پرداخت اکسپوز ابریشمی و درزهای قالبی ۱۲ میلی‌متری",
    },
    envelope: [
      {
        titleFa: "پوسته بتن اکسپوز مدولار",
        description:
          "سوراخ‌های میلگرد مهار با شبکه منظم و درزهای قالبی به‌عنوان تنها آرایه نما؛ هیچ روکش یا رنگ اضافه‌ای مجاز نیست.",
      },
      {
        titleFa: "شیشه ساختاری فریم‌لس Low-E",
        description:
          "شیشه سه‌لایه با نشیمن فرورفته ۴۰ میلی‌متری در بتنی که لبه شیشه را می‌پوشاند؛ فریم آلومینیومی دیده نمی‌شود.",
      },
      {
        titleFa: "لوورهای خورشیدی کورتن و برنز",
        description:
          "لوورهای عمودی با فاصله متغیر در جبهه غربی؛ پتینه طبیعی بخشی از زبان طراحی است و نه نقص اجرا.",
      },
      {
        titleFa: "چوب سوخته و میکروسمان",
        description:
          "شو-سوگی-بان در سقف‌های آکوستیک و کف تراس؛ میکروسمان بدون درز در کف‌های داخلی و هم‌سطح با ناودان خطی.",
      },
    ],
  };
}

