import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { FindProductsByCategoryIdUseCase } from "./find-products-by-category-id";

describe("FindProductsByCategoryIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: FindProductsByCategoryIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new FindProductsByCategoryIdUseCase(productsRepository);
	});

	it("should be able to find products by category id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto 1",
			description: "Desc 1",
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "Produto 2",
			description: "Desc 2",
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({ categoryId });

		expect(products).toHaveLength(2);
		expect(products[0]?.categoryId).toBe(categoryId);
		expect(products[1]?.categoryId).toBe(categoryId);
	});

	it("should return only products from specified category", async () => {
		const storeId = crypto.randomUUID();
		const categoryId1 = crypto.randomUUID();
		const categoryId2 = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto Categoria 1",
			description: "Desc",
			categoryId: categoryId1,
			storeId,
		});

		await productsRepository.create({
			name: "Produto Categoria 2",
			description: "Desc",
			categoryId: categoryId2,
			storeId,
		});

		const { products } = await sut.execute({ categoryId: categoryId1 });

		expect(products).toHaveLength(1);
		expect(products[0]?.name).toBe("Produto Categoria 1");
		expect(products[0]?.categoryId).toBe(categoryId1);
	});

	it("should return empty array when category has no products", async () => {
		const categoryId = crypto.randomUUID();

		const { products } = await sut.execute({ categoryId });

		expect(products).toHaveLength(0);
	});

	it("should return products with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto Completo",
			description: "Descricao completa",
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({ categoryId });

		expect(products[0]).toHaveProperty("id");
		expect(products[0]).toHaveProperty("name");
		expect(products[0]).toHaveProperty("categoryId");
		expect(products[0]).toHaveProperty("storeId");
	});
});
