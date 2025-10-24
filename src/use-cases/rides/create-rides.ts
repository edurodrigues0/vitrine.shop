import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface CreateRidesUseCaseRequest {
	driverId: string;
	passengerId: string;
	startLocation: schema.Location;
	endLocation: schema.Location;
	startDate: Date | null;
	endDate: Date | null;
	distance: number;
	amountCents: number;
	description?: string | null;
	idempotencyKey?: string;
}

interface CreateRidesUseCaseResponse {
	ride: schema.Ride;
}

export class CreateRidesUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute({
		driverId,
		passengerId,
		distance,
		amountCents,
		startDate,
		endDate,
		startLocation,
		endLocation,
		description,
		idempotencyKey,
	}: CreateRidesUseCaseRequest): Promise<CreateRidesUseCaseResponse> {
		const ride = await this.ridesRepository.create({
			driverId,
			passengerId,
			distance,
			amountCents,
			startDate,
			endDate,
			startLocation,
			endLocation,
			description,
			idempotencyKey,
		});

		return { ride };
	}
}
