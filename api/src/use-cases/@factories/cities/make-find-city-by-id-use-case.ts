import { DrizzleORM } from "~/database/connection";
import { DrizzleCitiesRepository } from "~/repositories/drizzle/cities-repository";
import { FindCityByIdUseCase } from "~/use-cases/cities/find-city-by-id";

export function makeFindCityByIdUseCase() {
	const citiesRepository = new DrizzleCitiesRepository(DrizzleORM);
	return new FindCityByIdUseCase(citiesRepository);
}



