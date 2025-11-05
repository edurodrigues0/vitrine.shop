import { sql } from "drizzle-orm";
import { DrizzleORM } from "./connection";

async function addColorColumn() {
	try {
		console.log("Adicionando coluna 'color' à tabela 'products'...");
		
		await DrizzleORM.execute(
			sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS color varchar(50)`
		);
		
		console.log("✅ Coluna 'color' adicionada com sucesso!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Erro ao adicionar coluna:", error);
		process.exit(1);
	}
}

addColorColumn();

