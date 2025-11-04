import dayjs from "dayjs";

import type { Store } from "~/database/schema";
import type {
	CreateStoreParams,
	FindAllStoresParams,
	StoresRepository,
	UpdateStoreParams,
} from "../stores-repository";
import type { InMemoryCitiesRepository } from "./in-memory-cities-repository";

export class InMemoryStoresRepository implements StoresRepository {
	constructor(private readonly citiesRepository: InMemoryCitiesRepository) {}
	public items: Store[] = [];

	async create({
		name,
		description,
		cnpjcpf,
		logoUrl,
		whatsapp,
		slug,
		instagramUrl,
		facebookUrl,
		bannerUrl,
		theme,
		cityId,
		ownerId,
	}: CreateStoreParams): Promise<Store> {
		const id = crypto.randomUUID();
		const createdAt = new Date();
		const updatedAt = new Date();

		const store: Store = {
			id,
			name,
			description: description ?? null,
			cnpjcpf,
			slug,
			instagramUrl: instagramUrl ?? null,
			facebookUrl: facebookUrl ?? null,
			logoUrl: logoUrl ?? null,
			whatsapp,
			bannerUrl: bannerUrl ?? null,
			theme: theme ?? {
				primaryColor: "#000000",
				secondaryColor: "#FFFFFF",
				tertiaryColor: "#808080",
			},
			cityId,
			ownerId,
			createdAt,
			updatedAt,
		};

		this.items.push(store);

		return store;
	}

	async findByCnpjcpf({ cnpjcpf }: { cnpjcpf: string }): Promise<Store | null> {
		return this.items.find((item) => item.cnpjcpf === cnpjcpf) ?? null;
	}

	async findByWhatsapp({
		whatsapp,
	}: {
		whatsapp: string;
	}): Promise<Store | null> {
		return this.items.find((item) => item.whatsapp === whatsapp) ?? null;
	}

	async findById({ id }: { id: string }): Promise<Store | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findBySlug({ slug }: { slug: string }): Promise<Store | null> {
		return this.items.find((item) => item.slug === slug) ?? null;
	}

	async findByOwnerId({ ownerId }: { ownerId: string }): Promise<Store | null> {
		return this.items.find((item) => item.ownerId === ownerId) ?? null;
	}

	async findAll({ page, limit, filters }: FindAllStoresParams): Promise<{
		stores: Store[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const {
			name,
			description,
			cityName,
			cnpjcpf,
			isPaid,
			ownerId,
			slug,
			createdAt,
			whatsapp,
		} = filters;

		let stores = this.items;

		if (name) {
			stores = stores.filter((item) =>
				item.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		if (description) {
			stores = stores.filter((item) =>
				item.description
					?.toLocaleLowerCase()
					.includes(description.toLocaleLowerCase()),
			);
		}

		if (cityName) {
			const city = await this.citiesRepository.findByNameAndState({
				name: cityName,
				state: "",
			});

			stores = stores.filter((item) => item.cityId === city?.id);
		}

		if (cnpjcpf) {
			stores = stores.filter((item) => item.cnpjcpf === cnpjcpf);
		}

		if (isPaid !== undefined) {
			stores = stores.filter((item) => item.isPaid === isPaid);
		}

		if (ownerId) {
			stores = stores.filter((item) => item.ownerId === ownerId);
		}

		if (slug) {
			stores = stores.filter((item) => item.slug === slug);
		}

		if (whatsapp) {
			stores = stores.filter((item) => item.whatsapp === whatsapp);
		}

		if (createdAt) {
			stores = stores.filter((item) =>
				dayjs(item.createdAt).isSame(createdAt, "day"),
			);
		}

		const totalItems = stores.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedStores = stores.slice((page - 1) * limit, page * limit);

		return {
			stores: paginatedStores,
			pagination: {
				perPage: limit,
				currentPage: page,
				totalItems: totalItems,
				totalPages: totalPages,
			},
		};
	}

	async update({ id, data }: UpdateStoreParams): Promise<Store | null> {
		const storeIndex = this.items.findIndex((item) => item.id === id);

		if (storeIndex < 0) {
			return null;
		}

		const currentStore = this.items[storeIndex];

		if (!currentStore) {
			return null;
		}

		const updatedStore: Store = {
			...currentStore,
			name: data.name ?? currentStore.name,
			description: data.description ?? currentStore.description,
			cnpjcpf: data.cnpjcpf ?? currentStore.cnpjcpf,
			logoUrl: data.logoUrl ?? currentStore.logoUrl,
			whatsapp: data.whatsapp ?? currentStore.whatsapp,
			slug: data.slug ?? currentStore.slug,
			instagramUrl: data.instagramUrl ?? currentStore.instagramUrl,
			facebookUrl: data.facebookUrl ?? currentStore.facebookUrl,
			bannerUrl: data.bannerUrl ?? currentStore.bannerUrl,
		};

		this.items[storeIndex] = updatedStore;

		return updatedStore;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const storeIndex = this.items.findIndex((item) => item.id === id);

		if (storeIndex >= 0) {
			this.items.splice(storeIndex, 1);
		}
	}
}
