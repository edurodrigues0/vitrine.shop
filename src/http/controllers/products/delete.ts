import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeDeleteProductUseCase } from "~/use-cases/@factories/products/make-delete-product-use-case";

export async function deleteProductController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID do produto é obrigatório",
			});
		}

		if (!request.user) {
			return response.status(401).json({
				message: "Usuário não autenticado",
			});
		}

		const deleteProductUseCase = makeDeleteProductUseCase();

		await deleteProductUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting product:", error);

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
