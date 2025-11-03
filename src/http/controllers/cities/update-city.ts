import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CityNotFoundError } from "~/use-cases/@errors/cities/city-not-found-error";
import { makeUpdateCityUseCase } from "~/use-cases/@factories/cities/make-update-city-use-case";

const updateBodyCitySchema = z.object({
	name: z.string().min(3).optional(),
	state: z.string().min(2).optional(),
});

const updateParamsCitySchema = z.object({
	id: z.uuid(),
});

/**
 * @swagger
 * /cities/{id}:
 *   put:
 *     summary: Atualiza uma cidade existente
 *     tags: [Cities]
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
 *         description: ID da cidade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 description: Novo nome da cidade
 *                 example: "Belo Horizonte"
 *               state:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 description: Nova sigla do estado
 *                 example: "MG"
 *     responses:
 *       200:
 *         description: Cidade atualizada com sucesso
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
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cidade não encontrada
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
export async function updateCityController(
	request: Request,
	response: Response,
) {
	const { id } = updateParamsCitySchema.parse(request.params);
	const { name, state } = updateBodyCitySchema.parse(request.body);

	try {
		const updateCityUseCase = makeUpdateCityUseCase();

		const { city } = await updateCityUseCase.execute({
			id,
			data: {
				name,
				state,
			},
		});

		return response.status(200).json({
			city,
		});
	} catch (error) {
		console.error("Error updating city:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof CityNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
