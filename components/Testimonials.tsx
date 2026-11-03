import { testimonials } from "@/lib/data";
import { IconSparkles } from "./Icons";

/** Social proof: three glass quote cards from LUMENS members. */
export default function Testimonials() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {testimonials.map((item) => (
        <figure key={item.id} className="glow-card flex h-full flex-col p-6">
          <IconSparkles className="h-5 w-5 text-gold" />
          <blockquote className="mt-5 flex-1 text-sm leading-7 text-zinc-300">«{item.quote}»</blockquote>
          <figcaption className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-xs font-bold text-gold-light">
              {item.initials}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold text-white">{item.name}</span>
              <span className="mt-1 text-[11px] text-zinc-500">{item.role}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
