import type { Request, Response } from "express";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreBySlugUseCase } from "~/use-cases/@factories/stores/make-find-store-by-slug-use-case";

/**
 * @swagger
 * /stores/slug/{slug}:
 *   get:
 *     summary: Busca uma loja por slug
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug da loja
 *         example: "minha-loja"
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
 *         description: Slug da loja é obrigatório
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
export async function findStoreBySlugController(
	request: Request,
	response: Response,
) {
	try {
		const { slug } = request.params;

		if (!slug) {
			return response.status(400).json({
				message: "Slug da loja é obrigatório",
			});
		}

		const findStoreBySlugUseCase = makeFindStoreBySlugUseCase();

		const { store } = await findStoreBySlugUseCase.execute({ slug });

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
		console.error("Error finding store by slug:", error);

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
