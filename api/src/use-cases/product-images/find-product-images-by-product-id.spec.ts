import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductImagesRepository } from "~/repositories/in-memory/in-memory-product-images-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { FindProductImagesByProductVariationIdUseCase } from "./find-product-images-by-product-id";

describe("FindProductImagesByProductVariationIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productImagesRepository: InMemoryProductImagesRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: FindProductImagesByProductVariationIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productImagesRepository = new InMemoryProductImagesRepository();
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new FindProductImagesByProductVariationIdUseCase(
			productImagesRepository,
		);
	});

	it("should be able to find product images by product variation id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao teste",
			categoryId,
			storeId,
		});

		const productVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 10000,
			stock: 10,
		});

		if (!productVariation) {
			throw new Error("Failed to create product variation");
		}

		await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image1.jpg",
		});

		await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image2.jpg",
		});

		const { productImages } = await sut.execute({
			productVariationId: productVariation.id,
		});

		expect(productImages).toHaveLength(2);
		expect(productImages[0]?.productVariationId).toBe(productVariation.id);
		expect(productImages[1]?.productVariationId).toBe(productVariation.id);
	});

	it("should return empty array when product variation has no images", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Sem Imagens",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const productVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 10000,
			stock: 10,
		});

		if (!productVariation) {
			throw new Error("Failed to create product variation");
		}

		const { productImages } = await sut.execute({
			productVariationId: productVariation.id,
		});

		expect(productImages).toHaveLength(0);
	});

	it("should return only images for the specified product variation", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const productVariation1 = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 10000,
			stock: 10,
		});

		const productVariation2 = await productVariationsRepository.create({
			productId: product.id,
			size: "G",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 12000,
			stock: 5,
		});

		if (!productVariation1 || !productVariation2) {
			throw new Error("Failed to create product variations");
		}

		await productImagesRepository.create({
			productVariationId: productVariation1.id,
			url: "https://example.com/variation1-image1.jpg",
		});

		await productImagesRepository.create({
			productVariationId: productVariation1.id,
			url: "https://example.com/variation1-image2.jpg",
		});

		await productImagesRepository.create({
			productVariationId: productVariation2.id,
			url: "https://example.com/variation2-image1.jpg",
		});

		const { productImages } = await sut.execute({
			productVariationId: productVariation1.id,
		});

		expect(productImages).toHaveLength(2);
		expect(
			productImages.every(
				(image) => image.productVariationId === productVariation1.id,
			),
		).toBe(true);
	});

	it("should return images with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const productVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 10000,
			stock: 10,
		});

		if (!productVariation) {
			throw new Error("Failed to create product variation");
		}

		await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image.jpg",
		});

		const { productImages } = await sut.execute({
			productVariationId: productVariation.id,
		});

		expect(productImages).toHaveLength(1);
		const image = productImages[0];

		if (image) {
			expect(image).toHaveProperty("id");
			expect(image).toHaveProperty("productVariationId");
			expect(image).toHaveProperty("url");
			expect(image).toHaveProperty("createdAt");
			expect(image).toHaveProperty("isMain");
		}
	});

	it("should handle multiple images for same product variation", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const productVariation = await productVariationsRepository.create({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 10000,
			stock: 10,
		});

		if (!productVariation) {
			throw new Error("Failed to create product variation");
		}

		const urls = [
			"https://example.com/image1.jpg",
			"https://example.com/image2.jpg",
			"https://example.com/image3.jpg",
			"https://example.com/image4.jpg",
		];

		for (const url of urls) {
			await productImagesRepository.create({
				productVariationId: productVariation.id,
				url,
			});
		}

		const { productImages } = await sut.execute({
			productVariationId: productVariation.id,
		});

		expect(productImages).toHaveLength(4);
		expect(productImages.map((img) => img.url)).toEqual(urls);
	});
});
