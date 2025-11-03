import type { City } from "~/database/schema";
import type { CitiesRepository } from "~/repositories/cities-repository";
import { CityNotFoundError } from "../@errors/cities/city-not-found-error";

interface UpdateCityUseCaseRequest {
	id: string;
	data: {
		name?: string;
		state?: string;
	};
}

interface UpdateCityUseCaseResponse {
	city: City | null;
}

export class UpdateCityUseCase {
	constructor(private readonly citiesRepository: CitiesRepository) {}

	async execute({
		id,
		data,
	}: UpdateCityUseCaseRequest): Promise<UpdateCityUseCaseResponse> {
		const city = await this.citiesRepository.update({
			id,
			data: {
				name: data.name ?? undefined,
				state: data.state ?? undefined,
			},
		});

		if (!city) {
			throw new CityNotFoundError();
		}

		return { city };
	}
}
