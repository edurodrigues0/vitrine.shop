import type { Request, Response } from "express";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /stores/{id}:
 *   get:
 *     summary: Busca uma loja por ID
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da loja
 *     responses:
 *       200:
 *         description: Loja encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 store:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     cnpjcpf:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                       nullable: true
 *                     whatsapp:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     instagramUrl:
 *                       type: string
 *                       nullable: true
 *                     facebookUrl:
 *                       type: string
 *                       nullable: true
 *                     bannerUrl:
 *                       type: string
 *                       nullable: true
 *                     theme:
 *                       type: object
 *                     cityId:
 *                       type: string
 *                       format: uuid
 *                     ownerId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [ACTIVE, INACTIVE]
 *                     isPaid:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID da loja é obrigatório
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
export async function findStoreByIdController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID da loja é obrigatório",
			});
		}

		const findStoreByIdUseCase = makeFindStoreByIdUseCase();

		const { store } = await findStoreByIdUseCase.execute({ id });

		return response.status(200).json({
			store: {
				id: store.id,
				name: store.name,
				description: store.description,
				cnpjcpf: store.cnpjcpf,
				logoUrl: store.logoUrl,
				whatsapp: store.whatsapp,
				slug: store.slug,
				instagramUrl: store.instagramUrl,
				facebookUrl: store.facebookUrl,
				bannerUrl: store.bannerUrl,
				theme: store.theme,
				cityId: store.cityId,
				ownerId: store.ownerId,
				status: store.status,
				isPaid: store.isPaid,
				createdAt: store.createdAt,
				updatedAt: store.updatedAt,
			},
		});
	} catch (error) {
		console.error("Error finding store by ID:", error);

		if (error instanceof StoreNotFoundError) {
			return response.status(404).json({
				message: "Loja não encontrada",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
