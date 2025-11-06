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
		// Converter preços de reais para centavos (integer)
		const priceInCents = Math.round(price * 100);
		const discountPriceInCents = discountPrice
			? Math.round(discountPrice * 100)
			: null;

		const [variation] = await this.drizzle
			.insert(productsVariations)
			.values({
				productId,
				size,
				color,
				weight: weight ?? null,
				dimensions: dimensions ?? null,
				discountPrice: discountPriceInCents,
				price: priceInCents,
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
		const updateData: Record<string, unknown> = {};

		// Converter preços de reais para centavos se fornecidos
		if (data.price !== undefined) {
			updateData.price = Math.round(data.price * 100);
		}
		if (data.discountPrice !== undefined) {
			updateData.discountPrice = data.discountPrice
				? Math.round(data.discountPrice * 100)
				: null;
		}

		// Adicionar outros campos
		if (data.size !== undefined) updateData.size = data.size;
		if (data.color !== undefined) updateData.color = data.color;
		if (data.weight !== undefined) updateData.weight = data.weight ?? null;
		if (data.dimensions !== undefined)
			updateData.dimensions = data.dimensions ?? null;
		if (data.stock !== undefined) updateData.stock = data.stock;

		// Atualizar updatedAt
		updateData.updatedAt = new Date();

		const [variation] = await this.drizzle
			.update(productsVariations)
			.set(updateData)
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
