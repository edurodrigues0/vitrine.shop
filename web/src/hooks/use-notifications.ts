import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications-service";
import { useAuth } from "./use-auth";
import type { Notification } from "@/dtos/notification";

export function useNotifications() {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);
	const queryClientRef = useRef(queryClient);
	const [isConnected, setIsConnected] = useState(false);

	// Manter referência atualizada do queryClient
	queryClientRef.current = queryClient;

	// Buscar notificações
	const { data, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: () => notificationsService.findAll({ limit: 50 }),
		enabled: isAuthenticated,
		refetchInterval: 30000, // Refetch a cada 30 segundos como fallback
	});

	const notifications = data?.notifications || [];
	const unreadCount = data?.unreadCount || 0;

	// Conectar ao SSE
	useEffect(() => {
		if (!isAuthenticated) {
			// Fechar conexão se não estiver autenticado
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
				setIsConnected(false);
			}
			return;
		}

		// Evitar criar múltiplas conexões
		if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
			return;
		}

		// Criar conexão SSE
		// SSE não suporta headers customizados, então vamos usar query param com token
		// como fallback quando cookies não funcionam
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
		
		// Tentar obter token do localStorage ou cookie
		const token = typeof window !== "undefined" 
			? localStorage.getItem("authToken") || document.cookie
				.split("; ")
				.find((row) => row.startsWith("auth_token="))
				?.split("=")[1]
			: null;

		if (!token) {
			console.warn("No auth token found for SSE connection");
			return;
		}

		const sseUrl = `${apiUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`;
		console.log("Connecting to SSE:", sseUrl.replace(/token=[^&]+/, "token=***"));

		const eventSource = new EventSource(sseUrl);
		eventSourceRef.current = eventSource;

		eventSource.onopen = () => {
			console.log("SSE connection opened successfully");
			setIsConnected(true);
		};

		// Listener para evento "connected"
		eventSource.addEventListener("connected", (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				console.log("SSE connected:", data.message);
				setIsConnected(true);
			} catch (error) {
				console.error("Error parsing SSE connected event:", error, event.data);
			}
		});

		eventSource.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				
				if (data.type === "connected") {
					console.log("SSE connected (via onmessage):", data.message);
					setIsConnected(true);
					return;
				}

				if (data.type === "error") {
					console.warn("SSE error message received:", data.message);
					setIsConnected(false);
					// Fechar conexão se receber erro do servidor
					if (eventSource.readyState !== EventSource.CLOSED) {
						eventSource.close();
					}
					return;
				}

				// Invalidar queries para atualizar notificações
				queryClientRef.current.invalidateQueries({ queryKey: ["notifications"] });
			} catch (error) {
				console.error("Error parsing SSE message:", error, event.data);
			}
		};

		// Listener para eventos customizados "notification"
		eventSource.addEventListener("notification", (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				console.log("SSE notification received:", data);
				
				// Invalidar queries para atualizar notificações
				queryClientRef.current.invalidateQueries({ queryKey: ["notifications"] });
			} catch (error) {
				console.error("Error parsing SSE notification:", error, event.data);
			}
		});

		eventSource.onerror = (error) => {
			const readyState = eventSource.readyState;
			
			// EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
			if (readyState === EventSource.CLOSED) {
				console.warn("SSE connection closed", {
					readyState,
					url: sseUrl.replace(/token=[^&]+/, "token=***"),
				});
				setIsConnected(false);
				eventSource.close();
				return;
			}
			
			// Se estiver em CONNECTING, pode ser erro de conexão inicial
			if (readyState === EventSource.CONNECTING) {
				console.warn("SSE connection error while connecting", {
					readyState,
					url: sseUrl.replace(/token=[^&]+/, "token=***"),
					message: "Possível erro de autenticação ou conexão",
				});
				setIsConnected(false);
				return;
			}
			
			// Se estiver OPEN mas teve erro, pode ser erro de rede
			if (readyState === EventSource.OPEN) {
				console.warn("SSE connection error while open", {
					readyState,
					url: sseUrl.replace(/token=[^&]+/, "token=***"),
					message: "Possível erro de rede ou servidor",
				});
				setIsConnected(false);
				return;
			}
		};

		return () => {
			console.log("Cleaning up SSE connection");
			if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
				eventSourceRef.current.close();
			}
			eventSourceRef.current = null;
			setIsConnected(false);
		};
	}, [isAuthenticated]); // queryClient é acessado via ref, então não precisa estar nas dependências

	// Mutations
	const markAsReadMutation = useMutation({
		mutationFn: (id: string) => notificationsService.markAsRead(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	const markAllAsReadMutation = useMutation({
		mutationFn: () => notificationsService.markAllAsRead(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => notificationsService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});

	return {
		notifications,
		unreadCount,
		isLoading,
		isConnected,
		markAsRead: markAsReadMutation.mutate,
		markAllAsRead: markAllAsReadMutation.mutate,
		deleteNotification: deleteMutation.mutate,
		isMarkingAsRead: markAsReadMutation.isPending,
		isMarkingAllAsRead: markAllAsReadMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}

