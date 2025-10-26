import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { CreateCategoryUseCase } from "./create-category";

describe("CreateCategoryUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let sut: CreateCategoryUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		sut = new CreateCategoryUseCase(categoriesRepository);
	});

	it("should be able to create a new category", async () => {
		const { category } = await sut.execute({
			name: "Eletronicos",
			slug: "eletronicos",
		});

		expect(category).toBeTruthy();
		expect(category.id).toBeTruthy();
		expect(category.name).toBe("Eletronicos");
		expect(category.slug).toBe("eletronicos");
		expect(category.createdAt).toBeInstanceOf(Date);
		expect(category.updatedAt).toBeInstanceOf(Date);
	});

	it("should not create category with duplicate slug", async () => {
		await sut.execute({
			name: "Eletronicos",
			slug: "eletronicos",
		});

		await expect(
			sut.execute({
				name: "Eletronicos 2",
				slug: "eletronicos",
			}),
		).rejects.toThrow("Category with same slug already exists");
	});

	it("should save category in repository", async () => {
		await sut.execute({
			name: "Roupas",
			slug: "roupas",
		});

		expect(categoriesRepository.items).toHaveLength(1);
	});

	it("should create category with all provided data", async () => {
		const { category } = await sut.execute({
			name: "Alimentos",
			slug: "alimentos",
		});

		expect(category.name).toBe("Alimentos");
		expect(category.slug).toBe("alimentos");
	});

	it("should create multiple categories with different slugs", async () => {
		await sut.execute({
			name: "Categoria 1",
			slug: "categoria-1",
		});

		await sut.execute({
			name: "Categoria 2",
			slug: "categoria-2",
		});

		expect(categoriesRepository.items).toHaveLength(2);
	});

	it("should create category with timestamps", async () => {
		const { category } = await sut.execute({
			name: "Livros",
			slug: "livros",
		});

		expect(category.createdAt).toBeInstanceOf(Date);
		expect(category.updatedAt).toBeInstanceOf(Date);
	});
});
