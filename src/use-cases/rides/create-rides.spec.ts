import { beforeEach, describe, expect, it } from "vitest";
import type { Location } from "~/database/schema";
import { InMemoryRidesRepository } from "~/repositories/in-memory/in-memory-rides-repository";
import { CreateRidesUseCase } from "./create-rides";

describe("CreateRidesUseCase", () => {
	let ridesRepository: InMemoryRidesRepository;
	let sut: CreateRidesUseCase;

	const mockStartLocation: Location = {
		latitude: -23.5505,
		longitude: -46.6333,
		address: "São Paulo, SP",
	};

	const mockEndLocation: Location = {
		latitude: -23.5629,
		longitude: -46.6544,
		address: "Avenida Paulista, São Paulo",
	};

	beforeEach(() => {
		ridesRepository = new InMemoryRidesRepository();
		sut = new CreateRidesUseCase(ridesRepository);
	});

	it("should be able to create a new ride", async () => {
		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: new Date("2025-01-15T10:00:00"),
			endDate: null,
			distance: 5.2,
			amountCents: 2550,
		});

		expect(ride.id).toEqual(expect.any(String));
		expect(ride.driverId).toBe("driver-id-1");
		expect(ride.passengerId).toBe("passenger-id-1");
		expect(ride.status).toBe("PENDING");
		expect(ride.distance).toBe(5.2);
		expect(ride.amountCents).toBe(2550);
	});

	it("should create ride with correct locations", async () => {
		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 10,
			amountCents: 4000,
		});

		expect(ride.startLocation).toEqual(mockStartLocation);
		expect(ride.endLocation).toEqual(mockEndLocation);
		expect(ride.startLocation?.latitude).toBe(-23.5505);
		expect(ride.startLocation?.longitude).toBe(-46.6333);
		expect(ride.endLocation?.address).toBe("Avenida Paulista, São Paulo");
	});

	it("should create ride with default PENDING status", async () => {
		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 8,
			amountCents: 3000,
		});

		expect(ride.status).toBe("PENDING");
		expect(ride.createdAt).toBeInstanceOf(Date);
		expect(ride.updatedAt).toBeInstanceOf(Date);
	});

	it("should create ride with null dates", async () => {
		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
		});

		expect(ride.startDate).toBeNull();
		expect(ride.endDate).toBeNull();
	});

	it("should create ride with startDate but null endDate", async () => {
		const startDate = new Date("2025-01-15T14:30:00");

		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate,
			endDate: null,
			distance: 7.5,
			amountCents: 2800,
		});

		expect(ride.startDate).toEqual(startDate);
		expect(ride.endDate).toBeNull();
	});

	it("should save ride in repository", async () => {
		await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
		});

		expect(ridesRepository.items).toHaveLength(1);
		expect(ridesRepository.items[0]?.driverId).toBe("driver-id-1");
		expect(ridesRepository.items[0]?.passengerId).toBe("passenger-id-1");
	});

	it("should create multiple rides for different passengers", async () => {
		await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
		});

		await sut.execute({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 10,
			amountCents: 4000,
		});

		expect(ridesRepository.items).toHaveLength(2);
		expect(ridesRepository.items[0]?.passengerId).toBe("passenger-id-1");
		expect(ridesRepository.items[1]?.passengerId).toBe("passenger-id-2");
	});

	it("should create ride with different distance and amountCents values", async () => {
		const { ride: ride1 } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 2.5,
			amountCents: 1500,
		});

		const { ride: ride2 } = await sut.execute({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 50.0,
			amountCents: 15075,
		});

		expect(ride1.distance).toBe(2.5);
		expect(ride1.amountCents).toBe(1500);
		expect(ride2.distance).toBe(50.0);
		expect(ride2.amountCents).toBe(15075);
	});

	it("should create ride with optional description", async () => {
		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
			description: "Corrida para o aeroporto",
		});

		expect(ride.description).toBe("Corrida para o aeroporto");
	});

	it("should create ride with idempotency key", async () => {
		const idempotencyKey = "unique-key-123";

		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
			idempotencyKey,
		});

		expect(ride.idempotencyKey).toBeDefined();
	});

	it("should create ride with location without address", async () => {
		const simpleStartLocation: Location = {
			latitude: -23.5505,
			longitude: -46.6333,
		};

		const simpleEndLocation: Location = {
			latitude: -23.5629,
			longitude: -46.6544,
		};

		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: simpleStartLocation,
			endLocation: simpleEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
		});

		expect(ride.startLocation?.address).toBeUndefined();
		expect(ride.endLocation?.address).toBeUndefined();
		expect(ride.startLocation?.latitude).toBe(-23.5505);
		expect(ride.endLocation?.longitude).toBe(-46.6544);
	});

	it("should maintain ride creation timestamp", async () => {
		const beforeCreation = new Date();

		const { ride } = await sut.execute({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			startDate: null,
			endDate: null,
			distance: 5,
			amountCents: 2000,
		});

		const afterCreation = new Date();

		expect(ride.createdAt.getTime()).toBeGreaterThanOrEqual(
			beforeCreation.getTime(),
		);
		expect(ride.createdAt.getTime()).toBeLessThanOrEqual(
			afterCreation.getTime(),
		);
		expect(ride.updatedAt).toEqual(ride.createdAt);
	});
});
