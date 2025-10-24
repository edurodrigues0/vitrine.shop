/**
 * Configuração e validação de variáveis de ambiente
 */

import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.number().default(3333),
	DATABASE_URL: z.string().min(1),
});

export const env = envSchema.parse(Bun.env);
