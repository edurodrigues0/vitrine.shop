import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { StoreWithSameCnpjCpfError } from "../@errors/stores/store-with-same-cpnjcpf-error";
import { StoreWithSameSlugError } from "../@errors/stores/store-with-same-slug";
import { StoreWithSameWhatsappError } from "../@errors/stores/store-with-same-whatsapp-error";
import { CreateStoreUseCase } from "./create-store";

describe("CreateStoreUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let sut: CreateStoreUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		sut = new CreateStoreUseCase(storesRepository);
	});

	it("should be able to create a new store", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const { store } = await sut.execute({
			name: "Lojinha Doce Mel",
			description: "A melhor lojinha da cidade",
			cnpjcpf: "12345678901234",
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

		expect(store).toBeTruthy();
		expect(store.id).toBeTruthy();
		expect(store.name).toBe("Lojinha Doce Mel");
		expect(store.cnpjcpf).toBe("12345678901234");
	});

	it("should not create store with duplicate CNPJ/CPF", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await sut.execute({
			name: "Store 1",
			description: "Description 1",
			cnpjcpf: "12345678901234",
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

		await expect(
			sut.execute({
				name: "Store 2",
				description: "Description 2",
				cnpjcpf: "12345678901234", // Same CNPJ
				logoUrl: "https://example.com/logo2.png",
				whatsapp: "31988888888",
				slug: "store-2",
				instagramUrl: "https://instagram.com/store2",
				facebookUrl: "https://facebook.com/store2",
				bannerUrl: "https://example.com/banner2.png",
				theme: {
					primaryColor: "#FF0000",
					secondaryColor: "#00FF00",
					tertiaryColor: "#0000FF",
				},
				cityId,
				ownerId,
			}),
		).rejects.toBeInstanceOf(StoreWithSameCnpjCpfError);
	});

	it("should not create store with duplicate WhatsApp", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await sut.execute({
			name: "Store 1",
			description: "Description 1",
			cnpjcpf: "12345678901234",
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

		await expect(
			sut.execute({
				name: "Store 2",
				description: "Description 2",
				cnpjcpf: "98765432109876",
				logoUrl: "https://example.com/logo2.png",
				whatsapp: "31999999999", // Same WhatsApp
				slug: "store-2",
				instagramUrl: "https://instagram.com/store2",
				facebookUrl: "https://facebook.com/store2",
				bannerUrl: "https://example.com/banner2.png",
				theme: {
					primaryColor: "#FF0000",
					secondaryColor: "#00FF00",
					tertiaryColor: "#0000FF",
				},
				cityId,
				ownerId,
			}),
		).rejects.toBeInstanceOf(StoreWithSameWhatsappError);
	});

	it("should not create store with duplicate slug", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await sut.execute({
			name: "Store 1",
			description: "Description 1",
			cnpjcpf: "12345678901234",
			logoUrl: "https://example.com/logo1.png",
			whatsapp: "31999999999",
			slug: "lojinha-doce-mel",
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

		await expect(
			sut.execute({
				name: "Store 2",
				description: "Description 2",
				cnpjcpf: "98765432109876",
				logoUrl: "https://example.com/logo2.png",
				whatsapp: "31988888888",
				slug: "lojinha-doce-mel", // Same slug
				instagramUrl: "https://instagram.com/store2",
				facebookUrl: "https://facebook.com/store2",
				bannerUrl: "https://example.com/banner2.png",
				theme: {
					primaryColor: "#FF0000",
					secondaryColor: "#00FF00",
					tertiaryColor: "#0000FF",
				},
				cityId,
				ownerId,
			}),
		).rejects.toBeInstanceOf(StoreWithSameSlugError);
	});

	it("should save store in repository", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		await sut.execute({
			name: "Loja Teste",
			description: "Descrição teste",
			cnpjcpf: "12345678901234",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "loja-teste",
			instagramUrl: "https://instagram.com/loja",
			facebookUrl: "https://facebook.com/loja",
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
	});

	it("should create store with all provided data", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const { store } = await sut.execute({
			name: "Store Bom Preço",
			description: "Mercado de bairro",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/store.png",
			whatsapp: "31977777777",
			slug: "store-bom-preco",
			instagramUrl: "https://instagram.com/store",
			facebookUrl: "https://facebook.com/store",
			bannerUrl: "https://example.com/store-banner.png",
			theme: {
				primaryColor: "#00FF00",
				secondaryColor: "#FFFF00",
				tertiaryColor: "#FF00FF",
			},
			cityId,
			ownerId,
		});

		expect(store.name).toBe("Store Bom Preço");
		expect(store.description).toBe("Mercado de bairro");
		expect(store.slug).toBe("store-bom-preco");
		expect(store.instagramUrl).toBe("https://instagram.com/store");
		expect(store.facebookUrl).toBe("https://facebook.com/store");
		expect(store.theme.primaryColor).toBe("#00FF00");
	});

	it("should create store with timestamps", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const { store } = await sut.execute({
			name: "Loja",
			description: "Descrição",
			cnpjcpf: "12345678901234",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "loja",
			instagramUrl: "https://instagram.com/loja",
			facebookUrl: "https://facebook.com/loja",
			bannerUrl: "https://example.com/banner.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		expect(store.createdAt).toBeInstanceOf(Date);
		expect(store.updatedAt).toBeInstanceOf(Date);
	});
});
