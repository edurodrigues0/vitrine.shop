"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/react-query";
import { CityProvider } from "@/contexts/city-context";
import { CartProvider } from "@/contexts/cart-context";
import { OrderNotificationsProvider } from "@/contexts/order-notifications-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CityProvider>
        <CartProvider>
          <OrderNotificationsProvider>
            {children}
            <Toaster position="top-right" richColors />
          </OrderNotificationsProvider>
        </CartProvider>
      </CityProvider>
    </QueryClientProvider>
  );
}

