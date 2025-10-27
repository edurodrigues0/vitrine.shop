import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { FindProductByIdUseCase } from "./find-product-by-id";

describe("FindProductByIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: FindProductByIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new FindProductByIdUseCase(productsRepository);
	});

	it("should be able to find a product by id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao teste",
			price: 99.99,
			stock: 10,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({ id: createdProduct.id });

		expect(product).toBeTruthy();
		expect(product?.id).toBe(createdProduct.id);
		expect(product?.name).toBe("Produto Teste");
	});

	it("should throw error when product is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toThrow(
			"Product not found",
		);
	});

	it("should return product with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Produto Completo",
			description: "Descricao completa",
			price: 150,
			discountPrice: 120,
			stock: 5,
			colors: ["preto", "branco"],
			size: "G",
			weight: 1.5,
			dimensions: { height: 10, width: 20, depth: 5 },
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({ id: createdProduct.id });

		expect(product).toHaveProperty("id");
		expect(product).toHaveProperty("name");
		expect(product).toHaveProperty("description");
		expect(product).toHaveProperty("price");
		expect(product).toHaveProperty("discountPrice");
		expect(product).toHaveProperty("stock");
		expect(product).toHaveProperty("colors");
		expect(product).toHaveProperty("size");
		expect(product).toHaveProperty("weight");
		expect(product).toHaveProperty("dimensions");
		expect(product).toHaveProperty("categoryId");
		expect(product).toHaveProperty("storeId");
		expect(product).toHaveProperty("createdAt");
	});

	it("should find the correct product when multiple products exist", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product1 = await productsRepository.create({
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

		const { product } = await sut.execute({ id: product1.id });

		expect(product?.id).toBe(product1.id);
		expect(product?.name).toBe("Produto 1");
	});
});
