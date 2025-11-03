import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { CityAlreadyExistsError } from "../@errors/cities/city-already-exists-error";
import { CreateCityUseCase } from "./create-city";

describe("CreateCityUseCase", () => {
	let citiesRespository: InMemoryCitiesRepository;
	let sut: CreateCityUseCase;

	beforeEach(() => {
		citiesRespository = new InMemoryCitiesRepository();
		sut = new CreateCityUseCase(citiesRespository);
	});

	it("should be able to create a new city", async () => {
		const { city } = await sut.execute({
			name: "São Paulo",
			state: "SP",
		});

		expect(city.id).toEqual(expect.any(String));
		expect(city.name).toBe("São Paulo");
		expect(city.state).toBe("SP");
		expect(city.createdAt).toBeInstanceOf(Date);
	});

	it("should not be able to create a new city with the same name and state", async () => {
		await sut.execute({
			name: "São Paulo",
			state: "SP",
		});

		await expect(
			sut.execute({
				name: "São Paulo",
				state: "SP",
			}),
		).rejects.toBeInstanceOf(CityAlreadyExistsError);
	});
});
