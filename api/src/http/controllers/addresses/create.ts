import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeCreateAddressUseCase } from "~/use-cases/@factories/addresses/make-create-address-use-case";

const createAddressBodySchema = z.object({
	street: z.string().min(1, "Rua é obrigatória").max(255, "Rua deve ter no máximo 255 caracteres"),
	number: z.string().min(1, "Número é obrigatório").max(10, "Número deve ter no máximo 10 caracteres"),
	complement: z.string().max(255, "Complemento deve ter no máximo 255 caracteres").optional(),
	neighborhood: z.string().min(1, "Bairro é obrigatório").max(100, "Bairro deve ter no máximo 100 caracteres"),
	cityId: z.string().uuid("ID da cidade deve ser um UUID válido"),
	zipCode: z.string().length(8, "CEP deve ter 8 caracteres"),
	country: z.string().min(1, "País é obrigatório").max(50, "País deve ter no máximo 50 caracteres"),
	storeId: z.string().uuid("ID da loja deve ser um UUID válido").optional(),
	isMain: z.boolean().optional(),
});

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Cria um novo endereço
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - street
 *               - number
 *               - neighborhood
 *               - cityId
 *               - zipCode
 *               - country
 *             properties:
 *               street:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Rua
 *                 example: "Rua das Flores"
 *               number:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 10
 *                 description: Número
 *                 example: "123"
 *               complement:
 *                 type: string
 *                 maxLength: 255
 *                 description: Complemento
 *                 example: "Apto 101"
 *               neighborhood:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Bairro
 *                 example: "Centro"
 *               cityId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da cidade
 *               zipCode:
 *                 type: string
 *                 length: 8
 *                 description: CEP
 *                 example: "30000000"
 *               country:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: País
 *                 example: "Brasil"
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da loja (opcional)
 *               isMain:
 *                 type: boolean
 *                 description: Se é o endereço principal
 *                 default: false
 *     responses:
 *       201:
 *         description: Endereço criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     street:
 *                       type: string
 *                     number:
 *                       type: string
 *                     complement:
 *                       type: string
 *                       nullable: true
 *                     neighborhood:
 *                       type: string
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     isMain:
 *                       type: boolean
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Loja não encontrada
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
export async function createAddressController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		console.log("📥 Recebendo requisição para criar endereço:", {
			body: request.body,
			userId: request.user?.id,
		});

		const {
			street,
			number,
			complement,
			neighborhood,
			cityId,
			zipCode,
			country,
			storeId,
			isMain,
		} = createAddressBodySchema.parse(request.body);

		console.log("✅ Dados validados:", {
			street,
			number,
			complement,
			neighborhood,
			cityId,
			zipCode,
			country,
			storeId,
			isMain,
		});

		const createAddressUseCase = makeCreateAddressUseCase();

		console.log("🔄 Executando use case para criar endereço...");
		const { address } = await createAddressUseCase.execute({
			street,
			number,
			complement: complement || "",
			neighborhood,
			cityId,
			zipCode,
			country,
			storeId,
			isMain,
		});

		console.log("✅ Endereço criado com sucesso:", address.id);

		return response.status(201).json({
			address: {
				id: address.id,
				street: address.street,
				number: address.number,
				complement: address.complement,
				neighborhood: address.neighborhood,
				cityId: address.cityId,
				zipCode: address.zipCode,
				country: address.country,
				storeId: address.storeId,
				isMain: address.isMain,
			},
		});
	} catch (error) {
		console.error("Error creating address:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof StoreNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}


		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

