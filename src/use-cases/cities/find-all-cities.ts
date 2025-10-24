import type { City } from "~/database/schema";
import type { CitiesRepository } from "~/repositories/cities-repository";

interface FindAllCitiesUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
		state?: string;
	};
}

interface FindAllCitiesUseCaseResponse {
	cities: City[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class FindAllCitiesUseCase {
	constructor(private readonly citiesRepository: CitiesRepository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllCitiesUseCaseRequest): Promise<FindAllCitiesUseCaseResponse> {
		const { cities, pagination } = await this.citiesRepository.findAll({
			page,
			limit,
			filters,
		});

		return { cities, pagination };
	}
}
