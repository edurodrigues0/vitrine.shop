import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { BranchNotFoundError } from "~/use-cases/@errors/store-branches/branch-not-found-error";
import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

const findStoreBranchByIdParamsSchema = z.object({
	id: z.uuid("Valid branch ID is required"),
});

/**
 * @swagger
 * /store-branches/{id}:
 *   get:
 *     summary: Busca uma filial pelo ID
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
 *     responses:
 *       200:
 *         description: Filial encontrada
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
 *         description: Usuário não tem permissão para acessar esta filial
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
export async function findStoreBranchByIdController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = findStoreBranchByIdParamsSchema.parse(request.params);
		const userId = request.user?.id;

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		// Buscar a branch
		const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
		const branch = await storeBranchesRepository.findById({ id });

		if (!branch) {
			return response.status(404).json({
				message: "Store branch not found",
			});
		}

		// Verificar se o usuário é dono da store
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id: branch.parentStoreId });

		if (!store) {
			return response.status(404).json({
				message: "Store not found",
			});
		}

		if (store.ownerId !== userId) {
			return response.status(403).json({
				message: "You do not have permission to access this store branch",
			});
		}

		return response.status(200).json({
			branch,
		});
	} catch (error) {
		console.error("Error finding store branch by ID:", error);

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

