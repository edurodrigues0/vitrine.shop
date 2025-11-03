import { DrizzleORM } from "~/database/connection";
import { DrizzleCitiesRepository } from "~/repositories/drizzle/cities-repository";
import { UpdateCityUseCase } from "~/use-cases/cities/update-city";

export function makeUpdateCityUseCase() {
	const citiesRepository = new DrizzleCitiesRepository(DrizzleORM);
	const useCase = new UpdateCityUseCase(citiesRepository);

	return useCase;
}
