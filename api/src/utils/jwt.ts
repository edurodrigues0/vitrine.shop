import jsonwebtoken from "jsonwebtoken";
import type { UserRole } from "~/database/schema";

export interface JwtPayload {
	sub: string;
	email: string;
	name: string;
	role: UserRole;
}

export function generateToken(
	payload: Omit<JwtPayload, "sub"> & { userId: string },
): string {
	const token = jsonwebtoken.sign(
		{
			sub: payload.userId,
			email: payload.email,
			name: payload.name,
			role: payload.role,
		},
		process.env.JWT_SECRET as jsonwebtoken.Secret,
		{
			expiresIn: process.env
				.JWT_EXPIRES_IN as jsonwebtoken.SignOptions["expiresIn"],
		},
	);

	return token;
}

export function verifyToken(token: string): JwtPayload {
	return jsonwebtoken.verify(
		token,
		process.env.JWT_SECRET as string,
	) as JwtPayload;
}
