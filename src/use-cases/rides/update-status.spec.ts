import { beforeEach, describe, expect, it } from "vitest";
import type { Location, RideStatus } from "~/database/schema";
import { InMemoryRidesRepository } from "~/repositories/in-memory/in-memory-rides-repository";
import { UpdateStatusUseCase } from "./update-status";

describe("UpdateStatusUseCase", () => {
	let ridesRepository: InMemoryRidesRepository;
	let sut: UpdateStatusUseCase;

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
		sut = new UpdateStatusUseCase(ridesRepository);
	});

	it("should be able to update ride status from PENDING to ACCEPTED", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		expect(ride.status).toBe("PENDING");

		const { status } = await sut.execute({
			id: ride.id,
			status: "ACCEPTED",
		});

		expect(status).toBe("ACCEPTED");

		const updatedRide = await ridesRepository.findById({ id: ride.id });
		expect(updatedRide?.status).toBe("ACCEPTED");
	});

	it("should be able to update ride status from ACCEPTED to IN_PROGRESS", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await sut.execute({
			id: ride.id,
			status: "ACCEPTED",
		});

		const { status } = await sut.execute({
			id: ride.id,
			status: "IN_PROGRESS",
		});

		expect(status).toBe("IN_PROGRESS");

		const updatedRide = await ridesRepository.findById({ id: ride.id });
		expect(updatedRide?.status).toBe("IN_PROGRESS");
	});

	it("should be able to update ride status from IN_PROGRESS to COMPLETED", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.updateStatus(ride.id, "IN_PROGRESS");

		const { status } = await sut.execute({
			id: ride.id,
			status: "COMPLETED",
		});

		expect(status).toBe("COMPLETED");

		const completedRide = await ridesRepository.findById({ id: ride.id });
		expect(completedRide?.status).toBe("COMPLETED");
	});

	it("should be able to update ride status to CANCELLED", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const { status } = await sut.execute({
			id: ride.id,
			status: "CANCELLED",
		});

		expect(status).toBe("CANCELLED");

		const cancelledRide = await ridesRepository.findById({ id: ride.id });
		expect(cancelledRide?.status).toBe("CANCELLED");
	});

	it("should be able to update ride status to REJECTED", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const { status } = await sut.execute({
			id: ride.id,
			status: "REJECTED",
		});

		expect(status).toBe("REJECTED");

		const rejectedRide = await ridesRepository.findById({ id: ride.id });
		expect(rejectedRide?.status).toBe("REJECTED");
	});

	it("should throw error when ride is not found", async () => {
		const nonExistentId = "non-existent-id";

		await expect(
			sut.execute({
				id: nonExistentId,
				status: "ACCEPTED",
			}),
		).rejects.toThrow("Ride not found");
	});

	it("should update only the specified ride when multiple rides exist", async () => {
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

		const ride3 = await ridesRepository.create({
			driverId: "driver-id-3",
			passengerId: "passenger-id-3",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 8,
			amountCents: 3000,
		});

		await sut.execute({
			id: ride2.id,
			status: "ACCEPTED",
		});

		const updatedRide1 = await ridesRepository.findById({ id: ride1.id });
		const updatedRide2 = await ridesRepository.findById({ id: ride2.id });
		const updatedRide3 = await ridesRepository.findById({ id: ride3.id });

		expect(updatedRide1?.status).toBe("PENDING");
		expect(updatedRide2?.status).toBe("ACCEPTED");
		expect(updatedRide3?.status).toBe("PENDING");
	});

	it("should update updatedAt timestamp when status changes", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const originalUpdatedAt = ride.updatedAt;

		await new Promise((resolve) => setTimeout(resolve, 10));

		await sut.execute({
			id: ride.id,
			status: "ACCEPTED",
		});

		const updatedRide = await ridesRepository.findById({ id: ride.id });

		expect(updatedRide?.updatedAt.getTime()).toBeGreaterThan(
			originalUpdatedAt.getTime(),
		);
	});

	it("should handle all valid status transitions", async () => {
		const statuses: RideStatus[] = [
			"PENDING",
			"ACCEPTED",
			"IN_PROGRESS",
			"COMPLETED",
			"CANCELLED",
			"REJECTED",
		];

		for (const targetStatus of statuses) {
			const ride = await ridesRepository.create({
				driverId: "driver-id-1",
				passengerId: "passenger-id-1",
				startLocation: mockStartLocation,
				endLocation: mockEndLocation,
				distance: 5,
				amountCents: 2000,
			});

			const { status } = await sut.execute({
				id: ride.id,
				status: targetStatus,
			});

			expect(status).toBe(targetStatus);

			const updatedRide = await ridesRepository.findById({ id: ride.id });
			expect(updatedRide?.status).toBe(targetStatus);
		}
	});

	it("should return the correct status value in response", async () => {
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const response = await sut.execute({
			id: ride.id,
			status: "ACCEPTED",
		});

		expect(response).toHaveProperty("status");
		expect(response.status).toBe("ACCEPTED");
		expect(typeof response.status).toBe("string");
	});
});
