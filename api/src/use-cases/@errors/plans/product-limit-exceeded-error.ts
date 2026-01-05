/**
 * Erro lançado quando o limite de produtos do plano foi excedido.
 */
export class ProductLimitExceededError extends Error {
	public readonly limit: number;
	public readonly current: number;
	public readonly planId?: string;

	constructor(
		limit: number,
		current?: number,
		planId?: string,
	) {
		const message = current !== undefined
			? `Product limit exceeded. Maximum ${limit} products allowed. Current: ${current}.`
			: `Product limit exceeded. Maximum ${limit} products allowed.`;

		super(message);
		this.name = "ProductLimitExceededError";
		this.limit = limit;
		this.current = current ?? limit;
		this.planId = planId;
	}
}
