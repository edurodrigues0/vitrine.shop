"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Store,
    Instagram,
    Facebook,
    MessageCircle,
    MapPin,
    ShoppingCart,
    Package,
    CheckCircle2,
    ArrowLeft,
    Search,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { LazyImage } from "@/components/lazy-image";

// Utility to convert hex to HSL (copied from layout)
function hexToHSL(hex: string): string {
    try {
        if (!hex) return "0 0% 0%";
        hex = hex.replace(/^#/, '');

        // Handle short hex
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

export default function StorePreviewPage() {
    const [storeData, setStoreData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = localStorage.getItem("store_preview_data");
        if (data) {
            try {
                setStoreData(JSON.parse(data));
            } catch (e) {
                console.error("Failed to parse preview data", e);
            }
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!storeData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold mb-4">Nenhuma pré-visualização disponível</h1>
                <p className="text-muted-foreground mb-4">Volte para o formulário e clique em "Pré-visualizar".</p>
                <Button asChild>
                    <Link href="/loja/cadastro">Voltar</Link>
                </Button>
            </div>
        );
    }

    const { theme } = storeData;

    // Apply CSS variables
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

    // Dummy products for preview
    const dummyProducts = Array.from({ length: 4 }).map((_, i) => ({
        id: `preview-${i}`,
        name: `Produto Exemplo ${i + 1}`,
        description: "Esta é uma descrição de exemplo para visualizar como seus produtos ficarão na loja.",
        price: 9990 + (i * 5000),
        imageUrl: null,
    }));

    return (
        <div style={cssVariables} className="min-h-screen bg-background text-foreground font-sans">
            {/* Preview Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 text-white p-2 text-center text-sm font-medium backdrop-blur-sm">
                Modo de Pré-visualização - As alterações não foram salvas
                <Button variant="link" className="text-white underline ml-2 h-auto p-0" onClick={() => window.close()}>
                    Fechar
                </Button>
            </div>

            <div className="pt-10"> {/* Offset for preview header */}
                {/* Banner Section */}
                <div className="relative w-full">
                    {storeData.bannerUrl ? (
                        <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
                            <img
                                src={storeData.bannerUrl}
                                alt="Banner"
                                className="object-cover w-full h-full"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
                        </div>
                    ) : (
                        <div
                            className="h-64 md:h-80 lg:h-96 w-full flex items-center justify-center relative overflow-hidden"
                            style={{
                                background: theme.primaryGradient || `linear-gradient(135deg, ${theme.primary}15 0%, ${theme.secondary}15 100%)`,
                            }}
                        >
                            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                            <Store className="h-32 w-32 text-primary/30" />
                        </div>
                    )}

                    {/* Store Info Overlay */}
                    <div className="container mx-auto px-4 -mt-20 relative z-10">
                        <Card className="p-6 md:p-8 shadow-xl border-2 bg-card/95 backdrop-blur-sm">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Logo */}
                                {storeData.logoUrl ? (
                                    <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-background shadow-lg bg-white">
                                        <img
                                            src={storeData.logoUrl}
                                            alt="Logo"
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 rounded-2xl flex items-center justify-center border-4 border-background shadow-lg"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        }}
                                    >
                                        <Store className="h-12 w-12 md:h-16 md:w-16 text-white" />
                                    </div>
                                )}

                                {/* Store Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-3xl md:text-4xl font-bold">{storeData.name || "Nome da Loja"}</h1>
                                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Aberta
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                                <MapPin className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {storeData.city?.name || "Cidade"}, {storeData.city?.state || "UF"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {storeData.description && (
                                        <p className="text-muted-foreground mb-6 leading-relaxed">
                                            {storeData.description}
                                        </p>
                                    )}

                                    {/* Social Links & Contact */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {storeData.instagramUrl && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md cursor-not-allowed opacity-90">
                                                <Instagram className="h-4 w-4" />
                                                <span className="text-sm font-medium">Instagram</span>
                                            </div>
                                        )}
                                        {storeData.facebookUrl && (
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md cursor-not-allowed opacity-90">
                                                <Facebook className="h-4 w-4" />
                                                <span className="text-sm font-medium">Facebook</span>
                                            </div>
                                        )}
                                        {storeData.whatsapp && (
                                            <Button
                                                size="lg"
                                                className="bg-green-500 hover:bg-green-600 text-white shadow-md cursor-not-allowed opacity-90"
                                            >
                                                <MessageCircle className="h-5 w-5 mr-2" />
                                                Entrar em contato
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Products Section */}
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Produtos</h2>
                            <p className="text-muted-foreground">Exemplo de como seus produtos serão exibidos</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dummyProducts.map((product) => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/50 bg-card">
                                <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
                                    <div className="h-full w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                                        <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>

                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-primary">
                                            R$ {(product.price / 100).toFixed(2).replace(".", ",")}
                                        </span>
                                    </div>

                                    <Button className="w-full">
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Ver detalhes
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
