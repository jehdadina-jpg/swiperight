"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ArrowUpRight, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/magnetic";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";

const SHOWCASE_CARDS = [
  { id: 1, name: "Axis Bank Magnus", issuer: "Axis Bank", network: "Mastercard", annual_fee: 10000, joining_fee: 10000, reward_rate: 12, tags: ["travel", "premium"], highlight: null, lounge_access: true, churn_risk: "low" },
  { id: 2, name: "ICICI Amazon Pay", issuer: "ICICI Bank", network: "Visa", annual_fee: 0, joining_fee: 0, reward_rate: 5, tags: ["cashback"], highlight: null, lounge_access: false, churn_risk: "low" },
  { id: 3, name: "HDFC Infinia Metal", issuer: "HDFC Bank", network: "Visa", annual_fee: 12500, joining_fee: 12500, reward_rate: 3.3, tags: ["premium"], highlight: null, lounge_access: true, churn_risk: "medium" },
];

const FAN_ROTATIONS = [-9, 4, 12];
const FAN_LIFT = [8, -6, 10];

const STATS = [
  { value: 23, suffix: "", label: "cards in the catalog, real Indian issuers" },
  { value: 5, suffix: "", label: "ranked matches, every single time" },
  { value: 13, suffix: "", label: "spending categories tracked per card" },
];

const STEPS = [
  {
    n: "01",
    title: "Tell us how you spend",
    body: "Upload a statement, drag sliders by category, or swipe through a seven-question lifestyle quiz. Pick whichever takes less time.",
  },
  {
    n: "02",
    title: "Set what you'll actually accept",
    body: "Rule out banks you don't want, cap the annual fee, require a lounge — the ranking respects every constraint before it scores a single card.",
  },
  {
    n: "03",
    title: "Swipe your top five",
    body: "Not one forced answer — five ranked cards with the reasoning behind each. Shortlist the ones you like, compare them side by side.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink">
      <TopBar />
      <Hero />
      <WhySwipeRight />
      <StatsStrip />
      <HowItWorks />
      <FeatureRows />
      <Footer />
    </div>
  );
}

