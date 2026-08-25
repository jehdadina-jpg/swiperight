"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedCards } from "@/lib/savedCards";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cards", label: "Card Directory" },
  { href: "/saved", label: "Saved" },
];

export function Nav() {
  const pathname = usePathname();
  const savedCount = useSavedCards((s) => Object.keys(s.saved).length);

  return (
    <header className="border-b border-white/10 bg-ink-2 sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-4xl">💳</div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-ember">SwipeRight</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Card Advisor</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-ember/10 text-ember"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {link.href === "/saved" ? (
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    {link.label}
                    {savedCount > 0 && (
                      <span className="text-[10px] leading-none bg-ember text-ink rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {savedCount}
                      </span>
                    )}
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
