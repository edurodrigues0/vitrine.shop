"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { citiesService } from "@/services/cities-service";
import { useCity } from "@/contexts/city-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  ChevronDown,
  Search,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSlug } from "@/lib/slug";
import type { City } from "@/dtos/city";

interface CitySelectorProps {
  className?: string;
  onCitySelect?: (city: City) => void;
}

export function CitySelector({ className, onCitySelect }: CitySelectorProps) {
  const router = useRouter();
  const { selectedCity, setSelectedCity, isLoading: contextLoading } = useCity();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const cities = data?.cities || [];

  const filteredCities = cities.filter((city) => {
    const search = searchTerm.toLowerCase();
    return (
      city.name.toLowerCase().includes(search) ||
      city.state.toLowerCase().includes(search)
    );
  });

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setIsOpen(false);
    setSearchTerm("");
    
    // Navegar para a página da cidade
    const citySlug = createSlug(city.name);
    router.push(`/cidade/${citySlug}`);
    
    onCitySelect?.(city);
  };

  if (contextLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {selectedCity
              ? `${selectedCity.name}, ${selectedCity.state}`
              : "Selecione uma cidade"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-180",
          )}
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute top-full left-0 mt-2 z-50 w-full min-w-[300px] border border-border rounded-lg shadow-lg bg-background"
            style={{ backgroundColor: 'hsl(var(--popover))' }}
          >
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar cidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Carregando cidades...
                  </p>
                </div>
              ) : error ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-destructive">
                    Erro ao carregar cidades
                  </p>
                </div>
              ) : filteredCities.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma cidade encontrada
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city)}
                      className={cn(
                        "w-full px-4 py-2 text-left hover:bg-accent transition-colors",
                        selectedCity?.id === city.id && "bg-accent",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {city.name}, {city.state}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

