import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindUsersByStoreIdUseCase } from "~/use-cases/@factories/users/make-find-users-by-store-id-use-case";

const findUsersByStoreIdQuerySchema = z.object({
	storeId: z.string().uuid(),
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	email: z.string().optional(),
	role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).optional(),
});

/**
 * @swagger
 * /users/store/{storeId}:
 *   get:
 *     summary: Lista todos os usuários de uma loja
 *     tags: [Users]
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
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *         required: false
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por email
 *         required: false
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, OWNER, EMPLOYEE]
 *         description: Filtrar por papel
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de usuários da loja retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [ADMIN, OWNER, EMPLOYEE]
 *                       storeId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *       400:
 *         description: Erro de validação
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
export async function findUsersByStoreIdController(
	request: Request,
	response: Response,
) {
	try {
		const { storeId, page, limit, name, email, role } =
			findUsersByStoreIdQuerySchema.parse(request.query);

		const findUsersByStoreIdUseCase = makeFindUsersByStoreIdUseCase();

		const { users, pagination } = await findUsersByStoreIdUseCase.execute({
			storeId,
			page,
			limit,
			filters: {
				name,
				email,
				role,
			},
		});

		return response.status(200).json({
			users,
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding users by store id:", error);

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
