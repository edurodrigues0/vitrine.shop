import type { City } from "~/database/schema";
import type { CitiesRepository } from "~/repositories/cities-repository";
import { CityNotFoundError } from "../@errors/cities/city-not-found-error";

interface FindCityByIdUseCaseRequest {
	id: string;
}

interface FindCityByIdUseCaseResponse {
	city: City;
}

export class FindCityByIdUseCase {
	constructor(private readonly citiesRepository: CitiesRepository) {}

	async execute({
		id,
	}: FindCityByIdUseCaseRequest): Promise<FindCityByIdUseCaseResponse> {
		const city = await this.citiesRepository.findById({ id });

		if (!city) {
			throw new CityNotFoundError();
		}

		return { city };
	}
}



