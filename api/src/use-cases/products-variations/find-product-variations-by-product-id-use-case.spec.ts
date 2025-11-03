import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";
import { FindProductVariationsByProductIdUseCase } from "./find-product-variations-by-product-id-use-case";

describe("FindProductVariationsByProductIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: FindProductVariationsByProductIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new FindProductVariationsByProductIdUseCase(
			productVariationsRepository,
			productsRepository,
		);
	});

	it("should be able to find product variations by product id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao teste",
			categoryId,
			storeId,
		});

		await productVariationsRepository.create({
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
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 8,
		});

		const { productVariations } = await sut.execute({
			productId: product.id,
		});

		expect(productVariations).toHaveLength(2);
		expect(productVariations[0]?.productId).toBe(product.id);
		expect(productVariations[1]?.productId).toBe(product.id);
	});

	it("should throw error when product does not exist", async () => {
		await expect(
			sut.execute({ productId: "non-existent-product-id" }),
		).rejects.toBeInstanceOf(ProductNotFoundError);
	});

	it("should return empty array when product has no variations", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Sem Variacoes",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { productVariations } = await sut.execute({
			productId: product.id,
		});

		expect(productVariations).toHaveLength(0);
	});

	it("should return only variations for the specified product", async () => {
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

		await productVariationsRepository.create({
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
			productId: product1.id,
			size: "M",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 8,
		});

		await productVariationsRepository.create({
			productId: product2.id,
			size: "G",
			color: "Preto",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 120,
			stock: 10,
		});

		const { productVariations } = await sut.execute({
			productId: product1.id,
		});

		expect(productVariations).toHaveLength(2);
		expect(productVariations.every((v) => v.productId === product1.id)).toBe(
			true,
		);
	});

	it("should return variations with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: "500g",
			dimensions: { width: 10, height: 20 },
			discountPrice: 90,
			price: 100,
			stock: 10,
		});

		const { productVariations } = await sut.execute({
			productId: product.id,
		});

		expect(productVariations).toHaveLength(1);
		const variation = productVariations[0];

		if (variation) {
			expect(variation).toHaveProperty("id");
			expect(variation).toHaveProperty("productId");
			expect(variation).toHaveProperty("size");
			expect(variation).toHaveProperty("color");
			expect(variation).toHaveProperty("weight");
			expect(variation).toHaveProperty("dimensions");
			expect(variation).toHaveProperty("discountPrice");
			expect(variation).toHaveProperty("price");
			expect(variation).toHaveProperty("stock");
			expect(variation).toHaveProperty("createdAt");
			expect(variation).toHaveProperty("updatedAt");
		}
	});

	it("should handle multiple variations with different sizes and colors", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const variations = [
			{
				size: "P",
				color: "Azul",
				price: 90,
				stock: 5,
			},
			{
				size: "M",
				color: "Azul",
				price: 100,
				stock: 8,
			},
			{
				size: "G",
				color: "Vermelho",
				price: 110,
				stock: 12,
			},
			{
				size: "GG",
				color: "Preto",
				price: 120,
				stock: 15,
			},
		];

		for (const variation of variations) {
			await productVariationsRepository.create({
				productId: product.id,
				size: variation.size,
				color: variation.color,
				weight: null,
				dimensions: null,
				discountPrice: null,
				price: variation.price,
				stock: variation.stock,
			});
		}

		const { productVariations } = await sut.execute({
			productId: product.id,
		});

		expect(productVariations).toHaveLength(4);
		expect(productVariations.map((v) => v.size)).toEqual(["P", "M", "G", "GG"]);
		expect(productVariations.map((v) => v.color)).toEqual([
			"Azul",
			"Azul",
			"Vermelho",
			"Preto",
		]);
	});
});
