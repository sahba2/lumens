interface CinematicBackdropProps {
  /**
   * Optional local looping video (for example "/videos/hero-loop.mp4").
   * It is rendered as the base layer and colour-graded by the CSS overlays.
   * When omitted, the pure CSS/SVG cinematic loop is used instead, so the
   * project never depends on an external or missing video asset.
   */
  videoSrc?: string;
  videoType?: string;
  poster?: string;
  className?: string;
}

/**
 * Dark, cinematic hero backdrop:
 * deep charcoal base, warm gold key light, an animated perspective grid,
 * architectural skyline silhouettes, film grain, scanlines and a vignette.
 *
 * The hero "video" is a self-contained CSS/SVG loop (camera push-in, drifting
 * facade, volumetric beams, dust and a light sweep), so the hero always looks
 * complete even when no media file is shipped. A locally hosted clip can be
 * supplied through `videoSrc` and is composited on top of that loop.
 *
 * Every layer is decorative, pointer-events-free and honours
 * `prefers-reduced-motion` through the global stylesheet.
 */
export default function CinematicBackdrop({
  videoSrc,
  videoType = "video/mp4",
  poster,
  className = "",
}: CinematicBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      {/* Base colour grade */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_-12%,rgba(212,175,55,0.24),transparent_58%),radial-gradient(90%_75%_at_6%_18%,rgba(104,116,196,0.18),transparent_62%),linear-gradient(180deg,#0a0a0a_0%,#0b0a09_46%,#070708_100%)]" />

      {/* Looping cinematic backdrop ("hero video") */}
      <div className="hero-video">
        {videoSrc ? (
          <video
            className="hero-video-media"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={poster}
          >
            <source src={videoSrc} type={videoType} />
          </video>
        ) : null}

        {/* Drifting architectural facade */}
        <div className="hero-facade" />

        {/* Volumetric key / fill beams */}
        <div className="hero-beam hero-beam-a" />
        <div className="hero-beam hero-beam-b" />

        {/* Atmospheric dust */}
        <div className="hero-video-motes" />

        {/* Slow horizontal light sweep */}
        <div className="hero-video-sweep" />
      </div>

      {/* Architectural skyline */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[72%] w-full"
        viewBox="0 0 1440 720"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
        focusable="false"
      >
        <defs>
          <pattern id="lumens-windows" width="28" height="36" patternUnits="userSpaceOnUse">
            <rect x="5" y="7" width="4" height="7" fill="#f2e2a8" opacity="0.16" />
            <rect x="16" y="7" width="4" height="7" fill="#d4af37" opacity="0.1" />
            <rect x="5" y="21" width="4" height="7" fill="#f2e2a8" opacity="0.08" />
            <rect x="16" y="21" width="4" height="7" fill="#d4af37" opacity="0.07" />
          </pattern>
          <radialGradient id="lumens-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f2e2a8" stopOpacity="0.32" />
            <stop offset="45%" stopColor="#d4af37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="lumens-haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" stopOpacity="0" />
            <stop offset="70%" stopColor="#d4af37" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#d4af37" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        <circle cx="1080" cy="210" r="260" fill="url(#lumens-sun)" />

        {/* Distant skyline */}
        <path
          d="M0 720V540h54v-54h58v54h34V446h86v94h42V402h96v138h48v-72h78v72h36V396h104v144h58v-94h88v94h42V470h86v70h44V420h98v120h56v-62h82v62h40V508h92v32h46v-84h96v84h52v-40h102v220z"
          fill="#0c0c11"
          opacity="0.9"
        />
        <path
          d="M0 720V540h54v-54h58v54h34V446h86v94h42V402h96v138h48v-72h78v72h36V396h104v144h58v-94h88v94h42V470h86v70h44V420h98v120h56v-62h82v62h40V508h92v32h46v-84h96v84h52v-40h102v220z"
          fill="url(#lumens-windows)"
          opacity="0.6"
        />

        {/* Foreground silhouettes */}
        <path
          d="M0 720V600h44v-38h52v38h30V520h70v80h38V480h88v120h42v-48h58v48h26V560h64v40h34V456h82v144h46v-64h60v64h34V610h58v30h28V500h74v100h42v-56h54v56h30V470h76v130h40v-40h60v40h30V560h74v40h36V510h64v90h30V470h70v130h36V540h60v60h34v-40h56v40h30v120z"
          fill="#050507"
        />

        {/* Gold architectural rim lights */}
        <g stroke="#d4af37" strokeOpacity="0.18" strokeWidth="1">
          <path d="M198 446v274M282 458v262M366 396v324M470 540v180M596 470v250M726 420v300M866 508v212M1006 424v296M1150 468v252M1276 520v200" />
          <path d="M0 640h1440" strokeOpacity="0.08" />
        </g>

        <rect x="0" y="540" width="1440" height="180" fill="url(#lumens-haze)" opacity="0.55" />
      </svg>

      {/* Animated perspective floor grid */}
      <div className="hero-cinema-grid" />

      {/* Slow cinematic light sweep */}
      <div className="hero-light-sweep" />

      {/* Warm / cool practical lights */}
      <div className="absolute -right-24 -top-32 h-[30rem] w-[30rem] animate-float-slow rounded-full bg-gold/15 blur-3xl" />
      <div className="absolute -left-28 top-24 h-96 w-96 animate-float-slow rounded-full bg-indigo-500/15 blur-3xl [animation-delay:-6s]" />

      {/* Readability grade behind the RTL copy column */}
      <div className="absolute inset-0 bg-gradient-to-l from-ink/80 via-ink/25 to-transparent" />

      {/* Film texture */}
      <div className="hero-film-grain" />
      <div className="hero-scanlines" />

      {/* Top hairline + vignette */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-gold/35 to-transparent" />
      <div className="hero-vignette" />
    </div>
  );
}
