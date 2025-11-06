import { sql } from "drizzle-orm";
import { DrizzleORM } from "./connection";

async function createNotificationsTable() {
	try {
		console.log("Criando tabela 'notifications' e enum 'notification_type'...");
		
		// Verificar se o enum já existe
		const [enumExists] = await DrizzleORM.execute(
			sql`SELECT 1 FROM pg_type WHERE typname = 'notification_type'`
		);
		
		// Criar enum se não existir
		if (!enumExists || (Array.isArray(enumExists) && enumExists.length === 0)) {
			await DrizzleORM.execute(
				sql`CREATE TYPE notification_type AS ENUM ('NEW_ORDER', 'ORDER_STATUS_CHANGED', 'LOW_STOCK', 'PRODUCT_ADDED', 'STORE_UPDATED', 'SYSTEM')`
			);
			console.log("✅ Enum 'notification_type' criado!");
		} else {
			console.log("✅ Enum 'notification_type' já existe!");
		}
		
		// Criar tabela se não existir
		await DrizzleORM.execute(
			sql`
				CREATE TABLE IF NOT EXISTS notifications (
					id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
					user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
					type notification_type NOT NULL,
					title VARCHAR(200) NOT NULL,
					message TEXT NOT NULL,
					read BOOLEAN NOT NULL DEFAULT false,
					related_id UUID,
					related_type VARCHAR(50),
					created_at TIMESTAMP NOT NULL DEFAULT NOW(),
					read_at TIMESTAMP
				)
			`
		);
		
		// Criar índices para melhor performance
		await DrizzleORM.execute(
			sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`
		);
		
		await DrizzleORM.execute(
			sql`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`
		);
		
		await DrizzleORM.execute(
			sql`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)`
		);
		
		console.log("✅ Tabela 'notifications' criada com sucesso!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Erro ao criar tabela:", error);
		process.exit(1);
	}
}

createNotificationsTable();

