import type { Ride, RideStatus } from "~/database/schema";
import type {
	CreateRideParams,
	RidesRepository,
	UpdateRideParams,
} from "../rides-repository";

export class InMemoryRidesRepository implements RidesRepository {
	public items: Ride[] = [];

	async create({
		driverId,
		passengerId,
		startLocation,
		endLocation,
		startDate,
		endDate,
		distance,
		amountCents,
		description,
		idempotencyKey,
	}: CreateRideParams): Promise<Ride> {
		const ride: Ride = {
			id: crypto.randomUUID(),
			status: "PENDING",
			description: description || null,
			idempotencyKey: idempotencyKey || null,
			createdAt: new Date(),
			updatedAt: new Date(),
			driverId,
			passengerId,
			startLocation,
			endLocation,
			startDate: startDate || null,
			endDate: endDate || null,
			distance,
			amountCents,
		};

		this.items.push(ride);
		return ride;
	}

	async findById({ id }: { id: string }): Promise<Ride | null> {
		const ride = this.items.find((item) => item.id === id);
		return ride || null;
	}

	async update({
		id,
		driverId,
		passengerId,
		startLocation,
		endLocation,
		startDate,
		endDate,
		distance,
		amountCents,
		description,
		idempotencyKey,
	}: UpdateRideParams): Promise<Ride | null> {
		const rideIndex = this.items.findIndex((item) => item.id === id);

		if (rideIndex < 0) {
			return null;
		}

		const currentRide = this.items[rideIndex];

		if (!currentRide) {
			return null;
		}

		const updatedRide: Ride = {
			id: currentRide.id,
			status: currentRide.status,
			description: description ?? currentRide.description,
			idempotencyKey: idempotencyKey ?? currentRide.idempotencyKey,
			driverId: driverId ?? currentRide.driverId,
			passengerId: passengerId ?? currentRide.passengerId,
			startLocation: startLocation ?? currentRide.startLocation,
			endLocation: endLocation ?? currentRide.endLocation,
			startDate: startDate ?? currentRide.startDate,
			endDate: endDate ?? currentRide.endDate,
			distance: distance ?? currentRide.distance,
			amountCents: amountCents ?? currentRide.amountCents,
			createdAt: currentRide.createdAt,
			updatedAt: new Date(),
		};

		this.items[rideIndex] = updatedRide;

		return updatedRide;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const rideIndex = this.items.findIndex((item) => item.id === id);

		if (rideIndex > -1) {
			this.items.splice(rideIndex, 1);
		}
	}

	async findActiveByDriverId(driverId: string): Promise<Ride | null> {
		const activeStatuses: RideStatus[] = ["PENDING", "ACCEPTED", "IN_PROGRESS"];

		const ride = this.items.find(
			(item) =>
				item.driverId === driverId && activeStatuses.includes(item.status),
		);

		return ride || null;
	}

	async findActiveByPassengerId(passengerId: string): Promise<Ride | null> {
		const activeStatuses: RideStatus[] = ["PENDING", "ACCEPTED", "IN_PROGRESS"];

		const ride = this.items.find(
			(item) =>
				item.passengerId === passengerId &&
				activeStatuses.includes(item.status),
		);

		return ride || null;
	}

	async findAllByDriverId(driverId: string): Promise<Ride[]> {
		return this.items.filter((item) => item.driverId === driverId);
	}

	async findAllByPassengerId(passengerId: string): Promise<Ride[]> {
		return this.items.filter((item) => item.passengerId === passengerId);
	}

	async findPending(): Promise<Ride[]> {
		return this.items.filter((item) => item.status === "PENDING");
	}

	async updateStatus(
		id: string,
		status: RideStatus,
	): Promise<{ status: RideStatus } | null> {
		const rideIndex = this.items.findIndex((item) => item.id === id);

		if (rideIndex < 0) {
			return null;
		}

		const currentRide = this.items[rideIndex];

		if (!currentRide) {
			return null;
		}

		this.items[rideIndex] = {
			...currentRide,
			status,
			updatedAt: new Date(),
		};

		return { status };
	}
}
