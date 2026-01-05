import { DrizzleORM } from "./connection";
import { cities } from "./schema";
import { generateSlug } from "~/utils/slug";

/**
 * Busca todas as cidades do Brasil da API do IBGE
 */
async function fetchAllCitiesFromIBGE(): Promise<
	Array<{ name: string; state: string; slug: string }>
> {
	console.log("📡 Buscando cidades da API do IBGE...");

	try {
		// Primeiro, buscar todas as UFs para depois buscar os municípios por UF
		const ufResponse = await fetch(
			"https://servicodados.ibge.gov.br/api/v1/localidades/estados",
		);

		if (!ufResponse.ok) {
			throw new Error(`Erro ao buscar estados: ${ufResponse.statusText}`);
		}

		const ufs: Array<{ id: number; sigla: string; nome: string }> =
			await ufResponse.json();

		console.log(`   ✓ ${ufs.length} estados encontrados`);

		const allCities: Array<{ name: string; state: string; slug: string }> = [];

		// Buscar municípios de cada UF
		for (const uf of ufs) {
			try {
				const citiesResponse = await fetch(
					`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf.id}/municipios`,
				);

				if (!citiesResponse.ok) {
					console.warn(
						`   ⚠️ Erro ao buscar municípios de ${uf.nome} (${uf.sigla})`,
					);
					continue;
				}

				const citiesData: Array<{ id: number; nome: string }> =
					await citiesResponse.json();

				for (const city of citiesData) {
					const slug = generateSlug(`${city.nome}-${uf.sigla}`);
					allCities.push({
						name: city.nome,
						state: uf.sigla,
						slug: slug,
					});
				}

				console.log(
					`   ✓ ${citiesData.length} municípios de ${uf.nome} (${uf.sigla}) encontrados`,
				);
			} catch (error: any) {
				console.warn(
					`   ⚠️ Erro ao processar municípios de ${uf.nome} (${uf.sigla}): ${error.message}`,
				);
			}
		}

		console.log(`   ✓ Total de ${allCities.length} cidades encontradas`);
		return allCities;
	} catch (error) {
		console.error("❌ Erro ao buscar cidades da API do IBGE:", error);
		throw error;
	}
}

/**
 * Popula o banco de dados com todas as cidades brasileiras da API do IBGE
 */
export async function seedCitiesFromIBGE() {
	console.log("🏙️ Populando banco de dados com todas as cidades brasileiras...");

	try {
		// Buscar todas as cidades da API do IBGE
		const citiesToInsert = await fetchAllCitiesFromIBGE();

		// Inserir em lotes para evitar problemas de memória e timeout
		const batchSize = 100;
		let inserted = 0;
		let skipped = 0;

		console.log(`📦 Inserindo ${citiesToInsert.length} cidades em lotes de ${batchSize}...`);

		for (let i = 0; i < citiesToInsert.length; i += batchSize) {
			const batch = citiesToInsert.slice(i, i + batchSize);

			// Inserir uma por uma para evitar problemas com duplicatas
			for (const city of batch) {
				try {
					await DrizzleORM.insert(cities).values(city);
					inserted++;
				} catch (error: any) {
					// Se houver erro de duplicata (slug único), pular
					if (error?.code === "23505" || error?.message?.includes("unique")) {
						skipped++;
					} else {
						console.error(`   ⚠️ Erro ao inserir ${city.name} (${city.state}):`, error.message);
					}
				}
			}

			// Mostrar progresso a cada 500 cidades
			if ((i + batchSize) % 500 === 0 || i + batchSize >= citiesToInsert.length) {
				console.log(
					`   ✓ ${Math.min(i + batchSize, citiesToInsert.length)}/${citiesToInsert.length} processadas (${inserted} inseridas, ${skipped} já existiam)`,
				);
			}
		}

		console.log(
			`✅ Processo concluído! ${inserted} cidades inseridas, ${skipped} já existiam no banco.`,
		);
		return { inserted, skipped, total: citiesToInsert.length };
	} catch (error) {
		console.error("❌ Erro ao popular cidades:", error);
		throw error;
	}
}

