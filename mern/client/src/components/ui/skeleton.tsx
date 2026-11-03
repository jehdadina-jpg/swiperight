import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-ink-3 via-ink-4 to-ink-3 bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}
