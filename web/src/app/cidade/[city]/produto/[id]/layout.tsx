"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { storesService } from "@/services/stores-service";

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string {
  try {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return "0 0% 0%";
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (e) {
    return "0 0% 0%";
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const productId = params.id as string;

  // Fetch product to get storeId
  const { data: product } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.findById(productId),
    enabled: !!productId,
  });

  // Fetch store to get theme
  const { data: store } = useQuery({
    queryKey: ["store", product?.storeId],
    queryFn: () => storesService.findById(product!.storeId),
    enabled: !!product?.storeId,
  });

  // Build CSS variables from theme
  const themeStyles = store?.theme ? {
    '--primary': hexToHSL(store.theme.primary),
    '--primary-foreground': '0 0% 100%',
    '--secondary': hexToHSL(store.theme.secondary),
    '--secondary-foreground': '0 0% 100%',
    '--background': hexToHSL(store.theme.bg),
    '--foreground': hexToHSL(store.theme.text),
    '--card': hexToHSL(store.theme.surface),
    '--card-foreground': hexToHSL(store.theme.text),
    '--muted': hexToHSL(store.theme.surface),
    '--muted-foreground': hexToHSL(store.theme.textSecondary),
    '--accent': hexToHSL(store.theme.highlight),
    '--accent-foreground': '0 0% 100%',
    '--border': hexToHSL(store.theme.border),
    '--input': hexToHSL(store.theme.border),
    '--ring': hexToHSL(store.theme.primary),
  } as React.CSSProperties : {};

  return (
    <div className="min-h-screen bg-background text-foreground" style={themeStyles}>
      {children}
    </div>
  );
}
