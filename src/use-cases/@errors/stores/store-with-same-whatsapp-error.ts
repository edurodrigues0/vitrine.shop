export class StoreWithSameWhatsappError extends Error {
	constructor() {
		super("Store with same WhatsApp already exists");
	}
}
