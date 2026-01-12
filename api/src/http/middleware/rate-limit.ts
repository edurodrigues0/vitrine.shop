import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { env } from "~/config/env";

// Fallback em memória para quando Redis não estiver disponível
interface RateLimitStore {
	[key: string]: {
		count: number;
		resetTime: number;
	};
}

const memoryStore: RateLimitStore = {};

/**
 * Cria um middleware de rate limiting com Redis ou fallback em memória
 */
function createMemoryRateLimit(options: {
	windowMs: number;
	max: number;
	message?: string;
}) {
	const { windowMs, max, message = "Too many requests, please try again later." } = options;

	return (request: Request, response: Response, next: NextFunction) => {
		const identifier = request.ip || request.socket.remoteAddress || "unknown";
		const now = Date.now();

		// Limpar entradas expiradas periodicamente
		if (Math.random() < 0.01) {
			for (const storeKey in memoryStore) {
				if (memoryStore[storeKey]!.resetTime < now) {
					delete memoryStore[storeKey];
				}
			}
		}

		const record = memoryStore[identifier];

		if (!record || record.resetTime < now) {
			memoryStore[identifier] = {
				count: 1,
				resetTime: now + windowMs,
			};
			return next();
		}

		if (record.count >= max) {
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
 * Cria rate limiter com Redis ou fallback em memória
 */
async function createRateLimiter(options: {
	windowMs: number;
	max: number;
	message?: string;
	prefix?: string;
}) {
	const { windowMs, max, message = "Too many requests, please try again later.", prefix = "rl" } = options;

	// Tentar usar Redis
	const redisClient = null
	// TODO: Implementar Redis

	if (redisClient) {
		try {
			// Criar store customizado para Redis
			const redisStore = {
				async increment(key: string) {
					const count = await redisClient!.incr(key);
					
					// Definir TTL na primeira vez
					if (count === 1) {
						await redisClient!.pExpire(key, windowMs);
					}
					
					return {
						totalHits: count,
						timeToExpire: await redisClient!.pTtl(key),
					};
				},
				async decrement(key: string) {
					await redisClient!.decr(key);
				},
				async resetKey(key: string) {
					await redisClient!.del(key);
				},
				async shutdown() {
					// Não fechar conexão aqui, será gerenciada separadamente
				},
			};
			
			return rateLimit({
				store: redisStore as any,
				windowMs,
				max,
				message,
				standardHeaders: true,
				legacyHeaders: false,
				keyGenerator: (req) => {
					const ip = req.ip || req.socket.remoteAddress || "unknown";
					return `${prefix}:${ip}`;
				},
			});
		} catch (error) {
			console.error("Erro ao criar Redis Store, usando fallback em memória:", error);
		}
	}

	// Fallback para memória (apenas em desenvolvimento)
	if (env.NODE_ENV === "production" && env.REDIS_URL) {
		console.warn("Redis não disponível em produção, mas REDIS_URL está configurado. Usando fallback em memória.");
	}

	return createMemoryRateLimit({ windowMs, max, message });
}

// Criar rate limiters de forma assíncrona e armazenar
let publicRateLimitInstance: Awaited<ReturnType<typeof createRateLimiter>> | null = null;
let authRateLimitInstance: Awaited<ReturnType<typeof createRateLimiter>> | null = null;
let authenticatedRateLimitInstance: Awaited<ReturnType<typeof createRateLimiter>> | null = null;

// Inicializar rate limiters
(async () => {
	try {
		publicRateLimitInstance = await createRateLimiter({
			windowMs: 60 * 1000, // 1 minuto
			max: 100,
			message: "Too many requests from this IP, please try again later.",
			prefix: "rl:public",
		});

		authRateLimitInstance = await createRateLimiter({
			windowMs: 60 * 1000, // 1 minuto
			max: 5,
			message: "Too many login attempts, please try again later.",
			prefix: "rl:auth",
		});

		authenticatedRateLimitInstance = await createRateLimiter({
			windowMs: 60 * 1000, // 1 minuto
			max: 200,
			message: "Too many requests, please try again later.",
			prefix: "rl:authenticated",
		});
	} catch (error) {
		console.error("Erro ao inicializar rate limiters:", error);
	}
})();

/**
 * Rate limit padrão para rotas públicas: 100 requisições por minuto
 */
export const publicRateLimit = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	if (!publicRateLimitInstance) {
		// Se ainda não foi inicializado, usar fallback temporário
		return createMemoryRateLimit({
			windowMs: 60 * 1000,
			max: 100,
			message: "Too many requests from this IP, please try again later.",
		})(request, response, next);
	}

	return publicRateLimitInstance(request, response, next);
};

/**
 * Rate limit para rotas de autenticação: 5 requisições por minuto
 */
export const authRateLimit = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	if (!authRateLimitInstance) {
		// Se ainda não foi inicializado, usar fallback temporário
		return createMemoryRateLimit({
			windowMs: 60 * 1000,
			max: 5,
			message: "Too many login attempts, please try again later.",
		})(request, response, next);
	}

	return authRateLimitInstance(request, response, next);
};

/**
 * Rate limit para rotas autenticadas: 200 requisições por minuto
 */
export const authenticatedRateLimit = (
	request: Request,
	response: Response,
	next: NextFunction,
) => {
	if (!authenticatedRateLimitInstance) {
		// Se ainda não foi inicializado, usar fallback temporário
		return createMemoryRateLimit({
			windowMs: 60 * 1000,
			max: 200,
			message: "Too many requests, please try again later.",
		})(request, response, next);
	}

	return authenticatedRateLimitInstance(request, response, next);
};
