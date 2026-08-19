"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AUTH_TOKEN_KEY } from "@/lib/constants";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    router.push(token ? "/dashboard" : "/login");
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
