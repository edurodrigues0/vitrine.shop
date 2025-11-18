import type { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
	windowMs: number; // Janela de tempo em milissegundos
	maxRequests: number; // Número máximo de requisições
	message?: string;
}

interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

const store: RateLimitStore = {};

/**
 * Middleware de rate limiting simples em memória
 * Para produção, considere usar uma biblioteca especializada
 */
export function rateLimit(options: RateLimitOptions) {
	const { windowMs, maxRequests, message = "Too many requests, please try again later." } = options;

	return (request: Request, response: Response, next: NextFunction) => {
		const identifier = request.ip || request.socket.remoteAddress || "unknown";
		const now = Date.now();

		// Limpar entradas expiradas periodicamente
		if (Math.random() < 0.01) {
			// 1% de chance de limpar (evita limpar muito frequentemente)
			for (const key in store) {
				if (store[key]!.resetTime < now) {
					delete store[key];
				}
			}
		}

		const record = store[identifier];

		if (!record || record.resetTime < now) {
			// Criar novo registro ou renovar
			store[identifier] = {
				count: 1,
				resetTime: now + windowMs,
			};
			return next();
		}

		if (record.count >= maxRequests) {
			const retryAfter = Math.ceil((record.resetTime - now) / 1000);
			response.setHeader("Retry-After", retryAfter.toString());
			return response.status(429).json({
				message,
				retryAfter,
			});
		}

		record.count++;
		next();
	};
}

/**
 * Rate limit padrão para rotas públicas: 100 requisições por minuto
 */
export const publicRateLimit = rateLimit({
	windowMs: 60 * 1000, // 1 minuto
	maxRequests: 100,
	message: "Too many requests from this IP, please try again later.",
});

/**
 * Rate limit para rotas de autenticação: 5 requisições por minuto
 */
export const authRateLimit = rateLimit({
	windowMs: 60 * 1000, // 1 minuto
	maxRequests: 5,
	message: "Too many login attempts, please try again later.",
});

/**
 * Rate limit para rotas autenticadas: 200 requisições por minuto
 */
export const authenticatedRateLimit = rateLimit({
	windowMs: 60 * 1000, // 1 minuto
	maxRequests: 200,
	message: "Too many requests, please try again later.",
});

