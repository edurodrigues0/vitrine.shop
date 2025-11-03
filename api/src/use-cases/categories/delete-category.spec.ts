import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";
import { DeleteCategoryUseCase } from "./delete-category";

describe("DeleteCategoryUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let sut: DeleteCategoryUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		sut = new DeleteCategoryUseCase(categoriesRepository);
	});

	it("should be able to delete a category", async () => {
		const { category } = await categoriesRepository.create({
			name: "Categoria para deletar",
			slug: "categoria-deletar",
		});

		await sut.execute({ id: category.id });

		const deletedCategory = await categoriesRepository.findById({
			id: category.id,
		});

		expect(deletedCategory).toBeNull();
	});

	it("should throw error when category is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toThrow(
			CategoryNotFoundError,
		);
	});

	it("should delete only the specified category", async () => {
		const { category: category1 } = await categoriesRepository.create({
			name: "Categoria 1",
			slug: "categoria-1",
		});

		const { category: category2 } = await categoriesRepository.create({
			name: "Categoria 2",
			slug: "categoria-2",
		});

		await sut.execute({ id: category1.id });

		const deletedCategory = await categoriesRepository.findById({
			id: category1.id,
		});
		const remainingCategory = await categoriesRepository.findById({
			id: category2.id,
		});

		expect(deletedCategory).toBeNull();
		expect(remainingCategory).toBeTruthy();
		expect(remainingCategory?.name).toBe("Categoria 2");
	});

	it("should remove category from repository items", async () => {
		const { category } = await categoriesRepository.create({
			name: "Categoria Teste",
			slug: "categoria-teste",
		});

		expect(categoriesRepository.items).toHaveLength(1);

		await sut.execute({ id: category.id });

		expect(categoriesRepository.items).toHaveLength(0);
	});

	it("should delete category and allow creating a new one with same slug", async () => {
		const { category } = await categoriesRepository.create({
			name: "Categoria Original",
			slug: "categoria-slug",
		});

		await sut.execute({ id: category.id });

		const { category: newCategory } = await categoriesRepository.create({
			name: "Categoria Nova",
			slug: "categoria-slug",
		});

		expect(newCategory).toBeTruthy();
		expect(newCategory.slug).toBe("categoria-slug");
		expect(newCategory.id).not.toBe(category.id);
	});
});
