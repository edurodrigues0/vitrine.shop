import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

interface FindStoreByCnpjCpfUseCaseRequest {
	cnpjcpf: string;
}

interface FindStoreByCnpjCpfUseCaseResponse {
	store: Store;
}

export class FindStoreByCnpjCpfUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		cnpjcpf,
	}: FindStoreByCnpjCpfUseCaseRequest): Promise<FindStoreByCnpjCpfUseCaseResponse> {
		const store = await this.storesRepository.findByCnpjcpf({
			cnpjcpf,
		});

		if (!store) {
			throw new StoreNotFoundError();
		}

		return { store };
	}
}
