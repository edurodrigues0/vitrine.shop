/**
 * Serviço responsável por gerenciar e consultar limites de recursos por plano de assinatura.
 * 
 * Define os limites máximos de produtos, lojas e usuários permitidos para cada tipo de plano:
 * - Basic: Planos básicos com limites restritos
 * - Professional: Planos profissionais com alguns limites expandidos
 * - Enterprise: Planos empresariais com recursos ilimitados
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
 * Serviço estático para consultar limites de planos de assinatura.
 * 
 * @example
 * ```typescript
 * const limits = PlanLimitsService.getLimits("basic-monthly");
 * if (limits.maxProducts === null) {
 *   // Produtos ilimitados
 * } else if (currentProducts >= limits.maxProducts) {
 *   // Limite atingido
 * }
 * ```
 */
export class PlanLimitsService {
	/**
	 * Mapa de limites por tipo de plano.
	 * A chave é o identificador base do plano (sem sufixo de período).
	 */
	private static readonly PLAN_LIMITS: Record<string, PlanLimits> = {
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
	 * O planId pode incluir sufixos como "-monthly" ou "-yearly".
	 * A função extrai o identificador base do plano (parte antes do primeiro hífen).
	 * 
	 * @param planId - Identificador do plano (ex: "basic-monthly", "professional-yearly", "enterprise-monthly")
	 * @returns Objeto PlanLimits com os limites do plano. Se o plano não for encontrado, retorna os limites do plano básico.
	 * 
	 * @example
	 * ```typescript
	 * const limits = PlanLimitsService.getLimits("basic-monthly");
	 * // { maxProducts: 50, maxStores: 1, maxUsers: 5 }
	 * 
	 * const limits = PlanLimitsService.getLimits("professional-yearly");
	 * // { maxProducts: null, maxStores: 1, maxUsers: 10 }
	 * ```
	 */
	static getLimits(planId: string): PlanLimits {
		// Extrair o identificador base do plano (parte antes do primeiro hífen)
		// Ex: "basic-monthly" -> "basic", "professional-yearly" -> "professional"
		const planKey = planId.split("-")[0]?.toLowerCase() ?? "basic";
		
		// Retornar limites do plano ou fallback para basic se não encontrado
		return this.PLAN_LIMITS[planKey] ?? this.PLAN_LIMITS.basic;
	}

	/**
	 * Verifica se o limite de recursos foi atingido.
	 * 
	 * @param current - Quantidade atual de recursos
	 * @param limit - Limite máximo permitido (null = ilimitado)
	 * @returns true se o limite foi atingido ou excedido, false caso contrário
	 * 
	 * @example
	 * ```typescript
	 * const hasReached = PlanLimitsService.hasReachedLimit(50, 50);
	 * // true (limite atingido)
	 * 
	 * const hasReached = PlanLimitsService.hasReachedLimit(49, 50);
	 * // false (ainda pode criar)
	 * 
	 * const hasReached = PlanLimitsService.hasReachedLimit(100, null);
	 * // false (ilimitado, nunca atinge limite)
	 * ```
	 */
	static hasReachedLimit(current: number, limit: number | null): boolean {
		// Se o limite é null, significa ilimitado, então nunca atinge o limite
		if (limit === null) {
			return false;
		}

		// Verifica se a quantidade atual é maior ou igual ao limite
		return current >= limit;
	}
}
