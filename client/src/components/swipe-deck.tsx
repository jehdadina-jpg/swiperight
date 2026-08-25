"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SwipeDirection = "left" | "right";

interface SwipeDeckProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onSwipe?: (item: T, direction: SwipeDirection, index: number) => void;
  onComplete?: () => void;
  leftLabel?: string;
  rightLabel?: string;
}

const SWIPE_THRESHOLD = 120;

export function SwipeDeck<T>({ items, renderItem, onSwipe, onComplete, leftLabel = "Pass", rightLabel = "Shortlist" }: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const firedCompleteRef = useRef(false);

  // Fire onComplete from an effect, not from inside the setIndex updater -
  // calling a parent's setState synchronously during this component's own
  // state update is unsafe and previously corrupted React's hook order.
  useEffect(() => {
    if (index >= items.length && !firedCompleteRef.current) {
      firedCompleteRef.current = true;
      onComplete?.();
    }
  }, [index, items.length, onComplete]);

  const advance = (direction: SwipeDirection) => {
    const current = items[index];
    if (current !== undefined) onSwipe?.(current, direction, index);
    setExitDirection(direction);
    setTimeout(() => {
      setExitDirection(null);
      setIndex((i) => i + 1);
    }, 200);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > SWIPE_THRESHOLD) advance("right");
    else if (info.offset.x < -SWIPE_THRESHOLD) advance("left");
  };

  if (index >= items.length) {
    return null;
  }

  const visible = items.slice(index, index + 3);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-sm h-[min(70vw,340px)]">
        <AnimatePresence>
          {visible.map((item, i) => {
            const absoluteIndex = index + i;
            const isTop = i === 0;
            return (
              <motion.div
                key={absoluteIndex}
                className="absolute inset-0"
                style={{ zIndex: visible.length - i }}
                initial={{ scale: 1 - i * 0.05, y: i * 10, opacity: i === 2 ? 0 : 1 }}
                animate={{ scale: 1 - i * 0.05, y: i * 10, opacity: i === 2 ? 0.5 : 1 }}
                exit={
                  isTop && exitDirection
                    ? { x: exitDirection === "right" ? 500 : -500, opacity: 0, rotate: exitDirection === "right" ? 20 : -20 }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.2 }}
                drag={isTop ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={isTop ? handleDragEnd : undefined}
                whileDrag={{ cursor: "grabbing" }}
              >
                <div className={isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}>
                  {renderItem(item, absoluteIndex)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6 mt-6">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-14 h-14 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => advance("left")}
          aria-label={leftLabel}
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={() => advance("right")}
          aria-label={rightLabel}
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Swipe or tap · {index + 1} of {items.length}
      </p>
    </div>
  );
}
