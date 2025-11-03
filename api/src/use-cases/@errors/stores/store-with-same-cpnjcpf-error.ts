export class StoreWithSameCnpjCpfError extends Error {
	constructor() {
		super("Store with same CNPJ/CPF already exists");
	}
}
