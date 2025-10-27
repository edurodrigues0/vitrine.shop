import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CityAlreadyExistsError } from "~/use-cases/@errors/cities/city-already-exists-error";
import { makeCreateCityUseCase } from "~/use-cases/@factories/cities/make-create-city-use-case";

const createCitySchema = z.object({
	name: z.string().min(3),
	state: z.string().min(2),
});

export async function createCityController(
	request: Request,
	response: Response,
) {
	const { name, state } = createCitySchema.parse(request.body);
	try {
		const createCityUseCase = makeCreateCityUseCase();

		const { city } = await createCityUseCase.execute({
			name,
			state,
		});

		return response.status(201).json({
			city,
		});
	} catch (error) {
		console.error("Error creating city:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof CityAlreadyExistsError) {
			return response.status(400).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
