import { seed } from "./seed";

seed()
	.then(() => {
		console.log("🎉 Processo finalizado!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Erro fatal:", error);
		process.exit(1);
	});

