"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/magnetic";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { ScrollStage } from "@/components/scroll-stage";
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
  { value: 64, label: "cards" },
  { value: 5, label: "ranked matches" },
  { value: 13, label: "spend categories" },
];

const STEPS = [
  { n: "01", title: "Tell us how you spend", body: "Statement, sliders, or a swipe quiz." },
  { n: "02", title: "Set your limits", body: "Exclude banks, cap fees, require a lounge." },
  { n: "03", title: "Swipe your five", body: "Ranked, reasoned, and yours to shortlist." },
];

export default function Home() {
  return (
    <div className="h-[100dvh] bg-ink ambient-glow overflow-hidden">
      <TopBar />
      <ScrollStage
        sections={[
          <Hero key="hero" />,
          <WhySwipeRight key="why" />,
          <HowItWorks key="how" />,
          <Showcase key="showcase" />,
        ]}
      />
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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-ink/75 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="SwipeRight" width={448} height={96} className="h-7 w-auto" priority />
        </Link>
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

function Slide({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex h-[100dvh] w-full items-center overflow-hidden pt-20", className)}>
      <div className="container mx-auto px-6">{children}</div>
    </section>
  );
}

function Hero() {
  return (
    <Slide>
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
          that actually <span className="italic text-ember">fits</span> you.
        </motion.h1>

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
        className="mt-14 flex flex-col sm:flex-row sm:items-center gap-6"
      >
        <p className="text-muted-foreground">Five ranked matches. One gesture.</p>
        <div className="flex gap-3">
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
    </Slide>
  );
}

function WhySwipeRight() {
  return (
    <Slide>
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
          <p className="text-muted-foreground leading-relaxed max-w-xl">
            A wall of forty profiles is worse than one good match. Same idea,
            applied to card research: a stack of five real contenders, and a gesture instead of a spreadsheet.
          </p>
        </motion.div>
      </div>

      <div className="mt-16 grid grid-cols-3 divide-x divide-white/[0.06] max-w-xl">
        {STATS.map((stat, i) => (
          <Stat key={stat.label} value={stat.value} label={stat.label} delay={i * 0.1} />
        ))}
      </div>
    </Slide>
  );
}

function Stat({ value, label, delay }: { value: number; label: string; delay: number }) {
  const display = useCountUp(value, 1200, true);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="px-6 first:pl-0 text-center sm:text-left"
    >
      <p className="font-heading text-4xl tabular-nums text-ember">{display}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}

function HowItWorks() {
  return (
    <Slide>
      <h2 className="font-heading text-3xl md:text-4xl mb-14 max-w-md">
        Three steps. <span className="italic text-muted-foreground">No forced picks.</span>
      </h2>
      <div className="grid md:grid-cols-3 gap-8 md:gap-10">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <span className="font-heading text-4xl text-white/20">{step.n}</span>
            <h3 className="font-heading text-xl mt-3 mb-2">{step.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </Slide>
  );
}

function Showcase() {
  return (
    <Slide>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-mono text-xs tracking-[0.2em] text-verdigris-light uppercase mb-3">
            The interaction
          </p>
          <h3 className="font-heading text-3xl md:text-4xl mb-4">Swipe to shortlist</h3>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            A real, draggable deck of your top five. Pass or shortlist each one.
          </p>
          <Magnetic>
            <Button size="lg" asChild>
              <Link href="/dashboard">Start Matching</Link>
            </Button>
          </Magnetic>
        </motion.div>
        <div className="py-4">
          <CardFan cards={SHOWCASE_CARDS} cardWidth={148} />
        </div>
      </div>

      <footer className="mt-16 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          SwipeRight — card recommendations for the Indian market.
        </p>
        <Link
          href="/cards"
          className="inline-flex items-center gap-1.5 text-sm text-ember hover:underline"
        >
          Browse the full card directory <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </footer>
    </Slide>
  );
}
