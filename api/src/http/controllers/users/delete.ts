import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { UserNotFoundError } from "~/use-cases/@errors/users/user-not-found-error";
import { makeDeleteUserUseCase } from "~/use-cases/@factories/users/make-delete-user-use-case";

const deleteUserParamsSchema = z.object({
	id: z.string().uuid(),
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Exclui um usuário
 *     tags: [Users]
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
 *         description: ID do usuário
 *     responses:
 *       204:
 *         description: Usuário excluído com sucesso
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Recursos proibidos para funcionários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
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
export async function deleteUserController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const user = request.user;

		if (user?.role === "EMPLOYEE") {
			return response.status(403).json({
				message: "Resource forbidden",
			});
		}

		const { id } = deleteUserParamsSchema.parse(request.params);

		const deleteUserUseCase = makeDeleteUserUseCase();

		await deleteUserUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting user:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof UserNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
