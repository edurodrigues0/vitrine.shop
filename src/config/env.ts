import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	PORT: z.number().default(3333),
	DATABASE_URL: z.string().min(1),
});

export const env = envSchema.parse(process.env);
