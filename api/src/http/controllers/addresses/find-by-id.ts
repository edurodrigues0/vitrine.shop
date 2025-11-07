import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { AddressNotFoundError } from "~/use-cases/@errors/addresses/address-not-found-error";
import { makeFindAddressByIdUseCase } from "~/use-cases/@factories/addresses/make-find-address-by-id-use-case";

const findAddressByIdParamsSchema = z.object({
	id: z.string().uuid(),
});

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Busca um endereço por ID
 *     tags: [Addresses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do endereço
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     street:
 *                       type: string
 *                     number:
 *                       type: string
 *                     complement:
 *                       type: string
 *                       nullable: true
 *                     neighborhood:
 *                       type: string
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                     branchId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     isMain:
 *                       type: boolean
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Endereço não encontrado
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
export async function findAddressByIdController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = findAddressByIdParamsSchema.parse(request.params);

		const findAddressByIdUseCase = makeFindAddressByIdUseCase();

		const { address } = await findAddressByIdUseCase.execute({ id });

		return response.status(200).json({
			address: {
				id: address.id,
				street: address.street,
				number: address.number,
				complement: address.complement,
				neighborhood: address.neighborhood,
				cityId: address.cityId,
				zipCode: address.zipCode,
				country: address.country,
				branchId: address.branchId,
				storeId: address.storeId,
				isMain: address.isMain,
			},
		});
	} catch (error) {
		console.error("Error finding address by id:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof AddressNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

