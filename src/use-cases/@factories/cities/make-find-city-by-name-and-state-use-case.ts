import { DrizzleORM } from "~/database/connection";
import { DrizzleCitiesRepository } from "~/repositories/drizzle/cities/cities-repository";
import { FindCityByNameAndStateUseCase } from "~/use-cases/cities/find-city-by-name-and-state";

export function makeFindCityByNameAndStateUseCase() {
	const citiesRepository = new DrizzleCitiesRepository(DrizzleORM);
	const useCase = new FindCityByNameAndStateUseCase(citiesRepository);

	return useCase;
}
