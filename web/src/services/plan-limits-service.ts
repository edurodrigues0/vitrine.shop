/**
 * Serviço para gerenciar limites de planos no frontend.
 * Fornece helpers para consultar limites e formatar valores.
 */

/**
 * Interface que define os limites de recursos para um plano.
 */
export interface PlanLimits {
	/** Número máximo de produtos permitidos. null = ilimitado */
	maxProducts: number | null;
	/** Número máximo de lojas permitidas. null = ilimitado */
	maxStores: number | null;
	/** Número máximo de usuários/colaboradores permitidos. null = ilimitado */
	maxUsers: number | null;
}

/**
 * Mapa de limites por tipo de plano.
 */
const PLAN_LIMITS: Record<string, PlanLimits> = {
	basic: {
		maxProducts: 50,
		maxStores: 1,
		maxUsers: 5,
	},
	professional: {
		maxProducts: null, // ilimitado
		maxStores: 1,
		maxUsers: 10,
	},
	enterprise: {
		maxProducts: null, // ilimitado
		maxStores: null, // ilimitado
		maxUsers: null, // ilimitado
	},
};

/**
 * Retorna os limites de recursos para um plano específico.
 * 
 * @param planId - Identificador do plano (ex: "basic-monthly", "professional-yearly")
 * @returns Objeto PlanLimits com os limites do plano. Se o plano não for encontrado, retorna os limites do plano básico.
 * 
 * @example
 * ```typescript
 * const limits = getPlanLimits("basic-monthly");
 * // { maxProducts: 50, maxStores: 1, maxUsers: 5 }
 * ```
 */
export function getPlanLimits(planId: string): PlanLimits {
	// Extrair o identificador base do plano (parte antes do primeiro hífen)
	const planKey = planId.split("-")[0]?.toLowerCase() ?? "basic";
	
	// Retornar limites do plano ou fallback para basic se não encontrado
	return PLAN_LIMITS[planKey] ?? PLAN_LIMITS.basic;
}

/**
 * Formata um limite para exibição.
 * 
 * @param limit - Limite a ser formatado (number | null)
 * @returns String formatada (ex: "50" ou "Ilimitado")
 * 
 * @example
 * ```typescript
 * formatLimit(50); // "50"
 * formatLimit(null); // "Ilimitado"
 * ```
 */
export function formatLimit(limit: number | null): string {
	if (limit === null) {
		return "Ilimitado";
	}
	return limit.toString();
}

/**
 * Verifica se o limite foi atingido.
 * 
 * @param current - Quantidade atual de recursos
 * @param limit - Limite máximo permitido (null = ilimitado)
 * @returns true se o limite foi atingido ou excedido, false caso contrário
 * 
 * @example
 * ```typescript
 * hasReachedLimit(50, 50); // true
 * hasReachedLimit(49, 50); // false
 * hasReachedLimit(100, null); // false (ilimitado)
 * ```
 */
export function hasReachedLimit(current: number, limit: number | null): boolean {
	if (limit === null) {
		return false; // ilimitado, nunca atinge limite
	}
	return current >= limit;
}
