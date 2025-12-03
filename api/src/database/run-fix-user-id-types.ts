import postgres from "postgres";

const connection = postgres(process.env.DATABASE_URL as string);

async function fixUserIdTypes() {
	console.log("🔧 Iniciando correção de tipos de colunas relacionadas a users.id...");

	try {
		// 1. Remover foreign keys existentes
		console.log("📝 Removendo foreign keys existentes...");
		await connection`
			ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_user_id_users_id_fk";
		`;
		await connection`
			ALTER TABLE "subscriptions" DROP CONSTRAINT IF EXISTS "subscriptions_user_id_users_id_fk";
		`;
		await connection`
			ALTER TABLE "stores" DROP CONSTRAINT IF EXISTS "stores_owner_id_users_id_fk";
		`;
		await connection`
			ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_user_id_users_id_fk";
		`;
		await connection`
			ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_user_id_users_id_fk";
		`;

		// 2. Verificar e alterar users.id se necessário
		console.log("📝 Verificando users.id...");
		const usersIdType = await connection`
			SELECT data_type 
			FROM information_schema.columns 
			WHERE table_name = 'users' AND column_name = 'id'
		`;

		if (usersIdType[0]?.data_type === 'uuid') {
			const userCount = await connection`SELECT COUNT(*) as count FROM "users"`;
			if (userCount[0]?.count === 0) {
				console.log("📝 Alterando users.id de uuid para text...");
				await connection`ALTER TABLE "users" ALTER COLUMN "id" TYPE text`;
			} else {
				throw new Error('Tabela users contém dados. É necessário converter os UUIDs para strings primeiro ou limpar o banco.');
			}
		}

		// 3. Alterar tipos das colunas relacionadas
		console.log("📝 Alterando tipos das colunas relacionadas...");
		
		// Notifications
		const notificationsType = await connection`
			SELECT data_type 
			FROM information_schema.columns 
			WHERE table_name = 'notifications' AND column_name = 'user_id'
		`;
		if (notificationsType[0]?.data_type === 'uuid') {
			console.log("📝 Alterando notifications.user_id...");
			await connection`ALTER TABLE "notifications" ALTER COLUMN "user_id" TYPE text USING "user_id"::text`;
		}

		// Subscriptions
		const subscriptionsType = await connection`
			SELECT data_type 
			FROM information_schema.columns 
			WHERE table_name = 'subscriptions' AND column_name = 'user_id'
		`;
		if (subscriptionsType[0]?.data_type === 'uuid') {
			console.log("📝 Alterando subscriptions.user_id...");
			await connection`ALTER TABLE "subscriptions" ALTER COLUMN "user_id" TYPE text USING "user_id"::text`;
		}

		// Stores
		const storesType = await connection`
			SELECT data_type 
			FROM information_schema.columns 
			WHERE table_name = 'stores' AND column_name = 'owner_id'
		`;
		if (storesType[0]?.data_type === 'uuid') {
			console.log("📝 Alterando stores.owner_id...");
			await connection`ALTER TABLE "stores" ALTER COLUMN "owner_id" TYPE text USING "owner_id"::text`;
		}

		// Account
		const accountType = await connection`
			SELECT data_type 
			FROM information_schema.columns 
			WHERE table_name = 'account' AND column_name = 'user_id'
		`;
		if (accountType[0]?.data_type === 'uuid') {
			console.log("📝 Alterando account.user_id...");
			await connection`ALTER TABLE "account" ALTER COLUMN "user_id" TYPE text USING "user_id"::text`;
		}

		// Sessions
		const sessionsType = await connection`
			SELECT data_type 
			FROM information_schema.columns 
			WHERE table_name = 'sessions' AND column_name = 'user_id'
		`;
		if (sessionsType[0]?.data_type === 'uuid') {
			console.log("📝 Alterando sessions.user_id...");
			await connection`ALTER TABLE "sessions" ALTER COLUMN "user_id" TYPE text USING "user_id"::text`;
		}

		// 4. Adicionar colunas faltantes
		console.log("📝 Adicionando colunas faltantes...");
		await connection`
			ALTER TABLE "users" 
			ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL
		`;
		await connection`
			ALTER TABLE "users"
			ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL
		`;

		// 5. Recriar foreign keys
		console.log("📝 Recriando foreign keys...");
		await connection`
			ALTER TABLE "notifications" 
			ADD CONSTRAINT "notifications_user_id_users_id_fk" 
			FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
		`;
		await connection`
			ALTER TABLE "subscriptions"
			ADD CONSTRAINT "subscriptions_user_id_users_id_fk"
			FOREIGN KEY ("user_id") REFERENCES "users"("id")
		`;
		await connection`
			ALTER TABLE "stores"
			ADD CONSTRAINT "stores_owner_id_users_id_fk"
			FOREIGN KEY ("owner_id") REFERENCES "users"("id")
		`;
		await connection`
			ALTER TABLE "account" 
			ADD CONSTRAINT "account_user_id_users_id_fk" 
			FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
		`;
		await connection`
			ALTER TABLE "sessions" 
			ADD CONSTRAINT "sessions_user_id_users_id_fk" 
			FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade
		`;

		console.log("✅ Tipos de colunas corrigidos com sucesso!");
		console.log("📝 Agora você pode executar: npm run db:push");
	} catch (error) {
		console.error("❌ Erro ao corrigir tipos:", error);
		throw error;
	} finally {
		await connection.end();
	}
}

fixUserIdTypes()
	.then(() => {
		console.log("🎉 Processo de correção finalizado!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Erro fatal na correção:", error);
		process.exit(1);
	});

