import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { FindStoreByIdUseCase } from "./find-store-by-id";

describe("FindStoreByIdUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let sut: FindStoreByIdUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		sut = new FindStoreByIdUseCase(storesRepository);
	});

	it("should be able to find a store by id", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const createdStore = await storesRepository.create({
			name: "Lojinha Doce Mel",
			description: "Lojinha",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "lojinha-doce-mel",
			instagramUrl: "https://instagram.com/lojinha",
			facebookUrl: "https://facebook.com/lojinha",
			bannerUrl: "https://example.com/banner.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		const { store } = await sut.execute({ id: createdStore.id });

		expect(store).toBeTruthy();
		expect(store.id).toBe(createdStore.id);
		expect(store.name).toBe("Lojinha Doce Mel");
	});

	it("should throw error when store is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toThrow(
			"Store not found",
		);
	});

	it("should return store with all properties", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const createdStore = await storesRepository.create({
			name: "Store",
			description: "Description",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "store",
			instagramUrl: "https://instagram.com/store",
			facebookUrl: "https://facebook.com/store",
			bannerUrl: "https://example.com/banner.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		const { store } = await sut.execute({ id: createdStore.id });

		expect(store).toHaveProperty("id");
		expect(store).toHaveProperty("name");
		expect(store).toHaveProperty("description");
		expect(store).toHaveProperty("cnpjcpf");
		expect(store).toHaveProperty("slug");
		expect(store).toHaveProperty("whatsapp");
		expect(store).toHaveProperty("createdAt");
		expect(store).toHaveProperty("updatedAt");
	});

	it("should find the correct store when multiple stores exist", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store1 = await storesRepository.create({
			name: "Store 1",
			description: "Description 1",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo1.png",
			whatsapp: "31999999999",
			slug: "store-1",
			instagramUrl: "https://instagram.com/store1",
			facebookUrl: "https://facebook.com/store1",
			bannerUrl: "https://example.com/banner1.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		await storesRepository.create({
			name: "Store 2",
			description: "Description 2",
			cnpjcpf: "22222222222222",
			logoUrl: "https://example.com/logo2.png",
			whatsapp: "31988888888",
			slug: "store-2",
			instagramUrl: "https://instagram.com/store2",
			facebookUrl: "https://facebook.com/store2",
			bannerUrl: "https://example.com/banner2.png",
			theme: {
				primaryColor: "#00FF00",
				secondaryColor: "#0000FF",
				tertiaryColor: "#FF0000",
			},
			cityId,
			ownerId,
		});

		const { store } = await sut.execute({ id: store1.id });

		expect(store.id).toBe(store1.id);
		expect(store.name).toBe("Store 1");
	});
});
