import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeCreateProductUseCase } from "~/use-cases/@factories/products/make-create-product-use-case";

const createProductBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(120, "Nome deve ter no máximo 120 caracteres"),
	description: z.string().optional(),
	price: z
		.number()
		.positive("Preço deve ser um valor positivo")
		.max(999999.99, "Preço deve ser menor que 1.000.000"),
	discountPrice: z
		.number()
		.positive("Preço de desconto deve ser um valor positivo")
		.max(999999.99, "Preço de desconto deve ser menor que 1.000.000")
		.optional(),
	stock: z
		.number()
		.int("Estoque deve ser um número inteiro")
		.min(0, "Estoque não pode ser negativo")
		.default(0),
	colors: z
		.array(z.string().min(1, "Cor não pode ser vazia"))
		.min(1, "Pelo menos uma cor deve ser fornecida"),
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
	categoryId: z.uuid("ID da categoria deve ser um UUID válido"),
	storeId: z.uuid("ID da loja deve ser um UUID válido"),
});

export async function createProductController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const body = createProductBodySchema.parse(request.body);

		const createProductUseCase = makeCreateProductUseCase();

		const { product } = await createProductUseCase.execute({
			categoryId: body.categoryId,
			description: body.description,
			name: body.name,
			storeId: request.body.storeId,
		});

		return response.status(201).json({
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
		console.error("Error creating product:", error);

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
