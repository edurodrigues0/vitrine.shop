import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CityNotFoundError } from "~/use-cases/@errors/cities/city-not-found-error";
import { makeFindCityByIdUseCase } from "~/use-cases/@factories/cities/make-find-city-by-id-use-case";

const findCityByIdParamsSchema = z.object({
	id: z.string().uuid("ID deve ser um UUID válido"),
});

export async function findCityByIdController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = findCityByIdParamsSchema.parse(request.params);

		const findCityByIdUseCase = makeFindCityByIdUseCase();

		const { city } = await findCityByIdUseCase.execute({ id });

		return response.status(200).json({
			city,
		});
	} catch (error) {
		console.error("Error finding city by ID:", error);

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



