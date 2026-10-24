"use client";

// Client cart store — localStorage-persisted, powers the drawer + checkout.
// Prices here are display-only; the server recalculates everything at
// checkout (never trust client prices).
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantName: string | null;
  image: string;
  priceUsd: number;
  maxStock: number;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalUsd: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "aurelia-cart-v1";

export function itemKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return `${item.productId}::${item.variantId ?? "base"}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const key = itemKey(item);
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i) === key
            ? { ...i, qty: Math.min(i.qty + qty, Math.max(i.maxStock, 1)) }
            : i,
        );
      }
      return [...prev, { ...item, qty: Math.min(qty, Math.max(item.maxStock, 1)) }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          itemKey(i) === key
            ? { ...i, qty: Math.max(0, Math.min(qty, Math.max(i.maxStock, 1))) }
            : i,
        )
        .filter((i) => i.qty > 0),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotalUsd =
      Math.round(items.reduce((s, i) => s + i.priceUsd * i.qty, 0) * 100) / 100;
    return {
      items,
      count,
      subtotalUsd,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, isOpen, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
