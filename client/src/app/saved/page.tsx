"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, HeartOff } from "lucide-react";
import { Nav } from "@/components/nav";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSavedCards } from "@/lib/savedCards";

export default function SavedCardsPage() {
  const router = useRouter();
  const { saved, unsave } = useSavedCards();
  const cards = Object.values(saved);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  const compareSelected = () => {
    router.push(`/compare?ids=${Array.from(selected).join(",")}`);
  };

  return (
    <div className="min-h-screen bg-navy">
      <Nav />
      <div className="container mx-auto px-6 py-8 pb-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold text-gold mb-2">Saved Cards</h2>
            <p className="text-muted-foreground">
              {cards.length === 0 ? "Nothing saved yet." : `${cards.length} card${cards.length === 1 ? "" : "s"} — select up to 3 to compare`}
            </p>
          </div>
        </div>

        {cards.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <HeartOff className="w-8 h-8 mx-auto mb-3 opacity-40" />
              Tap the heart on any card in the{" "}
              <a href="/cards" className="text-gold hover:underline">Card Directory</a> or your recommendations to save it here.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <button
                    onClick={() => toggleSelect(card.id)}
                    className={`absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      selected.has(card.id)
                        ? "bg-gold border-gold text-navy"
                        : "bg-navy-2 border-white/20 text-transparent hover:border-gold/50"
                    }`}
                    aria-label="Select for comparison"
                  >
                    ✓
                  </button>
                  <CreditCardVisual
                    card={card}
                    footer={
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => unsave(card.id)}>
                          Remove
                        </Button>
                      </div>
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected.size >= 2 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <Button size="lg" onClick={compareSelected} className="shadow-2xl">
              <Layers className="w-4 h-4 mr-2" /> Compare {selected.size} Cards
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
