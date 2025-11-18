import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { BranchNotFoundError } from "~/use-cases/@errors/store-branches/branch-not-found-error";
import { makeCreateStoreBranchUseCase } from "~/use-cases/@factories/store-branches/make-create-store-branch-use-case";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

const createStoreBranchBodySchema = z.object({
	parentStoreId: z.uuid("ID da loja deve ser um UUID válido"),
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(120, "Nome deve ter no máximo 120 caracteres"),
	cityId: z.uuid("ID da cidade deve ser um UUID válido"),
	whatsapp: z
		.string()
		.max(20, "WhatsApp deve ter no máximo 20 caracteres")
		.optional(),
	description: z.string().optional(),
	isMain: z.boolean().optional(),
});

/**
 * @swagger
 * /store-branches:
 *   post:
 *     summary: Cria uma nova filial de loja
 *     tags: [Store Branches]
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
 *               - parentStoreId
 *               - name
 *               - cityId
 *             properties:
 *               parentStoreId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da loja pai
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *                 description: Nome da filial
 *                 example: "Filial Centro"
 *               cityId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da cidade
 *               whatsapp:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número do WhatsApp (opcional)
 *                 example: "5511999999999"
 *               description:
 *                 type: string
 *                 description: Descrição da filial (opcional)
 *               isMain:
 *                 type: boolean
 *                 description: Se é a filial principal (opcional)
 *                 default: false
 *     responses:
 *       201:
 *         description: Filial criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 branch:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     parentStoreId:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     isMain:
 *                       type: boolean
 *                     whatsapp:
 *                       type: string
 *                       nullable: true
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       403:
 *         description: Usuário não tem permissão para criar filial nesta loja
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
export async function createStoreBranchController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const body = createStoreBranchBodySchema.parse(request.body);
		const userId = request.user?.id;

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		// Verificar se o usuário é dono da store
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id: body.parentStoreId });

		if (!store) {
			return response.status(404).json({
				message: "Store not found",
			});
		}

		if (store.ownerId !== userId) {
			return response.status(403).json({
				message: "You do not have permission to create branches for this store",
			});
		}

		const createStoreBranchUseCase = makeCreateStoreBranchUseCase();

		const { branch } = await createStoreBranchUseCase.execute({
			parentStoreId: body.parentStoreId,
			name: body.name,
			cityId: body.cityId,
			whatsapp: body.whatsapp,
			description: body.description,
			isMain: body.isMain,
		});

		return response.status(201).json({
			branch,
		});
	} catch (error) {
		console.error("Error creating store branch:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof BranchNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

