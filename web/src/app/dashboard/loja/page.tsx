"use client";

import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Store, Edit } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StoreDashboardPage() {
  const { user } = useAuth();

  const { data: storesData, isLoading } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user,
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Minha Loja</h1>
        <Button asChild>
          <Link href="/dashboard/loja/cadastro">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Básicas</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-semibold">{userStore.name}</p>
            </div>
            {userStore.description && (
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-semibold">{userStore.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="font-semibold">{userStore.slug}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-semibold capitalize">{userStore.status.toLowerCase()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Contato</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">WhatsApp</p>
              <p className="font-semibold">{userStore.whatsapp}</p>
            </div>
            {userStore.instagramUrl && (
              <div>
                <p className="text-sm text-muted-foreground">Instagram</p>
                <a
                  href={userStore.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  {userStore.instagramUrl}
                </a>
              </div>
            )}
            {userStore.facebookUrl && (
              <div>
                <p className="text-sm text-muted-foreground">Facebook</p>
                <a
                  href={userStore.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  {userStore.facebookUrl}
                </a>
              </div>
            )}
          </div>
        </Card>

        {userStore.logoUrl && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Logo</h2>
            <div className="relative h-32 w-32">
              <Image
                src={userStore.logoUrl}
                alt={userStore.name}
                fill
                className="object-contain rounded"
              />
            </div>
          </Card>
        )}

        {userStore.bannerUrl && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Banner</h2>
            <div className="relative h-48 w-full">
              <Image
                src={userStore.bannerUrl}
                alt={userStore.name}
                fill
                className="object-cover rounded"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

