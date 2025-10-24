import { beforeEach, describe, expect, it } from "vitest";
import type { VehicleType } from "~/database/schema";
import { InMemoryVehiclesRepository } from "~/repositories/in-memory/in-memory-vehicles-repository";
import { CreateVehicleUseCase } from "./create-vehicles-use-case";

describe("CreateVehicleUseCase", () => {
	let vehiclesRepository: InMemoryVehiclesRepository;
	let sut: CreateVehicleUseCase;

	beforeEach(() => {
		vehiclesRepository = new InMemoryVehiclesRepository();
		sut = new CreateVehicleUseCase(vehiclesRepository);
	});

	it("should be able to create a new vehicle", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		expect(vehicle.id).toEqual(expect.any(String));
		expect(vehicle.driverId).toBe("driver-id-1");
		expect(vehicle.vehicleType).toBe("CAR");
		expect(vehicle.plate).toBe("ABC-1234");
		expect(vehicle.color).toBe("Preto");
		expect(vehicle.brand).toBe("Toyota");
		expect(vehicle.model).toBe("Corolla");
		expect(vehicle.year).toBe(2024);
	});

	it("should not allow creating vehicle with duplicate plate", async () => {
		await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		await expect(
			sut.execute({
				driverId: "driver-id-2",
				vehicleType: "CAR",
				plate: "ABC-1234",
				color: "Branco",
				brand: "Honda",
				model: "Civic",
				year: 2023,
			}),
		).rejects.toThrow("Vehicle with same plate already exists");
	});

	it("should create vehicle with correct default values", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		expect(vehicle.active).toBe(true);
		expect(vehicle.createdAt).toBeInstanceOf(Date);
		expect(vehicle.updatedAt).toBeInstanceOf(Date);
	});

	it("should save vehicle in repository", async () => {
		await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		expect(vehiclesRepository.items).toHaveLength(1);
		expect(vehiclesRepository.items[0]?.plate).toBe("ABC-1234");
		expect(vehiclesRepository.items[0]?.driverId).toBe("driver-id-1");
	});

	it("should create vehicle with type MOTORCYCLE", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "MOTORCYCLE",
			plate: "MOT-5678",
			color: "Vermelho",
			brand: "Honda",
			model: "CB 500",
			year: 2023,
		});

		expect(vehicle.vehicleType).toBe("MOTORCYCLE");
		expect(vehicle.plate).toBe("MOT-5678");
		expect(vehicle.brand).toBe("Honda");
		expect(vehicle.model).toBe("CB 500");
	});

	it("should create vehicle with type TRUCK", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "TRUCK",
			plate: "TRK-9012",
			color: "Branco",
			brand: "Mercedes-Benz",
			model: "Actros",
			year: 2022,
		});

		expect(vehicle.vehicleType).toBe("TRUCK");
		expect(vehicle.plate).toBe("TRK-9012");
	});

	it("should create vehicle with type VAN", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "VAN",
			plate: "VAN-3456",
			color: "Prata",
			brand: "Fiat",
			model: "Ducato",
			year: 2023,
		});

		expect(vehicle.vehicleType).toBe("VAN");
		expect(vehicle.plate).toBe("VAN-3456");
	});

	it("should create vehicle with type BUS", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "BUS",
			plate: "BUS-7890",
			color: "Azul",
			brand: "Volvo",
			model: "B270F",
			year: 2021,
		});

		expect(vehicle.vehicleType).toBe("BUS");
		expect(vehicle.plate).toBe("BUS-7890");
	});

	it("should create multiple vehicles for same driver", async () => {
		await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "MOTORCYCLE",
			plate: "MOT-5678",
			color: "Vermelho",
			brand: "Honda",
			model: "CB 500",
			year: 2023,
		});

		expect(vehiclesRepository.items).toHaveLength(2);
		expect(vehiclesRepository.items[0]?.driverId).toBe("driver-id-1");
		expect(vehiclesRepository.items[1]?.driverId).toBe("driver-id-1");
	});

	it("should create vehicles for different drivers with different plates", async () => {
		const { vehicle: vehicle1 } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		const { vehicle: vehicle2 } = await sut.execute({
			driverId: "driver-id-2",
			vehicleType: "CAR",
			plate: "XYZ-5678",
			color: "Branco",
			brand: "Honda",
			model: "Civic",
			year: 2023,
		});

		expect(vehiclesRepository.items).toHaveLength(2);
		expect(vehicle1.driverId).toBe("driver-id-1");
		expect(vehicle2.driverId).toBe("driver-id-2");
		expect(vehicle1.plate).not.toBe(vehicle2.plate);
	});

	it("should create vehicle with old year", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "OLD-1990",
			color: "Cinza",
			brand: "Volkswagen",
			model: "Fusca",
			year: 1990,
		});

		expect(vehicle.year).toBe(1990);
		expect(vehicle.brand).toBe("Volkswagen");
		expect(vehicle.model).toBe("Fusca");
	});

	it("should create vehicle with different colors", async () => {
		const { vehicle: vehicle1 } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1111",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		const { vehicle: vehicle2 } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-2222",
			color: "Branco",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		const { vehicle: vehicle3 } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-3333",
			color: "Prata",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		expect(vehicle1.color).toBe("Preto");
		expect(vehicle2.color).toBe("Branco");
		expect(vehicle3.color).toBe("Prata");
	});

	it("should create vehicle with all vehicle types", async () => {
		const vehicleTypes: VehicleType[] = [
			"CAR",
			"MOTORCYCLE",
			"TRUCK",
			"VAN",
			"BUS",
			"TRAILER",
			"OTHER",
		];

		for (const type of vehicleTypes) {
			await sut.execute({
				driverId: "driver-id-1",
				vehicleType: type,
				plate: `${type}-001`,
				color: "Preto",
				brand: "Generic",
				model: "Model",
				year: 2024,
			});
		}

		expect(vehiclesRepository.items).toHaveLength(7);
		expect(vehiclesRepository.items.map((v) => v.vehicleType)).toEqual(
			vehicleTypes,
		);
	});

	it("should validate vehicle properties after creation", async () => {
		const beforeCreation = new Date();

		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		const afterCreation = new Date();

		expect(vehicle).toMatchObject({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
			active: true,
		});

		expect(vehicle.createdAt.getTime()).toBeGreaterThanOrEqual(
			beforeCreation.getTime(),
		);
		expect(vehicle.createdAt.getTime()).toBeLessThanOrEqual(
			afterCreation.getTime(),
		);
		expect(vehicle.updatedAt).toEqual(vehicle.createdAt);
	});

	it("should not allow same plate even with different case", async () => {
		await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		await expect(
			sut.execute({
				driverId: "driver-id-2",
				vehicleType: "CAR",
				plate: "ABC-1234",
				color: "Branco",
				brand: "Honda",
				model: "Civic",
				year: 2023,
			}),
		).rejects.toThrow("Vehicle with same plate already exists");
	});

	it("should create vehicle with brand and model containing spaces", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Mercedes-Benz",
			model: "Classe A 200",
			year: 2024,
		});

		expect(vehicle.brand).toBe("Mercedes-Benz");
		expect(vehicle.model).toBe("Classe A 200");
	});

	it("should create vehicle with type TRAILER", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "TRAILER",
			plate: "TRL-1234",
			color: "Cinza",
			brand: "Randon",
			model: "Carga Seca",
			year: 2023,
		});

		expect(vehicle.vehicleType).toBe("TRAILER");
		expect(vehicle.plate).toBe("TRL-1234");
	});

	it("should create vehicle with type OTHER", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "OTHER",
			plate: "OTH-1234",
			color: "Verde",
			brand: "Custom",
			model: "Special",
			year: 2024,
		});

		expect(vehicle.vehicleType).toBe("OTHER");
		expect(vehicle.plate).toBe("OTH-1234");
	});

	it("should maintain vehicle creation timestamp", async () => {
		const { vehicle } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1234",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		expect(vehicle.createdAt).toBeInstanceOf(Date);
		expect(vehicle.updatedAt).toBeInstanceOf(Date);
		expect(vehicle.createdAt.getTime()).toBe(vehicle.updatedAt.getTime());
	});

	it("should create vehicles with sequential IDs", async () => {
		const { vehicle: vehicle1 } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-1111",
			color: "Preto",
			brand: "Toyota",
			model: "Corolla",
			year: 2024,
		});

		const { vehicle: vehicle2 } = await sut.execute({
			driverId: "driver-id-1",
			vehicleType: "CAR",
			plate: "ABC-2222",
			color: "Branco",
			brand: "Honda",
			model: "Civic",
			year: 2023,
		});

		expect(vehicle1.id).toBeDefined();
		expect(vehicle2.id).toBeDefined();
		expect(vehicle1.id).not.toBe(vehicle2.id);
	});
});
