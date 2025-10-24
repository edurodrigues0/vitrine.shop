import type * as schema from "~/database/schema";
import type { RidesRepository } from "~/repositories/rides-repository";

interface FindPendingUseCaseResponse {
	rides: schema.Ride[];
}

export class FindPendingUseCase {
	constructor(private readonly ridesRepository: RidesRepository) {}

	async execute(): Promise<FindPendingUseCaseResponse> {
		const rides = await this.ridesRepository.findPending();
		return { rides };
	}
}
