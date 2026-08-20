"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Nav } from "@/components/nav";
import { cardsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface CardItem {
  id: number;
  name: string;
  issuer: string;
  network: string;
  annual_fee: number;
  joining_fee: number;
  reward_rate: number;
  tags: string[];
  highlight: string | null;
  lounge_access: boolean;
  churn_risk: string;
}

const SORT_OPTIONS = [
  { value: "reward_rate", label: "Reward Rate" },
  { value: "annual_fee", label: "Annual Fee" },
  { value: "name", label: "Name" },
];

export default function CardsDirectory() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [issuers, setIssuers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loungeOnly, setLoungeOnly] = useState(false);
  const [freeOnly, setFreeOnly] = useState(false);
  const [sortBy, setSortBy] = useState("reward_rate");

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

  return (
    <div className="min-h-screen bg-navy">
      <Nav />

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold text-gold mb-2">Card Directory</h2>
          <p className="text-muted-foreground">
            Browse every card in our system{cards.length > 0 && !loading ? ` — ${cards.length} shown` : ""}
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
                className="h-10 rounded-lg border border-border bg-navy-3 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
              >
                <option value="">All Issuers</option>
                {issuers.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>

              <select
                className="h-10 rounded-lg border border-border bg-navy-3 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
                  className="accent-gold"
                  checked={loungeOnly}
                  onChange={(e) => setLoungeOnly(e.target.checked)}
                />
                Lounge access only
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-gold"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                />
                Lifetime free only
              </label>
              {(search || issuer || loungeOnly || freeOnly) && (
                <button
                  className="text-sm text-gold hover:underline"
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
            <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
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
              >
                <Card className="h-full border-gold/20 hover:border-gold/40 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">{card.name}</CardTitle>
                      {card.lounge_access && <Plane className="w-4 h-4 text-teal shrink-0 mt-1" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{card.issuer} · {card.network}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {card.highlight && (
                      <p className="text-sm text-teal-light">{card.highlight}</p>
                    )}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div>
                        <p className="text-xs text-muted-foreground">Annual Fee</p>
                        <p className="font-semibold text-gold">
                          {card.annual_fee === 0 ? "Free" : formatCurrency(card.annual_fee)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reward Rate</p>
                        <p className="font-semibold text-teal">{card.reward_rate}%</p>
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
    </div>
  );
}
