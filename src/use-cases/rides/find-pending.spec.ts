import { beforeEach, describe, expect, it } from "vitest";
import type { Location } from "~/database/schema";
import { InMemoryRidesRepository } from "~/repositories/in-memory/in-memory-rides-repository";
import { FindPendingUseCase } from "./find-pending";

describe("FindPendingUseCase", () => {
	let ridesRepository: InMemoryRidesRepository;
	let sut: FindPendingUseCase;

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
		sut = new FindPendingUseCase(ridesRepository);
	});

	it("should return empty array when there are no rides", async () => {
		const { rides } = await sut.execute();

		expect(rides).toEqual([]);
		expect(rides).toHaveLength(0);
	});

	it("should return all pending rides", async () => {
		// Cria 3 corridas pendentes
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		await ridesRepository.create({
			driverId: "driver-id-3",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(3);
		expect(rides.every((ride) => ride.status === "PENDING")).toBe(true);
	});

	it("should not return ACCEPTED rides", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		// Aceita a primeira corrida
		await ridesRepository.updateStatus(ride1.id, "ACCEPTED");

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(1);
		expect(rides[0]?.status).toBe("PENDING");
		expect(rides[0]?.driverId).toBe("driver-id-2");
	});

	it("should not return IN_PROGRESS rides", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		// Coloca a primeira em progresso
		await ridesRepository.updateStatus(ride1.id, "IN_PROGRESS");

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(1);
		expect(rides[0]?.status).toBe("PENDING");
	});

	it("should not return COMPLETED rides", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		// Completa a primeira corrida
		await ridesRepository.updateStatus(ride1.id, "COMPLETED");

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(1);
		expect(rides[0]?.status).toBe("PENDING");
	});

	it("should not return CANCELLED rides", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		// Cancela a primeira corrida
		await ridesRepository.updateStatus(ride1.id, "CANCELLED");

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(1);
		expect(rides[0]?.status).toBe("PENDING");
	});

	it("should not return REJECTED rides", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		// Rejeita a primeira corrida
		await ridesRepository.updateStatus(ride1.id, "REJECTED");

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(1);
		expect(rides[0]?.status).toBe("PENDING");
	});

	it("should return only PENDING status rides when mixed statuses exist", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const ride2 = await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		await ridesRepository.create({
			driverId: "driver-id-3",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		const ride4 = await ridesRepository.create({
			driverId: "driver-id-4",
			passengerId: "passenger-id-4",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 12,
			amountCents: 5000,
		});

		// Muda status de algumas corridas
		await ridesRepository.updateStatus(ride1.id, "ACCEPTED");
		await ridesRepository.updateStatus(ride2.id, "IN_PROGRESS");
		await ridesRepository.updateStatus(ride4.id, "COMPLETED");

		const { rides } = await sut.execute();

		// Apenas ride3 permanece PENDING
		expect(rides).toHaveLength(1);
		expect(rides[0]?.status).toBe("PENDING");
		expect(rides[0]?.driverId).toBe("driver-id-3");
	});

	it("should return rides with all correct properties", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5.5,
			amountCents: 2575,
			description: "Corrida para o aeroporto",
		});

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(1);
		expect(rides[0]).toMatchObject({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			status: "PENDING",
			distance: 5.5,
			amountCents: 2575,
			description: "Corrida para o aeroporto",
		});
		expect(rides[0]?.startLocation).toEqual(mockStartLocation);
		expect(rides[0]?.endLocation).toEqual(mockEndLocation);
		expect(rides[0]?.id).toEqual(expect.any(String));
		expect(rides[0]?.createdAt).toBeInstanceOf(Date);
		expect(rides[0]?.updatedAt).toBeInstanceOf(Date);
	});

	it("should return multiple pending rides from different drivers", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		await ridesRepository.create({
			driverId: "driver-id-3",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(3);

		const driverIds = rides.map((ride) => ride.driverId);
		expect(driverIds).toContain("driver-id-1");
		expect(driverIds).toContain("driver-id-2");
		expect(driverIds).toContain("driver-id-3");
	});

	it("should return multiple pending rides from different passengers", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		await ridesRepository.create({
			driverId: "driver-id-3",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(3);

		const passengerIds = rides.map((ride) => ride.passengerId);
		expect(passengerIds).toContain("passenger-id-1");
		expect(passengerIds).toContain("passenger-id-2");
		expect(passengerIds).toContain("passenger-id-3");
	});

	it("should handle large number of pending rides", async () => {
		// Cria 50 corridas pendentes
		for (let i = 1; i <= 50; i++) {
			await ridesRepository.create({
				driverId: `driver-id-${i}`,
				passengerId: `passenger-id-${i}`,
				startLocation: mockStartLocation,
				endLocation: mockEndLocation,
				distance: i * 1.5,
				amountCents: i * 10,
			});
		}

		const { rides } = await sut.execute();

		expect(rides).toHaveLength(50);
		expect(rides.every((ride) => ride.status === "PENDING")).toBe(true);
	});

	it("should return pending rides even after other rides are updated", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		// Primeira busca
		const result1 = await sut.execute();
		expect(result1.rides).toHaveLength(2);

		// Atualiza uma corrida
		await ridesRepository.updateStatus(ride1.id, "ACCEPTED");

		// Segunda busca
		const result2 = await sut.execute();
		expect(result2.rides).toHaveLength(1);
		expect(result2.rides[0]?.driverId).toBe("driver-id-2");
	});
});
