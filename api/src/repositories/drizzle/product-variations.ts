import { desc, eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type ProductVariation, productsVariations } from "~/database/schema";
import type {
	CreateProductVariationParams,
	ProductVariationsRepository,
	UpdateProductVariationParams,
} from "../product-variations";

export class DrizzleProductVariationsRepository
	implements ProductVariationsRepository
{
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		productId,
		size,
		color,
		weight,
		dimensions,
		discountPrice,
		price,
		stock,
	}: CreateProductVariationParams): Promise<ProductVariation> {
		const [variation] = await this.drizzle
			.insert(productsVariations)
			.values({
				productId,
				size,
				color,
				weight,
				dimensions,
				discountPrice,
				price,
				stock,
			})
			.returning();

		if (!variation) {
			throw new Error("Failed to create product variation");
		}

		return variation;
	}

	async findById({ id }: { id: string }): Promise<ProductVariation | null> {
		const [variation] = await this.drizzle
			.select()
			.from(productsVariations)
			.where(eq(productsVariations.id, id))
			.limit(1);

		return variation ?? null;
	}

	async findByProductId({
		productId,
	}: {
		productId: string;
	}): Promise<ProductVariation[]> {
		const variations = await this.drizzle
			.select()
			.from(productsVariations)
			.where(eq(productsVariations.productId, productId))
			.orderBy(desc(productsVariations.createdAt));

		return variations;
	}

	async update({
		id,
		data,
	}: UpdateProductVariationParams): Promise<ProductVariation | null> {
		const [variation] = await this.drizzle
			.update(productsVariations)
			.set(data)
			.where(eq(productsVariations.id, id))
			.returning();

		if (!variation) {
			throw new Error("Failed to update product variation");
		}

		return variation;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle
			.delete(productsVariations)
			.where(eq(productsVariations.id, id));
	}
}
