import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductImagesRepository } from "~/repositories/in-memory/in-memory-product-images-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductImageNotFoundError } from "../@errors/product-images/product-image-not-found-error";
import { DeleteProductImageUseCase } from "./delete-product-image-use-cae";

describe("DeleteProductImageUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productImagesRepository: InMemoryProductImagesRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: DeleteProductImageUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productImagesRepository = new InMemoryProductImagesRepository();
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new DeleteProductImageUseCase(productImagesRepository);
	});

	it("should be able to delete a product image", async () => {
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

		const createdImage = await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image.jpg",
		});

		expect(createdImage).not.toBeNull();

		await sut.execute({ id: createdImage!.id });

		const deletedImage = await productImagesRepository.findById({
			id: createdImage!.id,
		});

		expect(deletedImage).toBeNull();
	});

	it("should throw error when product image is not found", async () => {
		await expect(sut.execute({ id: "non-existent-id" })).rejects.toBeInstanceOf(
			ProductImageNotFoundError,
		);
	});

	it("should delete only the specified product image", async () => {
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

		const image1 = await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image1.jpg",
		});

		const image2 = await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image2.jpg",
		});

		expect(image1).not.toBeNull();
		expect(image2).not.toBeNull();

		await sut.execute({ id: image1!.id });

		const deletedImage = await productImagesRepository.findById({
			id: image1!.id,
		});
		const remainingImage = await productImagesRepository.findById({
			id: image2!.id,
		});

		expect(deletedImage).toBeNull();
		expect(remainingImage).toBeTruthy();
		expect(remainingImage?.url).toBe("https://example.com/image2.jpg");
	});

	it("should remove product image from repository items", async () => {
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

		const createdImage = await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image.jpg",
		});

		expect(productImagesRepository.items).toHaveLength(1);

		expect(createdImage).not.toBeNull();

		await sut.execute({ id: createdImage!.id });

		expect(productImagesRepository.items).toHaveLength(0);
	});

	it("should delete product image from specific product variation", async () => {
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

		const productVariation1 = await productVariationsRepository.create({
			productId: product1.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 10000,
			stock: 10,
		});

		const productVariation2 = await productVariationsRepository.create({
			productId: product2.id,
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

		const image1 = await productImagesRepository.create({
			productVariationId: productVariation1.id,
			url: "https://example.com/product1-image.jpg",
		});

		await productImagesRepository.create({
			productVariationId: productVariation2.id,
			url: "https://example.com/product2-image.jpg",
		});

		expect(image1).not.toBeNull();

		await sut.execute({ id: image1!.id });

		const imagesProduct1 =
			await productImagesRepository.findProductImagesByProductId({
				productVariationId: productVariation1.id,
			});
		const imagesProduct2 =
			await productImagesRepository.findProductImagesByProductId({
				productVariationId: productVariation2.id,
			});

		expect(imagesProduct1).toHaveLength(0);
		expect(imagesProduct2).toHaveLength(1);
		expect(imagesProduct2[0]?.url).toBe(
			"https://example.com/product2-image.jpg",
		);
	});

	it("should handle deletion when multiple images exist for same product variation", async () => {
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

		const image1 = await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image1.jpg",
		});

		await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image2.jpg",
		});

		await productImagesRepository.create({
			productVariationId: productVariation.id,
			url: "https://example.com/image3.jpg",
		});

		expect(image1).not.toBeNull();

		await sut.execute({ id: image1!.id });

		const remainingImages =
			await productImagesRepository.findProductImagesByProductId({
				productVariationId: productVariation.id,
			});

		expect(remainingImages).toHaveLength(2);
		expect(remainingImages.every((img) => img.id !== image1!.id)).toBe(true);
	});
});
