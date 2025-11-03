import type { Response } from "express";
import { env } from "~/config/env";

const COOKIE_NAME = "auth-token";
const COOKIE_OPTIONS = {
	httpOnly: true,
	secure: env.NODE_ENV === "production",
	sameSite: "strict" as const,
	maxAge: 60 * 60 * 1000, // 1 hora em milissegundos
	path: "/",
};

export function setAuthCookie(response: Response, token: string): void {
	response.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

export function clearAuthCookie(response: Response): void {
	response.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
}

export function getAuthCookie(request: any): string | undefined {
	return request.cookies?.[COOKIE_NAME];
}
