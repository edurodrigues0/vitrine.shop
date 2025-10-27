import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CityNotFoundError } from "~/use-cases/@errors/cities/city-not-found-error";
import { makeFindCityByNameAndStateUseCase } from "~/use-cases/@factories/cities/make-find-city-by-name-and-state-use-case";

const findCityByNameAndStateSchema = z.object({
	name: z.string(),
	state: z.string(),
});

export async function findCityByNameAndStateController(
	request: Request,
	response: Response,
) {
	const { name, state } = findCityByNameAndStateSchema.parse(request.query);
	try {
		const findCityByNameAndStateUseCase = makeFindCityByNameAndStateUseCase();

		const { city } = await findCityByNameAndStateUseCase.execute({
			name,
			state,
		});

		return response.status(200).json({
			city,
		});
	} catch (error) {
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
