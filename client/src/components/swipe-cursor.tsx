"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * A small floating cursor-follower shown only while hovering the swipe
 * deck, hinting that the card underneath can be dragged left/right.
 * Wrap the deck area with this; it tracks mouse position relative to
 * itself and fades in/out on enter/leave. Inert on touch (no mousemove
 * without a preceding tap there, so it simply never appears).
 */
export function SwipeCursor({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-20 flex items-center gap-3 -translate-x-1/2 -translate-y-1/2"
            style={{ left: pos.x, top: pos.y }}
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">drag</span>
            <ChevronRight className="w-4 h-4 text-white/70" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
