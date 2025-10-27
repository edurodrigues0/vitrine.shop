import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllCitiesUseCase } from "~/use-cases/@factories/cities/make-find-all-cities-use-case";

const findAllCitiesQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	state: z.string().optional(),
});

export async function findAllCitiesController(
	request: Request,
	response: Response,
) {
	const { page, limit, name, state } = findAllCitiesQuerySchema.parse(
		request.query,
	);

	try {
		const findAllCitiesUseCase = makeFindAllCitiesUseCase();

		const { cities, pagination } = await findAllCitiesUseCase.execute({
			page,
			limit,
			filters: {
				name,
				state,
			},
		});

		return response.status(200).json({
			cities,
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding all cities:", error);

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
