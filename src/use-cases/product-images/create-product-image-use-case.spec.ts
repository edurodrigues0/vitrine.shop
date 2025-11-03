import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductImagesRepository } from "~/repositories/in-memory/in-memory-product-images-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { CreateProductImageUseCase } from "./create-product-image-use-case";

describe("CreateProductImageUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productImagesRepository: InMemoryProductImagesRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: CreateProductImageUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productImagesRepository = new InMemoryProductImagesRepository();
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);

		sut = new CreateProductImageUseCase(
			productImagesRepository,
			productVariationsRepository,
		);
	});

	it("should be able to create a new product image", async () => {
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

		const { productImage } = await sut.execute({
			productVariationId: productVariation.id,
			url: "https://example.com/image.jpg",
		});

		expect(productImage).toBeTruthy();
		expect(productImage.id).toBeTruthy();
		expect(productImage.productVariationId).toBe(productVariation.id);
		expect(productImage.url).toBe("https://example.com/image.jpg");
	});

	it("should save product image in repository", async () => {
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

		await sut.execute({
			productVariationId: productVariation.id,
			url: "https://example.com/image1.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(1);
	});

	it("should throw error when product variation does not exist", async () => {
		await expect(
			sut.execute({
				productVariationId: "non-existent-variation-id",
				url: "https://example.com/image.jpg",
			}),
		).rejects.toBeInstanceOf(ProductVariationNotFoundError);
	});

	it("should create multiple images for same product variation", async () => {
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

		await sut.execute({
			productVariationId: productVariation.id,
			url: "https://example.com/image1.jpg",
		});

		await sut.execute({
			productVariationId: productVariation.id,
			url: "https://example.com/image2.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(2);
		const images = await productImagesRepository.findProductImagesByProductId({
			productVariationId: productVariation.id,
		});
		expect(images).toHaveLength(2);
	});

	it("should create images for different product variations", async () => {
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

		await sut.execute({
			productVariationId: productVariation1.id,
			url: "https://example.com/variation1.jpg",
		});

		await sut.execute({
			productVariationId: productVariation2.id,
			url: "https://example.com/variation2.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(2);
		expect(productImagesRepository.items[0]?.productVariationId).toBe(
			productVariation1.id,
		);
		expect(productImagesRepository.items[1]?.productVariationId).toBe(
			productVariation2.id,
		);
	});

	it("should return product image with all properties", async () => {
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

		const { productImage } = await sut.execute({
			productVariationId: productVariation.id,
			url: "https://example.com/image.jpg",
		});

		expect(productImage).toHaveProperty("id");
		expect(productImage).toHaveProperty("productVariationId");
		expect(productImage).toHaveProperty("url");
		expect(productImage).toHaveProperty("createdAt");
		expect(productImage).toHaveProperty("isMain");
	});
});
