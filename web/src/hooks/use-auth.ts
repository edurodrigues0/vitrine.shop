"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth-service";
import type { LoginRequest, User, UserRole } from "@/dtos/user";
import { showError, showSuccess } from "@/lib/toast";

const AUTH_KEY = ["auth", "me"];

/**
 * Verifica se há sessão ativa (cookie do Better Auth)
 * Better Auth usa cookies para autenticação, não tokens no localStorage
 */
function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  
  // Verificar cookie do Better Auth (nomes comuns que o Better Auth usa)
  const cookies = document.cookie.split("; ");
  const hasBetterAuthCookie = cookies.some((cookie) => {
    const cookieName = cookie.trim().split("=")[0];
    // Verificar qualquer cookie que comece com "better-auth" (mais flexível)
    return (
      cookieName === "better-auth.session_token" ||
      cookieName === "better-auth.session" ||
      cookieName.startsWith("better-auth.session_token") ||
      cookieName.startsWith("better-auth.session") ||
      cookieName.startsWith("better-auth")
    );
  });
  
  return hasBetterAuthCookie;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const hasCheckedCallback = useRef(false);
  const isOAuthCallback = useRef(false);

  // Verificar se há sessão ativa (cookie do Better Auth) - reativo
  // Inicializar verificando cookies imediatamente
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window === "undefined") return false;
    const hasSession = hasActiveSession();
    console.log("[useAuth] Initial hasToken check:", hasSession, "Cookies:", document.cookie);
    return hasSession;
  });
  const [isCheckingOAuth, setIsCheckingOAuth] = useState(false);
  
  // Flag para garantir que tentamos a query pelo menos uma vez na montagem
  // Isso ajuda quando a detecção de cookie falha mas há uma sessão válida
  const [hasTriedInitialQuery, setHasTriedInitialQuery] = useState(false);

  // Verificar callback do Google OAuth
  useEffect(() => {
    if (hasCheckedCallback.current || typeof window === "undefined") return;
    
    const searchParams = new URLSearchParams(window.location.search);
    // Verificar se há parâmetros do Better Auth (code, state) que indicam callback OAuth
    const hasOAuthParams = searchParams.has("code") || searchParams.has("state");
    const fromGoogle = searchParams.get("from") === "google" || hasOAuthParams;
    const error = searchParams.get("error");
    
    hasCheckedCallback.current = true;

    // Tratamento de erro do OAuth
    if (error) {
      showError("Erro ao autenticar com Google. Tente novamente.");
      // Remover parâmetros da URL
      router.replace("/dashboard");
      return;
    }

    // Se veio do callback do Google (detectado por parâmetros OAuth ou ?from=google)
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
                showError("Erro ao verificar sessão após login com Google. Tente fazer login novamente.");
                router.replace("/login");
              }
              setIsCheckingOAuth(false);
            }, 2000);
          }
        } catch (error) {
          console.error("Error checking session after Google OAuth:", error);
          showError("Erro ao verificar sessão após login com Google. Tente fazer login novamente.");
          router.replace("/login");
          setIsCheckingOAuth(false);
        }
      }, 1000);
    }
  }, []);

  // Atualizar hasToken quando cookies mudarem (após callback do Google ou refresh)
  // Verificar imediatamente na montagem para garantir que a query seja habilitada
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Verificar imediatamente na montagem (crítico para funcionar após refresh)
    const active = hasActiveSession();
    console.log("[useAuth] Effect check - active:", active, "hasToken:", hasToken, "Cookies:", document.cookie);
    
    if (active && !hasToken) {
      // Se há sessão ativa mas hasToken é false, atualizar imediatamente
      console.log("[useAuth] Setting hasToken to true (session active)");
      setHasToken(true);
    } else if (!active && hasToken) {
      // Se não há sessão mas hasToken é true, atualizar também
      console.log("[useAuth] Setting hasToken to false (no session)");
      setHasToken(false);
    }
    
    if (isCheckingOAuth) return; // Não verificar durante callback OAuth
    
    let interval: NodeJS.Timeout | null = null;
    
    const checkSession = () => {
      const active = hasActiveSession();
      if (active !== hasToken) {
        console.log("[useAuth] Session changed - active:", active);
        setHasToken(active);
      }
    };
    
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
        console.log("[useAuth] Fetching user data from /me endpoint");
        const authUser = await authService.me();
        if (!authUser) {
          console.log("[useAuth] No user data returned from /me");
          return null;
        }
        console.log("[useAuth] User data fetched successfully:", authUser.email);
        // Converter AuthUserResponse para User (role já é string, mas precisa ser UserRole)
        return {
          ...authUser,
          role: authUser.role as UserRole,
        } as User;
      } catch (error: any) {
        console.error("[useAuth] Error fetching user:", error);
        // Se receber 401, limpar sessão do Better Auth silenciosamente
        if (error?.status === 401 || error?.response?.status === 401) {
          console.log("[useAuth] 401 Unauthorized - clearing session");
          if (typeof window !== "undefined") {
            // Limpar cookies do Better Auth
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
    retry: 1, // Tentar uma vez se falhar
    staleTime: 0, // Sempre considerar stale para forçar refetch após refresh
    enabled: hasToken || isCheckingOAuth || !hasTriedInitialQuery, // Habilitar também na primeira tentativa
    // Refetch quando montar se houver token
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  
  // Marcar que tentamos a query inicial após a primeira execução
  useEffect(() => {
    if (!hasTriedInitialQuery && (isLoading === false || user || error)) {
      setHasTriedInitialQuery(true);
      console.log("[useAuth] Initial query attempt completed");
    }
  }, [hasTriedInitialQuery, isLoading, user, error]);

  // Debug: Log quando hasToken ou enabled mudar
  useEffect(() => {
    console.log("[useAuth] Query enabled:", hasToken || isCheckingOAuth, "hasToken:", hasToken, "isCheckingOAuth:", isCheckingOAuth, "isLoading:", isLoading, "user:", user?.email);
  }, [hasToken, isCheckingOAuth, isLoading, user]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (response) => {
      // Better Auth usa cookies para sessão
      // O token retornado não é um JWT válido para nosso sistema, então não salvamos no localStorage
      // A autenticação é feita via cookies do Better Auth
      if (typeof window !== "undefined") {
        // Não salvar token no localStorage - Better Auth usa cookies
        // Atualizar estado de token para refletir a sessão ativa (baseado em cookies)
        setHasToken(true);
      }
      
      // Invalidar cache de lojas para buscar dados atualizados após login
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] });
      
      // Buscar dados completos do usuário (incluindo role e storeId) do endpoint /me
      // Isso garante que temos todos os dados necessários antes de redirecionar
      try {
        const fullUserData = await authService.me();
        // Converter para o formato User esperado
        const userData: User = {
          ...fullUserData,
          role: fullUserData.role as UserRole,
        };
        // Atualizar query com dados completos - isso vai fazer isAuthenticated ser true
        queryClient.setQueryData(AUTH_KEY, userData);
        
        // Aguardar um pouco para garantir que o estado seja atualizado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirecionar para o dashboard após ter os dados completos
        router.push("/dashboard");
        showSuccess("Login realizado com sucesso!");
      } catch (error) {
        // Se falhar ao buscar dados completos, ainda assim redirecionar
        // O layout protegido vai tentar buscar novamente
        console.error("Erro ao buscar dados completos do usuário:", error);
        // Mesmo assim, atualizar hasToken para que a query seja habilitada
        setHasToken(true);
        router.push("/dashboard");
        showSuccess("Login realizado com sucesso!");
      }
    },
    onError: (error: any) => {
      const message =
        typeof error?.message === "string"
          ? error.message
          : error?.response?.data?.message ?? 
            error?.response?.data?.error ?? 
            "Não foi possível entrar.";
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

  const handleGoogleLogin = () => {
    // Remover ?from=google do callbackURL
    // O Better Auth vai redirecionar para /dashboard após autenticação
    const callbackURL = `${window.location.origin}/dashboard`;
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

