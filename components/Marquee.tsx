const tools = [
  "Midjourney",
  "Stable Diffusion",
  "ComfyUI",
  "ControlNet",
  "ChatGPT",
  "Blender",
  "Rhino",
  "SketchUp",
  "Revit",
  "V-Ray",
  "Corona",
  "Enscape",
  "Lumion",
  "Photoshop",
  "SDXL Turbo",
  "Vizcom",
];

/**
 * Infinite marquee of the tool stack. Pure CSS animation, no JS state,
 * so it is completely hydration safe.
 */
export default function Marquee() {
  const row = [...tools, ...tools];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-6 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-10 px-6" dir="ltr">
        {row.map((tool, index) => (
          <span
            key={`${tool}-${index}`}
            className="flex shrink-0 items-center gap-3 text-xs font-semibold tracking-widest2 text-zinc-500 sm:text-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold/70" />
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}
