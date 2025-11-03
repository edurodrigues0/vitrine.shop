import type { ProductVariation } from "~/database/schema";
import type {
	CreateProductVariationParams,
	ProductVariationsRepository,
	UpdateProductVariationParams,
} from "../product-variations";
import type { InMemoryProductsRepository } from "./in-memory-products-repository";

export class InMemoryProductsVariationsRepository
	implements ProductVariationsRepository
{
	constructor(
		private readonly productsRepository: InMemoryProductsRepository,
	) {}

	public items: ProductVariation[] = [];

	async create({
		productId,
		color,
		size,
		stock,
		dimensions,
		discountPrice,
		price,
		weight,
	}: CreateProductVariationParams): Promise<ProductVariation | null> {
		const existingProduct = this.productsRepository.findById({ id: productId });

		if (!existingProduct) {
			return null;
		}

		const id = crypto.randomUUID();
		const createdAt = new Date();
		const updatedAt = new Date();

		const productVariation: ProductVariation = {
			id,
			productId,
			color,
			size,
			stock,
			weight,
			dimensions,
			discountPrice,
			price,
			createdAt,
			updatedAt,
		};

		this.items.push(productVariation);

		return productVariation;
	}

	async findById({ id }: { id: string }): Promise<ProductVariation | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByProductId({
		productId,
	}: {
		productId: string;
	}): Promise<ProductVariation[]> {
		const productVariations = this.items.filter(
			(item) => item.productId === productId,
		);

		return productVariations;
	}

	async update({
		id,
		data,
	}: UpdateProductVariationParams): Promise<ProductVariation | null> {
		const productVariationIndex = this.items.findIndex(
			(item) => item.id === id,
		);

		if (productVariationIndex < 0) {
			return null;
		}

		const currentProductVariation = this.items[productVariationIndex];

		if (!currentProductVariation) {
			return null;
		}

		const updatedProductVariation: ProductVariation = {
			...currentProductVariation,
			...data,
			updatedAt: new Date(),
		};

		this.items[productVariationIndex] = updatedProductVariation;

		return updatedProductVariation;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const productVariationIndex = this.items.findIndex(
			(item) => item.id === id,
		);

		if (productVariationIndex >= 0) {
			this.items.splice(productVariationIndex, 1);
		}
	}
}
