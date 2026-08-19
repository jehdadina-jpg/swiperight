"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, CreditCard, TrendingUp, Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { uploadAPI, recommendationAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface UploadedStatement {
  id: number;
  file_name: string;
  file_type: string;
  status: string;
}

interface RecommendationResult {
  card: { name: string; issuer: string };
  reasoning: string;
  calculation_details: {
    net_annual_benefit: number;
    effective_reward_rate: number;
  };
}

export default function Dashboard() {
  const [uploadedStatement, setUploadedStatement] = useState<UploadedStatement | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadAPI.uploadStatement(file);
      setUploadedStatement(result);

      // Auto-analyze
      setAnalyzing(true);
      await uploadAPI.analyzeStatement(result.id);
      setAnalyzing(false);

      // Auto-recommend
      setLoading(true);
      const recResult = await recommendationAPI.getRecommendation({
        statement_id: result.id,
      });
      setRecommendation(recResult);
      setLoading(false);
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="border-b border-white/10 bg-navy-2 sticky top-0 z-50 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">💳</div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-gold">SwipeRight</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Card Advisor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-gold/20 hover:border-gold/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gold/10">
                    <Upload className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statements</p>
                    <p className="text-2xl font-bold text-gold">{uploadedStatement ? "1" : "0"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-teal/20 hover:border-teal/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-teal/10">
                    <CreditCard className="w-6 h-6 text-teal" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cards Analyzed</p>
                    <p className="text-2xl font-bold text-teal">140+</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-gold-light/20 hover:border-gold-light/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gold-light/10">
                    <TrendingUp className="w-6 h-6 text-gold-light" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Savings</p>
                    <p className="text-2xl font-bold text-gold-light">
                      {recommendation ? formatCurrency(recommendation.calculation_details.net_annual_benefit) : "₹0"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-gold/20 hover:border-gold/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-gold/10">
                    <Sparkles className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Ready</p>
                    <p className="text-2xl font-bold text-gold">✓</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-gold" />
                    Upload Your Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendation Card (Hidden until analysis) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6"
            >
              <Card className="border-gold/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold" />
                    Your Perfect Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex p-4 rounded-full bg-gold/10 mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gold border-t-transparent" />
                      </div>
                      <p className="text-gold">Finding your perfect card...</p>
                    </div>
                  ) : recommendation ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center text-3xl">
                          💳
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-heading font-bold text-gold mb-1">
                            {recommendation.card.name}
                          </h3>
                          <p className="text-muted-foreground">{recommendation.card.issuer}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-teal/10 border border-teal/20">
                        <p className="text-sm text-teal-light">{recommendation.reasoning}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-navy-3">
                          <p className="text-xs text-muted-foreground mb-1">Net Annual Benefit</p>
                          <p className="text-xl font-bold text-gold">
                            {formatCurrency(recommendation.calculation_details.net_annual_benefit)}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-navy-3">
                          <p className="text-xs text-muted-foreground mb-1">Reward Rate</p>
                          <p className="text-xl font-bold text-teal">
                            {recommendation.calculation_details.effective_reward_rate}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1">Apply Now</Button>
                        <Button variant="outline">Learn More</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Upload a statement to get your personalized recommendation
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
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

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium">Upload Statement</p>
                        <p className="text-xs text-muted-foreground">PDF or CSV format</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium">AI Analysis</p>
                        <p className="text-xs text-muted-foreground">Categorize spending</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium">Get ONE Card</p>
                        <p className="text-xs text-muted-foreground">Best match guaranteed</p>
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
