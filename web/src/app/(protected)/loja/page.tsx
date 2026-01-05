"use client";

import { useQuery } from "@tanstack/react-query";
import { citiesService } from "@/services/cities-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Edit, MapPin, MessageCircle, Instagram, Facebook, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StoreDashboardPage() {
  const { selectedStore, isLoading } = useSelectedStore();

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
  });

  const storeCity = citiesData?.cities.find(
    (city) => city.id === selectedStore?.cityId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Minha Loja</h1>
        <Card className="p-8 text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Você ainda não possui uma loja
          </h2>
          <p className="text-muted-foreground mb-6">
            Crie sua loja para começar a vender produtos.
          </p>
          <Button asChild>
            <Link href="/loja/cadastro">Criar Loja</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Ativa", icon: CheckCircle2, className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20" },
      INACTIVE: { label: "Inativa", icon: XCircle, className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
      PENDING: { label: "Pendente", icon: Clock, className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border flex items-center gap-1.5 px-3 py-1`}>
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Loja</h1>
          <p className="text-muted-foreground">Gerencie as informações e a aparência da sua vitrine.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link
              href={`/cidade/${storeCity?.slug || 'cidade'}/loja/${selectedStore.slug}`}
              target="_blank"
              className="gap-2 flex items-center"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Loja
            </Link>
          </Button>

          <Button asChild>
            <Link
              href={`/loja/cadastro?id=${selectedStore.id}`}
              className="gap-2 flex items-center"
            >
              <Edit className="h-4 w-4" />
              Editar Loja
            </Link>
          </Button>
        </div>
      </div>

      {/* Banner e Logo */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 pointer-events-none" />
        <Card className="overflow-hidden border-none shadow-xl bg-muted/30">
          {selectedStore.bannerUrl ? (
            <div className="relative h-64 w-full">
              <Image
                src={selectedStore.bannerUrl}
                alt={selectedStore.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
            </div>
          ) : (
            <div className="relative h-64 w-full bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20 flex items-center justify-center">
              <Store className="h-20 w-20 text-primary/40" />
            </div>
          )}

          <div className="relative z-20 px-8 pb-8 -mt-20 flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative shrink-0">
              {selectedStore.logoUrl ? (
                <div className="h-32 w-32 rounded-2xl border-4 border-background shadow-2xl bg-background overflow-hidden relative">
                  <Image
                    src={selectedStore.logoUrl}
                    alt={selectedStore.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-2xl border-4 border-background shadow-2xl bg-primary/10 flex items-center justify-center backdrop-blur-sm">
                  <Store className="h-12 w-12 text-primary" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2">
                {getStatusBadge(selectedStore.status)}
              </div>
            </div>

            <div className="flex-1 space-y-2 mb-2">
              <h2 className="text-4xl font-bold text-foreground drop-shadow-sm">{selectedStore.name}</h2>
              {storeCity && (
                <div className="flex items-center gap-2 text-muted-foreground bg-background/50 backdrop-blur-md px-3 py-1 rounded-full w-fit border shadow-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-medium">{storeCity.name}, {storeCity.state}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Informações em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Informações Básicas */}
        <Card className="p-6 flex flex-col hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Detalhes</h3>
          </div>

          <div className="space-y-4 flex-1">
            {selectedStore.description && (
              <div className="bg-muted/50 p-3 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-1 font-medium">Descrição</p>
                <p className="text-sm leading-relaxed">{selectedStore.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">Slug (URL)</p>
              <code className="text-xs bg-muted px-2 py-1 rounded border block w-fit">
                {selectedStore.slug}
              </code>
            </div>
            {selectedStore.cnpjcpf && (
              <div>
                <p className="text-sm text-muted-foreground mb-1 font-medium">CNPJ/CPF</p>
                <p className="font-mono text-sm">{selectedStore.cnpjcpf}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Contato */}
        <Card className="p-6 flex flex-col hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Contato</h3>
          </div>

          <div className="space-y-3 flex-1">
            <a
              href={`https://wa.me/${selectedStore.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 hover:border-green-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-500 text-white p-1.5 rounded-full">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <span className="font-medium text-green-900 dark:text-green-100">{selectedStore.whatsapp}</span>
              </div>
              <ExternalLink className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {selectedStore.instagramUrl && (
              <a
                href={selectedStore.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900 hover:border-pink-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-pink-500 text-white p-1.5 rounded-full">
                    <Instagram className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-pink-900 dark:text-pink-100 truncate max-w-[150px]">
                    {selectedStore.instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\//, "@")}
                  </span>
                </div>
                <ExternalLink className="h-4 w-4 text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {selectedStore.facebookUrl && (
              <a
                href={selectedStore.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-1.5 rounded-full">
                    <Facebook className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-blue-900 dark:text-blue-100 truncate max-w-[150px]">Facebook</span>
                </div>
                <ExternalLink className="h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </Card>

        {/* Aparência */}
        <Card className="p-6 flex flex-col hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg">Aparência</h3>
          </div>

          <div className="space-y-4 flex-1">
            {selectedStore.theme ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 text-center">
                  <div
                    className="w-full aspect-square rounded-xl shadow-sm border ring-2 ring-offset-2 ring-transparent hover:ring-primary/20 transition-all"
                    style={{ backgroundColor: selectedStore.theme.primary || '#000000' }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">Primária</span>
                </div>
                <div className="space-y-2 text-center">
                  <div
                    className="w-full aspect-square rounded-xl shadow-sm border ring-2 ring-offset-2 ring-transparent hover:ring-primary/20 transition-all"
                    style={{ backgroundColor: selectedStore.theme.secondary || '#ffffff' }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">Secundária</span>
                </div>
                <div className="space-y-2 text-center">
                  <div
                    className="w-full aspect-square rounded-xl shadow-sm border ring-2 ring-offset-2 ring-transparent hover:ring-primary/20 transition-all"
                    style={{ backgroundColor: selectedStore.theme.highlight || '#808080' }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">Destaque</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum tema configurado.</p>
              </div>
            )}
            <div className="pt-4 mt-auto">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/loja/cadastro?id=${selectedStore.id}`}>Personalizar Tema</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

