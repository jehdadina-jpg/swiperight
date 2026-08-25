"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plane, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedCards, type SavedCard } from "@/lib/savedCards";
import { NetworkMark } from "@/components/network-mark";

/** Deterministic, clearly-fake masked number so the same card always shows the same digits */
function maskedNumber(id: number): string {
  const seed = String(Math.abs(id) * 7919).padStart(4, "0").slice(-4);
  return `•••• •••• •••• ${seed}`;
}

// Deterministic gradient per issuer so the same bank always looks the same
const ISSUER_GRADIENTS: Record<string, string> = {
  "HDFC Bank": "from-[#3d2b1f] via-[#6b4a2f] to-[#c9962c]",
  "SBI Card": "from-[#1a2a52] via-[#2d4a8a] to-[#4a6fc7]",
  "ICICI Bank": "from-[#4a1a2a] via-[#8a2d4a] to-[#c74a6f]",
  "Axis Bank": "from-[#1f1f3d] via-[#3d3d6b] to-[#6b6bc9]",
  "IDFC FIRST Bank": "from-[#0f2a2a] via-[#1f5555] to-[#2fa3a3]",
  "American Express": "from-[#0f2340] via-[#1f4a7a] to-[#2f7ac7]",
  "Standard Chartered": "from-[#3d1f0f] via-[#7a3d1f] to-[#c7702f]",
  "Kotak Mahindra Bank": "from-[#1f0f3d] via-[#4a1f7a] to-[#7a3dc7]",
  "AU Small Finance Bank": "from-[#0f3d1f] via-[#1f7a3d] to-[#3dc76f]",
};
const DEFAULT_GRADIENT = "from-ink-4 via-ink-3 to-ink-2";

const CHURN_STYLES: Record<string, string> = {
  low: "bg-verdigris/20 text-verdigris-light border-verdigris/30",
  medium: "bg-ember/20 text-ember-light border-ember/30",
  high: "bg-destructive/20 text-red-300 border-destructive/40",
};

interface CreditCardVisualProps {
  card: SavedCard;
  className?: string;
  tilt?: boolean;
  showSave?: boolean;
  rank?: number;
  footer?: React.ReactNode;
  /** Drops the chip/masked-number detail for small decorative renders where there isn't room for it */
  compact?: boolean;
}

export function CreditCardVisual({ card, className, tilt = true, showSave = true, rank, footer, compact = false }: CreditCardVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.3 });
  const [hovering, setHovering] = useState(false);
  const { isSaved, toggle } = useSavedCards();
  const saved = isSaved(card.id);
  const gradient = ISSUER_GRADIENTS[card.issuer] ?? DEFAULT_GRADIENT;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    if (tilt) setRotate({ x: py * -10, y: px * 12 });
    setPointer({ x: px + 0.5, y: py + 0.5 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setHovering(false);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className={cn("relative", className)}
    >
      <div
        className={cn(
          "relative aspect-[1.586/1] w-full rounded-2xl bg-gradient-to-br p-5 shadow-2xl overflow-hidden",
          "border border-white/10 text-white",
          gradient
        )}
      >
        {/* Foil/holographic sheen - a soft light source that follows the cursor */}
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: hovering ? 0.9 : 0.45,
            background: `radial-gradient(circle at ${pointer.x * 100}% ${pointer.y * 100}%, rgba(255,255,255,0.55), transparent 55%)`,
          }}
        />
        {/* Holographic strip - hue-shifting diagonal band, catches "light" as pointer moves */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-color-dodge transition-transform duration-200 ease-out"
          style={{
            background:
              "linear-gradient(115deg, transparent 20%, #ff6ec7 32%, #7dd3fc 40%, #a78bfa 48%, #fca5a5 56%, transparent 68%)",
            backgroundSize: "250% 250%",
            transform: `translate(${(pointer.x - 0.5) * 30}%, ${(pointer.y - 0.5) * 30}%)`,
          }}
        />
        <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

        {rank && (
          <div className="absolute top-4 left-4 w-7 h-7 rounded-full bg-black/30 backdrop-blur flex items-center justify-center text-xs font-bold">
            #{rank}
          </div>
        )}

        {showSave && (
          <button
            onClick={(e) => { e.stopPropagation(); toggle(card); }}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/25 backdrop-blur flex items-center justify-center transition-colors hover:bg-black/40"
            aria-label={saved ? "Remove from saved" : "Save card"}
          >
            <Heart className={cn("w-4 h-4 transition-all", saved ? "fill-ember text-ember" : "text-white/80")} />
          </button>
        )}

        {/* Chip - embossed */}
        {!compact && (
          <div
            className="mt-7 w-8 h-6 rounded-md bg-gradient-to-br from-foil-light to-foil-dark relative"
            style={{ boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6), inset 0 -1px 1px rgba(0,0,0,0.4)" }}
          >
            <div className="absolute inset-1 rounded-sm border border-black/20" />
          </div>
        )}

        {!compact && (
          <div className="mt-2 flex items-center gap-3 text-white/60">
            <Wifi className="w-3.5 h-3.5 rotate-90" />
            {card.lounge_access && <Plane className="w-3.5 h-3.5" />}
            <p
              className="font-mono text-[11px] sm:text-xs tracking-[0.1em] text-white/80"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
            >
              {maskedNumber(card.id)}
            </p>
          </div>
        )}

        <div className={cn("absolute left-5 right-5 flex items-end justify-between gap-2", compact ? "bottom-4" : "bottom-5")}>
          <div className="min-w-0">
            <p
              className={cn(
                "font-heading font-semibold leading-tight truncate",
                compact ? "text-sm" : "text-base sm:text-lg"
              )}
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.15), 0 -1px 1px rgba(0,0,0,0.4)" }}
            >
              {card.name}
            </p>
            {!compact && <p className="text-xs text-white/70 truncate mt-0.5">{card.issuer}</p>}
          </div>
          <div className={cn("shrink-0 drop-shadow-md", compact && "scale-75 origin-bottom-right")}>
            <NetworkMark network={card.network} />
          </div>
        </div>

        {!compact && card.churn_risk && (
          <div
            className={cn(
              "absolute top-4 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full border font-medium uppercase tracking-wide",
              CHURN_STYLES[card.churn_risk] ?? "bg-white/10 text-white/70 border-white/20"
            )}
          >
            {card.churn_risk} churn
          </div>
        )}
      </div>

      {footer}
    </motion.div>
  );
}
