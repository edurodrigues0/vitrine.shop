import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { FindAllCategoriesUseCase } from "./find-all-categories";

describe("FindAllCategoriesUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let sut: FindAllCategoriesUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		sut = new FindAllCategoriesUseCase(categoriesRepository);
	});

	it("should be able to find all categories", async () => {
		await categoriesRepository.create({
			name: "Categoria 1",
			slug: "categoria-1",
		});
		await categoriesRepository.create({
			name: "Categoria 2",
			slug: "categoria-2",
		});
		await categoriesRepository.create({
			name: "Categoria 3",
			slug: "categoria-3",
		});

		const { categories, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(categories).toHaveLength(3);
		expect(pagination.totalItems).toBe(3);
		expect(pagination.currentPage).toBe(1);
	});

	it("should filter categories by name", async () => {
		await categoriesRepository.create({
			name: "Eletronicos",
			slug: "eletronicos",
		});
		await categoriesRepository.create({
			name: "Roupas",
			slug: "roupas",
		});
		await categoriesRepository.create({
			name: "Alimentos",
			slug: "alimentos",
		});

		const { categories } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "eletro" },
		});

		expect(categories).toHaveLength(1);
		expect(categories[0]?.name).toBe("Eletronicos");
	});

	it("should filter categories by slug", async () => {
		await categoriesRepository.create({
			name: "Eletronicos",
			slug: "eletronicos",
		});
		await categoriesRepository.create({
			name: "Roupas",
			slug: "roupas",
		});

		const { categories } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { slug: "roupas" },
		});

		expect(categories).toHaveLength(1);
		expect(categories[0]?.slug).toBe("roupas");
	});

	it("should apply multiple filters at once", async () => {
		await categoriesRepository.create({
			name: "Moveis Escritorio",
			slug: "moveis-escritorio",
		});
		await categoriesRepository.create({
			name: "Roupas",
			slug: "roupas",
		});
		await categoriesRepository.create({
			name: "Moveis Cozinha",
			slug: "moveis-cozinha",
		});

		const { categories } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "escritorio",
				slug: "escritorio",
			},
		});

		expect(categories).toHaveLength(1);
		expect(categories[0]?.name).toBe("Moveis Escritorio");
		expect(categories[0]?.slug).toBe("moveis-escritorio");
	});

	it("should paginate results correctly", async () => {
		for (let i = 1; i <= 15; i++) {
			await categoriesRepository.create({
				name: `Categoria ${i}`,
				slug: `categoria-${i}`,
			});
		}

		const { categories: page1, pagination: pagination1 } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		const { categories: page2, pagination: pagination2 } = await sut.execute({
			page: 2,
			limit: 10,
			filters: {},
		});

		expect(page1).toHaveLength(10);
		expect(page2).toHaveLength(5);
		expect(pagination1.totalPages).toBe(2);
		expect(pagination2.currentPage).toBe(2);
	});

	it("should return empty array when no categories exist", async () => {
		const { categories, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(categories).toHaveLength(0);
		expect(pagination.totalItems).toBe(0);
	});

	it("should return empty array when filters match no categories", async () => {
		await categoriesRepository.create({
			name: "Categoria 1",
			slug: "categoria-1",
		});

		const { categories } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "inexistente" },
		});

		expect(categories).toHaveLength(0);
	});

	it("should handle case-insensitive filters", async () => {
		await categoriesRepository.create({
			name: "ELETRONICOS",
			slug: "eletronicos",
		});

		const { categories } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "eletronicos" },
		});

		expect(categories).toHaveLength(1);
		expect(categories[0]?.name).toBe("ELETRONICOS");
	});

	it("should return categories with all correct properties", async () => {
		await categoriesRepository.create({
			name: "Teste",
			slug: "teste",
		});

		const { categories } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(categories[0]).toHaveProperty("id");
		expect(categories[0]).toHaveProperty("name");
		expect(categories[0]).toHaveProperty("slug");
		expect(categories[0]).toHaveProperty("createdAt");
		expect(categories[0]).toHaveProperty("updatedAt");
	});

	it("should handle pagination with different page sizes", async () => {
		for (let i = 1; i <= 10; i++) {
			await categoriesRepository.create({
				name: `Categoria ${i}`,
				slug: `categoria-${i}`,
			});
		}

		const { categories: smallPage } = await sut.execute({
			page: 1,
			limit: 5,
			filters: {},
		});

		const { categories: largePage } = await sut.execute({
			page: 1,
			limit: 20,
			filters: {},
		});

		expect(smallPage).toHaveLength(5);
		expect(largePage).toHaveLength(10);
	});
});
