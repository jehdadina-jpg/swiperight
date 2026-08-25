import type { Metadata } from "next";
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PageTransition } from "@/components/page-transition";
import { GrainOverlay } from "@/components/grain-overlay";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SwipeRight - AI Powered Credit Card Recommendation Engine",
  description:
    "Upload your bank statement, analyze spending patterns, and get personalized credit card recommendations powered by AI",
  keywords: [
    "credit card",
    "recommendation",
    "AI",
    "bank statement",
    "spending analysis",
    "India",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <GrainOverlay />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
