import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";
import { UpdateCategoryUseCase } from "./update-category";

describe("UpdateCategoryUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let sut: UpdateCategoryUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		sut = new UpdateCategoryUseCase(categoriesRepository);
	});

	it("should be able to update a category name", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Nome Antigo",
			slug: "nome-antigo",
		});

		const { category } = await sut.execute({
			id: createdCategory.id,
			data: {
				name: "Nome Novo",
			},
		});

		expect(category?.name).toBe("Nome Novo");
		expect(category?.slug).toBe("nome-antigo");
	});

	it("should be able to update a category slug", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Categoria",
			slug: "slug-antigo",
		});

		const { category } = await sut.execute({
			id: createdCategory.id,
			data: {
				slug: "slug-novo",
			},
		});

		expect(category?.slug).toBe("slug-novo");
		expect(category?.name).toBe("Categoria");
	});

	it("should be able to update both name and slug", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Nome Antigo",
			slug: "slug-antigo",
		});

		const { category } = await sut.execute({
			id: createdCategory.id,
			data: {
				name: "Nome Novo",
				slug: "slug-novo",
			},
		});

		expect(category?.name).toBe("Nome Novo");
		expect(category?.slug).toBe("slug-novo");
	});

	it("should throw error when category is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: { name: "Novo Nome" },
			}),
		).rejects.toBeInstanceOf(CategoryNotFoundError);
	});

	it("should not update fields that are not provided", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Nome Original",
			slug: "slug-original",
		});

		const { category } = await sut.execute({
			id: createdCategory.id,
			data: {
				name: "Nome Atualizado",
			},
		});

		expect(category?.name).toBe("Nome Atualizado");
		expect(category?.slug).toBe("slug-original");
	});

	it("should update only the specified category", async () => {
		const { category: category1 } = await categoriesRepository.create({
			name: "Categoria 1",
			slug: "categoria-1",
		});

		const { category: category2 } = await categoriesRepository.create({
			name: "Categoria 2",
			slug: "categoria-2",
		});

		await sut.execute({
			id: category1.id,
			data: {
				name: "Categoria 1 Atualizada",
			},
		});

		const updatedCategory1 = await categoriesRepository.findById({
			id: category1.id,
		});
		const unchangedCategory2 = await categoriesRepository.findById({
			id: category2.id,
		});

		expect(updatedCategory1?.name).toBe("Categoria 1 Atualizada");
		expect(unchangedCategory2?.name).toBe("Categoria 2");
	});

	it("should preserve category id after update", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Categoria",
			slug: "categoria",
		});

		const { category } = await sut.execute({
			id: createdCategory.id,
			data: {
				name: "Categoria Atualizada",
			},
		});

		expect(category?.id).toBe(createdCategory.id);
	});

	it("should update updatedAt timestamp", async () => {
		const { category: createdCategory } = await categoriesRepository.create({
			name: "Categoria",
			slug: "categoria",
		});

		await new Promise((resolve) => setTimeout(resolve, 10));

		const { category } = await sut.execute({
			id: createdCategory.id,
			data: {
				name: "Categoria Atualizada",
			},
		});

		expect(category?.updatedAt.getTime()).toBeGreaterThan(
			createdCategory.updatedAt.getTime(),
		);
	});
});
