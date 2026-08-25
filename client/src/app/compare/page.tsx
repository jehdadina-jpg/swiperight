"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Plane, Check, X as XIcon } from "lucide-react";
import { Nav } from "@/components/nav";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { Card, CardContent } from "@/components/ui/card";
import { cardsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { SavedCard } from "@/lib/savedCards";

interface FullCard extends SavedCard {
  fuel_benefits?: Record<string, unknown> | null;
  dining_benefits?: Record<string, unknown> | null;
  travel_benefits?: Record<string, unknown> | null;
  shopping_benefits?: Record<string, unknown> | null;
}

const ROWS: { label: string; get: (c: FullCard) => React.ReactNode }[] = [
  { label: "Network", get: (c) => c.network },
  { label: "Annual Fee", get: (c) => (c.annual_fee === 0 ? "Free" : formatCurrency(c.annual_fee)) },
  { label: "Joining Fee", get: (c) => (c.joining_fee === 0 ? "Free" : formatCurrency(c.joining_fee)) },
  { label: "Reward Rate", get: (c) => `${c.reward_rate}%` },
  { label: "Lounge Access", get: (c) => (c.lounge_access ? <Check className="w-4 h-4 text-teal mx-auto" /> : <XIcon className="w-4 h-4 text-muted-foreground mx-auto" />) },
  { label: "Churn Risk", get: (c) => <span className="capitalize">{c.churn_risk}</span> },
  { label: "Min Income", get: (c) => (c.min_income ? formatCurrency(c.min_income) : "None") },
  { label: "Min CIBIL", get: (c) => c.min_cibil ?? "None" },
  { label: "Best For", get: (c) => c.tags?.join(", ") || "—" },
];

function parseIds(params: URLSearchParams): number[] {
  return (params.get("ids") ?? "")
    .split(",")
    .map((s) => Number(s))
    .filter((n) => !isNaN(n));
}

function CompareContent() {
  const params = useSearchParams();
  const [cards, setCards] = useState<FullCard[]>([]);
  // No ids means nothing to fetch, so start not-loading rather than
  // synchronously flipping loading -> false inside the effect below.
  const [loading, setLoading] = useState(() => parseIds(params).length > 0);

  useEffect(() => {
    const ids = parseIds(params);
    if (ids.length === 0) return;

    Promise.all(ids.map((id) => cardsAPI.getById(id)))
      .then(setCards)
      .finally(() => setLoading(false));
  }, [params]);

  return (
    <div className="min-h-screen bg-navy">
      <Nav />
      <div className="container mx-auto px-6 py-8">
        <h2 className="font-heading text-3xl font-bold text-gold mb-2">Compare Cards</h2>
        <p className="text-muted-foreground mb-8">Side by side, so the tradeoffs are obvious.</p>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
            </div>
          </div>
        ) : cards.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No cards selected. Pick 2-3 cards from the{" "}
              <a href="/cards" className="text-gold hover:underline">Card Directory</a> or your{" "}
              <a href="/saved" className="text-gold hover:underline">Saved Cards</a> to compare them here.
            </CardContent>
          </Card>
        ) : (
          <>
            <div
              className="grid gap-6 mb-8"
              style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}
            >
              {cards.map((card, i) => (
                <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <CreditCardVisual card={card} />
                </motion.div>
              ))}
            </div>

            <Card className="overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {ROWS.map((row, ri) => (
                      <tr key={row.label} className={ri % 2 === 0 ? "bg-white/[0.02]" : ""}>
                        <td className="p-4 font-medium text-muted-foreground whitespace-nowrap">{row.label}</td>
                        {cards.map((card) => (
                          <td key={card.id} className="p-4 text-center">{row.get(card)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {cards.some((c) => c.lounge_access && (c.travel_benefits || c.dining_benefits || c.fuel_benefits || c.shopping_benefits)) && (
              <div className="grid gap-6 mt-8" style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}>
                {cards.map((card) => (
                  <Card key={card.id}>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-semibold text-sm text-gold">{card.name}</p>
                      {card.lounge_access && (
                        <p className="text-xs flex items-center gap-1.5 text-teal-light">
                          <Plane className="w-3.5 h-3.5" /> Lounge access included
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareContent />
    </Suspense>
  );
}
