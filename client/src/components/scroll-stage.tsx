"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Full-viewport, scroll-locked slide deck. One wheel tick / arrow key / swipe
 * advances exactly one section - the page never free-scrolls. Sections stay
 * mounted and slide past each other so it reads as one continuous surface
 * with the content changing, not a series of separate page loads.
 */
export function ScrollStage({ sections }: { sections: React.ReactNode[] }) {
  const [index, setIndex] = useState(0);
  const lockRef = useRef(false);
  const touchStartY = useRef(0);
  const count = sections.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lockRef.current) return;
      setIndex((i) => {
        const next = Math.min(Math.max(i + dir, 0), count - 1);
        if (next === i) return i;
        lockRef.current = true;
        setTimeout(() => {
          lockRef.current = false;
        }, 850);
        return next;
      });
    },
    [count]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 8) return;
      go(e.deltaY > 0 ? 1 : -1);
    };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(-1);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 60) go(dy > 0 ? 1 : -1);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [go]);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden">
      {sections.map((section, i) => (
        <div
          key={i}
          className="absolute inset-0 h-[100dvh] w-full"
          style={{
            pointerEvents: i === index ? "auto" : "none",
            transform: `translateY(${(i - index) * 100}%)`,
            opacity: Math.abs(i - index) <= 1 ? 1 : 0,
            transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {section}
        </div>
      ))}

      <div className="fixed right-5 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-3 md:right-7">
        {sections.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to section ${i + 1}`}
            className={`w-2 rounded-full transition-all duration-300 ${
              i === index ? "h-6 bg-ember" : "h-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
