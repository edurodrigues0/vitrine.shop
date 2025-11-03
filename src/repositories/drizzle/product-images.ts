import { desc, eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type ProductImage, productsImages } from "~/database/schema";
import type {
	CreateProductImageParams,
	ProductImagesRepository,
	UpdateProductImageParams,
} from "../product-images-repository";

export class DrizzleProductImagesRepository implements ProductImagesRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		productVariationId,
		url,
	}: CreateProductImageParams): Promise<ProductImage | null> {
		const [image] = await this.drizzle
			.insert(productsImages)
			.values({
				productVariationId,
				url,
			})
			.returning();

		if (!image) {
			throw new Error("Failed to create product image");
		}

		return image;
	}

	async findById({ id }: { id: string }): Promise<ProductImage | null> {
		const [image] = await this.drizzle
			.select()
			.from(productsImages)
			.where(eq(productsImages.id, id));

		return image ?? null;
	}

	async findProductImagesByProductId({
		productVariationId,
	}: {
		productVariationId: string;
	}): Promise<ProductImage[]> {
		const images = await this.drizzle
			.select()
			.from(productsImages)
			.where(eq(productsImages.productVariationId, productVariationId))
			.orderBy(desc(productsImages.createdAt));

		return images;
	}

	async update({
		id,
		data,
	}: UpdateProductImageParams): Promise<ProductImage | null> {
		const [image] = await this.drizzle
			.update(productsImages)
			.set(data)
			.where(eq(productsImages.id, id))
			.returning();

		if (!image) {
			throw new Error("Failed to update product image");
		}

		return image;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(productsImages).where(eq(productsImages.id, id));
	}
}
