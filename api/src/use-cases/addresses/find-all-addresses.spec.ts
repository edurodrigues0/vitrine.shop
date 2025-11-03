import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAddressesRepository } from "~/repositories/in-memory/in-memory-addresses-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { FindAllAddressesUseCase } from "./find-all-addresses";

describe("FindAllAddressesUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let addressesRepository: InMemoryAddressesRepository;
	let sut: FindAllAddressesUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		addressesRepository = new InMemoryAddressesRepository(citiesRepository);
		sut = new FindAllAddressesUseCase(addressesRepository);
	});

	it("should be able to find all addresses", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Bairro 1",
			cityId,
			zipCode: "30000001",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Rua 2",
			number: "2",
			complement: "",
			neighborhood: "Bairro 2",
			cityId,
			zipCode: "30000002",
			country: "Brasil",
		});

		const { addresses, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(addresses).toHaveLength(2);
		expect(pagination.totalItems).toBe(2);
		expect(pagination.currentPage).toBe(1);
	});

	it("should filter addresses by street", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua das Flores",
			number: "123",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Avenida Central",
			number: "456",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000001",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				street: "Flores",
			},
		});

		expect(addresses).toHaveLength(1);
		expect(addresses[0]?.street).toBe("Rua das Flores");
	});

	it("should filter addresses by number", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua Principal",
			number: "100",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Rua Principal",
			number: "200",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000001",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				number: "100",
			},
		});

		expect(addresses).toHaveLength(1);
		expect(addresses[0]?.number).toBe("100");
	});

	it("should filter addresses by neighborhood", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Rua 2",
			number: "2",
			complement: "",
			neighborhood: "Savassi",
			cityId,
			zipCode: "30000001",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				neighborhood: "Savassi",
			},
		});

		expect(addresses).toHaveLength(1);
		expect(addresses[0]?.neighborhood).toBe("Savassi");
	});

	it("should filter addresses by zipCode", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Rua 2",
			number: "2",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30111222",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				zipCode: "30111222",
			},
		});

		expect(addresses).toHaveLength(1);
		expect(addresses[0]?.zipCode).toBe("30111222");
	});

	it("should filter addresses by country", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Street 1",
			number: "1",
			complement: "",
			neighborhood: "Downtown",
			cityId,
			zipCode: "90000",
			country: "USA",
		});

		await addressesRepository.create({
			street: "Rua 2",
			number: "2",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				country: "Brasil",
			},
		});

		expect(addresses).toHaveLength(1);
		expect(addresses[0]?.country).toBe("Brasil");
	});

	it("should apply multiple filters at once", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua das Flores",
			number: "123",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Rua das Flores",
			number: "456",
			complement: "",
			neighborhood: "Savassi",
			cityId,
			zipCode: "30000001",
			country: "Brasil",
		});

		await addressesRepository.create({
			street: "Avenida Central",
			number: "789",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "01000000",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				street: "Flores",
				country: "Brasil",
			},
		});

		expect(addresses).toHaveLength(2);
		expect(addresses.every((a) => a.street.includes("Flores"))).toBe(true);
		expect(addresses.every((a) => a.country === "Brasil")).toBe(true);
	});

	it("should paginate results correctly", async () => {
		const cityId = crypto.randomUUID();

		for (let i = 1; i <= 15; i++) {
			await addressesRepository.create({
				street: `Rua ${i}`,
				number: `${i}`,
				complement: "",
				neighborhood: "Bairro",
				cityId,
				zipCode: "30000000",
				country: "Brasil",
			});
		}

		const { addresses: page1, pagination: pagination1 } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		const { addresses: page2, pagination: pagination2 } = await sut.execute({
			page: 2,
			limit: 10,
			filters: {},
		});

		expect(page1).toHaveLength(10);
		expect(page2).toHaveLength(5);
		expect(pagination1.totalPages).toBe(2);
		expect(pagination2.currentPage).toBe(2);
	});

	it("should return empty array when no addresses exist", async () => {
		const { addresses, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(addresses).toHaveLength(0);
		expect(pagination.totalItems).toBe(0);
	});

	it("should return empty array when filters match no addresses", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				street: "Inexistente",
			},
		});

		expect(addresses).toHaveLength(0);
	});

	it("should handle case-insensitive filters", async () => {
		const cityId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua das Flores",
			number: "123",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				street: "flores",
			},
		});

		expect(addresses).toHaveLength(1);
		expect(addresses[0]?.street).toBe("Rua das Flores");
	});

	it("should return addresses with all correct properties", async () => {
		const cityId = crypto.randomUUID();
		const storeId = crypto.randomUUID();

		await addressesRepository.create({
			street: "Rua Teste",
			number: "999",
			complement: "Apto 1",
			neighborhood: "Teste",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			storeId,
			isMain: true,
		});

		const { addresses } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(addresses[0]).toHaveProperty("id");
		expect(addresses[0]).toHaveProperty("street");
		expect(addresses[0]).toHaveProperty("number");
		expect(addresses[0]).toHaveProperty("neighborhood");
		expect(addresses[0]).toHaveProperty("cityId");
		expect(addresses[0]).toHaveProperty("zipCode");
		expect(addresses[0]).toHaveProperty("country");
		expect(addresses[0]).toHaveProperty("storeId");
		expect(addresses[0]).toHaveProperty("branchId");
		expect(addresses[0]).toHaveProperty("isMain");
	});
});
