"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ProductVariation } from "@/dtos/product-variation";
import type { Product } from "@/dtos/product";
import type { Store } from "@/dtos/store";

export interface CartItem {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  storeId: string | null;
  addItem: (
    product: Product,
    variation: ProductVariation,
    quantity?: number,
  ) => void;
  removeItem: (variationId: string) => void;
  updateQuantity: (variationId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  canAddItem: (storeId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "vitrine-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        try {
          const cartData = JSON.parse(stored);
          setItems(cartData.items || []);
          setStoreId(cartData.storeId || null);
        } catch {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, storeId }),
      );
    }
  }, [items, storeId]);

  const canAddItem = (newStoreId: string): boolean => {
    // If cart is empty, can add
    if (items.length === 0) return true;
    // If cart has items from same store, can add
    if (storeId === newStoreId) return true;
    // Otherwise, cannot mix stores
    return false;
  };

  const addItem = (
    product: Product,
    variation: ProductVariation,
    quantity: number = 1,
  ) => {
    if (!canAddItem(product.storeId)) {
      throw new Error(
        "Não é possível adicionar produtos de lojas diferentes ao carrinho. Finalize o pedido atual ou limpe o carrinho.",
      );
    }

    setStoreId(product.storeId);

    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.variation.id === variation.id,
      );

      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map((item) =>
          item.variation.id === variation.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      }

      // Add new item
      return [
        ...prevItems,
        {
          product,
          variation,
          quantity,
        },
      ];
    });
  };

  const removeItem = (variationId: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter(
        (item) => item.variation.id !== variationId,
      );
      // If cart becomes empty, clear storeId
      if (newItems.length === 0) {
        setStoreId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (variationId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variationId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.variation.id === variationId
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
    setStoreId(null);
  };

  const getTotal = (): number => {
    return items.reduce((total, item) => {
      const price = item.variation.discountPrice || item.variation.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        storeId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        canAddItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

