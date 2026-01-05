/**
 * Erro lançado quando o limite de usuários/colaboradores do plano foi excedido.
 */
export class UserLimitExceededError extends Error {
	public readonly limit: number;
	public readonly current: number;
	public readonly planId?: string;

	constructor(
		limit: number,
		current?: number,
		planId?: string,
	) {
		const message = current !== undefined
			? `User limit exceeded. Maximum ${limit} user(s) allowed. Current: ${current}.`
			: `User limit exceeded. Maximum ${limit} user(s) allowed.`;

		super(message);
		this.name = "UserLimitExceededError";
		this.limit = limit;
		this.current = current ?? limit;
		this.planId = planId;
	}
}
