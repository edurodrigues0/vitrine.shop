import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { FindAallStoresUseCase } from "./find-all-stores";

describe("FindAllStoresUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let sut: FindAallStoresUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		sut = new FindAallStoresUseCase(storesRepository);
	});

	it("should be able to find all stores", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await storesRepository.create({
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

		const { stores, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(stores).toHaveLength(2);
		expect(pagination.totalItems).toBe(2);
		expect(pagination.totalPages).toBe(1);
	});

	it("should filter stores by name", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await storesRepository.create({
			name: "Padaria Doce Mel",
			description: "Padaria",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "padaria-doce-mel",
			instagramUrl: "https://instagram.com/padaria",
			facebookUrl: "https://facebook.com/padaria",
			bannerUrl: "https://example.com/banner.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		await storesRepository.create({
			name: "Mercadinho Bom Preço",
			description: "Mercado",
			cnpjcpf: "22222222222222",
			logoUrl: "https://example.com/logo2.png",
			whatsapp: "31988888888",
			slug: "mercadinho",
			instagramUrl: "https://instagram.com/mercado",
			facebookUrl: "https://facebook.com/mercado",
			bannerUrl: "https://example.com/banner2.png",
			theme: {
				primaryColor: "#00FF00",
				secondaryColor: "#0000FF",
				tertiaryColor: "#FF0000",
			},
			cityId,
			ownerId,
		});

		const { stores } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "padaria" },
		});

		expect(stores).toHaveLength(1);
		expect(stores[0]?.name).toBe("Padaria Doce Mel");
	});

	it("should filter stores by ownerId", async () => {
		const cityId = crypto.randomUUID();
		const ownerId1 = crypto.randomUUID();
		const ownerId2 = crypto.randomUUID();

		await storesRepository.create({
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
			ownerId: ownerId1,
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
			ownerId: ownerId2,
		});

		const { stores } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { ownerId: ownerId1 },
		});

		expect(stores).toHaveLength(1);
		expect(stores[0]?.ownerId).toBe(ownerId1);
	});

	it("should paginate results correctly", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		for (let i = 1; i <= 5; i++) {
			await storesRepository.create({
				name: `Store ${i}`,
				description: `Description ${i}`,
				cnpjcpf: `${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
				logoUrl: `https://example.com/logo${i}.png`,
				whatsapp: `3199999999${i}`,
				slug: `store-${i}`,
				instagramUrl: `https://instagram.com/store${i}`,
				facebookUrl: `https://facebook.com/store${i}`,
				bannerUrl: `https://example.com/banner${i}.png`,
				theme: {
					primaryColor: "#FF0000",
					secondaryColor: "#00FF00",
					tertiaryColor: "#0000FF",
				},
				cityId,
				ownerId,
			});
		}

		const page1 = await sut.execute({
			page: 1,
			limit: 2,
			filters: {},
		});

		expect(page1.stores).toHaveLength(2);
		expect(page1.pagination.totalItems).toBe(5);
		expect(page1.pagination.totalPages).toBe(3);

		const page2 = await sut.execute({
			page: 2,
			limit: 2,
			filters: {},
		});

		expect(page2.stores).toHaveLength(2);
		expect(page2.pagination.currentPage).toBe(2);
	});

	it("should return empty array when no stores exist", async () => {
		const { stores, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(stores).toHaveLength(0);
		expect(pagination.totalItems).toBe(0);
		expect(pagination.totalPages).toBe(0);
	});

	it("should filter stores by slug", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await storesRepository.create({
			name: "Store 1",
			description: "Description 1",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo1.png",
			whatsapp: "31999999999",
			slug: "unique-slug",
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
			slug: "another-slug",
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

		const { stores } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { slug: "unique-slug" },
		});

		expect(stores).toHaveLength(1);
		expect(stores[0]?.slug).toBe("unique-slug");
	});

	it("should handle case-insensitive name filter", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await storesRepository.create({
			name: "PADARIA Doce Mel",
			description: "Padaria",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "padaria",
			instagramUrl: "https://instagram.com/padaria",
			facebookUrl: "https://facebook.com/padaria",
			bannerUrl: "https://example.com/banner.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		const { stores } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "padaria" },
		});

		expect(stores).toHaveLength(1);
	});
});
