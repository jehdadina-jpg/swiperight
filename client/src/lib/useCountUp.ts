import { useEffect, useRef, useState } from "react";

/**
 * Animates from 0 to `value` over `durationMs` whenever `value` changes.
 *
 * Falls back to a plain setTimeout that snaps straight to `value` if
 * requestAnimationFrame never fires (backgrounded/hidden tabs can pause rAF
 * indefinitely, but timers still run) - otherwise the headline number this
 * hook drives could get stuck at 0 forever instead of just skipping the
 * animation.
 */
export function useCountUp(value: number, durationMs = 900, active = true): number {
  const [display, setDisplay] = useState(0);
  const settledRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    settledRef.current = false;
    let frame: number;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        settledRef.current = true;
      }
    };

    frame = requestAnimationFrame(tick);

    const fallback = setTimeout(() => {
      if (!settledRef.current) setDisplay(value);
    }, durationMs + 250);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(fallback);
    };
  }, [value, durationMs, active]);

  return display;
}
