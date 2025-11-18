import { defineConfig } from "drizzle-kit";

// bug in drizzle: see https://github.com/drizzle-team/drizzle-orm/issues/1228
// import { env } from "./src/env"

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/database/schema/index.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
});
