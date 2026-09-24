import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedCard {
  id: number;
  name: string;
  issuer: string;
  network: string;
  annual_fee: number;
  joining_fee: number;
  reward_rate: number;
  tags: string[];
  highlight: string | null;
  lounge_access: boolean;
  churn_risk: string;
  min_income?: number | null;
  min_cibil?: number | null;
}

interface SavedCardsState {
  saved: Record<number, SavedCard>;
  save: (card: SavedCard) => void;
  unsave: (id: number) => void;
  toggle: (card: SavedCard) => void;
  isSaved: (id: number) => boolean;
}

export const useSavedCards = create<SavedCardsState>()(
  persist(
    (set, get) => ({
      saved: {},
      save: (card) => set((state) => ({ saved: { ...state.saved, [card.id]: card } })),
      unsave: (id) =>
        set((state) => {
          const next = { ...state.saved };
          delete next[id];
          return { saved: next };
        }),
      toggle: (card) => {
        if (get().saved[card.id]) get().unsave(card.id);
        else get().save(card);
      },
      isSaved: (id) => Boolean(get().saved[id]),
    }),
    { name: "swiperight_saved_cards" }
  )
);
