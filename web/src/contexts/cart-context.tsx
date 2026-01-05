"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import type { ProductVariation } from "@/dtos/product-variation";
import type { Product } from "@/dtos/product";

export interface CartItem {
  product: Product;
  variation: ProductVariation;
  quantity: number;
}

export interface StoreCart {
  storeId: string;
  items: CartItem[];
  requestedAt?: string;
  orderId?: string;
}

interface CartContextType {
  stores: Record<string, StoreCart>;
  addItem: (
    product: Product,
    variation: ProductVariation,
    quantity?: number,
  ) => void;
  removeItem: (storeId: string, variationId: string) => void;
  updateQuantity: (storeId: string, variationId: string, quantity: number) => void;
  clearStore: (storeId: string) => void;
  clearAll: () => void;
  getTotal: (storeId?: string) => number;
  getItemCount: (storeId?: string) => number;
  getStores: () => string[];
  markAsRequested: (storeId: string, orderId: string) => void;
  isRequested: (storeId: string) => boolean;
  // Métodos de compatibilidade (para transição gradual)
  items: CartItem[];
  storeId: string | null;
  canAddItem: (storeId: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "vitrine-cart";
const CART_VERSION = "2.0";

// Função de migração do formato antigo para novo
function migrateOldCartFormat(oldData: any): Record<string, StoreCart> {
  if (!oldData) return {};
  
  // Se já está no formato novo, retornar como está
  if (oldData.stores && typeof oldData.stores === 'object') {
    return oldData.stores;
  }
  
  // Migrar formato antigo: { items: CartItem[], storeId: string | null }
  if (oldData.items && Array.isArray(oldData.items) && oldData.storeId) {
    return {
      [oldData.storeId]: {
        storeId: oldData.storeId,
        items: oldData.items,
      },
    };
  }
  
  return {};
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [stores, setStores] = useState<Record<string, StoreCart>>({});

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        try {
          const cartData = JSON.parse(stored);
          
          // Verificar versão e migrar se necessário
          if (!cartData.version || cartData.version !== CART_VERSION) {
            const migratedStores = migrateOldCartFormat(cartData);
            setStores(migratedStores);
            // Salvar formato migrado
            localStorage.setItem(
              CART_STORAGE_KEY,
              JSON.stringify({ version: CART_VERSION, stores: migratedStores }),
            );
          } else {
            setStores(cartData.stores || {});
          }
        } catch (error) {
          console.error("Erro ao carregar carrinho:", error);
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
        JSON.stringify({ version: CART_VERSION, stores }),
      );
    }
  }, [stores]);

  const getStores = (): string[] => {
    return Object.keys(stores).filter(storeId => stores[storeId].items.length > 0);
  };

  const addItem = (
    product: Product,
    variation: ProductVariation,
    quantity: number = 1,
  ) => {
    // Validar estoque disponível
    if (variation.stock === 0) {
      throw new Error("Produto fora de estoque");
    }

    setStores((prevStores) => {
      const storeId = product.storeId;
      const storeCart = prevStores[storeId] || { storeId, items: [] };
      
      const existingItem = storeCart.items.find(
        (item) => item.variation.id === variation.id,
      );

      let newItems: CartItem[];
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        // Validar se a nova quantidade não excede o estoque
        if (newQuantity > variation.stock) {
          throw new Error(
            `Estoque insuficiente. Disponível: ${variation.stock}, Tentando adicionar: ${newQuantity}`,
          );
        }
        // Update quantity if item already exists
        newItems = storeCart.items.map((item) =>
          item.variation.id === variation.id
            ? { ...item, quantity: newQuantity }
            : item,
        );
      } else {
        // Validar quantidade inicial
        if (quantity > variation.stock) {
          throw new Error(
            `Estoque insuficiente. Disponível: ${variation.stock}, Tentando adicionar: ${quantity}`,
          );
        }

        // Add new item
        newItems = [
          ...storeCart.items,
          {
            product,
            variation,
            quantity,
          },
        ];
      }

      return {
        ...prevStores,
        [storeId]: {
          ...storeCart,
          items: newItems,
        },
      };
    });
  };

  const removeItem = (storeId: string, variationId: string) => {
    setStores((prevStores) => {
      const storeCart = prevStores[storeId];
      if (!storeCart) return prevStores;

      const newItems = storeCart.items.filter(
        (item) => item.variation.id !== variationId,
      );

      // Se não há mais itens, remover a loja
      if (newItems.length === 0) {
        const { [storeId]: _, ...rest } = prevStores;
        return rest;
      }

      return {
        ...prevStores,
        [storeId]: {
          ...storeCart,
          items: newItems,
        },
      };
    });
  };

  const updateQuantity = (storeId: string, variationId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(storeId, variationId);
      return;
    }

    setStores((prevStores) => {
      const storeCart = prevStores[storeId];
      if (!storeCart) return prevStores;

      const item = storeCart.items.find((item) => item.variation.id === variationId);
      if (!item) return prevStores;

      // Validar estoque disponível
      if (quantity > item.variation.stock) {
        throw new Error(
          `Estoque insuficiente. Disponível: ${item.variation.stock}, Tentando atualizar para: ${quantity}`,
        );
      }

      return {
        ...prevStores,
        [storeId]: {
          ...storeCart,
          items: storeCart.items.map((item) =>
            item.variation.id === variationId
              ? { ...item, quantity }
              : item,
          ),
        },
      };
    });
  };

  const clearStore = (storeId: string) => {
    setStores((prevStores) => {
      const { [storeId]: _, ...rest } = prevStores;
      return rest;
    });
  };

  const clearAll = () => {
    setStores({});
  };

  const getTotal = (storeId?: string): number => {
    if (storeId) {
      const storeCart = stores[storeId];
      if (!storeCart) return 0;
      
      return storeCart.items.reduce((total, item) => {
        const price = item.variation.discountPrice || item.variation.price;
        return total + price * item.quantity;
      }, 0);
    }

    // Total geral de todas as lojas
    return Object.values(stores).reduce((total, storeCart) => {
      return total + storeCart.items.reduce((storeTotal, item) => {
        const price = item.variation.discountPrice || item.variation.price;
        return storeTotal + price * item.quantity;
      }, 0);
    }, 0);
  };

  const getItemCount = (storeId?: string): number => {
    if (storeId) {
      const storeCart = stores[storeId];
      if (!storeCart) return 0;
      
      return storeCart.items.reduce((count, item) => count + item.quantity, 0);
    }

    // Contagem geral de todas as lojas
    return Object.values(stores).reduce((total, storeCart) => {
      return total + storeCart.items.reduce((count, item) => count + item.quantity, 0);
    }, 0);
  };

  const markAsRequested = (storeId: string, orderId: string) => {
    setStores((prevStores) => {
      const storeCart = prevStores[storeId];
      if (!storeCart) return prevStores;

      return {
        ...prevStores,
        [storeId]: {
          ...storeCart,
          requestedAt: new Date().toISOString(),
          orderId,
        },
      };
    });
  };

  const isRequested = (storeId: string): boolean => {
    const storeCart = stores[storeId];
    return !!storeCart?.requestedAt;
  };

  // Métodos de compatibilidade (para transição gradual)
  const allItems = useMemo(() => {
    return Object.values(stores).flatMap(storeCart => storeCart.items);
  }, [stores]);

  const firstStoreId = useMemo(() => {
    const storeIds = getStores();
    return storeIds.length > 0 ? storeIds[0] : null;
  }, [stores]);

  const canAddItem = (newStoreId: string): boolean => {
    // Sempre permitir adicionar produtos (sem restrição de loja)
    return true;
  };

  const clearCart = () => {
    clearAll();
  };

  return (
    <CartContext.Provider
      value={{
        stores,
        addItem,
        removeItem,
        updateQuantity,
        clearStore,
        clearAll,
        getTotal,
        getItemCount,
        getStores,
        markAsRequested,
        isRequested,
        // Métodos de compatibilidade
        items: allItems,
        storeId: firstStoreId,
        canAddItem,
        clearCart,
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