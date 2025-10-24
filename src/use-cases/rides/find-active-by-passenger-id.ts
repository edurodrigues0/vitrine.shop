import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface FindActiveByPassengerIdUseCaseRequest {
	passengerId: string;
}

interface FindActiveByPassengerIdUseCaseResponse {
	ride: schema.Ride | null;
}

export class FindActiveByPassengerIdUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute({
		passengerId,
	}: FindActiveByPassengerIdUseCaseRequest): Promise<FindActiveByPassengerIdUseCaseResponse> {
		const ride =
			await this.ridesRepository.findActiveByPassengerId(passengerId);

		if (!ride) {
			throw new Error("Active ride not found");
		}

		return { ride };
	}
}
