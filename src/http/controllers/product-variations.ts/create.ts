import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { FailedToCreateProductVariationError } from "~/use-cases/@errors/product-variations/failed-to-create-product-variation-error";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeCreateProductVariationUseCase } from "~/use-cases/@factories/product-variations/make-create-product-variation-use-case";
import { makeCreateProductUseCase } from "~/use-cases/@factories/products/make-create-product-use-case";

const createProductVariationsBodySchema = z.object({
	productId: z.uuid("Valid product ID is required"),
	size: z.string("Valid size is required"),
	color: z.string("Valid color is required"),
	weight: z.string().optional(),
	dimensions: z.record(z.any(), z.any()).optional(),
	discountPrice: z.number().optional(),
	price: z.number("Valid price is required"),
	stock: z.number("Valid stock is required"),
});

export async function createProductVariationsController(
	request: Request,
	response: Response,
) {
	const body = createProductVariationsBodySchema.parse(request.body);

	try {
		const createProductVariationsUseCase = makeCreateProductVariationUseCase();

		const { productVariation } = await createProductVariationsUseCase.execute({
			productId: body.productId,
			size: body.size,
			color: body.color,
			weight: body.weight ?? null,
			dimensions: body.dimensions ?? null,
			discountPrice: body.discountPrice ?? null,
			price: body.price,
			stock: body.stock,
		});

		return response.status(201).json({
			productVariation,
		});
	} catch (error) {
		console.error("Error creating product variation:", error);

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

		if (error instanceof FailedToCreateProductVariationError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
