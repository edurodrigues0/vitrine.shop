import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { UpdateProductVariationUseCase } from "./update-product-variation-use-case";

describe("UpdateProductVariationUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: UpdateProductVariationUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new UpdateProductVariationUseCase(productVariationsRepository);
	});

	it("should be able to update product variation size", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				size: "G",
			},
		});

		expect(productVariation?.size).toBe("G");
		expect(productVariation?.color).toBe("Azul");
		expect(productVariation?.price).toBe(100);
	});

	it("should be able to update product variation color", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				color: "Vermelho",
			},
		});

		expect(productVariation?.color).toBe("Vermelho");
		expect(productVariation?.size).toBe("M");
		expect(productVariation?.price).toBe(100);
	});

	it("should be able to update multiple fields at once", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				size: "G",
				color: "Vermelho",
				weight: "600g",
			},
		});

		expect(productVariation?.size).toBe("G");
		expect(productVariation?.color).toBe("Vermelho");
		expect(productVariation?.weight).toBe("600g");
		expect(productVariation?.price).toBe(100);
	});

	it("should throw error when product variation is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: { size: "G" },
			}),
		).rejects.toBeInstanceOf(ProductVariationNotFoundError);
	});

	it("should not update fields that are not provided", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				size: "G",
			},
		});

		expect(productVariation?.size).toBe("G");
		expect(productVariation?.color).toBe("Azul");
		expect(productVariation?.price).toBe(100);
		expect(productVariation?.stock).toBe(10);
	});

	it("should update only the specified product variation", async () => {
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

		await sut.execute({
			id: variation1!.id,
			data: {
				size: "GG",
			},
		});

		const updatedVariation1 = await productVariationsRepository.findById({
			id: variation1!.id,
		});
		const unchangedVariation2 = await productVariationsRepository.findById({
			id: variation2!.id,
		});

		expect(updatedVariation1?.size).toBe("GG");
		expect(unchangedVariation2?.size).toBe("M");
		expect(unchangedVariation2?.color).toBe("Vermelho");
	});

	it("should preserve product variation id after update", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				size: "G",
				color: "Vermelho",
			},
		});

		expect(productVariation?.id).toBe(createdVariation.id);
	});

	it("should preserve productId after update", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				size: "G",
			},
		});

		expect(productVariation?.productId).toBe(product.id);
	});

	it("should update dimensions field", async () => {
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
			dimensions: { width: 10, height: 20 },
			discountPrice: null,
			price: 100,
			stock: 10,
		});

		expect(createdVariation).not.toBeNull();

		const newDimensions = { width: 15, height: 25, depth: 10 };

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				dimensions: newDimensions,
			},
		});

		expect(productVariation?.dimensions).toEqual(newDimensions);
	});

	it("should update weight field", async () => {
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

		const { productVariation } = await sut.execute({
			id: createdVariation!.id,
			data: {
				weight: "700g",
			},
		});

		expect(productVariation?.weight).toBe("700g");
	});
});
