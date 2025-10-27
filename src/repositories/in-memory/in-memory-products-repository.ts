import type { Pagination } from "~/@types/pagination";
import type { Product } from "~/database/schema";
import type { CategoriesRespository } from "../categories-repository";
import type {
	CreateProductParams,
	FindAllProductsParams,
	ProductsRespository,
	UpdateProductParams,
} from "../products-respository";

export class InMemoryProductsRepository implements ProductsRespository {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}
	public items: Product[] = [];

	async create({
		name,
		description,
		price,
		discountPrice,
		stock,
		colors,
		size,
		weight,
		dimensions,
		categoryId,
		storeId,
	}: CreateProductParams): Promise<Product> {
		const id = crypto.randomUUID();

		const product: Product = {
			id,
			name,
			description,
			price: price.toString(),
			discountPrice: discountPrice?.toString() ?? null,
			stock,
			colors: colors ?? null,
			size: size ?? null,
			weight: weight?.toString() ?? null,
			dimensions: dimensions ?? null,
			categoryId,
			storeId,
			createdAt: new Date(),
		};

		this.items.push(product);
		return product;
	}

	async findById({ id }: { id: string }): Promise<Product | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByStoreId({ storeId }: { storeId: string }): Promise<Product[]> {
		return this.items.filter((item) => item.storeId === storeId);
	}

	async findByCategoryId({
		categoryId,
	}: {
		categoryId: string;
	}): Promise<Product[]> {
		return this.items.filter((item) => item.categoryId === categoryId);
	}

	async findAll({ page, limit, filters }: FindAllProductsParams): Promise<{
		products: Product[];
		pagination: Pagination;
	}> {
		let products = this.items;
		const { name, description, size, categorySlug, stock, weight, dimensions } =
			filters;

		if (name) {
			products = products.filter((item) =>
				item.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		if (description) {
			products = products.filter((item) =>
				item.description?.toLowerCase().includes(description.toLowerCase()),
			);
		}

		if (categorySlug) {
			const category = await this.categoriesRepository.findBySlug({
				slug: categorySlug,
			});
			products = products.filter((item) => item.categoryId === category?.id);
		}

		if (stock) {
			products = products.filter((item) => item.stock >= stock);
		}

		if (weight) {
			products = products.filter(
				(item) => item.weight?.toString() === weight.toString(),
			);
		}
		if (dimensions) {
			products = products.filter(
				(item) => item.dimensions?.toString() === dimensions.toString(),
			);
		}

		if (size) {
			products = products.filter((item) => item.size === size);
		}

		const totalItems = products.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedProducts = products.slice((page - 1) * limit, page * limit);

		return {
			products: paginatedProducts,
			pagination: {
				totalItems,
				totalPages,
				perPage: limit,
				currentPage: page,
			},
		};
	}

	async update({ id, data }: UpdateProductParams): Promise<Product | null> {
		const productIndex = this.items.findIndex((item) => item.id === id);

		if (productIndex < 0) {
			return null;
		}

		const currentProduct = this.items[productIndex];

		if (!currentProduct) {
			return null;
		}

		const updatedProduct: Product = {
			...currentProduct,
			name: data.name ?? currentProduct.name,
			description: data.description ?? currentProduct.description,
			price: data.price ? data.price.toString() : currentProduct.price,
		};

		this.items[productIndex] = updatedProduct;
		return updatedProduct;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const productIndex = this.items.findIndex((item) => item.id === id);
		if (productIndex >= 0) {
			this.items.splice(productIndex, 1);
		}
	}
}
