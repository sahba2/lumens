import type { Metadata } from "next";
import Link from "next/link";

import CourseCard from "@/components/CourseCard";
import CtaBand from "@/components/CtaBand";
import {
  IconArrowLeft,
  IconBolt,
  IconCheck,
  IconCube,
  IconEye,
  IconLayers,
  IconPlay,
} from "@/components/Icons";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { allCourses, platformStats, toPersianDigits } from "@/lib/data";

export const metadata: Metadata = {
  title: "رندرینگ لحظه‌ای با هوش مصنوعی",
  description:
    "پایپ‌لاین رندر بلادرنگ معماری با SDXL Turbo، ComfyUI و ControlNet؛ واریاسیون نور، متریال و فصل در چند ثانیه و خروجی ۴K برای ارائه.",
  alternates: { canonical: "/realtime-rendering" },
};

const pipeline = [
  {
    icon: IconCube,
    title: "ورودی صحنه",
    text: "خروجی ویوپورت SketchUp، Rhino یا 3ds Max را با زاویه و مقیاس درست آماده کنید.",
    meta: "SketchUp / Rhino",
  },
  {
    icon: IconLayers,
    title: "قفل هندسه",
    text: "با ControlNet Depth و Canny خطوط، عمق و پلان مدل را قفل کنید تا AI از طراحی منحرف نشود.",
    meta: "ComfyUI + ControlNet",
  },
  {
    icon: IconBolt,
    title: "رندر لحظه‌ای",
    text: "پایپ‌لاین SDXL Turbo در حدود ۸ ثانیه واریاسیون متریال و نور تولید می‌کند.",
    meta: "SDXL Turbo",
  },
  {
    icon: IconEye,
    title: "واریاسیون و تحویل",
    text: "نور، فصل و اتمسفر را تغییر دهید و خروجی نهایی را در Photoshop پست‌پروداکشن کنید.",
    meta: "IC-Light + Photoshop",
  },
];

const comparison = [
  { label: "زمان هر رندر", classic: "۴ تا ۸ ساعت", ai: "حدود ۸ ثانیه" },
  { label: "تعداد واریاسیون در روز", classic: "۲ تا ۳ نما", ai: "بیش از ۴۰ نما" },
  { label: "هزینه تغییر متریال", classic: "رندر کامل مجدد", ai: "یک کلیک" },
  { label: "نیاز به سخت‌افزار قوی", classic: "همیشه", ai: "نسخه ابری بدون نیاز" },
];

const renderCourses = allCourses.filter((course) => course.category === "render");
const relatedCourses = [
  ...renderCourses,
  ...allCourses.filter((course) => course.category !== "render"),
].slice(0, 3);

export default function RealtimeRenderingPage() {
  return (
    <>
      <PageHero
        eyebrow="تخصص سوم • REALTIME RENDERING"
        title="رندرینگ لحظه‌ای؛ از ۸ ساعت به ۸ ثانیه"
        description="پایپ‌لاین رندر بلادرنگ با Stable Diffusion و ComfyUI؛ واریاسیون نور، متریال و فصل را در چند ثانیه ببینید و همان‌جا با کارفرما تصمیم بگیرید."
        image="/covers/course-03.svg"
        badges={["خروجی ۴K", "ControlNet Depth", "نسخه ابری"]}
        breadcrumb={{ href: "/realtime-rendering", label: "رندرینگ لحظه‌ای" }}
        actions={
          <>
            <Link href="#pipeline" className="btn-primary">
              <IconPlay className="h-4 w-4" />
              مشاهده پایپ‌لاین
            </Link>
            <Link href="/courses" className="btn-ghost">
              دوره رندرینگ لحظه‌ای
            </Link>
          </>
        }
      />

      <section id="pipeline" className="container-x scroll-mt-[88px] py-20">
        <Reveal>
          <SectionHeading
            eyebrow="پایپ‌لاین چهارمرحله‌ای"
            title="از ویوپورت تا رندر نهایی"
            description="این زنجیره، خروجی هوش مصنوعی را به یک فرآیند مهندسی‌شده و تکرارپذیر تبدیل می‌کند؛ نه یک آزمایش شانسی."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map(({ icon: Icon, title, text, meta }, index) => (
            <Reveal key={title} delay={index * 80}>
              <div className="glow-card h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-5 text-[10px] font-semibold tracking-widest2 text-gold/80">
                  مرحله {toPersianDigits(index + 1)}
                </p>
                <h3 className="mt-2 text-sm font-bold text-white">{title}</h3>
                <p className="mt-3 text-[11px] leading-6 text-zinc-400">{text}</p>
                <span className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] text-zinc-400">
                  {meta}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative border-y border-white/10 bg-white/[0.015] py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <div>
              <span className="eyebrow">
                <IconBolt className="h-3.5 w-3.5" />
                مقایسه واقعی
              </span>
              <h2 className="section-title mt-5">وقتی رندر دیگر گلوگاه نیست</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                در روش سنتی، هر تغییر متریال یا نور یعنی ساعت‌ها انتظار. در پایپ‌لاین LUMENS، تصمیم
                طراحی همان لحظه گرفته می‌شود و تیم شما روی ایده تمرکز می‌کند، نه روی انتظار.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {platformStats.map((stat) => (
                  <div key={stat.label} className="glass rounded-2xl p-4 text-center">
                    <p className="font-display text-xl font-black text-gradient-gold">{stat.value}</p>
                    <p className="mt-2 text-[10px] leading-5 text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="glass-card overflow-hidden">
              <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-[11px] font-bold text-zinc-400">
                <span>معیار</span>
                <span>رندر سنتی</span>
                <span className="text-gold-light">LUMENS</span>
              </div>
              {comparison.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-white/5 px-5 py-4 text-[11px] last:border-b-0"
                >
                  <span className="text-zinc-300">{row.label}</span>
                  <span className="text-zinc-500">{row.classic}</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-gold-light">
                    <IconCheck className="h-3.5 w-3.5 shrink-0" />
                    {row.ai}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>


      <section className="container-x py-20">
        <Reveal>
          <SectionHeading
            eyebrow="آموزش پایپ‌لاین"
            title="دوره‌های رندرینگ لحظه‌ای"
            description="نصب، تنظیمات بهینه، ورک‌فلوی ComfyUI و کنترل هندسه؛ همه در قالب پروژه‌های قابل اجرا."
            action={
              <Link href="/courses" className="btn-ghost">
                همه دوره‌ها
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            }
          />
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {relatedCourses.map((course, index) => (
            <Reveal key={course.id} delay={index * 90}>
              <CourseCard course={course} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <Reveal>
          <CtaBand
            eyebrow="رندر بعدی"
            title="واریاسیون‌های نور را همین امروز ببینید"
            description="پایپ‌لاین رندر لحظه‌ای را در دوره تخصصی LUMENS نصب کنید و اولین واریاسیون‌های خود را در کمتر از یک ساعت بگیرید."
            primary={{ href: "/courses", label: "شروع دوره رندر" }}
            secondary={{ href: "/ai-workflow", label: "گردش کار AI" }}
          />
        </Reveal>
      </section>
    </>
  );
}

