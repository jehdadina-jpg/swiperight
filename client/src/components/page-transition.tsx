"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

/**
 * Route transition themed around the product's own mechanic: content
 * swipes in from the right and exits to the left, like a card being
 * dismissed. Lives inside the (app) group layout, below Nav, so the nav
 * bar itself never re-animates on navigation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -28 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
