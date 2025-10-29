import type { Request, Response } from "express";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreBySlugUseCase } from "~/use-cases/@factories/stores/make-find-store-by-slug-use-case";

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
