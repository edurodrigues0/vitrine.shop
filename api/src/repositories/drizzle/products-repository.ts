import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import {
	type Product,
	type ProductVariation,
	products,
	productsVariations,
	productsImages,
	stores,
	cities,
	addresses,
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
	constructor(private readonly drizzle: typeof DrizzleORM) { }

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
		// Tentar selecionar todos os campos (incluindo price se existir)
		try {
			const [product] = await this.drizzle
				.select()
				.from(products)
				.where(eq(products.id, id));

			return product ?? null;
		} catch (error: any) {
			// Se o erro for relacionado à coluna price não existir, selecionar campos específicos
			if (error?.message?.includes("price") || error?.code === "42703" || error?.cause?.code === "42703") {
				console.warn("⚠️ Coluna 'price' não encontrada em products, buscando sem ela no findById...");
				const [product] = await this.drizzle
					.select({
						id: products.id,
						name: products.name,
						description: products.description,
						categoryId: products.categoryId,
						storeId: products.storeId,
						quantity: products.quantity,
						color: products.color,
						createdAt: products.createdAt,
						price: sql<number | null>`NULL`.as("price"), // Adicionar price como NULL
					})
					.from(products)
					.where(eq(products.id, id));

				return (product ?? null) as Product | null;
			}
			throw error;
		}
	}

	async findByStoreId({ storeId }: { storeId: string }): Promise<Product[]> {
		console.log("💾 Repository: Buscando produtos por storeId:", storeId);
		// Selecionar apenas as colunas básicas que definitivamente existem no banco
		// As colunas opcionais (price, quantity, color) podem não existir, então vamos usar NULL
		const productsResult = await this.drizzle
			.select({
				id: products.id,
				name: products.name,
				description: products.description,
				categoryId: products.categoryId,
				storeId: products.storeId,
				createdAt: products.createdAt,
				// Colunas opcionais - usar NULL se não existirem no banco
				price: sql<number | null>`NULL`.as("price"),
				quantity: sql<number | null>`NULL`.as("quantity"),
				color: sql<string | null>`NULL`.as("color"),
			})
			.from(products)
			.where(eq(products.storeId, storeId))
			.orderBy(desc(products.createdAt));

		console.log(`✅ Repository: ${productsResult.length} produtos encontrados`);
		return productsResult as Product[];
	}

	async findByCategoryId({
		categoryId,
	}: {
		categoryId: string;
	}): Promise<Product[]> {
		// Tentar selecionar todos os campos (incluindo price se existir)
		try {
			const productsResult = await this.drizzle
				.select()
				.from(products)
				.where(eq(products.categoryId, categoryId))
				.orderBy(desc(products.createdAt));

			return productsResult;
		} catch (error: any) {
			// Se o erro for relacionado à coluna price não existir, selecionar campos específicos
			if (error?.message?.includes("price") || error?.code === "42703" || error?.cause?.code === "42703") {
				console.warn("⚠️ Coluna 'price' não encontrada em products, buscando sem ela no findByCategoryId...");
				const productsResult = await this.drizzle
					.select({
						id: products.id,
						name: products.name,
						description: products.description,
						categoryId: products.categoryId,
						storeId: products.storeId,
						quantity: products.quantity,
						color: products.color,
						createdAt: products.createdAt,
						price: sql<number | null>`NULL`.as("price"), // Adicionar price como NULL
					})
					.from(products)
					.where(eq(products.categoryId, categoryId))
					.orderBy(desc(products.createdAt));

				return productsResult as Product[];
			}
			throw error;
		}
	}

	async findAll({ page, limit, filters }: FindAllProductsParams): Promise<{
		products: (Product & { storeSlug: string; citySlug: string; imageUrl?: string | null })[];
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
		// IMPORTANTE: Se a coluna price não existir no banco, ela será NULL
		// Vamos tentar selecionar diretamente - se a coluna não existir, o erro será tratado
		let productsResult;
		try {
			productsResult = await this.drizzle
				.select({
					id: products.id,
					name: products.name,
					description: products.description,
					categoryId: products.categoryId,
					storeId: products.storeId,
					price: products.price,
					quantity: products.quantity,
					color: products.color,
					createdAt: products.createdAt,
					storeSlug: stores.slug,
					citySlug: cities.slug,
					imageUrl: sql<string>`(
						SELECT ${productsImages.url}
						FROM ${productsImages}
						INNER JOIN ${productsVariations} ON ${productsImages.productVariationId} = ${productsVariations.id}
						WHERE ${productsVariations.productId} = ${products.id}
						LIMIT 1
					)`.as("imageUrl"),
				})
				.from(products)
				.innerJoin(stores, eq(products.storeId, stores.id))
				.innerJoin(cities, eq(stores.cityId, cities.id))
				.leftJoin(addresses, and(eq(addresses.storeId, stores.id), eq(addresses.isMain, true)))
				.where(whereClause)
				.orderBy(
					filters.latitude && filters.longitude
						? sql`
							CASE 
								WHEN ${addresses.latitude} IS NULL OR ${addresses.longitude} IS NULL OR 
								     ${addresses.latitude} = '' OR ${addresses.longitude} = ''
								THEN 999999
								ELSE (
									6371 * acos(
										LEAST(1.0, GREATEST(-1.0,
											cos(radians(${filters.latitude})) * 
											cos(radians(CAST(${addresses.latitude} AS float))) * 
											cos(radians(CAST(${addresses.longitude} AS float)) - radians(${filters.longitude})) +
											sin(radians(${filters.latitude})) * 
											sin(radians(CAST(${addresses.latitude} AS float)))
										))
									)
								)
							END ASC,
							${products.createdAt} DESC
						`
						: desc(products.createdAt)
				)
				.limit(limit)
				.offset(offset);
		} catch (error: any) {
			// Se o erro for relacionado à coluna price não existir, tentar sem ela
			if (error?.message?.includes("price") || error?.code === "42703" || error?.cause?.code === "42703") {
				console.warn("⚠️ Coluna 'price' não encontrada em products, buscando sem ela...");
				productsResult = await this.drizzle
					.select({
						id: products.id,
						name: products.name,
						description: products.description,
						categoryId: products.categoryId,
						storeId: products.storeId,
						quantity: products.quantity,
						color: products.color,
						createdAt: products.createdAt,
						storeSlug: stores.slug,
						citySlug: cities.slug,
						price: sql<number | null>`NULL`.as("price"), // Adicionar price como NULL
						imageUrl: sql<string>`(
							SELECT ${productsImages.url}
							FROM ${productsImages}
							INNER JOIN ${productsVariations} ON ${productsImages.productVariationId} = ${productsVariations.id}
							WHERE ${productsVariations.productId} = ${products.id}
							LIMIT 1
						)`.as("imageUrl"),
					})
					.from(products)
					.innerJoin(stores, eq(products.storeId, stores.id))
					.innerJoin(cities, eq(stores.cityId, cities.id))
					.leftJoin(addresses, and(eq(addresses.storeId, stores.id), eq(addresses.isMain, true)))
					.where(whereClause)
					.orderBy(
						filters.latitude && filters.longitude
							? sql`
								CASE 
									WHEN ${addresses.latitude} IS NULL OR ${addresses.longitude} IS NULL OR 
									     ${addresses.latitude} = '' OR ${addresses.longitude} = ''
									THEN 999999
									ELSE (
										6371 * acos(
											LEAST(1.0, GREATEST(-1.0,
												cos(radians(${filters.latitude})) * 
												cos(radians(CAST(${addresses.latitude} AS float))) * 
												cos(radians(CAST(${addresses.longitude} AS float)) - radians(${filters.longitude})) +
												sin(radians(${filters.latitude})) * 
												sin(radians(CAST(${addresses.latitude} AS float)))
											))
										)
									)
								END ASC,
								${products.createdAt} DESC
							`
							: desc(products.createdAt)
					)
					.limit(limit)
					.offset(offset);
			} else {
				throw error;
			}
		}

		const typedProducts = productsResult as unknown as (Product & {
			storeSlug: string;
			citySlug: string;
			imageUrl?: string | null;
		})[];

		// Contar total de itens
		const [totalResult] = await this.drizzle
			.select({ count: count() })
			.from(products)
			.where(whereClause);

		const totalItems = totalResult?.count ?? 0;
		const totalPages = Math.ceil(totalItems / limit);

		return {
			products: typedProducts,
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
		if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
		if (data.color !== undefined) updateData.color = data.color;

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
