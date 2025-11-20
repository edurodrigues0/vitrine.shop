import { clearDatabase } from "./seed";

clearDatabase()
	.then(() => {
		console.log("🎉 Banco de dados limpo com sucesso!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Erro ao limpar banco de dados:", error);
		process.exit(1);
	});

