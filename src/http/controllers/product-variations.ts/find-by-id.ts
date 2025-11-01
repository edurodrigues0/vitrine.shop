import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeFindProductVariationByIdUseCase } from "~/use-cases/@factories/product-variations/make-find-product-variation-by-id-use-case";

const findProductVariationByIdParamsSchema = z.object({
	id: z.uuid("Valid product variation ID is required"),
});

export async function findProductVariationByIdController(
	request: Request,
	response: Response,
) {
	const { id } = findProductVariationByIdParamsSchema.parse(request.params);

	try {
		const findProductVariationByIdUseCase =
			makeFindProductVariationByIdUseCase();

		const { productVariation } = await findProductVariationByIdUseCase.execute({
			id,
		});

		return response.status(200).json({
			productVariation,
		});
	} catch (error) {
		console.error("Error finding product variation by id:", error);

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
