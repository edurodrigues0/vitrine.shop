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

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
