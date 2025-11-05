"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isHomePage = pathname === "/";

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
  // Adicionar espaçamento entre header e conteúdo, e entre conteúdo e footer
  // (apenas para páginas fora da home)
  return (
    <>
      <Header />
      <main className={isHomePage ? "" : "pt-24 pb-12 min-h-screen"}>
        {children}
      </main>
      <Footer />
    </>
  );
}

