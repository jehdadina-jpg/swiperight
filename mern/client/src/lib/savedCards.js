import { create } from "zustand";
import { persist } from "zustand/middleware";
import { savedAPI } from "./api";
import { useAuth } from "./auth";
const signedIn = () => Boolean(useAuth.getState().user);
// Guests keep their shortlist in localStorage; signed-in users also persist it in MongoDB
export const useSavedCards = create()(persist((set, get) => ({
    saved: {},
    rows: {},
    save: (card) => {
        set((s) => ({ saved: { ...s.saved, [card.id]: card } }));
        if (signedIn()) {
            savedAPI
                .add(card.id)
                .then((row) => set((s) => ({ rows: { ...s.rows, [card.id]: { rowId: row.id, note: row.note ?? "" } } })))
                .catch(() => undefined);
        }
    },
    unsave: (id) => {
        const row = get().rows[id];
        set((s) => {
            const saved = { ...s.saved };
            const rows = { ...s.rows };
            delete saved[id];
            delete rows[id];
            return { saved, rows };
        });
        if (signedIn() && row)
            savedAPI.remove(row.rowId).catch(() => undefined);
    },
    toggle: (card) => (get().saved[card.id] ? get().unsave(card.id) : get().save(card)),
    isSaved: (id) => Boolean(get().saved[id]),
    setNote: async (cardId, note) => {
        const row = get().rows[cardId];
        if (!row)
            return;
        await savedAPI.setNote(row.rowId, note);
        set((s) => ({ rows: { ...s.rows, [cardId]: { ...row, note } } }));
    },
    loadFromServer: async () => {
        const list = await savedAPI.list();
        const local = get().saved;
        // Push any guest-saved cards up first, then adopt the server list as the truth
        const serverIds = new Set(list.map((r) => r.card.id));
        const pushed = await Promise.all(Object.values(local)
            .filter((c) => !serverIds.has(c.id))
            .map((c) => savedAPI.add(c.id).catch(() => null)));
        const all = [...list, ...pushed.filter((r) => Boolean(r))];
        set({
            saved: Object.fromEntries(all.map((r) => [r.card.id, r.card])),
            rows: Object.fromEntries(all.map((r) => [r.card.id, { rowId: r.id, note: r.note ?? "" }])),
        });
    },
    clearLocal: () => set({ saved: {}, rows: {} }),
}), { name: "swiperight_saved_cards", partialize: (s) => ({ saved: s.saved }) }));
