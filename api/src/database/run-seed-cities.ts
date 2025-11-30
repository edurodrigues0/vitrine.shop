import { seedCities } from "./seed-cities";

seedCities()
	.then(({ inserted }) => {
		console.log(`🎉 ${inserted} cidades importadas com sucesso!`);
		process.exit(0);
	})
	.catch((error) => {
		console.error("💥 Erro ao importar cidades:", error);
		process.exit(1);
	});

