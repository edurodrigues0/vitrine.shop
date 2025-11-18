import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { BranchNotFoundError } from "~/use-cases/@errors/store-branches/branch-not-found-error";
import { makeDeleteStoreBranchUseCase } from "~/use-cases/@factories/store-branches/make-delete-store-branch-use-case";

const deleteStoreBranchParamsSchema = z.object({
	id: z.uuid("Valid branch ID is required"),
});

/**
 * @swagger
 * /store-branches/{id}:
 *   delete:
 *     summary: Deleta uma filial de loja
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
 *       204:
 *         description: Filial deletada com sucesso
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       403:
 *         description: Usuário não tem permissão para deletar esta filial
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
export async function deleteStoreBranchController(
	request: AuthenticatedRequest & { branch?: { id: string; parentStoreId: string } },
	response: Response,
) {
	try {
		const { id } = deleteStoreBranchParamsSchema.parse(request.params);

		const deleteStoreBranchUseCase = makeDeleteStoreBranchUseCase();

		await deleteStoreBranchUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting store branch:", error);

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

