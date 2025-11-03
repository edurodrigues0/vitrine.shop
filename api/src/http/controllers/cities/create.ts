import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CityAlreadyExistsError } from "~/use-cases/@errors/cities/city-already-exists-error";
import { makeCreateCityUseCase } from "~/use-cases/@factories/cities/make-create-city-use-case";

const createCitySchema = z.object({
	name: z.string().min(3),
	state: z.string().min(2),
});

/**
 * @swagger
 * /cities:
 *   post:
 *     summary: Cria uma nova cidade
 *     tags: [Cities]
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
 *               - name
 *               - state
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: Nome da cidade
 *                 example: "Belo Horizonte"
 *               state:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 description: Sigla do estado (2 caracteres)
 *                 example: "MG"
 *     responses:
 *       201:
 *         description: Cidade criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     state:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação ou cidade já existe
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
export async function createCityController(
	request: Request,
	response: Response,
) {
	const { name, state } = createCitySchema.parse(request.body);
	try {
		const createCityUseCase = makeCreateCityUseCase();

		const { city } = await createCityUseCase.execute({
			name,
			state,
		});

		return response.status(201).json({
			city,
		});
	} catch (error) {
		console.error("Error creating city:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof CityAlreadyExistsError) {
			return response.status(400).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
