import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAddressesRepository } from "~/repositories/in-memory/in-memory-addresses-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { AddressNotFoundError } from "../@errors/addresses/address-not-found-error";
import { DeleteAddressUseCase } from "./delete-address";

describe("DeleteAddressUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let addressesRepository: InMemoryAddressesRepository;
	let sut: DeleteAddressUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		addressesRepository = new InMemoryAddressesRepository(citiesRepository);
		sut = new DeleteAddressUseCase(addressesRepository);
	});

	it("should be able to delete an address", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua das Flores",
			number: "123",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		await sut.execute({ id: createdAddress.id });

		const deletedAddress = await addressesRepository.findById({
			id: createdAddress.id,
		});

		expect(deletedAddress).toBeNull();
	});

	it("should throw error when address is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			AddressNotFoundError,
		);
	});

	it("should delete only the specified address", async () => {
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

		const address2 = await addressesRepository.create({
			street: "Rua 2",
			number: "2",
			complement: "",
			neighborhood: "Bairro 2",
			cityId,
			zipCode: "30000002",
			country: "Brasil",
		});

		await sut.execute({ id: address1.id });

		const deletedAddress = await addressesRepository.findById({
			id: address1.id,
		});
		const remainingAddress = await addressesRepository.findById({
			id: address2.id,
		});

		expect(deletedAddress).toBeNull();
		expect(remainingAddress).toBeTruthy();
		expect(remainingAddress?.street).toBe("Rua 2");
	});

	it("should remove address from repository items", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua Teste",
			number: "999",
			complement: "",
			neighborhood: "Teste",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		expect(addressesRepository.items).toHaveLength(1);

		await sut.execute({ id: createdAddress.id });

		expect(addressesRepository.items).toHaveLength(0);
	});
});
