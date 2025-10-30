import type { Request, Response } from "express";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeFindProductByIdUseCase } from "~/use-cases/@factories/products/make-find-product-by-id-use-case";

export async function findProductByIdController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID do produto é obrigatório",
			});
		}

		const findProductByIdUseCase = makeFindProductByIdUseCase();

		const { product } = await findProductByIdUseCase.execute({ id });

		if (!product) {
			return response.status(404).json({
				message: "Produto não encontrado",
			});
		}

		return response.status(200).json({
			product: {
				id: product.id,
				name: product.name,
				description: product.description,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			},
		});
	} catch (error) {
		console.error("Error finding product by ID:", error);

		if (error instanceof ProductNotFoundError) {
			return response.status(404).json({
				message: "Produto não encontrado",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
