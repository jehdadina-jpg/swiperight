"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-6xl animate-pulse">💳</div>
        <h1 className="font-heading text-4xl font-bold gradient-gold text-gradient">
          Loading SwipeRight...
        </h1>
      </div>
    </div>
  );
}
