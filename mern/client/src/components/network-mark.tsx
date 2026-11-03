/**
 * Stylized, generic evocations of card network marks - not reproductions of
 * the real logos (no trademarked assets used), just enough visual shorthand
 * that a card reads as "a real card" instead of a text label. Falls back to
 * a plain wordmark for anything unrecognized (RuPay, Diners, etc.).
 */
export function NetworkMark({ network, className }: { network: string; className?: string }) {
  const key = network.trim().toLowerCase();

  if (key === "visa") {
    return (
      <span className={`font-heading italic font-bold text-xl tracking-tight ${className ?? ""}`}>
        VISA
      </span>
    );
  }

  if (key === "mastercard") {
    return (
      <div className={`relative w-11 h-7 ${className ?? ""}`}>
        <div className="absolute left-0 top-0 w-7 h-7 rounded-full bg-[#eb4530]/85" />
        <div className="absolute right-0 top-0 w-7 h-7 rounded-full bg-[#f2a900]/85 mix-blend-screen" />
      </div>
    );
  }

  if (key === "amex") {
    return (
      <div className={`px-2 py-1 border border-white/70 rounded text-[10px] font-bold tracking-wider ${className ?? ""}`}>
        AMEX
      </div>
    );
  }

  if (key === "diners") {
    return (
      <div className={`relative w-8 h-8 rounded-full border-2 border-white/80 ${className ?? ""}`}>
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-white/80" />
      </div>
    );
  }

  if (key === "rupay") {
    return (
      <span className={`font-heading italic font-bold text-lg tracking-tight ${className ?? ""}`}>
        <span className="text-[#f37021]">Ru</span>
        <span className="text-[#0a8a3e]">Pay</span>
      </span>
    );
  }

  return (
    <span className={`text-xs font-bold uppercase tracking-wider ${className ?? ""}`}>
      {network}
    </span>
  );
}
