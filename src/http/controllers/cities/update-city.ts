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
