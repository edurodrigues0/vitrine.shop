"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { City } from "@/dtos/city";

interface CityContextType {
  selectedCity: City | null;
  setSelectedCity: (city: City | null) => void;
  isLoading: boolean;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

const CITY_STORAGE_KEY = "vitrine-selected-city";

export function CityProvider({ children }: { children: ReactNode }) {
  const [selectedCity, setSelectedCityState] = useState<City | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load city from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CITY_STORAGE_KEY);
      if (stored) {
        try {
          const city = JSON.parse(stored);
          setSelectedCityState(city);
        } catch {
          // Invalid stored data
          localStorage.removeItem(CITY_STORAGE_KEY);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const setSelectedCity = (city: City | null) => {
    setSelectedCityState(city);
    if (typeof window !== "undefined") {
      if (city) {
        localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(city));
      } else {
        localStorage.removeItem(CITY_STORAGE_KEY);
      }
    }
  };

  return (
    <CityContext.Provider value={{ selectedCity, setSelectedCity, isLoading }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error("useCity must be used within a CityProvider");
  }
  return context;
}

