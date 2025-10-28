import { hash } from "bcryptjs";
import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { BCRYPT_SALT_ROUNDS } from "~/config/constants";
import { makeUpdateUserUseCase } from "~/use-cases/@factories/users/make-update-user-use-case";

const updateUserParamsSchema = z.object({
	id: z.string().uuid(),
});

const updateUserBodySchema = z.object({
	name: z.string().min(3).optional(),
	email: z.string().email().optional(),
	password: z.string().min(8).optional(),
	role: z.enum(["ADMIN", "OWNER", "EMPLOYEE"]).optional(),
});

export async function updateUserController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = updateUserParamsSchema.parse(request.params);
		const bodyData = updateUserBodySchema.parse(request.body);

		const updateUserUseCase = makeUpdateUserUseCase();

		// Se password foi fornecido, fazer hash
		let hashedPassword = bodyData.password;
		if (bodyData.password) {
			hashedPassword = await hash(bodyData.password, BCRYPT_SALT_ROUNDS);
		}

		const { user } = await updateUserUseCase.execute({
			id,
			data: {
				name: bodyData.name,
				email: bodyData.email,
				password: hashedPassword,
				role: bodyData.role,
			},
		});

		if (!user) {
			return response.status(404).json({
				message: "User not found",
			});
		}

		return response.status(200).json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				storeId: user.storeId,
				createdAt: user.createdAt,
			},
		});
	} catch (error) {
		console.error("Error updating user:", error);

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
