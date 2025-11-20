"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth-service";
import type { LoginRequest } from "@/dtos/user";
import { showError, showSuccess } from "@/lib/toast";

const AUTH_KEY = ["auth", "me"];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_KEY,
    queryFn: () => authService.me(),
    retry: false,
    staleTime: Infinity,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("authToken"),
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
      let message = "Não foi possível fazer login. Verifique suas credenciais e tente novamente.";
      
      if (error?.status === 401) {
        message = "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
      } else if (error?.status === 404) {
        message = "Serviço de autenticação indisponível. Tente novamente mais tarde.";
      } else if (error?.message) {
        // Se for uma mensagem de erro da API, usa ela, senão usa a mensagem padrão
        message = error.message;
      }
      
      // Adiciona a mensagem de erro ao objeto de erro para ser usada no componente
      error.userMessage = message;
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
    loginError: loginMutation.error,
    resetLoginError: loginMutation.reset,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

