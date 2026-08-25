"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toPng } from "html-to-image";
import {
  Upload, Sparkles, MessageSquare, SlidersHorizontal, Plane,
  Download, Layers, Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { SwipeDeck } from "@/components/swipe-deck";
import { SwipeCursor } from "@/components/swipe-cursor";
import { Confetti } from "@/components/confetti";
import { uploadAPI, recommendationAPI, cardsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import { useSavedCards, type SavedCard } from "@/lib/savedCards";
import { SPENDING_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/constants";

interface RankedCard {
  rank: number;
  card: SavedCard;
  reasoning: string;
  calculation_details: {
    net_annual_benefit: number;
    effective_reward_rate: number;
    yearly_spend: number;
    breakeven_spend: number | null;
  };
}

type Mode = "upload" | "manual";

const SLIDER_MAX = 200000;
const SLIDER_STEP = 500;

export default function Dashboard() {
  const [mode, setMode] = useState<Mode>("upload");
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RankedCard[] | null>(null);
  const [categoryTotalsUsed, setCategoryTotalsUsed] = useState<Record<string, number>>({});
  const [deckDone, setDeckDone] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const winnerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  // Manual category entry
  const [manualAmounts, setManualAmounts] = useState<Record<string, number>>({});

  // Preferences
  const [showPreferences, setShowPreferences] = useState(false);
  const [issuers, setIssuers] = useState<string[]>([]);
  const [excludedIssuers, setExcludedIssuers] = useState<Set<string>>(new Set());
  const [maxAnnualFee, setMaxAnnualFee] = useState("");
  const [requireLounge, setRequireLounge] = useState(false);

  const { save } = useSavedCards();

  useEffect(() => {
    cardsAPI.getIssuers().then(setIssuers).catch(() => setIssuers([]));
  }, []);

  const winner = results?.[0];
  const netBenefitDisplay = useCountUp(winner?.calculation_details.net_annual_benefit ?? 0);

  const toggleIssuer = (issuer: string) => {
    setExcludedIssuers((prev) => {
      const next = new Set(prev);
      if (next.has(issuer)) next.delete(issuer);
      else next.add(issuer);
      return next;
    });
  };

  const buildPreferences = () => ({
    excluded_issuers: excludedIssuers.size > 0 ? Array.from(excludedIssuers) : undefined,
    max_annual_fee: maxAnnualFee ? Number(maxAnnualFee) : undefined,
    require_lounge_access: requireLounge || undefined,
    top_n: 5,
  });

  const applyResults = (recResult: { recommendations: RankedCard[]; category_totals_used: Record<string, number> }) => {
    setResults(recResult.recommendations);
    setCategoryTotalsUsed(recResult.category_totals_used);
    setDeckDone(false);
    setConfettiKey((k) => k + 1);
  };

  const handleUpload = async (file: File) => {
    setError(null);
    setResults(null);
    try {
      const uploaded = await uploadAPI.uploadStatement(file);

      setAnalyzing(true);
      await uploadAPI.analyzeStatement(uploaded.id);
      setAnalyzing(false);

      setLoading(true);
      const recResult = await recommendationAPI.getRecommendation({
        statement_id: uploaded.id,
        ...buildPreferences(),
      });
      applyResults(recResult);
    } catch (err) {
      setAnalyzing(false);
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong processing that file.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    setError(null);
    setResults(null);

    const manual_category_totals: Record<string, number> = {};
    for (const [category, value] of Object.entries(manualAmounts)) {
      if (value > 0) manual_category_totals[category] = value;
    }

    if (Object.keys(manual_category_totals).length === 0) {
      setError("Enter an amount in at least one category.");
      return;
    }

    setLoading(true);
    try {
      const recResult = await recommendationAPI.getRecommendation({
        manual_category_totals,
        ...buildPreferences(),
      });
      applyResults(recResult);
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong generating recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const downloadWinnerCard = async () => {
    if (!winnerRef.current || !winner) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(winnerRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `${winner.card.name.replace(/\s+/g, "-").toLowerCase()}-swiperight.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Couldn't generate the image. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const chartData = Object.entries(categoryTotalsUsed)
    .filter(([, v]) => v > 0)
    .map(([category, value]) => ({ name: category, value }));

  return (
    <>
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={mode === "upload" ? "default" : "outline"}
                      onClick={() => { setMode("upload"); setResults(null); setError(null); }}
                    >
                      <Upload className="w-4 h-4 mr-1.5" /> Upload Statement
                    </Button>
                    <Button
                      size="sm"
                      variant={mode === "manual" ? "default" : "outline"}
                      onClick={() => { setMode("manual"); setResults(null); setError(null); }}
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-1.5" /> Manual Entry
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {mode === "upload" ? (
                    <>
                      <UploadZone onUpload={handleUpload} />
                      {analyzing && (
                        <div className="mt-4 p-4 rounded-lg bg-ember/10 border border-ember/20">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-ember border-t-transparent" />
                            <span className="text-sm text-ember">Analyzing your statement...</span>
                          </div>
                        </div>
                      )}
                      <div className="mt-6 p-4 rounded-lg bg-verdigris/10 border border-verdigris/20">
                        <div className="flex gap-3">
                          <div className="text-2xl">🔒</div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Privacy First</h4>
                            <p className="text-xs text-muted-foreground">
                              Your statement is analyzed locally and deleted immediately after processing.
                              We never store raw transaction data.
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-5">
                      <p className="text-sm text-muted-foreground">
                        Drag each slider to estimate your yearly spend per category.
                      </p>
                      <div className="space-y-4">
                        {SPENDING_CATEGORIES.map((category) => {
                          const value = manualAmounts[category] ?? 0;
                          const pct = Math.min(100, (value / SLIDER_MAX) * 100);
                          return (
                            <div key={category}>
                              <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <span>{CATEGORY_ICONS[category]}</span> {category}
                                </span>
                                <span className="font-medium text-ember tabular-nums">
                                  {value > 0 ? formatCurrency(value) : "—"}
                                </span>
                              </div>
                              <div className="relative h-2 rounded-full bg-ink-3 overflow-hidden">
                                <div
                                  className="absolute inset-y-0 left-0 rounded-full"
                                  style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[category] }}
                                />
                                <input
                                  type="range"
                                  min={0}
                                  max={SLIDER_MAX}
                                  step={SLIDER_STEP}
                                  value={value}
                                  onChange={(e) =>
                                    setManualAmounts((prev) => ({ ...prev, [category]: Number(e.target.value) }))
                                  }
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  aria-label={`${category} yearly spend`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Button onClick={handleManualSubmit} disabled={loading} className="w-full">
                        {loading ? "Ranking cards..." : "Get Recommendations"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Preferences */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="cursor-pointer" onClick={() => setShowPreferences((v) => !v)}>
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-ember" /> Preferences
                      {(excludedIssuers.size > 0 || maxAnnualFee || requireLounge) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-ember/10 text-ember">Active</span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">{showPreferences ? "Hide" : "Customize"}</span>
                  </CardTitle>
                </CardHeader>
                {showPreferences && (
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">Exclude banks</label>
                      <div className="flex flex-wrap gap-2">
                        {issuers.map((issuer) => (
                          <button
                            key={issuer}
                            onClick={() => toggleIssuer(issuer)}
                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                              excludedIssuers.has(issuer)
                                ? "border-destructive text-destructive bg-destructive/10 line-through"
                                : "border-white/15 text-muted-foreground hover:border-ember/40"
                            }`}
                          >
                            {issuer}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max annual fee (₹)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="No limit"
                          value={maxAnnualFee}
                          onChange={(e) => setMaxAnnualFee(e.target.value)}
                          className="flex h-10 w-full rounded-lg border border-border bg-ink-3 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-ember"
                            checked={requireLounge}
                            onChange={(e) => setRequireLounge(e.target.checked)}
                          />
                          Require lounge access
                        </label>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-ember/40 relative overflow-hidden">
                {results && <Confetti trigger={confettiKey} />}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-ember" />
                    Top 5 Cards For You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-40 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive text-sm">{error}</div>
                  ) : results && winner ? (
                    <div className="space-y-8">
                      {/* Headline winner */}
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div ref={winnerRef} className="w-56 shrink-0 p-3 bg-ink rounded-2xl">
                          <CreditCardVisual card={winner.card} rank={1} tilt={false} />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Your best match</p>
                          <h3 className="font-heading text-2xl font-bold text-ember">{winner.card.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{winner.card.issuer}</p>
                          <p className="text-3xl font-bold text-ember-light tabular-nums">
                            {formatCurrency(netBenefitDisplay)}
                            <span className="text-sm text-muted-foreground font-normal"> / year net benefit</span>
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={downloadWinnerCard}
                            disabled={downloading}
                          >
                            <Download className="w-3.5 h-3.5 mr-1.5" />
                            {downloading ? "Generating..." : "Download this card"}
                          </Button>
                        </div>
                      </div>

                      {/* Spend breakdown donut */}
                      {chartData.length > 0 && (
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-ink-3">
                          <div className="w-28 h-28 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={48} paddingAngle={2} isAnimationActive={false}>
                                  {chartData.map((entry) => (
                                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] ?? "#666"} />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(v: number) => formatCurrency(v)}
                                  contentStyle={{ background: "#141210", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                            {chartData.map((d) => (
                              <div key={d.name} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[d.name as keyof typeof CATEGORY_COLORS] ?? "#666" }} />
                                <span className="text-muted-foreground">{d.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Swipe deck through the top 5 */}
                      <div>
                        <p className="text-sm font-medium mb-4 text-center">Swipe through your top 5 — shortlist the ones you like</p>
                        <SwipeCursor>
                          <SwipeDeck
                            items={results}
                            renderItem={(r) => <CreditCardVisual card={r.card} rank={r.rank} showSave={false} />}
                            onSwipe={(r, direction) => {
                              if (direction === "right") save(r.card);
                            }}
                            onComplete={() => setDeckDone(true)}
                          />
                        </SwipeCursor>
                        {deckDone && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-sm text-verdigris-light mt-4 flex items-center justify-center gap-1.5"
                          >
                            <Heart className="w-4 h-4" /> Check your{" "}
                            <a href="/saved" className="underline">Saved Cards</a> for anything you shortlisted
                          </motion.p>
                        )}
                      </div>

                      {/* Full ranked breakdown */}
                      <div className="space-y-3">
                        {results.map((r) => {
                          const breakeven = r.calculation_details.breakeven_spend;
                          const spend = r.calculation_details.yearly_spend;
                          const breakevenPct = breakeven && breakeven > 0 ? Math.min(100, (spend / breakeven) * 100) : null;
                          return (
                            <div
                              key={r.rank}
                              className={`p-4 rounded-lg border ${
                                r.rank === 1 ? "border-ember/50 bg-ember/5" : "border-white/10 bg-ink-3"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    r.rank === 1 ? "bg-ember text-ink" : "bg-white/10 text-muted-foreground"
                                  }`}
                                >
                                  {r.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-heading font-bold text-ember">{r.card.name}</h3>
                                    {r.card.lounge_access && <Plane className="w-3.5 h-3.5 text-verdigris" />}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{r.card.issuer}</p>
                                  <p className="text-xs text-muted-foreground mb-3">{r.reasoning}</p>
                                  <div className="flex gap-6 mb-3">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Net Annual Benefit</p>
                                      <p className="font-bold text-ember">
                                        {formatCurrency(r.calculation_details.net_annual_benefit)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Reward Rate</p>
                                      <p className="font-bold text-verdigris">
                                        {r.calculation_details.effective_reward_rate}%
                                      </p>
                                    </div>
                                  </div>
                                  {breakevenPct !== null && (
                                    <div>
                                      <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                                        <span>Breakeven progress</span>
                                        <span>{formatCurrency(spend)} / {formatCurrency(breakeven!)}</span>
                                      </div>
                                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                                        <div
                                          className={`h-full rounded-full ${breakevenPct >= 100 ? "bg-verdigris" : "bg-ember"}`}
                                          style={{ width: `${breakevenPct}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <a href="/saved">
                        <Button variant="outline" className="w-full">
                          <Layers className="w-4 h-4 mr-2" /> View Saved &amp; Compare
                        </Button>
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Upload a statement or enter spending manually to see your top 5 cards
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="border-verdigris/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-verdigris" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Ask me anything about credit cards, rewards, or your spending!
                    </p>
                    <Button variant="outline" className="w-full">
                      Start Chatting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ember/20 flex items-center justify-center text-xs font-bold text-ember">1</div>
                      <div>
                        <p className="text-sm font-medium">Upload or enter spending</p>
                        <p className="text-xs text-muted-foreground">PDF/CSV statement, or drag sliders by category</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ember/20 flex items-center justify-center text-xs font-bold text-ember">2</div>
                      <div>
                        <p className="text-sm font-medium">Set preferences</p>
                        <p className="text-xs text-muted-foreground">Exclude banks, set a fee limit, require lounge access</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-ember/20 flex items-center justify-center text-xs font-bold text-ember">3</div>
                      <div>
                        <p className="text-sm font-medium">Swipe your top 5</p>
                        <p className="text-xs text-muted-foreground">Shortlist favorites, compare, download your match</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
