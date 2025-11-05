"use client";

import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Loader2 } from "lucide-react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout que mostra header e footer apenas para usuários não autenticados
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se o usuário estiver autenticado, não mostrar header/footer da LP
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Usuário não autenticado - mostrar header e footer da landing page
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

