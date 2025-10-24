import type { City } from "~/database/schema";
import type { CitiesRepository } from "~/repositories/cities-repository";

interface FindCityByNameAndStateUseCaseRequest {
	name: string;
	state: string;
}

interface FindCityByNameAndStateUseCaseResponse {
	city: City | null;
}

export class FindCityByNameAndStateUseCase {
	constructor(private readonly citiesRepository: CitiesRepository) {}

	async execute({
		name,
		state,
	}: FindCityByNameAndStateUseCaseRequest): Promise<FindCityByNameAndStateUseCaseResponse> {
		const city = await this.citiesRepository.findByNameAndState({
			name,
			state,
		});

		if (!city) {
			throw new Error("City not found");
		}

		return { city };
	}
}
