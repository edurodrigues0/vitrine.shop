"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/react-query";
import { CityProvider } from "@/contexts/city-context";
import { CartProvider } from "@/contexts/cart-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CityProvider>
        <CartProvider>
          {children}
          <Toaster position="top-right" richColors />
        </CartProvider>
      </CityProvider>
    </QueryClientProvider>
  );
}

