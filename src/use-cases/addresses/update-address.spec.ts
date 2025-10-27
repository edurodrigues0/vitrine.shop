import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAddressesRepository } from "~/repositories/in-memory/in-memory-addresses-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { AddressNotFoundError } from "../@errors/addresses/address-not-found-error";
import { UpdateAddressUseCase } from "./update-address";

describe("UpdateAddressUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let addressesRepository: InMemoryAddressesRepository;
	let sut: UpdateAddressUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		addressesRepository = new InMemoryAddressesRepository(citiesRepository);
		sut = new UpdateAddressUseCase(addressesRepository);
	});

	it("should be able to update address street", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua Antiga",
			number: "123",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				street: "Rua Nova",
			},
		});

		expect(address?.street).toBe("Rua Nova");
		expect(address?.number).toBe("123");
	});

	it("should be able to update address number", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua Principal",
			number: "100",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				number: "200",
			},
		});

		expect(address?.number).toBe("200");
		expect(address?.street).toBe("Rua Principal");
	});

	it("should be able to update address neighborhood", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				neighborhood: "Savassi",
			},
		});

		expect(address?.neighborhood).toBe("Savassi");
	});

	it("should be able to update address zipCode", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				zipCode: "30111222",
			},
		});

		expect(address?.zipCode).toBe("30111222");
	});

	it("should be able to update address isMain status", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			isMain: false,
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				isMain: true,
			},
		});

		expect(address?.isMain).toBe(true);
	});

	it("should be able to set isMain to false", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			isMain: true,
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				isMain: false,
			},
		});

		expect(address?.isMain).toBe(false);
	});

	it("should be able to set branchId to null", async () => {
		const cityId = crypto.randomUUID();
		const branchId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			branchId,
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				branchId: null,
			},
		});

		expect(address?.branchId).toBeNull();
	});

	it("should be able to set storeId to null", async () => {
		const cityId = crypto.randomUUID();
		const storeId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
			storeId,
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				storeId: null,
			},
		});

		expect(address?.storeId).toBeNull();
	});

	it("should be able to set complement to null", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua 1",
			number: "1",
			complement: "Apto 101",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				complement: null,
			},
		});

		expect(address?.complement).toBeNull();
	});

	it("should throw error when address is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: {
					street: "Rua Nova",
				},
			}),
		).rejects.toBeInstanceOf(AddressNotFoundError);
	});

	it("should not update fields that are not provided", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua Original",
			number: "100",
			complement: "Casa",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				street: "Rua Atualizada",
			},
		});

		expect(address?.street).toBe("Rua Atualizada");
		expect(address?.number).toBe("100");
		expect(address?.complement).toBe("Casa");
		expect(address?.neighborhood).toBe("Centro");
	});

	it("should update multiple fields at once", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua Antiga",
			number: "100",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				street: "Rua Nova",
				number: "200",
				neighborhood: "Savassi",
			},
		});

		expect(address?.street).toBe("Rua Nova");
		expect(address?.number).toBe("200");
		expect(address?.neighborhood).toBe("Savassi");
	});

	it("should update only the specified address", async () => {
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

		await sut.execute({
			id: address1.id,
			data: {
				street: "Rua Atualizada",
			},
		});

		const updatedAddress1 = await addressesRepository.findById({
			id: address1.id,
		});
		const unchangedAddress2 = await addressesRepository.findById({
			id: address2.id,
		});

		expect(updatedAddress1?.street).toBe("Rua Atualizada");
		expect(unchangedAddress2?.street).toBe("Rua 2");
	});

	it("should preserve address id after update", async () => {
		const cityId = crypto.randomUUID();

		const createdAddress = await addressesRepository.create({
			street: "Rua Original",
			number: "100",
			complement: "",
			neighborhood: "Centro",
			cityId,
			zipCode: "30000000",
			country: "Brasil",
		});

		const { address } = await sut.execute({
			id: createdAddress.id,
			data: {
				street: "Rua Nova",
			},
		});

		expect(address?.id).toBe(createdAddress.id);
	});
});
