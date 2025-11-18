import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindStoreBranchesByStoreIdUseCase } from "~/use-cases/@factories/store-branches/make-find-store-branches-by-store-id-use-case";

const findStoreBranchesByStoreIdParamsSchema = z.object({
	storeId: z.uuid("Valid store ID is required"),
});

/**
 * @swagger
 * /store-branches/stores/{storeId}:
 *   get:
 *     summary: Lista todas as filiais de uma loja específica
 *     tags: [Store Branches]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da loja
 *     responses:
 *       200:
 *         description: Lista de filiais retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       parentStoreId:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       cityId:
 *                         type: string
 *                         format: uuid
 *                       isMain:
 *                         type: boolean
 *                       whatsapp:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Usuário não tem permissão para acessar esta loja
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
export async function findStoreBranchesByStoreIdController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { storeId } = findStoreBranchesByStoreIdParamsSchema.parse(request.params);

		const findStoreBranchesByStoreIdUseCase = makeFindStoreBranchesByStoreIdUseCase();

		const { branches } = await findStoreBranchesByStoreIdUseCase.execute({
			storeId,
		});

		return response.status(200).json({
			branches,
		});
	} catch (error) {
		console.error("Error finding store branches by store ID:", error);

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

