import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications-service";
import { useAuth } from "./use-auth";
import type { Notification } from "@/dtos/notification";

export function useNotifications() {
	const { isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const eventSourceRef = useRef<EventSource | null>(null);
	const [isConnected, setIsConnected] = useState(false);

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

		eventSource.onopen = () => {
			console.log("SSE connection opened");
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
					console.error("SSE error message:", data.message);
					setIsConnected(false);
					eventSource.close();
					return;
				}

				// Invalidar queries para atualizar notificações
				queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
				queryClient.invalidateQueries({ queryKey: ["notifications"] });
			} catch (error) {
				console.error("Error parsing SSE notification:", error, event.data);
			}
		});

		eventSource.onerror = (error) => {
			console.error("SSE connection error:", {
				readyState: eventSource.readyState,
				url: sseUrl.replace(/token=[^&]+/, "token=***"),
				error,
			});
			setIsConnected(false);
			
			// EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
			if (eventSource.readyState === EventSource.CLOSED) {
				console.log("SSE connection closed, will not reconnect automatically");
				eventSource.close();
			}
		};

		eventSourceRef.current = eventSource;

		return () => {
			console.log("Cleaning up SSE connection");
			if (eventSource.readyState !== EventSource.CLOSED) {
				eventSource.close();
			}
			setIsConnected(false);
		};
	}, [isAuthenticated, queryClient]);

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

