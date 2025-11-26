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
    queryFn: async () => {
      if (!user?.id) {
        return { stores: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, perPage: 100 } };
      }
      const result = await storesService.findAll({ 
        ownerId: user.id,
        page: 1,
        limit: 100, // Buscar até 100 lojas do usuário
      });
      return result;
    },
    enabled: !!user?.id,
    staleTime: 0, // Sempre buscar dados atualizados
    refetchOnWindowFocus: true, // Refetch quando a janela receber foco
  });

  const userStores = storesData?.stores || [];
  
  // Debug: log quando userStores mudar
  useEffect(() => {
    if (user?.id) {
      console.log("userStores atualizado:", {
        userId: user.id,
        userEmail: user.email,
        storesCount: userStores.length,
        stores: userStores.map(s => ({ id: s.id, name: s.name, ownerId: s.ownerId, status: s.status })),
      });
    }
  }, [userStores, user]);

  // Carregar loja selecionada do localStorage apenas no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Quando as lojas são carregadas, validar e selecionar loja
  useEffect(() => {
    if (!isMounted || userStores.length === 0) {
      return;
    }

    const saved = typeof window !== "undefined" ? localStorage.getItem(SELECTED_STORE_KEY) : null;
    
    // Se há uma loja salva e ela existe na lista de lojas do usuário, usar ela
    if (saved && userStores.some((s) => s.id === saved)) {
      if (selectedStoreId !== saved) {
        console.log("Usando loja salva do localStorage:", saved);
        setSelectedStoreIdState(saved);
      }
      return;
    }

    // Se não há loja salva OU a loja salva não existe mais, selecionar a primeira
    if (!saved || !userStores.some((s) => s.id === saved)) {
      if (saved) {
        console.log("Loja salva não existe mais, limpando:", saved);
        if (typeof window !== "undefined") {
          localStorage.removeItem(SELECTED_STORE_KEY);
        }
      }
      
      const firstStore = userStores[0];
      console.log("Selecionando primeira loja:", firstStore.id, firstStore.name);
      setSelectedStoreIdState(firstStore.id);
      if (typeof window !== "undefined") {
        localStorage.setItem(SELECTED_STORE_KEY, firstStore.id);
      }
    }
  }, [isMounted, userStores, selectedStoreId]);

  // Buscar dados da loja selecionada - sempre buscar dados atualizados
  const { data: selectedStoreData } = useQuery({
    queryKey: ["store", selectedStoreId],
    queryFn: () => storesService.findById(selectedStoreId!),
    enabled: !!selectedStoreId && isMounted,
    staleTime: 0, // Sempre buscar dados atualizados
    refetchOnWindowFocus: true, // Refetch quando a janela receber foco
    retry: false, // Não tentar novamente se a loja não for encontrada (404)
  });

  // Usar useMemo para garantir que selectedStore seja recalculado quando selectedStoreId ou userStores mudarem
  // Priorizar dados da lista de lojas para atualização imediata, mesmo que a query ainda não tenha atualizado
  const selectedStore = useMemo(() => {
    if (!selectedStoreId) {
      console.log("selectedStore é null porque selectedStoreId é null");
      return null;
    }
    
    // Primeiro tentar encontrar na lista de lojas (mais rápido, atualização imediata)
    const storeFromList = userStores.find(
      (store) => store.id === selectedStoreId,
    );
    
    // Se encontrar na lista, usar (mesmo que selectedStoreData ainda não tenha atualizado)
    // Isso garante atualização imediata quando a loja muda
    if (storeFromList) {
      console.log("selectedStore encontrado na lista:", storeFromList.name);
      return storeFromList;
    }
    
    // Se não encontrar na lista, usar dados da query (pode estar carregando)
    if (selectedStoreData) {
      console.log("selectedStore encontrado na query:", selectedStoreData.name);
      return selectedStoreData;
    }
    
    console.log("selectedStore não encontrado - selectedStoreId:", selectedStoreId, "userStores:", userStores.length);
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

  // Calcular isLoading: deve ser true enquanto:
  // 1. Não está montado no cliente
  // 2. Está carregando lojas do usuário
  // 3. Há lojas mas ainda não selecionou uma (aguardando seleção automática)
  const isLoadingStores = isLoading || !isMounted;
  const isWaitingForSelection = userStores.length > 0 && !selectedStoreId && isMounted;
  const contextIsLoading = isLoadingStores || isWaitingForSelection;

  // Memoizar o valor do contexto para evitar re-renders desnecessários
  // Mas garantir que atualize quando selectedStore ou selectedStoreId mudarem
  const value = useMemo(() => ({
    selectedStore: selectedStore || null,
    selectedStoreId: selectedStoreId || null,
    setSelectedStoreId,
    userStores,
    isLoading: contextIsLoading,
  }), [selectedStore, selectedStoreId, setSelectedStoreId, userStores, contextIsLoading]);

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

