import type { Pagination } from "~/@types/pagination";
import type { Address } from "~/database/schema";
import type {
	AddressesRepository,
	CreateAddressParams,
	FindAllAddressesParams,
	UpdateAddressParams,
} from "../addresses-repository";
import type { InMemoryCitiesRepository } from "./in-memory-cities-repository";

export class InMemoryAddressesRepository implements AddressesRepository {
	constructor(private readonly citiesRepository: InMemoryCitiesRepository) {}

	public items: Address[] = [];

	async create({
		street,
		country,
		zipCode,
		isMain,
		storeId,
		neighborhood,
		number,
		complement,
		cityId,
	}: CreateAddressParams): Promise<Address> {
		const id = crypto.randomUUID();

		const address: Address = {
			id,
			street,
			neighborhood,
			number,
			complement,
			zipCode,
			country,
			cityId,
			storeId: storeId ?? null,
			isMain: isMain ?? false,
		};

		this.items.push(address);
		return address;
	}

	async findById({ id }: { id: string }): Promise<Address | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findAll({ page, limit, filters }: FindAllAddressesParams): Promise<{
		addresses: Address[];
		pagination: Pagination;
	}> {
		const {
			street,
			number,
			complement,
			neighborhood,
			zipCode,
			country,
			cityName,
		} = filters;
		let addresses = this.items;

		if (street) {
			addresses = addresses.filter((item) =>
				item.street.toLocaleLowerCase().includes(street.toLocaleLowerCase()),
			);
		}

		if (number) {
			addresses = addresses.filter((item) =>
				item.number.toLocaleLowerCase().includes(number.toLocaleLowerCase()),
			);
		}

		if (complement) {
			addresses = addresses.filter((item) =>
				item.complement
					?.toLocaleLowerCase()
					.includes(complement.toLocaleLowerCase()),
			);
		}

		if (neighborhood) {
			addresses = addresses.filter((item) =>
				item.neighborhood
					.toLocaleLowerCase()
					.includes(neighborhood.toLocaleLowerCase()),
			);
		}

		if (zipCode) {
			addresses = addresses.filter((item) =>
				item.zipCode.toLocaleLowerCase().includes(zipCode.toLocaleLowerCase()),
			);
		}

		if (country) {
			addresses = addresses.filter((item) =>
				item.country.toLocaleLowerCase().includes(country.toLocaleLowerCase()),
			);
		}

		if (cityName) {
			const city = await this.citiesRepository.findByNameAndState({
				name: cityName,
				state: "",
			});

			addresses = addresses.filter((item) => item.cityId === city?.id);
		}

		const totalItems = addresses.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedAddresses = addresses.slice(
			(page - 1) * limit,
			page * limit,
		);

		return {
			addresses: paginatedAddresses,
			pagination: {
				totalItems,
				totalPages,
				perPage: limit,
				currentPage: page,
			},
		};
	}

	async update({ id, data }: UpdateAddressParams): Promise<Address | null> {
		const addressIndex = this.items.findIndex((item) => item.id === id);

		if (addressIndex < 0) {
			return null;
		}

		const currentAddress = this.items[addressIndex];

		if (!currentAddress) {
			return null;
		}

		// Helper para verificar se uma propriedade foi explicitamente passada
		const hasProperty = (key: keyof typeof data) => key in data;

		const updatedAddress: Address = {
			...currentAddress,
			street: data.street ?? currentAddress.street,
			number: data.number ?? currentAddress.number,
			complement: hasProperty("complement")
				? data.complement ?? null
				: currentAddress.complement,
			neighborhood: data.neighborhood ?? currentAddress.neighborhood,
			cityId: data.cityId ?? currentAddress.cityId,
			zipCode: data.zipCode ?? currentAddress.zipCode,
			country: data.country ?? currentAddress.country,
			storeId: hasProperty("storeId")
				? data.storeId ?? null
				: currentAddress.storeId,
			isMain: data.isMain !== undefined ? data.isMain : currentAddress.isMain,
		};

		this.items[addressIndex] = updatedAddress;
		return updatedAddress;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const addressIndex = this.items.findIndex((item) => item.id === id);
		if (addressIndex >= 0) {
			this.items.splice(addressIndex, 1);
		}
	}
}
