import sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/sql-js";

import * as schema from "./schema";
import { env } from "~/config/env";

const connection = sqlite(env.DATABASE_URL);

export const db = drizzle(connection, { schema });
