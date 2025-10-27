import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryCategoriesRepository } from "~/repositories/in-memory/in-memory-categories-repository";
import { InMemoryProductsRepository } from "~/repositories/in-memory/in-memory-products-repository";
import { CreateProductUseCase } from "./create-product";

describe("CreateProductUseCase", () => {
	let categoriesRepository: InMemoryCategoriesRepository;
	let productsRepository: InMemoryProductsRepository;
	let sut: CreateProductUseCase;

	beforeEach(() => {
		categoriesRepository = new InMemoryCategoriesRepository();
		productsRepository = new InMemoryProductsRepository(categoriesRepository);
		sut = new CreateProductUseCase(productsRepository);
	});

	it("should be able to create a new product", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Smartphone XYZ",
			description: "Um smartphone incrivel",
			price: 1999.99,
			stock: 10,
			colors: ["preto", "branco"],
			categoryId,
			storeId,
		});

		expect(product).toBeTruthy();
		expect(product.id).toBeTruthy();
		expect(product.name).toBe("Smartphone XYZ");
		expect(product.storeId).toBe(storeId);
		expect(product.categoryId).toBe(categoryId);
	});

	it("should create product with discount price", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Produto com Desconto",
			description: "Produto em promocao",
			price: 100,
			discountPrice: 80,
			stock: 5,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		expect(product.price).toBe("100");
		expect(product.discountPrice).toBe("80");
	});

	it("should create product with optional fields", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Camiseta",
			description: "Camiseta basica",
			price: 49.9,
			stock: 20,
			colors: ["vermelho", "azul"],
			size: "M",
			weight: 0.2,
			dimensions: { height: 30, width: 40, depth: 2 },
			categoryId,
			storeId,
		});

		expect(product.size).toBe("M");
		expect(product.weight).toBe("0.2");
		expect(product.dimensions).toEqual({ height: 30, width: 40, depth: 2 });
	});

	it("should save product in repository", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await sut.execute({
			name: "Produto Teste",
			description: "Descricao",
			price: 50,
			stock: 1,
			colors: ["verde"],
			categoryId,
			storeId,
		});

		expect(productsRepository.items).toHaveLength(1);
	});

	it("should create product with default stock value", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Produto Sem Estoque",
			description: "Descricao",
			price: 30,
			stock: 0,
			colors: ["preto"],
			categoryId,
			storeId,
		});

		expect(product.stock).toBe(0);
	});

	it("should create multiple products for same store", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await sut.execute({
			name: "Produto 1",
			description: "Desc 1",
			price: 10,
			stock: 5,
			colors: ["azul"],
			categoryId,
			storeId,
		});

		await sut.execute({
			name: "Produto 2",
			description: "Desc 2",
			price: 20,
			stock: 3,
			colors: ["vermelho"],
			categoryId,
			storeId,
		});

		expect(productsRepository.items).toHaveLength(2);
		expect(productsRepository.items[0]?.storeId).toBe(storeId);
		expect(productsRepository.items[1]?.storeId).toBe(storeId);
	});

	it("should create products for different stores", async () => {
		const storeId1 = crypto.randomUUID();
		const storeId2 = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		await sut.execute({
			name: "Produto Loja 1",
			description: "Desc",
			price: 100,
			stock: 5,
			colors: ["azul"],
			categoryId,
			storeId: storeId1,
		});

		await sut.execute({
			name: "Produto Loja 2",
			description: "Desc",
			price: 200,
			stock: 10,
			colors: ["vermelho"],
			categoryId,
			storeId: storeId2,
		});

		expect(productsRepository.items[0]?.storeId).toBe(storeId1);
		expect(productsRepository.items[1]?.storeId).toBe(storeId2);
	});

	it("should create product with multiple colors", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Produto Colorido",
			description: "Varios cores",
			price: 50,
			stock: 10,
			colors: ["vermelho", "azul", "verde", "amarelo"],
			categoryId,
			storeId,
		});

		expect(product.colors).toHaveLength(4);
		expect(product.colors).toContain("vermelho");
		expect(product.colors).toContain("amarelo");
	});

	it("should create product with createdAt timestamp", async () => {
		const storeId = crypto.randomUUID();
		const categoryId = crypto.randomUUID();

		const { product } = await sut.execute({
			name: "Produto",
			description: "Desc",
			price: 10,
			stock: 5,
			colors: ["preto"],
			categoryId,
			storeId,
		});

		expect(product.createdAt).toBeInstanceOf(Date);
	});
});
