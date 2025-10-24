import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { FindAllCitiesUseCase } from "./find-all-cities";

describe("FindAllCitiesUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let sut: FindAllCitiesUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		sut = new FindAllCitiesUseCase(citiesRepository);
	});

	it("should be able to find all cities", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		await citiesRepository.create({
			name: "Rio de Janeiro",
			state: "RJ",
		});

		const { cities, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(cities).toHaveLength(2);
		expect(pagination.totalItems).toBe(2);
		expect(pagination.totalPages).toBe(1);
		expect(pagination.currentPage).toBe(1);
		expect(pagination.perPage).toBe(10);
	});

	it("should filter cities by name", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		await citiesRepository.create({
			name: "São José dos Campos",
			state: "SP",
		});

		await citiesRepository.create({
			name: "Rio de Janeiro",
			state: "RJ",
		});

		const { cities } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "são",
			},
		});

		expect(cities).toHaveLength(2);
		expect(cities[0]?.name).toBe("São Paulo");
		expect(cities[1]?.name).toBe("São José dos Campos");
	});

	it("should filter cities by state", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		await citiesRepository.create({
			name: "Campinas",
			state: "SP",
		});

		await citiesRepository.create({
			name: "Rio de Janeiro",
			state: "RJ",
		});

		const { cities } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				state: "SP",
			},
		});

		expect(cities).toHaveLength(2);
		expect(cities[0]?.state).toBe("SP");
		expect(cities[1]?.state).toBe("SP");
	});

	it("should apply multiple filters at once", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		await citiesRepository.create({
			name: "São José dos Campos",
			state: "SP",
		});

		await citiesRepository.create({
			name: "São Luís",
			state: "MA",
		});

		await citiesRepository.create({
			name: "Campinas",
			state: "SP",
		});

		const { cities } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "são",
				state: "SP",
			},
		});

		expect(cities).toHaveLength(2);
		expect(cities[0]?.name).toBe("São Paulo");
		expect(cities[0]?.state).toBe("SP");
		expect(cities[1]?.name).toBe("São José dos Campos");
		expect(cities[1]?.state).toBe("SP");
	});

	it("should paginate results correctly", async () => {
		// Create 5 cities
		for (let i = 1; i <= 5; i++) {
			await citiesRepository.create({
				name: `Cidade ${i}`,
				state: "SP",
			});
		}

		// Page 1 with limit 2
		const page1 = await sut.execute({
			page: 1,
			limit: 2,
			filters: {},
		});

		expect(page1.cities).toHaveLength(2);
		expect(page1.pagination.totalItems).toBe(5);
		expect(page1.pagination.totalPages).toBe(3);
		expect(page1.pagination.currentPage).toBe(1);

		// Page 2 with limit 2
		const page2 = await sut.execute({
			page: 2,
			limit: 2,
			filters: {},
		});

		expect(page2.cities).toHaveLength(2);
		expect(page2.pagination.currentPage).toBe(2);

		// Page 3 with limit 2 (should have only 1 city)
		const page3 = await sut.execute({
			page: 3,
			limit: 2,
			filters: {},
		});

		expect(page3.cities).toHaveLength(1);
		expect(page3.pagination.currentPage).toBe(3);
	});

	it("should return empty array when no cities exist", async () => {
		const { cities, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(cities).toHaveLength(0);
		expect(pagination.totalItems).toBe(0);
		expect(pagination.totalPages).toBe(0);
	});

	it("should return empty array when filters match no cities", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		const { cities } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "nonexistent",
			},
		});

		expect(cities).toHaveLength(0);
	});

	it("should handle case-insensitive filters", async () => {
		await citiesRepository.create({
			name: "São Paulo",
			state: "SP",
		});

		const resultByName = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "SÃO PAULO",
			},
		});

		expect(resultByName.cities).toHaveLength(1);

		const resultByState = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				state: "sp",
			},
		});

		expect(resultByState.cities).toHaveLength(1);
	});

	it("should return cities with all correct properties", async () => {
		await citiesRepository.create({
			name: "Belo Horizonte",
			state: "MG",
		});

		const { cities } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(cities).toHaveLength(1);
		expect(cities[0]).toHaveProperty("id");
		expect(cities[0]).toHaveProperty("name");
		expect(cities[0]).toHaveProperty("state");
		expect(cities[0]).toHaveProperty("createdAt");
		expect(cities[0]?.name).toBe("Belo Horizonte");
		expect(cities[0]?.state).toBe("MG");
	});

	it("should handle pagination with different page sizes", async () => {
		// Create 10 cities
		for (let i = 1; i <= 10; i++) {
			await citiesRepository.create({
				name: `Cidade ${i}`,
				state: "SP",
			});
		}

		const result5PerPage = await sut.execute({
			page: 1,
			limit: 5,
			filters: {},
		});

		expect(result5PerPage.cities).toHaveLength(5);
		expect(result5PerPage.pagination.totalPages).toBe(2);

		const result3PerPage = await sut.execute({
			page: 1,
			limit: 3,
			filters: {},
		});

		expect(result3PerPage.cities).toHaveLength(3);
		expect(result3PerPage.pagination.totalPages).toBe(4);
	});

	it("should filter by partial state match", async () => {
		await citiesRepository.create({
			name: "Curitiba",
			state: "PR",
		});

		await citiesRepository.create({
			name: "Ponta Grossa",
			state: "PR",
		});

		await citiesRepository.create({
			name: "Porto Alegre",
			state: "RS",
		});

		const { cities } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				state: "P",
			},
		});

		expect(cities).toHaveLength(2);
		expect(cities.every((city) => city.state.includes("P"))).toBe(true);
	});

	it("should return correct pagination when filtering", async () => {
		// Create cities in different states
		for (let i = 1; i <= 3; i++) {
			await citiesRepository.create({
				name: `Cidade SP ${i}`,
				state: "SP",
			});
		}

		for (let i = 1; i <= 5; i++) {
			await citiesRepository.create({
				name: `Cidade RJ ${i}`,
				state: "RJ",
			});
		}

		const { cities, pagination } = await sut.execute({
			page: 1,
			limit: 2,
			filters: {
				state: "RJ",
			},
		});

		expect(cities).toHaveLength(2);
		expect(pagination.totalItems).toBe(5);
		expect(pagination.totalPages).toBe(3);
	});
});
