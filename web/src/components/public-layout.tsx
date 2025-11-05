"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useState, useEffect } from "react";

interface PublicLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout que mostra header e footer apenas para usuários não autenticados
 */
export function PublicLayout({ children }: PublicLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isDashboard = pathname?.startsWith("/dashboard");
  const [isMounted, setIsMounted] = useState(false);

  // Garantir que só renderizamos após a montagem no cliente
  // Isso evita problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Durante a renderização inicial (SSR), sempre mostrar a estrutura completa
  // para evitar diferenças entre servidor e cliente
  if (!isMounted) {
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

  // Se estiver no dashboard e autenticado, não mostrar header/footer da LP
  // (o dashboard tem seu próprio layout)
  if (isDashboard && isAuthenticated) {
    return <>{children}</>;
  }

  // Para todas as outras páginas (públicas), sempre mostrar header e footer
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

