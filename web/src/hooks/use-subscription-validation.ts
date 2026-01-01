"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { subscriptionsService } from "@/services/subscriptions-service";

export function useSubscriptionValidation() {
	const { user } = useAuth();

	const { data: subscriptionData, isLoading } = useQuery({
		queryKey: ["subscription", user?.id, "validation"],
		queryFn: () => subscriptionsService.findByUserId(user!.id),
		enabled: !!user?.id,
		refetchInterval: 60000, // Verificar a cada minuto
		refetchOnWindowFocus: true, // Refetch quando a janela recebe foco
		staleTime: 30000, // Considerar dados válidos por 30 segundos
	});

	const subscription = subscriptionData?.subscription;

	// Validar se a assinatura está ativa
	const isValid = (() => {
		if (!subscription) return false;
		if (subscription.status !== "PAID") return false;
		if (subscription.status === "CANCELLED") return false;

		const now = new Date();
		const periodEnd = new Date(subscription.currentPeriodEnd);
		return now <= periodEnd;
	})();

	// Verificar se expirou
	const isExpired = subscription
		? new Date() > new Date(subscription.currentPeriodEnd)
		: false;

	// Calcular dias até expiração
	const daysUntilExpiration = subscription
		? Math.ceil(
				(new Date(subscription.currentPeriodEnd).getTime() -
					new Date().getTime()) /
					(1000 * 60 * 60 * 24),
			)
		: null;

	return {
		isValid,
		isExpired,
		isLoading,
		subscription,
		daysUntilExpiration,
		status: subscription?.status,
	};
}

