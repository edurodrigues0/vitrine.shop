import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { FindCategoryBySlugUseCase } from "./find-category-by-slug";

describe("FindCategoryBySlugUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let sut: FindCategoryBySlugUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		sut = new FindCategoryBySlugUseCase(categoriesRepository);
	});

	it("should be able to find a category by slug", async () => {
		await categoriesRepository.create({
			name: "Eletronicos",
			slug: "eletronicos",
		});

		const { category } = await sut.execute({ slug: "eletronicos" });

		expect(category).toBeTruthy();
		expect(category?.slug).toBe("eletronicos");
		expect(category?.name).toBe("Eletronicos");
	});

	it("should throw error when category is not found", async () => {
		await expect(sut.execute({ slug: "non-existent-slug" })).rejects.toThrow(
			"Category not found",
		);
	});

	it("should return category with all properties", async () => {
		await categoriesRepository.create({
			name: "Roupas",
			slug: "roupas",
		});

		const { category } = await sut.execute({ slug: "roupas" });

		expect(category).toHaveProperty("id");
		expect(category).toHaveProperty("name");
		expect(category).toHaveProperty("slug");
		expect(category).toHaveProperty("createdAt");
		expect(category).toHaveProperty("updatedAt");
	});

	it("should find the correct category when multiple categories exist", async () => {
		await categoriesRepository.create({
			name: "Categoria 1",
			slug: "categoria-1",
		});

		await categoriesRepository.create({
			name: "Categoria 2",
			slug: "categoria-2",
		});

		const { category } = await sut.execute({ slug: "categoria-1" });

		expect(category?.slug).toBe("categoria-1");
		expect(category?.name).toBe("Categoria 1");
	});
});
