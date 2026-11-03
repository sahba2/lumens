import type {
  Article,
  Course,
  CourseCategory,
  CourseSoftware,
  FaqItem,
  FilterOption,
  KeywordFeature,
  Level,
  Model3D,
  ObjectCategory,
  PromptItem,
  Stat,
  Testimonial,
  WorkflowStep,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Filter taxonomies                                                  */
/* ------------------------------------------------------------------ */

export const objectTabs: FilterOption<"all" | ObjectCategory>[] = [
  { id: "all", label: "همه مدل‌ها" },
  { id: "interior", label: "مدل‌های داخلی" },
  { id: "exterior", label: "مدل‌های خارجی" },
  { id: "furniture", label: "مبلمان" },
];

export const courseCategories: FilterOption<"all" | CourseCategory>[] = [
  { id: "all", label: "همه دسته‌ها" },
  { id: "ai-design", label: "هوش مصنوعی در معماری" },
  { id: "prompt", label: "پرامپت‌نویسی" },
  { id: "render", label: "رندرینگ لحظه‌ای" },
  { id: "workflow", label: "گردش کار AI" },
  { id: "modeling", label: "مدل‌سازی سه‌بعدی" },
  { id: "business", label: "کسب‌وکار و برندینگ" },
];

/** Software tracks rendered as the first row of tabs on `/courses`. */
export const courseSoftwareTabs: FilterOption<"all" | CourseSoftware>[] = [
  { id: "all", label: "همه" },
  { id: "3ds-max", label: "3ds Max" },
  { id: "revit", label: "Revit" },
  { id: "rhino", label: "Rhino" },
  { id: "grasshopper", label: "Grasshopper" },
  { id: "lumion", label: "Lumion" },
  { id: "blender", label: "Blender" },
  { id: "sketchup", label: "SketchUp" },
  { id: "ai-architecture", label: "AI & Architecture" },
];

/** Human readable name of every software track (cards, dialog and search). */
export const softwareLabels: Record<CourseSoftware, string> = {
  "3ds-max": "3ds Max",
  revit: "Revit",
  rhino: "Rhino",
  grasshopper: "Grasshopper",
  lumion: "Lumion",
  blender: "Blender",
  sketchup: "SketchUp",
  "ai-architecture": "AI & Architecture",
};

export const levels: FilterOption<"all" | Level>[] = [
  { id: "all", label: "همه سطوح" },
  { id: "مبتدی", label: "مبتدی" },
  { id: "متوسط", label: "متوسط" },
  { id: "پیشرفته", label: "پیشرفته" },
];

export const articleCategories = [
  "همه مقالات",
  "هوش مصنوعی و معماری",
  "پرامپت‌نویسی",
  "رندرینگ",
  "گردش کار",
  "ابزارها",
  "آینده و سئو",
] as const;

export const promptCategories = [
  "همه پرامپت‌ها",
  "فرم و حجم",
  "نما و پوسته",
  "نورپردازی",
  "متریال و بافت",
  "پلان و دیاگرام",
  "فضای داخلی",
] as const;

/* ------------------------------------------------------------------ */
/*  Courses                                                            */
/* ------------------------------------------------------------------ */

export const courses: Course[] = [
  {
    id: "c-01",
    title: "هوش مصنوعی در معماری؛ از ایده تا فرم",
    category: "ai-design",
    categoryLabel: "هوش مصنوعی در معماری",
    software: ["ai-architecture"],
    level: "مبتدی",
    hours: 12,
    lessonCount: 26,
    price: 2900000,
    isFree: false,
    rating: 4.9,
    students: 3120,
    instructor: "مهندس آرین رادمهر",
    summary:
      "مبانی نظری و عملی تولید فرم معماری با هوش مصنوعی؛ از تحلیل سایت و دیاگرام مفهومی تا رسیدن به فرم نهایی قابل ارائه.",
    highlights: [
      "تولید ۴۰ دیاگرام مفهومی در یک روز کاری",
      "ساخت کتابخانه سبک شخصی (Style Library)",
      "تمرین روی سه پروژه واقعی مسکونی، فرهنگی و اداری",
      "کار با Midjourney، ChatGPT و Vizcom",
    ],
    tags: ["Midjourney", "Concept", "ChatGPT"],
    palette: ["#f4dfa4", "#8f6f22"],
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=BmcqcRq0Q5o",
    lessons: [
      {
        id: "c-01-l-01",
        title: "از ایده تا کانسپت؛ معرفی موتور ایده‌پرداز",
        duration: "۱۶ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "چگونه یک بریف کوتاه را به دیاگرام مفهومی تبدیل کنیم.",
        isPreview: true,
      },
      {
        id: "c-01-l-02",
        title: "تحلیل سایت و اقلیم با کمک هوش مصنوعی",
        duration: "۲۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "استخراج جهت‌گیری، تابش و محدودیت‌های بافت در قالب پرامپت.",
      },
      {
        id: "c-01-l-03",
        title: "تولید فرم و واریاسیون‌های حجمی",
        duration: "۲۶ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "ساخت کتابخانه سبک شخصی و تولید ۲۰ واریاسیون کنترل‌شده.",
      },
      {
        id: "c-01-l-04",
        title: "متریال، نور و اتمسفر سینمایی",
        duration: "۱۹ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "پالت بتن اکسپوز، شیشه ساختاری، کورتن و برنز مات.",
      },
      {
        id: "c-01-l-05",
        title: "تحویل شیت نهایی و ارائه به کارفرما",
        duration: "۲۴ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "چیدمان شیت A1، دیاگرام‌های تحلیلی و روایت پروژه.",
      },
    ],
  },
  {
    id: "c-02",
    title: "پرامپت‌نویسی حرفه‌ای معماری",
    category: "prompt",
    categoryLabel: "پرامپت‌نویسی",
    software: ["ai-architecture"],
    level: "متوسط",
    hours: 8,
    lessonCount: 18,
    price: 1850000,
    isFree: false,
    rating: 4.8,
    students: 2470,
    instructor: "نگار سلطانی",
    summary:
      "ساختار دقیق پرامپت معماری: توصیف فرم، متریال، نور، لنز دوربین و کنترل پرسپکتیو برای رسیدن به خروجی قابل استفاده در ارائه.",
    highlights: [
      "الگوی آماده LUMENS Prompt Framework",
      "کنترل پرسپکتیو، لنز و قاب‌بندی سینمایی",
      "منفی‌پرامپت‌های تخصصی معماری",
      "ساخت پرامپت اختصاصی برای پروژه خودتان",
    ],
    tags: ["Prompt", "Midjourney", "ControlNet"],
    palette: ["#a5f3fc", "#0e7490"],
    popular: true,
  },
  {
    id: "c-03",
    title: "رندرینگ لحظه‌ای با Stable Diffusion و ComfyUI",
    category: "render",
    categoryLabel: "رندرینگ لحظه‌ای",
    software: ["ai-architecture"],
    level: "پیشرفته",
    hours: 16,
    lessonCount: 32,
    price: 3450000,
    isFree: false,
    rating: 5,
    students: 1890,
    instructor: "مهندس کیان مرادی",
    summary:
      "راه‌اندازی کامل پایپ‌لاین رندر لحظه‌ای: از اسکچ‌رندر و ControlNet تا Upscale و پست‌پروداکشن نهایی در چند ثانیه.",
    highlights: [
      "نصب و بهینه‌سازی ComfyUI روی سیستم شخصی",
      "ControlNet Depth، Canny و Lineart برای وفاداری به مدل",
      "رندر واریاسیون در ۸ ثانیه با SDXL Turbo",
      "تحویل خروجی ۴K با Upscaler تخصصی",
    ],
    tags: ["Stable Diffusion", "ComfyUI", "ControlNet"],
    palette: ["#c4b5fd", "#4c1d95"],
    popular: true,
  },
  {
    id: "c-04",
    title: "گردش کار AI: از کروکی تا ارائه نهایی",
    category: "workflow",
    categoryLabel: "گردش کار AI",
    software: ["ai-architecture", "revit", "rhino"],
    level: "متوسط",
    hours: 10,
    lessonCount: 22,
    price: 2380000,
    isFree: false,
    rating: 4.7,
    students: 1640,
    instructor: "مهندس سارا نیک‌آیین",
    summary:
      "طراحی یک گردش کار حرفه‌ای و تکرارپذیر که هوش مصنوعی را به‌جای جایگزین، دستیار دقیق استودیوی شما می‌کند.",
    highlights: [
      "نقشه راه ۷ مرحله‌ای پروژه‌های AI-First",
      "ساخت فایل‌های پرست و استاندارد تحویل",
      "اتصال AI به اسکچ‌آپ، راینو و رویت",
      "چک‌لیست کنترل کیفیت قبل از ارائه به کارفرما",
    ],
    tags: ["Workflow", "Rhino", "Revit"],
    palette: ["#a7f3d0", "#065f46"],
    popular: false,
  },
];

export const moreCourses: Course[] = [
  {
    id: "c-05",
    title: "مدل‌سازی و بهینه‌سازی آبجکت‌های سه‌بعدی",
    category: "modeling",
    categoryLabel: "مدل‌سازی سه‌بعدی",
    software: ["3ds-max"],
    level: "متوسط",
    hours: 14,
    lessonCount: 28,
    price: 2650000,
    isFree: false,
    rating: 4.8,
    students: 1320,
    instructor: "مهندس بردیا کاشانی",
    summary:
      "ساخت آبجکت‌های سبک، تمیز و آماده فروش برای بازار؛ همراه با آموزش توپولوژی، UV و آماده‌سازی فایل‌های نمایشی.",
    highlights: [
      "توپولوژی بهینه برای رندر و انیمیشن",
      "ساخت تکسچر PBR و متریال واقع‌گرا",
      "آماده‌سازی خروجی FBX/OBJ/GLTF",
      "قیمت‌گذاری و فروش آبجکت در مارکت‌پلیس‌ها",
    ],
    tags: ["Blender", "Topology", "PBR"],
    palette: ["#fda4af", "#7f1d1d"],
    popular: false,
  },
  {
    id: "c-06",
    title: "نورپردازی و متریال‌سازی حرفه‌ای با AI",
    category: "render",
    categoryLabel: "رندرینگ لحظه‌ای",
    software: ["3ds-max", "ai-architecture"],
    level: "پیشرفته",
    hours: 9,
    lessonCount: 20,
    price: 2120000,
    isFree: false,
    rating: 4.9,
    students: 980,
    instructor: "مهندس کیان مرادی",
    summary:
      "کنترل دقیق نور مصنوعی و طبیعی، ساخت متریال‌های اختصاصی و رسیدن به اتمسفر سینمایی در تصاویر معماری.",
    highlights: [
      "طراحی نورپردازی شب، غروب و روز ابری",
      "ساخت متریال اختصاصی با Text-to-Texture",
      "رندر پرتره‌ای از فضاهای داخلی",
      "رفع ایرادهای رایج نور و کنتراست",
    ],
    tags: ["Lighting", "Material", "Cinematic"],
    palette: ["#fdba74", "#7c2d12"],
    popular: true,
  },
  {
    id: "c-07",
    title: "پلان، دیاگرام و اینفوگرافیک هوشمند",
    category: "ai-design",
    categoryLabel: "هوش مصنوعی در معماری",
    software: ["ai-architecture"],
    level: "مبتدی",
    hours: 7,
    lessonCount: 16,
    price: 0,
    isFree: true,
    rating: 4.6,
    students: 5210,
    instructor: "نگار سلطانی",
    summary:
      "دوره رایگان LUMENS برای تولید دیاگرام‌های تحلیلی، پلان‌های شماتیک و اینفوگرافیک‌های ارائه با کمک هوش مصنوعی.",
    highlights: [
      "تولید دیاگرام سایت و مسیر حرکت",
      "پلان‌های شماتیک رنگی و قابل ارائه",
      "اینفوگرافیک آماری پروژه",
      "کاملاً رایگان و پروژه‌محور",
    ],
    tags: ["Diagram", "Free", "Presentation"],
    palette: ["#bfdbfe", "#1e3a8a"],
    popular: true,
  },
  {
    id: "c-08",
    title: "کسب‌وکار معماری با AI؛ برندینگ و فروش",
    category: "business",
    categoryLabel: "کسب‌وکار و برندینگ",
    software: ["ai-architecture"],
    level: "متوسط",
    hours: 6,
    lessonCount: 14,
    price: 1480000,
    isFree: false,
    rating: 4.7,
    students: 760,
    instructor: "مهندس سارا نیک‌آیین",
    summary:
      "از مهارت به درآمد: ساخت هویت بصری، نمونه‌کار حرفه‌ای، قیمت‌گذاری خدمات AI و جذب کارفرمای بین‌المللی.",
    highlights: [
      "ساخت پورتفولیوی AI-First",
      "قیمت‌گذاری خدمات رندر و دیاگرام",
      "بازاریابی در اینستاگرام و لینکدین",
      "قرارداد و تحویل امن فایل به کارفرما",
    ],
    tags: ["Business", "Branding", "Freelance"],
    palette: ["#e9d5ff", "#581c87"],
    popular: false,
  },
  {
    // --------------------------------------------------------------
    //  الگوی دورهٔ جدید: فقط مقادیر را عوض کنید (id یکتا بماند).
    // --------------------------------------------------------------
    id: "c-09",
    title: "طراحی نما و پوستهٔ ساختمان با هوش مصنوعی",
    category: "ai-design",
    categoryLabel: "هوش مصنوعی در معماری",
    software: ["ai-architecture"],
    level: "متوسط",
    hours: 11,
    lessonCount: 24,
    price: 1980000, // تومان — برای دورهٔ رایگان: price: 0 و isFree: true
    isFree: false,
    rating: 4.8,
    students: 420,
    instructor: "مهندس نیلوفر احمدی",
    summary:
      "از تحلیل بافت شهری و انتخاب متریال تا تولید واریاسیون‌های نما و تحویل فایل اجرایی؛ طراحی پوستهٔ ساختمان با کمک هوش مصنوعی.",
    highlights: [
      "تحلیل نما در مقیاس شهری و استخراج زبان فرم",
      "تولید ۲۰ واریاسیون پوسته با متریال واقعی",
      "کنترل هندسه و آماده‌سازی فایل اجرایی نما",
      "ارائهٔ حرفه‌ای نما به کارفرما و شهرداری",
    ],
    tags: ["Facade", "Material", "Midjourney"],
    palette: ["#99f6e4", "#134e4a"],
    popular: false,
    // لینک پیش‌نمایش دوره: فایل محلی داخل public/videos یا آدرس بیرونی (YouTube/Aparat/…)
    videoUrl: "/videos/c-09-preview.mp4",
  },
  {
    id: "c-10",
    title: "دوره جامع تری‌دی‌مکس و مدل‌سازی معماری",
    category: "modeling",
    categoryLabel: "مدل‌سازی سه‌بعدی",
    software: ["3ds-max"],
    level: "مبتدی",
    hours: 24,
    lessonCount: 28,
    price: 3850000,
    isFree: false,
    rating: 4.9,
    students: 2840,
    instructor: "مهندس بردیا کاشانی",
    summary:
      "از نصب و راه‌اندازی تری‌دی‌مکس تا مدل‌سازی کامل یک ویلای دوطبقه؛ همراه با اصول توپولوژی، Unwrap، دوربین و آماده‌سازی فایل برای رندر حرفه‌ای.",
    highlights: [
      "مدل‌سازی پلان تا حجم از نقشه اتوکد",
      "توپولوژی تمیز و آماده برای رندر و انیمیشن",
      "ساخت متریال PBR و نورپردازی صحنه",
      "مدیریت فایل، لایه‌ها و خروجی استاندارد استودیو",
    ],
    tags: ["3ds Max", "Modeling", "ArchViz"],
    palette: ["#f4dfa4", "#8f6f22"],
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=BmcqcRq0Q5o",
    lessons: [
      {
        id: "c-10-l-01",
        title: "معرفی دوره و راه‌اندازی تری‌دی‌مکس",
        duration: "۱۴ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "آشنایی با محیط، تنظیم واحدها و ساخت پروژه معماری.",
        isPreview: true,
      },
      {
        id: "c-10-l-02",
        title: "ورود نقشه اتوکد و مدل‌سازی سازه",
        duration: "۲۱ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "مدل‌سازی دیوار، کف و سقف از پلان اجرایی.",
      },
      {
        id: "c-10-l-03",
        title: "مدل‌سازی فضاهای داخلی و کابینت",
        duration: "۱۵ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "ساخت جزئیات داخلی، کابینت و بازشوها.",
      },
      {
        id: "c-10-l-04",
        title: "مدل‌سازی نما و حجم بیرونی",
        duration: "۷ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "از پلان تا حجم نهایی ساختمان.",
      },
      {
        id: "c-10-l-05",
        title: "متریال‌دهی، دوربین و تحویل فایل",
        duration: "۱۸ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "تکسچر، متریال PBR و تنظیم دوربین برای رندر.",
      },
    ],
  },
  {
    id: "c-11",
    title: "آموزش مدل‌سازی BIM و فاز ۲ با رویت",
    category: "modeling",
    categoryLabel: "مدل‌سازی سه‌بعدی",
    software: ["revit"],
    level: "متوسط",
    hours: 20,
    lessonCount: 24,
    price: 3350000,
    isFree: false,
    rating: 4.8,
    students: 1960,
    instructor: "مهندس نیلوفر احمدی",
    summary:
      "مدل‌سازی اطلاعاتی ساختمان در رویت از ترسیم دیوار و تراز تا جدول‌های مقدار و خروجی فاز ۲؛ آماده برای تحویل به دفتر معماری و کارفرما.",
    highlights: [
      "راه‌اندازی پروژه و استاندارد لایه‌ها در رویت",
      "مدل‌سازی دیوار، سقف، پله و بازشو",
      "خانواده‌ها (Families) و عناصر سفارشی",
      "جدول مقدار، کنترل تداخل و خروجی فاز ۲",
    ],
    tags: ["Revit", "BIM", "Phase 2"],
    palette: ["#bfdbfe", "#1e3a8a"],
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=5WaGmNDrekg",
    lessons: [
      {
        id: "c-11-l-01",
        title: "آشنایی با محیط رویت و راه‌اندازی پروژه",
        duration: "۱۱ دقیقه",
        embedUrl: "https://www.youtube.com/embed/CTUkmDfIOUM",
        summary: "پروژه جدید، واحدها، ترازها و نماهای اصلی.",
        isPreview: true,
      },
      {
        id: "c-11-l-02",
        title: "ترسیم دیوار، تراز و ایجاد طبقات",
        duration: "۱۰ دقیقه",
        embedUrl: "https://www.youtube.com/embed/CTUkmDfIOUM?start=160",
        summary: "از پلان تا مدل سه‌بعدی با ابزارهای پایه.",
      },
      {
        id: "c-11-l-03",
        title: "خانواده‌ها و عناصر سفارشی",
        duration: "۲۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/5WaGmNDrekg?start=156",
        summary: "ساخت و ویرایش Family برای درها و پنجره‌ها.",
      },
      {
        id: "c-11-l-04",
        title: "مدل‌سازی معماری و جزئیات فاز ۲",
        duration: "۱۸ دقیقه",
        embedUrl: "https://www.youtube.com/embed/5WaGmNDrekg?start=12669",
        summary: "تکمیل پوسته، جزئیات اجرایی و هماهنگی نقشه‌ها.",
      },
      {
        id: "c-11-l-05",
        title: "جدول‌های مقدار و خروجی BIM",
        duration: "۲۵ دقیقه",
        embedUrl: "https://www.youtube.com/embed/5WaGmNDrekg?start=19227",
        summary: "برداشت متره، خروجی دیتا و تحویل فایل BIM.",
      },
    ],
  },
  {
    id: "c-12",
    title: "مدل‌سازی فرم‌های پیچیده و ارگانیک در راینو",
    category: "modeling",
    categoryLabel: "مدل‌سازی سه‌بعدی",
    software: ["rhino"],
    level: "پیشرفته",
    hours: 18,
    lessonCount: 22,
    price: 3150000,
    isFree: false,
    rating: 4.8,
    students: 1480,
    instructor: "مهندس رها کیانی",
    summary:
      "از NURBS و سطوح آزاد تا SubD و مدل‌سازی نماهای دو‌منحنی؛ ساخت فرم‌های ارگانیک با کنترل دقیق هندسه و آماده‌سازی برای رندر و ساخت.",
    highlights: [
      "اصول NURBS، Curve و Surface در راینو",
      "مدل‌سازی فرم‌های ارگانیک با SubD",
      "کنترل انحنای نما و پنل‌بندی پوسته",
      "آماده‌سازی فایل برای رندر و فاز اجرایی",
    ],
    tags: ["Rhino", "NURBS", "Organic"],
    palette: ["#c7d2fe", "#312e81"],
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=BmcqcRq0Q5o",
    lessons: [
      {
        id: "c-12-l-01",
        title: "راه‌اندازی راینو و منطق NURBS",
        duration: "۱۵ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "تفاوت Mesh و NURBS و تنظیم واحد پروژه.",
        isPreview: true,
      },
      {
        id: "c-12-l-02",
        title: "ترسیم کرو و ساخت سطوح پیوسته",
        duration: "۲۳ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "Curve Network، Loft و تطبیق انحنای سطوح.",
      },
      {
        id: "c-12-l-03",
        title: "مدل‌سازی ارگانیک با SubD",
        duration: "۲۷ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "ساخت حجم‌های نرم و کنترل توپولوژی.",
      },
      {
        id: "c-12-l-04",
        title: "پنل‌بندی و کنترل پوسته دو‌منحنی",
        duration: "۲۱ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "تقسیم سطح، ساخت پنل و کنترل درزها.",
      },
      {
        id: "c-12-l-05",
        title: "خروجی، صحنه‌آرایی و تحویل فایل",
        duration: "۱۹ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "آماده‌سازی فایل برای رندر و ساخت ماکت.",
      },
    ],
  },
  {
    id: "c-13",
    title: "طراحی پارامتریک و الگوریتمیک با گرس‌هاپر",
    category: "modeling",
    categoryLabel: "طراحی پارامتریک",
    software: ["grasshopper", "rhino"],
    level: "پیشرفته",
    hours: 22,
    lessonCount: 26,
    price: 3650000,
    isFree: false,
    rating: 4.9,
    students: 1260,
    instructor: "مهندس رها کیانی",
    summary:
      "از منطق داده و لیست‌ها تا ساخت الگوریتم‌های تولید فرم، پنل‌بندی واکنشی و بهینه‌سازی اقلیمی؛ طراحی پارامتریک برای پروژه‌های واقعی.",
    highlights: [
      "منطق داده، List و Tree در گرس‌هاپر",
      "الگوریتم تولید پوسته و پنل واکنشی",
      "اتصال به راینو و کنترل هندسه زنده",
      "بهینه‌سازی اقلیمی و خروجی مستندات",
    ],
    tags: ["Grasshopper", "Parametric", "Algorithmic"],
    palette: ["#a7f3d0", "#065f46"],
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=BmcqcRq0Q5o",
    lessons: [
      {
        id: "c-13-l-01",
        title: "منطق پارامتریک و ساختار داده",
        duration: "۱۸ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "Data، List و Tree؛ زبان مشترک گرس‌هاپر.",
        isPreview: true,
      },
      {
        id: "c-13-l-02",
        title: "ساخت اولین الگوریتم فرم",
        duration: "۲۴ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "از پارامترهای عددی تا حجم قابل کنترل.",
      },
      {
        id: "c-13-l-03",
        title: "پوسته واکنشی و پنل‌بندی پارامتریک",
        duration: "۲۹ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "تقسیم سطح، جذب تابش و تولید پنل‌های متغیر.",
      },
      {
        id: "c-13-l-04",
        title: "بهینه‌سازی و تحلیل اقلیمی",
        duration: "۲۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "سنجش گزینه‌ها و انتخاب فرم بهینه.",
      },
      {
        id: "c-13-l-05",
        title: "مستندسازی و تحویل پروژه پارامتریک",
        duration: "۲۰ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "خروجی نقشه، جدول پارامترها و فایل اجرایی.",
      },
    ],
  },
  {
    id: "c-14",
    title: "رندرینگ سریع و انیمیشن معماری با لومیون",
    category: "render",
    categoryLabel: "رندرینگ لحظه‌ای",
    software: ["lumion"],
    level: "متوسط",
    hours: 15,
    lessonCount: 20,
    price: 2950000,
    isFree: false,
    rating: 4.7,
    students: 2130,
    instructor: "مهندس کیان مرادی",
    summary:
      "از ایمپورت مدل و ساخت صحنه تا رندر سینمایی، انیمیشن دوربین و ویدیوی ارائه؛ رسیدن به خروجی حرفه‌ای در کمترین زمان با لومیون.",
    highlights: [
      "ایمپورت و بهینه‌سازی مدل در لومیون",
      "کتابخانه متریال و آبجکت‌های واقع‌گرا",
      "نورپردازی روز، غروب و شب",
      "انیمیشن دوربین و خروجی ویدیوی ارائه",
    ],
    tags: ["Lumion", "Rendering", "Animation"],
    palette: ["#fde68a", "#b45309"],
    popular: true,
    videoUrl: "https://www.youtube.com/watch?v=BmcqcRq0Q5o",
    lessons: [
      {
        id: "c-14-l-01",
        title: "آشنایی با محیط لومیون و ایمپورت مدل",
        duration: "۱۳ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "ساخت صحنه از فایل راینو، مکس یا رویت.",
        isPreview: true,
      },
      {
        id: "c-14-l-02",
        title: "متریال و آبجکت‌گذاری صحنه",
        duration: "۲۰ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "پوشش گیاهی، مبلمان و متریال واقع‌گرا.",
      },
      {
        id: "c-14-l-03",
        title: "نورپردازی روز، غروب و شب",
        duration: "۲۴ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "کنترل خورشید، آسمان و نور مصنوعی.",
      },
      {
        id: "c-14-l-04",
        title: "دوربین، عمق میدان و رندر نهایی",
        duration: "۱۸ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "قاب‌بندی سینمایی و خروجی ۴K.",
      },
      {
        id: "c-14-l-05",
        title: "انیمیشن دوربین و ویدیوی ارائه",
        duration: "۲۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "مسیر دوربین، حرکت و خروجی ویدیویی.",
      },
    ],
  },
  {
    id: "c-15",
    title: "دوره جامع بلندر در معماری (Blender for Architecture & AI)",
    category: "modeling",
    categoryLabel: "مدل‌سازی سه‌بعدی",
    software: ["blender"],
    level: "متوسط",
    hours: 16,
    lessonCount: 30,
    price: 2980000,
    isFree: false,
    rating: 4.9,
    students: 1240,
    instructor: "تیم تخصصی لومنز",
    summary:
      "مسیر کامل بلندر برای معماران از مقدماتی تا پیشرفته: ناوبری و شورتکات‌ها، مدل‌سازی دقیق بر اساس پلان با مودیفایرها، متریال واقع‌گرای PBR در شیدر ادیتور، نورپردازی روز و شب و رندر حرفه‌ای با Cycles و Eevee و در پایان تلفیق بلندر با گردش کار هوش مصنوعی مولد.",
    highlights: [
      "محیط کاربری، ناوبری سه‌بعدی و شورتکات‌های کلیدی بلندر",
      "مدل‌سازی معماری بر اساس پلان با Bevel، Array، Boolean و Solidify",
      "ساخت متریال واقع‌گرا (PBR) با نود ادیتور و UV",
      "نورپردازی روز و شب و رندر سینمایی با Cycles و Eevee",
      "اتصال بلندر به ابزارهای AI مولد و رندر عصبی",
    ],
    tags: ["Blender", "Cycles", "Eevee", "PBR", "AI Workflow"],
    palette: ["#ffd7a8", "#c2410c"],
    popular: true,
    lessons: [
      {
        id: "c-15-l-01",
        title: "مبانی بلندر برای معماران؛ ناوبری، شورتکات‌ها و محیط کاربری",
        duration: "۲۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "چیدمان ویوپورت، ورک‌اسپیس‌ها، واحدهای اندازه‌گیری و شورتکات‌های ضروری.",
        isPreview: true,
      },
      {
        id: "c-15-l-02",
        title: "مدل‌سازی دقیق معماری بر اساس پلان و ابزارهای مودیفایر",
        duration: "۳۴ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "ایمپورت پلان، دیوار و بازشو، و مودیفایرهای Bevel، Array و Boolean.",
      },
      {
        id: "c-15-l-03",
        title: "ساخت متریال‌های واقع‌گرایانه (PBR) با نود ادیتور",
        duration: "۲۸ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "شیدر سنگ، بتن، چوب و شیشه با تکسچرهای PBR و کنترل UV.",
      },
      {
        id: "c-15-l-04",
        title: "نورپردازی روز و شب و رندرینگ حرفه‌ای با Cycles و Eevee",
        duration: "۳۱ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "HDRI، نور خورشید و نور مصنوعی، تنظیم سمپل و خروجی ۴K.",
      },
      {
        id: "c-15-l-05",
        title: "تلفیق بلندر با ابزارهای هوش مصنوعی مولد (AI Workflow & Neural Rendering)",
        duration: "۲۶ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "پاس‌های عمق و کنار برای ControlNet و رندر عصبی خروجی بلندر.",
      },
    ],
  },
  {
    id: "c-16",
    title: "دوره مدل‌سازی کاربردی و طراحی سریع با اسکچ‌اپ (SketchUp Masterclass)",
    category: "modeling",
    categoryLabel: "مدل‌سازی سه‌بعدی",
    software: ["sketchup"],
    level: "متوسط",
    hours: 12,
    lessonCount: 24,
    price: 0,
    isFree: true,
    rating: 4.7,
    students: 960,
    instructor: "تیم تخصصی لومنز",
    summary:
      "مدل‌سازی سریع و کاربردی در اسکچ‌اپ از مقدماتی تا پیشرفته: محیط کاربری و ابزارهای ترسیم، گروه و کامپوننت، ساخت پلان سه‌بعدی مسکونی با در و پنجره و پله، متریال و نور مقدماتی، مدیریت Tags و Scenes برای خروجی باکیفیت و در پایان اتصال اسکچ‌اپ به موتورهای رندر و پلاگین‌های هوش مصنوعی.",
    highlights: [
      "محیط کاربری، ابزارهای ترسیم و منطق گروه و کامپوننت",
      "مدل‌سازی سه‌بعدی پلان مسکونی همراه در، پنجره و پله",
      "متریال‌دهی، متریال سفارشی و نورپردازی مقدماتی",
      "مدیریت Tags و Scenes و خروجی باکیفیت تصویری",
      "اتصال به موتورهای رندر و پلاگین‌های AI",
    ],
    tags: ["SketchUp", "Modeling", "Scenes", "AI Workflow"],
    palette: ["#fecdd3", "#9f1239"],
    popular: false,
    lessons: [
      {
        id: "c-16-l-01",
        title: "اصول محیط کاربری، ابزارهای ترسیم و ساخت گروه و کامپوننت",
        duration: "۲۴ دقیقه",
        embedUrl: "https://www.youtube.com/embed/BmcqcRq0Q5o",
        summary: "محورها، snapping، ابزارهای Line/Rectangle/Push-Pull و منطق Group و Component.",
        isPreview: true,
      },
      {
        id: "c-16-l-02",
        title: "مدل‌سازی سه‌بعدی پلان‌های مسکونی، در، پنجره و پله",
        duration: "۳۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/xnSS6x_YkyM",
        summary: "از پلان دو‌بعدی تا حجم سه‌بعدی، بازشوها و پله با ابزارهای دقیق.",
      },
      {
        id: "c-16-l-03",
        title: "متریال‌دهی، ایجاد متریال سفارشی و نورپردازی مقدماتی",
        duration: "۲۶ دقیقه",
        embedUrl: "https://www.youtube.com/embed/FeT780MPO1U",
        summary: "متریال‌های آماده، ساخت متریال سفارشی و تنظیم نور خورشید و سایه.",
      },
      {
        id: "c-16-l-04",
        title: "مدیریت لایه‌ها (Tags)، صحنه‌ها (Scenes) و خروجی باکیفیت",
        duration: "۲۲ دقیقه",
        embedUrl: "https://www.youtube.com/embed/NWWzc1YDQdM",
        summary: "سازمان‌دهی مدل با Tags، ساخت Scenes و خروجی تصویری و انیمیشن.",
      },
      {
        id: "c-16-l-05",
        title: "اتصال اسکچ‌اپ به موتورهای رندر و پلاگین‌های هوش مصنوعی (AI Workflow)",
        duration: "۲۹ دقیقه",
        embedUrl: "https://www.youtube.com/embed/kBaw-glIEQE?start=2774",
        summary: "خروجی صحنه برای V-Ray/Enscape و پرامپت‌دهی به پلاگین‌های AI.",
      },
    ],
  },
];

export const allCourses: Course[] = [...courses, ...moreCourses];


/* ------------------------------------------------------------------ */
/*  3D objects                                                         */
/* ------------------------------------------------------------------ */

export const models3d: Model3D[] = [
  {
    id: "o-01",
    title: "مبل مینیمال مدولار «آرکا»",
    category: "furniture",
    categoryLabel: "مبلمان",
    format: "FBX / OBJ / BLEND",
    polygons: "۴۲٫۵K",
    size: "۱۸ MB",
    software: ["Blender", "3ds Max"],
    rating: 4.9,
    downloads: 8410,
    price: 0,
    isFree: true,
    tags: ["مینیمال", "پارچه", "مدولار"],
    palette: ["#f4dfa4", "#8f6f22"],
    description:
      "مبل مدولار سه‌نفره با پارچه بافت‌دار و پایه چوبی؛ دارای UV باز شده و متریال PBR آماده برای رندر بلادرنگ.",
    updated: "۱۴۰۳/۰۷/۰۲",
  },
  {
    id: "o-02",
    title: "صندلی ناهارخوری «لومن»",
    category: "furniture",
    categoryLabel: "مبلمان",
    format: "FBX / GLTF",
    polygons: "۱۲٫۸K",
    size: "۶ MB",
    software: ["Blender", "SketchUp"],
    rating: 4.7,
    downloads: 6120,
    price: 240000,
    isFree: false,
    tags: ["چوبی", "اسکاندیناوی", "سبک"],
    palette: ["#fdba74", "#7c2d12"],
    description:
      "صندلی ناهارخوری با فرم ارگونومیک، روکش چوب گردو و نشیمن پارچه‌ای؛ مناسب رندرهای داخلی مسکونی.",
    updated: "۱۴۰۳/۰۶/۱۸",
  },
  {
    id: "o-03",
    title: "مجموعه نورپردازی ریل «کانال»",
    category: "furniture",
    categoryLabel: "مبلمان",
    format: "OBJ / FBX / MAX",
    polygons: "۲۱٫۴K",
    size: "۹ MB",
    software: ["3ds Max", "V-Ray"],
    rating: 4.8,
    downloads: 4470,
    price: 180000,
    isFree: false,
    tags: ["نور", "فلزی", "مدرن"],
    palette: ["#e4e4e7", "#3f3f46"],
    description:
      "مجموعه چراغ ریل با اسپات‌های قابل تنظیم، بدنه آلومینیومی و آبجکت‌های کمکی برای چیدمان سریع سقف.",
    updated: "۱۴۰۳/۰۷/۱۱",
  },
  {
    id: "o-04",
    title: "میز کار مدیریتی «سِدرا»",
    category: "furniture",
    categoryLabel: "مبلمان",
    format: "FBX / BLEND",
    polygons: "۳۳٫۱K",
    size: "۱۴ MB",
    software: ["Blender", "Cinema 4D"],
    rating: 4.6,
    downloads: 2890,
    price: 320000,
    isFree: false,
    tags: ["اداری", "چوب", "لوکس"],
    palette: ["#d4d4d8", "#27272a"],
    description:
      "میز کار مدیریتی با صفحه چوب روکش و پایه فلزی مخروطی؛ شامل آبجکت‌های جانبی مانند کشو و کابل‌دان.",
    updated: "۱۴۰۳/۰۵/۲۹",
  },
  {
    id: "o-05",
    title: "سوئیت نشیمن لوکس «مَرمر»",
    category: "interior",
    categoryLabel: "مدل‌های داخلی",
    format: "FBX / OBJ / BLEND",
    polygons: "۵۸٫۷K",
    size: "۲۶ MB",
    software: ["Blender", "Corona"],
    rating: 4.9,
    downloads: 5310,
    price: 480000,
    isFree: false,
    tags: ["لوکس", "سنگ", "پارکت"],
    palette: ["#f5d0a9", "#78350f"],
    description:
      "صحنه کامل نشیمن شامل مبل، میز مرمری، فرش بافت‌دار، آبجکت‌های دکوری و نورپردازی آماده رندر.",
    updated: "۱۴۰۳/۰۷/۲۱",
  },
  {
    id: "o-06",
    title: "آشپزخانه مدرن «تِرا»",
    category: "interior",
    categoryLabel: "مدل‌های داخلی",
    format: "FBX / MAX / BLEND",
    polygons: "۷۴٫۲K",
    size: "۳۴ MB",
    software: ["3ds Max", "Corona"],
    rating: 4.8,
    downloads: 3980,
    price: 620000,
    isFree: false,
    tags: ["آشپزخانه", "کوارتز", "دستگیره مخفی"],
    palette: ["#cbd5e1", "#1e293b"],
    description:
      "آشپزخانه جزیره‌ای با کابینت‌های بدون دستگیره، صفحه کوارتز و پنل نورانی زیرکابینتی؛ آماده رندر واقع‌گرا.",
    updated: "۱۴۰۳/۰۶/۳۰",
  },
  {
    id: "o-07",
    title: "اتاق خواب آرام «نوکتِرن»",
    category: "interior",
    categoryLabel: "مدل‌های داخلی",
    format: "BLEND / FBX",
    polygons: "۴۹٫۳K",
    size: "۲۲ MB",
    software: ["Blender", "Cycles"],
    rating: 4.7,
    downloads: 3460,
    price: 390000,
    isFree: false,
    tags: ["اتاق خواب", "پارچه", "نور گرم"],
    palette: ["#c7d2fe", "#1e1b4b"],
    description:
      "صحنه اتاق خواب با تخت کینگ، پنل دیواری پارچه‌ای، آباژورهای کنار تخت و پرده نیمه‌شفاف با نور شب.",
    updated: "۱۴۰۳/۰۷/۰۵",
  },
  {
    id: "o-08",
    title: "لابی اداری «هوریزون»",
    category: "interior",
    categoryLabel: "مدل‌های داخلی",
    format: "FBX / MAX",
    polygons: "۹۲٫۶K",
    size: "۴۱ MB",
    software: ["3ds Max", "V-Ray"],
    rating: 4.9,
    downloads: 2740,
    price: 850000,
    isFree: false,
    tags: ["لابی", "تجاری", "سنگ"],
    palette: ["#e2e8f0", "#0f172a"],
    description:
      "لابی اداری مدرن با کانتر پذیرش سنگی، نشیمن انتظار، تایل‌های نورانی سقف و دیوار شیشه‌ای دو جداره.",
    updated: "۱۴۰۳/۰۶/۰۹",
  },
  {
    id: "o-09",
    title: "ویلای بتنی «مونولیت»",
    category: "exterior",
    categoryLabel: "مدل‌های خارجی",
    format: "FBX / OBJ / BLEND",
    polygons: "۸۸٫۴K",
    size: "۳۸ MB",
    software: ["Blender", "Lumion"],
    rating: 5,
    downloads: 4290,
    price: 720000,
    isFree: false,
    tags: ["بتنی", "ویلا", "مینیمال"],
    palette: ["#d6d3d1", "#292524"],
    description:
      "ویلای بتنی یک‌طبقه با کانسپت مونولیت، استخر روبه‌روی نشیمن و محوطه‌سازی حداقلی؛ شامل فایل صحنه کامل.",
    updated: "۱۴۰۳/۰۷/۱۸",
  },
  {
    id: "o-10",
    title: "برج مسکونی «وِرتکس»",
    category: "exterior",
    categoryLabel: "مدل‌های خارجی",
    format: "FBX / OBJ",
    polygons: "۱۵۶K",
    size: "۵۹ MB",
    software: ["Blender", "Enscape"],
    rating: 4.8,
    downloads: 3150,
    price: 940000,
    isFree: false,
    tags: ["برج", "پوسته فلزی", "شهری"],
    palette: ["#94a3b8", "#020617"],
    description:
      "برج مسکونی ۲۲ طبقه با پوسته آلومینیومی عمودی، بالکن‌های پیش‌آمده و مدل زمینه شهری برای رندر پرسپکتیو.",
    updated: "۱۴۰۳/۰۶/۲۲",
  },
  {
    id: "o-11",
    title: "پاویون پارک «کَنسل»",
    category: "exterior",
    categoryLabel: "مدل‌های خارجی",
    format: "OBJ / GLTF / BLEND",
    polygons: "۳۶٫۹K",
    size: "۱۵ MB",
    software: ["Blender", "Rhino"],
    rating: 4.9,
    downloads: 5080,
    price: 0,
    isFree: true,
    tags: ["پاویون", "چوب", "سازه سبک"],
    palette: ["#a7f3d0", "#064e3b"],
    description:
      "پاویون چوبی پارک با سازه شبکه‌ای و سایه‌اندازی طبیعی؛ مناسب مطالعه نور، مطالعه سایه و رندر محیطی.",
    updated: "۱۴۰۳/۰۷/۲۵",
  },
  {
    id: "o-12",
    title: "مجموعه پوشش گیاهی «گرین‌سِت»",
    category: "exterior",
    categoryLabel: "مدل‌های خارجی",
    format: "FBX / MAX / BLEND",
    polygons: "۲۴۵K",
    size: "۷۸ MB",
    software: ["3ds Max", "Forest Pack"],
    rating: 4.7,
    downloads: 6890,
    price: 350000,
    isFree: false,
    tags: ["گیاه", "محوطه", "چهارفصل"],
    palette: ["#bbf7d0", "#14532d"],
    description:
      "۲۴ گونه درخت و درختچه با فرم چهارفصل، شاخه‌های متنوع و آبجکت‌های پراکندگی آماده برای محوطه‌سازی حرفه‌ای.",
    updated: "۱۴۰۳/۰۵/۱۴",
  },
];

/* ------------------------------------------------------------------ */
/*  Articles                                                           */
/* ------------------------------------------------------------------ */

export const articles: Article[] = [
  {
    id: "a-01",
    title: "هوش مصنوعی چگونه فرآیند طراحی معماری را بازتعریف می‌کند؟",
    excerpt:
      "بررسی نقش مدل‌های مولد در مرحله کانسپت، از تولید دیاگرام و حجم تا انتخاب فرم نهایی بر اساس داده‌های سایت و اقلیم.",
    category: "هوش مصنوعی و معماری",
    author: "مهندس آرین رادمهر",
    date: "۱۴۰۳/۰۷/۲۴",
    readTime: 9,
    tags: ["کانسپت", "مدل مولد", "طراحی"],
    featured: true,
    palette: ["#f4dfa4", "#8f6f22"],
  },
  {
    id: "a-02",
    title: "قواعد طلایی پرامپت‌نویسی برای رندر معماری واقع‌گرا",
    excerpt:
      "هفت لایه پرامپت که تفاوت میان یک تصویر معمولی و رندری قابل ارائه به کارفرما را می‌سازد: فرم، متریال، نور، لنز، زمان روز و اتمسفر.",
    category: "پرامپت‌نویسی",
    author: "نگار سلطانی",
    date: "۱۴۰۳/۰۷/۱۸",
    readTime: 7,
    tags: ["پرامپت", "رندر", "Midjourney"],
    featured: true,
    palette: ["#a5f3fc", "#0e7490"],
  },
  {
    id: "a-03",
    title: "رندرینگ لحظه‌ای در استودیو: از ۸ ساعت به ۸ ثانیه",
    excerpt:
      "مقایسه زمان‌بندی گردش کار سنتی و AI-First به همراه معرفی پایپ‌لاین پیشنهادی LUMENS برای رندرهای واریاسیونی سریع.",
    category: "رندرینگ",
    author: "مهندس کیان مرادی",
    date: "۱۴۰۳/۰۷/۱۰",
    readTime: 11,
    tags: ["رندر لحظه‌ای", "ComfyUI", "سرعت"],
    featured: false,
    palette: ["#c4b5fd", "#4c1d95"],
  },
  {
    id: "a-04",
    title: "کنترل‌نت و وفاداری هندسی: راز رندر قابل اعتماد",
    excerpt:
      "چگونه با Depth، Canny و Lineart مطمئن شویم خروجی AI دقیقاً همان مدل سه‌بعدی ما را دنبال می‌کند و پلان‌ها را تغییر نمی‌دهد.",
    category: "ابزارها",
    author: "مهندس کیان مرادی",
    date: "۱۴۰۳/۰۶/۲۹",
    readTime: 8,
    tags: ["ControlNet", "Stable Diffusion", "دقت"],
    featured: false,
    palette: ["#bfdbfe", "#1e3a8a"],
  },
  {
    id: "a-05",
    title: "گردش کار AI برای پروژه‌های بزرگ مقیاس",
    excerpt:
      "مدیریت حجم بالا، نسخه‌بندی پرامپت‌ها، هماهنگی تیم چندنفره و استانداردسازی خروجی در پروژه‌های مسکونی و تجاری بزرگ.",
    category: "گردش کار",
    author: "مهندس سارا نیک‌آیین",
    date: "۱۴۰۳/۰۶/۱۵",
    readTime: 10,
    tags: ["Workflow", "تیم", "نسخه‌بندی"],
    featured: false,
    palette: ["#a7f3d0", "#065f46"],
  },
  {
    id: "a-06",
    title: "بهینه‌سازی آبجکت‌های سه‌بعدی برای رندر بلادرنگ",
    excerpt:
      "تکنیک‌های کاهش پالیگان، LOD، آتلاس تکسچر و مدیریت حافظه برای نمایش روان صحنه‌های سنگین در وب و موتورهای بلادرنگ.",
    category: "ابزارها",
    author: "مهندس بردیا کاشانی",
    date: "۱۴۰۳/۰۶/۰۳",
    readTime: 6,
    tags: ["Optimization", "GLTF", "LOD"],
    featured: false,
    palette: ["#fda4af", "#7f1d1d"],
  },
  {
    id: "a-07",
    title: "سئو برای استودیوهای معماری در عصر هوش مصنوعی",
    excerpt:
      "چرا محتوای تخصصی و صفحات سریع، سهم شما را از جست‌وجوهای «رندر با هوش مصنوعی» و «آموزش معماری» افزایش می‌دهد.",
    category: "آینده و سئو",
    author: "تیم محتوای LUMENS",
    date: "۱۴۰۳/۰۵/۲۷",
    readTime: 9,
    tags: ["SEO", "محتوا", "برندینگ"],
    featured: false,
    palette: ["#fde68a", "#78350f"],
  },
  {
    id: "a-08",
    title: "هوش مصنوعی و اخلاق حرفه‌ای در معماری",
    excerpt:
      "حق مؤلف تصاویر مولد، شفافیت با کارفرما و مرزهای استفاده از داده‌های پروژه‌ای؛ نکاتی که هر معمار باید بداند.",
    category: "آینده و سئو",
    author: "مهندس آرین رادمهر",
    date: "۱۴۰۳/۰۵/۱۲",
    readTime: 7,
    tags: ["اخلاق", "حق مؤلف", "قانون"],
    featured: false,
    palette: ["#e9d5ff", "#581c87"],
  },
  {
    id: "a-09",
    title: "از اسکچ دستی تا رندر نهایی در یک ساعت",
    excerpt:
      "تمرین عملی گام‌به‌گام: کروکی روی کاغذ، اسکن، پرامپت‌نویسی، رندر و پست‌پروداکشن نهایی با ابزارهای امروز.",
    category: "رندرینگ",
    author: "نگار سلطانی",
    date: "۱۴۰۳/۰۴/۳۰",
    readTime: 12,
    tags: ["اسکچ", "پست‌پروداکشن", "تمرین"],
    featured: false,
    palette: ["#fdba74", "#7c2d12"],
  },
];




/* ------------------------------------------------------------------ */
/*  Prompt library                                                     */
/* ------------------------------------------------------------------ */

export const prompts: PromptItem[] = [
  {
    id: "p-01",
    title: "ویلای بتنی با پوسته مشبک",
    category: "فرم و حجم",
    model: "Midjourney v6",
    difficulty: "متوسط",
    text: "architectural render of a monolithic concrete villa, perforated lattice facade, cantilevered upper volume, infinity pool reflection, golden hour sunlight, 35mm lens, eye-level perspective, ultra realistic, 8k, cinematic atmosphere --ar 16:9 --style raw",
    negative: "text, watermark, distorted proportions, extra floors, people, cars, blurry",
    tags: ["Concrete", "Villa", "Cantilever"],
  },
  {
    id: "p-02",
    title: "نما شیشه‌ای اداری در روز ابری",
    category: "نما و پوسته",
    model: "Midjourney v6",
    difficulty: "مبتدی",
    text: "overcast day architectural photography of an office tower, double skin glass curtain wall, vertical aluminium fins, subtle reflections of surrounding urban context, 24mm tilt-shift lens, straight verticals, neutral color grading, photorealistic",
    negative: "sun flare, oversaturated, fisheye distortion, lowres, jpeg artifacts",
    tags: ["Facade", "Glass", "Office"],
  },
  {
    id: "p-03",
    title: "نورپردازی شب نشیمن داخلی",
    category: "نورپردازی",
    model: "Stable Diffusion XL",
    difficulty: "پیشرفته",
    text: "interior architectural visualization at night, warm 2700K concealed lighting, walnut wood slats, micro-cement walls, deep shadows, soft light spill on floor, wide angle 20mm, low ISO, cinematic contrast, ultra detailed materials",
    negative: "daylight, blown highlights, flat lighting, plastic look, overexposed windows",
    tags: ["Night", "Warm light", "Interior"],
  },
  {
    id: "p-04",
    title: "متریال مینیمال سنگ و چوب",
    category: "متریال و بافت",
    model: "Stable Diffusion XL",
    difficulty: "متوسط",
    text: "close-up architectural material study, honed travertine stone beside brushed oak, soft raking light revealing micro texture, shallow depth of field, 100mm macro lens, neutral gray background, hyper realistic surface detail",
    negative: "harsh specular highlights, tiling seams, cartoonish, low contrast",
    tags: ["Travertine", "Oak", "Macro"],
  },
  {
    id: "p-05",
    title: "پلان شماتیک رنگی با ترافیک انسانی",
    category: "پلان و دیاگرام",
    model: "ChatGPT + Illustrator",
    difficulty: "مبتدی",
    text: "schematic architectural floor plan diagram, thin black linework, soft pastel zoning colors, dashed circulation arrows, minimal furniture symbols, human scale figures as gray silhouettes, clean white background, top-down orthographic view",
    negative: "3d perspective, drop shadows, noisy textures, cluttered annotations",
    tags: ["Plan", "Diagram", "Zoning"],
  },
  {
    id: "p-06",
    title: "فضای داخلی آرام با نور طبیعی",
    category: "فضای داخلی",
    model: "Midjourney v6",
    difficulty: "مبتدی",
    text: "serene minimalist living room interior, large floor to ceiling window, sheer linen curtains diffusing daylight, oak floor, plaster walls, single linen sofa, one plant, calm neutral palette, 28mm lens, soft film grain, photoreal",
    negative: "cluttered decor, neon colors, harsh shadows, unrealistic scale, watermark",
    tags: ["Interior", "Daylight", "Minimal"],
  },
  {
    id: "p-07",
    title: "حجم ارگانیک با الهام از توپوگرافی",
    category: "فرم و حجم",
    model: "Midjourney v6",
    difficulty: "پیشرفته",
    text: "organic architectural massing inspired by site topography, flowing curved roofs, terraced green roofs, rammed earth texture, aerial three quarter view, soft morning haze, 50mm lens, hyper detailed, concept architecture competition board",
    negative: "grid distortion, duplicated geometry, text labels, low detail, plastic render",
    tags: ["Organic", "Topography", "Green roof"],
  },
  {
    id: "p-08",
    title: "جزئیات اتصال فلز و شیشه",
    category: "متریال و بافت",
    model: "Stable Diffusion XL",
    difficulty: "متوسط",
    text: "architectural detail shot, blackened steel mullion meeting low iron glass, precise shadow gap, subtle dust particles in sunbeam, 85mm lens, f8, sharp focus on joint, industrial elegance, high dynamic range",
    negative: "clutter, fingerprints, cartoon shading, oversharpened halos",
    tags: ["Detail", "Steel", "Glass"],
  },
  {
    id: "p-09",
    title: "نورپردازی محوطه و مسیر شب",
    category: "نورپردازی",
    model: "Stable Diffusion XL",
    difficulty: "متوسط",
    text: "landscape lighting design at dusk, low bollard lights along a stone path, uplit tree canopies, warm pools of light on gravel, blue hour sky, long exposure 16mm, atmospheric depth, cinematic realism",
    negative: "midday sun, flat ambient light, red sky, noise, lens dirt",
    tags: ["Landscape", "Dusk", "Path"],
  },
  {
    id: "p-10",
    title: "دیاگرام مفهومی فرم با فلش‌های تحلیلی",
    category: "پلان و دیاگرام",
    model: "ChatGPT + Figma",
    difficulty: "مبتدی",
    text: "concept massing diagram, exploded isometric axonometric volumes, thin gold outlines on dark charcoal background, numbered steps, minimalist labels, subtle arrows showing transformation, clean vector style, presentation ready",
    negative: "photorealistic texture, gradients noise, watermark, messy lines",
    tags: ["Axonometric", "Concept", "Vector"],
  },
];

/* ------------------------------------------------------------------ */
/*  AI workflow steps                                                  */
/* ------------------------------------------------------------------ */

export const workflowSteps: WorkflowStep[] = [
  {
    id: "w-01",
    title: "تحلیل و ورودی پروژه",
    subtitle: "Site & Brief Intelligence",
    description:
      "داده‌های سایت، اقلیم، برنامه فیزیکی و محدودیت‌های کارفرما را جمع‌آوری و به زبان قابل فهم برای مدل تبدیل می‌کنیم.",
    duration: "۲ ساعت",
    tools: ["ChatGPT", "Notion", "Google Earth"],
    tips: [
      "چک‌لیست محدودیت‌ها را همیشه در یک فایل واحد نگه دارید",
      "نقشه سایت را در مقیاس درست و شمال‌دار آماده کنید",
    ],
  },
  {
    id: "w-02",
    title: "مهندسی پرامپت",
    subtitle: "Prompt Engineering",
    description:
      "تبدیل بریف به ساختار پرامپت هفت‌لایه: فرم، متریال، نور، لنز، اتمسفر، استایل و پرهیزها.",
    duration: "۳ ساعت",
    tools: ["LUMENS Prompt Framework", "Midjourney", "Notion"],
    tips: [
      "همیشه نسخه پرامپت را شماره‌گذاری کنید",
      "لنز و پرسپکتیو را قبل از متریال تعیین کنید",
    ],
  },
  {
    id: "w-03",
    title: "تولید واریاسیون‌های حجمی",
    subtitle: "Massing Generation",
    description:
      "تولید سریع ده‌ها واریاسیون فرم و انتخاب جهت طراحی بر اساس معیارهای کارفرما و منطق سایت.",
    duration: "۱ ساعت",
    tools: ["Midjourney", "Vizcom", "Stable Diffusion"],
    tips: [
      "از تکنیک Pan و Zoom برای توسعه فرم استفاده کنید",
      "خروجی‌ها را در برد ۴×۴ مقایسه کنید",
    ],
  },
  {
    id: "w-04",
    title: "کنترل هندسی با ControlNet",
    subtitle: "Geometry Fidelity",
    description:
      "قفل کردن خطوط، عمق و پلان مدل سه‌بعدی تا خروجی AI دقیقاً همان هندسه طراحی‌شده را دنبال کند.",
    duration: "۴ ساعت",
    tools: ["ComfyUI", "ControlNet Depth/Canny", "SketchUp"],
    tips: [
      "وزن ControlNet را بین ۰٫۶ تا ۰٫۸ نگه دارید",
      "رزولوشن ورودی باید مضربی از ۶۴ باشد",
    ],
  },
  {
    id: "w-05",
    title: "رندر لحظه‌ای و واریاسیون نور",
    subtitle: "Realtime Rendering",
    description:
      "اجرای پایپ‌لاین رندر سریع برای تولید واریاسیون‌های نور، متریال و فصل‌ها در چند ثانیه.",
    duration: "۲ ساعت",
    tools: ["SDXL Turbo", "ComfyUI", "IC-Light"],
    tips: [
      "واریاسیون نور را همیشه با یک رندر پایه مقایسه کنید",
      "خروجی ۲K برای بازبینی و ۴K برای تحویل",
    ],
  },
  {
    id: "w-06",
    title: "پست‌پروداکشن و تحویل",
    subtitle: "Post & Delivery",
    description:
      "اصلاح رنگ، اضافه کردن عناصر انسانی، ترکیب رندر با مدل و آماده‌سازی بردهای ارائه نهایی.",
    duration: "۳ ساعت",
    tools: ["Photoshop", "Illustrator", "InDesign"],
    tips: [
      "لایه‌ها را با نام‌گذاری استاندارد تحویل دهید",
      "نسخه کم‌حجم وب را برای ارسال سریع بسازید",
    ],
  },
];


/* ------------------------------------------------------------------ */
/*  Home page - 4 golden keyword cards                                 */
/* ------------------------------------------------------------------ */

export const keywordFeatures: KeywordFeature[] = [
  {
    id: "k-ai",
    title: "هوش مصنوعی در معماری",
    short: "از ایده تا فرم",
    description:
      "تولید کانسپت، دیاگرام و حجم با مدل‌های مولد؛ همراه با تحلیل سایت و اقلیم و رسیدن به فرم قابل ارائه.",
    href: "/ai-architecture",
    accent: ["#f4dfa4", "#8f6f22"],
    icon: "brain",
    bullets: ["کانسپت و حجم", "دیاگرام تحلیلی", "فرم‌یابی داده‌محور"],
  },
  {
    id: "k-prompt",
    title: "پرامپت‌نویسی معماری",
    short: "زبان مشترک با هوش مصنوعی",
    description:
      "ساختار دقیق پرامپت برای رندر معماری: فرم، متریال، نور، لنز و اتمسفر؛ همراه با کتابخانه پرامپت آماده.",
    href: "/ai-prompts",
    accent: ["#a5f3fc", "#0e7490"],
    icon: "sparkles",
    bullets: ["چارچوب هفت‌لایه", "کتابخانه آماده", "منفی‌پرامپت"],
  },
  {
    id: "k-realtime",
    title: "رندرینگ لحظه‌ای",
    short: "از ۸ ساعت به ۸ ثانیه",
    description:
      "پایپ‌لاین رندر بلادرنگ با Stable Diffusion و ComfyUI؛ واریاسیون نور، متریال و فصل در چند ثانیه.",
    href: "/realtime-rendering",
    accent: ["#c4b5fd", "#4c1d95"],
    icon: "bolt",
    bullets: ["SDXL Turbo", "ControlNet", "خروجی ۴K"],
  },
  {
    id: "k-workflow",
    title: "گردش کار AI",
    short: "استودیوی هوشمند",
    description:
      "نقشه راه شش‌مرحله‌ای پروژه‌های AI-First، از تحلیل ورودی تا پست‌پروداکشن و تحویل استاندارد به کارفرما.",
    href: "/ai-workflow",
    accent: ["#a7f3d0", "#065f46"],
    icon: "route",
    bullets: ["۶ مرحله اجرایی", "اتصال به راینو و رویت", "چک‌لیست کیفیت"],
  },
];

/* ------------------------------------------------------------------ */
/*  Home page - supporting content                                     */
/* ------------------------------------------------------------------ */

export const heroStats: Stat[] = [
  { value: "+۱۲۰", label: "دوره و کارگاه تخصصی" },
  { value: "+۴٫۸K", label: "آبجکت سه‌بعدی آماده" },
  { value: "+۳۸K", label: "معمار و دانشجو" },
  { value: "٪۹۸", label: "رضایت دانش‌پذیران" },
];

export const platformStats: Stat[] = [
  { value: "۸ ثانیه", label: "میانگین زمان هر رندر" },
  { value: "۶ مرحله", label: "گردش کار استاندارد" },
  { value: "۲۴/۷", label: "پشتیبانی انجمن تخصصی" },
];


export const testimonials: Testimonial[] = [
  {
    id: "t-01",
    name: "مهسا رحیمی",
    role: "معمار ارشد، استودیو آترا",
    quote:
      "با پایپ‌لاین رندر لحظه‌ای LUMENS، جلسه‌های طراحی ما از یک هفته به یک روز رسید. کارفرما همان‌جا واریاسیون‌ها را می‌بیند و تصمیم می‌گیرد.",
    initials: "م.ر",
  },
  {
    id: "t-02",
    name: "علی فروغی",
    role: "طراح داخلی و مدرس",
    quote:
      "کتابخانه آبجکت‌ها واقعاً بی‌نقص است؛ آبجکت‌ها سبک، تمیز و با متریال PBR آماده رندر هستند. دیگر وقت‌ام را صرف مدل‌سازی نمی‌کنم.",
    initials: "ع.ف",
  },
  {
    id: "t-03",
    name: "نگین اسدی",
    role: "دانشجوی ارشد معماری",
    quote:
      "دوره پرامپت‌نویسی، زبان من با هوش مصنوعی را کامل عوض کرد. حالا در یک روز کاری، برد ارائه کامل پروژه‌ام را آماده می‌کنم.",
    initials: "ن.ا",
  },
];

export const faqs: FaqItem[] = [
  {
    id: "f-01",
    question: "برای شروع کار با هوش مصنوعی در معماری چه پیش‌نیازی لازم است؟",
    answer:
      "تنها آشنایی مقدماتی با نرم‌افزارهای معماری و یک کامپیوتر با کارت گرافیک ۸ گیگابایت (یا استفاده از سرویس‌های ابری) کافی است. مسیر پیشنهادی LUMENS از دوره «پلان، دیاگرام و اینفوگرافیک هوشمند» شروع می‌شود که کاملاً رایگان است.",
  },
  {
    id: "f-02",
    question: "آبجکت‌های سه‌بعدی در چه فرمت‌هایی ارائه می‌شوند؟",
    answer:
      "همه آبجکت‌ها با فرمت‌های رایج FBX، OBJ، BLEND، MAX و GLTF ارائه می‌شوند. فایل‌ها به‌صورت UV باز شده و همراه متریال PBR و تکسچرهای استاندارد تحویل داده می‌شوند.",
  },
  {
    id: "f-03",
    question: "رندر لحظه‌ای به سیستم من قوی نیاز دارد؟",
    answer:
      "برای نسخه ابری LUMENS هیچ نیاز سخت‌افزاری ندارید. برای اجرای محلی، حداقل کارت گرافیک ۸ گیگابایت و ۱۶ گیگابایت رم توصیه می‌شود؛ در دوره رندرینگ لحظه‌ای تنظیمات بهینه برای سیستم‌های ضعیف‌تر نیز آموزش داده می‌شود.",
  },
  {
    id: "f-04",
    question: "دوره‌ها دسترسی دائمی دارند؟",
    answer:
      "بله. تمام دوره‌های خریداری‌شده دسترسی دائمی دارند و به‌روزرسانی‌های بعدی بدون هزینه اضافه در پنل کاربری شما قرار می‌گیرد.",
  },
  {
    id: "f-05",
    question: "امکان پرداخت اقساطی یا خرید سازمانی وجود دارد؟",
    answer:
      "برای استودیوها و سازمان‌ها بسته‌های سازمانی با امکان پرداخت مرحله‌ای و آموزش اختصاصی تیمی ارائه می‌شود. برای دریافت پیشنهاد اختصاصی از طریق فرم تماس با ما در ارتباط باشید.",
  },
];


/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Converts the latin digits of a number/string into Persian digits. */
export function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (digit) => faDigits[Number(digit)]);
}

