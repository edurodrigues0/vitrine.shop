import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllProductsUseCase } from "~/use-cases/@factories/products/make-find-all-products-use-case";

const findAllProductsQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	description: z.string().optional(),
	categorySlug: z.string().optional(),
	size: z.string().optional(),
	stock: z.coerce.number().int().min(0).optional(),
	weight: z.coerce.number().positive().optional(),
});

export async function findAllProductsController(
	request: Request,
	response: Response,
) {
	try {
		const {
			page,
			limit,
			name,
			description,
			categorySlug,
			size,
			stock,
			weight,
		} = findAllProductsQuerySchema.parse(request.query);

		const findAllProductsUseCase = makeFindAllProductsUseCase();

		const { products, pagination } = await findAllProductsUseCase.execute({
			page,
			limit,
			filters: {
				name,
				description,
				categorySlug,
				size,
				stock,
				weight,
			},
		});

		return response.status(200).json({
			products: products.map((product) => ({
				id: product.id,
				name: product.name,
				description: product.description,
				price: product.price,
				discountPrice: product.discountPrice,
				stock: product.stock,
				colors: product.colors,
				size: product.size,
				weight: product.weight,
				dimensions: product.dimensions,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			})),
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding all products:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
