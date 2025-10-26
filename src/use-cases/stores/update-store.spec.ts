import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { UpdateStoreUseCase } from "./update-store";

describe("UpdateStoreUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let sut: UpdateStoreUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		sut = new UpdateStoreUseCase(storesRepository);
	});

	it("should be able to update store name", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const createdStore = await storesRepository.create({
			name: "Store Original",
			description: "Description",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "store-original",
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

		const { store } = await sut.execute({
			id: createdStore.id,
			data: { name: "Store Updated" },
		});

		expect(store?.name).toBe("Store Updated");
	});

	it("should be able to update store description", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const createdStore = await storesRepository.create({
			name: "Store",
			description: "Old Description",
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

		const { store } = await sut.execute({
			id: createdStore.id,
			data: { description: "New Description" },
		});

		expect(store?.description).toBe("New Description");
	});

	it("should be able to update store whatsapp", async () => {
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

		const { store } = await sut.execute({
			id: createdStore.id,
			data: { whatsapp: "31988888888" },
		});

		expect(store?.whatsapp).toBe("31988888888");
	});

	it("should throw error when store is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: { name: "Test" },
			}),
		).rejects.toThrow("Store not found");
	});

	it("should not update fields that are not provided", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const createdStore = await storesRepository.create({
			name: "Store Original",
			description: "Description Original",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "store-original",
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

		const { store } = await sut.execute({
			id: createdStore.id,
			data: { name: "Store Updated" },
		});

		expect(store?.name).toBe("Store Updated");
		expect(store?.description).toBe("Description Original");
		expect(store?.whatsapp).toBe("31999999999");
	});

	it("should update multiple fields at once", async () => {
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

		const { store } = await sut.execute({
			id: createdStore.id,
			data: {
				name: "New Name",
				description: "New Description",
				whatsapp: "31988888888",
			},
		});

		expect(store?.name).toBe("New Name");
		expect(store?.description).toBe("New Description");
		expect(store?.whatsapp).toBe("31988888888");
	});

	it("should update only the specified store", async () => {
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

		const store2 = await storesRepository.create({
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

		await sut.execute({
			id: store1.id,
			data: { name: "Store 1 Updated" },
		});

		const unchangedStore = await storesRepository.findById({ id: store2.id });

		expect(unchangedStore?.name).toBe("Store 2");
	});

	it("should preserve store id after update", async () => {
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

		const originalId = createdStore.id;

		const { store } = await sut.execute({
			id: originalId,
			data: { name: "Updated Store" },
		});

		expect(store?.id).toBe(originalId);
	});
});
