import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { BranchNotFoundError } from "~/use-cases/@errors/store-branches/branch-not-found-error";
import { makeUpdateStoreBranchUseCase } from "~/use-cases/@factories/store-branches/make-update-store-branch-use-case";

const updateStoreBranchParamsSchema = z.object({
	id: z.uuid("Valid branch ID is required"),
});

const updateStoreBranchBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome deve ter pelo menos 1 caractere")
		.max(120, "Nome deve ter no máximo 120 caracteres")
		.optional(),
	cityId: z.uuid("ID da cidade deve ser um UUID válido").optional(),
	whatsapp: z
		.string()
		.max(20, "WhatsApp deve ter no máximo 20 caracteres")
		.optional(),
	description: z.string().optional(),
	isMain: z.boolean().optional(),
});

/**
 * @swagger
 * /store-branches/{id}:
 *   put:
 *     summary: Atualiza uma filial de loja
 *     tags: [Store Branches]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da filial
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *                 description: Nome da filial
 *                 example: "Filial Centro Atualizada"
 *               cityId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da cidade
 *               whatsapp:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número do WhatsApp
 *                 example: "5511999999999"
 *               description:
 *                 type: string
 *                 description: Descrição da filial
 *               isMain:
 *                 type: boolean
 *                 description: Se é a filial principal
 *     responses:
 *       200:
 *         description: Filial atualizada com sucesso
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
 *         description: Usuário não tem permissão para atualizar esta filial
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Filial não encontrada
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
export async function updateStoreBranchController(
	request: AuthenticatedRequest & { branch?: { id: string; parentStoreId: string } },
	response: Response,
) {
	try {
		const { id } = updateStoreBranchParamsSchema.parse(request.params);
		const body = updateStoreBranchBodySchema.parse(request.body);

		const updateData = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return response.status(400).json({
				message: "Pelo menos um campo deve ser fornecido para atualização",
			});
		}

		const updateStoreBranchUseCase = makeUpdateStoreBranchUseCase();

		const { branch } = await updateStoreBranchUseCase.execute({
			id,
			data: updateData,
		});

		return response.status(200).json({
			branch,
		});
	} catch (error) {
		console.error("Error updating store branch:", error);

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

