export class StoreWithSameSlugError extends Error {
	constructor() {
		super("Store with same slug already exists");
	}
}
