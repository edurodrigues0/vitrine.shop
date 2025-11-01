import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeFindProductVariationsByProductIdUseCase } from "~/use-cases/@factories/product-variations/make-find-product-variations-by-product-id-use-case";

const findProductVariationsByProductIdParamsSchema = z.object({
	productId: z.uuid("Valid product ID is required"),
});

export async function findProductVariationsByProductIdController(
	request: Request,
	response: Response,
) {
	const { productId } = findProductVariationsByProductIdParamsSchema.parse(
		request.params,
	);

	try {
		const findProductVariationsByProductIdUseCase =
			makeFindProductVariationsByProductIdUseCase();

		const { productVariations } =
			await findProductVariationsByProductIdUseCase.execute({
				productId,
			});

		return response.status(200).json({
			productVariations,
		});
	} catch (error) {
		console.error("Error finding product variations by product id:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
