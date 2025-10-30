import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";
import { DeleteProductUseCase } from "./delete-product";

describe("DeleteProductUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: DeleteProductUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new DeleteProductUseCase(productsRepository);
	});

	it("should be able to delete a product", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto para deletar",
			description: "Descricao",
			categoryId,
			storeId,
		});

		await sut.execute({ id: product.id });

		const deletedProduct = await productsRepository.findById({
			id: product.id,
		});

		expect(deletedProduct).toBeNull();
	});

	it("should throw error when product is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			ProductNotFoundError,
		);
	});

	it("should delete only the specified product", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product1 = await productsRepository.create({
			name: "Produto 1",
			description: "Desc 1",
			categoryId,
			storeId,
		});

		const product2 = await productsRepository.create({
			name: "Produto 2",
			description: "Desc 2",
			categoryId,
			storeId,
		});

		await sut.execute({ id: product1.id });

		const deletedProduct = await productsRepository.findById({
			id: product1.id,
		});
		const remainingProduct = await productsRepository.findById({
			id: product2.id,
		});

		expect(deletedProduct).toBeNull();
		expect(remainingProduct).toBeTruthy();
		expect(remainingProduct?.name).toBe("Produto 2");
	});

	it("should remove product from repository items", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		expect(productsRepository.items).toHaveLength(1);

		await sut.execute({ id: product.id });

		expect(productsRepository.items).toHaveLength(0);
	});

	it("should delete product from specific store", async () => {
		const storeId1 = crypto.randomUUID();
		const storeId2 = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product1 = await productsRepository.create({
			name: "Produto Loja 1",
			description: "Desc",
			categoryId,
			storeId: storeId1,
		});

		await productsRepository.create({
			name: "Produto Loja 2",
			description: "Desc",
			categoryId,
			storeId: storeId2,
		});

		await sut.execute({ id: product1.id });

		const productsStore1 = await productsRepository.findByStoreId({
			storeId: storeId1,
		});
		const productsStore2 = await productsRepository.findByStoreId({
			storeId: storeId2,
		});

		expect(productsStore1).toHaveLength(0);
		expect(productsStore2).toHaveLength(1);
		expect(productsStore2[0]?.name).toBe("Produto Loja 2");
	});
});
