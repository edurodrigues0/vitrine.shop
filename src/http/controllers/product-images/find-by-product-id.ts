import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindProductImagesByProductVariationIdUseCase } from "~/use-cases/@factories/product-images/make-find-product-images-by-product-variation-id-use-case";

const findProductImagesByProductVariationIdParamsSchema = z.object({
	productVariationId: z.uuid("Valid product variation ID is required"),
});

export async function findProductImagesByProductVariationIdController(
	request: Request,
	response: Response,
) {
	try {
		const { productVariationId } =
			findProductImagesByProductVariationIdParamsSchema.parse(request.params);

		const findProductImagesByProductVariationIdUseCase =
			makeFindProductImagesByProductVariationIdUseCase();

		const { productImages } =
			await findProductImagesByProductVariationIdUseCase.execute({
				productVariationId,
			});

		return response.status(200).json({
			productImages,
		});
	} catch (error) {
		console.error(
			"Error finding product images by product variation id:",
			error,
		);

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
