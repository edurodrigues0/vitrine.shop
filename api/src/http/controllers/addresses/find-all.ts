import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllAddressesUseCase } from "~/use-cases/@factories/addresses/make-find-all-addresses-use-case";

const findAllAddressesQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	street: z.string().optional(),
	number: z.string().optional(),
	complement: z.string().optional(),
	neighborhood: z.string().optional(),
	cityName: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
});

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Lista todos os endereços com paginação e filtros
 *     tags: [Addresses]
 *     parameters:
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
 *         name: street
 *         schema:
 *           type: string
 *         description: Filtrar por rua
 *         required: false
 *       - in: query
 *         name: number
 *         schema:
 *           type: string
 *         description: Filtrar por número
 *         required: false
 *       - in: query
 *         name: complement
 *         schema:
 *           type: string
 *         description: Filtrar por complemento
 *         required: false
 *       - in: query
 *         name: neighborhood
 *         schema:
 *           type: string
 *         description: Filtrar por bairro
 *         required: false
 *       - in: query
 *         name: cityName
 *         schema:
 *           type: string
 *         description: Filtrar por nome da cidade
 *         required: false
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *         required: false
 *       - in: query
 *         name: zipCode
 *         schema:
 *           type: string
 *         description: Filtrar por CEP
 *         required: false
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrar por país
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de endereços retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       street:
 *                         type: string
 *                       number:
 *                         type: string
 *                       complement:
 *                         type: string
 *                         nullable: true
 *                       neighborhood:
 *                         type: string
 *                       cityId:
 *                         type: string
 *                         format: uuid
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                       storeId:
 *                         type: string
 *                         format: uuid
 *                         nullable: true
 *                       isMain:
 *                         type: boolean
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
export async function findAllAddressesController(
	request: Request,
	response: Response,
) {
	try {
		const {
			page,
			limit,
			street,
			number,
			complement,
			neighborhood,
			cityName,
			state,
			zipCode,
			country,
		} = findAllAddressesQuerySchema.parse(request.query);

		const findAllAddressesUseCase = makeFindAllAddressesUseCase();

		const { addresses, pagination } = await findAllAddressesUseCase.execute({
			page,
			limit,
			filters: {
				street,
				number,
				complement,
				neighborhood,
				cityName,
				state,
				zipCode,
				country,
			},
		});

		return response.status(200).json({
			addresses: addresses.map((address) => ({
				id: address.id,
				street: address.street,
				number: address.number,
				complement: address.complement,
				neighborhood: address.neighborhood,
				cityId: address.cityId,
				zipCode: address.zipCode,
				country: address.country,
				storeId: address.storeId,
				isMain: address.isMain,
			})),
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding all addresses:", error);

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

