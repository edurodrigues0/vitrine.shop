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
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  // Verificar token no localStorage imediatamente após montagem
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      setHasToken(!!localStorage.getItem("authToken"));
    }
  }, []);

  // Redirecionar usuários autenticados para o dashboard
  useEffect(() => {
    if (isMounted && hasToken === false) {
      // Não há token, não precisa esperar pela query
      return;
    }
    if (isMounted && !isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isMounted, isAuthenticated, isLoading, router, hasToken]);

  // Durante a renderização inicial (SSR), sempre mostrar o conteúdo
  // para evitar diferenças entre servidor e cliente
  if (!isMounted) {
    return <>{children}</>;
  }

  // Se não há token, mostrar conteúdo imediatamente (sem esperar pela query)
  if (hasToken === false) {
    return <>{children}</>;
  }

  // Se há token, aguardar verificação de autenticação
  // Mostrar loading apenas se estiver verificando autenticação
  if (hasToken && isLoading) {
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

