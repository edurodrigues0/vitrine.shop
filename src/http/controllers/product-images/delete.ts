import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductImageNotFoundError } from "~/use-cases/@errors/product-images/product-image-not-found-error";
import { makeDeleteProductImageUseCase } from "~/use-cases/@factories/product-images/make-delete-product-image-use-case";

const deleteProductImageParamsSchema = z.object({
	id: z.uuid("Valid product image ID is required"),
});

export async function deleteProductImageController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = deleteProductImageParamsSchema.parse(request.params);

		const deleteProductImageUseCase = makeDeleteProductImageUseCase();

		await deleteProductImageUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting product image:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductImageNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
