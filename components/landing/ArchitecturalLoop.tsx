export type ArchitecturalMode = "gold" | "night" | "studio";

interface ArchitecturalLoopProps {
  mode?: ArchitecturalMode;
  className?: string;
}

const FLOORS = [18, 42, 66, 92, 118, 146, 176, 206, 234];

/**
 * "Scene AI" inspired architectural loop.
 *
 * A pure CSS/SVG 3D massing study: a wireframe monolith rotates inside a
 * perspective studio, surrounded by floating floor plates, light beams and
 * technical HUD annotations. No video asset or JS is required, so the hero
 * keeps its cinematic motion even on a cold, offline build. The whole loop
 * is disabled automatically for `prefers-reduced-motion` users.
 */
export default function ArchitecturalLoop({ mode = "gold", className = "" }: ArchitecturalLoopProps) {
  return (
    <div
      className={`arch-stage ${className}`.trim()}
      data-mode={mode}
      aria-hidden="true"
    >
      {/* Studio haze + golden horizon */}
      <div className="arch-haze" />
      <div className="arch-horizon" />
      <div className="arch-grid-floor" />

      {/* 3D massing */}
      <div className="arch-scene">
        <div className="arch-orbit">
          <div className="arch-tower">
            <span className="arch-face arch-face-front" />
            <span className="arch-face arch-face-back" />
            <span className="arch-face arch-face-left" />
            <span className="arch-face arch-face-right" />
            <span className="arch-roof" />
            <span className="arch-roof arch-roof-low" />
            <span className="arch-core" />
          </div>

          <span className="arch-plate arch-plate-a" />
          <span className="arch-plate arch-plate-b" />
          <span className="arch-plate arch-plate-c" />
        </div>

        {/* Floor guide rings */}
        <span className="arch-ring arch-ring-a" />
        <span className="arch-ring arch-ring-b" />
        <span className="arch-ring arch-ring-c" />
      </div>

      {/* Vertical light beams */}
      <span className="arch-beam arch-beam-a" />
      <span className="arch-beam arch-beam-b" />
      <span className="arch-beam arch-beam-c" />

      {/* Technical annotations */}
      <div className="arch-hud arch-hud-tl" dir="ltr">
        <span className="arch-hud-dot" />
        MASSING / 03
      </div>
      <div className="arch-hud arch-hud-tr" dir="ltr">
        GOLDEN HOUR · 35MM
      </div>
      <div className="arch-hud arch-hud-bl" dir="ltr">
        <span className="arch-hud-rule" />
        CORE · CONCRETE / GLASS
      </div>
      <div className="arch-hud arch-hud-br" dir="ltr">
        AI LOOP · 24 FPS
      </div>

      {/* Floating index ticks */}
      <span className="arch-tick arch-tick-a" />
      <span className="arch-tick arch-tick-b" />
      <span className="arch-tick arch-tick-c" />

      {/* Motion / texture overlays */}
      <span className="arch-scan" />
      <span className="arch-grain" />
      <span className="arch-vignette" />
      <span className="arch-crosshair arch-crosshair-a" />
      <span className="arch-crosshair arch-crosshair-b" />
    </div>
  );
}
