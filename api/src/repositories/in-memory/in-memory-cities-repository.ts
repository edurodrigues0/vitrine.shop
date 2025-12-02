import type { City } from "~/database/schema";
import type {
	CitiesRepository,
	CreateCityParams,
	FindAllCitiesParams,
	UpdateCityParams,
} from "../cities-repository";

export class InMemoryCitiesRepository implements CitiesRepository {
	public items: City[] = [];

	async create({ name, state }: CreateCityParams): Promise<{ city: City }> {
		const id = crypto.randomUUID();
		const createdAt = new Date();

		const city: City = {
			id,
			name,
			state,
			createdAt,
		};

		this.items.push(city);

		return {
			city,
		};
	}

	async findById({ id }: { id: string }): Promise<City | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByNameAndState({
		name,
		state,
	}: {
		name: string;
		state: string;
	}): Promise<City | null> {
		const city =
			this.items.find((item) => item.name === name && item.state === state) ??
			null;

		return city;
	}

	async findAll({ page, limit, filters }: FindAllCitiesParams): Promise<{
		cities: City[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { name, state } = filters;

		let cities = this.items;

		if (name) {
			cities = cities.filter((item) =>
				item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
			);
		}

		if (state) {
			cities = cities.filter((item) =>
				item.state.toLocaleLowerCase().includes(state.toLocaleLowerCase()),
			);
		}

		const totalItems = cities.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedCities = cities.slice((page - 1) * limit, page * limit);

		return {
			cities: paginatedCities,
			pagination: {
				currentPage: page,
				perPage: limit,
				totalItems,
				totalPages,
			},
		};
	}

	async update({ id, data }: UpdateCityParams): Promise<City | null> {
		const cityIndex = this.items.findIndex((item) => item.id === id);

		if (cityIndex < 0) {
			return null;
		}

		const currentCity = this.items[cityIndex];

		if (!currentCity) {
			return null;
		}

		const updatedCity: City = {
			...currentCity,
			name: data.name ?? currentCity.name,
			state: data.state ?? currentCity.state,
		};

		this.items[cityIndex] = updatedCity;

		return updatedCity;
	}
}
