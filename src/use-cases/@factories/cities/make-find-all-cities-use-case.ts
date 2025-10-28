import { DrizzleORM } from "~/database/connection";
import { DrizzleCitiesRepository } from "~/repositories/drizzle/cities-repository";
import { FindAllCitiesUseCase } from "~/use-cases/cities/find-all-cities";

export function makeFindAllCitiesUseCase() {
	const citiesRepository = new DrizzleCitiesRepository(DrizzleORM);
	const useCase = new FindAllCitiesUseCase(citiesRepository);

	return useCase;
}
