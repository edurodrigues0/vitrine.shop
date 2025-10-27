import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAddressesRepository } from "~/repositories/in-memory/in-memory-addresses-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { AddressNotFoundError } from "../@errors/addresses/address-not-found-error";
import { FindAddressesByIdUseCase } from "./find-addresse-by-id";

describe("FindAddressesByIdUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let addressesRepository: InMemoryAddressesRepository;
	let sut: FindAddressesByIdUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		addressesRepository = new InMemoryAddressesRepository(citiesRepository);
		sut = new FindAddressesByIdUseCase(addressesRepository);
	});

	it("should be able to find an address by id", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua das Flores",
			number: "123",
			complement: "Apto 101",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({ id: createdAddress.id });

		expect(address).toBeTruthy();
		expect(address.id).toBe(createdAddress.id);
		expect(address.street).toBe("Rua das Flores");
	});

	it("should throw error when address is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			AddressNotFoundError,
		);
	});

	it("should return address with all properties", async () => {
		const cityId = crypto.randomUUID();
		const storeId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Avenida Central",
			number: "456",
			complement: "Loja 1",
			neighborhood: "Centro",
			cityId,
			zipCode: "01000000",
			country: "Brasil",
			storeId,
			isMain: true,
		});

		const { address } = await sut.execute({ id: createdAddress.id });

		expect(address).toHaveProperty("id");
		expect(address).toHaveProperty("street");
		expect(address).toHaveProperty("number");
		expect(address).toHaveProperty("complement");
		expect(address).toHaveProperty("neighborhood");
		expect(address).toHaveProperty("cityId");
		expect(address).toHaveProperty("zipCode");
		expect(address).toHaveProperty("country");
		expect(address).toHaveProperty("storeId");
		expect(address).toHaveProperty("branchId");
		expect(address).toHaveProperty("isMain");
	});

	it("should find the correct address when multiple addresses exist", async () => {
		const cityId = crypto.randomUUID();

		const address1 = await addressesRepository.create({
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

		const { address } = await sut.execute({ id: address1.id });

		expect(address.id).toBe(address1.id);
		expect(address.street).toBe("Rua 1");
	});
});
