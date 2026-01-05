/**
 * Erro lançado quando uma assinatura ativa é necessária para realizar a operação.
 */
export class SubscriptionRequiredError extends Error {
	constructor() {
		super("Active subscription required to perform this action");
		this.name = "SubscriptionRequiredError";
	}
}
