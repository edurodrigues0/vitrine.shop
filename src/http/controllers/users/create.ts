import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { UserAlreadyExistsError } from "~/use-cases/@errors/users/user-already-exists-error";
import { makeCreateUserUseCase } from "~/use-cases/@factories/users/make-create-user-use-case";

const createUserSchema = z.object({
	name: z.string().min(3),
	email: z.email(),
	password: z.string().min(8),
	role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).default("OWNER"),
	storeId: z.uuid().optional(),
});

export async function createUserController(
	request: Request,
	response: Response,
) {
	const { name, email, password, role, storeId } = createUserSchema.parse(
		request.body,
	);
	try {
		const createUserUseCase = makeCreateUserUseCase();

		const { user } = await createUserUseCase.execute({
			name,
			email,
			password,
			role,
			storeId,
		});

		return response.status(201).json({ id: user.id });
	} catch (error) {
		console.error("Error creating user:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof UserAlreadyExistsError) {
			return response.status(400).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
