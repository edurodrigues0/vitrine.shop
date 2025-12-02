import type { City } from "~/database/schema";

export interface CreateCityParams {
	name: string;
	state: string;
}

export interface FindAllCitiesParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
		state?: string;
	};
}

export interface UpdateCityParams {
	id: string;
	data: {
		name?: string;
		state?: string;
	};
}

export interface CitiesRepository {
	create({ name, state }: CreateCityParams): Promise<{ city: City }>;

	findById({ id }: { id: string }): Promise<City | null>;

	findByNameAndState({
		name,
		state,
	}: {
		name: string;
		state: string;
	}): Promise<City | null>;

	findAll({ page, limit, filters }: FindAllCitiesParams): Promise<{
		cities: City[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}>;

	update({ id, data }: UpdateCityParams): Promise<City | null>;
}
