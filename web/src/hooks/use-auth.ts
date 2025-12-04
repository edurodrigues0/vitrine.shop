"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth-service";
import type { LoginRequest, User } from "@/dtos/user";
import { showError, showSuccess } from "@/lib/toast";

const AUTH_KEY = ["auth", "me"];

/**
 * Verifica se há sessão ativa (token no localStorage ou cookie do Better Auth)
 */
function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  
  // Verificar token no localStorage
  if (localStorage.getItem("authToken")) return true;
  
  // Verificar cookie do Better Auth (nomes comuns que o Better Auth usa)
  const cookies = document.cookie.split("; ");
  const hasBetterAuthCookie = cookies.some((cookie) => {
    const cookieName = cookie.trim().split("=")[0];
    return (
      cookieName === "better-auth.session_token" ||
      cookieName === "better-auth.session" ||
      cookieName.startsWith("better-auth.session_token") ||
      cookieName.startsWith("better-auth.session")
    );
  });
  
  return hasBetterAuthCookie;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const hasCheckedCallback = useRef(false);
  const isOAuthCallback = useRef(false);

  // Verificar se há sessão ativa (token ou cookie) - reativo
  const [hasToken, setHasToken] = useState(() => hasActiveSession());
  const [isCheckingOAuth, setIsCheckingOAuth] = useState(false);

  // Verificar callback do Google OAuth usando window.location.search
  useEffect(() => {
    if (hasCheckedCallback.current || typeof window === "undefined") return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const fromGoogle = searchParams.get("from") === "google";
    const error = searchParams.get("error");
    
    hasCheckedCallback.current = true;

    // Tratamento de erro do OAuth
    if (error) {
      showError("Erro ao autenticar com Google. Tente novamente.");
      // Remover parâmetros da URL
      router.replace("/login");
      return;
    }

    // Se veio do callback do Google, marcar e verificar sessão
    if (fromGoogle) {
      isOAuthCallback.current = true;
      setIsCheckingOAuth(true);
      
      // Aguardar um pouco para garantir que o cookie foi definido
      setTimeout(async () => {
        try {
          // Verificar sessão usando a API do Better Auth
          const hasSession = await authService.checkSession();
          
          if (hasSession) {
            setHasToken(true);
            // Forçar refetch imediato
            await queryClient.refetchQueries({ queryKey: AUTH_KEY });
            queryClient.invalidateQueries({ queryKey: ["stores", "user"] });
            showSuccess("Login com Google realizado com sucesso!");
            // Remover parâmetros da URL
            router.replace("/dashboard");
            setIsCheckingOAuth(false);
          } else {
            // Se não há sessão após callback, pode ser que ainda esteja processando
            // Tentar novamente após um delay
            setTimeout(async () => {
              const retrySession = await authService.checkSession();
              if (retrySession) {
                setHasToken(true);
                await queryClient.refetchQueries({ queryKey: AUTH_KEY });
                queryClient.invalidateQueries({ queryKey: ["stores", "user"] });
                showSuccess("Login com Google realizado com sucesso!");
                router.replace("/dashboard");
              } else {
                showError("Não foi possível verificar a sessão. Tente fazer login novamente.");
                router.replace("/login");
              }
              setIsCheckingOAuth(false);
            }, 1000);
          }
        } catch (error) {
          console.error("Erro ao verificar sessão após OAuth:", error);
          showError("Erro ao verificar sessão. Tente fazer login novamente.");
          router.replace("/login");
        } finally {
          setIsCheckingOAuth(false);
        }
      }, 500);
    }
  }, [router, queryClient]);

  // Atualizar hasToken quando cookies mudarem (após callback do Google)
  // Usar verificação mais inteligente: apenas quando necessário
  useEffect(() => {
    if (isCheckingOAuth) return; // Não verificar durante callback OAuth
    
    let interval: NodeJS.Timeout | null = null;
    
    const checkSession = () => {
      const active = hasActiveSession();
      if (active !== hasToken) {
        setHasToken(active);
      }
    };
    
    // Verificar imediatamente
    checkSession();
    
    // Se não há token mas estamos verificando (após OAuth), verificar mais frequentemente
    // Caso contrário, verificar menos frequentemente
    if (!hasToken || isOAuthCallback.current) {
      // Verificar a cada 2 segundos durante callback OAuth ou quando não há token
      interval = setInterval(checkSession, 2000);
    } else {
      // Se já está autenticado, verificar apenas quando a janela ganha foco
      const handleFocus = () => {
        checkSession();
      };
      window.addEventListener("focus", handleFocus);
      
      return () => {
        window.removeEventListener("focus", handleFocus);
      };
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [hasToken, isCheckingOAuth]);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User | null>({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      try {
        return await authService.me();
      } catch (error: any) {
        // Se receber 401, limpar token inválido silenciosamente
        if (error?.status === 401 || error?.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            // Limpar cookies do Better Auth também
            const cookieNames = [
              "better-auth.session_token",
              "better-auth.session",
            ];
            cookieNames.forEach((name) => {
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            });
            // Invalidar a query para evitar novas tentativas
            queryClient.setQueryData(AUTH_KEY, null);
            setHasToken(false);
          }
          // Retornar null em vez de lançar erro para evitar logs no console
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
    enabled: hasToken || isCheckingOAuth, // Habilitar também durante verificação OAuth
    // Evitar refetch automático quando não há token
    refetchOnMount: hasToken || isCheckingOAuth,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      // Store token in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", response.token);
      }
      // Update auth query with user data
      queryClient.setQueryData(AUTH_KEY, response.user);
      // Invalidar cache de lojas para buscar dados atualizados após login
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] });
      router.push("/dashboard");
      showSuccess("Login realizado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        typeof error?.message === "string"
          ? error.message
          : error?.response?.data?.message ?? "Não foi possível entrar.";
      showError(message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
      showSuccess("Sessão encerrada");
    },
    onError: () => {
      showError("Não foi possível encerrar a sessão");
    },
  });

  const handleGoogleLogin = (callbackURL?: string) => {
    authService.googleLogin(callbackURL);
  };

  return {
    user,
    isLoading: isLoading || isCheckingOAuth, // Incluir estado de verificação OAuth
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    googleLogin: handleGoogleLogin,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isCheckingOAuth, // Expor estado para componentes que precisam saber
  };
}

