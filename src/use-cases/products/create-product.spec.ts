import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { CreateProductUseCase } from "./create-product";

describe("CreateProductUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: CreateProductUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new CreateProductUseCase(productsRepository);
	});

	it("should be able to create a new product", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Smartphone XYZ",
			description: "Um smartphone incrivel",
			categoryId,
			storeId,
		});

		expect(product).toBeTruthy();
		expect(product.id).toBeTruthy();
		expect(product.name).toBe("Smartphone XYZ");
		expect(product.storeId).toBe(storeId);
		expect(product.categoryId).toBe(categoryId);
	});

	it("should save product in repository", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await sut.execute({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		expect(productsRepository.items).toHaveLength(1);
	});

	it("should create multiple products for same store", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await sut.execute({
			name: "Produto 1",
			description: "Desc 1",
			categoryId,
			storeId,
		});

		await sut.execute({
			name: "Produto 2",
			description: "Desc 2",
			categoryId,
			storeId,
		});

		expect(productsRepository.items).toHaveLength(2);
		expect(productsRepository.items[0]?.storeId).toBe(storeId);
		expect(productsRepository.items[1]?.storeId).toBe(storeId);
	});

	it("should create products for different stores", async () => {
		const storeId1 = crypto.randomUUID();
		const storeId2 = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await sut.execute({
			name: "Produto Loja 1",
			description: "Desc",
			categoryId,
			storeId: storeId1,
		});

		await sut.execute({
			name: "Produto Loja 2",
			description: "Desc",
			categoryId,
			storeId: storeId2,
		});

		expect(productsRepository.items[0]?.storeId).toBe(storeId1);
		expect(productsRepository.items[1]?.storeId).toBe(storeId2);
	});
});
