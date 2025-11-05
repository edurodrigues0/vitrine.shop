"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Store, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { citiesService } from "@/services/cities-service";
import { createSlug } from "@/lib/slug";
import Link from "next/link";
import Image from "next/image";

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Buscar lojas enquanto digita
  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", "search", searchTerm],
    queryFn: () =>
      storesService.findAll({
        name: searchTerm,
        limit: 5, // Limitar a 5 resultados
      }),
    enabled: searchTerm.length >= 2, // Só buscar se tiver pelo menos 2 caracteres
    staleTime: 1000,
  });

  // Buscar cidades para obter os slugs
  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const stores = storesData?.stores || [];
  const cities = citiesData?.cities || [];

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Abrir dropdown quando houver resultados
  useEffect(() => {
    if (searchTerm.length >= 2 && stores.length > 0) {
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, [searchTerm, stores.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Se houver apenas uma loja, navegar diretamente
    if (stores.length === 1) {
      const store = stores[0];
      const city = cities.find((c) => c.id === store.cityId);
      if (city) {
        const citySlug = createSlug(city.name);
        router.push(`/cidade/${citySlug}/loja/${store.slug}`);
        setSearchTerm("");
        setIsDropdownOpen(false);
        return;
      }
    }

    // Caso contrário, redirecionar para página de busca
    router.push(`/?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleClear = () => {
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleStoreClick = (store: typeof stores[0]) => {
    const city = cities.find((c) => c.id === store.cityId);
    if (city) {
      const citySlug = createSlug(city.name);
      router.push(`/cidade/${citySlug}/loja/${store.slug}`);
      setSearchTerm("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produtos, lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm.length >= 2 && stores.length > 0) {
                setIsDropdownOpen(true);
              }
            }}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {/* Dropdown de resultados */}
      {isDropdownOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background/98 backdrop-blur-xl border border-border/60 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoadingStores ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : stores.length > 0 ? (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                Lojas
              </div>
              {stores.map((store) => {
                const city = cities.find((c) => c.id === store.cityId);
                return (
                  <button
                    key={store.id}
                    type="button"
                    onClick={() => handleStoreClick(store)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                  >
                    {store.logoUrl ? (
                      <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={store.logoUrl}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 flex-shrink-0 rounded bg-primary/10 flex items-center justify-center">
                        <Store className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{store.name}</div>
                      {city && (
                        <div className="text-sm text-muted-foreground truncate">
                          {city.name} - {city.state}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma loja encontrada
            </div>
          )}
        </div>
      )}
    </div>
  );
}
