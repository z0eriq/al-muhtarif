"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  nameAr: string;
  price: number;
  image?: string | null;
  quantity: number;
  stock: number;
  compareAtPrice?: number | null;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const qty = Math.max(1, item.quantity ?? 1);
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );

          if (existing) {
            const nextQty = Math.min(
              existing.stock,
              existing.quantity + qty,
            );
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: nextQty, stock: item.stock, price: item.price }
                  : i,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: item.productId,
                slug: item.slug,
                nameAr: item.nameAr,
                price: item.price,
                image: item.image ?? null,
                stock: item.stock,
                compareAtPrice: item.compareAtPrice ?? null,
                quantity: Math.min(item.stock, qty),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQty: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(i.stock, quantity) }
                : i,
            ),
          };
        });
      },

      clear: () => set({ items: [] }),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "al-muhtarif-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

/** Convenience hook mirroring cart actions + derived values */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const clear = useCartStore((s) => s.clear);
  const count = useCartStore((s) => s.count());
  const subtotal = useCartStore((s) => s.subtotal());

  return {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    count,
    subtotal,
  };
}
