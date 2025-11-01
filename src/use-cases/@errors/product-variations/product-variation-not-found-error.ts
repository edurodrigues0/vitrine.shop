export class ProductVariationNotFoundError extends Error {
	constructor() {
		super("Product variation not found");
	}
}
