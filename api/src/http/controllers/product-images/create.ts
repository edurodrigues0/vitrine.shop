import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { R2StorageService } from "~/services/storage/r2-storage-service";
import { FailedToCreateProductImageError } from "~/use-cases/@errors/product-images/failed-to-create-product-image-error";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeCreateProductImageUseCase } from "~/use-cases/@factories/product-images/make-create-product-image-use-case";

const createProductImageBodySchema = z.object({
	productVariationId: z.uuid("Valid product variation ID is required"),
});

/**
 * @swagger
 * /product-images:
 *   post:
 *     summary: Cria uma nova imagem de produto
 *     tags: [Product Images]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - productVariationId
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de imagem do produto
 *               productVariationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da variação do produto
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Imagem de produto criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productImage:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     productVariationId:
 *                       type: string
 *                       format: uuid
 *                     url:
 *                       type: string
 *                       format: uri
 *                     isMain:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação ou imagem não fornecida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Variação de produto não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

		// Extrair extensão do arquivo baseado no mimetype
		const mimeToExt: Record<string, string> = {
			"image/jpeg": "jpg",
			"image/jpg": "jpg",
			"image/png": "png",
			"image/webp": "webp",
			"image/gif": "gif",
		};
		const fileExtension = mimeToExt[request.file.mimetype] || "jpg";
		const fileName = `${body.productVariationId}-${Date.now()}.${fileExtension}`;

		const storageService = new R2StorageService();

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
