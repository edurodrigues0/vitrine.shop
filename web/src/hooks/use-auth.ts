"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { authService } from "@/services/auth-service";
import type { LoginRequest } from "@/dtos/user";
import { showError, showSuccess } from "@/lib/toast";

const AUTH_KEY = ["auth", "me"];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Verificar token antes de habilitar a query (memoizado para evitar recálculos)
  const hasToken = useMemo(() => {
    return typeof window !== "undefined" && !!localStorage.getItem("authToken");
  }, []);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      try {
        return await authService.me();
      } catch (error: any) {
        // Se receber 401, limpar token inválido silenciosamente
        if (error?.status === 401 || error?.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            // Invalidar a query para evitar novas tentativas
            queryClient.setQueryData(AUTH_KEY, null);
          }
          // Retornar null em vez de lançar erro para evitar logs no console
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
    enabled: hasToken,
    // Evitar refetch automático quando não há token
    refetchOnMount: hasToken,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Não mostrar erro no console para 401 (token inválido é esperado)
    onError: (error: any) => {
      if (error?.status === 401 || error?.response?.status === 401) {
        // Erro 401 é esperado quando o token é inválido, não precisa logar
        return;
      }
    },
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

