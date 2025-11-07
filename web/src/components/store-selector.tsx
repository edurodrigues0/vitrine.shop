"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Store, Check, ChevronDown } from "lucide-react";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { citiesService } from "@/services/cities-service";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function StoreSelector() {
  const { selectedStore, setSelectedStoreId, userStores, isLoading } = useSelectedStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Buscar todas as cidades (necessário para mostrar cidade de todas as lojas no dropdown)
  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    enabled: !!selectedStore,
  });

  const storeCity = citiesData?.cities.find(
    (city) => city.id === selectedStore?.cityId,
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  if (isLoading || !selectedStore) {
    return null;
  }

  // Se o usuário tem apenas uma loja, mostrar apenas a informação
  if (userStores.length <= 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Store className="h-4 w-4" />
        <span className="hidden sm:inline">{selectedStore.name}</span>
        {storeCity && (
          <span className="hidden md:inline">
            • {storeCity.name}, {storeCity.state}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        className="gap-2 h-9 min-w-[200px] justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedStore.logoUrl ? (
            <div className="relative h-5 w-5 flex-shrink-0">
              <Image
                src={selectedStore.logoUrl}
                alt={selectedStore.name}
                fill
                className="object-contain rounded"
                unoptimized
              />
            </div>
          ) : (
            <Store className="h-4 w-4 flex-shrink-0" />
          )}
          <span className="truncate text-sm font-medium">
            {selectedStore.name}
          </span>
        </div>
        <ChevronDown className={cn("h-4 w-4 flex-shrink-0 opacity-50 transition-transform", isOpen && "rotate-180")} />
      </Button>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-[300px] border border-border rounded-md shadow-lg z-50 overflow-hidden bg-background"
          style={{ backgroundColor: 'hsl(var(--popover))' }}
        >
          <div className="p-2">
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
              Selecionar Loja
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {userStores.map((store) => {
                const isSelected = store.id === selectedStore.id;
                const storeCityData = citiesData?.cities.find(
                  (city) => city.id === store.cityId,
                );
                return (
                  <button
                    key={store.id}
                    onClick={async () => {
                      if (store.id !== selectedStore?.id) {
                        setSelectedStoreId(store.id);
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {store.logoUrl ? (
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={store.logoUrl}
                          alt={store.name}
                          fill
                          className="object-contain rounded"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 flex-shrink-0 rounded bg-primary/10 flex items-center justify-center">
                        <Store className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {store.name}
                      </div>
                      {storeCityData && (
                        <div className="text-xs text-muted-foreground">
                          {storeCityData.name}, {storeCityData.state}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

