import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-navy-3 via-navy-4 to-navy-3 bg-[length:200%_100%] animate-shimmer",
        className
      )}
    />
  );
}
