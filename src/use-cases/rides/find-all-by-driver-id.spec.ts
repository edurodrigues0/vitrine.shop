import { beforeEach, describe, expect, it } from "vitest";
import type { Location } from "~/database/schema";
import { InMemoryRidesRepository } from "~/repositories/in-memory/in-memory-rides-repository";
import { FindAllByDriverIdUseCase } from "./find-all-by-driver-id";

describe("FindAllByDriverIdUseCase", () => {
	let ridesRepository: InMemoryRidesRepository;
	let sut: FindAllByDriverIdUseCase;

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
		sut = new FindAllByDriverIdUseCase(ridesRepository);
	});

	it("should be able to find all rides by driver id", async () => {
		const ride1 = await ridesRepository.create({
			passengerId: "passenger-id-1",
			driverId: "driver-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
		});

		const ride2 = await ridesRepository.create({
			passengerId: "passenger-id-2",
			driverId: "driver-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 40,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(2);
		expect(rides[0]?.id).toBe(ride1.id);
		expect(rides[1]?.id).toBe(ride2.id);
	});

	it("should return empty array when driver has no rides", async () => {
		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(0);
		expect(rides).toEqual([]);
	});

	it("should return only rides from specific driver", async () => {
		const driver1Ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
		});

		await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 40,
		});

		await ridesRepository.create({
			driverId: "driver-id-3",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 30,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(1);
		expect(rides[0]?.id).toBe(driver1Ride.id);
		expect(rides[0]?.driverId).toBe("driver-id-1");
	});

	it("should return rides with all statuses", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
		});

		const acceptedRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 30,
		});
		await ridesRepository.updateStatus(acceptedRide.id, "ACCEPTED");

		const completedRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 12,
			amountCents: 50,
		});
		await ridesRepository.updateStatus(completedRide.id, "COMPLETED");

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(3);
		expect(rides.some((ride) => ride.status === "PENDING")).toBe(true);
		expect(rides.some((ride) => ride.status === "ACCEPTED")).toBe(true);
		expect(rides.some((ride) => ride.status === "COMPLETED")).toBe(true);
	});

	it("should return rides in the order they were created", async () => {
		const ride1 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const ride2 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 30,
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const ride3 = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 12,
			amountCents: 50,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(3);
		expect(rides[0]?.id).toBe(ride1.id);
		expect(rides[1]?.id).toBe(ride2.id);
		expect(rides[2]?.id).toBe(ride3.id);
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

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(1);
		const ride = rides[0];

		expect(ride).toBeDefined();
		expect(ride?.id).toEqual(expect.any(String));
		expect(ride?.driverId).toBe("driver-id-1");
		expect(ride?.passengerId).toBe("passenger-id-1");
		expect(ride?.status).toBe("PENDING");
		expect(ride?.distance).toBe(5.5);
		expect(ride?.amountCents).toBe(2575);
		expect(ride?.description).toBe("Corrida para o aeroporto");
		expect(ride?.startLocation).toEqual(mockStartLocation);
		expect(ride?.endLocation).toEqual(mockEndLocation);
		expect(ride?.createdAt).toBeInstanceOf(Date);
		expect(ride?.updatedAt).toBeInstanceOf(Date);
	});

	it("should not return rides from other drivers", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-2",
		});

		expect(rides).toHaveLength(0);
	});

	it("should handle multiple rides with different passengers", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 12,
			amountCents: 5000,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(3);
		expect(rides[0]?.passengerId).toBe("passenger-id-1");
		expect(rides[1]?.passengerId).toBe("passenger-id-2");
		expect(rides[2]?.passengerId).toBe("passenger-id-3");
	});

	it("should include rides with all possible statuses", async () => {
		const statuses = [
			"PENDING",
			"ACCEPTED",
			"IN_PROGRESS",
			"COMPLETED",
			"CANCELLED",
			"REJECTED",
		] as const;

		for (const status of statuses) {
			const ride = await ridesRepository.create({
				driverId: "driver-id-1",
				passengerId: `passenger-${status}`,
				startLocation: mockStartLocation,
				endLocation: mockEndLocation,
				distance: 5,
				amountCents: 2000,
			});
			await ridesRepository.updateStatus(ride.id, status);
		}

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(6);
		expect(rides.map((r) => r.status)).toContain("PENDING");
		expect(rides.map((r) => r.status)).toContain("ACCEPTED");
		expect(rides.map((r) => r.status)).toContain("IN_PROGRESS");
		expect(rides.map((r) => r.status)).toContain("COMPLETED");
		expect(rides.map((r) => r.status)).toContain("CANCELLED");
		expect(rides.map((r) => r.status)).toContain("REJECTED");
	});

	it("should return rides with different distances and amountCents", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 2.5,
			amountCents: 1500,
		});

		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-2",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 50.0,
			amountCents: 15075,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(2);
		expect(rides[0]?.distance).toBe(2.5);
		expect(rides[0]?.amountCents).toBe(1500);
		expect(rides[1]?.distance).toBe(50.0);
		expect(rides[1]?.amountCents).toBe(15075);
	});

	it("should handle rides with null description", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(1);
		expect(rides[0]?.description).toBeNull();
	});

	it("should handle rides with null dates", async () => {
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
			startDate: null,
			endDate: null,
		});

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(1);
		expect(rides[0]?.startDate).toBeNull();
		expect(rides[0]?.endDate).toBeNull();
	});

	it("should handle large number of rides", async () => {
		const numberOfRides = 50;

		for (let i = 0; i < numberOfRides; i++) {
			await ridesRepository.create({
				driverId: "driver-id-1",
				passengerId: `passenger-id-${i}`,
				startLocation: mockStartLocation,
				endLocation: mockEndLocation,
				distance: 5 + i,
				amountCents: 20 + i * 2,
			});
		}

		const { rides } = await sut.execute({
			driverId: "driver-id-1",
		});

		expect(rides).toHaveLength(numberOfRides);
		expect(rides.every((ride) => ride.driverId === "driver-id-1")).toBe(true);
	});
});
