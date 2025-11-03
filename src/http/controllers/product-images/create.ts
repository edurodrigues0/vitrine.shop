import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { FirebaseStorageService } from "~/services/storage/firestore-storage-service";
import { FailedToCreateProductImageError } from "~/use-cases/@errors/product-images/failed-to-create-product-image-error";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeCreateProductImageUseCase } from "~/use-cases/@factories/product-images/make-create-product-image-use-case";

const createProductImageBodySchema = z.object({
	productVariationId: z.uuid("Valid product variation ID is required"),
});

export async function createProductImageController(
	request: Request,
	response: Response,
) {
	try {
		const body = createProductImageBodySchema.parse(request.body);

		if (!request.file) {
			return response.status(400).json({
				message: "Image is required",
			});
		}

		const fileExtension = request.file.mimetype.split(".").pop();
		const fileName = `${body.productVariationId}-${Date.now()}.${fileExtension}`;

		const storageService = new FirebaseStorageService();
		const imageUrl = await storageService.uploadImage(
			request.file.buffer,
			fileName,
		);

		const createProductImageUseCase = makeCreateProductImageUseCase();

		const { productImage } = await createProductImageUseCase.execute({
			productVariationId: body.productVariationId,
			url: imageUrl,
		});

		return response.status(201).json({
			productImage,
		});
	} catch (error) {
		console.error("Error creating product image:", error);

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

		if (error instanceof FailedToCreateProductImageError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
