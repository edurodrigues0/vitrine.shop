import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.coerce.number().default(3333),
	DATABASE_URL: z.string().min(1),
	JWT_SECRET: z.string().min(1),
	JWT_EXPIRES_IN: z.string().default("1h"),
	COOKIE_SECRET: z.string().min(1),
	STRIPE_SECRET_KEY: z.string().min(1),
	STRIPE_PUBLISHABLE_KEY: z.string().min(1),
	STRIPE_WEBHOOK_SECRET: z.string().optional(),
	STRIPE_PRICE_ID_BASIC: z.string().optional(),
	STRIPE_PRICE_ID_PREMIUM: z.string().optional(),
	STRIPE_PRICE_ID_ENTERPRISE: z.string().optional(),
	REDIS_HOST: z.string().default("localhost"),
	REDIS_PORT: z.coerce.number().default(6379),
	REDIS_PASSWORD: z.string().default("123456"),
	REDIS_TTL: z.coerce.number().default(604800),
});

export const env = envSchema.parse(process.env);
