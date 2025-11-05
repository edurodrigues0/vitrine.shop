import { and, count, desc, eq, ilike } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import {
	type Product,
	type ProductVariation,
	products,
	productsVariations,
} from "~/database/schema";
import type {
	CreateProductParams,
	FindAllProductsParams,
	ProductsRespository,
	UpdateProductParams,
} from "../products-respository";
import type {
	CreateProductVariationParams,
	UpdateProductVariationParams,
} from "../product-variations";

export class DrizzleProductsRepository implements ProductsRespository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		name,
		description,
		categoryId,
		storeId,
	}: CreateProductParams): Promise<Product> {
		const [product] = await this.drizzle
			.insert(products)
			.values({
				name,
				description,
				categoryId,
				storeId,
			})
			.returning();

		if (!product) {
			throw new Error("Failed to create product");
		}

		return product;
	}

	async findById({ id }: { id: string }): Promise<Product | null> {
		const [product] = await this.drizzle
			.select()
			.from(products)
			.where(eq(products.id, id));

		return product ?? null;
	}

	async findByStoreId({ storeId }: { storeId: string }): Promise<Product[]> {
		const productsResult = await this.drizzle
			.select()
			.from(products)
			.where(eq(products.storeId, storeId))
			.orderBy(desc(products.createdAt));

		return productsResult;
	}

	async findByCategoryId({
		categoryId,
	}: {
		categoryId: string;
	}): Promise<Product[]> {
		const productsResult = await this.drizzle
			.select()
			.from(products)
			.where(eq(products.categoryId, categoryId))
			.orderBy(desc(products.createdAt));

		return productsResult;
	}

	async findAll({ page, limit, filters }: FindAllProductsParams): Promise<{
		products: Product[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const offset = (page - 1) * limit;

		// Construir condições de filtro
		const conditions = [];

		if (filters.name) {
			conditions.push(ilike(products.name, `%${filters.name}%`));
		}

		if (filters.description) {
			conditions.push(ilike(products.description, `%${filters.description}%`));
		}

		if (filters.storeId) {
			conditions.push(eq(products.storeId, filters.storeId));
		}

		// TODO: Implementar filtro por categorySlug quando necessário
		// if (filters.categorySlug) {
		//   // Join com categories table
		// }

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Buscar produtos
		const productsResult = await this.drizzle
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				categoryId: products.categoryId,
				storeId: products.storeId,
				price: products.price,
				quantity: products.quantity,
				createdAt: products.createdAt,
			})
			.from(products)
			.where(whereClause)
			.orderBy(desc(products.createdAt))
			.limit(limit)
			.offset(offset);

		// Contar total de itens
		const [totalResult] = await this.drizzle
			.select({ count: count() })
			.from(products)
			.where(whereClause);

		const totalItems = totalResult?.count ?? 0;
		const totalPages = Math.ceil(totalItems / limit);

		return {
			products: productsResult,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({ id, data }: UpdateProductParams): Promise<Product | null> {
		const updateData: Record<string, unknown> = {};

		// Adicionar campos que podem ser atualizados
		if (data.name !== undefined) updateData.name = data.name;
		if (data.description !== undefined)
			updateData.description = data.description;
		if (data.price !== undefined) updateData.price = data.price;
		if (data.quantity !== undefined) updateData.quantity = data.quantity;

		const [updatedProduct] = await this.drizzle
			.update(products)
			.set(updateData)
			.where(eq(products.id, id))
			.returning();

		return updatedProduct ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(products).where(eq(products.id, id));
	}

	// Product Variation methods
	async createVariation({
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
				weight: weight?.toString(),
				dimensions,
				discountPrice: discountPrice?.toString(),
				price: price?.toString(),
				stock,
			})
			.returning();

		if (!variation) {
			throw new Error("Failed to create product variation");
		}

		return variation;
	}

	async findVariationById({
		id,
	}: {
		id: string;
	}): Promise<ProductVariation | null> {
		const [variation] = await this.drizzle
			.select()
			.from(productsVariations)
			.where(eq(productsVariations.id, id));

		return variation ?? null;
	}

	async findVariationsByProductId({
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

	async updateVariation({
		id,
		data,
	}: UpdateProductVariationParams): Promise<ProductVariation | null> {
		const updateData: Record<string, unknown> = {};

		// Converter números para string para o banco de dados
		if (data.price !== undefined) {
			updateData.price = data.price.toString();
		}
		if (data.discountPrice !== undefined) {
			updateData.discountPrice = data.discountPrice.toString();
		}
		if (data.weight !== undefined) {
			updateData.weight = data.weight.toString();
		}

		// Adicionar outros campos
		if (data.size !== undefined) updateData.size = data.size;
		if (data.color !== undefined) updateData.color = data.color;
		if (data.stock !== undefined) updateData.stock = data.stock;
		if (data.dimensions !== undefined) updateData.dimensions = data.dimensions;

		// Atualizar updatedAt
		updateData.updatedAt = new Date();

		const [updatedVariation] = await this.drizzle
			.update(productsVariations)
			.set(updateData)
			.where(eq(productsVariations.id, id))
			.returning();

		return updatedVariation ?? null;
	}

	async deleteVariation({ id }: { id: string }): Promise<void> {
		await this.drizzle
			.delete(productsVariations)
			.where(eq(productsVariations.id, id));
	}
}
