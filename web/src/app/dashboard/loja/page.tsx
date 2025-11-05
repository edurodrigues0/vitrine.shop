"use client";

import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { citiesService } from "@/services/cities-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Store, Edit, MapPin, MessageCircle, Instagram, Facebook, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StoreDashboardPage() {
  const { user } = useAuth();

  const { data: storesData, isLoading } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user,
  });

  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
  );

  const storeCity = citiesData?.cities.find(
    (city) => city.id === userStore?.cityId,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userStore) {
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
            <Link href="/dashboard/loja/cadastro">Criar Loja</Link>
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Minha Loja</h1>
          <p className="text-muted-foreground">Gerencie as informações da sua loja</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/loja/cadastro?id=${userStore.id}`}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Banner e Logo */}
      <div className="mb-6">
        <Card className="overflow-hidden">
          {userStore.bannerUrl ? (
            <div className="relative h-48 md:h-64 w-full">
              <Image
                src={userStore.bannerUrl}
                alt={userStore.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-48 md:h-64 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <Store className="h-16 w-16 text-primary opacity-50" />
            </div>
          )}
          <div className="p-6 -mt-12 relative">
            <div className="flex items-end gap-4">
              {userStore.logoUrl ? (
                <div className="relative h-24 w-24 rounded-lg border-4 border-background shadow-lg bg-background">
                  <Image
                    src={userStore.logoUrl}
                    alt={userStore.name}
                    fill
                    className="object-contain rounded"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-lg border-4 border-background shadow-lg bg-primary/10 flex items-center justify-center">
                  <Store className="h-12 w-12 text-primary" />
                </div>
              )}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{userStore.name}</h2>
                  {getStatusBadge(userStore.status)}
                </div>
                {storeCity && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{storeCity.name}, {storeCity.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informações Básicas
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nome da Loja</p>
              <p className="font-semibold">{userStore.name}</p>
            </div>
            {userStore.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm">{userStore.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Slug</p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                {userStore.slug}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              {getStatusBadge(userStore.status)}
            </div>
          </div>
        </Card>

        {/* Contato */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contato
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </p>
              <a
                href={`https://wa.me/${userStore.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1 transition-colors"
              >
                {userStore.whatsapp}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {userStore.instagramUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </p>
                <a
                  href={userStore.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 flex items-center gap-1 transition-colors"
                >
                  {userStore.instagramUrl.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {userStore.facebookUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </p>
                <a
                  href={userStore.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  {userStore.facebookUrl.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

