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

