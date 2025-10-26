import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAddressesRepository } from "~/repositories/in-memory/in-memory-addresses-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { CreateAddressesUseCase } from "./create-addresses";

describe("CreateAddressesUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let addressesRepository: InMemoryAddressesRepository;
	let storesRepository: InMemoryStoresRepository;
	let storeBranchesRepository: InMemoryStoreBranchesRepository;
	let sut: CreateAddressesUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		addressesRepository = new InMemoryAddressesRepository(citiesRepository);
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		storeBranchesRepository = new InMemoryStoreBranchesRepository();
		sut = new CreateAddressesUseCase(
			addressesRepository,
			storesRepository,
			storeBranchesRepository,
		);
	});

	it("should be able to create a new address", async () => {
		const cityId = crypto.randomUUID();

		const { address } = await sut.execute({
			street: "Rua das Flores",
			number: "123",
			complement: "Apto 101",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		expect(address).toBeTruthy();
		expect(address.id).toBeTruthy();
		expect(address.street).toBe("Rua das Flores");
		expect(address.number).toBe("123");
		expect(address.cityId).toBe(cityId);
	});

	it("should create address with storeId", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store = await storesRepository.create({
			name: "Loja Teste",
			description: "Descrição",
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

		const { address } = await sut.execute({
			street: "Avenida Central",
			number: "456",
			complement: "Loja 1",
			neighborhood: "Centro",
			cityId,
			zipCode: "01000000",
			country: "Brasil",
			storeId: store.id,
		});

		expect(address.storeId).toBe(store.id);
		expect(address.branchId).toBeNull();
	});

	it("should create address with branchId and auto-fill storeId", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store = await storesRepository.create({
			name: "Loja Matriz",
			description: "Descrição",
			cnpjcpf: "12345678901234",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "loja-matriz",
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

		const { branch } = await storeBranchesRepository.create({
			parentStoreId: store.id,
			name: "Filial Centro",
			cityId,
			whatsapp: "31988888888",
		});

		const { address } = await sut.execute({
			street: "Rua Principal",
			number: "789",
			complement: "",
			neighborhood: "Bairro Novo",
			cityId,
			zipCode: "20000000",
			country: "Brasil",
			branchId: branch.id,
		});

		expect(address.branchId).toBe(branch.id);
		expect(address.storeId).toBe(store.id); // Auto-preenchido!
	});

	it("should create address with isMain as true", async () => {
		const cityId = crypto.randomUUID();

		const { address } = await sut.execute({
			street: "Rua Principal",
			number: "100",
			complement: "Casa",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			isMain: true,
		});

		expect(address.isMain).toBe(true);
	});

	it("should create address with isMain as false by default", async () => {
		const cityId = crypto.randomUUID();

		const { address } = await sut.execute({
			street: "Rua Secundária",
			number: "200",
			complement: "",
			neighborhood: "Bairro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		expect(address.isMain).toBe(false);
	});

	it("should save address in repository", async () => {
		const cityId = crypto.randomUUID();

		await sut.execute({
			street: "Rua Teste",
			number: "999",
			complement: "",
			neighborhood: "Teste",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		expect(addressesRepository.items).toHaveLength(1);
	});

	it("should create address with all provided data", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store = await storesRepository.create({
			name: "Loja Completa",
			description: "Descrição",
			cnpjcpf: "12345678901234",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "loja-completa",
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

		const { address } = await sut.execute({
			street: "Avenida Paulista",
			number: "1000",
			complement: "Conjunto 500",
			neighborhood: "Bela Vista",
			cityId,
			zipCode: "01310000",
			country: "Brasil",
			storeId: store.id,
			isMain: true,
		});

		expect(address.street).toBe("Avenida Paulista");
		expect(address.number).toBe("1000");
		expect(address.complement).toBe("Conjunto 500");
		expect(address.neighborhood).toBe("Bela Vista");
		expect(address.zipCode).toBe("01310000");
		expect(address.country).toBe("Brasil");
		expect(address.storeId).toBe(store.id);
		expect(address.isMain).toBe(true);
	});

	it("should create multiple addresses", async () => {
		const cityId = crypto.randomUUID();

		await sut.execute({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Bairro 1",
			cityId,
			zipCode: "30000001",
			country: "Brasil",
		});

		await sut.execute({
			street: "Rua 2",
			number: "2",
			complement: "",
			neighborhood: "Bairro 2",
			cityId,
			zipCode: "30000002",
			country: "Brasil",
		});

		expect(addressesRepository.items).toHaveLength(2);
	});

	it("should throw error when store does not exist", async () => {
		const cityId = crypto.randomUUID();
		const nonExistentStoreId = crypto.randomUUID();

		await expect(
			sut.execute({
				street: "Rua Teste",
				number: "123",
				complement: "",
				neighborhood: "Centro",
				cityId,
				zipCode: "30000000",
				country: "Brasil",
				storeId: nonExistentStoreId,
			}),
		).rejects.toThrow("Store not found");
	});

	it("should throw error when branch does not exist", async () => {
		const cityId = crypto.randomUUID();
		const nonExistentBranchId = crypto.randomUUID();

		await expect(
			sut.execute({
				street: "Rua Teste",
				number: "123",
				complement: "",
				neighborhood: "Centro",
				cityId,
				zipCode: "30000000",
				country: "Brasil",
				branchId: nonExistentBranchId,
			}),
		).rejects.toThrow("Branch not found");
	});

	it("should throw error when branch does not belong to specified store", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		// Criar loja 1
		const store1 = await storesRepository.create({
			name: "Loja 1",
			description: "Descrição",
			cnpjcpf: "11111111111111",
			logoUrl: "https://example.com/logo1.png",
			whatsapp: "31999999991",
			slug: "loja-1",
			instagramUrl: "https://instagram.com/loja1",
			facebookUrl: "https://facebook.com/loja1",
			bannerUrl: "https://example.com/banner1.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		// Criar loja 2
		const store2 = await storesRepository.create({
			name: "Loja 2",
			description: "Descrição",
			cnpjcpf: "22222222222222",
			logoUrl: "https://example.com/logo2.png",
			whatsapp: "31999999992",
			slug: "loja-2",
			instagramUrl: "https://instagram.com/loja2",
			facebookUrl: "https://facebook.com/loja2",
			bannerUrl: "https://example.com/banner2.png",
			theme: {
				primaryColor: "#FF0000",
				secondaryColor: "#00FF00",
				tertiaryColor: "#0000FF",
			},
			cityId,
			ownerId,
		});

		// Criar filial da loja 1
		const { branch } = await storeBranchesRepository.create({
			parentStoreId: store1.id,
			name: "Filial Loja 1",
			cityId,
		});

		// Tentar criar endereço com filial da loja 1 mas storeId da loja 2
		await expect(
			sut.execute({
				street: "Rua Teste",
				number: "123",
				complement: "",
				neighborhood: "Centro",
				cityId,
				zipCode: "30000000",
				country: "Brasil",
				storeId: store2.id, // Loja 2
				branchId: branch.id, // Filial da Loja 1
			}),
		).rejects.toThrow("Branch does not belong to the specified store");
	});

	it("should create address with both branchId and matching storeId", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		const store = await storesRepository.create({
			name: "Loja Matriz",
			description: "Descrição",
			cnpjcpf: "12345678901234",
			logoUrl: "https://example.com/logo.png",
			whatsapp: "31999999999",
			slug: "loja-matriz",
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

		const { branch } = await storeBranchesRepository.create({
			parentStoreId: store.id,
			name: "Filial Centro",
			cityId,
			whatsapp: "31988888888",
		});

		const { address } = await sut.execute({
			street: "Rua Teste",
			number: "123",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			storeId: store.id, // Explicitamente fornecido
			branchId: branch.id, // Também fornecido
		});

		expect(address.storeId).toBe(store.id);
		expect(address.branchId).toBe(branch.id);
	});
});
