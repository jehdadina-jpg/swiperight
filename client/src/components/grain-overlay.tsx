/**
 * A fixed film-grain texture over the whole viewport. Replaces the usual
 * "blurred gradient blob" background with something that reads as material
 * (film stock, brushed metal) rather than decorative glow.
 */
export function GrainOverlay() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[999] h-full w-full opacity-[0.035] mix-blend-overlay"
    >
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  );
}
