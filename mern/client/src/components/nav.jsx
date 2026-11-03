import Link from "@/components/app-link";
import Image from "@/components/app-image";
import { usePathname } from "@/lib/nav";
import { Heart, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSavedCards } from "@/lib/savedCards";
import { useAuth } from "@/lib/auth";
const LINKS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/cards", label: "Card Directory" },
    { href: "/quiz", label: "Quiz" },
    { href: "/expenses", label: "Expenses" },
    { href: "/saved", label: "Saved" },
];
export function Nav() {
    const pathname = usePathname();
    const savedCount = useSavedCards((s) => Object.keys(s.saved).length);
    const clearLocal = useSavedCards((s) => s.clearLocal);
    const { user, signOut } = useAuth();
    return (<header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink/75 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="SwipeRight" width={448} height={96} className="h-7 w-auto" priority/>
          </Link>
          <nav className="flex items-center gap-1">
            {LINKS.map((link) => (<Link key={link.href} href={link.href} className={cn("relative px-4 py-2 rounded-lg text-sm font-medium transition-colors", pathname === link.href
                ? "bg-ember/10 text-ember"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5")}>
                {link.href === "/saved" ? (<span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5"/>
                    {link.label}
                    {savedCount > 0 && (<span className="text-[10px] leading-none bg-ember text-ink rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {savedCount}
                      </span>)}
                  </span>) : (link.label)}
              </Link>))}
          </nav>
          {user ? (<button onClick={() => {
                signOut();
                clearLocal();
            }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" title="Sign out">
              <span className="hidden sm:inline">{user.fullName || user.email}</span>
              <LogOut className="w-4 h-4"/>
            </button>) : (<Link href="/login" className="text-sm text-ember hover:underline">
              Sign in
            </Link>)}
        </div>
      </div>
    </header>);
}
