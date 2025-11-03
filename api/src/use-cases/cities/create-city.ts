import type { City } from "~/database/schema";
import type { CitiesRepository } from "~/repositories/cities-repository";
import { CityAlreadyExistsError } from "../@errors/cities/city-already-exists-error";

interface CreateCityUseCaseRequest {
	name: string;
	state: string;
}

interface CreateCityUseCaseResponse {
	city: City;
}

export class CreateCityUseCase {
	constructor(private readonly citiesRepository: CitiesRepository) {}

	async execute({
		name,
		state,
	}: CreateCityUseCaseRequest): Promise<CreateCityUseCaseResponse> {
		const cityWithSameNameInSameState =
			await this.citiesRepository.findByNameAndState({
				name,
				state,
			});

		if (cityWithSameNameInSameState) {
			throw new CityAlreadyExistsError();
		}

		const { city } = await this.citiesRepository.create({
			name,
			state,
		});

		return { city };
	}
}
