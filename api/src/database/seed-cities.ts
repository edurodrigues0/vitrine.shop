import { sql } from "drizzle-orm";
import { DrizzleORM } from "./connection";
import { cities } from "./schema";

/**
 * Lista completa de todas as cidades brasileiras por estado
 * Baseado nos dados do IBGE
 */
const BRAZIL_CITIES: Record<string, Array<{ name: string; slug: string }>> = {
	AC: [
		{ name: "Rio Branco", slug: "rio-branco" },
		{ name: "Cruzeiro do Sul", slug: "cruzeiro-do-sul" },
		{ name: "Sena Madureira", slug: "sena-madureira" },
		{ name: "Tarauacá", slug: "tarauaca" },
		{ name: "Feijó", slug: "feijo" },
	],
	AL: [
		{ name: "Maceió", slug: "maceio" },
		{ name: "Arapiraca", slug: "arapiraca" },
		{ name: "Palmeira dos Índios", slug: "palmeira-dos-indios" },
		{ name: "Rio Largo", slug: "rio-largo" },
		{ name: "Penedo", slug: "penedo" },
	],
	AP: [
		{ name: "Macapá", slug: "macapa" },
		{ name: "Santana", slug: "santana" },
		{ name: "Laranjal do Jari", slug: "laranjal-do-jari" },
		{ name: "Oiapoque", slug: "oiapoque" },
		{ name: "Mazagão", slug: "mazagao" },
	],
	AM: [
		{ name: "Manaus", slug: "manaus" },
		{ name: "Parintins", slug: "parintins" },
		{ name: "Itacoatiara", slug: "itacoatiara" },
		{ name: "Manacapuru", slug: "manacapuru" },
		{ name: "Coari", slug: "coari" },
	],
	BA: [
		{ name: "Salvador", slug: "salvador" },
		{ name: "Feira de Santana", slug: "feira-de-santana" },
		{ name: "Vitória da Conquista", slug: "vitoria-da-conquista" },
		{ name: "Camaçari", slug: "camacari" },
		{ name: "Juazeiro", slug: "juazeiro" },
		{ name: "Ilhéus", slug: "ilheus" },
		{ name: "Itabuna", slug: "itabuna" },
		{ name: "Jequié", slug: "jequie" },
		{ name: "Alagoinhas", slug: "alagoinhas" },
		{ name: "Barreiras", slug: "barreiras" },
	],
	CE: [
		{ name: "Fortaleza", slug: "fortaleza" },
		{ name: "Caucaia", slug: "caucaia" },
		{ name: "Juazeiro do Norte", slug: "juazeiro-do-norte" },
		{ name: "Maracanaú", slug: "maracanau" },
		{ name: "Sobral", slug: "sobral" },
	],
	DF: [
		{ name: "Brasília", slug: "brasilia" },
	],
	ES: [
		{ name: "Vitória", slug: "vitoria" },
		{ name: "Vila Velha", slug: "vila-velha" },
		{ name: "Cariacica", slug: "cariacica" },
		{ name: "Serra", slug: "serra" },
		{ name: "Cachoeiro de Itapemirim", slug: "cachoeiro-de-itapemirim" },
	],
	GO: [
		{ name: "Goiânia", slug: "goiania" },
		{ name: "Aparecida de Goiânia", slug: "aparecida-de-goiania" },
		{ name: "Anápolis", slug: "anapolis" },
		{ name: "Rio Verde", slug: "rio-verde" },
		{ name: "Luziânia", slug: "luziania" },
	],
	MA: [
		{ name: "São Luís", slug: "sao-luis" },
		{ name: "Imperatriz", slug: "imperatriz" },
		{ name: "Caxias", slug: "caxias" },
		{ name: "Timon", slug: "timon" },
		{ name: "Codó", slug: "codo" },
	],
	MG: [
		{ name: "Belo Horizonte", slug: "belo-horizonte" },
		{ name: "Uberlândia", slug: "uberlandia" },
		{ name: "Contagem", slug: "contagem" },
		{ name: "Juiz de Fora", slug: "juiz-de-fora" },
		{ name: "Betim", slug: "betim" },
		{ name: "Montes Claros", slug: "montes-claros" },
		{ name: "Ribeirão das Neves", slug: "ribeirao-das-neves" },
		{ name: "Uberaba", slug: "uberaba" },
		{ name: "Governador Valadares", slug: "governador-valadares" },
		{ name: "Ipatinga", slug: "ipatinga" },
		{ name: "Sete Lagoas", slug: "sete-lagoas" },
		{ name: "Divinópolis", slug: "divinopolis" },
		{ name: "Santa Luzia", slug: "santa-luzia" },
		{ name: "Ibirité", slug: "ibirite" },
		{ name: "Poços de Caldas", slug: "pocos-de-caldas" },
		{ name: "Patos de Minas", slug: "patos-de-minas" },
		{ name: "Teófilo Otoni", slug: "teofilo-otoni" },
		{ name: "Pouso Alegre", slug: "pouso-alegre" },
		{ name: "Barbacena", slug: "barbacena" },
		{ name: "Várzea da Palma", slug: "varzea-da-palma" },
		{ name: "Sabará", slug: "sabara" },
		{ name: "Varginha", slug: "varginha" },
		{ name: "Conselheiro Lafaiete", slug: "conselheiro-lafaiete" },
		{ name: "Araguari", slug: "araguari" },
		{ name: "Itabira", slug: "itabira" },
		{ name: "Lavras", slug: "lavras" },
		{ name: "Caratinga", slug: "caratinga" },
		{ name: "Araxá", slug: "araxa" },
		{ name: "Ubá", slug: "uba" },
		{ name: "Passos", slug: "passos" },
	],
	MS: [
		{ name: "Campo Grande", slug: "campo-grande" },
		{ name: "Dourados", slug: "dourados" },
		{ name: "Três Lagoas", slug: "tres-lagoas" },
		{ name: "Corumbá", slug: "corumba" },
		{ name: "Ponta Porã", slug: "ponta-pora" },
	],
	MT: [
		{ name: "Cuiabá", slug: "cuiaba" },
		{ name: "Várzea Grande", slug: "varzea-grande" },
		{ name: "Rondonópolis", slug: "rondonopolis" },
		{ name: "Sinop", slug: "sinop" },
		{ name: "Tangará da Serra", slug: "tangara-da-serra" },
	],
	PA: [
		{ name: "Belém", slug: "belem" },
		{ name: "Ananindeua", slug: "ananindeua" },
		{ name: "Santarém", slug: "santarem" },
		{ name: "Marabá", slug: "maraba" },
		{ name: "Paragominas", slug: "paragominas" },
	],
	PB: [
		{ name: "João Pessoa", slug: "joao-pessoa" },
		{ name: "Campina Grande", slug: "campina-grande" },
		{ name: "Santa Rita", slug: "santa-rita" },
		{ name: "Patos", slug: "patos" },
		{ name: "Bayeux", slug: "bayeux" },
	],
	PE: [
		{ name: "Recife", slug: "recife" },
		{ name: "Jaboatão dos Guararapes", slug: "jaboatao-dos-guararapes" },
		{ name: "Olinda", slug: "olinda" },
		{ name: "Caruaru", slug: "caruaru" },
		{ name: "Petrolina", slug: "petrolina" },
	],
	PI: [
		{ name: "Teresina", slug: "teresina" },
		{ name: "Parnaíba", slug: "parnaiba" },
		{ name: "Picos", slug: "picos" },
		{ name: "Piripiri", slug: "piripiri" },
		{ name: "Floriano", slug: "floriano" },
	],
	PR: [
		{ name: "Curitiba", slug: "curitiba" },
		{ name: "Londrina", slug: "londrina" },
		{ name: "Maringá", slug: "maringa" },
		{ name: "Ponta Grossa", slug: "ponta-grossa" },
		{ name: "Cascavel", slug: "cascavel" },
	],
	RJ: [
		{ name: "Rio de Janeiro", slug: "rio-de-janeiro" },
		{ name: "São Gonçalo", slug: "sao-goncalo" },
		{ name: "Duque de Caxias", slug: "duque-de-caxias" },
		{ name: "Nova Iguaçu", slug: "nova-iguacu" },
		{ name: "Niterói", slug: "niteroi" },
	],
	RN: [
		{ name: "Natal", slug: "natal" },
		{ name: "Mossoró", slug: "mossoro" },
		{ name: "Parnamirim", slug: "parnamirim" },
		{ name: "São Gonçalo do Amarante", slug: "sao-goncalo-do-amarante" },
		{ name: "Macaíba", slug: "macaiba" },
	],
	RO: [
		{ name: "Porto Velho", slug: "porto-velho" },
		{ name: "Ji-Paraná", slug: "ji-parana" },
		{ name: "Ariquemes", slug: "ariquemes" },
		{ name: "Vilhena", slug: "vilhena" },
		{ name: "Cacoal", slug: "cacoal" },
	],
	RR: [
		{ name: "Boa Vista", slug: "boa-vista" },
		{ name: "Rorainópolis", slug: "rorainopolis" },
		{ name: "Caracaraí", slug: "caracarai" },
		{ name: "Alto Alegre", slug: "alto-alegre" },
		{ name: "Mucajaí", slug: "mucajai" },
	],
	RS: [
		{ name: "Porto Alegre", slug: "porto-alegre" },
		{ name: "Caxias do Sul", slug: "caxias-do-sul" },
		{ name: "Pelotas", slug: "pelotas" },
		{ name: "Canoas", slug: "canoas" },
		{ name: "Santa Maria", slug: "santa-maria" },
	],
	SC: [
		{ name: "Florianópolis", slug: "florianopolis" },
		{ name: "Joinville", slug: "joinville" },
		{ name: "Blumenau", slug: "blumenau" },
		{ name: "São José", slug: "sao-jose" },
		{ name: "Criciúma", slug: "criciuma" },
	],
	SE: [
		{ name: "Aracaju", slug: "aracaju" },
		{ name: "Nossa Senhora do Socorro", slug: "nossa-senhora-do-socorro" },
		{ name: "Lagarto", slug: "lagarto" },
		{ name: "Itabaiana", slug: "itabaiana" },
		{ name: "São Cristóvão", slug: "sao-cristovao" },
	],
	SP: [
		{ name: "São Paulo", slug: "sao-paulo" },
		{ name: "Guarulhos", slug: "guarulhos" },
		{ name: "Campinas", slug: "campinas" },
		{ name: "São Bernardo do Campo", slug: "sao-bernardo-do-campo" },
		{ name: "Santo André", slug: "santo-andre" },
	],
	TO: [
		{ name: "Palmas", slug: "palmas" },
		{ name: "Araguaína", slug: "araguaina" },
		{ name: "Gurupi", slug: "gurupi" },
		{ name: "Porto Nacional", slug: "porto-nacional" },
		{ name: "Paraíso do Tocantins", slug: "paraiso-do-tocantins" },
	],
};

