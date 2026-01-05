import { seedCitiesFromIBGE } from "./seed-cities-ibge";

seedCitiesFromIBGE()
	.then(({ inserted, skipped, total }) => {
		console.log(`🎉 Processo concluído!`);
		console.log(`   - ${inserted} cidades inseridas`);
		console.log(`   - ${skipped} cidades já existiam`);
		console.log(`   - ${total} cidades processadas no total`);
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Erro ao importar cidades:", error);
		process.exit(1);
	});

