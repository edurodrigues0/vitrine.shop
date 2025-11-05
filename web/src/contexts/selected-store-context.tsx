"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { useAuth } from "@/hooks/use-auth";
import type { Store } from "@/dtos/store";

const SELECTED_STORE_KEY = "selected-store-id";

interface SelectedStoreContextValue {
  selectedStore: Store | null;
  selectedStoreId: string | null;
  setSelectedStoreId: (storeId: string) => void;
  userStores: Store[];
  isLoading: boolean;
}

const SelectedStoreContext = createContext<SelectedStoreContextValue | undefined>(undefined);

export function SelectedStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Carregar todas as lojas do usuário
  const { data: storesData, isLoading } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user?.id,
  });

  const userStores = storesData?.stores.filter(
    (store) => store.ownerId === user?.id,
  ) || [];

  // Carregar loja selecionada do localStorage apenas no cliente
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SELECTED_STORE_KEY);
      if (saved) {
        setSelectedStoreIdState(saved);
      }
    }
  }, []);

  // Quando as lojas são carregadas, selecionar a primeira se não houver seleção
  useEffect(() => {
    if (isMounted && userStores.length > 0 && !selectedStoreId) {
      const saved = localStorage.getItem(SELECTED_STORE_KEY);
      if (saved && userStores.some((s) => s.id === saved)) {
        setSelectedStoreIdState(saved);
      } else {
        const firstStore = userStores[0];
        setSelectedStoreIdState(firstStore.id);
        localStorage.setItem(SELECTED_STORE_KEY, firstStore.id);
      }
    }
  }, [isMounted, userStores, selectedStoreId]);

  // Buscar dados da loja selecionada - sempre buscar dados atualizados
  const { data: selectedStoreData } = useQuery({
    queryKey: ["store", selectedStoreId],
    queryFn: () => storesService.findById(selectedStoreId!),
    enabled: !!selectedStoreId && isMounted,
    staleTime: 0,
  });

  // Usar useMemo para garantir que selectedStore seja recalculado quando selectedStoreId ou userStores mudarem
  // Priorizar dados da lista de lojas para atualização imediata, mesmo que a query ainda não tenha atualizado
  const selectedStore = useMemo(() => {
    if (!selectedStoreId) return null;
    
    // Primeiro tentar encontrar na lista de lojas (mais rápido, atualização imediata)
    const storeFromList = userStores.find(
      (store) => store.id === selectedStoreId,
    );
    
    // Se encontrar na lista, usar (mesmo que selectedStoreData ainda não tenha atualizado)
    // Isso garante atualização imediata quando a loja muda
    if (storeFromList) {
      return storeFromList;
    }
    
    // Se não encontrar na lista, usar dados da query (pode estar carregando)
    if (selectedStoreData) {
      return selectedStoreData;
    }
    
    return null;
  }, [selectedStoreId, selectedStoreData, userStores]);

  // Usar useCallback para manter a referência estável da função
  const setSelectedStoreId = useCallback((storeId: string) => {
    const previousStoreId = selectedStoreId;
    
    if (previousStoreId === storeId) {
      return;
    }
    
    // Atualizar localStorage primeiro
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_STORE_KEY, storeId);
    }
    
    // Atualizar estado IMEDIATAMENTE - isso vai trigger re-render em todos os componentes
    setSelectedStoreIdState(storeId);
    
    // Executar limpeza de cache de forma assíncrona para não bloquear o render
    setTimeout(() => {
      // Remover cache da loja anterior
      queryClient.removeQueries({ 
        queryKey: ["store", previousStoreId] 
      });
      
      // Invalidar queries da loja anterior (sem refetch)
      queryClient.invalidateQueries({ 
        queryKey: ["products", "store", previousStoreId],
        refetchType: "none"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["orders", "store", previousStoreId],
        refetchType: "none"
      });
      queryClient.invalidateQueries({ 
        queryKey: ["statistics", previousStoreId],
        refetchType: "none"
      });
      
      // Invalidar e refetch query da nova loja
      queryClient.invalidateQueries({ 
        queryKey: ["store", storeId],
        refetchType: "all" 
      });
      
      // Invalidar queries relacionadas à nova loja (vai refetch automaticamente)
      queryClient.invalidateQueries({ 
        queryKey: ["products", "store", storeId],
        refetchType: "active" 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["orders", "store", storeId],
        refetchType: "active" 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["statistics", storeId],
        refetchType: "active" 
      });
    }, 0);
  }, [selectedStoreId, queryClient]);

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  // Mas garantir que atualize quando selectedStore ou selectedStoreId mudarem
  const value = useMemo(() => ({
    selectedStore: selectedStore || null,
    selectedStoreId: selectedStoreId || null,
    setSelectedStoreId,
    userStores,
    isLoading: isLoading || !isMounted,
  }), [selectedStore, selectedStoreId, setSelectedStoreId, userStores, isLoading, isMounted]);

  return (
    <SelectedStoreContext.Provider value={value}>
      {children}
    </SelectedStoreContext.Provider>
  );
}

export function useSelectedStore() {
  const context = useContext(SelectedStoreContext);
  if (context === undefined) {
    throw new Error("useSelectedStore must be used within SelectedStoreProvider");
  }
  return context;
}

