"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, SlidersHorizontal, Layers, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreditCardVisual } from "@/components/credit-card-visual";

const SHOWCASE_CARDS = [
  { id: 1, name: "Axis Bank Magnus", issuer: "Axis Bank", network: "Mastercard", annual_fee: 10000, joining_fee: 10000, reward_rate: 12, tags: ["travel", "premium"], highlight: null, lounge_access: true, churn_risk: "low" },
  { id: 2, name: "ICICI Amazon Pay", issuer: "ICICI Bank", network: "Visa", annual_fee: 0, joining_fee: 0, reward_rate: 5, tags: ["cashback"], highlight: null, lounge_access: false, churn_risk: "low" },
  { id: 3, name: "HDFC Infinia Metal", issuer: "HDFC Bank", network: "Visa", annual_fee: 12500, joining_fee: 12500, reward_rate: 3.3, tags: ["premium"], highlight: null, lounge_access: true, churn_risk: "medium" },
];

const ROTATIONS = [-14, 4, 16];
const OFFSETS = [-40, 0, 40];

export default function Home() {
  return (
    <div className="min-h-screen bg-navy overflow-hidden relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal/10 blur-[100px]" />

      <div className="relative container mx-auto px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-16"
        >
          <div className="text-4xl">💳</div>
          <div>
            <h1 className="font-heading text-xl font-bold text-gold">SwipeRight</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Card Advisor</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading text-5xl md:text-6xl font-bold leading-tight mb-6">
              Find your{" "}
              <span className="gradient-gold text-gradient">perfect card</span>{" "}
              match.
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Upload a statement or just tell us how you spend — we&apos;ll rank the
              top 5 credit cards built for your lifestyle, from a catalog of real
              Indian cards.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  <Upload className="w-4 h-4 mr-2" /> Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/quiz">
                  <Sparkles className="w-4 h-4 mr-2" /> Take the Swipe Quiz
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 max-w-md">
              <FeaturePill icon={<Upload className="w-4 h-4" />} label="Upload statement" />
              <FeaturePill icon={<SlidersHorizontal className="w-4 h-4" />} label="Set preferences" />
              <FeaturePill icon={<Layers className="w-4 h-4" />} label="Compare top 5" />
            </div>
          </motion.div>

          {/* Fanned card showcase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative h-[340px] flex items-center justify-center"
          >
            {SHOWCASE_CARDS.map((card, i) => (
              <motion.div
                key={card.id}
                className="absolute w-64"
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: ROTATIONS[i], x: OFFSETS[i] }}
                whileHover={{ y: -12, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
                transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                style={{ zIndex: i }}
              >
                <CreditCardVisual card={card} tilt={false} showSave={false} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <InfoCard
            title="Swipe to shortlist"
            description="Your top 5 come as a real swipeable deck — pass or shortlist each match, on-brand and actually fun."
          />
          <InfoCard
            title="Full customization"
            description="Exclude banks you don't want, cap the annual fee, require lounge access — the ranking respects it all."
          />
          <InfoCard
            title="Compare & save"
            description="Bookmark cards as you browse and put up to 3 side by side before you decide."
          />
        </motion.div>

        <div className="mt-16 text-center">
          <Link
            href="/cards"
            className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
          >
            Or just browse the full card directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="text-gold">{icon}</div>
      <p className="text-xs text-muted-foreground leading-tight">{label}</p>
    </div>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl glass-morphism">
      <h3 className="font-heading font-bold text-gold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