/** Formats a Toman price for display (Persian digits + separators). */
export function formatPrice(price: number): string {
  if (price === 0) return "رایگان";
  const grouped = price.toLocaleString("en-US").replace(/,/g, "،");
  return `${toPersianDigits(grouped)} تومان`;
}

/** Formats large counts: 3120 -> ۳٫۱۲۰ */
export function formatCount(value: number): string {
  return toPersianDigits(value.toLocaleString("en-US").replace(/,/g, "٫"));
}

/** Formats a rating number: 4.9 -> ۴٫۹ */
export function formatRating(value: number): string {
  return toPersianDigits(value.toFixed(1)).replace(".", "٫");
}

export const navigation = [
  { href: "/", label: "خانه" },
  { href: "/objects", label: "آبجکت‌های سه‌بعدی" },
  { href: "/courses", label: "دوره‌های آموزشی" },
  { href: "/articles", label: "مقالات" },
];

export const aiNavigation = [
  { href: "/ai-architecture", label: "هوش مصنوعی در معماری" },
  { href: "/ai-prompts", label: "پرامپت‌نویسی معماری" },
  { href: "/realtime-rendering", label: "رندرینگ لحظه‌ای" },
  { href: "/ai-workflow", label: "گردش کار AI" },
];

export const footerLinks = [
  {
    title: "پلتفرم",
    links: [
      { href: "/objects", label: "آبجکت‌های سه‌بعدی" },
      { href: "/courses", label: "دوره‌های آموزشی" },
      { href: "/articles", label: "مقالات تخصصی" },
      { href: "/ai-workflow", label: "گردش کار AI" },
    ],
  },
  {
    title: "تخصص‌ها",
    links: [
      { href: "/ai-architecture", label: "هوش مصنوعی در معماری" },
      { href: "/ai-prompts", label: "پرامپت‌نویسی" },
      { href: "/realtime-rendering", label: "رندرینگ لحظه‌ای" },
      { href: "/courses", label: "کارگاه‌های زنده" },
    ],
  },
];

