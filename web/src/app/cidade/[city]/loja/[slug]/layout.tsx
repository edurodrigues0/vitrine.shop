import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string; city: string }>;
};

async function fetchStoreBySlug(slug: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";
  try {
    const response = await fetch(`${API_BASE_URL}/stores/slug/${slug}`, {
      next: { revalidate: 3600 }, // Revalidar a cada hora
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.store || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const store = await fetchStoreBySlug(resolvedParams.slug);

  if (!store) {
    return {
      title: "Loja não encontrada - Vitrine.shop",
      description: "A loja que você está procurando não foi encontrada.",
    };
  }

  return {
    title: `${store.name} - Vitrine.shop`,
    description: store.description || `Confira os produtos e serviços de ${store.name} na Vitrine.shop`,
    keywords: `${store.name}, loja, ${resolvedParams.city}, compra online, WhatsApp`,
    openGraph: {
      title: `${store.name} - Vitrine.shop`,
      description: store.description || `Confira os produtos e serviços de ${store.name}`,
      type: "website",
      images: store.bannerUrl ? [{ url: store.bannerUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${store.name} - Vitrine.shop`,
      description: store.description || `Confira os produtos e serviços de ${store.name}`,
      images: store.bannerUrl ? [store.bannerUrl] : undefined,
    },
  };
}


function hexToHSL(hex: string): string {
  try {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle short hex
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }

    // Parse r, g, b
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return "0 0% 0%"; // Fallback to black
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

    // Return space separated values for Tailwind
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch (e) {
    return "0 0% 0%";
  }
}

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; city: string }>;
}) {
  const resolvedParams = await params;
  const store = await fetchStoreBySlug(resolvedParams.slug);

  if (!store || !store.theme) {
    return <>{children}</>;
  }

  const { theme } = store;

  // Construct CSS variables
  // We override the Tailwind base variables locally for this route
  const cssVariables = {
    '--primary': hexToHSL(theme.primary || '#000000'),
    '--secondary': hexToHSL(theme.secondary || '#ffffff'),
    '--background': hexToHSL(theme.bg || '#ffffff'),
    '--card': hexToHSL(theme.surface || '#f3f4f6'),
    '--foreground': hexToHSL(theme.text || '#000000'),
    '--muted-foreground': hexToHSL(theme.textSecondary || '#6b7280'),
    '--border': hexToHSL(theme.border || '#e5e7eb'),
    '--ring': hexToHSL(theme.highlight || '#fbbf24'),
    '--radius': '0.75rem', // rounded-xl

    // Custom variables if needed directly
    '--color-primary': theme.primary,
    '--color-primary-gradient': theme.primaryGradient || theme.primary,
    '--color-secondary': theme.secondary,
    '--color-bg': theme.bg,
    '--color-surface': theme.surface,
    '--color-text': theme.text,
    '--color-text-secondary': theme.textSecondary,
    '--color-highlight': theme.highlight,
    '--color-border': theme.border,
    '--color-hover': theme.hover,
    '--color-overlay': theme.overlay || 'rgba(0,0,0,0.5)',
  } as React.CSSProperties;

  return (
    <div style={cssVariables} className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
