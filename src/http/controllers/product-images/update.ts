import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { FailedToUpdateProductImageError } from "~/use-cases/@errors/product-images/failed-to-update-product-image-error";
import { ProductImageNotFoundError } from "~/use-cases/@errors/product-images/product-image-not-found-error";
import { makeUpdateProductImageUseCase } from "~/use-cases/@factories/product-images/make-update-product-image-use-case";

const updateProductImageParamsSchema = z.object({
	id: z.uuid("Valid product image ID is required"),
});

const updateProductImageBodySchema = z.object({
	url: z.string().url("Valid URL is required").optional(),
});

export async function updateProductImageController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = updateProductImageParamsSchema.parse(request.params);
		const body = updateProductImageBodySchema.parse(request.body);

		const updateData = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return response.status(400).json({
				message: "Pelo menos um campo deve ser fornecido para atualização",
			});
		}

		const updateProductImageUseCase = makeUpdateProductImageUseCase();

		const { productImage } = await updateProductImageUseCase.execute({
			id,
			data: updateData,
		});

		return response.status(200).json({
			productImage,
		});
	} catch (error) {
		console.error("Error updating product image:", error);

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

		if (error instanceof FailedToUpdateProductImageError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
