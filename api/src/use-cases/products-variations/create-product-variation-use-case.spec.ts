import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { InMemoryProductsVariationsRepository } from "~/repositories/in-memory/in-memory-products-variations";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";
import { CreateProductVariationUseCase } from "./create-product-variation-use-case";

describe("CreateProductVariationUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let productVariationsRepository: InMemoryProductsVariationsRepository;
	let sut: CreateProductVariationUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		productVariationsRepository = new InMemoryProductsVariationsRepository(
			productsRepository,
		);
		sut = new CreateProductVariationUseCase(
			productVariationsRepository,
			productsRepository,
		);
	});

	it("should be able to create a new product variation", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao teste",
			categoryId,
			storeId,
		});

		const { productVariation } = await sut.execute({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: "500g",
			dimensions: { width: 10, height: 20 },
			discountPrice: 99,
			price: 150,
			stock: 10,
		});

		expect(productVariation).toBeTruthy();
		expect(productVariation.id).toBeTruthy();
		expect(productVariation.productId).toBe(product.id);
		expect(productVariation.size).toBe("M");
		expect(productVariation.color).toBe("Azul");
		expect(productVariation.price).toBe(150);
		expect(productVariation.stock).toBe(10);
	});

	it("should save product variation in repository", async () => {
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
			size: "G",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 200,
			stock: 5,
		});

		expect(productVariationsRepository.items).toHaveLength(1);
	});

	it("should throw error when product does not exist", async () => {
		await expect(
			sut.execute({
				productId: "non-existent-product-id",
				size: "M",
				color: "Azul",
				weight: null,
				dimensions: null,
				discountPrice: null,
				price: 100,
				stock: 5,
			}),
		).rejects.toBeInstanceOf(ProductNotFoundError);
	});

	it("should create multiple variations for same product", async () => {
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
			size: "P",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 10,
		});

		await sut.execute({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 120,
			stock: 8,
		});

		expect(productVariationsRepository.items).toHaveLength(2);
		const variations = await productVariationsRepository.findByProductId({
			productId: product.id,
		});
		expect(variations).toHaveLength(2);
	});

	it("should create variations with optional fields as null", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { productVariation } = await sut.execute({
			productId: product.id,
			size: "G",
			color: "Preto",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 200,
			stock: 15,
		});

		expect(productVariation.weight).toBeNull();
		expect(productVariation.dimensions).toBeNull();
		expect(productVariation.discountPrice).toBeNull();
		expect(productVariation.price).toBe(200);
		expect(productVariation.stock).toBe(15);
	});

	it("should create variations with all optional fields filled", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const dimensions = { width: 30, height: 40, depth: 15 };

		const { productVariation } = await sut.execute({
			productId: product.id,
			size: "GG",
			color: "Branco",
			weight: "800g",
			dimensions,
			discountPrice: 179,
			price: 250,
			stock: 20,
		});

		expect(productVariation.weight).toBe("800g");
		expect(productVariation.dimensions).toEqual(dimensions);
		expect(productVariation.discountPrice).toBe(179);
		expect(productVariation.price).toBe(250);
	});

	it("should create variations for different products", async () => {
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
			size: "M",
			color: "Azul",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 100,
			stock: 5,
		});

		await sut.execute({
			productId: product2.id,
			size: "P",
			color: "Vermelho",
			weight: null,
			dimensions: null,
			discountPrice: null,
			price: 150,
			stock: 10,
		});

		expect(productVariationsRepository.items).toHaveLength(2);
		expect(productVariationsRepository.items[0]?.productId).toBe(product1.id);
		expect(productVariationsRepository.items[1]?.productId).toBe(product2.id);
	});

	it("should return product variation with all properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const product = await productsRepository.create({
			name: "Produto Teste",
			description: "Descricao",
			categoryId,
			storeId,
		});

		const { productVariation } = await sut.execute({
			productId: product.id,
			size: "M",
			color: "Azul",
			weight: "500g",
			dimensions: { width: 10 },
			discountPrice: 90,
			price: 100,
			stock: 10,
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
});
