export class StoreNotFoundError extends Error {
	constructor() {
		super("Store not found");
	}
}
