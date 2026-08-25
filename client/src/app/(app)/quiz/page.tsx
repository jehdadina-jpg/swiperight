"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwipeDeck, type SwipeDirection } from "@/components/swipe-deck";
import { SwipeCursor } from "@/components/swipe-cursor";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { Confetti } from "@/components/confetti";
import { recommendationAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import type { SavedCard } from "@/lib/savedCards";

interface Question {
  category: string | string[];
  emoji: string;
  rightStatement: string;
  leftStatement: string;
  highAmount: number;
  lowAmount: number;
}

const QUESTIONS: Question[] = [
  { category: "Dining", emoji: "🍽️", rightStatement: "I eat out or order in constantly", leftStatement: "I mostly cook at home", highAmount: 60000, lowAmount: 8000 },
  { category: "Travel", emoji: "✈️", rightStatement: "I travel often, work or leisure", leftStatement: "I rarely travel", highAmount: 100000, lowAmount: 5000 },
  { category: "Shopping", emoji: "🛍️", rightStatement: "Online shopping is a habit", leftStatement: "I shop rarely", highAmount: 70000, lowAmount: 8000 },
  { category: "Fuel", emoji: "⛽", rightStatement: "I drive a lot / own a car", leftStatement: "I don't drive much", highAmount: 40000, lowAmount: 3000 },
  { category: "Groceries", emoji: "🛒", rightStatement: "I do big grocery hauls", leftStatement: "I buy groceries occasionally", highAmount: 50000, lowAmount: 10000 },
  { category: "Entertainment", emoji: "🎬", rightStatement: "Movies, streaming, events - yes please", leftStatement: "Not really my thing", highAmount: 25000, lowAmount: 3000 },
  { category: ["Bills", "Utilities"], emoji: "📄", rightStatement: "I've got real fixed bills - rent, EMIs, utilities", leftStatement: "Minimal fixed monthly bills", highAmount: 80000, lowAmount: 10000 },
];

interface RankedCard {
  rank: number;
  card: SavedCard;
  reasoning: string;
  calculation_details: { net_annual_benefit: number; effective_reward_rate: number };
}

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  // A ref, not state: onComplete fires from a SwipeDeck closure captured
  // before the final swipe's state update would land, so reading `answers`
  // via React state here can silently drop the last answer. The ref is
  // always current regardless of render timing.
  const answersRef = useRef<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RankedCard[] | null>(null);

  const winner = results?.[0];
  const netBenefitDisplay = useCountUp(winner?.calculation_details.net_annual_benefit ?? 0);

  const handleSwipe = (q: Question, direction: SwipeDirection) => {
    const amount = direction === "right" ? q.highAmount : q.lowAmount;
    const categories = Array.isArray(q.category) ? q.category : [q.category];
    for (const c of categories) answersRef.current[c] = amount;
  };

  const finish = async () => {
    setLoading(true);
    setError(null);
    try {
      const recResult = await recommendationAPI.getRecommendation({
        manual_category_totals: answersRef.current,
        top_n: 5,
      });
      setResults(recResult.recommendations);
    } catch {
      setError("Couldn't generate your matches. Try again?");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setStarted(false);
    answersRef.current = {};
    setResults(null);
    setError(null);
  };

  return (
    <>
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {!started ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-6xl mb-4">👉</div>
            <h2 className="font-heading text-3xl font-bold text-ember mb-3">The Swipe Quiz</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              7 quick lifestyle questions. Swipe right if it sounds like you, left if it doesn&apos;t.
              We&apos;ll turn your answers into a spending profile and rank your top 5 cards.
            </p>
            <Button size="lg" onClick={() => setStarted(true)}>Let&apos;s Go</Button>
          </motion.div>
        ) : loading ? (
          <div className="text-center py-24">
            <div className="inline-flex p-4 rounded-full bg-ember/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-ember border-t-transparent" />
            </div>
            <p className="text-ember">Matching you to cards...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={restart}><RotateCcw className="w-4 h-4 mr-2" /> Try again</Button>
          </div>
        ) : results && winner ? (
          <div className="py-8 relative">
            <Confetti trigger="quiz-done" />
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-1">Your perfect match is</p>
              <h2 className="font-heading text-3xl font-bold text-ember">{winner.card.name}</h2>
            </div>
            <div className="max-w-xs mx-auto mb-6">
              <CreditCardVisual card={winner.card} rank={1} />
            </div>
            <p className="text-center text-2xl font-bold text-ember-light tabular-nums mb-8">
              {formatCurrency(netBenefitDisplay)}
              <span className="text-sm text-muted-foreground font-normal"> / year net benefit</span>
            </p>

            <div className="space-y-3 mb-8">
              {results.slice(1).map((r) => (
                <Card key={r.rank}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                      {r.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{r.card.name}</p>
                      <p className="text-xs text-muted-foreground">{r.card.issuer}</p>
                    </div>
                    <p className="text-sm font-bold text-ember shrink-0">
                      {formatCurrency(r.calculation_details.net_annual_benefit)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={restart}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button className="w-full">Refine in Dashboard</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <SwipeCursor>
              <SwipeDeck
                items={QUESTIONS}
                leftLabel="Not me"
                rightLabel="That's me"
                renderItem={(q) => (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-ink-3 to-ink-4 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center p-8 gap-6">
                    <div className="text-5xl">{q.emoji}</div>
                    <div>
                      <p className="text-lg font-semibold text-ember-light mb-1">{q.rightStatement}</p>
                      <p className="text-xs text-muted-foreground">— swipe right —</p>
                    </div>
                    <div className="w-12 h-px bg-white/10" />
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{q.leftStatement}</p>
                      <p className="text-xs text-muted-foreground">— swipe left —</p>
                    </div>
                  </div>
                )}
                onSwipe={handleSwipe}
                onComplete={finish}
              />
            </SwipeCursor>
          </div>
        )}
      </div>
    </>
  );
}
