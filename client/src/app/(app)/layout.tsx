import { Nav } from "@/components/nav";
import { PageTransition } from "@/components/page-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink">
      <Nav />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