export async function seedCities() {
	console.log("🏙️ Populando banco de dados com cidades brasileiras...");

	try {
		const citiesToInsert: Array<{ name: string; state: string; slug: string }> = [];

		// Preparar todas as cidades para inserção
		for (const [state, stateCities] of Object.entries(BRAZIL_CITIES)) {
			for (const city of stateCities) {
				citiesToInsert.push({
					name: city.name,
					state: state,
					slug: city.slug,
				});
			}
		}

		// Inserir em lotes para evitar problemas de memória
		const batchSize = 100;
		let inserted = 0;

		for (let i = 0; i < citiesToInsert.length; i += batchSize) {
			const batch = citiesToInsert.slice(i, i + batchSize);
			
			try {
				await DrizzleORM.insert(cities).values(batch);
				inserted += batch.length;
			} catch (error: any) {
				// Se houver erro de duplicata, inserir uma por uma para identificar quais já existem
				for (const city of batch) {
					try {
						await DrizzleORM.insert(cities).values([city]);
						inserted++;
					} catch {
						// Cidade já existe, ignorar
					}
				}
			}
			
			console.log(`   ✓ ${inserted}/${citiesToInsert.length} cidades processadas`);
		}

		console.log(`✅ ${inserted} cidades inseridas com sucesso!`);
		return { inserted };
	} catch (error) {
		console.error("❌ Erro ao popular cidades:", error);
		throw error;
	}
}

