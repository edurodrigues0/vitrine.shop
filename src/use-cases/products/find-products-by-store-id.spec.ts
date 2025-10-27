import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { FindProductsByStoreIdUseCase } from "./find-products-by-store-id";

describe("FindProductsByStoreIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: FindProductsByStoreIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new FindProductsByStoreIdUseCase(productsRepository);
	});

	it("should be able to find products by store id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto 1",
			description: "Desc 1",
			price: 100,
			stock: 10,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "Produto 2",
			description: "Desc 2",
			price: 200,
			stock: 20,
			colors: ["vermelho"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({ storeId });

		expect(products).toHaveLength(2);
		expect(products[0]?.storeId).toBe(storeId);
		expect(products[1]?.storeId).toBe(storeId);
	});

	it("should return only products from specified store", async () => {
		const storeId1 = crypto.randomUUID();
		const storeId2 = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto Loja 1",
			description: "Desc",
			price: 100,
			stock: 10,
			colors: ["azul"],
			categoryId,
			storeId: storeId1,
		});

		await productsRepository.create({
			name: "Produto Loja 2",
			description: "Desc",
			price: 200,
			stock: 20,
			colors: ["vermelho"],
			categoryId,
			storeId: storeId2,
		});

		const { products } = await sut.execute({ storeId: storeId1 });

		expect(products).toHaveLength(1);
		expect(products[0]?.name).toBe("Produto Loja 1");
		expect(products[0]?.storeId).toBe(storeId1);
	});

	it("should return empty array when store has no products", async () => {
		const storeId = crypto.randomUUID();

		const { products } = await sut.execute({ storeId });

		expect(products).toHaveLength(0);
	});

	it("should return products with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto Completo",
			description: "Descricao completa",
			price: 150,
			stock: 5,
			colors: ["preto"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({ storeId });

		expect(products[0]).toHaveProperty("id");
		expect(products[0]).toHaveProperty("name");
		expect(products[0]).toHaveProperty("storeId");
		expect(products[0]).toHaveProperty("categoryId");
	});
});
