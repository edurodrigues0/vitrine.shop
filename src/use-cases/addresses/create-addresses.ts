import type { Address } from "~/database/schema";
import type { AddressesRepository } from "~/repositories/addresses-repository";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";
import type { StoresRepository } from "~/repositories/stores-repository";

interface CreateAddressesUseCaseRequest {
	street: string;
	number: string;
	complement: string;
	neighborhood: string;
	cityId: string;
	zipCode: string;
	country: string;
	branchId?: string;
	storeId?: string;
	isMain?: boolean;
}

interface CreateAddressesUseCaseResponse {
	address: Address;
}

export class CreateAddressesUseCase {
	constructor(
		private readonly addressesRepository: AddressesRepository,
		private readonly storesRepository: StoresRepository,
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({
		cityId,
		complement,
		country,
		neighborhood,
		number,
		street,
		zipCode,
		branchId,
		storeId,
		isMain = false,
	}: CreateAddressesUseCaseRequest): Promise<CreateAddressesUseCaseResponse> {
		let finalStoreId = storeId;
		const finalBranchId = branchId;

		// Se branchId foi fornecido, validar e obter o storeId automaticamente
		if (branchId) {
			const branch = await this.storeBranchesRepository.findById({
				id: branchId,
			});

			if (!branch) {
				throw new Error("Branch not found");
			}

			// Se storeId foi fornecido, validar que a filial pertence à loja
			if (storeId && branch.parentStoreId !== storeId) {
				throw new Error("Branch does not belong to the specified store");
			}

			// Auto-preencher storeId se não foi fornecido
			finalStoreId = branch.parentStoreId;
		}

		// Se storeId foi fornecido (ou auto-preenchido), validar que a loja existe
		if (finalStoreId) {
			const store = await this.storesRepository.findById({ id: finalStoreId });

			if (!store) {
				throw new Error("Store not found");
			}
		}

		const address = await this.addressesRepository.create({
			street,
			number,
			complement,
			neighborhood,
			cityId,
			zipCode,
			country,
			branchId: finalBranchId,
			storeId: finalStoreId,
			isMain,
		});

		return { address };
	}
}
