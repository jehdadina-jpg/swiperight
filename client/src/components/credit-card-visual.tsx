"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plane, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedCards, type SavedCard } from "@/lib/savedCards";

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
const DEFAULT_GRADIENT = "from-navy-4 via-navy-3 to-navy-2";

const CHURN_STYLES: Record<string, string> = {
  low: "bg-teal/20 text-teal-light border-teal/30",
  medium: "bg-gold/20 text-gold-light border-gold/30",
  high: "bg-destructive/20 text-red-300 border-destructive/40",
};

interface CreditCardVisualProps {
  card: SavedCard;
  className?: string;
  tilt?: boolean;
  showSave?: boolean;
  rank?: number;
  footer?: React.ReactNode;
}

export function CreditCardVisual({ card, className, tilt = true, showSave = true, rank, footer }: CreditCardVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const { isSaved, toggle } = useSavedCards();
  const saved = isSaved(card.id);
  const gradient = ISSUER_GRADIENTS[card.issuer] ?? DEFAULT_GRADIENT;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: py * -10, y: px * 12 });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
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
        {/* Sheen */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5" />
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
            <Heart className={cn("w-4 h-4 transition-all", saved ? "fill-red-400 text-red-400" : "text-white/80")} />
          </button>
        )}

        {/* Chip */}
        <div className="mt-8 w-9 h-7 rounded-md bg-gradient-to-br from-gold-light to-gold-dark opacity-90 relative">
          <div className="absolute inset-1 rounded-sm border border-black/20" />
        </div>

        <div className="mt-3 flex items-center gap-2 text-white/60">
          <Wifi className="w-4 h-4 rotate-90" />
          {card.lounge_access && <Plane className="w-3.5 h-3.5" />}
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <p className="font-heading font-bold text-lg leading-tight truncate drop-shadow">{card.name}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-white/70 truncate">{card.issuer}</p>
            <p className="text-xs uppercase tracking-wider text-white/70">{card.network}</p>
          </div>
        </div>

        {card.churn_risk && (
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
