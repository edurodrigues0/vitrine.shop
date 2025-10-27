import type { City } from "~/database/schema";
import type { CitiesRepository } from "~/repositories/cities-repository";
import { CityNotFoundError } from "../@errors/cities/city-not-found-error";

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
			throw new CityNotFoundError();
		}

		return { city };
	}
}
