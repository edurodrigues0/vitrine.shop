import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { FindCityByNameAndStateUseCase } from "./find-city-by-name-and-state";

describe("FindCityByNameAndStateUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let sut: FindCityByNameAndStateUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		sut = new FindCityByNameAndStateUseCase(citiesRepository);
	});

	it("should be able to find a city by name and state", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		const { city } = await sut.execute({
			name: "São Paulo",
			state: "SP",
		});

		expect(city).toBeTruthy();
		expect(city?.name).toBe("São Paulo");
		expect(city?.state).toBe("SP");
	});

	it("should throw an error when city is not found", async () => {
		await expect(
			sut.execute({
				name: "São Paulo",
				state: "SP",
			}),
		).rejects.toThrow("City not found");
	});
});
