import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connection = postgres(process.env.DATABASE_URL as string);

export const DrizzleORM = drizzle(connection, { schema });
