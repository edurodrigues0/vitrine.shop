import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllStoresUseCase } from "~/use-cases/@factories/stores/make-find-all-stores-use-case";

const findAllStoresQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	description: z.string().optional(),
	slug: z.string().optional(),
	ownerId: z.string().uuid().optional(),
	isPaid: z.coerce.boolean().optional(),
});

export async function findAllStoresController(
	request: Request,
	response: Response,
) {
	try {
		const { page, limit, name, description, slug, ownerId, isPaid } =
			findAllStoresQuerySchema.parse(request.query);

		const findAllStoresUseCase = makeFindAllStoresUseCase();

		const { stores, pagination } = await findAllStoresUseCase.execute({
			page,
			limit,
			filters: {
				name,
				description,
				slug,
				ownerId,
				isPaid,
			},
		});

		return response.status(200).json({
			stores: stores.map((store) => ({
				id: store.id,
				name: store.name,
				description: store.description,
				slug: store.slug,
				theme: store.theme,
				status: store.status,
				logoUrl: store.logoUrl,
				whatsapp: store.whatsapp,
				instagramUrl: store.instagramUrl,
				facebookUrl: store.facebookUrl,
				bannerUrl: store.bannerUrl,
				cityId: store.cityId,
				ownerId: store.ownerId,
				isPaid: store.isPaid,
				createdAt: store.createdAt,
				updatedAt: store.updatedAt,
			})),
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding all stores:", error);

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
