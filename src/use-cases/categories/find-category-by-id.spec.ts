import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";
import { FindCategoryByIdUseCase } from "./find-category-by-id";

describe("FindCategoryByIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let sut: FindCategoryByIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		sut = new FindCategoryByIdUseCase(categoriesRepository);
	});

	it("should be able to find a category by id", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Eletronicos",
			slug: "eletronicos",
		});

		const { category } = await sut.execute({ id: createdCategory.id });

		expect(category).toBeTruthy();
		expect(category?.id).toBe(createdCategory.id);
		expect(category?.name).toBe("Eletronicos");
		expect(category?.slug).toBe("eletronicos");
	});

	it("should throw error when category is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			CategoryNotFoundError,
		);
	});

	it("should return category with all properties", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Roupas",
			slug: "roupas",
		});

		const { category } = await sut.execute({ id: createdCategory.id });

		expect(category).toHaveProperty("id");
		expect(category).toHaveProperty("name");
		expect(category).toHaveProperty("slug");
		expect(category).toHaveProperty("createdAt");
		expect(category).toHaveProperty("updatedAt");
	});

	it("should find the correct category when multiple categories exist", async () => {
		const { category: category1 } = await categoriesRepository.create({
			name: "Categoria 1",
			slug: "categoria-1",
		});

		await categoriesRepository.create({
			name: "Categoria 2",
			slug: "categoria-2",
		});

		const { category } = await sut.execute({ id: category1.id });

		expect(category?.id).toBe(category1.id);
		expect(category?.name).toBe("Categoria 1");
	});
});
