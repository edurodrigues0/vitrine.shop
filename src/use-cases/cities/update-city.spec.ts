import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { UpdateCityUseCase } from "./update-city";

describe("UpdateCityUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let sut: UpdateCityUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		sut = new UpdateCityUseCase(citiesRepository);
	});

	it("should be able to update a city name", async () => {
		const { city: createdCity } = await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		const { city } = await sut.execute({
			id: createdCity.id,
			data: {
				name: "São Paulo - Capital",
			},
		});

		expect(city).toBeTruthy();
		expect(city?.name).toBe("São Paulo - Capital");
		expect(city?.state).toBe("SP");
	});

	it("should be able to update a city state", async () => {
		const { city: createdCity } = await citiesRepository.create({
			name: "Rio de Janeiro",
			state: "RJ",
		});

		const { city } = await sut.execute({
			id: createdCity.id,
			data: {
				state: "RIO",
			},
		});

		expect(city).toBeTruthy();
		expect(city?.name).toBe("Rio de Janeiro");
		expect(city?.state).toBe("RIO");
	});

	it("should be able to update both name and state", async () => {
		const { city: createdCity } = await citiesRepository.create({
			name: "Belo Horizonte",
			state: "MG",
		});

		const { city } = await sut.execute({
			id: createdCity.id,
			data: {
				name: "Betim",
				state: "MG",
			},
		});

		expect(city).toBeTruthy();
		expect(city?.name).toBe("Betim");
		expect(city?.state).toBe("MG");
	});

	it("should throw an error when city is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: {
					name: "Test City",
				},
			}),
		).rejects.toThrow("City not found");
	});

	it("should not update fields that are not provided", async () => {
		const { city: createdCity } = await citiesRepository.create({
			name: "Curitiba",
			state: "PR",
		});

		const { city } = await sut.execute({
			id: createdCity.id,
			data: {},
		});

		expect(city).toBeTruthy();
		expect(city?.name).toBe("Curitiba");
		expect(city?.state).toBe("PR");
	});

	it("should update only the specified city when multiple cities exist", async () => {
		const { city: city1 } = await citiesRepository.create({
			name: "Porto Alegre",
			state: "RS",
		});

		const { city: city2 } = await citiesRepository.create({
			name: "Florianópolis",
			state: "SC",
		});

		await sut.execute({
			id: city1.id,
			data: {
				name: "Porto Alegre",
			},
		});

		const updatedCity1 = await citiesRepository.findByNameAndState({
			name: "Porto Alegre",
			state: "RS",
		});

		const unchangedCity2 = await citiesRepository.findByNameAndState({
			name: "Florianópolis",
			state: "SC",
		});

		expect(updatedCity1).toBeTruthy();
		expect(updatedCity1?.name).toBe("Porto Alegre");

		expect(unchangedCity2).toBeTruthy();
		expect(unchangedCity2?.name).toBe("Florianópolis");
		expect(unchangedCity2?.id).toBe(city2.id);
	});
});
