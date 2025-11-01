import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeDeleteProductVariationUseCase } from "~/use-cases/@factories/product-variations/make-delete-product-variation-use-case";

const deleteProductVariationParamsSchema = z.object({
	id: z.uuid("Valid product variation ID is required"),
});

export async function deleteProductVariationController(
	request: Request,
	response: Response,
) {
	const { id } = deleteProductVariationParamsSchema.parse(request.params);

	try {
		const deleteProductVariationUseCase = makeDeleteProductVariationUseCase();

		await deleteProductVariationUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting product variation:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductVariationNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
