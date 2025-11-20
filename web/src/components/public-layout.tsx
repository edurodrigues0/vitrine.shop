"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { OrderNotificationsList } from "@/components/order-notification";
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
  const [isMounted, setIsMounted] = useState(false);

  // Rotas protegidas que não devem mostrar o Header/Footer público
  const protectedRoutes = [
    "/dashboard",
    "/loja",
    "/produtos",
    "/pedidos",
    "/estatisticas",
    "/configuracoes",
    "/perfil",
    "/notificacoes",
  ];

  // Verifica se a rota atual é uma rota protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname?.startsWith(route)
  );

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

  // Se estiver em uma rota protegida e autenticado, não mostrar header/footer da LP
  // (as rotas protegidas têm seu próprio layout)
  if (isProtectedRoute && isAuthenticated) {
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
      <OrderNotificationsList />
    </>
  );
}

