import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface FindActiveByDriverIdUseCaseRequest {
	driverId: string;
}

interface FindActiveByDriverIdUseCaseResponse {
	ride: schema.Ride | null;
}

export class FindActiveByDriverIdUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute({
		driverId,
	}: FindActiveByDriverIdUseCaseRequest): Promise<FindActiveByDriverIdUseCaseResponse> {
		const ride = await this.ridesRepository.findActiveByDriverId(driverId);

		if (!ride) {
			throw new Error("Active ride not found");
		}

		return { ride };
	}
}
