/**
 * Helper para tratar erros de quota de recursos.
 * Extrai informações do erro e retorna dados formatados para uso em modais/toasts.
 */

import type { LimitExceededError, SubscriptionRequiredError } from "@/types/plan-limits";
import { ApiError } from "./api-client";

/**
 * Verifica se um erro é um erro de limite excedido.
 */
export function isLimitExceededError(error: unknown): error is ApiError & { data: LimitExceededError } {
	if (!(error instanceof ApiError)) return false;
	if (error.status !== 403) return false;
	
	const data = error.data as any;
	return (
		data?.code === "PRODUCT_LIMIT_EXCEEDED" ||
		data?.code === "STORE_LIMIT_EXCEEDED" ||
		data?.code === "USER_LIMIT_EXCEEDED"
	);
}

/**
 * Verifica se um erro é um erro de assinatura necessária.
 */
export function isSubscriptionRequiredError(error: unknown): error is ApiError & { data: SubscriptionRequiredError } {
	if (!(error instanceof ApiError)) return false;
	if (error.status !== 403) return false;
	
	const data = error.data as any;
	return data?.code === "SUBSCRIPTION_REQUIRED";
}

/**
 * Extrai informações de erro de limite excedido.
 */
export function extractLimitExceededError(error: unknown): LimitExceededError | null {
	if (!isLimitExceededError(error)) return null;
	
	const data = error.data as any;
	return {
		message: data.message || "Limite de recursos atingido",
		code: data.code as "PRODUCT_LIMIT_EXCEEDED" | "STORE_LIMIT_EXCEEDED" | "USER_LIMIT_EXCEEDED",
		current: data.current ?? 0,
		limit: data.limit ?? 0,
		planId: data.planId,
	};
}

/**
 * Extrai informações de erro de assinatura necessária.
 */
export function extractSubscriptionRequiredError(error: unknown): SubscriptionRequiredError | null {
	if (!isSubscriptionRequiredError(error)) return null;
	
	const data = error.data as any;
	return {
		message: data.message || "Assinatura necessária",
		code: "SUBSCRIPTION_REQUIRED",
	};
}

/**
 * Determina o tipo de recurso baseado no código de erro.
 */
export function getResourceTypeFromErrorCode(code?: string): "produtos" | "lojas" | "usuários" | null {
	if (code === "PRODUCT_LIMIT_EXCEEDED") return "produtos";
	if (code === "STORE_LIMIT_EXCEEDED") return "lojas";
	if (code === "USER_LIMIT_EXCEEDED") return "usuários";
	return null;
}

