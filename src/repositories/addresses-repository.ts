import type { Pagination } from "~/@types/pagination";
import type { Address } from "~/database/schema";

export interface CreateAddressParams {
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

export interface FindAllAddressesParams {
	page: number;
	limit: number;
	filters: {
		street?: string;
		number?: string;
		complement?: string;
		neighborhood?: string;
		cityName?: string;
		state?: string;
		zipCode?: string;
		country?: string;
	};
}

export interface UpdateAddressParams {
	id: string;
	data: {
		street?: string;
		number?: string;
		complement?: string;
		neighborhood?: string;
		cityId?: string;
		state?: string;
		zipCode?: string;
		country?: string;
		branchId?: string;
		storeId?: string;
		isMain?: boolean;
	};
}

export interface AddressesRepository {
	create({
		street,
		number,
		complement,
		neighborhood,
		cityId,
		zipCode,
		country,
		branchId,
		storeId,
		isMain,
	}: CreateAddressParams): Promise<Address>;

	findById({ id }: { id: string }): Promise<Address | null>;

	findAll({ page, limit, filters }: FindAllAddressesParams): Promise<{
		addresses: Address[];
		pagination: Pagination;
	}>;

	update({ id, data }: UpdateAddressParams): Promise<Address | null>;

	delete({ id }: { id: string }): Promise<void>;
}
