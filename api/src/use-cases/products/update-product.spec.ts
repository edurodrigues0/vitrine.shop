import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";
import { UpdateProductUseCase } from "./update-product";

describe("UpdateProductUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: UpdateProductUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new UpdateProductUseCase(productsRepository);
	});

	it("should be able to update product name", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Nome Antigo",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({
			id: createdProduct.id,
			data: {
				name: "Nome Novo",
			},
		});

		expect(product?.name).toBe("Nome Novo");
		expect(product?.description).toBe("Descricao");
	});

	it("should be able to update product description", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Produto",
			description: "Descricao Antiga",
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({
			id: createdProduct.id,
			data: {
				description: "Descricao Nova",
			},
		});

		expect(product?.description).toBe("Descricao Nova");
		expect(product?.name).toBe("Produto");
	});

	it("should be able to update multiple fields at once", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Nome Antigo",
			description: "Descricao Antiga",
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({
			id: createdProduct.id,
			data: {
				name: "Nome Novo",
				description: "Descricao Nova",
			},
		});

		expect(product?.name).toBe("Nome Novo");
		expect(product?.description).toBe("Descricao Nova");
	});

	it("should throw error when product is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: { name: "Novo Nome" },
			}),
		).rejects.toBeInstanceOf(ProductNotFoundError);
	});

	it("should not update fields that are not provided", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Nome Original",
			description: "Descricao Original",
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({
			id: createdProduct.id,
			data: {
				name: "Nome Atualizado",
			},
		});

		expect(product?.name).toBe("Nome Atualizado");
		expect(product?.description).toBe("Descricao Original");
	});

	it("should update only the specified product", async () => {
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

		await sut.execute({
			id: product1.id,
			data: {
				name: "Produto 1 Atualizado",
			},
		});

		const updatedProduct1 = await productsRepository.findById({
			id: product1.id,
		});
		const unchangedProduct2 = await productsRepository.findById({
			id: product2.id,
		});

		expect(updatedProduct1?.name).toBe("Produto 1 Atualizado");
		expect(unchangedProduct2?.name).toBe("Produto 2");
	});

	it("should preserve product id after update", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Produto",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({
			id: createdProduct.id,
			data: {
				name: "Produto Atualizado",
			},
		});

		expect(product?.id).toBe(createdProduct.id);
	});

	it("should preserve storeId and categoryId after update", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const createdProduct = await productsRepository.create({
			name: "Produto",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { product } = await sut.execute({
			id: createdProduct.id,
			data: {
				name: "Produto Atualizado",
			},
		});

		expect(product?.storeId).toBe(storeId);
		expect(product?.categoryId).toBe(categoryId);
	});
});
