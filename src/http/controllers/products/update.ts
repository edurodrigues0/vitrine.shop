import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { FailedToUpdateProductError } from "~/use-cases/@errors/products/failed-to-update-product-error";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeUpdateProductUseCase } from "~/use-cases/@factories/products/make-update-product-use-case";

const updateProductBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(120, "Nome deve ter no máximo 120 caracteres")
		.optional(),
	description: z.string().optional(),
	price: z
		.number()
		.positive("Preço deve ser um valor positivo")
		.max(999999.99, "Preço deve ser menor que 1.000.000")
		.optional(),
	discountPrice: z
		.number()
		.positive("Preço de desconto deve ser um valor positivo")
		.max(999999.99, "Preço de desconto deve ser menor que 1.000.000")
		.optional(),
	stock: z
		.number()
		.int("Estoque deve ser um número inteiro")
		.min(0, "Estoque não pode ser negativo")
		.optional(),
	colors: z
		.array(z.string().min(1, "Cor não pode ser vazia"))
		.min(1, "Pelo menos uma cor deve ser fornecida")
		.optional(),
	size: z
		.string()
		.max(100, "Tamanho deve ter no máximo 100 caracteres")
		.optional(),
	weight: z
		.number()
		.positive("Peso deve ser um valor positivo")
		.max(999.99, "Peso deve ser menor que 1000")
		.optional(),
	dimensions: z.record(z.any(), z.any()).optional(),
});

export async function updateProductController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID do produto é obrigatório",
			});
		}

		if (!request.user) {
			return response.status(401).json({
				message: "Usuário não autenticado",
			});
		}

		const body = updateProductBodySchema.parse(request.body);

		// Remover campos undefined para não enviar dados desnecessários
		const updateData = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return response.status(400).json({
				message: "Pelo menos um campo deve ser fornecido para atualização",
			});
		}

		const updateProductUseCase = makeUpdateProductUseCase();

		const { product } = await updateProductUseCase.execute({
			id,
			data: updateData,
		});

		if (!product) {
			return response.status(500).json({
				message: "Falha ao atualizar o produto",
			});
		}

		return response.status(200).json({
			product: {
				id: product.id,
				name: product.name,
				description: product.description,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			},
		});
	} catch (error) {
		console.error("Error updating product:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductNotFoundError) {
			return response.status(404).json({
				message: "Produto não encontrado",
			});
		}

		if (error instanceof FailedToUpdateProductError) {
			return response.status(500).json({
				message: "Falha ao atualizar o produto",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
