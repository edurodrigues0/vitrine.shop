import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductImagesRepository } from "~/repositories/in-memory/in-memory-product-images-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { ProductImageNotFoundError } from "../@errors/product-images/product-image-not-found-error";
import { UpdateProductImageUseCase } from "./update-product-image-use-case";

describe("UpdateProductImageUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productImagesRepository: InMemoryProductImagesRepository;
	let sut: UpdateProductImageUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productImagesRepository = new InMemoryProductImagesRepository();
		sut = new UpdateProductImageUseCase(productImagesRepository);
	});

	it("should be able to update product image url", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const createdImage = await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/old-image.jpg",
		});

		expect(createdImage).not.toBeNull();

		const { productImage } = await sut.execute({
			id: createdImage!.id,
			data: {
				url: "https://example.com/new-image.jpg",
			},
		});

		expect(productImage?.url).toBe("https://example.com/new-image.jpg");
		expect(productImage?.productId).toBe(product.id);
	});

	it("should throw error when product image is not found", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				data: { url: "https://example.com/image.jpg" },
			}),
		).rejects.toBeInstanceOf(ProductImageNotFoundError);
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

		const createdImage = await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image.jpg",
		});

		expect(createdImage).not.toBeNull();

		const { productImage } = await sut.execute({
			id: createdImage!.id,
			data: {
				url: "https://example.com/updated-image.jpg",
			},
		});

		expect(productImage?.productId).toBe(product.id);
	});

	it("should update only the specified product image", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		expect(product).not.toBeNull();

		const image1 = await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image1.jpg",
		});

		expect(image1).not.toBeNull();

		const image2 = await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image2.jpg",
		});

		expect(image2).not.toBeNull();

		await sut.execute({
			id: image1!.id,
			data: {
				url: "https://example.com/image1-updated.jpg",
			},
		});

		const updatedImage1 = await productImagesRepository.findById({
			id: image1!.id,
		});
		const unchangedImage2 = await productImagesRepository.findById({
			id: image2!.id,
		});

		expect(updatedImage1?.url).toBe("https://example.com/image1-updated.jpg");
		expect(unchangedImage2?.url).toBe("https://example.com/image2.jpg");
	});

	it("should preserve product image id after update", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const createdImage = await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image.jpg",
		});

		expect(createdImage).not.toBeNull();

		const { productImage } = await sut.execute({
			id: createdImage!.id,
			data: {
				url: "https://example.com/updated-image.jpg",
			},
		});

		expect(productImage?.id).toBe(createdImage!.id);
	});

	it("should preserve createdAt after update", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const createdImage = await productImagesRepository.create({
			productId: product.id,
			url: "https://example.com/image.jpg",
		});

		const { productImage } = await sut.execute({
			id: createdImage!.id,
			data: {
				url: "https://example.com/updated-image.jpg",
			},
		});

		expect(productImage?.createdAt).toEqual(createdImage!.createdAt);
	});

	it("should update images from different products independently", async () => {
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

		expect(product1).not.toBeNull();
		expect(product2).not.toBeNull();

		const image1 = await productImagesRepository.create({
			productId: product1.id,
			url: "https://example.com/product1-image.jpg",
		});

		expect(image1).not.toBeNull();

		const image2 = await productImagesRepository.create({
			productId: product2.id,
			url: "https://example.com/product2-image.jpg",
		});

		expect(image2).not.toBeNull();

		const { productImage } = await sut.execute({
			id: image1!.id,
			data: {
				url: "https://example.com/product1-image-updated.jpg",
			},
		});

		const updatedImage1 = await productImagesRepository.findById({
			id: image1!.id,
		});
		const unchangedImage2 = await productImagesRepository.findById({
			id: image2!.id,
		});

		expect(updatedImage1?.url).toBe(
			"https://example.com/product1-image-updated.jpg",
		);
		expect(unchangedImage2?.url).toBe("https://example.com/product2-image.jpg");
	});
});
