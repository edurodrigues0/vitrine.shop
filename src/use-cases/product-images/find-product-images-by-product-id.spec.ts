import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductImagesRepository } from "~/repositories/in-memory/in-memory-product-images-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { FindProductImagesByProductIdUseCase } from "./find-product-images-by-product-id";

describe("FindProductImagesByProductIdUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productImagesRepository: InMemoryProductImagesRepository;
	let sut: FindProductImagesByProductIdUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productImagesRepository = new InMemoryProductImagesRepository();
		sut = new FindProductImagesByProductIdUseCase(productImagesRepository);
	});

	it("should be able to find product images by product id", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao teste",
			categoryId,
			storeId,
		});

		await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image1.jpg",
		});

		await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image2.jpg",
		});

		const { productImages } = await sut.execute({
			productId: product.id,
		});

		expect(productImages).toHaveLength(2);
		expect(productImages[0]?.productId).toBe(product.id);
		expect(productImages[1]?.productId).toBe(product.id);
	});

	it("should return empty array when product has no images", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Sem Imagens",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { productImages } = await sut.execute({
			productId: product.id,
		});

		expect(productImages).toHaveLength(0);
	});

	it("should return only images for the specified product", async () => {
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

		await productImagesRepository.create({
			productId: product1.id,
			url: "https://example.com/product1-image1.jpg",
		});

		await productImagesRepository.create({
			productId: product1.id,
			url: "https://example.com/product1-image2.jpg",
		});

		await productImagesRepository.create({
			productId: product2.id,
			url: "https://example.com/product2-image1.jpg",
		});

		const { productImages } = await sut.execute({
			productId: product1.id,
		});

		expect(productImages).toHaveLength(2);
		expect(
			productImages.every((image) => image.productId === product1.id),
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

		await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image.jpg",
		});

		const { productImages } = await sut.execute({
			productId: product.id,
		});

		expect(productImages).toHaveLength(1);
		const image = productImages[0];

		if (image) {
			expect(image).toHaveProperty("id");
			expect(image).toHaveProperty("productId");
			expect(image).toHaveProperty("url");
			expect(image).toHaveProperty("createdAt");
		}
	});

	it("should handle multiple images for same product", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const urls = [
			"https://example.com/image1.jpg",
			"https://example.com/image2.jpg",
			"https://example.com/image3.jpg",
			"https://example.com/image4.jpg",
		];

		for (const url of urls) {
			await productImagesRepository.create({
				productId: product.id,
				url,
			});
		}

		const { productImages } = await sut.execute({
			productId: product.id,
		});

		expect(productImages).toHaveLength(4);
		expect(productImages.map((img) => img.url)).toEqual(urls);
	});
});
