import { beforeEach, describe, expect, it } from "vitest";
import type { Location } from "~/database/schema";
import { InMemoryRidesRepository } from "~/repositories/in-memory/in-memory-rides-repository";
import { FindActiveByPassengerIdUseCase } from "./find-active-by-passenger-id";

describe("FindActiveByPassengerIdUseCase", () => {
	let ridesRepository: InMemoryRidesRepository;
	let sut: FindActiveByPassengerIdUseCase;

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
		sut = new FindActiveByPassengerIdUseCase(ridesRepository);
	});

	it("should be able to find active ride with PENDING status", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const { ride } = await sut.execute({
			passengerId: "passenger-id-1",
		});

		expect(ride).toBeDefined();
		expect(ride?.id).toBe(createdRide.id);
		expect(ride?.passengerId).toBe("passenger-id-1");
		expect(ride?.status).toBe("PENDING");
	});

	it("should be able to find active ride with ACCEPTED status", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.updateStatus(createdRide.id, "ACCEPTED");

		const { ride } = await sut.execute({
			passengerId: "passenger-id-1",
		});

		expect(ride).toBeDefined();
		expect(ride?.id).toBe(createdRide.id);
		expect(ride?.status).toBe("ACCEPTED");
	});

	it("should be able to find active ride with IN_PROGRESS status", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.updateStatus(createdRide.id, "IN_PROGRESS");

		const { ride } = await sut.execute({
			passengerId: "passenger-id-1",
		});

		expect(ride).toBeDefined();
		expect(ride?.id).toBe(createdRide.id);
		expect(ride?.status).toBe("IN_PROGRESS");
	});

	it("should throw error when passenger has no active ride", async () => {
		await expect(
			sut.execute({
				passengerId: "passenger-id-1",
			}),
		).rejects.toThrow("Active ride not found");
	});

	it("should throw error when passenger ride is COMPLETED", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.updateStatus(createdRide.id, "COMPLETED");

		await expect(
			sut.execute({
				passengerId: "passenger-id-1",
			}),
		).rejects.toThrow("Active ride not found");
	});

	it("should throw error when passenger ride is CANCELLED", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 20,
		});

		await ridesRepository.updateStatus(createdRide.id, "CANCELLED");

		await expect(
			sut.execute({
				passengerId: "passenger-id-1",
			}),
		).rejects.toThrow("Active ride not found");
	});

	it("should throw error when passenger ride is REJECTED", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		await ridesRepository.updateStatus(createdRide.id, "REJECTED");

		await expect(
			sut.execute({
				passengerId: "passenger-id-1",
			}),
		).rejects.toThrow("Active ride not found");
	});

	it("should return only active ride for specific passenger", async () => {
		// Cria corridas para diferentes passageiros
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		const passenger2Ride = await ridesRepository.create({
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

		// Busca corrida do passenger-id-2
		const { ride } = await sut.execute({
			passengerId: "passenger-id-2",
		});

		expect(ride).toBeDefined();
		expect(ride?.id).toBe(passenger2Ride.id);
		expect(ride?.passengerId).toBe("passenger-id-2");
	});

	it("should not return rides from other passengers", async () => {
		// Passageiro 1 tem corrida ativa
		await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		// Passageiro 2 não tem corrida
		// Busca deve falhar
		await expect(
			sut.execute({
				passengerId: "passenger-id-2",
			}),
		).rejects.toThrow("Active ride not found");
	});

	it("should return ride with all correct properties", async () => {
		const createdRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5.5,
			amountCents: 2575,
			description: "Corrida para o aeroporto",
		});

		const { ride } = await sut.execute({
			passengerId: "passenger-id-1",
		});

		expect(ride).toBeDefined();
		expect(ride?.id).toBe(createdRide.id);
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

	it("should prioritize most recent active ride if multiple exist", async () => {
		// Cria primeira corrida
		const firstRide = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		// Completa a primeira
		await ridesRepository.updateStatus(firstRide.id, "COMPLETED");

		// Aguarda um pouco
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Cria segunda corrida (mais recente)
		const secondRide = await ridesRepository.create({
			driverId: "driver-id-2",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 10,
			amountCents: 4000,
		});

		const { ride } = await sut.execute({
			passengerId: "passenger-id-1",
		});

		// Deve retornar a segunda (ativa), não a primeira (completada)
		expect(ride?.id).toBe(secondRide.id);
		expect(ride?.status).toBe("PENDING");
	});

	it("should work with rides in different active statuses", async () => {
		// Cenário: Passageiro com corrida em IN_PROGRESS deve ser encontrado
		const ride = await ridesRepository.create({
			driverId: "driver-id-1",
			passengerId: "passenger-id-1",
			startLocation: mockStartLocation,
			endLocation: mockEndLocation,
			distance: 5,
			amountCents: 2000,
		});

		// Muda para ACCEPTED
		await ridesRepository.updateStatus(ride.id, "ACCEPTED");

		const resultAccepted = await sut.execute({
			passengerId: "passenger-id-1",
		});
		expect(resultAccepted.ride?.status).toBe("ACCEPTED");

		// Muda para IN_PROGRESS
		await ridesRepository.updateStatus(ride.id, "IN_PROGRESS");

		const resultInProgress = await sut.execute({
			passengerId: "passenger-id-1",
		});
		expect(resultInProgress.ride?.status).toBe("IN_PROGRESS");
	});
});
