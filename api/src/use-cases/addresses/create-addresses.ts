import type { Address } from "~/database/schema";
import type { AddressesRepository } from "~/repositories/addresses-repository";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";
import type { StoresRepository } from "~/repositories/stores-repository";
import { BranchDoesNotBelongError } from "../@errors/store-branches/branch-does-not-belong-error";
import { BranchNotFoundError } from "../@errors/store-branches/branch-not-found-error";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

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

		if (branchId) {
			const branch = await this.storeBranchesRepository.findById({
				id: branchId,
			});

			if (!branch) {
				throw new BranchNotFoundError();
			}

			if (storeId && branch.parentStoreId !== storeId) {
				throw new BranchDoesNotBelongError();
			}

			finalStoreId = branch.parentStoreId;
		}

		if (finalStoreId) {
			const store = await this.storesRepository.findById({ id: finalStoreId });

			if (!store) {
				throw new StoreNotFoundError();
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
