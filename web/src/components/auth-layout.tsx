"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

// Verificar se há cookie do Better Auth ativo (mesmo que ainda não tenha os dados do usuário)
function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  // Better Auth usa cookies, não localStorage
  const cookies = document.cookie.split("; ");
  return cookies.some((cookie) => {
    const cookieName = cookie.trim().split("=")[0];
    return (
      cookieName === "better-auth.session_token" ||
      cookieName === "better-auth.session" ||
      cookieName.startsWith("better-auth.session_token") ||
      cookieName.startsWith("better-auth.session")
    );
  });
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // Garantir que só renderizamos após a montagem no cliente
  // Isso evita problemas de hidratação
  useEffect(() => {
    setIsMounted(true);
    setSessionActive(hasActiveSession());
  }, []);

  // Atualizar sessionActive quando mudar
  useEffect(() => {
    if (isMounted && !isAuthenticated) {
      const checkSession = () => {
        const active = hasActiveSession();
        setSessionActive(active);
      };
      checkSession();
      // Verificar periodicamente enquanto não estiver autenticado
      const interval = setInterval(checkSession, 500);
      return () => clearInterval(interval);
    } else if (isMounted && isAuthenticated) {
      // Se já está autenticado, não precisa verificar
      setSessionActive(true);
    }
  }, [isMounted, isAuthenticated]);

  useEffect(() => {
    if (isMounted) {
      // Dar um tempo para a query buscar os dados do usuário
      const timer = setTimeout(() => {
        setHasCheckedAuth(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  // Timeout para evitar ficar preso em "Verificando autenticação..."
  useEffect(() => {
    if (isMounted && sessionActive && !isAuthenticated && hasCheckedAuth) {
      // Se após 10 segundos ainda não autenticou, considerar que falhou
      // Aumentado para 10 segundos para dar mais tempo para a query completar
      const timeout = setTimeout(() => {
        setSessionActive(false);
        router.push("/login");
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isMounted, sessionActive, isAuthenticated, hasCheckedAuth, isLoading, router]);

  useEffect(() => {
    // Só redirecionar se já verificou a autenticação e não está autenticado
    // E não há sessão ativa (token/cookie)
    if (isMounted && hasCheckedAuth && !isLoading && !isAuthenticated && !sessionActive) {
      router.push("/login");
    }
  }, [isMounted, hasCheckedAuth, isAuthenticated, isLoading, sessionActive, router]);

  // Durante a renderização inicial (SSR), sempre mostrar o conteúdo
  // para evitar diferenças entre servidor e cliente
  if (!isMounted) {
    return <>{children}</>;
  }

  // Após a montagem, aplicar a lógica condicional
  // Se está carregando OU há sessão ativa mas ainda não verificou autenticação, mostrar loading
  if (isLoading || (sessionActive && !hasCheckedAuth)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está autenticado e não há sessão ativa, não renderizar (será redirecionado)
  if (!isAuthenticated && !sessionActive) {
    return null;
  }

  // Se há sessão ativa mas ainda não tem dados do usuário, mostrar loading
  // Isso dá tempo para a query buscar os dados
  if (sessionActive && !isAuthenticated && hasCheckedAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

