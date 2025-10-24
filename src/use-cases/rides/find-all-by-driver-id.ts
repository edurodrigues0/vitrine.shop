import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface FindAllByDriverIdUseCaseRequest {
	driverId: string;
}

interface FindAllByDriverIdUseCaseResponse {
	rides: schema.Ride[];
}

export class FindAllByDriverIdUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute({
		driverId,
	}: FindAllByDriverIdUseCaseRequest): Promise<FindAllByDriverIdUseCaseResponse> {
		const rides = await this.ridesRepository.findAllByDriverId(driverId);

		return { rides };
	}
}
