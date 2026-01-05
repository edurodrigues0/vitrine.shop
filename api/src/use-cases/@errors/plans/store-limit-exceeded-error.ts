/**
 * Erro lançado quando o limite de lojas do plano foi excedido.
 */
export class StoreLimitExceededError extends Error {
	public readonly limit: number;
	public readonly current: number;
	public readonly planId?: string;

	constructor(
		limit: number,
		current?: number,
		planId?: string,
	) {
		const message = current !== undefined
			? `Store limit exceeded. Maximum ${limit} store(s) allowed. Current: ${current}.`
			: `Store limit exceeded. Maximum ${limit} store(s) allowed.`;

		super(message);
		this.name = "StoreLimitExceededError";
		this.limit = limit;
		this.current = current ?? limit;
		this.planId = planId;
	}
}
