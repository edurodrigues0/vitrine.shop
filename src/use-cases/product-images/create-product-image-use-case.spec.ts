import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductImagesRepository } from "~/repositories/in-memory/in-memory-product-images-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";
import { CreateProductImageUseCase } from "./create-product-image-use-case";

describe("CreateProductImageUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productImagesRepository: InMemoryProductImagesRepository;
	let sut: CreateProductImageUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productImagesRepository = new InMemoryProductImagesRepository();
		sut = new CreateProductImageUseCase(
			productImagesRepository,
			productsRepository,
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

		const { productImage } = await sut.execute({
			productId: product.id,
			url: "https://example.com/image.jpg",
		});

		expect(productImage).toBeTruthy();
		expect(productImage.id).toBeTruthy();
		expect(productImage.productId).toBe(product.id);
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

		await sut.execute({
			productId: product.id,
			url: "https://example.com/image1.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(1);
	});

	it("should throw error when product does not exist", async () => {
		await expect(
			sut.execute({
				productId: "non-existent-product-id",
				url: "https://example.com/image.jpg",
			}),
		).rejects.toBeInstanceOf(ProductNotFoundError);
	});

	it("should create multiple images for same product", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		await sut.execute({
			productId: product.id,
			url: "https://example.com/image1.jpg",
		});

		await sut.execute({
			productId: product.id,
			url: "https://example.com/image2.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(2);
		const images = await productImagesRepository.findProductImagesByProductId({
			productId: product.id,
		});
		expect(images).toHaveLength(2);
	});

	it("should create images for different products", async () => {
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
			productId: product1.id,
			url: "https://example.com/product1.jpg",
		});

		await sut.execute({
			productId: product2.id,
			url: "https://example.com/product2.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(2);
		expect(productImagesRepository.items[0]?.productId).toBe(product1.id);
		expect(productImagesRepository.items[1]?.productId).toBe(product2.id);
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

		const { productImage } = await sut.execute({
			productId: product.id,
			url: "https://example.com/image.jpg",
		});

		expect(productImage).toHaveProperty("id");
		expect(productImage).toHaveProperty("productId");
		expect(productImage).toHaveProperty("url");
		expect(productImage).toHaveProperty("createdAt");
	});
});
