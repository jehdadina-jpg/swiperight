"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, MessageSquare, SlidersHorizontal, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadZone } from "@/components/upload-zone";
import { Nav } from "@/components/nav";
import { uploadAPI, recommendationAPI, cardsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { SPENDING_CATEGORIES, CATEGORY_ICONS } from "@/lib/constants";

interface RankedCard {
  rank: number;
  card: { name: string; issuer: string; reward_rate: number; lounge_access: boolean };
  reasoning: string;
  calculation_details: {
    net_annual_benefit: number;
    effective_reward_rate: number;
  };
}

type Mode = "upload" | "manual";

export default function Dashboard() {
  const [mode, setMode] = useState<Mode>("upload");
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RankedCard[] | null>(null);

  // Manual category entry
  const [manualAmounts, setManualAmounts] = useState<Record<string, string>>({});

  // Preferences
  const [showPreferences, setShowPreferences] = useState(false);
  const [issuers, setIssuers] = useState<string[]>([]);
  const [excludedIssuers, setExcludedIssuers] = useState<Set<string>>(new Set());
  const [maxAnnualFee, setMaxAnnualFee] = useState("");
  const [requireLounge, setRequireLounge] = useState(false);

  useEffect(() => {
    cardsAPI.getIssuers().then(setIssuers).catch(() => setIssuers([]));
  }, []);

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
      setResults(recResult.recommendations);
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
      const n = Number(value);
      if (n > 0) manual_category_totals[category] = n;
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
      setResults(recResult.recommendations);
    } catch (err) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Something went wrong generating recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      <Nav />

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
                        <div className="mt-4 p-4 rounded-lg bg-gold/10 border border-gold/20">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gold border-t-transparent" />
                            <span className="text-sm text-gold">Analyzing your statement...</span>
                          </div>
                        </div>
                      )}
                      <div className="mt-6 p-4 rounded-lg bg-teal/10 border border-teal/20">
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
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Estimate your yearly spend per category to get recommendations without uploading a statement.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {SPENDING_CATEGORIES.map((category) => (
                          <div key={category}>
                            <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                              <span>{CATEGORY_ICONS[category]}</span> {category}
                            </label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="₹0"
                              value={manualAmounts[category] ?? ""}
                              onChange={(e) =>
                                setManualAmounts((prev) => ({ ...prev, [category]: e.target.value }))
                              }
                            />
                          </div>
                        ))}
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
                      <SlidersHorizontal className="w-4 h-4 text-gold" /> Preferences
                      {(excludedIssuers.size > 0 || maxAnnualFee || requireLounge) && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold">Active</span>
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
                                : "border-white/15 text-muted-foreground hover:border-gold/40"
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
                        <Input
                          type="number"
                          min={0}
                          placeholder="No limit"
                          value={maxAnnualFee}
                          onChange={(e) => setMaxAnnualFee(e.target.value)}
                        />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-gold"
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
              <Card className="border-gold/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    Top 5 Cards For You
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
                      </div>
                      <p className="text-gold">Ranking cards for your spending...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-destructive text-sm">{error}</div>
                  ) : results && results.length > 0 ? (
                    <div className="space-y-4">
                      {results.map((r) => (
                        <div
                          key={r.rank}
                          className={`p-4 rounded-lg border ${
                            r.rank === 1 ? "border-gold/50 bg-gold/5" : "border-white/10 bg-navy-3"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                r.rank === 1 ? "bg-gold text-navy" : "bg-white/10 text-muted-foreground"
                              }`}
                            >
                              {r.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-heading font-bold text-gold">{r.card.name}</h3>
                                {r.card.lounge_access && <Plane className="w-3.5 h-3.5 text-teal" />}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{r.card.issuer}</p>
                              <p className="text-xs text-muted-foreground mb-3">{r.reasoning}</p>
                              <div className="flex gap-6">
                                <div>
                                  <p className="text-xs text-muted-foreground">Net Annual Benefit</p>
                                  <p className="font-bold text-gold">
                                    {formatCurrency(r.calculation_details.net_annual_benefit)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Reward Rate</p>
                                  <p className="font-bold text-teal">
                                    {r.calculation_details.effective_reward_rate}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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
              <Card className="border-teal/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal" />
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
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">1</div>
                      <div>
                        <p className="text-sm font-medium">Upload or enter spending</p>
                        <p className="text-xs text-muted-foreground">PDF/CSV statement, or manual amounts by category</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">2</div>
                      <div>
                        <p className="text-sm font-medium">Set preferences</p>
                        <p className="text-xs text-muted-foreground">Exclude banks, set a fee limit, require lounge access</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">3</div>
                      <div>
                        <p className="text-sm font-medium">Get your top 5</p>
                        <p className="text-xs text-muted-foreground">Ranked best to worst for your spending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
