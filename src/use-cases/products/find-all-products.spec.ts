import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { FindAllProductsUseCase } from "./find-all-products";

describe("FindAllProductsUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: FindAllProductsUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new FindAllProductsUseCase(productsRepository);
	});

	it("should be able to find all products", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto 1",
			description: "Desc 1",
			price: 100,
			stock: 10,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "Produto 2",
			description: "Desc 2",
			price: 200,
			stock: 20,
			colors: ["vermelho"],
			categoryId,
			storeId,
		});

		const { products, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(products).toHaveLength(2);
		expect(pagination.totalItems).toBe(2);
		expect(pagination.currentPage).toBe(1);
	});

	it("should filter products by name", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Smartphone Samsung",
			description: "Desc",
			price: 1000,
			stock: 5,
			colors: ["preto"],
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "iPhone Apple",
			description: "Desc",
			price: 5000,
			stock: 3,
			colors: ["branco"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "samsung" },
		});

		expect(products).toHaveLength(1);
		expect(products[0]?.name).toBe("Smartphone Samsung");
	});

	it("should filter products by description", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto 1",
			description: "Produto com garantia estendida",
			price: 100,
			stock: 10,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "Produto 2",
			description: "Produto sem garantia",
			price: 50,
			stock: 20,
			colors: ["vermelho"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { description: "estendida" },
		});

		expect(products).toHaveLength(1);
		expect(products[0]?.description).toContain("estendida");
	});

	it("should filter products by categorySlug", async () => {
		const storeId = crypto.randomUUID();

		const { category: category1 } = await categoriesRepository.create({
			name: "Eletronicos",
			slug: "eletronicos",
		});

		const { category: category2 } = await categoriesRepository.create({
			name: "Roupas",
			slug: "roupas",
		});

		await productsRepository.create({
			name: "Produto Eletronicos",
			description: "Desc",
			price: 100,
			stock: 10,
			colors: ["azul"],
			categoryId: category1.id,
			storeId,
		});

		await productsRepository.create({
			name: "Produto Roupas",
			description: "Desc",
			price: 200,
			stock: 20,
			colors: ["vermelho"],
			categoryId: category2.id,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { categorySlug: "eletronicos" },
		});

		expect(products).toHaveLength(1);
		expect(products[0]?.categoryId).toBe(category1.id);
		expect(products[0]?.name).toBe("Produto Eletronicos");
	});

	it("should filter products by size", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Camiseta P",
			description: "Desc",
			price: 50,
			stock: 10,
			colors: ["azul"],
			size: "P",
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "Camiseta M",
			description: "Desc",
			price: 50,
			stock: 15,
			colors: ["vermelho"],
			size: "M",
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { size: "M" },
		});

		expect(products).toHaveLength(1);
		expect(products[0]?.size).toBe("M");
	});

	it("should filter products by stock", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto Pouco Estoque",
			description: "Desc",
			price: 50,
			stock: 5,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		await productsRepository.create({
			name: "Produto Muito Estoque",
			description: "Desc",
			price: 50,
			stock: 50,
			colors: ["vermelho"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { stock: 20 },
		});

		expect(products).toHaveLength(1);
		expect(products[0]?.name).toBe("Produto Muito Estoque");
		expect(products[0]?.stock).toBeGreaterThanOrEqual(20);
	});

	it("should paginate results correctly", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		for (let i = 1; i <= 15; i++) {
			await productsRepository.create({
				name: `Produto ${i}`,
				description: `Desc ${i}`,
				price: i * 10,
				stock: i,
				colors: ["azul"],
				categoryId,
				storeId,
			});
		}

		const { products: page1, pagination: pagination1 } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		const { products: page2, pagination: pagination2 } = await sut.execute({
			page: 2,
			limit: 10,
			filters: {},
		});

		expect(page1).toHaveLength(10);
		expect(page2).toHaveLength(5);
		expect(pagination1.totalPages).toBe(2);
		expect(pagination2.currentPage).toBe(2);
	});

	it("should return empty array when no products exist", async () => {
		const { products, pagination } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(products).toHaveLength(0);
		expect(pagination.totalItems).toBe(0);
	});

	it("should handle case-insensitive filters", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "PRODUTO MAIUSCULO",
			description: "Descricao",
			price: 100,
			stock: 10,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: { name: "produto" },
		});

		expect(products).toHaveLength(1);
		expect(products[0]?.name).toBe("PRODUTO MAIUSCULO");
	});

	it("should return products with all correct properties", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await productsRepository.create({
			name: "Produto Teste",
			description: "Desc teste",
			price: 99.99,
			stock: 10,
			colors: ["preto"],
			categoryId,
			storeId,
		});

		const { products } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {},
		});

		expect(products[0]).toHaveProperty("id");
		expect(products[0]).toHaveProperty("name");
		expect(products[0]).toHaveProperty("description");
		expect(products[0]).toHaveProperty("price");
		expect(products[0]).toHaveProperty("stock");
		expect(products[0]).toHaveProperty("categoryId");
		expect(products[0]).toHaveProperty("storeId");
	});
});
