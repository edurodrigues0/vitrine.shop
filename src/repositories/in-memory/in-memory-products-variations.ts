import type { ProductVariation } from "~/database/schema";
import type {
	CreateProductVariationParams,
	ProductVariationsRepository,
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
	}: CreateProductVariationParams): Promise<ProductVariation> {
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
}
