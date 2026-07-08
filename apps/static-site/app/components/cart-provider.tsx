"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartLine = {
  productId: string;
  variantId: string;
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  addLine: (line: CartLine) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
export const CART_STORAGE_KEY = "fairway-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
      if (Array.isArray(parsed)) {
        setLines(parsed.map(normalizeCartLine).filter((line): line is CartLine => line !== null));
      }
    } catch {
      setLines([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistLines(lines);
  }, [hydrated, lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount: lines.reduce((total, line) => total + line.quantity, 0),
      addLine(nextLine) {
        setLines((current) => {
          const existing = current.find((line) => line.variantId === nextLine.variantId);
          if (!existing) return persistLines([...current, nextLine]);
          return persistLines(current.map((line) =>
            line.variantId === nextLine.variantId
              ? { ...line, quantity: Math.min(99, line.quantity + nextLine.quantity) }
              : line
          ));
        });
      },
      updateQuantity(variantId, quantity) {
        const normalized = Math.max(1, Math.min(99, Number.isFinite(quantity) ? quantity : 1));
        setLines((current) => persistLines(current.map((line) => (line.variantId === variantId ? { ...line, quantity: normalized } : line))));
      },
      removeLine(variantId) {
        setLines((current) => persistLines(current.filter((line) => line.variantId !== variantId)));
      },
      clearCart() {
        setLines(persistLines([]));
      },
    }),
    [lines]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider.");
  return value;
}

function normalizeCartLine(value: unknown): CartLine | null {
  if (!value || typeof value !== "object") return null;
  const line = value as Partial<CartLine>;
  if (typeof line.productId !== "string" || typeof line.variantId !== "string" || typeof line.quantity !== "number") return null;
  const quantity = Number.isFinite(line.quantity) ? line.quantity : 1;
  return {
    productId: line.productId,
    variantId: line.variantId,
    quantity: Math.max(1, Math.min(99, Math.floor(quantity))),
  };
}

function persistLines(lines: CartLine[]): CartLine[] {
  if (typeof window !== "undefined") window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
  return lines;
}
