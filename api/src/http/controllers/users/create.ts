import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { SubscriptionRequiredError } from "~/use-cases/@errors/plans/subscription-required-error";
import { UserLimitExceededError } from "~/use-cases/@errors/plans/user-limit-exceeded-error";
import { UserAlreadyExistsError } from "~/use-cases/@errors/users/user-already-exists-error";
import { makeCreateUserUseCase } from "~/use-cases/@factories/users/make-create-user-use-case";

const createUserSchema = z.object({
	name: z.string().min(3),
	email: z.email(),
	password: z.string().min(8),
	role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).default("OWNER"),
	storeId: z.uuid().optional(),
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: Nome do usuário
 *                 example: "João Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Senha do usuário
 *                 example: "senha123"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, OWNER, EMPLOYEE]
 *                 default: OWNER
 *                 description: Papel do usuário
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da loja (opcional)
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Erro de validação ou usuário já existe
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
export async function createUserController(
	request: Request,
	response: Response,
) {
	const { name, email, password, role, storeId } = createUserSchema.parse(
		request.body,
	);
	try {
		const createUserUseCase = makeCreateUserUseCase();

		const { user } = await createUserUseCase.execute({
			name,
			email,
			password,
			role,
			storeId,
		});

		return response.status(201).json({ id: user.id });
	} catch (error) {
		console.error("Error creating user:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof UserAlreadyExistsError) {
			return response.status(400).json({
				message: error.message,
			});
		}

		if (error instanceof UserLimitExceededError) {
			return response.status(403).json({
				message: error.message,
				code: "USER_LIMIT_EXCEEDED",
				current: error.current,
				limit: error.limit,
				planId: error.planId,
			});
		}

		if (error instanceof SubscriptionRequiredError) {
			return response.status(403).json({
				message: error.message,
				code: "SUBSCRIPTION_REQUIRED",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
