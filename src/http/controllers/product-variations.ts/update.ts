import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { FailedToUpdateProductVariationError } from "~/use-cases/@errors/product-variations/failed-to-update-product-variation-error";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeUpdateProductVariationUseCase } from "~/use-cases/@factories/product-variations/make-update-product-variation-use-case";

const updateProductVariationParamsSchema = z.object({
	id: z.uuid("Valid product variation ID is required"),
});

const updateProductVariationBodySchema = z.object({
	data: z.object({
		size: z.string("Valid size is required").optional(),
		color: z.string("Valid color is required").optional(),
		weight: z.string("Valid weight is required").optional(),
		dimensions: z.record(z.any(), z.any()).optional(),
		discountPrice: z.number("Valid discount price is required").optional(),
		price: z.number("Valid price is required").optional(),
		stock: z.number("Valid stock is required").optional(),
	}),
});

export async function updateProductVariationController(
	request: Request,
	response: Response,
) {
	const { id } = updateProductVariationParamsSchema.parse(request.params);
	const { data } = updateProductVariationBodySchema.parse(request.body);

	try {
		const updateProductVariationUseCase = makeUpdateProductVariationUseCase();

		const { productVariation } = await updateProductVariationUseCase.execute({
			id,
			data,
		});

		return response.status(200).json({
			productVariation,
		});
	} catch (error) {
		console.error("Error updating product variation:", error);

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

		if (error instanceof FailedToUpdateProductVariationError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
