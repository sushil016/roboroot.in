"use client";

import { create } from "zustand";
import type { ChatProductCard } from "../types/chat.types";

interface CompareStore {
  compareList: ChatProductCard[];
  add: (product: ChatProductCard) => void;
  remove: (id: string) => void;
  clearAll: () => void;
}

const useCompareStore = create<CompareStore>((set) => ({
  compareList: [],
  add: (product) =>
    set((state) => {
      if (state.compareList.length >= 3) return state;
      if (state.compareList.some((p) => p.id === product.id)) return state;
      return { compareList: [...state.compareList, product] };
    }),
  remove: (id) =>
    set((state) => ({ compareList: state.compareList.filter((p) => p.id !== id) })),
  clearAll: () => set({ compareList: [] }),
}));

export function useCompare(product: ChatProductCard) {
  const { compareList, add, remove, clearAll } = useCompareStore();
  const isCompared = compareList.some((p) => p.id === product.id);

  function toggle() {
    if (isCompared) {
      remove(product.id);
    } else {
      add(product);
    }
  }

  return { isCompared, compareList, toggle, clearAll };
}

// Export the raw store for use in ProductCompareBar
export { useCompareStore };
