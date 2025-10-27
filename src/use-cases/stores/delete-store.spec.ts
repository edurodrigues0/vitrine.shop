import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { DeleteStoreUseCase } from "./delete-store";

describe("DeleteStoreUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let sut: DeleteStoreUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		sut = new DeleteStoreUseCase(storesRepository);
	});

	it("should be able to delete a store", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store = await storesRepository.create({
			name: "Store to Delete",
			description: "Description",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "store-to-delete",
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

		await sut.execute({ id: store.id });

		const deletedStore = await storesRepository.findById({ id: store.id });

		expect(deletedStore).toBeNull();
	});

	it("should throw error when store is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			StoreNotFoundError,
		);
	});

	it("should delete only the specified store", async () => {
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

		await sut.execute({ id: store1.id });

		const remainingStore = await storesRepository.findById({ id: store2.id });

		expect(remainingStore).toBeTruthy();
		expect(remainingStore?.name).toBe("Store 2");
	});

	it("should remove store from repository items", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store = await storesRepository.create({
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

		expect(storesRepository.items).toHaveLength(1);

		await sut.execute({ id: store.id });

		expect(storesRepository.items).toHaveLength(0);
	});
});
