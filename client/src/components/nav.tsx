"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cards", label: "Card Directory" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-white/10 bg-navy-2 sticky top-0 z-50 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="text-4xl">💳</div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-gold">SwipeRight</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Card Advisor</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-gold/10 text-gold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
