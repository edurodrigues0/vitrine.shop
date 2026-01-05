"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { subscriptionsService } from "@/services/subscriptions-service";
import { getPlanLimits, type PlanLimits } from "@/services/plan-limits-service";
import { useSelectedStore } from "./use-selected-store";
import { productsService } from "@/services/products-service";
import { storesService } from "@/services/stores-service";
import { usersService } from "@/services/users-service";

export type ResourceType = "products" | "stores" | "users";

interface UsePlanQuotaReturn {
	canCreate: boolean;
	current: number;
	limit: number | null;
	isLoading: boolean;
	planId?: string;
}

/**
 * Hook para verificar quotas de recursos antes de ações de criação.
 * Retorna informações sobre o uso atual e limite permitido.
 * 
 * @param resourceType - Tipo de recurso a verificar ("products", "stores", "users")
 * @returns Objeto com informações sobre quota: canCreate, current, limit, isLoading, planId
 * 
 * @example
 * ```typescript
 * const { canCreate, current, limit, isLoading } = usePlanQuota("products");
 * 
 * if (isLoading) {
 *   return <div>Carregando...</div>;
 * }
 * 
 * return (
 *   <Button disabled={!canCreate}>
 *     Criar Produto ({current}/{limit})
 *   </Button>
 * );
 * ```
 */
export function usePlanQuota(resourceType: ResourceType): UsePlanQuotaReturn {
	const { user } = useAuth();
	const { selectedStore } = useSelectedStore();

	// Buscar assinatura
	const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
		queryKey: ["subscription", user?.id],
		queryFn: () => subscriptionsService.findByUserId(user!.id),
		enabled: !!user?.id,
	});

	const subscription = subscriptionData?.subscription;
	const planId = subscription?.planId;

	// Obter limites do plano
	const limits: PlanLimits | null = planId ? getPlanLimits(planId) : null;

	// Determinar qual limite usar baseado no tipo de recurso
	const limit = limits
		? resourceType === "products"
			? limits.maxProducts
			: resourceType === "stores"
				? limits.maxStores
				: limits.maxUsers
		: null;

	// Contar recursos existentes (apenas se necessário)
	const needsCounting = limit !== null; // Só contar se houver limite

	const countQueryKey = resourceType === "products"
		? ["products", "count", selectedStore?.id]
		: resourceType === "stores"
			? ["stores", "count", user?.id]
			: ["users", "count", selectedStore?.id];

	const countQueryFn = resourceType === "products"
		? async () => {
				if (!selectedStore?.id) return 0;
				const products = await productsService.findByStoreId(selectedStore.id);
				return products.length;
			}
		: resourceType === "stores"
			? async () => {
					if (!user?.id) return 0;
					const stores = await storesService.findAll({
						ownerId: user.id,
						page: 1,
						limit: 100,
					});
					return stores.stores.length;
				}
			: async () => {
					if (!selectedStore?.id) return 0;
					const users = await usersService.findByStoreId({ storeId: selectedStore.id });
					return users.users.length;
				};

	const { data: currentCount, isLoading: isLoadingCount } = useQuery({
		queryKey: countQueryKey,
		queryFn: countQueryFn,
		enabled: needsCounting && !!user && (resourceType !== "products" || !!selectedStore) && (resourceType !== "users" || !!selectedStore),
	});

	const current = currentCount ?? 0;
	const isLoading = isLoadingSubscription || (needsCounting && isLoadingCount);

	// Se não houver limite (null = ilimitado), sempre pode criar
	// Se houver limite, verificar se ainda não atingiu
	const canCreate = limit === null || current < limit;

	return {
		canCreate,
		current,
		limit,
		isLoading,
		planId,
	};
}
