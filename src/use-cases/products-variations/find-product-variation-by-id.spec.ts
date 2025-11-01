import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { FindProductVariationByIdUseCase } from "./find-product-variation-by-id";

describe("FindProductVariationByIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: FindProductVariationByIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new FindProductVariationByIdUseCase(productVariationsRepository);
	});

	it("should be able to find a product variation by id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao teste",
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
			id: createdVariation.id,
		});

		expect(productVariation).toBeTruthy();
		expect(productVariation?.id).toBe(createdVariation.id);
		expect(productVariation?.size).toBe("M");
		expect(productVariation?.color).toBe("Azul");
		expect(productVariation?.price).toBe(100);
	});

	it("should throw error when product variation is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			ProductVariationNotFoundError,
		);
	});

	it("should return product variation with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Completo",
			description: "Descricao completa",
			categoryId,
			storeId,
		});

		const createdVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "G",
			color: "Vermelho",
			weight: "600g",
			dimensions: { width: 15, height: 25 },
			discountPrice: 180,
			price: 200,
			stock: 15,
		});

		const { productVariation } = await sut.execute({
			id: createdVariation.id,
		});

		expect(productVariation).toHaveProperty("id");
		expect(productVariation).toHaveProperty("productId");
		expect(productVariation).toHaveProperty("size");
		expect(productVariation).toHaveProperty("color");
		expect(productVariation).toHaveProperty("weight");
		expect(productVariation).toHaveProperty("dimensions");
		expect(productVariation).toHaveProperty("discountPrice");
		expect(productVariation).toHaveProperty("price");
		expect(productVariation).toHaveProperty("stock");
		expect(productVariation).toHaveProperty("createdAt");
		expect(productVariation).toHaveProperty("updatedAt");
	});

	it("should find the correct product variation when multiple variations exist", async () => {
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

		await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 8,
		});

		const { productVariation } = await sut.execute({
			id: variation1.id,
		});

		expect(productVariation?.id).toBe(variation1.id);
		expect(productVariation?.size).toBe("P");
		expect(productVariation?.color).toBe("Azul");
		expect(productVariation?.price).toBe(90);
	});

	it("should find variation with correct optional fields", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const dimensions = { width: 20, height: 30, depth: 10 };

		const createdVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "GG",
			color: "Preto",
			weight: "700g",
			dimensions,
			discountPrice: 220,
			price: 250,
			stock: 12,
		});

		const { productVariation } = await sut.execute({
			id: createdVariation.id,
		});

		expect(productVariation?.weight).toBe("700g");
		expect(productVariation?.dimensions).toEqual(dimensions);
		expect(productVariation?.discountPrice).toBe(220);
		expect(productVariation?.price).toBe(250);
	});

	it("should find variation with null optional fields", async () => {
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
			color: "Branco",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 150,
			stock: 20,
		});

		const { productVariation } = await sut.execute({
			id: createdVariation.id,
		});

		expect(productVariation?.weight).toBeNull();
		expect(productVariation?.dimensions).toBeNull();
		expect(productVariation?.discountPrice).toBeNull();
		expect(productVariation?.price).toBe(150);
		expect(productVariation?.stock).toBe(20);
	});
});
