import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "@/lib/nav";
import { motion } from "framer-motion";
import { Plane, Check, X as XIcon } from "lucide-react";
import { CreditCardVisual } from "@/components/credit-card-visual";
import { Card, CardContent } from "@/components/ui/card";
import { cardsAPI } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
const ROWS = [
    { label: "Network", get: (c) => c.network },
    { label: "Annual Fee", get: (c) => (c.annualFee === 0 ? "Free" : formatCurrency(c.annualFee)) },
    { label: "Joining Fee", get: (c) => (c.joiningFee === 0 ? "Free" : formatCurrency(c.joiningFee)) },
    { label: "Reward Rate", get: (c) => `${c.rewardRate}%` },
    { label: "Lounge Access", get: (c) => (c.loungeAccess ? <Check className="w-4 h-4 text-verdigris mx-auto"/> : <XIcon className="w-4 h-4 text-muted-foreground mx-auto"/>) },
    { label: "Churn Risk", get: (c) => <span className="capitalize">{c.churnRisk}</span> },
    { label: "Min Income", get: (c) => (c.minIncome ? formatCurrency(c.minIncome) : "None") },
    { label: "Min CIBIL", get: (c) => c.minCibil ?? "None" },
    { label: "Best For", get: (c) => c.tags?.join(", ") || "—" },
];
function parseIds(params) {
    return (params.get("ids") ?? "").split(",").filter(Boolean);
}
function CompareContent() {
    const params = useSearchParams();
    const [cards, setCards] = useState([]);
    // No ids means nothing to fetch, so start not-loading rather than
    // synchronously flipping loading -> false inside the effect below.
    const [loading, setLoading] = useState(() => parseIds(params).length > 0);
    useEffect(() => {
        const ids = parseIds(params);
        if (ids.length === 0)
            return;
        Promise.all(ids.map((id) => cardsAPI.getById(id)))
            .then(setCards)
            .finally(() => setLoading(false));
    }, [params]);
    return (<>
      <div className="container mx-auto px-6 py-8">
        <h2 className="font-heading text-3xl font-bold text-ember mb-2">Compare Cards</h2>
        <p className="text-muted-foreground mb-8">Side by side, so the tradeoffs are obvious.</p>

        {loading ? (<div className="text-center py-16">
            <div className="inline-flex p-4 rounded-full bg-ember/10 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-ember border-t-transparent"/>
            </div>
          </div>) : cards.length === 0 ? (<Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No cards selected. Pick 2-3 cards from the{" "}
              <a href="/cards" className="text-ember hover:underline">Card Directory</a> or your{" "}
              <a href="/saved" className="text-ember hover:underline">Saved Cards</a> to compare them here.
            </CardContent>
          </Card>) : (<>
            <div className="grid gap-6 mb-8" style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}>
              {cards.map((card, i) => (<motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <CreditCardVisual card={card}/>
                </motion.div>))}
            </div>

            <Card className="overflow-x-auto">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {ROWS.map((row, ri) => (<tr key={row.label} className={ri % 2 === 0 ? "bg-white/[0.02]" : ""}>
                        <td className="p-4 font-medium text-muted-foreground whitespace-nowrap">{row.label}</td>
                        {cards.map((card) => (<td key={card.id} className="p-4 text-center">{row.get(card)}</td>))}
                      </tr>))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {cards.some((c) => c.loungeAccess && (c.travelBenefits || c.diningBenefits || c.fuelBenefits || c.shoppingBenefits)) && (<div className="grid gap-6 mt-8" style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}>
                {cards.map((card) => (<Card key={card.id}>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-semibold text-sm text-ember">{card.name}</p>
                      {card.loungeAccess && (<p className="text-xs flex items-center gap-1.5 text-verdigris-light">
                          <Plane className="w-3.5 h-3.5"/> Lounge access included
                        </p>)}
                    </CardContent>
                  </Card>))}
              </div>)}
          </>)}
      </div>
    </>);
}
export default function ComparePage() {
    return (<Suspense fallback={null}>
      <CompareContent />
    </Suspense>);
}
