import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface FindAllByPassengerIdUseCaseRequest {
	passengerId: string;
}

interface FindAllByPassengerIdUseCaseResponse {
	rides: schema.Ride[];
}

export class FindAllByPassengerIdUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute({
		passengerId,
	}: FindAllByPassengerIdUseCaseRequest): Promise<FindAllByPassengerIdUseCaseResponse> {
		const rides = await this.ridesRepository.findAllByPassengerId(passengerId);

		return { rides };
	}
}
