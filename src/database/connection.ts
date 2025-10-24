import sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/sql-js";
import { env } from "~/config/env";
import * as schema from "./schema";

const connection = sqlite(env.DATABASE_URL);

export const db = drizzle(connection, { schema });