function CardFan({ cards, cardWidth = 168 }: { cards: typeof SHOWCASE_CARDS; cardWidth?: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 24, rotate: 0 }}
          whileInView={{ opacity: 1, y: FAN_LIFT[i] ?? 0, rotate: FAN_ROTATIONS[i] ?? 0 }}
          whileHover={{ y: (FAN_LIFT[i] ?? 0) - 10, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: cardWidth, zIndex: i }}
        >
          <CreditCardVisual card={card} tilt={false} showSave={false} compact />
        </motion.div>
      ))}
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink/75 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-heading italic text-xl">Swipe</span>
          <span className="font-heading text-xl text-ember">Right</span>
        </div>
        <Magnetic strength={0.25}>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              Enter <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </Magnetic>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <p className="font-mono text-xs tracking-[0.25em] text-verdigris-light uppercase mb-6">
          Card matching · Built for India
        </p>

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-[13vw] leading-[0.95] sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight"
          >
            Find the card
            <br />
            that actually{" "}
            <span className="italic text-ember">fits</span> you.
          </motion.h1>

          {/* Showcase bleeds past the grid on large screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:-mr-16"
          >
            <CardFan cards={SHOWCASE_CARDS} cardWidth={168} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-8 max-w-3xl"
        >
          <p className="text-lg text-muted-foreground leading-relaxed">
            Upload a statement or just tell us how you spend. SwipeRight ranks the
            top five cards for your exact pattern — not the one card a bank paid to be first.
          </p>
          <div className="flex gap-3 shrink-0">
            <Magnetic>
              <Button size="lg" asChild>
                <Link href="/dashboard">Start Matching</Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button size="lg" variant="outline" asChild>
                <Link href="/quiz">Take the Quiz</Link>
              </Button>
            </Magnetic>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WhySwipeRight() {
  return (
    <section className="py-20 md:py-28 border-t border-white/[0.06] bg-ink-2/40">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 shrink-0 mx-auto md:mx-0"
          >
            <div className="w-14 h-14 rounded-full border border-destructive/40 bg-destructive/10 flex items-center justify-center">
              <X className="w-6 h-6 text-destructive" />
            </div>
            <div className="w-10 h-px bg-white/15" />
            <div className="w-14 h-14 rounded-full border border-ember/40 bg-ember/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-ember fill-ember/30" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-xs tracking-[0.2em] text-verdigris-light uppercase mb-3">
              The name, explained
            </p>
            <h2 className="font-heading text-3xl md:text-4xl mb-4">
              Why <span className="italic text-ember">swipe right</span>?
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              Dating apps solved this years ago: a wall of forty profiles is worse than
              one good match. Swipe right means yes. Left means move on — no essay required.
              Credit card research has never gotten the same treatment. It&apos;s spreadsheets,
              comparison tables, and a dozen open tabs. SwipeRight is what that decision
              looks like when it&apos;s built like a match, not a research project: a stack
              of five real contenders, and a gesture instead of a spreadsheet.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="border-y border-white/[0.06]">
      <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
        {STATS.map((stat, i) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} active={inView} delay={i * 0.1} />
        ))}
      </div>
    </section>
  );
}

function Stat({ value, label, active, delay }: { value: number; label: string; active: boolean; delay: number }) {
  const display = useCountUp(value, 1200, active);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={active ? { opacity: 1 } : {}}
      transition={{ delay, duration: 0.4 }}
      className="py-10 px-6 text-center sm:text-left"
    >
      <p className="font-heading text-5xl tabular-nums text-ember">{display}</p>
      <p className="text-sm text-muted-foreground mt-2 max-w-[16rem] mx-auto sm:mx-0">{label}</p>
    </motion.div>
  );
}


function HowItWorks() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <h2 className="font-heading text-3xl md:text-4xl mb-16 max-w-md">
          Three steps. <span className="italic text-muted-foreground">No forced picks.</span>
        </h2>
        <div className="divide-y divide-white/[0.06]">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="grid grid-cols-[auto_1fr] md:grid-cols-[6rem_1fr_1.4fr] gap-x-6 md:gap-x-12 py-8 md:py-10 items-baseline"
            >
              <span className="font-heading text-3xl md:text-4xl text-white/20">{step.n}</span>
              <h3 className="font-heading text-xl md:text-2xl md:col-start-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed col-span-2 md:col-span-1 mt-2 md:mt-0">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureRows() {
  return (
    <section className="py-8 md:py-16">
      <div className="container mx-auto px-6 space-y-24 md:space-y-32">
        <FeatureRow
          eyebrow="The interaction"
          title="Swipe to shortlist"
          body="Your top five arrive as a real, draggable deck — pass or shortlist each one. It's the one thing every other card-comparison tool skips, despite the name on the tin."
          reverse={false}
        >
          <div className="py-8">
            <CardFan cards={SHOWCASE_CARDS} cardWidth={148} />
          </div>
        </FeatureRow>

        <FeatureRow
          eyebrow="No dead ends"
          title="Full customization, respected"
          body="Exclude banks you already have a bad history with, cap what you're willing to pay in fees, require lounge access — every preference is applied before a single card is scored, not filtered after the fact."
          reverse
        >
          <div className="flex flex-wrap items-center justify-center gap-2 py-8 max-w-sm mx-auto">
            {["HDFC Bank", "SBI Card", "ICICI Bank", "Axis Bank", "Amex"].map((bank, i) => (
              <motion.span
                key={bank}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border font-mono",
                  i === 1
                    ? "border-destructive text-destructive bg-destructive/10 line-through"
                    : "border-white/15 text-muted-foreground"
                )}
              >
                {bank}
              </motion.span>
            ))}
          </div>
        </FeatureRow>
      </div>
    </section>
  );
}

function FeatureRow({
  eyebrow,
  title,
  body,
  reverse,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  reverse: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid md:grid-cols-2 gap-10 items-center", reverse && "md:[direction:rtl]")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        style={{ direction: "ltr" }}
      >
        <p className="font-mono text-xs tracking-[0.2em] text-verdigris-light uppercase mb-3">{eyebrow}</p>
        <h3 className="font-heading text-3xl md:text-4xl mb-4">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{body}</p>
      </motion.div>
      <div style={{ direction: "ltr" }}>{children}</div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          SwipeRight — card recommendations for the Indian market.
        </p>
        <Link
          href="/cards"
          className="inline-flex items-center gap-1.5 text-sm text-ember hover:underline"
        >
          Browse the full card directory <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </footer>
  );
}
