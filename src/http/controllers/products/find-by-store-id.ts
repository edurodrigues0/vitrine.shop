import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindProductsByStoreIdUseCase } from "~/use-cases/@factories/products/make-find-products-by-store-id-use-case";

const findProductsByStoreIdParamsSchema = z.object({
	storeId: z.string().uuid("ID da loja deve ser um UUID válido"),
});

export async function findProductsByStoreIdController(
	request: Request,
	response: Response,
) {
	try {
		const { storeId } = findProductsByStoreIdParamsSchema.parse(request.params);

		const findProductsByStoreIdUseCase = makeFindProductsByStoreIdUseCase();

		const { products } = await findProductsByStoreIdUseCase.execute({
			storeId,
		});

		return response.status(200).json({
			products: products.map((product) => ({
				id: product.id,
				name: product.name,
				description: product.description,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			})),
		});
	} catch (error) {
		console.error("Error finding products by store ID:", error);

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
