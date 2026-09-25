"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  slug: string;
  nameAr: string;
  price: number;
  image?: string | null;
  compareAtPrice?: number | null;
};

type WishlistState = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  hasItem: (productId: string) => boolean;
  clear: () => void;
  count: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) {
            return state;
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      toggleItem: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        if (exists) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },

      hasItem: (productId) =>
        get().items.some((i) => i.productId === productId),

      clear: () => set({ items: [] }),

      count: () => get().items.length,
    }),
    {
      name: "al-muhtarif-wishlist",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useWishlist() {
  const items = useWishlistStore((s) => s.items);
  const addItem = useWishlistStore((s) => s.addItem);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const hasItem = useWishlistStore((s) => s.hasItem);
  const clear = useWishlistStore((s) => s.clear);
  const count = useWishlistStore((s) => s.count());

  return {
    items,
    addItem,
    removeItem,
    toggleItem,
    hasItem,
    clear,
    count,
  };
}
