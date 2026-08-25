"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { cardsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { SavedCard } from "@/lib/savedCards";

const SORT_OPTIONS = [
  { value: "reward_rate", label: "Reward Rate" },
  { value: "annual_fee", label: "Annual Fee" },
  { value: "name", label: "Name" },
];

export default function CardsDirectory() {
  const router = useRouter();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [issuers, setIssuers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loungeOnly, setLoungeOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("reward_rate");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    cardsAPI.getIssuers().then(setIssuers).catch(() => setIssuers([]));
  }, []);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cardsAPI.getAll({
        limit: 100,
        search: search || undefined,
        issuer: issuer || undefined,
        lounge_access: loungeOnly || undefined,
        max_annual_fee: freeOnly ? 0 : undefined,
        sort_by: sortBy,
        sort_dir: sortBy === "annual_fee" ? "asc" : "desc",
      });
      setCards(data);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [search, issuer, loungeOnly, freeOnly, sortBy]);

  useEffect(() => {
    const timeout = setTimeout(fetchCards, 250);
    return () => clearTimeout(timeout);
  }, [fetchCards]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8 pb-28">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-ember mb-2">Card Directory</h2>
          <p className="text-muted-foreground">
            Browse every card in our system{cards.length > 0 && !loading ? ` — ${cards.length} shown` : ""}. Tap a card to select it for comparison.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by card name or issuer..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="h-10 rounded-lg border border-border bg-ink-3 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              >
                <option value="">All Issuers</option>
                {issuers.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-lg border border-border bg-ink-3 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>Sort: {o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-ember"
                  checked={loungeOnly}
                  onChange={(e) => setLoungeOnly(e.target.checked)}
                />
                Lounge access only
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-ember"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                />
                Lifetime free only
              </label>
              {(search || issuer || loungeOnly || freeOnly) && (
                <button
                  className="text-sm text-ember hover:underline"
                  onClick={() => {
                    setSearch("");
                    setIssuer("");
                    setLoungeOnly(false);
                    setFreeOnly(false);
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-ember/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-ember border-t-transparent" />
            </div>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No cards match these filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="relative"
              >
                <button
                  onClick={() => toggleSelect(card.id)}
                  className={`absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                    selected.has(card.id)
                      ? "bg-ember border-ember text-ink"
                      : "bg-ink-2 border-white/20 text-transparent hover:border-ember/50"
                  }`}
                  aria-label="Select for comparison"
                >
                  ✓
                </button>
                <CreditCardVisual card={card} className="mb-3" />
                <Card className="border-ember/10">
                  <CardContent className="p-4 space-y-3">
                    {card.highlight && (
                      <p className="text-sm text-verdigris-light">{card.highlight}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Fee</p>
                        <p className="font-semibold text-ember">
                          {card.annual_fee === 0 ? "Free" : formatCurrency(card.annual_fee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reward Rate</p>
                        <p className="font-semibold text-verdigris">{card.reward_rate}%</p>
                      </div>
                    </div>
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {card.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
            <Button size="lg" onClick={() => router.push(`/compare?ids=${Array.from(selected).join(",")}`)} className="shadow-2xl">
              <Layers className="w-4 h-4 mr-2" /> Compare {selected.size} Cards
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
