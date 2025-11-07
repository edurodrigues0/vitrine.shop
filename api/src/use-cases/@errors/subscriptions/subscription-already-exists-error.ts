export class SubscriptionAlreadyExistsError extends Error {
	constructor() {
		super("Subscription already exists for this store");
	}
}

