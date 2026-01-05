/**
 * Interface que define os limites de um plano de assinatura
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
 * Interface para respostas de erro quando limite é excedido
 */
export interface LimitExceededError {
	message: string;
	code: "PRODUCT_LIMIT_EXCEEDED" | "STORE_LIMIT_EXCEEDED" | "USER_LIMIT_EXCEEDED";
	current: number;
	limit: number;
	planId?: string;
}

/**
 * Interface para respostas de erro quando assinatura é necessária
 */
export interface SubscriptionRequiredError {
	message: string;
	code: "SUBSCRIPTION_REQUIRED";
}

