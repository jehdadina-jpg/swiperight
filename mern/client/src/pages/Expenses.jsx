import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Sparkles, Trash2, X } from "lucide-react";
import Link from "@/components/app-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { expensesAPI, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_ICONS, SPENDING_CATEGORIES } from "@/lib/constants";
const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { merchant: "", amount: "", category: "Dining", date: today(), note: "" };
export default function ExpensesPage() {
    const { user, checking } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState("");
    const load = useCallback(async () => {
        setLoading(true);
        try {
            setExpenses(await expensesAPI.list({ category: filter || undefined }));
        }
        catch (err) {
            setError(errorMessage(err));
        }
        finally {
            setLoading(false);
        }
    }, [filter]);
    useEffect(() => {
        if (user)
            load();
        else
            setLoading(false);
    }, [user, load]);
    const totals = useMemo(() => {
        const byCategory = {};
        for (const e of expenses)
            byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount;
        return Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
    }, [expenses]);
    const grandTotal = totals.reduce((s, [, v]) => s + v, 0);
    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        const amount = Number(form.amount);
        if (!form.merchant.trim())
            return setError("Enter where you spent it.");
        if (!(amount > 0))
            return setError("Amount must be greater than zero.");
        setSaving(true);
        try {
            const body = { merchant: form.merchant.trim(), amount, category: form.category, date: form.date, note: form.note };
            if (editingId)
                await expensesAPI.update(editingId, body);
            else
                await expensesAPI.create(body);
            setForm({ ...EMPTY, category: form.category });
            setEditingId(null);
            await load();
        }
        catch (err) {
            setError(errorMessage(err));
        }
        finally {
            setSaving(false);
        }
    };
    const startEdit = (x) => {
        setEditingId(x.id);
        setForm({ merchant: x.merchant, amount: String(x.amount), category: x.category, date: x.date.slice(0, 10), note: x.note ?? "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const remove = async (id) => {
        try {
            await expensesAPI.remove(id);
            setExpenses((list) => list.filter((x) => x.id !== id));
            if (editingId === id) {
                setEditingId(null);
                setForm(EMPTY);
            }
        }
        catch (err) {
            setError(errorMessage(err));
        }
    };
    if (!checking && !user) {
        return (<div className="container mx-auto px-6 py-16 max-w-xl">
        <Card>
          <CardContent className="p-10 text-center space-y-4">
            <h2 className="font-heading text-2xl text-ember">Track your own spending</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to log expenses by hand. Your last 12 months become the profile cards are ranked against.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/register">Create account</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="container mx-auto px-6 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-ember mb-2">My Expenses</h2>
          <p className="text-muted-foreground">Log what you spend; the last 12 months feed your card ranking.</p>
        </div>
        <Button asChild disabled={expenses.length === 0}>
          <Link href="/dashboard?source=expenses">
            <Sparkles className="w-4 h-4 mr-2"/> Rank cards from my expenses
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6 self-start lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {editingId ? "Edit expense" : "Add expense"}
                {editingId && (<button type="button" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => {
                setEditingId(null);
                setForm(EMPTY);
            }}>
                    <X className="w-3 h-3"/> Cancel
                  </button>)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input id="merchant" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="Swiggy, HP Petrol..."/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input id="amount" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" max={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}/>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" className="h-10 w-full rounded-lg border border-border bg-ink-3 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {SPENDING_CATEGORIES.map((c) => (<option key={c} value={c}>
                        {CATEGORY_ICONS[c]} {c}
                      </option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="note">Note (optional)</Label>
                  <Input id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}/>
                </div>
                {error && (<p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>)}
                <Button type="submit" className="w-full" disabled={saving}>
                  <Plus className="w-4 h-4 mr-1.5"/>
                  {saving ? "Saving..." : editingId ? "Save changes" : "Add expense"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {totals.length > 0 && (<Card>
              <CardHeader>
                <CardTitle className="text-base">By category · {formatCurrency(grandTotal)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {totals.map(([category, value]) => (<div key={category} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {CATEGORY_ICONS[category]} {category}
                    </span>
                    <span className="tabular-nums text-ember">{formatCurrency(value)}</span>
                  </div>))}
              </CardContent>
            </Card>)}
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Recent expenses
                <select className="h-8 rounded-lg border border-border bg-ink-3 px-2 text-xs" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
                  <option value="">All categories</option>
                  {SPENDING_CATEGORIES.map((c) => (<option key={c} value={c}>
                      {c}
                    </option>))}
                </select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (<div className="space-y-3">
                  <Skeleton className="h-12 w-full"/>
                  <Skeleton className="h-12 w-full"/>
                </div>) : expenses.length === 0 ? (<p className="text-center py-10 text-sm text-muted-foreground">No expenses yet. Add your first one on the left.</p>) : (<ul className="divide-y divide-white/[0.06]">
                  {expenses.map((x) => (<li key={x.id} className="flex items-center gap-3 py-3">
                      <span className="text-xl w-8 text-center">{CATEGORY_ICONS[x.category]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{x.merchant}</p>
                        <p className="text-xs text-muted-foreground">
                          {x.category} · {new Date(x.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {x.note ? ` · ${x.note}` : ""}
                        </p>
                      </div>
                      <span className="tabular-nums font-semibold text-ember">{formatCurrency(x.amount)}</span>
                      <button onClick={() => startEdit(x)} className="p-1.5 text-muted-foreground hover:text-foreground" aria-label={`Edit ${x.merchant}`}>
                        <Pencil className="w-4 h-4"/>
                      </button>
                      <button onClick={() => remove(x.id)} className="p-1.5 text-muted-foreground hover:text-destructive" aria-label={`Delete ${x.merchant}`}>
                        <Trash2 className="w-4 h-4"/>
                      </button>
                    </li>))}
                </ul>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}
