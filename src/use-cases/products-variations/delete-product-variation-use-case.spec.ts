import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { DeleteProductVariationUseCase } from "./delete-product-variation-use-case";

describe("DeleteProductVariationUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: DeleteProductVariationUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new DeleteProductVariationUseCase(productVariationsRepository);
	});

	it("should throw error when product variation is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			ProductVariationNotFoundError,
		);
	});

	it("should be able to delete a product variation", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const createdVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 10,
		});

		expect(createdVariation).not.toBeNull();

		await sut.execute({ id: createdVariation!.id });

		const deletedVariation = await productVariationsRepository.findById({
			id: createdVariation!.id,
		});

		expect(deletedVariation).toBeNull();
	});

	it("should delete only the specified product variation", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const variation1 = await productVariationsRepository.create({
			productId: product.id,
			size: "P",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 90,
			stock: 5,
		});

		const variation2 = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 8,
		});

		expect(variation1).not.toBeNull();
		expect(variation2).not.toBeNull();

		await sut.execute({ id: variation1!.id });

		const deletedVariation = await productVariationsRepository.findById({
			id: variation1!.id,
		});
		const remainingVariation = await productVariationsRepository.findById({
			id: variation2!.id,
		});

		expect(deletedVariation).toBeNull();
		expect(remainingVariation).toBeTruthy();
		expect(remainingVariation?.size).toBe("M");
	});

	it("should remove product variation from repository items", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const createdVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 10,
		});

		expect(productVariationsRepository.items).toHaveLength(1);

		expect(createdVariation).not.toBeNull();

		await sut.execute({ id: createdVariation!.id });

		expect(productVariationsRepository.items).toHaveLength(0);
	});

	it("should delete product variation from specific product", async () => {
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

		const variation1 = await productVariationsRepository.create({
			productId: product1.id,
			size: "P",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 90,
			stock: 5,
		});

		await productVariationsRepository.create({
			productId: product2.id,
			size: "M",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 8,
		});

		expect(variation1).not.toBeNull();

		await sut.execute({ id: variation1!.id });

		const variationsProduct1 =
			await productVariationsRepository.findByProductId({
				productId: product1.id,
			});
		const variationsProduct2 =
			await productVariationsRepository.findByProductId({
				productId: product2.id,
			});

		expect(variationsProduct1).toHaveLength(0);
		expect(variationsProduct2).toHaveLength(1);
		expect(variationsProduct2[0]?.size).toBe("M");
	});

	it("should delete variation with all optional fields", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const createdVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "G",
			color: "Preto",
			weight: "700g",
			dimensions: { width: 20, height: 30 },
			discountPrice: 180,
			price: 200,
			stock: 12,
		});

		expect(createdVariation).not.toBeNull();

		await sut.execute({ id: createdVariation!.id });

		const deletedVariation = await productVariationsRepository.findById({
			id: createdVariation!.id,
		});

		expect(deletedVariation).toBeNull();
	});
});
