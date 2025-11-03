import { DrizzleORM } from "~/database/connection";
import { DrizzleCitiesRepository } from "~/repositories/drizzle/cities-repository";
import { CreateCityUseCase } from "~/use-cases/cities/create-city";

export function makeCreateCityUseCase() {
	const citiesRepository = new DrizzleCitiesRepository(DrizzleORM);
	const useCase = new CreateCityUseCase(citiesRepository);

	return useCase;
}
