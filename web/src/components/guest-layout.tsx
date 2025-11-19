"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface GuestLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout que redireciona usuários autenticados para o dashboard
 * e permite apenas usuários não autenticados acessarem as páginas
 */
export function GuestLayout({ children }: GuestLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Garantir que só renderizamos após a montagem no cliente
  // Isso evita problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (isMounted && !isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  // Durante a renderização inicial (SSR), sempre mostrar o conteúdo
  // para evitar diferenças entre servidor e cliente
  if (!isMounted) {
    return <>{children}</>;
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se estiver autenticado, não mostrar o conteúdo (será redirecionado)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Usuário não autenticado - mostrar conteúdo normalmente
  return <>{children}</>;
}

