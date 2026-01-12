export class StockNotFoundError extends Error {
	constructor() {
		super("Stock not found");
	}
}

