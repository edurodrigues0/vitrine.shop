import type { Metadata } from "next";

type Props = {
  params: Promise<{ id: string; city: string }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

async function fetchProduct(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.product || null;
  } catch {
    return null;
  }
}

async function fetchStore(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/stores/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.store || null;
  } catch {
    return null;
  }
}

async function fetchProductVariations(productId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/product-variations/product/${productId}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return { productVariations: [] };
    const data = await response.json();
    return data || { productVariations: [] };
  } catch {
    return { productVariations: [] };
  }
}

async function fetchProductImages(variationId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/product-images/variation/${variationId}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return { productImages: [] };
    const data = await response.json();
    return data || { productImages: [] };
  } catch {
    return { productImages: [] };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  try {
    const product = await fetchProduct(resolvedParams.id);
    if (!product) {
      return {
        title: "Produto não encontrado - Vitrine.shop",
        description: "O produto que você está procurando não foi encontrado.",
      };
    }

    const store = await fetchStore(product.storeId);
    
    // Buscar primeira variação para obter preço
    const variationsData = await fetchProductVariations(product.id);
    
    const firstVariation = variationsData.productVariations?.[0];
    const price = firstVariation
      ? (firstVariation.discountPrice || firstVariation.price) / 100
      : null;

    // Buscar primeira imagem
    const imagesData = firstVariation
      ? await fetchProductImages(firstVariation.id)
      : { productImages: [] };
    
    const firstImage = imagesData.productImages?.[0]?.url;

    return {
      title: `${product.name}${store ? ` - ${store.name}` : ""} - Vitrine.shop`,
      description: product.description || `Confira ${product.name} e outros produtos na Vitrine.shop`,
      keywords: `${product.name}, produto, ${store?.name || ""}, ${resolvedParams.city}, compra online`,
      openGraph: {
        title: `${product.name}${store ? ` - ${store.name}` : ""}`,
        description: product.description || `Confira ${product.name} e outros produtos`,
        type: "website",
        images: firstImage ? [{ url: firstImage }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name}${store ? ` - ${store.name}` : ""}`,
        description: product.description || `Confira ${product.name} e outros produtos`,
        images: firstImage ? [firstImage] : undefined,
      },
      other: price
        ? {
            "product:price:amount": price.toFixed(2),
            "product:price:currency": "BRL",
          }
        : {},
    };
  } catch {
    return {
      title: "Produto não encontrado - Vitrine.shop",
      description: "O produto que você está procurando não foi encontrado.",
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

